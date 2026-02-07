/**
 * SG-SST Management System - Standards Data (Res. 0312/2019)
 * Master list of all 60 standards
 */

const STANDARDS_MASTER_LIST = [
  // I. PLANEAR
  { codigo: '1.1.1', ciclo: 'I. PLANEAR', nombre: 'Responsable del SG-SST', peso: 0.5, aplicabilidad: ['7', '21', '60'] },
  { codigo: '1.1.2', ciclo: 'I. PLANEAR', nombre: 'Responsabilidades en el SG-SST', peso: 0.5, aplicabilidad: ['21', '60'] },
  { codigo: '1.1.3', ciclo: 'I. PLANEAR', nombre: 'Asignación de recursos', peso: 0.5, aplicabilidad: ['7', '21', '60'] },
  { codigo: '1.1.4', ciclo: 'I. PLANEAR', nombre: 'Afiliación al Sistema General de Riesgos Laborales', peso: 0.5, aplicabilidad: ['7', '21', '60'] },
  { codigo: '1.1.5', ciclo: 'I. PLANEAR', nombre: 'Identificación de trabajadores de alto riesgo', peso: 0.5, aplicabilidad: ['60'] },
  { codigo: '1.1.6', ciclo: 'I. PLANEAR', nombre: 'Conformación COPASST / Vigía', peso: 0.5, aplicabilidad: ['21', '60'] },
  { codigo: '1.1.7', ciclo: 'I. PLANEAR', nombre: 'Capacitación COPASST / Vigía', peso: 0.5, aplicabilidad: ['21', '60'] },
  { codigo: '1.1.8', ciclo: 'I. PLANEAR', nombre: 'Conformación Comité Convivencia', peso: 0.5, aplicabilidad: ['21', '60'] },
  
  { codigo: '1.2.1', ciclo: 'I. PLANEAR', nombre: 'Programa de Capacitación', peso: 2.0, aplicabilidad: ['7', '21', '60'] },
  { codigo: '1.2.2', ciclo: 'I. PLANEAR', nombre: 'Inducción y Reinducción', peso: 2.0, aplicabilidad: ['60'] },
  { codigo: '1.2.3', ciclo: 'I. PLANEAR', nombre: 'Curso Virtual 50 Horas', peso: 2.0, aplicabilidad: ['60'] },

  { codigo: '2.1.1', ciclo: 'I. PLANEAR', nombre: 'Política de SST', peso: 1.0, aplicabilidad: ['21', '60'] },
  { codigo: '2.2.1', ciclo: 'I. PLANEAR', nombre: 'Objetivos del SG-SST', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '2.3.1', ciclo: 'I. PLANEAR', nombre: 'Evaluación inicial del SG-SST', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '2.4.1', ciclo: 'I. PLANEAR', nombre: 'Plan Anual de Trabajo', peso: 2.0, aplicabilidad: ['7', '21', '60'] },
  { codigo: '2.5.1', ciclo: 'I. PLANEAR', nombre: 'Archivo y retención documental', peso: 2.0, aplicabilidad: ['60'] },
  { codigo: '2.6.1', ciclo: 'I. PLANEAR', nombre: 'Rendición de cuentas', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '2.7.1', ciclo: 'I. PLANEAR', nombre: 'Matriz legal', peso: 2.0, aplicabilidad: ['60'] },
  { codigo: '2.8.1', ciclo: 'I. PLANEAR', nombre: 'Mecanismos de comunicación', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '2.9.1', ciclo: 'I. PLANEAR', nombre: 'Adquisiciones', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '2.10.1', ciclo: 'I. PLANEAR', nombre: 'Contratación', peso: 2.0, aplicabilidad: ['60'] },
  { codigo: '2.11.1', ciclo: 'I. PLANEAR', nombre: 'Gestión del cambio', peso: 1.0, aplicabilidad: ['60'] },

  // II. HACER
  { codigo: '3.1.1', ciclo: 'II. HACER', nombre: 'Descripción sociodemográfica y diagnóstico de salud', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '3.1.2', ciclo: 'II. HACER', nombre: 'Actividades de Medicina del Trabajo', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '3.1.3', ciclo: 'II. HACER', nombre: 'Perfiles de cargo', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '3.1.4', ciclo: 'II. HACER', nombre: 'Evaluaciones médicas ocupacionales', peso: 1.0, aplicabilidad: ['7', '21', '60'] },
  { codigo: '3.1.5', ciclo: 'II. HACER', nombre: 'Custodia de historias clínicas', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '3.1.6', ciclo: 'II. HACER', nombre: 'Restricciones y recomendaciones médicas', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '3.1.7', ciclo: 'II. HACER', nombre: 'Estilos de vida saludables', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '3.1.8', ciclo: 'II. HACER', nombre: 'Servicios de higiene (Agua, Baños)', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '3.1.9', ciclo: 'II. HACER', nombre: 'Manejo de residuos', peso: 1.0, aplicabilidad: ['60'] },

  { codigo: '3.2.1', ciclo: 'II. HACER', nombre: 'Reporte de AT y EL', peso: 2.0, aplicabilidad: ['21', '60'] },
  { codigo: '3.2.2', ciclo: 'II. HACER', nombre: 'Investigación de AT y EL', peso: 2.0, aplicabilidad: ['21', '60'] },
  { codigo: '3.2.3', ciclo: 'II. HACER', nombre: 'Registro y análisis estadístico', peso: 1.0, aplicabilidad: ['60'] },

  { codigo: '3.3.1', ciclo: 'II. HACER', nombre: 'Medición de Frecuencia de accidentalidad', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '3.3.2', ciclo: 'II. HACER', nombre: 'Medición de Severidad de accidentalidad', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '3.3.3', ciclo: 'II. HACER', nombre: 'Medición de Mortalidad', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '3.3.4', ciclo: 'II. HACER', nombre: 'Medición de Prevalencia de EL', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '3.3.5', ciclo: 'II. HACER', nombre: 'Medición de Incidencia de EL', peso: 1.0, aplicabilidad: ['60'] },
  { codigo: '3.3.6', ciclo: 'II. HACER', nombre: 'Medición de Ausentismo', peso: 1.0, aplicabilidad: ['60'] },

  { codigo: '4.1.1', ciclo: 'II. HACER', nombre: 'Metodología identificación de peligros', peso: 4.0, aplicabilidad: ['60'] },
  { codigo: '4.1.2', ciclo: 'II. HACER', nombre: 'Identificación de peligros y valoración de riesgos', peso: 4.0, aplicabilidad: ['7', '21', '60'] },
  { codigo: '4.1.3', ciclo: 'II. HACER', nombre: 'Identificación de sustancias catalogadas como carcinógenas', peso: 3.0, aplicabilidad: ['60'] },
  { codigo: '4.1.4', ciclo: 'II. HACER', nombre: 'Realización de mediciones ambientales', peso: 4.0, aplicabilidad: ['60'] },

  { codigo: '4.2.1', ciclo: 'II. HACER', nombre: 'Medidas de prevención y control', peso: 2.5, aplicabilidad: ['7', '21', '60'] },
  { codigo: '4.2.2', ciclo: 'II. HACER', nombre: 'Verificación de aplicación de medidas', peso: 2.5, aplicabilidad: ['60'] },
  { codigo: '4.2.3', ciclo: 'II. HACER', nombre: 'Elaboración de procedimientos e instructivos', peso: 2.5, aplicabilidad: ['60'] },
  { codigo: '4.2.4', ciclo: 'II. HACER', nombre: 'Inspecciones', peso: 2.5, aplicabilidad: ['21', '60'] },
  { codigo: '4.2.5', ciclo: 'II. HACER', nombre: 'Mantenimiento periódico', peso: 2.5, aplicabilidad: ['60'] },
  { codigo: '4.2.6', ciclo: 'II. HACER', nombre: 'Entrega de EPP', peso: 2.5, aplicabilidad: ['60'] },

  { codigo: '5.1.1', ciclo: 'II. HACER', nombre: 'Plan de prevención y respuesta ante emergencias', peso: 5.0, aplicabilidad: ['60'] },
  { codigo: '5.1.2', ciclo: 'II. HACER', nombre: 'Brigada de prevención', peso: 5.0, aplicabilidad: ['60'] },

  // III. VERIFICAR
  { codigo: '6.1.1', ciclo: 'III. VERIFICAR', nombre: 'Definición de indicadores del SG-SST', peso: 1.25, aplicabilidad: ['60'] },
  { codigo: '6.1.2', ciclo: 'III. VERIFICAR', nombre: 'Auditoría de cumplimiento', peso: 1.25, aplicabilidad: ['60'] },
  { codigo: '6.1.3', ciclo: 'III. VERIFICAR', nombre: 'Revisión por la alta dirección', peso: 1.25, aplicabilidad: ['21', '60'] },
  { codigo: '6.1.4', ciclo: 'III. VERIFICAR', nombre: 'Planificación de la auditoría con el COPASST', peso: 1.25, aplicabilidad: ['60'] },

  // IV. ACTUAR
  { codigo: '7.1.1', ciclo: 'IV. ACTUAR', nombre: 'Acciones preventivas y correctivas', peso: 2.5, aplicabilidad: ['60'] },
  { codigo: '7.1.2', ciclo: 'IV. ACTUAR', nombre: 'Acciones de mejora (Revisión Dirección)', peso: 2.5, aplicabilidad: ['60'] },
  { codigo: '7.1.3', ciclo: 'IV. ACTUAR', nombre: 'Acciones de mejora (investigaciones)', peso: 2.5, aplicabilidad: ['60'] },
  { codigo: '7.1.4', ciclo: 'IV. ACTUAR', nombre: 'Plan de mejoramiento', peso: 2.5, aplicabilidad: ['60'] }
];
