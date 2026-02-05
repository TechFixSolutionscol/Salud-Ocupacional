# SG-SST Management System - User Manual

## Overview

The SG-SST Management System helps Colombian companies comply with Occupational Health and Safety (SST) regulations per Decree 1072/2015 and Resolution 0312/2019.

---

## Getting Started

### Login
1. Open the Web App URL provided by your administrator
2. The system uses Google Account authentication

### Dashboard
The main dashboard shows:
- **Stats Cards**: Total companies, employees, documents, pending alerts
- **Compliance Meter**: Percentage of valid documents
- **Recent Alerts**: Latest issues requiring attention
- **Expiring Documents**: Documents expiring soon

---

## Modules

### 1. Empresas (Companies)
Manage registered companies in the system.

**Actions:**
- `+ Nueva Empresa`: Add company with NIT, contact info, SST responsible
- `✏️` Edit: Modify company details
- `📊` Stats: View company statistics

**Filters:**
- Search by name or NIT
- Filter by status (active/inactive)

---

### 2. Empleados (Employees)
Manage employees by company.

**Actions:**
- `+ Nuevo Empleado`: Register with cedula, position, area
- `✏️` Edit: Update employee info

**Filters:**
- Filter by company
- Search by name
- Filter by status

---

### 3. Documentos SST
Manage all SST compliance documents.

**Document Types:**
| Code | Description |
|------|-------------|
| POL_SST | SST Policy |
| PLAN_ANUAL | Annual Work Plan |
| MATRIZ_RIESGOS | Risk Matrix |
| PLAN_EMERGENCIAS | Emergency Plan |
| CAPACITACION | Training Record |
| INV_ACCIDENTE | Accident Investigation |
| REG_HIGIENE | Hygiene Regulations |
| ACTA_COPASST | COPASST Minutes |
| EXAMEN_MEDICO | Medical Exam |
| INV_INCIDENTE | Incident Investigation |

**Status Colors:**
- 🟢 **Vigente**: Document valid
- 🟡 **Por Vencer**: Expiring within 30 days
- 🔴 **Vencido**: Expired

**Actions:**
- `+ Nuevo Documento`: Create with dates, responsible, Drive URL
- `✏️` Edit: Update details
- `📎` Link: Open document in Google Drive

---

### 4. Alertas (Alerts)
View and manage system alerts.

**Alert Types:**
- Document expiring/expired
- Medical exam due
- Training pending
- Accident without investigation

**Priority Levels:**
- 🔴 Alta (High)
- 🟡 Media (Medium)
- 🟢 Baja (Low)

**Actions:**
- `💬` WhatsApp: Send manual alert via WhatsApp
- `✓` Mark as managed
- `✕` Close alert
- `🔄 Generar Alertas`: Create new alerts for expiring/expired docs

---

### 5. Reportes (Reports)
Generate PDF and Excel reports.

**Available Reports:**
1. **Estado de Cumplimiento**: Overall compliance summary
2. **Documentos**: Complete document inventory
3. **Accidentes e Incidentes**: Accident/incident log
4. **Capacitaciones**: Training records
5. **Resumen de Alertas**: Alert history with actions

**How to Generate:**
1. Select a company from the header dropdown
2. Navigate to Reportes
3. Click PDF or Excel button

---

### 6. Usuarios (Users)
Manage system users and access levels.

**Roles:**
| Role | Permissions |
|------|-------------|
| Admin | Full access, all companies |
| Operador | CRUD access, assigned company |
| Consulta | Read-only access, assigned company |

---

## WhatsApp Integration

The system supports manual WhatsApp notifications:

1. Go to an alert
2. Click the `💬` WhatsApp button
3. Enter phone number (include country code 57 for Colombia)
4. Click "Abrir WhatsApp"
5. WhatsApp opens with pre-filled message
6. Send manually
7. Action is logged as evidence

---

## Tips

- **Select company first** in the header dropdown before generating reports
- **Run "Generar Alertas"** periodically to create alerts for expiring documents
- **Use Google Drive URLs** to link documents (not upload)
- **Check dashboard daily** for pending alerts

---

## Support

Contact your system administrator for:
- Access issues
- Bug reports
- Feature requests
