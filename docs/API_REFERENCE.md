# SG-SST API Reference

Esta documentación detalla las funciones disponibles en el backend de Google Apps Script. El frontend se comunica con estas funciones a través de `google.script.run` (interno) o `doPost` (externo).

## 📡 Estructura de Respuesta
Todas las funciones retornan un objeto JSON con la siguiente estructura:

**Éxito:**
```json
{
  "success": true,
  "data": { ... }, // Objeto o Array con los datos solicitados
  "message": "Operación exitosa" // Opcional
}
```

**Error:**
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

---

## 🏢 Empresas (Companies)

### `getEmpresas(filters)`
Obtiene lista de empresas.
- **Params**: `{ estado: 'activo' }`
- **Return**: `Array<Empresa>`

### `createEmpresa(data)`
Crea una nueva empresa.
- **Data**: `{ nombre, nit, direccion, telefono, email, representante_legal, responsable_sst }`
- **Return**: Objeto Empresa creado

---

## 👥 Empleados (Employees)

### `getEmpleados(filters)`
Obtiene lista de empleados.
- **Params**: `{ empresa_id, estado }`
- **Return**: `Array<Empleado>`

### `createEmpleado(data)`
Registra un nuevo empleado.
- **Data**: `{ empresa_id, nombre, cedula, cargo, fecha_ingreso, ... }`
- **Return**: Objeto Empleado creado

---

## 📄 Documentos SST

### `getDocumentos(filters)`
Obtiene documentos.
- **Params**: `{ empresa_id, estado }`
- **Return**: `Array<Documento>` con campo extra `estado` calculado (vigente/vencido)

### `createDocumento(data)`
Sube metadatos de un nuevo documento.
- **Data**: `{ empresa_id, tipo_documento, nombre, fecha_vencimiento, ... }`
- **Return**: Objeto Documento creado
- **Nota**: Genera alertas automáticamente si está vencido o por vencer.

---

## 🔔 Alertas

### `getAlertas(filters)`
Obtiene alertas del sistema.
- **Params**: `{ empresa_id, estado: 'pendiente' }`
- **Return**: `Array<Alerta>`

### `generarAlertas(empresaId)`
Fuerza la regeneración de alertas para una empresa (o todas).
- **Return**: `{ message: "X alertas generadas" }`

---

## 🔐 Usuarios y Auth

### `loginUsuario(email, password)`
Autenticación simple.
- **Return**: `{ data: { token, usuario_id, ... } }`

---

## 🛠️ Utilidades del Sistema

### `initializeSystem()`
Crea las pestañas necesarias en la hoja de cálculo si no existen.
- **Ejecutar**: Una vez al inicio o cuando se agreguen nuevos módulos.
