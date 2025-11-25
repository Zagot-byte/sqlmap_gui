/* ============================================
   Utils - Helper functions
   ============================================ */

// Format timestamp for console
function formatTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Format elapsed time (in seconds) to HH:MM:SS
function formatElapsedTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Create element with class and content
function createElement(tag, className, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content) el.textContent = content;
    return el;
}

// Get all form values from a panel
function getFormValues(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return {};

    const values = {};
    const inputs = panel.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            values[input.id] = input.checked;
        } else if (input.type === 'number') {
            values[input.id] = input.value ? parseInt(input.value) : null;
        } else {
            values[input.id] = input.value;
        }
    });

    return values;
}

// Set form values in a panel
function setFormValues(panelId, values) {
    const panel = document.getElementById(panelId);
    if (!panel || !values) return;

    Object.keys(values).forEach(key => {
        const input = panel.querySelector(`#${key}`);
        if (!input) return;

        if (input.type === 'checkbox') {
            input.checked = values[key];
        } else {
            input.value = values[key] || '';
        }
    });
}

// Show notification toast
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background-color: ${type === 'success' ? 'var(--accent-green)' : type === 'error' ? 'var(--accent-red)' : 'var(--accent-blue)'};
    color: white;
    padding: 12px 24px;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
  `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatTimestamp,
        formatElapsedTime,
        escapeHtml,
        createElement,
        getFormValues,
        setFormValues,
        showNotification,
        debounce
    };
}
