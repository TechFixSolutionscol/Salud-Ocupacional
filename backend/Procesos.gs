/**
 * SG-SST Management System - Procesos Module
 * Manages company processes (Mapa de Procesos)
 */

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get processes by company
 */
function getProcesos(empresaId) {
  try {
    if (!empresaId) throw new Error('empresa_id is required');
    
    // Get processes sorted by type
    const procesos = getSheetDataFiltered(SHEETS.PROCESOS, { empresa_id: empresaId });
    
    // Sort logic could go here
    return { success: true, data: procesos };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a new process
 */
function createProceso(data) {
  try {
    validateRequired(data, ['empresa_id', 'nombre', 'tipo_proceso']);
    
    // Validate type
    const validTypes = ['Estratégico', 'Misional', 'Apoyo', 'Evaluación'];
    if (!validTypes.includes(data.tipo_proceso)) {
       throw new Error('Invalid process type. Must be: ' + validTypes.join(', '));
    }
    
    const proceso = {
      proceso_id: generateUUID(),
      empresa_id: data.empresa_id,
      nombre: data.nombre,
      tipo_proceso: data.tipo_proceso,
      descripcion: data.descripcion || '',
      responsable: data.responsable || '',
      estado: 'activo'
    };
    
    insertRow(SHEETS.PROCESOS, proceso);
    
    return { success: true, data: proceso };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update process
 */
function updateProceso(data) {
  try {
    if (!data.proceso_id) throw new Error('proceso_id is required');
    
    updateRow(SHEETS.PROCESOS, 'proceso_id', data.proceso_id, data);
    return { success: true, message: 'Proceso updated successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete process (soft delete)
 */
function deleteProceso(id) {
  try {
    if (!id) throw new Error('id is required');
    updateRow(SHEETS.PROCESOS, 'proceso_id', id, { estado: 'inactivo' });
    return { success: true, message: 'Proceso deleted successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
