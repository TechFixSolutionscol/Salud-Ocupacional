
/**
 * ==========================================
 * UTILITY FOR OAUTH AUTHORIZATION
 * ==========================================
 * Run this function once in the GAS Editor to authorize
 * all necessary scopes (Drive, Spreadsheets, etc.)
 */
function authorizeScript() {
  // 1. Trigger Drive Scope (Read/Write)
  // This forces the script to ask for "See, edit, create, and delete all of your Google Drive files"
  const testFolder = DriveApp.createFolder("Temp_Auth_Check");
  testFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  testFolder.setTrashed(true); // Clean up immediately
  
  console.log('✅ DRIVE ACCESS CONFIRMED: Can create folders and files.');
  
  // 2. Trigger Spreadsheet Scope
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  console.log('✅ SPREADSHEET ACCESS CONFIRMED: ID ' + (ss ? ss.getId() : 'None'));
  
  return 'ACCESS GRANTED. IMPORTANT: Now you MUST "Manage Deployments" -> "Edit" -> "New Version" -> "Deploy" for this to work in the Web App.';
}
