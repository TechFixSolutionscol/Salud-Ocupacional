/**
 * SG-SST Management System - Test Data Generator
 * Use this to populate the system with sample data for testing
 */

// ============================================
// SAMPLE DATA GENERATOR
// ============================================

/**
 * Generate all sample data
 */
function generateSampleData() {
  try {
    Logger.log('Starting sample data generation...');
    
    // Create sample companies
    const empresas = createSampleEmpresas();
    Logger.log(`Created ${empresas.length} sample companies`);
    
    // Create sample employees for each company
    let totalEmpleados = 0;
    for (const empresa of empresas) {
      const empleados = createSampleEmpleados(empresa.empresa_id);
      totalEmpleados += empleados.length;
    }
    Logger.log(`Created ${totalEmpleados} sample employees`);
    
    // Create sample documents
    let totalDocumentos = 0;
    for (const empresa of empresas) {
      const documentos = createSampleDocumentos(empresa.empresa_id);
      totalDocumentos += documentos.length;
    }
    Logger.log(`Created ${totalDocumentos} sample documents`);
    
    // Create sample processes (Phase 8)
    let totalProcesos = 0;
    const procesosMap = {};
    for (const empresa of empresas) {
       const procesos = createSampleProcesos(empresa.empresa_id);
       procesosMap[empresa.empresa_id] = procesos;
       totalProcesos += procesos.length;
    }
    Logger.log(`Created ${totalProcesos} sample processes`);

    // Create sample GTC 45 risks (Phase 8)
    let totalRiesgos = 0;
    for (const empresa of empresas) {
       if (procesosMap[empresa.empresa_id]) {
         const riesgos = createSampleRiesgos(empresa.empresa_id, procesosMap[empresa.empresa_id]);
         totalRiesgos += riesgos.length;
       }
    }
    Logger.log(`Created ${totalRiesgos} sample risks`);
    
    Logger.log('Sample data generation complete!');
    return { success: true, message: 'Sample data generated successfully' };
    
  } catch (error) {
    Logger.log('Error generating sample data: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Create sample processes
 */
function createSampleProcesos(empresaId) {
    const procesos = [
        { nombre: 'Dirección Estratégica', tipo_proceso: 'Estratégico' },
        { nombre: 'Gestión Comercial', tipo_proceso: 'Misional' },
        { nombre: 'Operaciones', tipo_proceso: 'Misional' },
        { nombre: 'Talento Humano', tipo_proceso: 'Apoyo' },
        { nombre: 'Compras', tipo_proceso: 'Apoyo' }
    ];

    const created = [];
    for (const proc of procesos) {
        const data = {
            ...proc,
            empresa_id: empresaId,
            descripcion: 'Proceso de prueba'
        };
        const result = createProceso(data);
        if (result.success) created.push(result.data);
    }
    return created;
}

/**
 * Create sample risks (GTC 45)
 */
function createSampleRiesgos(empresaId, procesos) {
    if (!procesos || procesos.length === 0) return [];

    const riesgos = [
        { 
            actividad: 'Trabajo en alturas', 
            peligro_descripcion: 'Caída a diferente nivel', 
            peligro_clasificacion: 'Condiciones de Seguridad',
            nivel_deficiencia: '6', // Alto
            nivel_exposicion: '3', // Frecuente
            nivel_consecuencia: '60' // Muy Grave
        },
        { 
            actividad: 'Uso de computador', 
            peligro_descripcion: 'Postura prolongada', 
            peligro_clasificacion: 'Biomecánico',
            nivel_deficiencia: '2', // Medio
            nivel_exposicion: '4', // Continua
            nivel_consecuencia: '10' // Leve
        }
    ];

    const created = [];
    for (const r of riesgos) {
        // Assign random process
        const proceso = procesos[Math.floor(Math.random() * procesos.length)];
        
        const data = {
            ...r,
            empresa_id: empresaId,
            proceso_id: proceso.proceso_id,
            zona_lugar: 'Planta Principal',
            tarea: 'Mantenimiento',
            rutinario: 'Si',
            efectos_posibles: 'Traumas, politraumatismos',
            controles_existentes_fuente: 'Ninguno',
            controles_existentes_medio: 'Señalización',
            controles_existentes_individuo: 'Arnés, Casco'
        };
        
        const result = createRiesgo(data);
        if (result.success) created.push(result.data);
    }
    return created;
}

// ... existing code ...

/**
 * Validate system integrity
 */
function validateSystemIntegrity() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    passed: 0,
    failed: 0
  };
  
  // Check 1: Sheet structure
  try {
    const sheets = [
        'empresas', 'empleados', 'documentos_sst', 'alertas', 'acciones', 'usuarios',
        'procesos', 'matriz_riesgos_gtc45', 'plan_intervencion', 'investigaciones_accidentes', 'capacitaciones',
        'auditorias'
    ];
    for (const sheetName of sheets) {
      const sheet = getSheet(sheetName);
      if (sheet) {
        results.checks.push({ name: `Sheet ${sheetName} exists`, status: 'PASS' });
        results.passed++;
      } else {
        results.checks.push({ name: `Sheet ${sheetName} exists`, status: 'FAIL' });
        results.failed++;
      }
    }
  } catch (e) {
    results.checks.push({ name: 'Sheet structure', status: 'FAIL', error: e.message });
    results.failed++;
  }
  
  // Check 2: Data consistency - Empleados have valid empresa_id
  try {
    const empleados = getSheetData(SHEETS.EMPLEADOS);
    const empresaIds = getSheetData(SHEETS.EMPRESAS).map(e => e.empresa_id);
    
    const orphanedEmpleados = empleados.filter(e => !empresaIds.includes(e.empresa_id));
    if (orphanedEmpleados.length === 0) {
      results.checks.push({ name: 'Empleados FK integrity', status: 'PASS' });
      results.passed++;
    } else {
      results.checks.push({ name: 'Empleados FK integrity', status: 'WARN', 
        message: `${orphanedEmpleados.length} orphaned records` });
    }
  } catch (e) {
    results.checks.push({ name: 'Empleados FK integrity', status: 'FAIL', error: e.message });
    results.failed++;
  }
  
  // Check 3: Document status calculation
  try {
    const documentos = getSheetData(SHEETS.DOCUMENTOS_SST);
    let incorrectStatus = 0;
    
    for (const doc of documentos) {
      const calculatedStatus = calculateDocumentStatus(doc.fecha_vencimiento);
      if (doc.estado !== calculatedStatus) {
        incorrectStatus++;
      }
    }
    
    if (incorrectStatus === 0) {
      results.checks.push({ name: 'Document status accurate', status: 'PASS' });
      results.passed++;
    } else {
      results.checks.push({ name: 'Document status accurate', status: 'WARN', 
        message: `${incorrectStatus} documents need status update` });
    }
  } catch (e) {
    results.checks.push({ name: 'Document status', status: 'FAIL', error: e.message });
    results.failed++;
  }
  
  // Check 4: Alerts for expired/expiring documents
  try {
    const docsExpiring = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, {})
      .filter(d => ['vencido', 'por_vencer'].includes(calculateDocumentStatus(d.fecha_vencimiento)));
    
    const alertasDoc = getSheetDataFiltered(SHEETS.ALERTAS, { referencia_tipo: 'documentos' });
    
    const uncoveredDocs = docsExpiring.filter(d => 
      !alertasDoc.some(a => a.referencia_id === d.documento_id && a.estado === 'pendiente')
    );
    
    if (uncoveredDocs.length === 0) {
      results.checks.push({ name: 'Alerts coverage', status: 'PASS' });
      results.passed++;
    } else {
      results.checks.push({ name: 'Alerts coverage', status: 'INFO', 
        message: `${uncoveredDocs.length} docs without alerts (run generarAlertas)` });
    }
  } catch (e) {
    results.checks.push({ name: 'Alerts coverage', status: 'FAIL', error: e.message });
    results.failed++;
  }
  
  // Summary
  results.summary = `${results.passed} passed, ${results.failed} failed, ${results.checks.length} total`;
  
  Logger.log(JSON.stringify(results, null, 2));
  return results;
}

