// Update range slider background to show filled portion
function updateRangeSliderFill(slider) {
    const value = slider.value;
    const min = slider.min || 0;
    const max = slider.max || 100;
    const percentage = ((value - min) / (max - min)) * 100;

    slider.style.background = `linear-gradient(to right, 
        var(--accent-primary) 0%, 
        var(--accent-primary) ${percentage}%, 
        var(--bg-tertiary) ${percentage}%, 
        var(--bg-tertiary) 100%)`;
}

// Initialize all range sliders
document.addEventListener('DOMContentLoaded', () => {
    setupRangeSliders();
});

function setupRangeSliders() {
    // Level slider
    const levelSlider = document.getElementById('level');
    const levelValue = document.getElementById('level-value');
    if (levelSlider && levelValue) {
        updateRangeSliderFill(levelSlider);
        levelSlider.addEventListener('input', (e) => {
            levelValue.textContent = e.target.value;
            updateRangeSliderFill(e.target);
        });
    }

    // Risk slider
    const riskSlider = document.getElementById('risk');
    const riskValue = document.getElementById('risk-value');
    if (riskSlider && riskValue) {
        updateRangeSliderFill(riskSlider);
        riskSlider.addEventListener('input', (e) => {
            riskValue.textContent = e.target.value;
            updateRangeSliderFill(e.target);
        });
    }

    // Threads slider (if exists)
    const threadsSlider = document.getElementById('threads');
    const threadsValue = document.getElementById('threads-value');
    if (threadsSlider && threadsValue) {
        updateRangeSliderFill(threadsSlider);
        threadsSlider.addEventListener('input', (e) => {
            threadsValue.textContent = e.target.value;
            updateRangeSliderFill(e.target);
        });
    }

    // Verbose slider (if exists)
    const verboseSlider = document.getElementById('verbose');
    const verboseValue = document.getElementById('verbose-value');
    if (verboseSlider && verboseValue) {
        updateRangeSliderFill(verboseSlider);
        verboseSlider.addEventListener('input', (e) => {
            verboseValue.textContent = e.target.value;
            updateRangeSliderFill(e.target);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { setupRangeSliders, updateRangeSliderFill };
}
