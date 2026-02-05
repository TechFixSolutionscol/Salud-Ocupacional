/**
 * SG-SST Management System - Automation Module (Phase 9)
 * Handles auto-generation of documents and system events
 */

// ============================================
// DOCUMENT GENERATION
// ============================================

/**
 * Generate a formal document from system data
 * @param {string} empresaId
 * @param {string} docType - e.g., 'MATRIZ_RIESGOS'
 */
function generateSystemDocument(empresaId, docType) {
  try {
    if (!empresaId || !docType) throw new Error('empresa_id and docType are required');
    
    // 1. Fetch System Data based on Type
    let content = '';
    let docName = '';
    
    switch (docType) {
      case 'MATRIZ_RIESGOS':
        const riesgos = getMatrizRiesgos(empresaId).data;
        content = generateMatrixSummary(riesgos);
        docName = `Matriz de Riesgos (Generada ${getCurrentDate()})`;
        break;
        
      case 'PLAN_TRABAJO_ANUAL':
         // Placeholder for Plan logic
         docName = `Plan de Trabajo Anual (Generado ${getCurrentDate()})`;
         content = "Contenido del Plan de Trabajo...";
         break;
         
      default:
        throw new Error('Unsupported document type for auto-generation');
    }
    
    // 2. Create Document Record
    const docData = {
      empresa_id: empresaId,
      tipo_documento: docType,
      nombre: docName,
      fecha_emision: getCurrentDate(),
      fecha_vencimiento: addYears(getCurrentDate(), 1), // Valid for 1 year
      estado: 'vigente',
      responsable: 'Sistema SG-SST (Automático)',
      version: 'v1.0-AUTO',
      fuente_datos: 'sistema',
      observaciones: 'Documento generado automáticamente a partir de los datos del sistema.'
    };
    
    // Reuse existing create logic (which handles versioning now!)
    const result = createDocumento(docData);
    
    return result;
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Helper: Generate Matrix Summary Text
 */
function generateMatrixSummary(riesgos) {
  if (!riesgos || riesgos.length === 0) return "Matriz de Riesgos vacía.";
  
  const total = riesgos.length;
  const criticos = riesgos.filter(r => r.aceptabilidad === 'NO ACEPTABLE').length;
  const medios = riesgos.filter(r => r.aceptabilidad === 'ACEPTABLE CON CONTROL').length;
  
  return `Resumen Ejecutvo GTC 45:\nTotal Riesgos Identificados: ${total}\nCríticos (No Aceptables): ${criticos}\nMedios (Control Específico): ${medios}\n\nEste documento certifica que la matriz se encuentra digitalizada en el sistema.`;
}

// ============================================
// DATE HELPERS
// ============================================

function addYears(dateString, years) {
  const date = new Date(dateString);
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().split('T')[0];
}