/**
 * Create sample companies
 */
function createSampleEmpresas() {
  const empresas = [
    {
      nombre: 'Constructora ABC S.A.S',
      nit: '900123456-7',
      direccion: 'Calle 100 # 15-20, Bogotá',
      telefono: '3001234567',
      email: 'info@constructoraabc.com',
      representante_legal: 'Juan Carlos Rodríguez',
      responsable_sst: 'María Elena García'
    },
    {
      nombre: 'Industrias Metálicas del Norte',
      nit: '800789012-3',
      direccion: 'Carrera 45 # 80-15, Medellín',
      telefono: '3109876543',
      email: 'contacto@metalicasnorte.com',
      representante_legal: 'Pedro Antonio López',
      responsable_sst: 'Ana María Sánchez'
    },
    {
      nombre: 'Servicios Logísticos Express',
      nit: '901456789-0',
      direccion: 'Avenida 68 # 22-45, Cali',
      telefono: '3205551234',
      email: 'operaciones@logisticaexpress.co',
      representante_legal: 'Carlos Alberto Martínez',
      responsable_sst: 'Laura Patricia Gómez'
    }
  ];
  
  const created = [];
  for (const emp of empresas) {
    const result = createEmpresa(emp);
    if (result.success) {
      created.push(result.data);
    }
  }
  
  return created;
}

