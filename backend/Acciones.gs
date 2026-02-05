/**
 * SG-SST Management System - Acciones Module
 * Action logging and evidence management
 */

// Action type constants
const ACTION_TYPES = {
  WHATSAPP: 'WhatsApp enviado',
  PDF: 'PDF generado',
  EXCEL: 'Excel exportado',
  OTRO: 'Otra acción'
};

// ============================================
// GET OPERATIONS
// ============================================

/**
 * Get all actions with optional filters
 */
function getAcciones(filters = {}) {
  try {
    const data = getSheetDataFiltered(SHEETS.ACCIONES, filters);
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get actions by alert
 */
function getAccionesByAlerta(alertaId) {
  try {
    if (!alertaId) {
      throw new Error('alerta_id is required');
    }
    return getAcciones({ alerta_id: alertaId });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get actions by company
 */
function getAccionesByEmpresa(empresaId) {
  try {
    if (!empresaId) {
      throw new Error('empresa_id is required');
    }
    return getAcciones({ empresa_id: empresaId });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// REGISTER ACTION
// ============================================

/**
 * Register a new action (evidence)
 */
function registrarAccion(data) {
  try {
    // Validate required fields
    validateRequired(data, ['alerta_id', 'empresa_id', 'tipo_accion', 'descripcion', 'usuario_id']);
    
    // Validate alert exists
    const alerta = getAlertaById(data.alerta_id);
    if (!alerta.success) {
      throw new Error('Alert not found');
    }
    
    // Validate action type
    if (!Object.keys(ACTION_TYPES).includes(data.tipo_accion.toUpperCase())) {
      throw new Error('Invalid action type');
    }
    
    // Prepare the record
    const accion = {
      accion_id: generateUUID(),
      alerta_id: data.alerta_id,
      empresa_id: data.empresa_id,
      tipo_accion: data.tipo_accion.toLowerCase(),
      descripcion: data.descripcion.trim(),
      fecha: getCurrentDateTime(),
      usuario_id: data.usuario_id,
      evidencia: (data.evidencia || '').trim()
    };
    
    // Insert the record
    insertRow(SHEETS.ACCIONES, accion);
    
    // Update alert status to "gestionada" if it was pending
    if (alerta.data.estado === 'pendiente') {
      updateAlerta({ alerta_id: data.alerta_id, estado: 'gestionada' });
    }
    
    return { success: true, data: accion, message: 'Action registered successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Register WhatsApp action (when user clicks send button)
 */
function registrarAccionWhatsApp(alertaId, empresaId, usuarioId, telefono) {
  try {
    return registrarAccion({
      alerta_id: alertaId,
      empresa_id: empresaId,
      tipo_accion: 'whatsapp',
      descripcion: `WhatsApp enviado al número ${telefono}`,
      usuario_id: usuarioId,
      evidencia: `Teléfono: ${telefono}, Fecha: ${getCurrentDateTime()}`
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Register PDF generation action
 */
function registrarAccionPDF(alertaId, empresaId, usuarioId, reportName) {
  try {
    return registrarAccion({
      alerta_id: alertaId,
      empresa_id: empresaId,
      tipo_accion: 'pdf',
      descripcion: `Reporte PDF generado: ${reportName}`,
      usuario_id: usuarioId,
      evidencia: `Reporte: ${reportName}, Fecha: ${getCurrentDateTime()}`
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Register Excel export action
 */
function registrarAccionExcel(alertaId, empresaId, usuarioId, reportName) {
  try {
    return registrarAccion({
      alerta_id: alertaId,
      empresa_id: empresaId,
      tipo_accion: 'excel',
      descripcion: `Reporte Excel exportado: ${reportName}`,
      usuario_id: usuarioId,
      evidencia: `Reporte: ${reportName}, Fecha: ${getCurrentDateTime()}`
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get action types for dropdown
 */
function getActionTypesDropdown() {
  try {
    const dropdown = Object.entries(ACTION_TYPES).map(([value, label]) => ({
      value: value.toLowerCase(),
      label: label
    }));
    return { success: true, data: dropdown };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get action history for an alert
 */
function getHistorialAcciones(alertaId) {
  try {
    const acciones = getSheetDataFiltered(SHEETS.ACCIONES, { alerta_id: alertaId });
    
    // Sort by date descending
    acciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Get user names
    const usuarios = getSheetData(SHEETS.USUARIOS);
    const usuariosMap = {};
    usuarios.forEach(u => usuariosMap[u.usuario_id] = u.nombre);
    
    // Add user names to actions
    const accionesConNombres = acciones.map(a => ({
      ...a,
      usuario_nombre: usuariosMap[a.usuario_id] || 'Unknown'
    }));
    
    return { success: true, data: accionesConNombres };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get actions summary for dashboard
 */
function getAccionesSummary(empresaId = null, fechaDesde = null, fechaHasta = null) {
  try {
    const filters = {};
    if (empresaId) filters.empresa_id = empresaId;
    if (fechaDesde) filters.fecha_desde = fechaDesde;
    if (fechaHasta) filters.fecha_hasta = fechaHasta;
    
    const acciones = getSheetDataFiltered(SHEETS.ACCIONES, filters);
    
    return {
      success: true,
      data: {
        total: acciones.length,
        whatsapp: acciones.filter(a => a.tipo_accion === 'whatsapp').length,
        pdf: acciones.filter(a => a.tipo_accion === 'pdf').length,
        excel: acciones.filter(a => a.tipo_accion === 'excel').length,
        otro: acciones.filter(a => a.tipo_accion === 'otro').length
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
