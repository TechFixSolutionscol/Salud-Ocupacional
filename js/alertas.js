/**
 * SG-SST Management System - Alerts Module (Frontend)
 * Handles fetching and displaying system alerts
 */

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Fetch and refresh system alerts
 * Can be called manually or automatically
 */
async function refreshAlerts() {
    if (!state.currentEmpresa) {
        // Clear if no company selected
        renderAlerts([]);
        return;
    }

    // Only show loading if we are in the alerts section, otherwise background update
    const isAlertsSection = !document.getElementById('alertasSection').classList.contains('hidden');
    if (isAlertsSection) showLoading();

    try {
        const result = await callBackend('getSystemAlerts', {
            empresaId: state.currentEmpresa
        });

        if (result.success) {
            renderAlerts(result.data);
            updateAlertBadge(result.count);
        } else {
            console.error('Error fetching alerts:', result.error);
            if (isAlertsSection) showToast('Error al actualizar alertas', 'error');
        }
    } catch (error) {
        console.error('Connection error fetching alerts:', error);
    }

    if (isAlertsSection) hideLoading();
}

/**
 * Render alerts list in the UI
 * @param {Array} alerts
 */
function renderAlerts(alerts) {
    const container = document.getElementById('alertsList');
    if (!container) return;

    if (!alerts || alerts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎉</div>
                <h3>Todo al día</h3>
                <p>No hay alertas pendientes para esta empresa.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = alerts.map(alert => createAlertCard(alert)).join('');
}

/**
 * Update the navigation badge count
 * @param {number} count
 */
function updateAlertBadge(count) {
    const badge = document.getElementById('alertasBadge');
    if (badge) {
        badge.textContent = count;
        badge.className = count > 0 ? 'nav-badge active' : 'nav-badge';

        // Pulse animation if critical count increases (logic could be added here)
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create HTML for a single alert card
 */
function createAlertCard(alert) {
    const nivelClass = getAlertLevelClass(alert.nivel);
    const icon = getAlertIcon(alert.tipo);
    const dateStr = new Date(alert.fecha).toLocaleDateString('es-CO');

    return `
        <div class="alert-card ${nivelClass}">
            <div class="alert-icon-wrapper">
                <span class="alert-icon">${icon}</span>
            </div>
            <div class="alert-content">
                <div class="alert-header">
                    <span class="alert-tag ${nivelClass}">${alert.nivel}</span>
                    <span class="alert-date">Fecha: ${dateStr}</span>
                </div>
                <h4 class="alert-message">${alert.mensaje}</h4>
                <div class="alert-footer">
                    <span class="alert-type">${formatAlertType(alert.tipo)}</span>
                    <button class="btn-action" onclick="navigateToSection('${alert.enlace}')">
                        ${alert.accion} →
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getAlertLevelClass(level) {
    switch (level) {
        case 'CRÍTICO': return 'alert-critical';
        case 'ALERTA': return 'alert-warning';
        case 'INFO': return 'alert-info';
        default: return 'alert-info';
    }
}

function getAlertIcon(type) {
    switch (type) {
        case 'DOCUMENTO': return '📄';
        case 'PLAN_ACCION': return '📋';
        case 'INDICADOR': return '📊';
        case 'ACCIDENTE': return '⚠️';
        default: return '🔔';
    }
}

function formatAlertType(type) {
    return type.replace('_', ' ');
}

/**
 * Navigate to specific section from alert
 */
function navigateToSection(sectionId) {
    if (typeof showSection === 'function') {
        showSection(sectionId);
    } else {
        console.warn('Navigation function showSection not found');
    }
}

// ============================================
// INITIALIZATION
// ============================================

(function initAlerts() {
    // Expose specific functions globally if needed
    window.refreshAlerts = refreshAlerts;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAlertsModule);
    } else {
        setupAlertsModule();
    }
})();

function setupAlertsModule() {
    // Listen for company changes to refresh alerts
    // Assuming 'state.currentEmpresa' change might trigger a custom event or we hook into existing flows
    // For now, we rely on the main app calling refreshAlerts or user interaction

    // Auto-refresh when opening alerts section
    const section = document.getElementById('alertasSection');
    if (section) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && !section.classList.contains('hidden')) {
                    refreshAlerts();
                }
            });
        });
        observer.observe(section, { attributes: true });
    }
}
