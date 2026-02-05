/**
 * SG-SST Management System - Capacitaciones Module
 * Manages training plans and records
 */

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get trainings by company
 */
function getCapacitaciones(empresaId) {
  try {
    if (!empresaId) throw new Error('empresa_id is required');
    return { success: true, data: getSheetDataFiltered(SHEETS.CAPACITACIONES, { empresa_id: empresaId }) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create new training record
 */
function createCapacitacion(data) {
  try {
    validateRequired(data, ['empresa_id', 'tema', 'fecha_programada', 'tipo', 'estado']);
    
    // Validate type
    // Tipo: 'Inducción', 'Reinducción', 'Capacitación', 'Entrenamiento'
    
    const capacitacion = {
      capacitacion_id: generateUUID(),
      ...data,
      asistentes: data.asistentes || 0, // Number of attendees
      riesgo_id: data.riesgo_id || '', // Optional link to GTC 45 risk
      
      fecha_registro: getCurrentDate()
    };
    
    // GTC 45 Link Integrity Check (Phase 9)
    if (capacitacion.riesgo_id && typeof getRiesgoById === 'function') {
         const linkedRisk = getRiesgoById(capacitacion.riesgo_id);
         if (!linkedRisk.success) throw new Error('Invalid riesgo_id: Risk not found in GTC 45 Matrix');
    }
    
    insertRow(SHEETS.CAPACITACIONES, capacitacion);
    
    return { success: true, data: capacitacion };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update training record
 */
function updateCapacitacion(data) {
  try {
    if (!data.capacitacion_id) throw new Error('capacitacion_id is required');
    updateRow(SHEETS.CAPACITACIONES, 'capacitacion_id', data.capacitacion_id, data);
    return { success: true, message: 'Training updated successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
