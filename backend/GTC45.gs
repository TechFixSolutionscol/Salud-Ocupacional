/**
 * SG-SST Management System - GTC 45 Risk Matrix Module
 * Handles Hazard Identification and Risk Assessment
 */

// GTC 45 Constants
const GTC45_CONSTANTS = {
  NIVELES_DEFICIENCIA: {
    '10': 'Muy Alto',
    '6': 'Alto',
    '2': 'Medio',
    '0': 'Bajo'
  },
  NIVELES_EXPOSICION: {
    '4': 'Continua',
    '3': 'Frecuente',
    '2': 'Ocasional',
    '1': 'Esporádica'
  },
  NIVELES_CONSECUENCIA: {
    '100': 'Mortal o Catastrófico',
    '60': 'Muy Grave',
    '25': 'Grave',
    '10': 'Leve'
  }
};

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get matrix entries for a company
 */
function getMatrizRiesgos(empresaId) {
  try {
    if (!empresaId) throw new Error('empresa_id is required');
    return { success: true, data: getSheetDataFiltered(SHEETS.MATRIZ_RIESGOS, { empresa_id: empresaId }) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a new risk entry
 */
function createRiesgo(data) {
  try {
    validateRequired(data, ['empresa_id', 'proceso_id', 'peligro_descripcion', 'nivel_deficiencia', 'nivel_exposicion', 'nivel_consecuencia']);
    
    // Calculate values
    const calculos = calcularRiesgosGTC45(data.nivel_deficiencia, data.nivel_exposicion, data.nivel_consecuencia);
    
    // Phase 8: Set annual review date (mandatory)
    const fechaProximaRevision = addYearsToDate(getCurrentDate(), 1);
    
    const riesgo = {
      riesgo_id: generateUUID(),
      ...data,
      ...calculos,
      fecha_evaluacion: getCurrentDate(),
      fecha_proxima_revision: fechaProximaRevision,
      estado: 'activo'
    };
    
    insertRow(SHEETS.MATRIZ_RIESGOS, riesgo);
    
    // Phase 8 Automation: Auto-generate intervention plan for non-acceptable risks
    if (calculos.aceptabilidad === 'NO ACEPTABLE' || calculos.aceptabilidad === 'ACEPTABLE CON CONTROL') {
       const planData = {
         empresa_id: data.empresa_id,
         riesgo_id: riesgo.riesgo_id,
         actividad_intervencion: `Control de riesgo ${calculos.interpretacion_nr}: ${data.peligro_descripcion}`,
         responsable: data.responsable || 'Responsable SST',
         fecha_propuesta: getCurrentDate(),
         estado: 'programado',
         observaciones: 'Plan generado automáticamente por el sistema (Riesgo No Aceptable)'
       };
       
       // Create intervention plan automatically
       createPlanIntervencion(planData);
    }
    
    return { success: true, data: riesgo };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update risk entry
 */
function updateRiesgo(data) {
  try {
    if (!data.riesgo_id) throw new Error('riesgo_id is required');
    
    // If calculating parameters changed, recalculate
    if (data.nivel_deficiencia || data.nivel_exposicion || data.nivel_consecuencia) {
        const current = getRiesgoById(data.riesgo_id).data;
        const nd = data.nivel_deficiencia || current.nivel_deficiencia;
        const ne = data.nivel_exposicion || current.nivel_exposicion;
        const nc = data.nivel_consecuencia || current.nivel_consecuencia;
        
        const calculos = calcularRiesgosGTC45(nd, ne, nc);
        Object.assign(data, calculos);
    }
    
    updateRow(SHEETS.MATRIZ_RIESGOS, 'riesgo_id', data.riesgo_id, data);
    return { success: true, message: 'Riesgo updated successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete risk entry (Protected by Phase 9 Validation)
 */
function deleteRiesgo(id) {
  try {
    if (!id) throw new Error('riesgo_id is required');
    
    // Phase 9 Integrity Check: Prevent deletion if linked records exist
    const dependencies = checkRiskDependencies(id);
    if (dependencies.hasLinks) {
      throw new Error(`Cannot delete risk: Linked to ${dependencies.details.join(', ')}`);
    }
    
    const result = deleteRow(SHEETS.MATRIZ_RIESGOS, 'riesgo_id', id);
    if (!result) throw new Error('Risk not found or could not be deleted');
    
    return { success: true, message: 'Risk deleted successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Check for dependencies before deletion (Phase 9)
 */
function checkRiskDependencies(riesgoId) {
  const details = [];
  
  // Check Intervention Plans
  const planes = getSheetDataFiltered(SHEETS.PLAN_INTERVENCION, { riesgo_id: riesgoId });
  if (planes.length > 0) details.push('Intervention Plans');
  
  // Check Trainings
  const capacitaciones = getSheetDataFiltered(SHEETS.CAPACITACIONES, { riesgo_id: riesgoId });
  if (capacitaciones.length > 0) details.push('Trainings');
  
  // Check Accidents
  const accidentes = getSheetDataFiltered(SHEETS.INVESTIGACIONES, { riesgo_id: riesgoId });
  if (accidentes.length > 0) details.push('Accidents');
  
  // Check Documents
  const documents = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, { riesgo_id: riesgoId });
  if (documents.length > 0) details.push('Documents');

  return {
    hasLinks: details.length > 0,
    details: details
  };
}

/**
 * Get risk by ID
 */
function getRiesgoById(id) {
    const found = findRowById(SHEETS.MATRIZ_RIESGOS, 'riesgo_id', id);
    if (!found) return { success: false, error: 'Risk not found' };
    
    const riesgo = {};
    found.headers.forEach((header, index) => {
      riesgo[header] = found.data[index];
    });
    return { success: true, data: riesgo };
}


// ============================================
// CALCULATION LOGIC
// ============================================

/**
 * Calculate GTC 45 values
 */
function calcularRiesgosGTC45(nd, ne, nc) {
  const ndVal = parseInt(nd);
  const neVal = parseInt(ne);
  const ncVal = parseInt(nc);
  
  // Nivel de Probabilidad (NP = ND * NE)
  const np = ndVal * neVal;
  
  // Interpretación NP
  let intNp = '';
  if (np >= 40) intNp = 'Muy Alto';
  else if (np >= 24) intNp = 'Alto';
  else if (np >= 10) intNp = 'Medio';
  else intNp = 'Bajo';
  
  // Nivel de Riesgo (NR = NP * NC)
  const nr = np * ncVal;
  
  // Interpretación NR
  let userIntNr = ''; 
  if (nr >= 4000) userIntNr = 'I'; // Situación Crítica
  else if (nr >= 600) userIntNr = 'I';
  else if (nr >= 500) userIntNr = 'II'; // Corregir y adoptar medidas de control
  else if (nr >= 150) userIntNr = 'II';
  else if (nr >= 120) userIntNr = 'III'; // Mejorar si es posible
  else if (nr >= 40) userIntNr = 'III';
  else userIntNr = 'IV'; // Mantener medidas
  
  // Aceptabilidad
  let aceptabilidad = '';
  if (userIntNr === 'I') aceptabilidad = 'NO ACEPTABLE';
  else if (userIntNr === 'II') aceptabilidad = 'NO ACEPTABLE O ACEPTABLE CON CONTROL ESPECIFICO';
  else if (userIntNr === 'III') aceptabilidad = 'ACEPTABLE';
  else aceptabilidad = 'ACEPTABLE';

  // Simplified logic commonly used
  if (userIntNr === 'I' || (userIntNr === 'II' && nr >= 500)) aceptabilidad = 'NO ACEPTABLE';
  else if (userIntNr === 'II') aceptabilidad = 'ACEPTABLE CON CONTROL';
  
  return {
    nivel_probabilidad: np,
    interpretacion_np: intNp,
    nivel_riesgo: nr,
    interpretacion_nr: userIntNr,
    aceptabilidad: aceptabilidad
  };
}
