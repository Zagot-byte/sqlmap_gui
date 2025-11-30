#!/usr/bin/env python3
"""
Minimal Flask server for SQLMap GUI integration.
"""
import json
import os
import subprocess
import threading
import time
import uuid
import signal
from queue import Queue, Empty

from flask import Flask, request, jsonify, Response, render_template

app = Flask(__name__, static_folder="static", template_folder="templates")

# In-memory scan store: scan_id -> { queue, thread, process, running, created, terminate_requested }
scans = {}
scans_lock = threading.Lock()

# Simple sessions store
sessions = {}

def _now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())

def _format_msg(type_, data):
    return json.dumps({"type": type_, "data": data, "timestamp": _now_iso()})

def run_sqlmap_process(scan_id: str, cmd: list, q: Queue):
    """Spawn sqlmap subprocess, stream stdout/stderr into the provided queue."""
    threads = []
    try:
        # Start process in its own process group so we can kill children if needed
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            preexec_fn=os.setsid  # POSIX: create new process group
        )
        with scans_lock:
            if scan_id in scans:
                scans[scan_id]["process"] = proc
                scans[scan_id]["running"] = True
                scans[scan_id]["terminate_requested"] = False

        def _reader(pipe, mtype):
            try:
                for line in iter(pipe.readline, ""):
                    if not line:
                        break
                    q.put(_format_msg(mtype, line.rstrip()))
            except Exception as e:
                q.put(_format_msg("error", f"reader error: {e}"))
            finally:
                try:
                    pipe.close()
                except Exception:
                    pass

        t_out = threading.Thread(target=_reader, args=(proc.stdout, "stdout"), daemon=True)
        t_err = threading.Thread(target=_reader, args=(proc.stderr, "stderr"), daemon=True)
        t_out.start(); t_err.start()
        threads.extend([t_out, t_err])

        # Wait for process to finish
        proc.wait()
        q.put(_format_msg("complete", f"sqlmap exited with code {proc.returncode}"))
    except Exception as e:
        q.put(_format_msg("error", str(e)))
    finally:
        # join readers briefly
        for t in threads:
            try:
                t.join(timeout=0.1)
            except Exception:
                pass
        with scans_lock:
            s = scans.get(scan_id)
            if s:
                s["running"] = False
        # leave queue messages for frontend

@app.route("/session/save", methods=["POST"])
def session_save():
    data = request.get_json(force=True, silent=True) or {}
    name = data.get("name")
    config = data.get("config")
    if not name or not config:
        return jsonify({"error": "name and config are required"}), 400

    session_id = str(uuid.uuid4())
    session_obj = {
        "id": session_id,
        "name": name,
        "timestamp": data.get("timestamp") or _now_iso(),
        "config": config,
    }
    sessions[session_id] = session_obj
    return jsonify({"status": "ok", "id": session_id}), 201

@app.route("/session/list", methods=["GET"])
def session_list():
    return jsonify({"sessions": list(sessions.values())})

@app.route("/session/<session_id>", methods=["GET"])
def session_get(session_id):
    s = sessions.get(session_id)
    if not s:
        return jsonify({"error": "session not found"}), 404
    return jsonify(s)

@app.route("/session/<session_id>", methods=["DELETE"])
def session_delete(session_id):
    if session_id in sessions:
        del sessions[session_id]
        return jsonify({"status": "deleted"})
    return jsonify({"error": "session not found"}), 404

