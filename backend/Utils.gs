/**
 * SG-SST Management System - Utilities
 * Common utility functions
 */
// ============================================
// GLOBAL CONSTANTS
// ============================================

// Document type constants
const DOCUMENT_TYPES = {
  POL_SST: 'Política SST',
  PLAN_ANUAL: 'Plan Anual SST',
  MATRIZ_RIESGOS: 'Matriz de Riesgos',
  PLAN_EMERGENCIAS: 'Plan de Emergencias',
  CAPACITACION: 'Capacitación',
  INV_ACCIDENTE: 'Investigación de Accidente',
  REG_HIGIENE: 'Reglamento de Higiene',
  ACTA_COPASST: 'Acta COPASST',
  EXAMEN_MEDICO: 'Examen Médico Ocupacional',
  INV_INCIDENTE: 'Investigación de Incidente'
};

// ============================================
// ID GENERATION
// ============================================

/**
 * Generate a unique UUID
 */
function generateUUID() {
  return Utilities.getUuid();
}

// ============================================
// LOGGING UTILITIES
// ============================================

/**
 * Centralized error logging
 */
function logError(context, error) {
  const message = `[ERROR] ${context}: ${error.message}`;
  console.error(message);
  // Stack driver logging
  if (typeof Logger !== 'undefined') {
    Logger.log(message); 
  }
}

// ============================================
// DATE UTILITIES
// ============================================


/**
 * Get current date in ISO format
 */
function getCurrentDate() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Get current datetime in ISO format
 */
function getCurrentDateTime() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Parse date string to Date object
 */
function parseDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString);
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date2 - date1) / oneDay);
}

/**
 * Check if a date is in the past
 */
function isExpired(dateString) {
  if (!dateString) return false;
  const date = parseDate(dateString);
  return date < new Date();
}

/**
 * Check if a date is within X days
 */
function isWithinDays(dateString, days) {
  if (!dateString) return false;
  const date = parseDate(dateString);
  const today = new Date();
  const diff = daysBetween(today, date);
  return diff >= 0 && diff <= days;
}

/**
 * Calculate document status based on expiration date
 * Returns: 'vigente', 'por_vencer', or 'vencido'
 */
function calculateDocumentStatus(fechaVencimiento) {
  if (!fechaVencimiento) return 'vigente';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expDate = parseDate(fechaVencimiento);
  if (!expDate) return 'vigente';
  
  expDate.setHours(0, 0, 0, 0);
  
  if (expDate < today) {
    return 'vencido';
  }
  
  const daysUntilExpiry = daysBetween(today, expDate);
  
  if (daysUntilExpiry <= CONFIG.DAYS_BEFORE_EXPIRY_ALERT) {
    return 'por_vencer';
  }
  
  return 'vigente';
}

/**
 * Add years to a date (Phase 8 - Annual Review)
 */
function addYearsToDate(dateString, years) {
  const date = parseDate(dateString);
  if (!date) return dateString;
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().split('T')[0];
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate required fields
 */
function validateRequired(data, requiredFields) {
  const missing = [];
  for (const field of requiredFields) {
    if (!data[field] || data[field].toString().trim() === '') {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  return true;
}

/**
 * Validate NIT format (Colombian tax ID)
 */
function validateNIT(nit) {
  if (!nit) return false;
  // Remove any dashes or spaces
  const cleanNit = nit.toString().replace(/[-\s]/g, '');
  // NIT should be 9-10 digits
  return /^\d{9,10}$/.test(cleanNit);
}

/**
 * Validate Cedula format
 */
function validateCedula(cedula) {
  if (!cedula) return false;
  const cleanCedula = cedula.toString().replace(/[.\s]/g, '');
  return /^\d{6,12}$/.test(cleanCedula);
}

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email) return true; // Email is optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone format
 */
function validatePhone(phone) {
  if (!phone) return true; // Phone is optional
  const cleanPhone = phone.toString().replace(/[\s\-\(\)]/g, '');
  return /^\+?\d{7,15}$/.test(cleanPhone);
}

// ============================================
// SHEET UTILITIES
// ============================================

/**
 * Get all data from a sheet as array of objects
 */
function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Get data from sheet with filters
 */
function getSheetDataFiltered(sheetName, filters = {}) {
  let data = getSheetData(sheetName);
  
  // Apply filters
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'todos') {
      if (key.endsWith('_desde')) {
        const field = key.replace('_desde', '');
        const filterDate = parseDate(value);
        data = data.filter(row => {
          const rowDate = parseDate(row[field]);
          return rowDate && rowDate >= filterDate;
        });
      } else if (key.endsWith('_hasta')) {
        const field = key.replace('_hasta', '');
        const filterDate = parseDate(value);
        data = data.filter(row => {
          const rowDate = parseDate(row[field]);
          return rowDate && rowDate <= filterDate;
        });
      } else if (key === 'busqueda') {
        const searchLower = value.toLowerCase();
        data = data.filter(row => {
          return Object.values(row).some(val => 
            val && val.toString().toLowerCase().includes(searchLower)
          );
        });
      } else {
        data = data.filter(row => row[key] == value);
      }
    }
  }
  
  return data;
}

/**
 * Find a row by ID in a sheet
 */
function findRowById(sheetName, idField, id) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf(idField);
  
  if (idIndex === -1) {
    throw new Error(`ID field "${idField}" not found in sheet "${sheetName}"`);
  }
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === id) {
      return { rowIndex: i + 1, data: data[i], headers: headers };
    }
  }
  
  return null;
}

/**
 * Insert a new row into a sheet
 */
function insertRow(sheetName, data, headers) {
  const sheet = getSheet(sheetName);
  const sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const row = sheetHeaders.map(header => data[header] || '');
  sheet.appendRow(row);
  
  return true;
}

/**
 * Update a row in a sheet
 */
function updateRow(sheetName, idField, id, data) {
  const sheet = getSheet(sheetName);
  const found = findRowById(sheetName, idField, id);
  
  if (!found) {
    throw new Error(`Record with ${idField}="${id}" not found`);
  }
  
  const { rowIndex, headers } = found;
  const newRow = headers.map((header, index) => {
    if (header === idField) return id; // Keep the ID
    return data[header] !== undefined ? data[header] : found.data[index];
  });
  
  sheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow]);
  
  return true;
}

/**
 * Delete a row from a sheet
 */
function deleteRow(sheetName, idField, id) {
  const sheet = getSheet(sheetName);
  const found = findRowById(sheetName, idField, id);
  
  if (!found) {
    throw new Error(`Record with ${idField}="${id}" not found`);
  }
  
  sheet.deleteRow(found.rowIndex);
  
  return true;
}

/**
 * Check if a value exists in a sheet column
 */
function valueExists(sheetName, field, value, excludeId = null, idField = null) {
  const data = getSheetData(sheetName);
  return data.some(row => {
    if (excludeId && idField && row[idField] === excludeId) return false;
    return row[field] === value;
  });
}
