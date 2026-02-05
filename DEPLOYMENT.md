# SG-SST - Información de Despliegue

## 🔗 URL de la Aplicación Desplegada

**Producción:**
```
https://script.google.com/macros/s/AKfycbx1JRo7pSeA1rfZLjdQVlMfyKd-6SMB3-RK_IX4rHfU5PjLLOLrrdmzLVY0X_GbmHUjBw/exec
```

## 📋 Notas Importantes

### Para Usuarios Finales
- Acceder directamente a la URL de arriba
- Credenciales de acceso: Configuradas en Google Sheets (tabla `usuarios`)
- Usuario demo: `admin@sgsst.com` / Contraseña: (configurar en backend)

### Para Desarrolladores

#### Re-desplegar después de cambios:
1. Abrir el proyecto en Google Apps Script Editor
2. Click en **Implementar** → **Administrar implementaciones**
3. Click en el ícono de lápiz (editar) en la implementación activa
4. Cambiar versión a **Nueva versión**
5. Click en **Implementar**

#### Testing Local:
El código actual usa `google.script.run` cuando se ejecuta desde Google Apps Script.
Para testing local con HTML standalone, modificar `js/app.js` línea 28-40.

#### Configuración Backend:
Actualizar `backend/Code.gs` con:
- `SPREADSHEET_ID`: ID de tu Google Sheets
- `DRIVE_FOLDER_ID`: ID de carpeta para documentos

## 🔐 Seguridad
- El link es público pero requiere autenticación en la app
- Cambiar contraseñas por defecto antes de producción
- Revisar permisos de Google Sheets

## 📊 Google Sheets Asociado
Verificar que el Spreadsheet tenga todas las hojas creadas:
- empresas
- empleados
- documentos_sst
- alertas
- acciones
- usuarios
- procesos
- matriz_riesgos_gtc45
- plan_intervencion
- investigaciones_accidentes
- capacitaciones
- auditorias

Ejecutar `initializeSystem()` desde el Script Editor si faltan hojas.