/**
 * Create sample employees for a company
 */
function createSampleEmpleados(empresaId) {
  const empleados = [
    { nombre: 'Roberto Hernández', cedula: '1023456789', cargo: 'Gerente de Operaciones', area: 'Operaciones' },
    { nombre: 'Sandra Milena Torres', cedula: '1034567890', cargo: 'Coordinador SST', area: 'SST' },
    { nombre: 'Andrés Felipe Ruiz', cedula: '1045678901', cargo: 'Operario', area: 'Producción' },
    { nombre: 'Diana Carolina Vargas', cedula: '1056789012', cargo: 'Asistente Administrativo', area: 'Administración' },
    { nombre: 'Jorge Enrique Mejía', cedula: '1067890123', cargo: 'Supervisor', area: 'Producción' }
  ];
  
  const created = [];
  for (const emp of empleados) {
    const data = {
      ...emp,
      empresa_id: empresaId,
      telefono: '300' + Math.floor(Math.random() * 9000000 + 1000000),
      email: emp.nombre.toLowerCase().replace(/ /g, '.') + '@empresa.com',
      fecha_ingreso: formatDate(new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2)),
      tipo_contrato: ['Indefinido', 'Fijo', 'Obra o Labor'][Math.floor(Math.random() * 3)]
    };
    
    const result = createEmpleado(data);
    if (result.success) {
      created.push(result.data);
    }
  }
  
  return created;
}

/**
 * Create sample documents for a company
 */
function createSampleDocumentos(empresaId) {
  const today = new Date();
  
  const documentos = [
    // Vigente (expires in 6 months)
    { tipo_documento: 'POL_SST', nombre: 'Política de Seguridad y Salud en el Trabajo 2024', 
      fecha_emision: formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
      fecha_vencimiento: formatDate(new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000)) },
    
    // Vigente (expires in 3 months)
    { tipo_documento: 'PLAN_ANUAL', nombre: 'Plan Anual de Trabajo SST 2024', 
      fecha_emision: formatDate(new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)),
      fecha_vencimiento: formatDate(new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)) },
    
    // Por vencer (expires in 15 days)
    { tipo_documento: 'MATRIZ_RIESGOS', nombre: 'Matriz de Identificación de Peligros y Valoración de Riesgos', 
      fecha_emision: formatDate(new Date(today.getTime() - 350 * 24 * 60 * 60 * 1000)),
      fecha_vencimiento: formatDate(new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000)) },
    
    // Vencido (expired 10 days ago)
    { tipo_documento: 'PLAN_EMERGENCIAS', nombre: 'Plan de Emergencias y Contingencias', 
      fecha_emision: formatDate(new Date(today.getTime() - 380 * 24 * 60 * 60 * 1000)),
      fecha_vencimiento: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)) },
    
    // Recent training
    { tipo_documento: 'CAPACITACION', nombre: 'Capacitación en Trabajo en Alturas', 
      fecha_emision: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
      fecha_vencimiento: formatDate(new Date(today.getTime() + 360 * 24 * 60 * 60 * 1000)) },
    
    // COPASST
    { tipo_documento: 'ACTA_COPASST', nombre: 'Acta COPASST Enero 2024', 
      fecha_emision: formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
      fecha_vencimiento: formatDate(new Date(today.getTime() + 330 * 24 * 60 * 60 * 1000)) }
  ];
  
  const created = [];
  for (const doc of documentos) {
    const data = {
      ...doc,
      empresa_id: empresaId,
      descripcion: 'Documento generado para pruebas del sistema',
      responsable: 'Coordinador SST',
      url_documento: 'https://drive.google.com/file/d/sample',
      observaciones: ''
    };
    
    const result = createDocumento(data);
    if (result.success) {
      created.push(result.data);
    }
  }
  
  return created;
}

/**
 * Create sample users
 */
function createSampleUsuarios(empresaId) {
  const usuarios = [
    { nombre: 'Administrador Sistema', email: 'admin@sgsst.local', rol: 'admin', empresa_id: '', password: '123456' },
    { nombre: 'Operador Empresa', email: 'operador@sgsst.local', rol: 'operador', empresa_id: empresaId, password: '123456' },
    { nombre: 'Usuario Consulta', email: 'consulta@sgsst.local', rol: 'consulta', empresa_id: empresaId, password: '123456' }
  ];
  
  const created = [];
  for (const user of usuarios) {
    const result = createUsuario(user);
    if (result.success) {
      created.push(result.data);
    }
  }
  
  return created;
}

