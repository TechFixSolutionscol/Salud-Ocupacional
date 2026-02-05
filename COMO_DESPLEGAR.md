# 🚀 Cómo Desplegar y Acceder a la Aplicación SG-SST

## ⚠️ IMPORTANTE: No abrir index.html directamente

La aplicación **NO funciona** abriendo el archivo `index.html` desde tu computadora. Debe ser desplegada como **Google Apps Script Web App**.

---

## 📋 Pasos para Desplegar

### 1. Subir archivos al Script Editor

1. Abre [Google Apps Script](https://script.google.com)
2. Crea un nuevo proyecto o abre el existente
3. Sube TODOS los archivos de la carpeta `backend/`:
   - `Code.gs`
   - `Utils.gs`
   - `Empresas.gs`
   - `Empleados.gs`
   - `Documentos.gs`
   - `Alertas.gs`
   - `Usuarios.gs`
   - `Reportes.gs`
   - `Procesos.gs`
   - `GTC45.gs`
   - `Accidentes.gs`
   - `Capacitaciones.gs`
   - `Intervencion.gs`
   - `Auditorias.gs`
   - `TestData.gs`
   - `QuickTestData.gs`
   - `AdminPanel.html`

4. Sube los archivos del frontend:
   - Renombra `index.html` a `index.html` (debe estar en la raíz)
   - Crea archivos HTML para CSS y JS:
     - `styles.html` con el contenido de `css/styles.css` envuelto en `<style>...</style>`
     - `app.html` con el contenido de `js/app.js` envuelto en `<script>...</script>`
     - `reports.html` con el contenido de `js/reports.js` envuelto en `<script>...</script>`

### 2. Estructura de Archivos en Google Apps Script

Para que la aplicación funcione como **Web App**, debes crear los siguientes archivos dentro del Editor de Scripts:

| Nombre del Archivo | Contenido |
| :--- | :--- |
| `Code.gs` | Contenido de `backend/Code.gs`, `Utils.gs`, etc. (puedes unirlos) |
| `index.html` | Contenido de `index.html` (el que actualicé con `<?!= ?>`) |
| `styles.html` | Contenido de `css/styles.css` rodeado por `<style>...</style>` |
| `login_styles.html` | Contenido de `css/login.css` rodeado por `<style>...</style>` |
| `app_js.html` | Contenido de `js/app.js` rodeado por `<script>...</script>` |
| `reports_js.html` | Contenido de `js/reports.js` rodeado por `<script>...</script>` |

---

### 3. Desplegar como Web App

1. En el Editor de Scripts: **Implementar** -> **Nueva implementación**.
2. Tipo: **Aplicación web**.
3. Acceso: **Cualquier persona** (o según prefieras).
4. **Copia la URL** generada.

### 4. Inicializar y Probar

1. Una vez desplegado, abre la **URL de la Aplicación Web**.
2. Si es la primera vez, ve al Spreadsheet y usa el menú **🛡️ SG-SST Admin** -> **Paso 1: Inicializar Sistema**.
   - Esto creará automáticamente al usuario: `admin@sgsst.com` / `admin123`.
3. Inicia sesión en la Web App con esas credenciales.

Credenciales de prueba:
- **Email**: `admin@demo.com`
- **Password**: `admin123`

---

## 🔧 Alternativa Rápida: Estructura de Archivos HTML

Si prefieres una estructura más simple, puedes crear un solo archivo `index.html` con todo el código inline:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Todo el contenido de css/styles.css aquí */
    </style>
</head>
<body>
    <!-- Todo el HTML aquí -->
    
    <script>
        /* Todo el contenido de js/app.js aquí */
        /* Todo el contenido de js/reports.js aquí */
    </script>
</body>
</html>
```

---

## ❌ Errores Comunes

### "Failed to fetch"
- **Causa**: Intentando abrir `index.html` localmente
- **Solución**: Acceder a través de la URL de despliegue

### "google.script is not defined"
- **Causa**: Archivos JS/CSS no están cargados correctamente
- **Solución**: Usar `<?!= HtmlService... ?>` para incluir archivos

### "hideLoading is not defined"
- **Causa**: Orden incorrecto de carga de scripts
- **Solución**: Asegurar que `app.js` se carga completamente

---

## 📞 Soporte

Si tienes problemas, verifica:
1. ✅ Todos los archivos `.gs` están en el Script Editor
2. ✅ El archivo `index.html` está correctamente configurado
3. ✅ La implementación está configurada como "Aplicación web"
4. ✅ Accedes a través de la URL de despliegue, no archivo local
