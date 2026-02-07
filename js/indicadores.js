/**
 * SG-SST Management System - Indicadores Module (Frontend)
 * Automatic display of 6 mandatory legal indicators
 */

// ============================================
// MAIN LOAD FUNCTION
// ============================================

/**
 * Load and display indicadores for selected period
 */
async function loadIndicadores() {
    if (!state.currentEmpresa) {
        showToast('Seleccione una empresa', 'warning');
        return;
    }

    const year = document.getElementById('indicadoresYear').value;
    const month = document.getElementById('indicadoresMonth').value;

    if (!year || !month) {
        showToast('Seleccione un período', 'warning');
        return;
    }

    showLoading();

    try {
        const result = await callBackend('calculateIndicadoresAuto', {
            empresaId: state.currentEmpresa,
            year: parseInt(year),
            month: parseInt(month)
        });

        if (result.success) {
            renderIndicadores(result.data);
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
        console.error(error);
    }

    hideLoading();
}

// ============================================
// RENDER FUNCTIONS
// ============================================

/**
 * Render all indicadores in the UI
 */
function renderIndicadores(data) {
    // 1. Update metadata
    renderMetadata(data.metadata);

    // 2. Render mensuales
    renderIndicadoresGroup(data.mensuales, 'indicadoresMensuales');

    // 3. Render anuales (if available)
    if (data.anuales && data.anuales.length > 0) {
        renderIndicadoresGroup(data.anuales, 'indicadoresAnuales');
        document.querySelector('.indicadores-group:nth-child(3)').style.display = 'block';
    } else {
        document.querySelector('.indicadores-group:nth-child(3)').style.display = 'none';
    }
}

/**
 * Render metadata section
 */
function renderMetadata(metadata) {
    document.getElementById('metaTrabajadores').textContent = metadata.totalTrabajadores;
    document.getElementById('metaDiasLaborables').textContent = metadata.diasLaborables;

    const timestamp = new Date(metadata.timestamp).toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('metaTimestamp').textContent = timestamp;
}

/**
 * Render a group of indicators (mensuales or anuales)
 */
function renderIndicadoresGroup(indicators, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = indicators.map(ind => createIndicadorCard(ind)).join('');
}

/**
 * Create HTML for an indicator card
 */
function createIndicadorCard(indicador) {
    const nivelClass = getNivelClass(indicador.nivel);
    const nivelText = getNivelText(indicador.nivel);
    const nivelIcon = getNivelIcon(indicador.nivel);

    return `
        <div class="indicador-card ${nivelClass}" onclick="showIndicadorChart('${indicador.id}', '${indicador.nombre}')" style="cursor: pointer;">
            <div class="indicador-header">
                <span class="indicador-icono">${indicador.icono}</span>
                <h4 class="indicador-nombre">${indicador.nombre}</h4>
            </div>
            <div class="indicador-valor">
                ${indicador.valor.toFixed(2)}<span class="unidad">${indicador.unidad}</span>
            </div>
            <div class="indicador-formula">
                ${indicador.formula}
            </div>
            <div class="indicador-nivel">
                <span class="nivel-badge ${nivelClass}">
                    ${nivelIcon} ${nivelText}
                </span>
            </div>
            <div class="indicador-hint">
                <small>💡 Click para ver tendencia</small>
            </div>
        </div>
    `;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get CSS class for alert level
 */
function getNivelClass(nivel) {
    const map = {
        'normal': 'nivel-normal',
        'alerta': 'nivel-alerta',
        'critico': 'nivel-critico'
    };
    return map[nivel] || 'nivel-normal';
}

/**
 * Get text for alert level
 */
function getNivelText(nivel) {
    const map = {
        'normal': 'Normal',
        'alerta': 'Alerta - Revisar',
        'critico': 'Crítico - Acción Urgente'
    };
    return map[nivel] || 'Normal';
}

/**
 * Get icon for alert level
 */
function getNivelIcon(nivel) {
    const map = {
        'normal': '🟢',
        'alerta': '🟡',
        'critico': '🔴'
    };
    return map[nivel] || '🟢';
}

/**
 * Initialize year selector with recent years
 */
function initializeYearSelector() {
    const select = document.getElementById('indicadoresYear');
    if (!select) return;

    const currentYear = new Date().getFullYear();
    const years = [];

    // Add current year and previous 2 years
    for (let i = 0; i < 3; i++) {
        years.push(currentYear - i);
    }

    select.innerHTML = years.map(year =>
        `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`
    ).join('');
}

/**
 * Set current month as default
 */
function setDefaultPeriod() {
    const monthSelect = document.getElementById('indicadoresMonth');
    if (!monthSelect) return;

    const currentMonth = new Date().getMonth() + 1; // 1-indexed
    monthSelect.value = currentMonth;
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Setup event listeners for indicadores section
 */
function setupIndicadoresListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshIndicadoresBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadIndicadores);
    }

    // Period selectors change
    const yearSelect = document.getElementById('indicadoresYear');
    const monthSelect = document.getElementById('indicadoresMonth');

    if (yearSelect) {
        yearSelect.addEventListener('change', loadIndicadores);
    }

    if (monthSelect) {
        monthSelect.addEventListener('change', loadIndicadores);
    }

    // Export buttons
    const exportPDFBtn = document.getElementById('exportIndicadoresPDF');
    const exportExcelBtn = document.getElementById('exportIndicadoresExcel');

    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', exportIndicadoresPDF);
    }

    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportIndicadoresExcel);
    }
}

