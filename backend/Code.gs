/**
 * SG-SST Management System - Main Entry Point
 * Google Apps Script Backend
 * 
 * @author SG-SST System
 * @version 1.0.0
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  SPREADSHEET_ID: '', // Set your Google Sheets ID here
  DRIVE_FOLDER_ID: '', // Set your Google Drive folder ID for documents
  DAYS_BEFORE_EXPIRY_ALERT: 30,
  VERSION: '1.0.0'
};

// Sheet names
const SHEETS = {
  EMPRESAS: 'empresas',
  EMPLEADOS: 'empleados',
  DOCUMENTOS_SST: 'documentos_sst',
  ALERTAS: 'alertas',
  ACCIONES: 'acciones',
  USUARIOS: 'usuarios',
  // Phase 8 Tables
  PROCESOS: 'procesos',
  MATRIZ_RIESGOS: 'matriz_riesgos_gtc45',
  PLAN_INTERVENCION: 'plan_intervencion',
  INVESTIGACIONES: 'investigaciones_accidentes',
  CAPACITACIONES: 'capacitaciones',
  AUDITORIAS: 'auditorias',
  CUMPLIMIENTO: 'cumplimiento_estandares'
};

// ============================================
// WEB APP ENTRY POINTS
// ============================================

/**
 * Handles GET requests - serves the frontend
 */
/**
 * Handles GET requests - serves the frontend
 * Can handle auto-login via query params
 */
/**
 * Handles GET requests - Supports JSONP for Local Frontend & HTML for Web App
 */