@app.route("/scan", methods=["POST"])
def start_scan():
    payload = request.get_json(force=True, silent=True) or {}
    target = payload.get("url") or payload.get("target")
    if not target:
        return jsonify({"error": "Target URL is required (json field: url)"}), 400

    scan_id = str(uuid.uuid4())
    q = Queue()
    with scans_lock:
        scans[scan_id] = {"queue": q, "thread": None, "process": None, "running": True, "created": time.time(), "terminate_requested": False}

    base_dir = os.path.dirname(__file__)
    sqlmap_py = os.path.join(base_dir, "sqlmap", "sqlmap.py")
    cmd = ["python3", sqlmap_py, "-u", target, "--batch"]

    # Basic option mapping (safe subset)
    if payload.get("data"):
        cmd += ["--data", payload.get("data")]
    if payload.get("threads"):
        try:
            cmd += ["--threads", str(int(payload.get("threads")))]
        except Exception:
            pass
    if payload.get("verbose") is not None:
        try:
            cmd += ["-v", str(int(payload.get("verbose")))]
        except Exception:
            pass
    if payload.get("user_agent"):
        cmd += ["--user-agent", payload.get("user_agent")]
    if payload.get("random_agent"):
        cmd += ["--random-agent"]
    if payload.get("tor"):
        cmd += ["--tor"]
    if payload.get("tamper"):
        cmd += ["--tamper", payload.get("tamper")]
    if payload.get("technique"):
        cmd += ["--technique", payload.get("technique")]
    if payload.get("dbs"):
        cmd += ["--dbs"]
    if payload.get("tables"):
        cmd += ["--tables"]
    if payload.get("db"):
        cmd += ["-D", payload.get("db")]
    if payload.get("tbl"):
        cmd += ["-T", payload.get("tbl")]
    if payload.get("col"):
        cmd += ["-C", payload.get("col")]

    # Start background thread to run sqlmap and stream output into queue
    t = threading.Thread(target=run_sqlmap_process, args=(scan_id, cmd, q), daemon=True)
    with scans_lock:
        scans[scan_id]["thread"] = t
    t.start()

    return jsonify({"scan_id": scan_id}), 201

@app.route("/scan/<scan_id>/stop", methods=["POST"])
def stop_scan(scan_id):
    # safely get scan
    with scans_lock:
        s = scans.get(scan_id)

    if not s:
        return jsonify({"error": "scan not found"}), 404

    q: Queue = s["queue"]
    proc = s.get("process")

    # process not spawned yet → avoid crash
    if proc is None:
        q.put(_format_msg("info", "Process not started yet. Stopping scan entry."))
        with scans_lock:
            s["running"] = False
        return jsonify({"status": "pending_stop"})

    # already finished
    if proc.poll() is not None:
        q.put(_format_msg("info", f"Process already exited (code {proc.returncode})"))
        with scans_lock:
            s["running"] = False
        return jsonify({"status": "already_exited"})

    # Mark we want to stop
    with scans_lock:
        s["terminate_requested"] = True

    q.put(_format_msg("info", "Stopping SQLMap..."))

    try:
        # Docker-safe termination  
        proc.terminate()
        try:
            proc.wait(timeout=4)
            q.put(_format_msg("info", f"SQLMap terminated (code {proc.returncode})"))
        except subprocess.TimeoutExpired:
            q.put(_format_msg("warning", "Terminate timed out → killing process..."))
            proc.kill()
            proc.wait()
            q.put(_format_msg("info", f"SQLMap force-killed (code {proc.returncode})"))

        with scans_lock:
            s["running"] = False

        return jsonify({"status": "terminated"})

    except Exception as e:
        q.put(_format_msg("error", f"Termination failed: {e}"))
        return jsonify({"error": str(e)}), 500


@app.route("/api/tampers", methods=["GET"])
def list_tampers():
    tamper_dir = os.path.join(os.path.dirname(__file__), "sqlmap", "tamper")
    tampers = []
    if os.path.isdir(tamper_dir):
        for fname in os.listdir(tamper_dir):
            if fname.endswith(".py") and not fname.startswith("__"):
                tampers.append(fname[:-3])
    tampers.sort()
    return jsonify({"tampers": tampers})

@app.route("/api/dbms", methods=["GET"])
def list_dbms():
    dbms_dir = os.path.join(os.path.dirname(__file__), "sqlmap", "plugins", "dbms")
    dbms = []
    if os.path.isdir(dbms_dir):
        for name in os.listdir(dbms_dir):
            path = os.path.join(dbms_dir, name)
            if os.path.isdir(path):
                dbms.append(name)
            elif name.endswith(".py") and not name.startswith("__"):
                dbms.append(name[:-3])
    dbms.sort()
    return jsonify({"dbms": dbms})

@app.route("/ws/scan/<scan_id>")
def sse_scan(scan_id):
    s = scans.get(scan_id)
    if not s:
        return jsonify({"error": "scan not found"}), 404
    q: Queue = s["queue"]

    def event_stream():
        # Keep streaming while scan is running or items remain in the queue
        while s.get("running") or not q.empty():
            try:
                msg = q.get(timeout=0.5)
                yield f"data: {msg}\n\n"
            except Empty:
                continue

    return Response(event_stream(), mimetype="text/event-stream")

@app.route("/_dbg/scans")
def dbg_scans():
    with scans_lock:
        return jsonify({k: {"running": v.get("running"), "terminate_requested": v.get("terminate_requested"), "has_proc": bool(v.get("process"))} for k, v in scans.items()})

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
