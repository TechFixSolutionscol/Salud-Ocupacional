/**
 * SG-SST Management System - Compliance Module (Phase 9)
 * Legal compliance verification against Decreto 1072 de 2015
 */

// ============================================
// DECRETO 1072 COMPLIANCE CHECKLIST
// ============================================

/**
 * Verify compliance with Decreto 1072 de 2015
 * Returns a detailed compliance report
 */
function verificarCumplimientoDecreto1072(empresaId) {
  try {
    if (!empresaId) throw new Error('empresa_id is required');
    
    const empresa = getEmpresaById(empresaId);
    if (!empresa.success) throw new Error('Company not found');
    
    // Get all system data
    const documentos = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, { empresa_id: empresaId });
    const empleados = getSheetDataFiltered(SHEETS.EMPLEADOS, { empresa_id: empresaId });
    const riesgos = getMatrizRiesgos(empresaId).data || [];
    const planes = getSheetDataFiltered(SHEETS.PLAN_INTERVENCION, { empresa_id: empresaId });
    const capacitaciones = getSheetDataFiltered(SHEETS.CAPACITACIONES, { empresa_id: empresaId });
    
    // Decreto 1072 Requirements Checklist
    const requisitos = [];
    
    // 1. Política de SST (Art. 2.2.4.6.5)
    requisitos.push(checkRequirement(
      'Política de Seguridad y Salud en el Trabajo',
      documentos,
      'POLITICA_SST',
      'Decreto 1072 Art. 2.2.4.6.5 - Obligatorio'
    ));
    
    // 2. Objetivos de SST (Art. 2.2.4.6.7)
    requisitos.push(checkRequirement(
      'Objetivos de SST',
      documentos,
      'OBJETIVOS_SST',
      'Decreto 1072 Art. 2.2.4.6.7 - Obligatorio'
    ));
    
    // 3. Plan de Trabajo Anual (Art. 2.2.4.6.8)
    requisitos.push(checkRequirement(
      'Plan de Trabajo Anual de SST',
      documentos,
      'PLAN_TRABAJO_ANUAL',
      'Decreto 1072 Art. 2.2.4.6.8 - Obligatorio'
    ));
    
    // 4. Identificación de Peligros (Art. 2.2.4.6.15)
    requisitos.push({
      requisito: 'Identificación de Peligros y Evaluación de Riesgos',
      cumple: riesgos.length > 0,
      detalles: `${riesgos.length} riesgos identificados en Matriz GTC 45`,
      referencia: 'Decreto 1072 Art. 2.2.4.6.15 - Obligatorio',
      criticidad: riesgos.length === 0 ? 'CRITICO' : 'OK'
    });
    
    // 5. Plan de Prevención y Preparación ante Emergencias (Art. 2.2.4.6.25)
    requisitos.push(checkRequirement(
      'Plan de Prevención, Preparación y Respuesta ante Emergencias',
      documentos,
      'PLAN_EMERGENCIAS',
      'Decreto 1072 Art. 2.2.4.6.25 - Obligatorio'
    ));
    
    // 6. Programa de Capacitación (Art. 2.2.4.6.11)
    requisitos.push(checkRequirement(
      'Programa de Capacitación en SST',
      documentos,
      'PLAN_CAPACITACION',
      'Decreto 1072 Art. 2.2.4.6.11 - Obligatorio'
    ));
    
    // 7. Matriz de Requisitos Legales (Art. 2.2.4.6.14)
    requisitos.push(checkRequirement(
      'Matriz de Identificación de Requisitos Legales',
      documentos,
      'MATRIZ_LEGAL',
      'Decreto 1072 Art. 2.2.4.6.14 - Obligatorio'
    ));
    
    // 8. Perfil Sociodemográfico (Art. 2.2.4.6.16)
    requisitos.push(checkRequirement(
      'Perfil Sociodemográfico y Diagnóstico de Condiciones de Salud',
      documentos,
      'PERFIL_SOCIODEMOGRAFICO',
      'Decreto 1072 Art. 2.2.4.6.16 - Obligatorio'
    ));
    
    // 9. Reportes de Condiciones de Trabajo (Art. 2.2.4.6.19)
    requisitos.push(checkRequirement(
      'Reporte de Condiciones de Trabajo y Salud',
      documentos,
      'REPORTES_CONDICIONES',
      'Decreto 1072 Art. 2.2.4.6.19 - Obligatorio'
    ));
    
    // 10. Risk Intervention Plans (Art. 2.2.4.6.24)
    requisitos.push({
      requisito: 'Medidas de Prevención y Control de Peligros',
      cumple: planes.length > 0,
      detalles: `${planes.length} planes de intervención registrados`,
      referencia: 'Decreto 1072 Art. 2.2.4.6.24 - Obligatorio',
      criticidad: planes.length === 0 ? 'CRITICO' : 'OK'
    });
    
    // Calculate compliance
    const totalRequisitos = requisitos.length;
    const requisitorsCumplidos = requisitos.filter(r => r.cumple).length;
    const porcentajeCumplimiento = Math.round((requisitorsCumplidos / totalRequisitos) * 100);
    
    // Determine status
    let estadoGeneral = 'NO CUMPLE';
    if (porcentajeCumplimiento === 100) estadoGeneral = 'CUMPLE TOTALMENTE';
    else if (porcentajeCumplimiento >= 80) estadoGeneral = 'CUMPLE PARCIALMENTE';
    
    const criticos = requisitos.filter(r => r.criticidad === 'CRITICO');
    
    return {
      success: true,
      data: {
        empresa: empresa.data,
        fechaVerificacion: getCurrentDateTime(),
        cumplimiento: {
          porcentaje: porcentajeCumplimiento,
          estado: estadoGeneral,
          requisitosTotal: totalRequisitos,
          requisitosCumplidos: requisitorsCumplidos,
          requisitosPendientes: totalRequisitos - requisitorsCumplidos,
          requisitosCriticos: criticos.length
        },
        requisitos: requisitos,
        recomendaciones: generarRecomendaciones(requisitos),
        normatividad: 'Decreto 1072 de 2015 - Sistema de Gestión de SST (Colombia)'
      }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Helper: Check if a requirement is met
 */
function checkRequirement(nombre, documentos, tipoDoc, referencia) {
  const doc = documentos.find(d => 
    d.tipo_documento === tipoDoc && 
    (calculateDocumentStatus(d.fecha_vencimiento) === 'vigente' || 
     calculateDocumentStatus(d.fecha_vencimiento) === 'por_vencer')
  );
  
  return {
    requisito: nombre,
    cumple: !!doc,
    detalles: doc ? `Documento vigente: ${doc.nombre} (v${doc.version || '1.0'})` : 'Documento faltante o vencido',
    referencia: referencia,
    criticidad: doc ? 'OK' : 'CRITICO'
  };
}

/**
 * Helper: Generate recommendations based on missing requirements
 */
function generarRecomendaciones(requisitos) {
  const pendientes = requisitos.filter(r => !r.cumple);
  
  if (pendientes.length === 0) {
    return ['El sistema cumple con todos los requisitos del Decreto 1072. Mantener documentación actualizada.'];
  }
  
  const recomendaciones = [
    `Se deben completar ${pendientes.length} requisito(s) documentales para cumplir con el Decreto 1072.`,
    'Priorizar la creación de los siguientes documentos:'
  ];
  
  pendientes.forEach(p => {
    recomendaciones.push(`  - ${p.requisito} (${p.referencia})`);
  });
  
  recomendaciones.push('Utilizar la función "Generar Documento" del sistema para crear documentos automáticamente desde los datos existentes.');
  
  return recomendaciones;
}