// ============================================
// CHART FUNCTIONS
// ============================================

/**
 * Show trend chart for an indicator
 */
async function showIndicadorChart(indicadorId, indicadorNombre) {
    if (!state.currentEmpresa) {
        showToast('Seleccione una empresa', 'warning');
        return;
    }

    showLoading();

    try {
        const result = await callBackend('getIndicadoresTimeSeries', {
            empresaId: state.currentEmpresa,
            indicadorId: indicadorId,
            months: 12
        });

        if (result.success) {
            renderChartModal(indicadorId, indicadorNombre, result.data);
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
        console.error(error);
    }

    hideLoading();
}

/**
 * Render chart in modal
 */
function renderChartModal(indicadorId, indicadorNombre, data) {
    // Extract labels and values
    const labels = data.map(d => {
        const date = new Date(d.year, d.month - 1);
        return date.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
    });
    const values = data.map(d => d.value);

    // Calculate stats
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    const modalBody = `
        <div class="chart-container" style="position: relative; height: 400px; width: 100%;">
            <canvas id="indicadorChart"></canvas>
        </div>
        <div class="chart-stats" style="display: flex; justify-content: space-around; margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-md);">
            <div style="text-align: center;">
                <div style="color: var(--text-secondary); font-size: 0.875rem;">Promedio</div>
                <div style="color: var(--text-primary); font-size: 1.25rem; font-weight: 600;">${avg.toFixed(2)}</div>
            </div>
            <div style="text-align: center;">
                <div style="color: var(--text-secondary); font-size: 0.875rem;">Máximo</div>
                <div style="color: var(--accent-danger); font-size: 1.25rem; font-weight: 600;">${max.toFixed(2)}</div>
            </div>
            <div style="text-align: center;">
                <div style="color: var(--text-secondary); font-size: 0.875rem;">Mínimo</div>
                <div style="color: var(--accent-success); font-size: 1.25rem; font-weight: 600;">${min.toFixed(2)}</div>
            </div>
        </div>
    `;

    openGenericModal(`📈 Tendencia: ${indicadorNombre}`, modalBody, () => { });

    // Create chart after modal is rendered
    setTimeout(() => {
        const ctx = document.getElementById('indicadorChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: indicadorNombre,
                    data: values,
                    borderColor: '#58a6ff',
                    backgroundColor: 'rgba(88, 166, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#58a6ff',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#58a6ff',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function (context) {
                                return `Valor: ${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(88, 166, 255, 0.1)'
                        },
                        ticks: {
                            color: '#8b949e'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(88, 166, 255, 0.05)'
                        },
                        ticks: {
                            color: '#8b949e'
                        }
                    }
                }
            }
        });
    }, 100);
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

/**
 * Export indicadores to PDF
 */
async function exportIndicadoresPDF() {
    if (!state.currentEmpresa) {
        showToast('Seleccione una empresa', 'warning');
        return;
    }

    const year = document.getElementById('indicadoresYear').value;
    const month = document.getElementById('indicadoresMonth').value;

    showLoading();

    try {
        const result = await callBackend('calculateIndicadoresAuto', {
            empresaId: state.currentEmpresa,
            year: parseInt(year),
            month: parseInt(month)
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setTextColor(31, 111, 235);
        doc.text('Indicadores de SST', 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Período: ${getMonthName(month)} ${year}`, 20, 30);
        doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 20, 36);

        let yPos = 50;

        // Metadata
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Trabajadores Activos: ${result.data.metadata.totalTrabajadores}`, 20, yPos);
        yPos += 6;
        doc.text(`Días Laborables: ${result.data.metadata.diasLaborables}`, 20, yPos);
        yPos += 15;

        // Mensuales
        doc.setFontSize(14);
        doc.text('Indicadores Mensuales', 20, yPos);
        yPos += 10;

        result.data.mensuales.forEach(ind => {
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.text(`${ind.nombre}: ${ind.valor.toFixed(2)}${ind.unidad}`, 25, yPos);
            yPos += 5;
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(ind.formula, 30, yPos);
            yPos += 8;

            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
        });

        // Anuales (if available)
        if (result.data.anuales && result.data.anuales.length > 0) {
            yPos += 5;
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Indicadores Anuales', 20, yPos);
            yPos += 10;

            result.data.anuales.forEach(ind => {
                doc.setFontSize(11);
                doc.text(`${ind.nombre}: ${ind.valor.toFixed(2)}${ind.unidad}`, 25, yPos);
                yPos += 5;
                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.text(ind.formula, 30, yPos);
                yPos += 8;
            });
        }

        // Save
        doc.save(`Indicadores_SST_${year}_${month}.pdf`);
        showToast('PDF generado correctamente', 'success');

    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }

    hideLoading();
}

/**
 * Export indicadores to Excel
 */
async function exportIndicadoresExcel() {
    if (!state.currentEmpresa) {
        showToast('Seleccione una empresa', 'warning');
        return;
    }

    const year = document.getElementById('indicadoresYear').value;
    const month = document.getElementById('indicadoresMonth').value;

    showLoading();

    try {
        const result = await callBackend('calculateIndicadoresAuto', {
            empresaId: state.currentEmpresa,
            year: parseInt(year),
            month: parseInt(month)
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        // Prepare data for Excel
        const data = [];

        // Header rows
        data.push([`Indicadores de SST - ${getMonthName(month)} ${year}`]);
        data.push([]);
        data.push(['Trabajadores Activos:', result.data.metadata.totalTrabajadores]);
        data.push(['Días Laborables:', result.data.metadata.diasLaborables]);
        data.push([]);

        //  Mensuales
        data.push(['INDICADORES MENSUALES']);
        data.push(['Indicador', 'Valor', 'Unidad', 'Nivel', 'Fórmula']);

        result.data.mensuales.forEach(ind => {
            data.push([
                ind.nombre,
                ind.valor.toFixed(2),
                ind.unidad,
                ind.nivel,
                ind.formula
            ]);
        });

        // Anuales
        if (result.data.anuales && result.data.anuales.length > 0) {
            data.push([]);
            data.push(['INDICADORES ANUALES']);
            data.push(['Indicador', 'Valor', 'Unidad', 'Nivel', 'Fórmula']);

            result.data.anuales.forEach(ind => {
                data.push([
                    ind.nombre,
                    ind.valor.toFixed(2),
                    ind.unidad,
                    ind.nivel,
                    ind.formula
                ]);
            });
        }

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Indicadores');

        // Save file
        XLSX.writeFile(wb, `Indicadores_SST_${year}_${month}.xlsx`);
        showToast('Excel generado correctamente', 'success');

    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }

    hideLoading();
}

/**
 * Get month name in Spanish
 */
function getMonthName(month) {
    const months = [
        '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[parseInt(month)];
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize indicadores module
 */
(function initIndicadores() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupIndicadoresModule);
    } else {
        setupIndicadoresModule();
    }
})();

function setupIndicadoresModule() {
    // Initialize selectors
    initializeYearSelector();
    setDefaultPeriod();

    // Setup event listeners
    setupIndicadoresListeners();

    // Auto-load when section becomes visible
    const indicadoresSection = document.getElementById('indicadoresSection');
    if (indicadoresSection) {
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'class') {
                    if (!indicadoresSection.classList.contains('hidden') && state.currentEmpresa) {
                        loadIndicadores();
                    }
                }
            });
        });

        observer.observe(indicadoresSection, { attributes: true });
    }
}
