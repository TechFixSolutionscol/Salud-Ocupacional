

// ============================================
// AUTOEVALUACIÓN MODULE (Phase 3)
// ============================================

/**
 * Load and display autoevaluación score
 */
async function loadAutoevaluacion() {
    if (!state.currentEmpresa) {
        console.log('No company selected for autoevaluación');
        return;
    }

    try {
        const result = await callBackend('calculateComplianceScore', {
            empresaId: state.currentEmpresa
        });

        if (result.success) {
            renderAutoevaluacion(result.data);
        } else {
            console.error('Error loading autoevaluación:', result.error);
            // Show empty state
            document.getElementById('gaugeScore').textContent = '0%';
            document.getElementById('gauge Label').textContent = 'SIN DATOS';
        }
    } catch (error) {
        console.error('Connection error:', error);
    }
}

/**
 * Render autoevaluación data in the dashboard
 */
function renderAutoevaluacion(data) {
    // 1. Update gauge
    updateGauge(data.score, data.classification, data.classificationColor);

    // 2. Update details
    document.getElementById('standardsCompleted').textContent =
        `${data.totalCompleted} / ${data.totalApplicable}`;

    document.getElementById('actionRequired').textContent = data.actionRequired;

    // 3. Update timestamp
    const timestamp = new Date(data.timestamp).toLocaleString('es-CO');
    document.getElementById('autoevalTimestamp').textContent = `Actualizado: ${timestamp}`;

    // 4. Render PHVA breakdown
    renderPHVABreakdown(data.breakdown);
}

/**
 * Update the SVG gauge visualization
 */
function updateGauge(score, classification, color) {
    const gaugeArc = document.getElementById('gaugeArc');
    const gaugeScore = document.getElementById('gaugeScore');
    const gaugeLabel = document.getElementById('gaugeLabel');

    // Update text
    gaugeScore.textContent = `${Math.round(score)}%`;
    gaugeLabel.textContent = classification;

    // Calculate stroke-dashoffset (arc length is approximately 282.7)
    // 0% = 282.7 offset (hidden), 100% = 0 offset (full arc)
    const maxOffset = 282.7;
    const offset = maxOffset - (score / 100) * maxOffset;

    // Update arc
    gaugeArc.setAttribute('stroke-dashoffset', offset);

    // Update color based on classification
    const colorMap = {
        'red': '#f44336',
        'yellow': '#ff9800',
        'green': '#4caf50'
    };
    gaugeArc.setAttribute('stroke', colorMap[color] || '#4caf50');

    // Update label color
    gaugeLabel.style.fill = colorMap[color] || '#666';
}

/**
 * Render PHVA breakdown bars
 */
function renderPHVABreakdown(breakdown) {
    const container = document.getElementById('phvaBreakdown');
    if (!container) return;

    container.innerHTML = breakdown.map(item => `
        <div class="phva-bar-item">
            <div class="phva-bar-header">
                <span class="phva-cycle-name">${item.cycle}</span>
                <span class="phva-percentage">${Math.round(item.percentage)}%</span>
            </div>
            <div class="phva-progress-bar">
                <div class="phva-progress-fill" style="width: ${item.percentage}%"></div>
            </div>
            <div class="phva-stats-text">
                <small>${item.completedStandards} / ${item.totalStandards} estándares completados</small>
            </div>
        </div>
    `).join('');
}

/**
 * Save autoevaluación snapshot (for historical tracking)
 */
async function saveAutoevaluacionSnapshot(notes = '') {
    if (!state.currentEmpresa) {
        showToast('Selecciona una empresa', 'warning');
        return;
    }

    try {
        const result = await callBackend('saveAutoevaluacionSnapshot', {
            empresaId: state.currentEmpresa,
            notes: notes
        });

        if (result.success) {
            showToast('Snapshot guardado correctamente', 'success');
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize autoevaluación module
 */
(function initAutoevaluacion() {
    // Wait for DOM and state to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAutoevaluacion);
    } else {
        setupAutoevaluacion();
    }
})();

function setupAutoevaluacion() {
    // Load autoevaluación when company changes
    const empresaSelector = document.getElementById('empresaSelector');
    if (empresaSelector) {
        empresaSelector.addEventListener('change', function () {
            // Wait for state to update
            setTimeout(function () {
                if (state.currentEmpresa) {
                    loadAutoevaluacion();
                }
            }, 100);
        });
    }

    // Auto-reload every time a standard is updated (if cumplimiento section is active)
    // Hook: if window.updateEstandar exists, wrap it to reload autoevaluación
    if (typeof window.updateEstandar !== 'undefined') {
        const originalUpdateEstandar = window.updateEstandar;
        window.updateEstandar = async function (...args) {
            const result = await originalUpdateEstandar.apply(this, args);
            // Reload autoevaluación after update
            if (result && result.success) {
                setTimeout(() => loadAutoevaluacion(), 500);
            }
            return result;
        };
    }
}