function doGet(e) {
  // Fix for manual execution in editor (where e is undefined)
  if (!e) e = { parameter: {} };

  // 1. JSONP API Mode (For Local Frontend via <script> tags)
  if (e.parameter && e.parameter.callback && e.parameter.payload) {
    try {
      var callback = e.parameter.callback;
      var requestData = JSON.parse(e.parameter.payload);
      
      // Execute Internal Logic
      var result = apiDispatcher(requestData);
      
      // Return Executable Javascript: callback({ ...data... });
      var jsOutput = callback + '(' + JSON.stringify(result) + ');';
      
      return ContentService.createTextOutput(jsOutput)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } catch (error) {
       var errorOutput = e.parameter.callback + '(' + JSON.stringify({success: false, error: error.message}) + ');';
       return ContentService.createTextOutput(errorOutput).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }

  // 2. Standard HTML Mode (Direct Cloud Access)
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('SG-SST Management System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Internal API Dispatcher for google.script.run
 * Use this function for client-side calls
 */
function apiDispatcher(request) {
  return handleApiRequest(request);
}

/**
 * Handles EXTERNAL POST requests (HTTP)
 * Only for external integrations (Webhook, Postman, etc.)
 */
function doPost(e) {
  try {
    // Strict check for HTTP context
    if (!e || !e.postData) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false, 
        error: 'Invalid HTTP Request'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = JSON.parse(e.postData.contents);
    const result = handleApiRequest(data);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      error: 'Server Error: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Central API Dispatcher
 */
function handleApiRequest(data) {
  try {
    const action = data.action;
    const params = data.params || {};
    
    let result;
    
    switch(action) {
      // Empresas
      case 'getEmpresas': result = getEmpresas(params); break;
      case 'getEmpresa': result = getEmpresaById(params.id); break;
      case 'createEmpresa': result = createEmpresa(params); break;
      case 'updateEmpresa': result = updateEmpresa(params); break;
      case 'deleteEmpresa': result = deleteEmpresa(params.id); break;
      
      // Empleados
      case 'getEmpleados': result = getEmpleados(params); break;
      case 'getEmpleado': result = getEmpleadoById(params.id); break;
      case 'createEmpleado': result = createEmpleado(params); break;
      case 'updateEmpleado': result = updateEmpleado(params); break;
      case 'deleteEmpleado': result = deleteEmpleado(params.id); break;
      
      // Documentos SST
      case 'getDocumentos': result = getDocumentos(params); break;
      case 'getDocumento': result = getDocumentoById(params.id); break;
      case 'createDocumento': result = createDocumento(params); break;
      case 'updateDocumento': result = updateDocumento(params); break;
      case 'deleteDocumento': result = deleteDocumento(params.id); break;
      
      // Alertas
      case 'getAlertas': result = getAlertas(params); break;
      case 'updateAlerta': result = updateAlerta(params); break;
      case 'generarAlertas': result = generarAlertas(params.empresaId); break;
      
      // Acciones
      case 'getAcciones': result = getAcciones(params); break;
      case 'registrarAccion': result = registrarAccion(params); break;
      
      // Usuarios
      case 'getUsuarios': result = getUsuarios(params); break;
      case 'loginUsuario': result = loginUsuario(params.email, params.password); break;
      case 'validateSession': result = validateSession(params.token); break;
      case 'logoutUsuario': result = logoutUsuario(params.token); break;
      case 'createUsuario': result = createUsuario(params); break;
      case 'updateUsuario': result = updateUsuario(params); break;
      case 'deleteUsuario': result = deleteUsuario(params.id); break;
      
      // Phase 8 Routes
      
      // Procesos
      case 'getProcesos': result = getProcesos(params.empresaId); break;
      case 'createProceso': result = createProceso(params); break;
      case 'updateProceso': result = updateProceso(params); break;
      case 'deleteProceso': result = deleteProceso(params.id); break;
      
      // GTC 45 Risk Matrix
      case 'getMatrizRiesgos': result = getMatrizRiesgos(params.empresaId); break;
      case 'getRiesgoById': result = getRiesgoById(params.riesgo_id); break;
      case 'createRiesgo': result = createRiesgo(params); break;
      case 'updateRiesgo': result = updateRiesgo(params); break;
      case 'deleteRiesgo': result = deleteRiesgo(params.riesgo_id); break;
      
      // Planes de Intervención
      case 'getPlanesIntervencion': result = getPlanesIntervencion(params.empresaId); break;
      case 'createPlanIntervencion': result = createPlanIntervencion(params); break;
      case 'updatePlanIntervencion': result = updatePlanIntervencion(params); break;
      
      // Accidentes
      case 'getAccidentes': result = getAccidentes(params.empresaId); break;
      case 'createAccidente': result = createAccidente(params); break;
      case 'updateAccidente': result = updateAccidente(params); break;
      
      // Capacitaciones
      case 'getCapacitaciones': result = getCapacitaciones(params.empresaId); break;
      case 'createCapacitacion': result = createCapacitacion(params); break;
      case 'updateCapacitacion': result = updateCapacitacion(params); break;

      // Auditorias
      case 'getAuditorias': result = getAuditorias(params.empresaId); break;
       case 'createAuditoria': result = createAuditoria(params); break;
      case 'updateAuditoria': result = updateAuditoria(params); break;
      
      // Compliance (Phase 2)
      case 'getEstandares': result = getEstandares(params.empresaId); break;
      case 'updateEstandar': result = updateEstandar(params); break;
      
      // Dashboard
      case 'getDashboardData': result = getDashboardData(params.empresaId); break;
      case 'getReporteAuditoriaCompleta': result = getReporteAuditoriaCompleta(params.empresaId); break;
      
      // System & Automation (Phase 9)
      case 'initializeSystem': result = initializeSystem(); break;
      case 'generateSystemDocument': result = generateSystemDocument(params.empresaId, params.docType); break;
      case 'verificarCumplimientoDecreto1072': result = verificarCumplimientoDecreto1072(params.empresaId); break;
      
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
    
    return result;
      
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// SYSTEM INITIALIZATION
// ============================================

/**
 * Initialize the system - creates all required sheets with headers
 */
function initializeSystem() {
  try {
    const ss = getSpreadsheet();
    
    // Define headers for each sheet
    const sheetsConfig = {
      [SHEETS.EMPRESAS]: [
        'empresa_id', 'nombre', 'nit', 'direccion', 'telefono', 'email',
        'representante_legal', 'responsable_sst', 'estado', 'fecha_registro',
        'nivel_riesgo', 'numero_trabajadores', 'clasificacion_tipo'
      ],
      [SHEETS.EMPLEADOS]: [
        'empleado_id', 'empresa_id', 'nombre', 'cedula', 'cargo', 'area',
        'telefono', 'email', 'fecha_ingreso', 'estado', 'tipo_contrato'
      ],
      [SHEETS.DOCUMENTOS_SST]: [
        'documento_id', 'empresa_id', 'tipo_documento', 'nombre', 'descripcion',
        'fecha_emision', 'fecha_vencimiento', 'estado', 'responsable', 
        'url_documento', 'observaciones', 'version', 'fecha_revision', 'fuente_datos', 'proceso_id', 'riesgo_id'
      ],
      [SHEETS.ALERTAS]: [
        'alerta_id', 'empresa_id', 'tipo_alerta', 'referencia_tipo', 'referencia_id',
        'mensaje', 'fecha_alerta', 'fecha_limite', 'prioridad', 'estado', 'responsable'
      ],
      [SHEETS.ACCIONES]: [
        'accion_id', 'alerta_id', 'empresa_id', 'tipo_accion', 'descripcion',
        'fecha', 'usuario_id', 'evidencia'
      ],
      [SHEETS.USUARIOS]: [
        'usuario_id', 'nombre', 'email', 'password_hash', 'rol', 'empresa_id', 
        'estado', 'fecha_registro', 'session_token', 'session_expiry'
      ],
      // Phase 8 Sheets
      [SHEETS.PROCESOS]: [
        'proceso_id', 'empresa_id', 'nombre', 'tipo_proceso', 'descripcion', 
        'responsable', 'estado'
      ],
      [SHEETS.MATRIZ_RIESGOS]: [
        'riesgo_id', 'empresa_id', 'proceso_id', 'actividad', 'zona_lugar', 'tarea', 'rutinario', 
        'peligro_descripcion', 'peligro_clasificacion', 'efectos_posibles', 
        'controles_existentes_fuente', 'controles_existentes_medio', 'controles_existentes_individuo', 
        'nivel_deficiencia', 'nivel_exposicion', 'nivel_probabilidad', 'interpretacion_np', 
        'nivel_consecuencia', 'nivel_riesgo', 'interpretacion_nr', 'aceptabilidad', 
        'medidas_intervencion', 'fecha_evaluacion', 'fecha_proxima_revision', 'estado'
      ],
      [SHEETS.PLAN_INTERVENCION]: [
        'plan_id', 'riesgo_id', 'empresa_id', 'actividad_intervencion', 'responsable', 
        'fecha_propuesta', 'fecha_cierre', 'riesgo_residual_nr', 'observaciones', 'estado'
      ],
      [SHEETS.INVESTIGACIONES]: [
        'investigacion_id', 'empresa_id', 'empleado_id', 'fecha_accidente', 'tipo_evento', 
        'descripcion', 'causas', 'plan_accion', 'estado', 'fecha_registro', 'riesgo_id'
      ],
      [SHEETS.CAPACITACIONES]: [
        'capacitacion_id', 'empresa_id', 'tema', 'fecha_programada', 'tipo', 
        'asistentes', 'estado', 'observaciones', 'fecha_registro', 'riesgo_id'
      ],
      [SHEETS.AUDITORIAS]: [
        'auditoria_id', 'empresa_id', 'tipo', 'fecha_programada', 'fecha_ejecucion', 
        'auditor', 'alcance', 'hallazgos', 'estado', 'fecha_registro'
      ],
      [SHEETS.CUMPLIMIENTO]: [
        'cumplimiento_id', 'empresa_id', 'codigo_estandar', 'estado', // estado: CUMPLE, NO_CUMPLE, NO_APLICA
        'observacion', 'evidencia_doc_id', 'plan_accion_id', 'fecha_verificacion', 'usuario_verificador'
      ]
    };
    
    // Create each sheet if it doesn't exist
    for (const [sheetName, headers] of Object.entries(sheetsConfig)) {
      let sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length)
          .setBackground('#1a1a2e')
          .setFontColor('#ffffff')
          .setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
    }
    
    // Create default admin user if usuarios sheet is empty
    try {
      const usuariosSheet = ss.getSheetByName(SHEETS.USUARIOS);
      const data = usuariosSheet.getDataRange().getValues();
      
      // If only header row exists (length = 1), create default admin
      if (data.length <= 1) {
        Logger.log('Creating default admin user...');
        const defaultAdmin = {
          email: 'admin@sgsst.com',
          password: 'admin123',
          nombre: 'Administrador del Sistema',
          rol: 'admin',
          empresa_id: '' // No empresa específica - acceso total
        };
        
        const adminResult = createUsuario(defaultAdmin);
        if (adminResult.success) {
          Logger.log('✅ Default admin user created successfully');
          Logger.log('   Email: admin@sgsst.com');
          Logger.log('   Password: admin123');
        }
      }
    } catch (error) {
      Logger.log('Warning: Could not create default admin user: ' + error.message);
    }
    
    return { success: true, message: 'System initialized successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get the main spreadsheet
 */
function getSpreadsheet() {
  // If ID is configured, try to open by ID
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID.trim() !== '') {
    try {
      return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    } catch(e) {
      throw new Error('Error opening spreadsheet by ID: ' + e.message + '. Check CONFIG.SPREADSHEET_ID.');
    }
  }
  
  // Fallback to active spreadsheet (for container-bound scripts)
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('No active spreadsheet found');
    return ss;
  } catch (e) {
    throw new Error('CRITICAL: Spreadsheet not found. Please set CONFIG.SPREADSHEET_ID in Code.gs or run this script as container-bound.');
  }
}

/**
 * Get a specific sheet by name
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found. Please run initializeSystem() first.`);
  }
  return sheet;
}
