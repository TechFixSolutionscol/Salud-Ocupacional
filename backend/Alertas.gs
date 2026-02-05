/**
 * SG-SST Management System - Alertas Module
 * Alert management and generation
 */

// Alert type constants
const ALERT_TYPES = {
  DOC_POR_VENCER: 'Documento próximo a vencer',
  DOC_VENCIDO: 'Documento vencido',
  CAP_PENDIENTE: 'Capacitación pendiente',
  ACC_SIN_INV: 'Accidente sin investigar',
  EXAMEN_VENCIDO: 'Examen médico vencido'
};

// ============================================
// ALERT GENERATION HELPERS
// ============================================

/**
 * Generate alert for a single document
 * Called when creating/updating documents or during bulk alert generation
 */
function generarAlertaDocumento(documento) {
  try {
    // Calculate document status
    const estado = calculateDocumentStatus(documento.fecha_vencimiento);
    
    // Only generate alert if document is expiring or expired
    if (estado !== 'por_vencer' && estado !== 'vencido') {
      return false;
    }
    
    // Determine alert type and priority
    const tipo = estado === 'vencido' ? 'DOC_VENCIDO' : 'DOC_POR_VENCER';
    const prioridad = estado === 'vencido' ? 'alta' : 'media';
    
    // Create alert record
    const alerta = {
      alerta_id: generateUUID(),
      empresa_id: documento.empresa_id,
      tipo_alerta: tipo,
      referencia_tipo: 'documentos',
      referencia_id: documento.documento_id,
      mensaje: `Documento ${estado}: ${documento.nombre}`,
      fecha_alerta: getCurrentDate(),
      fecha_limite: documento.fecha_vencimiento,
      prioridad: prioridad,
      estado: 'pendiente',
      responsable: documento.responsable || ''
    };
    
    // Insert alert
    insertRow(SHEETS.ALERTAS, alerta);
    
    Logger.log(`✅ Alerta generada para documento: ${documento.nombre} (${estado})`);
    return true;
    
  } catch (error) {
    Logger.log(`❌ Error generando alerta para documento: ${error.message}`);
    return false;
  }
}

// ============================================
// GET OPERATIONS
// ============================================

/**
 * Get all alerts with optional filters
 */
