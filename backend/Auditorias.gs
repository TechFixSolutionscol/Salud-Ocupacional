/**
 * SG-SST Management System - Auditorias Module
 * Manages internal audits and management reviews
 */

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get audits by company
 */
function getAuditorias(empresaId) {
  try {
    if (!empresaId) throw new Error('empresa_id is required');
    return { success: true, data: getSheetDataFiltered(SHEETS.AUDITORIAS, { empresa_id: empresaId }) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create new audit
 */
function createAuditoria(data) {
  try {
    validateRequired(data, ['empresa_id', 'tipo', 'fecha_programada', 'alcance']);
    
    // Validate type
    // Tipo: 'Interna', 'Externa', 'Revision por Direccion'
    
    const auditoria = {
      auditoria_id: generateUUID(),
      ...data,
      estado: data.estado || 'programada', // programada, ejecutada, cerrada
      fecha_registro: getCurrentDate()
    };
    
    insertRow(SHEETS.AUDITORIAS, auditoria);
    
    return { success: true, data: auditoria };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update audit
 */
function updateAuditoria(data) {
  try {
    if (!data.auditoria_id) throw new Error('auditoria_id is required');
    updateRow(SHEETS.AUDITORIAS, 'auditoria_id', data.auditoria_id, data);
    return { success: true, message: 'Audit updated successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
