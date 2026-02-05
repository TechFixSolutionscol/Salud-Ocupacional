/**
 * SG-SST Management System - Empleados (Employees) Module
 * CRUD operations for employees
 */

// ============================================
// GET OPERATIONS
// ============================================

/**
 * Get all employees with optional filters
 */
function getEmpleados(filters = {}) {
  try {
    const data = getSheetDataFiltered(SHEETS.EMPLEADOS, filters);
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get employees by company
 */
function getEmpleadosByEmpresa(empresaId) {
  try {
    if (!empresaId) {
      throw new Error('empresa_id is required');
    }
    const data = getSheetDataFiltered(SHEETS.EMPLEADOS, { empresa_id: empresaId });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get a single employee by ID
 */
function getEmpleadoById(empleadoId) {
  try {
    if (!empleadoId) {
      throw new Error('empleado_id is required');
    }
    
    const found = findRowById(SHEETS.EMPLEADOS, 'empleado_id', empleadoId);
    
    if (!found) {
      return { success: false, error: 'Employee not found' };
    }
    
    const empleado = {};
    found.headers.forEach((header, index) => {
      empleado[header] = found.data[index];
    });
    
    return { success: true, data: empleado };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// CREATE OPERATION
// ============================================

/**
 * Create a new employee
 */
function createEmpleado(data) {
  try {
    // Validate required fields
    validateRequired(data, ['empresa_id', 'nombre', 'cedula', 'cargo', 'fecha_ingreso']);
    
    // Validate empresa exists
    const empresa = getEmpresaById(data.empresa_id);
    if (!empresa.success) {
      throw new Error('Company not found');
    }
    
    // Validate cedula format
    if (!validateCedula(data.cedula)) {
      throw new Error('Invalid cedula format');
    }
    
    // Check if cedula already exists in the same company
    const existingEmpleados = getSheetDataFiltered(SHEETS.EMPLEADOS, { empresa_id: data.empresa_id });
    const cedulaExists = existingEmpleados.some(e => e.cedula === data.cedula.toString().replace(/[.\s]/g, ''));
    if (cedulaExists) {
      throw new Error('An employee with this cedula already exists in this company');
    }
    
    // Validate email if provided
    if (data.email && !validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    // Prepare the record
    const empleado = {
      empleado_id: generateUUID(),
      empresa_id: data.empresa_id,
      nombre: data.nombre.trim(),
      cedula: data.cedula.toString().replace(/[.\s]/g, ''),
      cargo: data.cargo.trim(),
      area: (data.area || '').trim(),
      telefono: (data.telefono || '').trim(),
      email: (data.email || '').trim(),
      fecha_ingreso: data.fecha_ingreso,
      estado: 'activo',
      tipo_contrato: (data.tipo_contrato || '').trim()
    };
    
    // Insert the record
    insertRow(SHEETS.EMPLEADOS, empleado);
    
    return { success: true, data: empleado, message: 'Employee created successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// UPDATE OPERATION
// ============================================

/**
 * Update an existing employee
 */
function updateEmpleado(data) {
  try {
    if (!data.empleado_id) {
      throw new Error('empleado_id is required');
    }
    
    // Get existing employee
    const existing = getEmpleadoById(data.empleado_id);
    if (!existing.success) {
      throw new Error('Employee not found');
    }
    
    // Validate cedula if changed
    if (data.cedula) {
      if (!validateCedula(data.cedula)) {
        throw new Error('Invalid cedula format');
      }
      
      const cleanCedula = data.cedula.toString().replace(/[.\s]/g, '');
      const empresaId = data.empresa_id || existing.data.empresa_id;
      
      // Check if cedula exists for another employee in the same company
      const existingEmpleados = getSheetDataFiltered(SHEETS.EMPLEADOS, { empresa_id: empresaId });
      const cedulaExists = existingEmpleados.some(e => 
        e.cedula === cleanCedula && e.empleado_id !== data.empleado_id
      );
      
      if (cedulaExists) {
        throw new Error('An employee with this cedula already exists in this company');
      }
      
      data.cedula = cleanCedula;
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
    updateRow(SHEETS.EMPLEADOS, 'empleado_id', data.empleado_id, data);
    
    return { success: true, message: 'Employee updated successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// DELETE OPERATION
// ============================================

/**
 * Delete an employee (soft delete - set status to inactive)
 */
function deleteEmpleado(empleadoId) {
  try {
    if (!empleadoId) {
      throw new Error('empleado_id is required');
    }
    
    // Soft delete - set status to inactive
    updateRow(SHEETS.EMPLEADOS, 'empleado_id', empleadoId, { estado: 'inactivo' });
    
    return { success: true, message: 'Employee deactivated successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// ADDITIONAL FUNCTIONS
// ============================================

/**
 * Get list of employees for dropdown
 */
function getEmpleadosDropdown(empresaId) {
  try {
    const filters = { estado: 'activo' };
    if (empresaId) {
      filters.empresa_id = empresaId;
    }
    
    const data = getSheetDataFiltered(SHEETS.EMPLEADOS, filters);
    const dropdown = data.map(e => ({
      value: e.empleado_id,
      label: `${e.nombre} - ${e.cargo}`,
      cedula: e.cedula
    }));
    
    return { success: true, data: dropdown };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get list of unique areas from employees
 */
function getAreasDropdown(empresaId) {
  try {
    const filters = {};
    if (empresaId) {
      filters.empresa_id = empresaId;
    }
    
    const data = getSheetDataFiltered(SHEETS.EMPLEADOS, filters);
    const areas = [...new Set(data.map(e => e.area).filter(a => a))];
    
    return { success: true, data: areas.sort() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get list of unique cargos from employees
 */
function getCargosDropdown(empresaId) {
  try {
    const filters = {};
    if (empresaId) {
      filters.empresa_id = empresaId;
    }
    
    const data = getSheetDataFiltered(SHEETS.EMPLEADOS, filters);
    const cargos = [...new Set(data.map(e => e.cargo).filter(c => c))];
    
    return { success: true, data: cargos.sort() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
