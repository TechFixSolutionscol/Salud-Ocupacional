/**
 * SG-SST Management System - Google Drive Module
 * Handles file uploads and folder management
 */

// ============================================
// CONFIGURATION
// ============================================

const DRIVE_ROOT_FOLDER_NAME = 'SG-SST System Files';

// ============================================
// PUBLIC API
// ============================================

/**
 * Upload a file to Google Drive
 * @param {Object} data - { empresa_id, module, filename, fileContent (base64), mimeType }
 * @returns {Object} { success, url, fileId }
 */
function uploadFile(data) {
  try {
    validateRequired(data, ['empresa_id', 'module', 'filename', 'fileContent', 'mimeType']);
    
    // 1. Get or Create Root Folder
    const rootFolder = getRootFolder();
    
    // 2. Get or Create Company Folder
    const companyFolder = getOrCreateFolder(rootFolder, `Empresa_${data.empresa_id}`);
    
    // 3. Get or Create Module Folder
    const moduleFolder = getOrCreateFolder(companyFolder, data.module); // e.g., 'Auditorias', 'Investigaciones'
    
    // 4. Create File
    const blob = Utilities.newBlob(Utilities.base64Decode(data.fileContent), data.mimeType, data.filename);
    const file = moduleFolder.createFile(blob);
    
    // 5. Set Permissions (Optional: Make public or restrict)
    // file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return {
      success: true,
      url: file.getUrl(),
      fileId: file.getId(),
      previewUrl: file.getDownloadUrl() // Or thumbnail link
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the root folder from CONFIG.DRIVE_FOLDER_ID or create a new one
 */
function getRootFolder() {
  if (CONFIG.DRIVE_FOLDER_ID && CONFIG.DRIVE_FOLDER_ID.trim() !== '') {
    try {
      return DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    } catch (e) {
      console.warn('Configured Drive Folder ID invalid. Falling back to search/create.');
    }
  }
  
  // Search for existing folder by name
  const folders = DriveApp.getFoldersByName(DRIVE_ROOT_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  
  // Create new
  return DriveApp.createFolder(DRIVE_ROOT_FOLDER_NAME);
}

/**
 * Get a subfolder by name, creating it if it doesn't exist
 */
function getOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}