function getAlertas(filters = {}) {
  try {
    const data = getSheetDataFiltered(SHEETS.ALERTAS, filters);
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get alerts by company
 */
function getAlertasByEmpresa(empresaId) {
  try {
    if (!empresaId) {
      throw new Error('empresa_id is required');
    }
    return getAlertas({ empresa_id: empresaId });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get pending alerts by company
 */
function getAlertasPendientes(empresaId) {
  try {
    const filters = { estado: 'pendiente' };
    if (empresaId) {
      filters.empresa_id = empresaId;
    }
    return getAlertas(filters);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get a single alert by ID
 */
function getAlertaById(alertaId) {
  try {
    if (!alertaId) {
      throw new Error('alerta_id is required');
    }
    
    const found = findRowById(SHEETS.ALERTAS, 'alerta_id', alertaId);
    
    if (!found) {
      return { success: false, error: 'Alert not found' };
    }
    
    const alerta = {};
    found.headers.forEach((header, index) => {
      alerta[header] = found.data[index];
    });
    
    return { success: true, data: alerta };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// UPDATE OPERATION
// ============================================

/**
 * Update an existing alert
 */
function updateAlerta(data) {
  try {
    if (!data.alerta_id) {
      throw new Error('alerta_id is required');
    }
    
    // Validate estado if provided
    if (data.estado && !['pendiente', 'gestionada', 'cerrada'].includes(data.estado)) {
      throw new Error('Invalid estado. Must be "pendiente", "gestionada" or "cerrada"');
    }
    
    // Validate prioridad if provided
    if (data.prioridad && !['alta', 'media', 'baja'].includes(data.prioridad)) {
      throw new Error('Invalid prioridad. Must be "alta", "media" or "baja"');
    }
    
    // Update the record
    updateRow(SHEETS.ALERTAS, 'alerta_id', data.alerta_id, data);
    
    return { success: true, message: 'Alert updated successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Mark alert as handled
 */
function marcarAlertaGestionada(alertaId) {
  try {
    return updateAlerta({ alerta_id: alertaId, estado: 'gestionada' });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Close an alert
 */
function cerrarAlerta(alertaId) {
  try {
    return updateAlerta({ alerta_id: alertaId, estado: 'cerrada' });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// ALERT GENERATION
// ============================================

/**
 * Generate alerts for a company (or all companies if no ID provided)
 */
function generarAlertas(empresaId = null) {
  try {
    let empresas;
    
    if (empresaId) {
      const empresa = getEmpresaById(empresaId);
      if (!empresa.success) {
        throw new Error('Company not found');
      }
      empresas = [empresa.data];
    } else {
      const result = getEmpresas({ estado: 'activo' });
      empresas = result.data || [];
    }
    
    let alertasGeneradas = 0;
    
    for (const empresa of empresas) {
      // Generate document alerts
      alertasGeneradas += generarAlertasDocumentos(empresa.empresa_id);
      
      // Generate medical exam alerts
      alertasGeneradas += generarAlertasExamenesMedicos(empresa.empresa_id);
    }
    
    return { 
      success: true, 
      message: `${alertasGeneradas} alert(s) generated`,
      alertasGeneradas: alertasGeneradas
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate alerts for expiring/expired documents
 */
function generarAlertasDocumentos(empresaId) {
  try {
    // Get documents for the company
    const documentos = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, { empresa_id: empresaId });
    
    // Get existing alerts to avoid duplicates
    const alertasExistentes = getSheetDataFiltered(SHEETS.ALERTAS, { 
      empresa_id: empresaId,
      referencia_tipo: 'documentos'
    });
    
    const alertedDocIds = alertasExistentes
      .filter(a => a.estado !== 'cerrada')
      .map(a => a.referencia_id);
    
    let count = 0;
    
    for (const doc of documentos) {
      // Skip if alert already exists
      if (alertedDocIds.includes(doc.documento_id)) continue;
      
      const estado = calculateDocumentStatus(doc.fecha_vencimiento);
      
      if (estado === 'vencido' || estado === 'por_vencer') {
        generarAlertaDocumento(doc);
        count++;
      }
    }
    
    return count;
    
  } catch (error) {
    console.error('Error generating document alerts:', error);
    return 0;
  }
}

/**
 * Generate alerts for medical exams (from documents of type EXAMEN_MEDICO)
 */
function generarAlertasExamenesMedicos(empresaId) {
  try {
    const examenes = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, { 
      empresa_id: empresaId,
      tipo_documento: 'EXAMEN_MEDICO'
    });
    
    const alertasExistentes = getSheetDataFiltered(SHEETS.ALERTAS, { 
      empresa_id: empresaId,
      tipo_alerta: 'EXAMEN_VENCIDO'
    });
    
    const alertedIds = alertasExistentes
      .filter(a => a.estado !== 'cerrada')
      .map(a => a.referencia_id);
    
    let count = 0;
    
    for (const examen of examenes) {
      if (alertedIds.includes(examen.documento_id)) continue;
      
      if (isExpired(examen.fecha_vencimiento)) {
        const alerta = {
          alerta_id: generateUUID(),
          empresa_id: empresaId,
          tipo_alerta: 'EXAMEN_VENCIDO',
          referencia_tipo: 'documentos',
          referencia_id: examen.documento_id,
          mensaje: `Examen médico vencido: ${examen.nombre}`,
          fecha_alerta: getCurrentDate(),
          fecha_limite: examen.fecha_vencimiento,
          prioridad: 'alta',
          estado: 'pendiente',
          responsable: examen.responsable
        };
        
        insertRow(SHEETS.ALERTAS, alerta);
        count++;
      }
    }
    
    return count;
    
  } catch (error) {
    console.error('Error generating medical exam alerts:', error);
    return 0;
  }
}

// ============================================
// WHATSAPP INTEGRATION (MANUAL)
// ============================================

/**
 * Generate WhatsApp link for an alert
 */
function generarEnlaceWhatsApp(alertaId, telefono) {
  try {
    const alertaResult = getAlertaById(alertaId);
    if (!alertaResult.success) {
      throw new Error('Alert not found');
    }
    
    const alerta = alertaResult.data;
    
    // Get company info
    const empresaResult = getEmpresaById(alerta.empresa_id);
    const empresaNombre = empresaResult.success ? empresaResult.data.nombre : 'N/A';
    
    // Build message
    const mensaje = encodeURIComponent(
      `🔔 *ALERTA SG-SST*\n\n` +
      `Empresa: ${empresaNombre}\n` +
      `Tipo: ${ALERT_TYPES[alerta.tipo_alerta] || alerta.tipo_alerta}\n` +
      `Mensaje: ${alerta.mensaje}\n` +
      `Prioridad: ${alerta.prioridad.toUpperCase()}\n` +
      `Fecha límite: ${alerta.fecha_limite || 'N/A'}\n\n` +
      `Por favor tomar las acciones necesarias.`
    );
    
    // Clean phone number
    let cleanPhone = telefono.toString().replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone.startsWith('57')) {
      cleanPhone = '57' + cleanPhone;
    }
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${mensaje}`;
    
    return { success: true, url: whatsappUrl };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get alert types for dropdown
 */
function getAlertTypesDropdown() {
  try {
    const dropdown = Object.entries(ALERT_TYPES).map(([value, label]) => ({
      value: value,
      label: label
    }));
    return { success: true, data: dropdown };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get alert summary for dashboard
 */
function getAlertasSummary(empresaId = null) {
  try {
    const filters = {};
    if (empresaId) {
      filters.empresa_id = empresaId;
    }
    
    const alertas = getSheetDataFiltered(SHEETS.ALERTAS, filters);
    
    return {
      success: true,
      data: {
        total: alertas.length,
        pendientes: alertas.filter(a => a.estado === 'pendiente').length,
        gestionadas: alertas.filter(a => a.estado === 'gestionada').length,
        cerradas: alertas.filter(a => a.estado === 'cerrada').length,
        prioridadAlta: alertas.filter(a => a.prioridad === 'alta' && a.estado === 'pendiente').length,
        prioridadMedia: alertas.filter(a => a.prioridad === 'media' && a.estado === 'pendiente').length,
        prioridadBaja: alertas.filter(a => a.prioridad === 'baja' && a.estado === 'pendiente').length
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
