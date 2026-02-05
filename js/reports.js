/**
 * SG-SST Management System - Reports Module
 * PDF and Excel export functionality
 */

// ============================================
// REPORT GENERATION
// ============================================

/**
 * Generate a report based on type and format
 */
async function generateFullReport(reportType, empresaId, format) {
    if (!empresaId) {
        showToast('Seleccione una empresa para generar el reporte', 'warning');
        return;
    }

    showLoading();
    try {
        const result = await callBackend('generatePDFReport', {
            reportType: reportType,
            empresaId: empresaId
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        if (format === 'pdf') {
            generatePDF(reportType, result.data);
        } else if (format === 'excel') {
            generateExcel(reportType, result.data);
        }

    } catch (error) {
        showToast('Error generating report: ' + error.message, 'error');
    }
    hideLoading();
}

// ============================================
// PDF GENERATION
// ============================================

function generatePDF(reportType, data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(31, 111, 235);
    doc.text('SG-SST Management System', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Empresa: ${data.empresa.nombre}`, 20, 30);
    doc.text(`NIT: ${data.empresa.nit}`, 20, 36);
    doc.text(`Fecha: ${data.fechaGeneracion}`, 20, 42);

    // Title
    const titles = {
        'cumplimiento': 'Reporte de Estado de Cumplimiento',
        'documentos': 'Reporte de Documentos SST',
        'accidentes': 'Reporte de Accidentes e Incidentes',
        'capacitaciones': 'Reporte de Capacitaciones',
        'alertas': 'Reporte de Alertas y Acciones'
    };

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(titles[reportType] || 'Reporte', 20, 55);

    let yPos = 65;

    // Content based on report type
    switch (reportType) {
        case 'cumplimiento':
            yPos = renderCumplimientoPDF(doc, data, yPos);
            break;
        case 'documentos':
            yPos = renderDocumentosPDF(doc, data, yPos);
            break;
        case 'accidentes':
            yPos = renderAccidentesPDF(doc, data, yPos);
            break;
        case 'capacitaciones':
            yPos = renderCapacitacionesPDF(doc, data, yPos);
            break;
        case 'alertas':
            yPos = renderAlertasPDF(doc, data, yPos);
            break;
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('Generado por SG-SST Management System', 105, 295, { align: 'center' });
    }

    // Download
    const filename = `${reportType}_${data.empresa.nit}_${formatDateForFile(new Date())}.pdf`;
    doc.save(filename);
    showToast('PDF generado exitosamente', 'success');
}

function renderCumplimientoPDF(doc, data, yPos) {
    const res = data.resumen;

    // Summary box
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos, 180, 40, 'F');

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Cumplimiento General: ${data.cumplimientoGeneral}%`, 20, yPos + 10);

    doc.setFontSize(10);
    doc.text(`Total Documentos: ${res.totalDocumentos}`, 20, yPos + 20);
    doc.text(`Vigentes: ${res.documentosVigentes}`, 80, yPos + 20);
    doc.text(`Por Vencer: ${res.documentosPorVencer}`, 120, yPos + 20);
    doc.text(`Vencidos: ${res.documentosVencidos}`, 160, yPos + 20);
    doc.text(`Total Empleados: ${res.totalEmpleados}`, 20, yPos + 30);
    doc.text(`Alertas Pendientes: ${res.alertasPendientes}`, 80, yPos + 30);

    yPos += 50;

    // Documents by type
    if (data.documentosPorTipo && Object.keys(data.documentosPorTipo).length > 0) {
        doc.setFontSize(12);
        doc.text('Documentos por Tipo:', 20, yPos);
        yPos += 10;

        doc.setFontSize(9);
        for (const [tipo, stats] of Object.entries(data.documentosPorTipo)) {
            doc.text(`${tipo}: Total ${stats.total} | Vigente ${stats.vigente} | Por Vencer ${stats.por_vencer} | Vencido ${stats.vencido}`, 25, yPos);
            yPos += 7;
        }
    }

    return yPos;
}

function renderDocumentosPDF(doc, data, yPos) {
    // Totals
    doc.setFontSize(10);
    doc.text(`Total: ${data.totales.total} | Vigentes: ${data.totales.vigentes} | Por Vencer: ${data.totales.por_vencer} | Vencidos: ${data.totales.vencidos}`, 20, yPos);
    yPos += 15;

    // Table header
    doc.setFillColor(31, 111, 235);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setTextColor(255);
    doc.setFontSize(9);
    doc.text('Documento', 17, yPos);
    doc.text('Tipo', 70, yPos);
    doc.text('Emisión', 110, yPos);
    doc.text('Vencimiento', 140, yPos);
    doc.text('Estado', 175, yPos);

    yPos += 8;
    doc.setTextColor(0);

    // Table rows
    for (const doc_ of data.documentos) {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }

        doc.text(truncateText(doc_.nombre, 25), 17, yPos);
        doc.text(truncateText(doc_.tipo_documento_nombre || doc_.tipo_documento, 18), 70, yPos);
        doc.text(formatDateShort(doc_.fecha_emision), 110, yPos);
        doc.text(formatDateShort(doc_.fecha_vencimiento), 140, yPos);

        // Status with color
        const statusColors = {
            'vigente': [63, 185, 80],
            'por_vencer': [210, 153, 34],
            'vencido': [248, 81, 73]
        };
        const color = statusColors[doc_.estado] || [0, 0, 0];
        doc.setTextColor(...color);
        doc.text(doc_.estado, 175, yPos);
        doc.setTextColor(0);

        yPos += 7;
    }

    return yPos;
}

function renderAccidentesPDF(doc, data, yPos) {
    doc.setFontSize(10);
    if (data.periodo.desde !== 'N/A') {
        doc.text(`Período: ${data.periodo.desde} - ${data.periodo.hasta}`, 20, yPos);
        yPos += 10;
    }

    doc.text(`Total Accidentes: ${data.totales.accidentes}`, 20, yPos);
    doc.text(`Total Incidentes: ${data.totales.incidentes}`, 100, yPos);
    yPos += 15;

    // Accidents section
    if (data.accidentes.length > 0) {
        doc.setFontSize(11);
        doc.text('Accidentes:', 20, yPos);
        yPos += 8;

        doc.setFontSize(9);
        for (const acc of data.accidentes) {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.text(`• ${acc.nombre} - ${formatDateShort(acc.fecha_emision)}`, 25, yPos);
            yPos += 6;
        }
    }

    yPos += 10;

    // Incidents section
    if (data.incidentes.length > 0) {
        doc.setFontSize(11);
        doc.text('Incidentes:', 20, yPos);
        yPos += 8;

        doc.setFontSize(9);
        for (const inc of data.incidentes) {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.text(`• ${inc.nombre} - ${formatDateShort(inc.fecha_emision)}`, 25, yPos);
            yPos += 6;
        }
    }

    return yPos;
}

function renderCapacitacionesPDF(doc, data, yPos) {
    doc.setFontSize(10);
    if (data.periodo.desde !== 'N/A') {
        doc.text(`Período: ${data.periodo.desde} - ${data.periodo.hasta}`, 20, yPos);
        yPos += 10;
    }

    doc.text(`Total Capacitaciones: ${data.total}`, 20, yPos);
    yPos += 15;

    // Table header
    doc.setFillColor(31, 111, 235);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setTextColor(255);
    doc.setFontSize(9);
    doc.text('Capacitación', 17, yPos);
    doc.text('Fecha', 120, yPos);
    doc.text('Responsable', 150, yPos);

    yPos += 8;
    doc.setTextColor(0);

    for (const cap of data.capacitaciones) {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        doc.text(truncateText(cap.nombre, 50), 17, yPos);
        doc.text(formatDateShort(cap.fecha_emision), 120, yPos);
        doc.text(truncateText(cap.responsable, 20), 150, yPos);
        yPos += 7;
    }

    return yPos;
}

function renderAlertasPDF(doc, data, yPos) {
    doc.setFontSize(10);
    const res = data.resumen;
    doc.text(`Total: ${res.totalAlertas} | Pendientes: ${res.pendientes} | Gestionadas: ${res.gestionadas} | Cerradas: ${res.cerradas}`, 20, yPos);
    yPos += 15;

    // Alerts table
    if (data.alertas.length > 0) {
        doc.setFillColor(31, 111, 235);
        doc.rect(15, yPos - 5, 180, 8, 'F');
        doc.setTextColor(255);
        doc.setFontSize(9);
        doc.text('Tipo', 17, yPos);
        doc.text('Mensaje', 50, yPos);
        doc.text('Prioridad', 140, yPos);
        doc.text('Estado', 170, yPos);

        yPos += 8;
        doc.setTextColor(0);

        for (const alert of data.alertas) {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.text(truncateText(alert.tipo_alerta, 15), 17, yPos);
            doc.text(truncateText(alert.mensaje, 40), 50, yPos);
            doc.text(alert.prioridad, 140, yPos);
            doc.text(alert.estado, 170, yPos);
            yPos += 7;
        }
    }

    return yPos;
}

// ============================================
// EXCEL GENERATION
// ============================================

function generateExcel(reportType, data) {
    let wsData = [];
    let sheetName = '';

    switch (reportType) {
        case 'cumplimiento':
            wsData = buildCumplimientoExcel(data);
            sheetName = 'Cumplimiento';
            break;
        case 'documentos':
            wsData = buildDocumentosExcel(data);
            sheetName = 'Documentos';
            break;
        case 'accidentes':
            wsData = buildAccidentesExcel(data);
            sheetName = 'Accidentes_Incidentes';
            break;
        case 'capacitaciones':
            wsData = buildCapacitacionesExcel(data);
            sheetName = 'Capacitaciones';
            break;
        case 'alertas':
            wsData = buildAlertasExcel(data);
            sheetName = 'Alertas';
            break;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-size columns
    const maxWidths = wsData.reduce((acc, row) => {
        row.forEach((cell, i) => {
            const len = (cell || '').toString().length;
            acc[i] = Math.max(acc[i] || 10, len);
        });
        return acc;
    }, {});
    ws['!cols'] = Object.values(maxWidths).map(w => ({ wch: Math.min(w + 2, 50) }));

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Download
    const filename = `${reportType}_${data.empresa.nit}_${formatDateForFile(new Date())}.xlsx`;
    XLSX.writeFile(wb, filename);
    showToast('Excel exportado exitosamente', 'success');
}

function buildCumplimientoExcel(data) {
    const rows = [
        ['REPORTE DE ESTADO DE CUMPLIMIENTO'],
        [],
        ['Empresa:', data.empresa.nombre],
        ['NIT:', data.empresa.nit],
        ['Fecha Generación:', data.fechaGeneracion],
        ['Cumplimiento General:', `${data.cumplimientoGeneral}%`],
        [],
        ['RESUMEN'],
        ['Total Documentos', data.resumen.totalDocumentos],
        ['Documentos Vigentes', data.resumen.documentosVigentes],
        ['Documentos Por Vencer', data.resumen.documentosPorVencer],
        ['Documentos Vencidos', data.resumen.documentosVencidos],
        ['Total Empleados', data.resumen.totalEmpleados],
        ['Alertas Pendientes', data.resumen.alertasPendientes],
        [],
        ['DOCUMENTOS POR TIPO'],
        ['Tipo', 'Total', 'Vigente', 'Por Vencer', 'Vencido']
    ];

    if (data.documentosPorTipo) {
        for (const [tipo, stats] of Object.entries(data.documentosPorTipo)) {
            rows.push([tipo, stats.total, stats.vigente, stats.por_vencer, stats.vencido]);
        }
    }

    return rows;
}

function buildDocumentosExcel(data) {
    const rows = [
        ['REPORTE DE DOCUMENTOS SST'],
        [],
        ['Empresa:', data.empresa.nombre],
        ['Fecha Generación:', data.fechaGeneracion],
        [],
        ['Total', 'Vigentes', 'Por Vencer', 'Vencidos'],
        [data.totales.total, data.totales.vigentes, data.totales.por_vencer, data.totales.vencidos],
        [],
        ['Nombre', 'Tipo', 'Descripción', 'Fecha Emisión', 'Fecha Vencimiento', 'Estado', 'Responsable']
    ];

    for (const doc of data.documentos) {
        rows.push([
            doc.nombre,
            doc.tipo_documento_nombre || doc.tipo_documento,
            doc.descripcion || '',
            doc.fecha_emision,
            doc.fecha_vencimiento,
            doc.estado,
            doc.responsable
        ]);
    }

    return rows;
}

function buildAccidentesExcel(data) {
    const rows = [
        ['REPORTE DE ACCIDENTES E INCIDENTES'],
        [],
        ['Empresa:', data.empresa.nombre],
        ['Período:', `${data.periodo.desde} - ${data.periodo.hasta}`],
        [],
        ['Total Accidentes:', data.totales.accidentes],
        ['Total Incidentes:', data.totales.incidentes],
        [],
        ['ACCIDENTES'],
        ['Nombre', 'Fecha', 'Responsable', 'Observaciones']
    ];

    for (const acc of data.accidentes) {
        rows.push([acc.nombre, acc.fecha_emision, acc.responsable, acc.observaciones || '']);
    }

    rows.push([]);
    rows.push(['INCIDENTES']);
    rows.push(['Nombre', 'Fecha', 'Responsable', 'Observaciones']);

    for (const inc of data.incidentes) {
        rows.push([inc.nombre, inc.fecha_emision, inc.responsable, inc.observaciones || '']);
    }

    return rows;
}

function buildCapacitacionesExcel(data) {
    const rows = [
        ['REPORTE DE CAPACITACIONES'],
        [],
        ['Empresa:', data.empresa.nombre],
        ['Período:', `${data.periodo.desde} - ${data.periodo.hasta}`],
        ['Total:', data.total],
        [],
        ['Nombre', 'Descripción', 'Fecha', 'Responsable']
    ];

    for (const cap of data.capacitaciones) {
        rows.push([cap.nombre, cap.descripcion || '', cap.fecha_emision, cap.responsable]);
    }

    return rows;
}

function buildAlertasExcel(data) {
    const rows = [
        ['REPORTE DE ALERTAS Y ACCIONES'],
        [],
        ['Empresa:', data.empresa.nombre],
        ['Período:', `${data.periodo.desde} - ${data.periodo.hasta}`],
        [],
        ['Total Alertas:', data.resumen.totalAlertas],
        ['Pendientes:', data.resumen.pendientes],
        ['Gestionadas:', data.resumen.gestionadas],
        ['Cerradas:', data.resumen.cerradas],
        ['Total Acciones:', data.resumen.totalAcciones],
        [],
        ['ALERTAS'],
        ['Tipo', 'Mensaje', 'Prioridad', 'Estado', 'Fecha', 'Responsable']
    ];

    for (const alert of data.alertas) {
        rows.push([
            alert.tipo_alerta,
            alert.mensaje,
            alert.prioridad,
            alert.estado,
            alert.fecha_alerta,
            alert.responsable || ''
        ]);
    }

    if (data.acciones && data.acciones.length > 0) {
        rows.push([]);
        rows.push(['ACCIONES REALIZADAS']);
        rows.push(['Fecha', 'Tipo', 'Descripción', 'Usuario']);

        for (const acc of data.acciones) {
            rows.push([acc.fecha, acc.tipo_accion, acc.descripcion, acc.usuario_id]);
        }
    }

    return rows;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function truncateText(text, maxLen) {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen - 3) + '...' : text;
}

function formatDateShort(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO');
}

function formatDateForFile(date) {
    return date.toISOString().split('T')[0].replace(/-/g, '');
}
