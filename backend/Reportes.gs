/**
 * SG-SST Management System - Reportes Module
 * Report generation for PDF and Excel
 */

// ============================================
// DASHBOARD DATA
// ============================================

/**
 * Get dashboard data for overview
 */
function getDashboardData(empresaId = null) {
  try {
    const filters = {};
    if (empresaId) {
      filters.empresa_id = empresaId;
    }
    
    // Get counts
    const empresas = empresaId ? [getEmpresaById(empresaId).data] : getSheetDataFiltered(SHEETS.EMPRESAS, { estado: 'activo' });
    const empleados = getSheetDataFiltered(SHEETS.EMPLEADOS, { ...filters, estado: 'activo' });
    const documentos = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, filters);
    const alertas = getSheetDataFiltered(SHEETS.ALERTAS, filters);
    
    // Phase 8: Get GTC 45 Risk Indicators
    const riskIndicators = empresaId ? getRiskDashboardIndicators(empresaId) : {
      riskByLevel: { nivel_I: 0, nivel_II: 0, nivel_III: 0, nivel_IV: 0 },
      totalRiesgos: 0,
      riesgosCriticos: 0,
      planesAbiertos: 0,
      planesCerrados: 0,
      planesVencidos: 0,
      riesgosPendientesRevision: 0
    };
    
    // Calculate document stats
    const docsVigentes = documentos.filter(d => calculateDocumentStatus(d.fecha_vencimiento) === 'vigente').length;
    const docsPorVencer = documentos.filter(d => calculateDocumentStatus(d.fecha_vencimiento) === 'por_vencer').length;
    const docsVencidos = documentos.filter(d => calculateDocumentStatus(d.fecha_vencimiento) === 'vencido').length;
    
    // Calculate alert stats
    const alertasPendientes = alertas.filter(a => a.estado === 'pendiente');
    const alertasPrioridadAlta = alertasPendientes.filter(a => a.prioridad === 'alta').length;
    
    // Recent alerts (last 5)
    const recentAlertas = alertasPendientes
      .sort((a, b) => new Date(b.fecha_alerta) - new Date(a.fecha_alerta))
      .slice(0, 5);
    
    // Documents expiring soon (next 30 days)
    const docsProximosVencer = documentos
      .filter(d => calculateDocumentStatus(d.fecha_vencimiento) === 'por_vencer')
      .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))
      .slice(0, 5);
    
    return {
      success: true,
      data: {
        stats: {
          totalEmpresas: empresas.length,
          totalEmpleados: empleados.length,
          totalDocumentos: documentos.length,
          documentosVigentes: docsVigentes,
          documentosPorVencer: docsPorVencer,
          documentosVencidos: docsVencidos,
          alertasPendientes: alertasPendientes.length,
          alertasPrioridadAlta: alertasPrioridadAlta
        },
        recentAlertas: recentAlertas,
        docsProximosVencer: docsProximosVencer,
        cumplimiento: calculateCompleteness(documentos),
        // Phase 8: GTC 45 Risk Indicators
        riskIndicators: riskIndicators
      }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Calculate SG-SST Documental Completeness (Phase 9)
 * Checks for mandatory document types
 */
function calculateCompleteness(documentos) {
  const MANDATORY_TYPES = [
    'POLITICA_SST',
    'OBJETIVOS_SST',
    'MATRIZ_RIESGOS',
    'PLAN_TRABAJO_ANUAL',
    'MATRIZ_LEGAL',
    'PERFIL_SOCIODEMOGRAFICO',
    'PLAN_CAPACITACION',
    'PLAN_EMERGENCIAS',
    'REPORTES_CONDICIONES'
  ];
  
  // Filter for valid documents (vigente or por_vencer)
  const validDocs = documentos.filter(d => d.estado === 'vigente' || d.estado === 'por_vencer');
  const validTypesPresent = new Set(validDocs.map(d => d.tipo_documento));
  
  // Count how many mandatory types are present
  let foundCount = 0;
  MANDATORY_TYPES.forEach(type => {
    // Check if we have this specific type (handling flexible naming if needed, but assuming strong typing)
    if (validTypesPresent.has(type)) {
      foundCount++;
    }
  });
  
  return Math.round((foundCount / MANDATORY_TYPES.length) * 100);
}

// ============================================
// REPORT DATA GENERATION
// ============================================

/**
 * Generate compliance status report data
 */
function getReporteEstadoCumplimiento(empresaId) {
  try {
    if (!empresaId) {
      throw new Error('empresa_id is required');
    }
    
    const empresa = getEmpresaById(empresaId);
    if (!empresa.success) {
      throw new Error('Company not found');
    }
    
    const documentos = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, { empresa_id: empresaId });
    const empleados = getSheetDataFiltered(SHEETS.EMPLEADOS, { empresa_id: empresaId, estado: 'activo' });
    const alertas = getSheetDataFiltered(SHEETS.ALERTAS, { empresa_id: empresaId });
    
    // Group documents by type
    const docsByType = {};
    for (const doc of documentos) {
      const tipo = doc.tipo_documento;
      if (!docsByType[tipo]) {
        docsByType[tipo] = { total: 0, vigente: 0, por_vencer: 0, vencido: 0 };
      }
      docsByType[tipo].total++;
      const estado = calculateDocumentStatus(doc.fecha_vencimiento);
      docsByType[tipo][estado]++;
    }
    
    return {
      success: true,
      data: {
        empresa: empresa.data,
        fechaGeneracion: getCurrentDateTime(),
        resumen: {
          totalDocumentos: documentos.length,
          documentosVigentes: documentos.filter(d => calculateDocumentStatus(d.fecha_vencimiento) === 'vigente').length,
          documentosPorVencer: documentos.filter(d => calculateDocumentStatus(d.fecha_vencimiento) === 'por_vencer').length,
          documentosVencidos: documentos.filter(d => calculateDocumentStatus(d.fecha_vencimiento) === 'vencido').length,
          totalEmpleados: empleados.length,
          alertasPendientes: alertas.filter(a => a.estado === 'pendiente').length
        },
        documentosPorTipo: docsByType,
        cumplimientoGeneral: documentos.length > 0 
          ? Math.round((documentos.filter(d => calculateDocumentStatus(d.fecha_vencimiento) === 'vigente').length / documentos.length) * 100)
          : 0
      }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate document status report data
 */
function getReporteDocumentos(empresaId, filters = {}) {
  try {
    if (!empresaId) {
      throw new Error('empresa_id is required');
    }
    
    const empresa = getEmpresaById(empresaId);
    if (!empresa.success) {
      throw new Error('Company not found');
    }
    
    let documentos = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, { empresa_id: empresaId, ...filters });
    
    // Update status and sort
    documentos = documentos.map(d => ({
      ...d,
      estado: calculateDocumentStatus(d.fecha_vencimiento),
      tipo_documento_nombre: DOCUMENT_TYPES[d.tipo_documento] || d.tipo_documento
    }));
    
    // Sort by expiration date
    documentos.sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));
    
    return {
      success: true,
      data: {
        empresa: empresa.data,
        fechaGeneracion: getCurrentDateTime(),
        documentos: documentos,
        totales: {
          total: documentos.length,
          vigentes: documentos.filter(d => d.estado === 'vigente').length,
          por_vencer: documentos.filter(d => d.estado === 'por_vencer').length,
          vencidos: documentos.filter(d => d.estado === 'vencido').length
        }
      }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate accidents and incidents report data
 */
function getReporteAccidentesIncidentes(empresaId, fechaDesde = null, fechaHasta = null) {
  try {
    if (!empresaId) {
      throw new Error('empresa_id is required');
    }
    
    const empresa = getEmpresaById(empresaId);
    if (!empresa.success) {
      throw new Error('Company not found');
    }
    
    // Get accident and incident documents
    let accidentes = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, { 
      empresa_id: empresaId,
      tipo_documento: 'INV_ACCIDENTE'
    });
    
    let incidentes = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, { 
      empresa_id: empresaId,
      tipo_documento: 'INV_INCIDENTE'
    });
    
    // Apply date filters if provided
    if (fechaDesde) {
      const desde = parseDate(fechaDesde);
      accidentes = accidentes.filter(a => parseDate(a.fecha_emision) >= desde);
      incidentes = incidentes.filter(i => parseDate(i.fecha_emision) >= desde);
    }
    
    if (fechaHasta) {
      const hasta = parseDate(fechaHasta);
      accidentes = accidentes.filter(a => parseDate(a.fecha_emision) <= hasta);
      incidentes = incidentes.filter(i => parseDate(i.fecha_emision) <= hasta);
    }
    
    return {
      success: true,
      data: {
        empresa: empresa.data,
        fechaGeneracion: getCurrentDateTime(),
        periodo: {
          desde: fechaDesde || 'N/A',
          hasta: fechaHasta || 'N/A'
        },
        accidentes: accidentes,
        incidentes: incidentes,
        totales: {
          accidentes: accidentes.length,
          incidentes: incidentes.length
        }
      }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate trainings report data
 */
function getReporteCapacitaciones(empresaId, fechaDesde = null, fechaHasta = null) {
  try {
    if (!empresaId) {
      throw new Error('empresa_id is required');
    }
    
    const empresa = getEmpresaById(empresaId);
    if (!empresa.success) {
      throw new Error('Company not found');
    }
    
    let capacitaciones = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, { 
      empresa_id: empresaId,
      tipo_documento: 'CAPACITACION'
    });
    
    // Apply date filters if provided
    if (fechaDesde) {
      const desde = parseDate(fechaDesde);
      capacitaciones = capacitaciones.filter(c => parseDate(c.fecha_emision) >= desde);
    }
    
    if (fechaHasta) {
      const hasta = parseDate(fechaHasta);
      capacitaciones = capacitaciones.filter(c => parseDate(c.fecha_emision) <= hasta);
    }
    
    // Sort by date
    capacitaciones.sort((a, b) => new Date(b.fecha_emision) - new Date(a.fecha_emision));
    
    return {
      success: true,
      data: {
        empresa: empresa.data,
        fechaGeneracion: getCurrentDateTime(),
        periodo: {
          desde: fechaDesde || 'N/A',
          hasta: fechaHasta || 'N/A'
        },
        capacitaciones: capacitaciones,
        total: capacitaciones.length
      }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate alerts summary report data
 */
function getReporteAlertas(empresaId, fechaDesde = null, fechaHasta = null) {
  try {
    if (!empresaId) {
      throw new Error('empresa_id is required');
    }
    
    const empresa = getEmpresaById(empresaId);
    if (!empresa.success) {
      throw new Error('Company not found');
    }
    
    let alertas = getSheetDataFiltered(SHEETS.ALERTAS, { empresa_id: empresaId });
    let acciones = getSheetDataFiltered(SHEETS.ACCIONES, { empresa_id: empresaId });
    
    // Apply date filters
    if (fechaDesde) {
      const desde = parseDate(fechaDesde);
      alertas = alertas.filter(a => parseDate(a.fecha_alerta) >= desde);
      acciones = acciones.filter(a => parseDate(a.fecha) >= desde);
    }
    
    if (fechaHasta) {
      const hasta = parseDate(fechaHasta);
      alertas = alertas.filter(a => parseDate(a.fecha_alerta) <= hasta);
      acciones = acciones.filter(a => parseDate(a.fecha) <= hasta);
    }
    
    // Group alerts by type
    const alertasByType = {};
    for (const alerta of alertas) {
      const tipo = alerta.tipo_alerta;
      if (!alertasByType[tipo]) {
        alertasByType[tipo] = { total: 0, pendiente: 0, gestionada: 0, cerrada: 0 };
      }
      alertasByType[tipo].total++;
      alertasByType[tipo][alerta.estado]++;
    }
    
    return {
      success: true,
      data: {
        empresa: empresa.data,
        fechaGeneracion: getCurrentDateTime(),
        periodo: {
          desde: fechaDesde || 'N/A',
          hasta: fechaHasta || 'N/A'
        },
        alertas: alertas,
        acciones: acciones,
        resumen: {
          totalAlertas: alertas.length,
          pendientes: alertas.filter(a => a.estado === 'pendiente').length,
          gestionadas: alertas.filter(a => a.estado === 'gestionada').length,
          cerradas: alertas.filter(a => a.estado === 'cerrada').length,
          totalAcciones: acciones.length
        },
        alertasPorTipo: alertasByType
      }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

/**
 * Generate data for Excel export
 */
function exportToExcelData(reportType, empresaId, params = {}) {
  try {
    let reportData;
    
    switch(reportType) {
      case 'cumplimiento':
        reportData = getReporteEstadoCumplimiento(empresaId);
        break;
      case 'documentos':
        reportData = getReporteDocumentos(empresaId, params);
        break;
      case 'accidentes':
        reportData = getReporteAccidentesIncidentes(empresaId, params.fechaDesde, params.fechaHasta);
        break;
      case 'capacitaciones':
        reportData = getReporteCapacitaciones(empresaId, params.fechaDesde, params.fechaHasta);
        break;
      case 'alertas':
        reportData = getReporteAlertas(empresaId, params.fechaDesde, params.fechaHasta);
        break;
      default:
        throw new Error('Invalid report type');
    }
    
    if (!reportData.success) {
      throw new Error(reportData.error);
    }
    
    return reportData;
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate PDF report (returns HTML for client-side PDF generation)
 */
function generatePDFReport(reportType, empresaId, params = {}) {
  try {
    const reportData = exportToExcelData(reportType, empresaId, params);
    
    if (!reportData.success) {
      throw new Error(reportData.error);
    }
    
    // Add metadata for PDF
    reportData.data.metadata = {
      reportType: reportType,
      generated: getCurrentDateTime(),
      generatedBy: 'SG-SST Management System'
    };
    
    return reportData;
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// PHASE 9: COMPREHENSIVE AUDIT REPORTS
// ============================================

/**
 * Generate comprehensive audit-ready report (Phase 9)
 * Includes all mandatory SG-SST documentation and relational data
 */
function getReporteAuditoriaCompleta(empresaId) {
  try {
    if (!empresaId) throw new Error('empresa_id is required');
    
    // 1. Company Information
    const empresa = getEmpresaById(empresaId);
    if (!empresa.success) throw new Error('Company not found');
    
    // 2. Document Completeness (Phase 9 Indicator)
    const documentos = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, { empresa_id: empresaId });
    const completenessScore = calculateCompleteness(documentos);
    
    // 3. Risk Matrix Summary
    const riesgos = getMatrizRiesgos(empresaId).data || [];
    const riskSummary = {
      total: riesgos.length,
      criticos: riesgos.filter(r => r.aceptabilidad === 'NO ACEPTABLE').length,
      medios: riesgos.filter(r => r.aceptabilidad === 'ACEPTABLE CON CONTROL').length,
      aceptables: riesgos.filter(r => r.aceptabilidad === 'ACEPTABLE').length
    };
    
    // 4. Intervention Plans (Phase 9 Relational)
    const planes = getSheetDataFiltered(SHEETS.PLAN_INTERVENCION, { empresa_id: empresaId });
    const planesConRiesgo = planes.filter(p => p.riesgo_id && p.riesgo_id !== '');
    
    // 5. Training Records (Phase 9 Relational)
    const capacitaciones = getSheetDataFiltered(SHEETS.CAPACITACIONES, { empresa_id: empresaId });
    const capacitacionesVinculadas = capacitaciones.filter(c => c.riesgo_id && c.riesgo_id !== '');
    
    // 6. Accident Investigations (Phase 9 Relational)
    const investigaciones = getSheetDataFiltered(SHEETS.INVESTIGACIONES, { empresa_id: empresaId });
    const investigacionesVinculadas = investigaciones.filter(i => i.riesgo_id && i.riesgo_id !== '');
    
    // 7. Audits
    const auditorias = getSheetDataFiltered(SHEETS.AUDITORIAS, { empresa_id: empresaId });
    
    // 8. Employees
    const empleados = getSheetDataFiltered(SHEETS.EMPLEADOS, { empresa_id: empresaId, estado: 'activo' });
    
    // 9. Alerts
    const alertas = getSheetDataFiltered(SHEETS.ALERTAS, { empresa_id: empresaId });
    const alertasPendientes = alertas.filter(a => a.estado === 'pendiente');
    
    // 10. Document Status Breakdown
    const docsVigentes = documentos.filter(d => calculateDocumentStatus(d.fecha_vencimiento) === 'vigente').length;
    const docsPorVencer = documentos.filter(d => calculateDocumentStatus(d.fecha_vencimiento) === 'por_vencer').length;
    const docsVencidos = documentos.filter(d => calculateDocumentStatus(d.fecha_vencimiento) === 'vencido').length;
    
    return {
      success: true,
      data: {
        // Metadata
        empresa: empresa.data,
        fechaGeneracion: getCurrentDateTime(),
        tipoReporte: 'Auditoría SG-SST Completa (Decreto 1072)',
        
        // Phase 9 Completeness
        cumplimiento: {
          porcentajeCompletitud: completenessScore,
          estado: completenessScore >= 90 ? 'COMPLETO' : 
                  completenessScore >= 70 ? 'PARCIAL' : 'INCOMPLETO',
          observacion: completenessScore >= 90 ? 
            'Sistema cumple con requisitos documentales mínimos' :
            'Se requiere completar documentación faltante'
        },
        
        // Statistics
        resumen: {
          totalEmpleados: empleados.length,
          totalDocumentos: documentos.length,
          documentosVigentes: docsVigentes,
          documentosPorVencer: docsPorVencer,
          documentosVencidos: docsVencidos,
          totalRiesgos: riesgos.length,
          riesgosCriticos: riskSummary.criticos,
          planesIntervencion: planes.length,
          planesVinculadosARiesgos: planesConRiesgo.length,
          capacitaciones: capacitaciones.length,
          capacitacionesVinculadas: capacitacionesVinculadas.length,
          accidentes: investigaciones.length,
          accidentesVinculados: investigacionesVinculadas.length,
          auditorias: auditorias.length,
          alertasPendientes: alertasPendientes.length
        },
        
        // Detailed Data (for PDF rendering)
        detalles: {
          documentos: documentos.map(d => ({
            ...d,
            estado_calculado: calculateDocumentStatus(d.fecha_vencimiento)
          })),
          riesgos: riesgos,
          planes: planes,
          capacitaciones: capacitaciones,
          investigaciones: investigaciones,
          auditorias: auditorias,
          alertasPendientes: alertasPendientes
        },
        
        // Phase 9 Integrity Report
        integridadRelacional: {
          totalVinculos: planesConRiesgo.length + capacitacionesVinculadas.length + investigacionesVinculadas.length,
          planesVinculados: `${planesConRiesgo.length}/${planes.length}`,
          capacitacionesVinculadas: `${capacitacionesVinculadas.length}/${capacitaciones.length}`,
          accidentesVinculados: `${investigacionesVinculadas.length}/${investigaciones.length}`,
          porcentajeVinculacion: planes.length > 0 ? 
            Math.round(((planesConRiesgo.length + capacitacionesVinculadas.length + investigacionesVinculadas.length) / 
            (planes.length + capacitaciones.length + investigaciones.length)) * 100) : 0
        }
      }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}