// ============================================
// SYSTEM VALIDATION
// ============================================

/**
 * Validate system integrity
 */
function validateSystemIntegrity() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    passed: 0,
    failed: 0
  };
  
  // Check 1: Sheet structure
  try {
    const sheets = ['empresas', 'empleados', 'documentos_sst', 'alertas', 'acciones', 'usuarios'];
    for (const sheetName of sheets) {
      const sheet = getSheet(sheetName);
      if (sheet) {
        results.checks.push({ name: `Sheet ${sheetName} exists`, status: 'PASS' });
        results.passed++;
      } else {
        results.checks.push({ name: `Sheet ${sheetName} exists`, status: 'FAIL' });
        results.failed++;
      }
    }
  } catch (e) {
    results.checks.push({ name: 'Sheet structure', status: 'FAIL', error: e.message });
    results.failed++;
  }
  
  // Check 2: Data consistency - Empleados have valid empresa_id
  try {
    const empleados = getSheetData(SHEETS.EMPLEADOS);
    const empresaIds = getSheetData(SHEETS.EMPRESAS).map(e => e.empresa_id);
    
    const orphanedEmpleados = empleados.filter(e => !empresaIds.includes(e.empresa_id));
    if (orphanedEmpleados.length === 0) {
      results.checks.push({ name: 'Empleados FK integrity', status: 'PASS' });
      results.passed++;
    } else {
      results.checks.push({ name: 'Empleados FK integrity', status: 'WARN', 
        message: `${orphanedEmpleados.length} orphaned records` });
    }
  } catch (e) {
    results.checks.push({ name: 'Empleados FK integrity', status: 'FAIL', error: e.message });
    results.failed++;
  }
  
  // Check 3: Document status calculation
  try {
    const documentos = getSheetData(SHEETS.DOCUMENTOS_SST);
    let incorrectStatus = 0;
    
    for (const doc of documentos) {
      const calculatedStatus = calculateDocumentStatus(doc.fecha_vencimiento);
      if (doc.estado !== calculatedStatus) {
        incorrectStatus++;
      }
    }
    
    if (incorrectStatus === 0) {
      results.checks.push({ name: 'Document status accurate', status: 'PASS' });
      results.passed++;
    } else {
      results.checks.push({ name: 'Document status accurate', status: 'WARN', 
        message: `${incorrectStatus} documents need status update` });
    }
  } catch (e) {
    results.checks.push({ name: 'Document status', status: 'FAIL', error: e.message });
    results.failed++;
  }
  
  // Check 4: Alerts for expired/expiring documents
  try {
    const docsExpiring = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, {})
      .filter(d => ['vencido', 'por_vencer'].includes(calculateDocumentStatus(d.fecha_vencimiento)));
    
    const alertasDoc = getSheetDataFiltered(SHEETS.ALERTAS, { referencia_tipo: 'documentos' });
    
    const uncoveredDocs = docsExpiring.filter(d => 
      !alertasDoc.some(a => a.referencia_id === d.documento_id && a.estado === 'pendiente')
    );
    
    if (uncoveredDocs.length === 0) {
      results.checks.push({ name: 'Alerts coverage', status: 'PASS' });
      results.passed++;
    } else {
      results.checks.push({ name: 'Alerts coverage', status: 'INFO', 
        message: `${uncoveredDocs.length} docs without alerts (run generarAlertas)` });
    }
  } catch (e) {
    results.checks.push({ name: 'Alerts coverage', status: 'FAIL', error: e.message });
    results.failed++;
  }
  
  // Summary
  results.summary = `${results.passed} passed, ${results.failed} failed, ${results.checks.length} total`;
  
  Logger.log(JSON.stringify(results, null, 2));
  return results;
}

/**
 * Clear all test data (USE WITH CAUTION)
 */
function clearAllTestData() {
  const confirmation = 'DELETE_ALL_DATA';
  
  // This function requires manual confirmation
  Logger.log('WARNING: This will delete ALL data from all sheets!');
  Logger.log('To proceed, call clearAllTestDataConfirmed()');
  
  return { success: false, message: 'Confirmation required. Call clearAllTestDataConfirmed()' };
}

function clearAllTestDataConfirmed() {
  try {
    const sheets = ['empresas', 'empleados', 'documentos_sst', 'alertas', 'acciones', 'usuarios'];
    
    for (const sheetName of sheets) {
      const sheet = getSheet(sheetName);
      if (sheet) {
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          sheet.deleteRows(2, lastRow - 1);
        }
      }
    }
    
    Logger.log('All test data cleared');
    return { success: true, message: 'All data cleared' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}
