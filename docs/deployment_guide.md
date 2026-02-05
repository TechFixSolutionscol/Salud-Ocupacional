# SG-SST System - Deployment Guide

## Prerequisites

1. Google Account with access to:
   - Google Sheets
   - Google Drive
   - Google Apps Script

## Step 1: Create Google Sheet

1. Create a new Google Sheet
2. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
   ```
3. Note this ID for configuration

## Step 2: Create Google Drive Folder

1. Create a folder in Google Drive for documents
2. Get the folder ID from URL:
   ```
   https://drive.google.com/drive/folders/{FOLDER_ID}
   ```
3. Set folder sharing to "Anyone with link can view"

## Step 3: Setup Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Create new project: "SG-SST System"
3. Create these files:

| File | Source |
|------|--------|
| Code.gs | `backend/Code.gs` |
| Utils.gs | `backend/Utils.gs` |
| Empresas.gs | `backend/Empresas.gs` |
| Empleados.gs | `backend/Empleados.gs` |
| Documentos.gs | `backend/Documentos.gs` |
| Alertas.gs | `backend/Alertas.gs` |
| Acciones.gs | `backend/Acciones.gs` |
| Usuarios.gs | `backend/Usuarios.gs` |
| Reportes.gs | `backend/Reportes.gs` |
| TestData.gs | `backend/TestData.gs` |

4. Create `index.html` with contents from project root

## Step 4: Configure

1. Open `Code.gs`
2. Update the CONFIG section:
   ```javascript
   const CONFIG = {
     SPREADSHEET_ID: 'YOUR_SHEET_ID_HERE',
     DRIVE_FOLDER_ID: 'YOUR_FOLDER_ID_HERE',
     DAYS_BEFORE_EXPIRY_ALERT: 30
   };
   ```

## Step 5: Initialize System

1. In Apps Script, run `initializeSystem()`
2. Authorize the script when prompted
3. Check the Sheet - 6 tabs should be created:
   - empresas
   - empleados
   - documentos_sst
   - alertas
   - acciones
   - usuarios

## Step 6: Deploy Web App

1. Click **Deploy** → **New deployment**
2. Select type: **Web app**
3. Settings:
   - Description: "SG-SST v1.0"
   - Execute as: **Me**
   - Who has access: **Anyone** (or your organization)
4. Click **Deploy**
5. Copy the Web App URL

## Step 7: Test Login

1. Open the Web App URL
2. You will see the Login Screen
3. If using sample data (from `generateSampleData()`):
   - **Admin**: `admin@sgsst.local` / `123456`
   - **Operador**: `operador@sgsst.local` / `123456`
   - **Consulta**: `consulta@sgsst.local` / `123456`

## Step 8: Final Checks

1. Run `generateSampleData()` in Apps Script for test data
2. Verify all sections work after login
3. Run `validateSystemIntegrity()` to check system

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Script not authorized" | Re-run and click "Allow" |
| Empty tables | Run `initializeSystem()` again |
| No data | Run `generateSampleData()` |
| PDF/Excel not downloading | Check browser popup blocker |

## Security Notes

- Change access to "Anyone in org" for internal use
- Create proper users in the usuarios table
- Disable TestData.gs functions in production
