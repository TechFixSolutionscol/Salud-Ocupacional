/**
 * SG-SST Management System - Usuarios Module
 * User management and access control
 */

// Role constants
const USER_ROLES = {
  ADMIN: 'Administrador global',
  OPERADOR: 'Operador de empresa',
  CONSULTA: 'Solo consulta'
};

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Login user with email and password
 */
function loginUsuario(email, password) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email y contraseña son requeridos' };
    }
    
    // Find user by email
    const usuarios = getSheetDataFiltered(SHEETS.USUARIOS, {});
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!usuario) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    if (usuario.estado !== 'activo') {
      return { success: false, error: 'Usuario inactivo. Contacte al administrador.' };
    }
    
    // Verify password (simple hash comparison)
    const hashedInput = hashPassword(password);
    if (usuario.password_hash !== hashedInput) {
      return { success: false, error: 'Contraseña incorrecta' };
    }
    
    // Create session token
    const sessionToken = generateSessionToken();
    const expiry = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
    
    // Store session
    updateRow(SHEETS.USUARIOS, 'usuario_id', usuario.usuario_id, {
      session_token: sessionToken,
      session_expiry: expiry.toISOString()
    });
    
    // Return user data (without sensitive fields)
    return { 
      success: true, 
      data: {
        usuario_id: usuario.usuario_id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        empresa_id: usuario.empresa_id,
        token: sessionToken
      },
      message: 'Login exitoso'
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Validate session token
 */
function validateSession(token) {
  try {
    if (!token) {
      return { success: false, valid: false, error: 'Token requerido' };
    }
    
    const usuarios = getSheetDataFiltered(SHEETS.USUARIOS, {});
    const usuario = usuarios.find(u => u.session_token === token);
    
    if (!usuario) {
      return { success: false, valid: false, error: 'Sesión inválida' };
    }
    
    if (usuario.estado !== 'activo') {
      return { success: false, valid: false, error: 'Usuario inactivo' };
    }
    
    // Check expiry
    const expiry = new Date(usuario.session_expiry);
    if (expiry < new Date()) {
      return { success: false, valid: false, error: 'Sesión expirada' };
    }
    
    return { 
      success: true, 
      valid: true, 
      data: {
        usuario_id: usuario.usuario_id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        empresa_id: usuario.empresa_id
      }
    };
    
  } catch (error) {
    return { success: false, valid: false, error: error.message };
  }
}

/**
 * Logout user
 */
function logoutUsuario(token) {
  try {
    if (!token) {
      return { success: false, error: 'Token requerido' };
    }
    
    const usuarios = getSheetDataFiltered(SHEETS.USUARIOS, {});
    const usuario = usuarios.find(u => u.session_token === token);
    
    if (usuario) {
      updateRow(SHEETS.USUARIOS, 'usuario_id', usuario.usuario_id, {
        session_token: '',
        session_expiry: ''
      });
    }
    
    return { success: true, message: 'Sesión cerrada' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Change user password
 */
function changePassword(usuarioId, currentPassword, newPassword) {
  try {
    if (!usuarioId || !currentPassword || !newPassword) {
      return { success: false, error: 'Todos los campos son requeridos' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }
    
    const usuario = getUsuarioById(usuarioId);
    if (!usuario.success) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // Verify current password
    const hashedCurrent = hashPassword(currentPassword);
    if (usuario.data.password_hash !== hashedCurrent) {
      return { success: false, error: 'Contraseña actual incorrecta' };
    }
    
    // Update password
    const hashedNew = hashPassword(newPassword);
    updateRow(SHEETS.USUARIOS, 'usuario_id', usuarioId, {
      password_hash: hashedNew
    });
    
    return { success: true, message: 'Contraseña actualizada' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Reset user password (admin function)
 */
function resetPassword(usuarioId, newPassword) {
  try {
    if (!usuarioId || !newPassword) {
      return { success: false, error: 'Usuario y nueva contraseña son requeridos' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }
    
    const hashedNew = hashPassword(newPassword);
    updateRow(SHEETS.USUARIOS, 'usuario_id', usuarioId, {
      password_hash: hashedNew
    });
    
    return { success: true, message: 'Contraseña restablecida' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Hash password using SHA-256
 */
function hashPassword(password) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return rawHash.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

/**
 * Generate session token
 */
function generateSessionToken() {
  return Utilities.getUuid() + '-' + Date.now();
}

// ============================================
// GET OPERATIONS
// ============================================

/**
 * Get all users with optional filters
 */
function getUsuarios(filters = {}) {
  try {
    const data = getSheetDataFiltered(SHEETS.USUARIOS, filters);
    // Remove sensitive data if needed
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get users by company
 */
function getUsuariosByEmpresa(empresaId) {
  try {
    if (!empresaId) {
      throw new Error('empresa_id is required');
    }
    return getUsuarios({ empresa_id: empresaId });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get a single user by ID
 */
function getUsuarioById(usuarioId) {
  try {
    if (!usuarioId) {
      throw new Error('usuario_id is required');
    }
    
    const found = findRowById(SHEETS.USUARIOS, 'usuario_id', usuarioId);
    
    if (!found) {
      return { success: false, error: 'User not found' };
    }
    
    const usuario = {};
    found.headers.forEach((header, index) => {
      usuario[header] = found.data[index];
    });
    
    return { success: true, data: usuario };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user by email
 */
function getUsuarioByEmail(email) {
  try {
    if (!email) {
      throw new Error('email is required');
    }
    
    const usuarios = getSheetDataFiltered(SHEETS.USUARIOS, {});
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!usuario) {
      return { success: false, error: 'User not found' };
    }
    
    return { success: true, data: usuario };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// CREATE OPERATION
// ============================================

/**
 * Create a new user
 */
function createUsuario(data) {
  try {
    // Validate required fields
    validateRequired(data, ['nombre', 'email', 'rol']);
    
    // Validate email format
    if (!validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    // Check if email already exists
    if (valueExists(SHEETS.USUARIOS, 'email', data.email.toLowerCase())) {
      throw new Error('A user with this email already exists');
    }
    
    // Validate role
    const validRoles = ['admin', 'operador', 'consulta'];
    if (!validRoles.includes(data.rol.toLowerCase())) {
      throw new Error('Invalid role. Must be "admin", "operador" or "consulta"');
    }
    
    // Validate empresa_id for non-admin users
    if (data.rol.toLowerCase() !== 'admin' && !data.empresa_id) {
      throw new Error('empresa_id is required for non-admin users');
    }
    
    // Validate empresa exists if provided
    if (data.empresa_id) {
      const empresa = getEmpresaById(data.empresa_id);
      if (!empresa.success) {
        throw new Error('Company not found');
      }
    }
    
    // Validate password
    if (!data.password && !data.password_hash) {
      throw new Error('Password is required');
    }
    
    // Prepare the record
    const usuario = {
      usuario_id: generateUUID(),
      nombre: data.nombre.trim(),
      email: data.email.toLowerCase().trim(),
      password_hash: data.password ? hashPassword(data.password) : data.password_hash,
      rol: data.rol.toLowerCase(),
      empresa_id: data.empresa_id || '',
      estado: 'activo',
      fecha_registro: getCurrentDate(),
      session_token: '',
      session_expiry: ''
    };
    
    // Insert the record
    insertRow(SHEETS.USUARIOS, usuario);
    
    return { success: true, data: usuario, message: 'User created successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// UPDATE OPERATION
// ============================================

/**
 * Update an existing user
 */
function updateUsuario(data) {
  try {
    if (!data.usuario_id) {
      throw new Error('usuario_id is required');
    }
    
    // Get existing user
    const existing = getUsuarioById(data.usuario_id);
    if (!existing.success) {
      throw new Error('User not found');
    }
    
    // Validate email if changed
    if (data.email) {
      if (!validateEmail(data.email)) {
        throw new Error('Invalid email format');
      }
      
      if (valueExists(SHEETS.USUARIOS, 'email', data.email.toLowerCase(), data.usuario_id, 'usuario_id')) {
        throw new Error('A user with this email already exists');
      }
      
      data.email = data.email.toLowerCase().trim();
    }
    
    // Validate role if provided
    if (data.rol) {
      const validRoles = ['admin', 'operador', 'consulta'];
      if (!validRoles.includes(data.rol.toLowerCase())) {
        throw new Error('Invalid role. Must be "admin", "operador" or "consulta"');
      }
      data.rol = data.rol.toLowerCase();
    }
    
    // Validate estado if provided
    if (data.estado && !['activo', 'inactivo'].includes(data.estado)) {
      throw new Error('Invalid estado. Must be "activo" or "inactivo"');
    }
    
    // Validate empresa if changing to non-admin role
    const newRole = data.rol || existing.data.rol;
    const newEmpresa = data.empresa_id !== undefined ? data.empresa_id : existing.data.empresa_id;
    
    if (newRole !== 'admin' && !newEmpresa) {
      throw new Error('empresa_id is required for non-admin users');
    }
    
    // Update the record
    updateRow(SHEETS.USUARIOS, 'usuario_id', data.usuario_id, data);
    
    return { success: true, message: 'User updated successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// DELETE OPERATION
// ============================================

/**
 * Delete a user (soft delete - set status to inactive)
 */
function deleteUsuario(usuarioId) {
  try {
    if (!usuarioId) {
      throw new Error('usuario_id is required');
    }
    
    // Soft delete - set status to inactive
    updateRow(SHEETS.USUARIOS, 'usuario_id', usuarioId, { estado: 'inactivo' });
    
    return { success: true, message: 'User deactivated successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get roles for dropdown
 */
function getRolesDropdown() {
  try {
    const dropdown = [
      { value: 'admin', label: USER_ROLES.ADMIN },
      { value: 'operador', label: USER_ROLES.OPERADOR },
      { value: 'consulta', label: USER_ROLES.CONSULTA }
    ];
    return { success: true, data: dropdown };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get users for dropdown
 */
function getUsuariosDropdown(empresaId = null) {
  try {
    const filters = { estado: 'activo' };
    if (empresaId) {
      filters.empresa_id = empresaId;
    }
    
    const data = getSheetDataFiltered(SHEETS.USUARIOS, filters);
    const dropdown = data.map(u => ({
      value: u.usuario_id,
      label: `${u.nombre} (${u.rol})`,
      email: u.email
    }));
    
    return { success: true, data: dropdown };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Check user permissions
 */
function checkUserPermission(usuarioId, action, empresaId = null) {
  try {
    const usuario = getUsuarioById(usuarioId);
    if (!usuario.success || usuario.data.estado !== 'activo') {
      return { success: false, hasPermission: false, reason: 'User not found or inactive' };
    }
    
    const rol = usuario.data.rol;
    
    // Admin has full access
    if (rol === 'admin') {
      return { success: true, hasPermission: true };
    }
    
    // Check company access
    if (empresaId && usuario.data.empresa_id !== empresaId) {
      return { success: true, hasPermission: false, reason: 'No access to this company' };
    }
    
    // Check action permissions
    const readActions = ['view', 'list', 'export'];
    const writeActions = ['create', 'update', 'delete'];
    
    if (rol === 'consulta') {
      return { 
        success: true, 
        hasPermission: readActions.includes(action),
        reason: writeActions.includes(action) ? 'Read-only user' : null
      };
    }
    
    if (rol === 'operador') {
      return { success: true, hasPermission: true };
    }
    
    return { success: true, hasPermission: false, reason: 'Unknown role' };
    
  } catch (error) {
    return { success: false, hasPermission: false, error: error.message };
  }
}
