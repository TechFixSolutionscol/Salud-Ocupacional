/**
 * SG-SST Management System - Empresas (Companies) Module
 * CRUD operations for companies
 */

// ============================================
// GET OPERATIONS
// ============================================

/**
 * Get all companies with optional filters
 */
function getEmpresas(filters = {}) {
  try {
    const data = getSheetDataFiltered(SHEETS.EMPRESAS, filters);
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get a single company by ID
 */
function getEmpresaById(empresaId) {
  try {
    if (!empresaId) {
      throw new Error('empresa_id is required');
    }
    
    const found = findRowById(SHEETS.EMPRESAS, 'empresa_id', empresaId);
    
    if (!found) {
      return { success: false, error: 'Company not found' };
    }
    
    const empresa = {};
    found.headers.forEach((header, index) => {
      empresa[header] = found.data[index];
    });
    
    return { success: true, data: empresa };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// CREATE OPERATION
// ============================================

/**
 * Create a new company
 */
function createEmpresa(data) {
  try {
    // Validate required fields
    validateRequired(data, ['nombre', 'nit', 'direccion', 'telefono', 'representante_legal', 'responsable_sst']);
    
    // Validate NIT format
    if (!validateNIT(data.nit)) {
      throw new Error('Invalid NIT format. Must be 9-10 digits.');
    }
    
    // Check if NIT already exists
    if (valueExists(SHEETS.EMPRESAS, 'nit', data.nit)) {
      throw new Error('A company with this NIT already exists');
    }
    
    // Validate email if provided
    if (data.email && !validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    // Prepare the record
    const empresa = {
      empresa_id: generateUUID(),
      nombre: data.nombre.trim(),
      nit: data.nit.toString().replace(/[-\s]/g, ''),
      direccion: data.direccion.trim(),
      telefono: data.telefono.trim(),
      email: (data.email || '').trim(),
      representante_legal: data.representante_legal.trim(),
      responsable_sst: data.responsable_sst.trim(),
      responsable_sst: data.responsable_sst.trim(),
      nivel_riesgo: data.nivel_riesgo || '',
      numero_trabajadores: data.numero_trabajadores || 0,
      clasificacion_tipo: data.clasificacion_tipo || '', // E.g., 'ESTANDARES_MINIMOS_7', '...21', '...60'
      estado: 'activo',
      fecha_registro: getCurrentDate()
    };
    
    // Insert the record
    insertRow(SHEETS.EMPRESAS, empresa);
    
    return { success: true, data: empresa, message: 'Company created successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// UPDATE OPERATION
// ============================================

/**
 * Update an existing company
 */
function updateEmpresa(data) {
  try {
    if (!data.empresa_id) {
      throw new Error('empresa_id is required');
    }
    
    // Validate NIT if provided
    if (data.nit) {
      if (!validateNIT(data.nit)) {
        throw new Error('Invalid NIT format. Must be 9-10 digits.');
      }
      
      // Check if NIT exists for another company
      if (valueExists(SHEETS.EMPRESAS, 'nit', data.nit, data.empresa_id, 'empresa_id')) {
        throw new Error('A company with this NIT already exists');
      }
      
      data.nit = data.nit.toString().replace(/[-\s]/g, '');
    }
    
    // Validate email if provided
    if (data.email && !validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    // Validate estado if provided
    if (data.estado && !['activo', 'inactivo'].includes(data.estado)) {
      throw new Error('Invalid estado. Must be "activo" or "inactivo"');
    }
    
    // Update the record
    updateRow(SHEETS.EMPRESAS, 'empresa_id', data.empresa_id, data);
    
    return { success: true, message: 'Company updated successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// DELETE OPERATION
// ============================================

/**
 * Delete a company (soft delete - set status to inactive)
 */
function deleteEmpresa(empresaId) {
  try {
    if (!empresaId) {
      throw new Error('empresa_id is required');
    }
    
    // Check if company has active employees
    const empleados = getSheetDataFiltered(SHEETS.EMPLEADOS, { empresa_id: empresaId, estado: 'activo' });
    if (empleados.length > 0) {
      throw new Error('Cannot delete company with active employees. Deactivate employees first.');
    }
    
    // Check if company has pending alerts
    const alertas = getSheetDataFiltered(SHEETS.ALERTAS, { empresa_id: empresaId, estado: 'pendiente' });
    if (alertas.length > 0) {
      throw new Error('Cannot delete company with pending alerts. Resolve alerts first.');
    }
    
    // Soft delete - set status to inactive
    updateRow(SHEETS.EMPRESAS, 'empresa_id', empresaId, { estado: 'inactivo' });
    
    return { success: true, message: 'Company deactivated successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// ADDITIONAL FUNCTIONS
// ============================================

/**
 * Get list of companies for dropdown (id and name only)
 */
function getEmpresasDropdown() {
  try {
    const data = getSheetDataFiltered(SHEETS.EMPRESAS, { estado: 'activo' });
    const dropdown = data.map(e => ({
      value: e.empresa_id,
      label: e.nombre,
      nit: e.nit
    }));
    return { success: true, data: dropdown };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get company statistics
 */
function getEmpresaStats(empresaId) {
  try {
    const empleados = getSheetDataFiltered(SHEETS.EMPLEADOS, { empresa_id: empresaId });
    const documentos = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, { empresa_id: empresaId });
    const alertas = getSheetDataFiltered(SHEETS.ALERTAS, { empresa_id: empresaId });
    
    return {
      success: true,
      data: {
        totalEmpleados: empleados.filter(e => e.estado === 'activo').length,
        totalDocumentos: documentos.length,
        documentosVigentes: documentos.filter(d => d.estado === 'vigente').length,
        documentosVencidos: documentos.filter(d => d.estado === 'vencido').length,
        documentosPorVencer: documentos.filter(d => d.estado === 'por_vencer').length,
        alertasPendientes: alertas.filter(a => a.estado === 'pendiente').length,
        alertasGestionadas: alertas.filter(a => a.estado === 'gestionada').length
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
