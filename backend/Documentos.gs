/**
 * SG-SST Management System - Documentos SST Module
 * CRUD operations for SST documents
 */

// Document type constants
// Note: Moved to Utils.gs


// ============================================
// GET OPERATIONS
// ============================================

/**
 * Get all documents with optional filters
 */
function getDocumentos(filters = {}) {
  try {
    let data = getSheetDataFiltered(SHEETS.DOCUMENTOS_SST, filters);
    
    // Update document status based on expiration
    data = data.map(doc => {
      doc.estado = calculateDocumentStatus(doc.fecha_vencimiento);
      return doc;
    });
    
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get documents by company
 */
function getDocumentosByEmpresa(empresaId) {
  try {
    if (!empresaId) {
      throw new Error('empresa_id is required');
    }
    return getDocumentos({ empresa_id: empresaId });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get a single document by ID
 */
function getDocumentoById(documentoId) {
  try {
    if (!documentoId) {
      throw new Error('documento_id is required');
    }
    
    const found = findRowById(SHEETS.DOCUMENTOS_SST, 'documento_id', documentoId);
    
    if (!found) {
      return { success: false, error: 'Document not found' };
    }
    
    const documento = {};
    found.headers.forEach((header, index) => {
      documento[header] = found.data[index];
    });
    
    // Update status based on expiration
    documento.estado = calculateDocumentStatus(documento.fecha_vencimiento);
    
    return { success: true, data: documento };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// CREATE OPERATION
// ============================================

/**
 * Create a new document
 */
function createDocumento(data) {
  try {
    // Validate required fields
    validateRequired(data, ['empresa_id', 'tipo_documento', 'nombre', 'fecha_emision', 'fecha_vencimiento', 'responsable']);
    
    // Validate empresa exists
    const empresa = getEmpresaById(data.empresa_id);
    if (!empresa.success) {
      throw new Error('Company not found');
    }
    
    // Validate document type
    if (!Object.keys(DOCUMENT_TYPES).includes(data.tipo_documento)) {
      throw new Error('Invalid document type');
    }
    
    // Validate dates
    const fechaEmision = parseDate(data.fecha_emision);
    const fechaVencimiento = parseDate(data.fecha_vencimiento);
    
    if (!fechaEmision || !fechaVencimiento) {
      throw new Error('Invalid date format');
    }
    
    if (fechaVencimiento < fechaEmision) {
      throw new Error('Expiration date cannot be before issue date');
    }
    
    // Calculate initial status
    const estado = calculateDocumentStatus(data.fecha_vencimiento);
    
    // Version Control (Phase 9): Archive previous versions
    if (data.tipo_documento && data.empresa_id) {
       const existingDocs = getDocumentosByEmpresa(data.empresa_id).data;
       const activeDoc = existingDocs.find(d => 
         d.tipo_documento === data.tipo_documento && 
         (d.estado === 'vigente' || d.estado === 'por_vencer')
       );
       
       if (activeDoc) {
         // Mark previous version as obsolete
         updateRow(SHEETS.DOCUMENTOS_SST, 'documento_id', activeDoc.documento_id, {
           estado: 'obsoleto',
           observaciones: activeDoc.observaciones + ' [Superseded by ' + (data.version || 'new version') + ']' 
         });
       }
    }

    // Prepare the record
    const documento = {
      documento_id: generateUUID(),
      empresa_id: data.empresa_id,
      tipo_documento: data.tipo_documento,
      nombre: data.nombre.trim(),
      descripcion: (data.descripcion || '').trim(),
      fecha_emision: data.fecha_emision,
      fecha_vencimiento: data.fecha_vencimiento,
      estado: estado,
      responsable: data.responsable.trim(),
      url_documento: (data.url_documento || '').trim(),
      observaciones: (data.observaciones || '').trim(),
      version: data.version || 'v1.0',
      fecha_revision: data.fecha_revision || getCurrentDate(),
      fuente_datos: data.fuente_datos || 'manual',
      proceso_id: data.proceso_id || '',
      riesgo_id: data.riesgo_id || ''
    };
    
    // Insert the record
    insertRow(SHEETS.DOCUMENTOS_SST, documento);
    
    // Generate alert if document is expiring soon or expired
    if (estado === 'por_vencer' || estado === 'vencido') {
      generarAlertaDocumento(documento);
    }
    
    return { success: true, data: documento, message: 'Document created successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// UPDATE OPERATION
// ============================================

/**
 * Update an existing document
 */
function updateDocumento(data) {
  try {
    if (!data.documento_id) {
      throw new Error('documento_id is required');
    }
    
    // Get existing document
    const existing = getDocumentoById(data.documento_id);
    if (!existing.success) {
      throw new Error('Document not found');
    }
    
    // Validate document type if provided
    if (data.tipo_documento && !Object.keys(DOCUMENT_TYPES).includes(data.tipo_documento)) {
      throw new Error('Invalid document type');
    }
    
    // Validate dates if provided
    if (data.fecha_emision || data.fecha_vencimiento) {
      const fechaEmision = parseDate(data.fecha_emision || existing.data.fecha_emision);
      const fechaVencimiento = parseDate(data.fecha_vencimiento || existing.data.fecha_vencimiento);
      
      if (fechaVencimiento < fechaEmision) {
        throw new Error('Expiration date cannot be before issue date');
      }
    }
    
    // Recalculate status if expiration date changed
    if (data.fecha_vencimiento) {
      data.estado = calculateDocumentStatus(data.fecha_vencimiento);
    }
    
    // Update the record
    updateRow(SHEETS.DOCUMENTOS_SST, 'documento_id', data.documento_id, data);
    
    return { success: true, message: 'Document updated successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// DELETE OPERATION
// ============================================

/**
 * Delete a document
 */
function deleteDocumento(documentoId) {
  try {
    if (!documentoId) {
      throw new Error('documento_id is required');
    }
    
    // Delete the record
    deleteRow(SHEETS.DOCUMENTOS_SST, 'documento_id', documentoId);
    
    return { success: true, message: 'Document deleted successfully' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Note: calculateDocumentStatus moved to Utils.gs for shared access

// Note: generarAlertaDocumento moved to Alertas.gs for better organization

/**
 * Get document types for dropdown
 */
function getDocumentTypesDropdown() {
  try {
    const dropdown = Object.entries(DOCUMENT_TYPES).map(([value, label]) => ({
      value: value,
      label: label
    }));
    return { success: true, data: dropdown };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update all document statuses (can be run periodically)
 */
function updateAllDocumentStatuses() {
  try {
    const sheet = getSheet(SHEETS.DOCUMENTOS_SST);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return { success: true, updated: 0 };
    
    const headers = data[0];
    const estadoIndex = headers.indexOf('estado');
    const fechaVencimientoIndex = headers.indexOf('fecha_vencimiento');
    
    let updated = 0;
    
    for (let i = 1; i < data.length; i++) {
      const fechaVencimiento = data[i][fechaVencimientoIndex];
      const currentStatus = data[i][estadoIndex];
      const newStatus = calculateDocumentStatus(fechaVencimiento);
      
      if (currentStatus !== newStatus) {
        sheet.getRange(i + 1, estadoIndex + 1).setValue(newStatus);
        updated++;
      }
    }
    
    return { success: true, updated: updated };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
