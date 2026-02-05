/**
 * SG-SST - Quick Test Data Generator for Dashboard
 * Run this function from Google Apps Script Editor to populate test data
 */

/**
 * PASO 1: Inicializar el sistema
 * Ejecutar primero para crear todas las hojas
 */
function paso1_inicializarSistema() {
  try {
    const result = initializeSystem();
    Logger.log('✅ Sistema inicializado correctamente');
    Logger.log('Todas las hojas han sido creadas');
    return result;
  } catch (error) {
    Logger.log('❌ Error: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * PASO 2: Crear datos de prueba básicos
 * Ejecutar después de inicializar
 */
function paso2_crearDatosPrueba() {
  try {
    Logger.log('Iniciando creación de datos de prueba...');
    
    // 1. Crear empresa de prueba
    Logger.log('\n1️⃣ Creando empresa...');
    const empresaResult = createEmpresa({
      nombre: 'Empresa Demo SG-SST',
      nit: '900123456-7',
      direccion: 'Calle 123 #45-67, Bogotá',
      telefono: '3001234567',
      email: 'contacto@empresademo.com',
      representante_legal: 'Juan Pérez',
      responsable_sst: 'Carlos Rodríguez'
    });
    
    if (!empresaResult.success) {
      throw new Error('Error creando empresa: ' + empresaResult.error);
    }
    const empresaId = empresaResult.data.empresa_id;
    Logger.log('✅ Empresa creada: ' + empresaId);
    
    // 2. Crear empleados
    Logger.log('\n2️⃣ Creando empleados...');
    const empleados = [
      { nombre: 'María García', cargo: 'Gerente General', tipo_contrato: 'Indefinido' },
      { nombre: 'Carlos Rodríguez', cargo: 'Coordinador SST', tipo_contrato: 'Indefinido' },
      { nombre: 'Ana Martínez', cargo: 'Operario', tipo_contrato: 'Fijo' }
    ];
    
    for (const emp of empleados) {
      const result = createEmpleado({
        empresa_id: empresaId,
        ...emp,
        cedula: Math.floor(Math.random() * 100000000).toString(),
        fecha_ingreso: '2024-01-15',
        estado: 'activo'
      });
      if (result.success) {
        Logger.log('  ✓ ' + emp.nombre);
      }
    }
    
    // 3. Crear documentos SST
    Logger.log('\n3️⃣ Creando documentos SST...');
    const hoy = new Date();
    const documentos = [
      {
        tipo_documento: 'POL_SST',
        nombre: 'Política de Seguridad y Salud en el Trabajo',
        fecha_emision: '2024-01-01',
        fecha_vencimiento: new Date(hoy.getFullYear() + 1, hoy.getMonth(), hoy.getDate()).toISOString().split('T')[0],
        responsable: 'Coordinador SST',
        descripcion: 'Política general de SST de la empresa'
      },
      {
        tipo_documento: 'PLAN_ANUAL',
        nombre: 'Plan Anual de Trabajo SST 2024',
        fecha_emision: '2024-01-01',
        fecha_vencimiento: '2024-12-31',
        responsable: 'Coordinador SST',
        descripcion: 'Plan de trabajo anual'
      },
      {
        tipo_documento: 'MATRIZ_RIESGOS',
        nombre: 'Matriz de Identificación de Peligros',
        fecha_emision: '2024-01-01',
        fecha_vencimiento: new Date(hoy.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Vence en 15 días
        responsable: 'Coordinador SST',
        descripcion: 'Matriz de riesgos actualizada'
      },
      {
        tipo_documento: 'REG_HIGIENE',
        nombre: 'Reglamento de Higiene y Seguridad',
        fecha_emision: '2023-06-01',
        fecha_vencimiento: '2024-01-01', // Ya vencido
        responsable: 'Gerente General',
        descripcion: 'Reglamento interno'
      }
    ];
    
    for (const doc of documentos) {
      const result = createDocumento({
        empresa_id: empresaId,
        ...doc
      });
      if (result.success) {
        Logger.log('  ✓ ' + doc.nombre);
      }
    }
    
    // 4. Crear usuario de prueba
    Logger.log('\n4️⃣ Creando usuario admin...');
    const userResult = createUsuario({
      email: 'admin@demo.com',
      password: 'admin123',
      nombre: 'Administrador Demo',
      rol: 'admin',
      empresa_id: empresaId
    });
    
    if (userResult.success) {
      Logger.log('✅ Usuario creado');
      Logger.log('   Email: admin@demo.com');
      Logger.log('   Password: admin123');
    }
    
    Logger.log('\n✅ DATOS DE PRUEBA CREADOS EXITOSAMENTE!');
    Logger.log('\n📊 Resumen:');
    Logger.log('   - 1 Empresa');
    Logger.log('   - 3 Empleados');
    Logger.log('   - 4 Documentos (1 vigente, 1 por vencer, 1 vencido)');
    Logger.log('   - 1 Usuario admin');
    Logger.log('\n🔑 Credenciales de acceso:');
    Logger.log('   Email: admin@demo.com');
    Logger.log('   Password: admin123');
    
    return { success: true, empresaId: empresaId };
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * PASO 3: Verificar datos creados
 */
function paso3_verificarDatos() {
  try {
    Logger.log('Verificando datos...\n');
    
    const empresas = getSheetDataFiltered(SHEETS.EMPRESAS, {});
    Logger.log('✅ Empresas: ' + empresas.length);
    
    const empleados = getSheetDataFiltered(SHEETS.EMPLEADOS, {});
    Logger.log('✅ Empleados: ' + empleados.length);
    
    const documentos = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, {});
    Logger.log('✅ Documentos: ' + documentos.length);
    
    const usuarios = getSheetDataFiltered(SHEETS.USUARIOS, {});
    Logger.log('✅ Usuarios: ' + usuarios.length);
    
    if (empresas.length > 0) {
      Logger.log('\n📊 Probando Dashboard...');
      const dashResult = getDashboardData(empresas[0].empresa_id);
      if (dashResult.success) {
        Logger.log('✅ Dashboard funciona correctamente');
        Logger.log('   Stats: ' + JSON.stringify(dashResult.data.stats, null, 2));
      } else {
        Logger.log('❌ Error en Dashboard: ' + dashResult.error);
      }
    }
    
    return { success: true };
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * PASO 4: Limpiar todos los datos (CUIDADO!)
 */
function paso4_limpiarDatos() {
  try {
    clearAllData();
    Logger.log('✅ Todos los datos han sido eliminados');
    return { success: true };
  } catch (error) {
    Logger.log('❌ Error: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * ABRIR PANEL DE ADMINISTRACIÓN
 * Ejecutar esta función para abrir la interfaz gráfica
 */
function abrirPanelAdmin() {
  const html = HtmlService.createHtmlOutputFromFile('AdminPanel')
    .setWidth(950)
    .setHeight(700)
    .setTitle('SG-SST - Panel de Administración');
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Panel de Administración SG-SST');
}

/**
 * Agregar menú personalizado al abrir el Spreadsheet
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🛡️ SG-SST Admin')
    .addItem('📊 Panel de Administración', 'abrirPanelAdmin')
    .addSeparator()
    .addItem('🚀 Paso 1: Inicializar Sistema', 'paso1_inicializarSistema')
    .addItem('📊 Paso 2: Crear Datos de Prueba', 'paso2_crearDatosPrueba')
    .addItem('🔍 Paso 3: Verificar Datos', 'paso3_verificarDatos')
    .addSeparator()
    .addItem('🗑️ Paso 4: Limpiar Datos', 'paso4_limpiarDatos')
    .addToUi();
}
