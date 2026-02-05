/**
 * SG-SST Management System - Accidentes Module
 * Manages accident and incident investigations
 */

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get accidents by company
 */
function getAccidentes(empresaId) {
  try {
    if (!empresaId) throw new Error('empresa_id is required');
    return { success: true, data: getSheetDataFiltered(SHEETS.INVESTIGACIONES, { empresa_id: empresaId }) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Register new accident/incident
 */
function createAccidente(data) {
  try {
    validateRequired(data, ['empresa_id', 'empleado_id', 'fecha_accidente', 'tipo_evento', 'descripcion']);
    
    // Validate type
    if (!['Accidente', 'Incidente', 'Enfermedad Laboral'].includes(data.tipo_evento)) {
       throw new Error('Invalid event type');
    }
    
    const accidente = {
      investigacion_id: generateUUID(),
      ...data,
      plan_accion: data.plan_accion || '',
      riesgo_id: data.riesgo_id || '', // Optional link to GTC 45 risk
      estado: 'abierto', // abierto, cerrado
      fecha_registro: getCurrentDate()
    };

    // GTC 45 Link Integrity Check (Phase 9)
    if (accidente.riesgo_id && typeof getRiesgoById === 'function') {
         const linkedRisk = getRiesgoById(accidente.riesgo_id);
         if (!linkedRisk.success) throw new Error('Invalid riesgo_id: Risk not found in GTC 45 Matrix');
    }
    
    insertRow(SHEETS.INVESTIGACIONES, accidente);
    
    return { success: true, data: accidente };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update investigation
 */
function updateAccidente(data) {
  try {
    if (!data.investigacion_id) throw new Error('investigacion_id is required');
    updateRow(SHEETS.INVESTIGACIONES, 'investigacion_id', data.investigacion_id, data);
    return { success: true, message: 'Investigation updated successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
