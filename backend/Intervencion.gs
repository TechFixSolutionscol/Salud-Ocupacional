/**
 * SG-SST Management System - Plan de Intervención Module
 * Manages risk intervention plans
 */

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get intervention plans by company
 */
function getPlanesIntervencion(empresaId) {
  try {
    if (!empresaId) throw new Error('empresa_id is required');
    return { success: true, data: getSheetDataFiltered(SHEETS.PLAN_INTERVENCION, { empresa_id: empresaId }) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create intervention plan
 */
function createPlanIntervencion(data) {
  try {
    validateRequired(data, ['empresa_id', 'riesgo_id', 'actividad_intervencion', 'responsable', 'fecha_propuesta']);
    
    // GTC 45 Link Integrity Check (Phase 9)
    if (data.riesgo_id) {
       // Ensure getRiesgoById is available globally (from GTC45.gs)
       if (typeof getRiesgoById === 'function') {
         const linkedRisk = getRiesgoById(data.riesgo_id);
         if (!linkedRisk.success) throw new Error('Invalid riesgo_id: Risk not found in GTC 45 Matrix');
       }
    }
    
    const plan = {
      plan_id: generateUUID(),
      ...data,
      estado: 'programado' // programado, en_curso, completado, cancelado
    };
    
    insertRow(SHEETS.PLAN_INTERVENCION, plan);
    
    return { success: true, data: plan };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update intervention plan
 */
function updatePlanIntervencion(data) {
  try {
    if (!data.plan_id) throw new Error('plan_id is required');
    
    // Phase 8 Validation: Require residual risk when closing
    if (data.estado === 'completado' && !data.riesgo_residual_nr) {
      throw new Error('No se puede cerrar el plan sin evaluar el riesgo residual (NR)');
    }
    
    updateRow(SHEETS.PLAN_INTERVENCION, 'plan_id', data.plan_id, data);
    return { success: true, message: 'Intervention plan updated successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
