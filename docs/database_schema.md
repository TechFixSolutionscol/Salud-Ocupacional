# Esquema de Base de Datos SG-SST

## Estructura General

Cada hoja de Google Sheets representa una tabla. Las relaciones se manejan mediante IDs en el backend (Apps Script).

---

## Tabla: `empresas`

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| empresa_id | STRING | Identificador único (UUID) | ✅ |
| nombre | STRING | Nombre de la empresa | ✅ |
| nit | STRING | NIT de Colombia | ✅ |
| direccion | STRING | Dirección física | ✅ |
| telefono | STRING | Teléfono de contacto | ✅ |
| email | STRING | Correo electrónico | - |
| representante_legal | STRING | Nombre del representante | ✅ |
| responsable_sst | STRING | Responsable de SST | ✅ |
| estado | STRING | activo / inactivo | ✅ |
| fecha_registro | DATE | Fecha de creación | ✅ |

---

## Tabla: `empleados`

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| empleado_id | STRING | Identificador único (UUID) | ✅ |
| empresa_id | STRING | FK → empresas | ✅ |
| nombre | STRING | Nombre completo | ✅ |
| cedula | STRING | Número de cédula | ✅ |
| cargo | STRING | Cargo en la empresa | ✅ |
| area | STRING | Área o departamento | - |
| telefono | STRING | Teléfono personal | - |
| email | STRING | Correo electrónico | - |
| fecha_ingreso | DATE | Fecha de ingreso | ✅ |
| estado | STRING | activo / inactivo | ✅ |
| tipo_contrato | STRING | Tipo de contrato | - |

---

## Tabla: `documentos_sst`

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| documento_id | STRING | Identificador único (UUID) | ✅ |
| empresa_id | STRING | FK → empresas | ✅ |
| tipo_documento | STRING | Código del tipo de documento | ✅ |
| nombre | STRING | Nombre del documento | ✅ |
| descripcion | STRING | Descripción breve | - |
| fecha_emision | DATE | Fecha de emisión | ✅ |
| fecha_vencimiento | DATE | Fecha de vencimiento | ✅ |
| estado | STRING | vigente / por_vencer / vencido | ✅ |
| responsable | STRING | Persona responsable | ✅ |
| url_documento | STRING | URL de Google Drive | - |
| observaciones | STRING | Notas adicionales | - |

### Tipos de Documento SG-SST

| Código | Nombre |
|--------|--------|
| `POL_SST` | Política SST |
| `PLAN_ANUAL` | Plan Anual SST |
| `MATRIZ_RIESGOS` | Matriz de Riesgos |
| `PLAN_EMERGENCIAS` | Plan de Emergencias |
| `CAPACITACION` | Capacitación |
| `INV_ACCIDENTE` | Investigación de Accidente |
| `REG_HIGIENE` | Reglamento de Higiene |
| `ACTA_COPASST` | Acta COPASST |
| `EXAMEN_MEDICO` | Examen Médico Ocupacional |
| `INV_INCIDENTE` | Investigación de Incidente |

---

## Tabla: `alertas`

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| alerta_id | STRING | Identificador único (UUID) | ✅ |
| empresa_id | STRING | FK → empresas | ✅ |
| tipo_alerta | STRING | Código del tipo de alerta | ✅ |
| referencia_tipo | STRING | documentos / empleados / capacitaciones | ✅ |
| referencia_id | STRING | ID del registro relacionado | ✅ |
| mensaje | STRING | Mensaje descriptivo | ✅ |
| fecha_alerta | DATE | Fecha de generación | ✅ |
| fecha_limite | DATE | Fecha límite de acción | - |
| prioridad | STRING | alta / media / baja | ✅ |
| estado | STRING | pendiente / gestionada / cerrada | ✅ |
| responsable | STRING | Persona asignada | - |

### Tipos de Alerta

| Código | Descripción |
|--------|-------------|
| `DOC_POR_VENCER` | Documento próximo a vencer (30 días) |
| `DOC_VENCIDO` | Documento vencido |
| `CAP_PENDIENTE` | Capacitación pendiente |
| `ACC_SIN_INV` | Accidente sin investigar |
| `EXAMEN_VENCIDO` | Examen médico vencido |

---

## Tabla: `acciones`

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| accion_id | STRING | Identificador único (UUID) | ✅ |
| alerta_id | STRING | FK → alertas | ✅ |
| empresa_id | STRING | FK → empresas | ✅ |
| tipo_accion | STRING | whatsapp / pdf / excel / otro | ✅ |
| descripcion | STRING | Descripción de la acción | ✅ |
| fecha | DATETIME | Fecha y hora de la acción | ✅ |
| usuario_id | STRING | FK → usuarios | ✅ |
| evidencia | STRING | Detalles adicionales de evidencia | - |

---

## Tabla: `usuarios`

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| usuario_id | STRING | Identificador único (UUID) | ✅ |
| nombre | STRING | Nombre completo | ✅ |
| email | STRING | Correo electrónico (único) | ✅ |
| rol | STRING | admin / operador / consulta | ✅ |
| empresa_id | STRING | FK → empresas (null para admin global) | - |
| estado | STRING | activo / inactivo | ✅ |
| fecha_registro | DATE | Fecha de creación | ✅ |

### Roles del Sistema

| Rol | Permisos |
|-----|----------|
| `admin` | Acceso total a todas las empresas |
| `operador` | CRUD en su empresa asignada |
| `consulta` | Solo lectura en su empresa |

---

## Diagrama de Relaciones

```
empresas (1) ──────┬──── (N) empleados
                   │
                   ├──── (N) documentos_sst ──── (N) alertas
                   │                                   │
                   ├──── (N) alertas ──────────────────┤
                   │                                   │
                   └──── (N) usuarios                  │
                              │                        │
                              └───── (N) acciones ─────┘
```

---

## Reglas de Integridad

1. **IDs únicos**: Generados con `Utilities.getUuid()` en Apps Script
2. **Validación FK**: Verificar existencia antes de insertar
3. **Fechas**: Formato ISO 8601 (YYYY-MM-DD)
4. **Estados**: Solo valores válidos del enum correspondiente
5. **NIT**: Validación de formato colombiano
6. **Cédula**: Validación numérica
