/**
 * SG-SST Management System - Compliance Module
 * Logic for Standards (Res. 0312) and Auto-evaluation
 */

// ============================================
// GET OPERATIONS
// ============================================

/**
 * Get Standards for a specific company, filtered by its classification
 * Merges master list with saved status
 */
function getEstandares(empresaId) {
  try {
    if (!empresaId) throw new Error('empresa_id required');
    
    // 1. Get Company Info to determing applicability
    const empresa = getEmpresaById(empresaId);
    if (!empresa.success) throw new Error('Empresa not found');
    
    // Determine which standards apply
    // If classification is missing, default to ALL ('60') for safety
    // Logic: 
    // - 'ESTANDARES_7' (Micro, Risk I-III) -> Only items with '7' in aplicabilidad
    // - 'ESTANDARES_21' (Small, Risk I-III) -> Items with '7' OR '21'
    // - 'ESTANDARES_60' (Large or High Risk) -> All items
    
    const type = empresa.data.clasificacion_tipo || 'ESTANDARES_60';
    let applicableFilter = [];
    
    if (type === 'ESTANDARES_7') {
      applicableFilter = ['7'];
    } else if (type === 'ESTANDARES_21') {
      applicableFilter = ['7', '21'];
    } else {
      applicableFilter = ['7', '21', '60']; // All inclusive
    }
    
    // Filter Master List
    const applicableStandards = STANDARDS_MASTER_LIST.filter(std => {
      // Check if standard's aplicabilidad array has intersection with applicableFilter
      // Example: Std has ['7', '21', '60']. Filter has ['7']. Intersection is yes.
      // Example: Std has ['60']. Filter has ['7']. Intersection is no.
      return std.aplicabilidad.some(level => applicableFilter.includes(level));
    });
    
    // 2. Get Saved Compliance Status
    let savedStates = [];
    try {
      savedStates = getSheetDataFiltered(SHEETS.CUMPLIMIENTO, { empresa_id: empresaId });
    } catch (e) {
      if (e.message.includes('not found')) {
        // Self-Healing: Sheet missing? Create it!
        initializeSystem();
        savedStates = getSheetDataFiltered(SHEETS.CUMPLIMIENTO, { empresa_id: empresaId });
      } else {
        throw e;
      }
    }

    // Map for O(1) access
    const statusMap = {};
    savedStates.forEach(row => {
      statusMap[row.codigo_estandar] = row;
    });
    
    // 3. Merge
    const result = applicableStandards.map(std => {
      const saved = statusMap[std.codigo] || {};
      return {
        ...std,
        estado: saved.estado || 'SIN_EVALUAR', // CUMPLE, NO_CUMPLE, NO_APLICA, SIN_EVALUAR
        cumplimiento_id: saved.cumplimiento_id || null,
        observacion: saved.observacion || '',
        evidencia_doc_id: saved.evidencia_doc_id || null,
        fecha_verificacion: saved.fecha_verificacion || null
      };
    });
    
    return { 
      success: true, 
      data: result,
      meta: {
        total: applicableStandards.length,
        clasificacion: type
      }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update compliance status for a single standard
 */
function updateEstandar(data) {
  try {
    validateRequired(data, ['empresa_id', 'codigo_estandar', 'estado']);
    
    const { empresa_id, codigo_estandar, estado, observacion, evidencia_doc_id } = data;
    
    // Check if record exists
    const existing = findRow(SHEETS.CUMPLIMIENTO, row => 
      row.empresa_id == empresa_id && row.codigo_estandar == codigo_estandar
    );
    
    const payload = {
      empresa_id,
      codigo_estandar,
      estado,
      observacion: observacion || '',
      evidencia_doc_id: evidencia_doc_id || '',
      fecha_verificacion: getCurrentDate(),
      usuario_verificador: 'SYSTEM' // TODO: Pass user info
    };
    
    if (existing) {
      // Update
      updateRow(SHEETS.CUMPLIMIENTO, 'cumplimiento_id', existing.data.cumplimiento_id, payload);
    } else {
      // Create
      payload.cumplimiento_id = generateUUID();
      insertRow(SHEETS.CUMPLIMIENTO, payload);
    }
    
    // Recalculate Auto-Evaluation Score
    calculateAutoevaluacion(empresa_id);
    
    return { success: true, message: 'Estándar actualizado' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Calculate and update score
 * (Basic version for Phase 2)
 */
function calculateAutoevaluacion(empresaId) {
  // Logic to sum weights of 'CUMPLE' items and 'NO_APLICA' (if justified)
  // For now, just logging
  Logger.log('Recalculating score for ' + empresaId);
}
