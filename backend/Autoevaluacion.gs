/**
 * SG-SST Management System - Autoevaluación Module
 * Calculates compliance score based on Resolución 0312/2019
 * 
 * @author SG-SST System
 * @version 1.0.0
 */

// ============================================
// COMPLIANCE SCORE CALCULATION
// ============================================

/**
 * Calculate the compliance score for a company
 * Based on completed standards vs applicable standards
 * 
 * @param {Object} params - { empresaId }
 * @returns {Object} { success, data: { score, classification, breakdown, totalApplicable, totalCompleted } }
 */
function calculateComplianceScore(params) {
  try {
    const { empresaId } = params;
    if (!empresaId) throw new Error('empresaId required');
    
    // 1. Get applicable standards for this company
    const standardsResult = getEstandares(empresaId);
    if (!standardsResult.success) {
      throw new Error('Failed to get standards: ' + standardsResult.error);
    }
    
    const standards = standardsResult.data;
    
    // 2. Calculate score
    let totalWeight = 0;
    let achievedWeight = 0;
    let totalCompleted = 0;
    let totalApplicable = standards.length;
    
    standards.forEach(std => {
      const weight = parseFloat(std.peso) || 0;
      totalWeight += weight;
      
      // Count as completed if estado is 'cumple'
      if (std.estado === 'cumple') {
        achievedWeight += weight;
        totalCompleted++;
      }
    });
    
    // 3. Calculate percentage (avoid division by zero)
    const score = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;
    
    // 4. Determine classification
    let classification = '';
    let classificationColor = '';
    let actionRequired = '';
    
    if (score < 60) {
      classification = 'CRÍTICO';
      classificationColor = 'red';
      actionRequired = 'Plan de mejoramiento inmediato + reporte a ARL en 3 meses + visita Min. Trabajo';
    } else if (score >= 60 && score < 85) {
      classification = 'MODERADAMENTE ACEPTABLE';
      classificationColor = 'yellow';
      actionRequired = 'Plan de mejoramiento + reporte a ARL en 6 meses + plan de visita';
    } else {
      classification = 'ACEPTABLE';
      classificationColor = 'green';
      actionRequired = 'Mantener calificación + incluir mejoras en Plan Anual';
    }
    
    // 5. Calculate breakdown by PHVA cycle
    const breakdown = calculatePHVABreakdown(standards);
    
    return {
      success: true,
      data: {
        score: Math.round(score * 100) / 100, // Round to 2 decimals
        classification: classification,
        classificationColor: classificationColor,
        actionRequired: actionRequired,
        totalApplicable: totalApplicable,
        totalCompleted: totalCompleted,
        totalWeight: totalWeight,
        achievedWeight: achievedWeight,
        breakdown: breakdown,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate breakdown by PHVA cycle
 * 
 * @param {Array} standards - Array of standard objects
 * @returns {Array} Breakdown by cycle
 */
function calculatePHVABreakdown(standards) {
  const cycles = {
    'I. PLANEAR': { total: 0, achieved: 0, count: 0, completed: 0 },
    'II. HACER': { total: 0, achieved: 0, count: 0, completed: 0 },
    'III. VERIFICAR': { total: 0, achieved: 0, count: 0, completed: 0 },
    'IV. ACTUAR': { total: 0, achieved: 0, count: 0, completed: 0 }
  };
  
  standards.forEach(std => {
    const cycle = std.ciclo;
    const weight = parseFloat(std.peso) || 0;
    
    if (cycles[cycle]) {
      cycles[cycle].total += weight;
      cycles[cycle].count++;
      
      if (std.estado === 'cumple') {
        cycles[cycle].achieved += weight;
        cycles[cycle].completed++;
      }
    }
  });
  
  // Calculate percentage for each cycle
  const breakdown = Object.keys(cycles).map(cycleName => {
    const cycleData = cycles[cycleName];
    const percentage = cycleData.total > 0 
      ? (cycleData.achieved / cycleData.total) * 100 
      : 0;
    
    return {
      cycle: cycleName,
      percentage: Math.round(percentage * 100) / 100,
      totalWeight: cycleData.total,
      achievedWeight: cycleData.achieved,
      totalStandards: cycleData.count,
      completedStandards: cycleData.completed
    };
  });
  
  return breakdown;
}

/**
 * Get historical autoevaluación scores
 * (For future implementation - stores snapshots of scores over time)
 * 
 * @param {String} empresaId
 * @returns {Object} { success, data: [] }
 */
function getAutoevaluacionHistory(empresaId) {
  // TODO: Implement historical tracking
  // For now, just return current score
  const currentScore = calculateComplianceScore({ empresaId });
  
  if (currentScore.success) {
    return {
      success: true,
      data: [currentScore.data]
    };
  }
  
  return {
    success: false,
    error: 'Failed to get current score'
  };
}

/**
 * Save autoevaluación snapshot
 * (Optional - for tracking progress over time)
 * 
 * @param {Object} params - { empresaId, notes }
 * @returns {Object} { success, data }
 */
function saveAutoevaluacionSnapshot(params) {
  try {
    const { empresaId, notes } = params;
    
    // Calculate current score
    const scoreResult = calculateComplianceScore({ empresaId });
    if (!scoreResult.success) {
      throw new Error('Failed to calculate score');
    }
    
    const scoreData = scoreResult.data;
    
    // Store in a dedicated sheet (if needed)
    // For now, just return the calculated data
    const snapshot = {
      empresa_id: empresaId,
      fecha: new Date().toISOString(),
      puntaje: scoreData.score,
      clasificacion: scoreData.classification,
      total_aplicable: scoreData.totalApplicable,
      total_cumplido: scoreData.totalCompleted,
      notas: notes || '',
      breakdown: JSON.stringify(scoreData.breakdown)
    };
    
    return {
      success: true,
      data: snapshot,
      message: 'Snapshot created successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
