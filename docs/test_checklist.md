# SG-SST System - Test Scenarios & Validation Checklist

## Test Scenarios

### TS-01: Company Registration Flow
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Empresas | Companies list displays |
| 2 | Click "+ Nueva Empresa" | Modal opens with form |
| 3 | Fill required fields | Validation passes |
| 4 | Submit with invalid NIT | Error message shows |
| 5 | Submit with valid data | Success toast, list updates |
| 6 | Edit created company | Modal pre-filled, saves |
| 7 | Deactivate company | Status changes to "inactivo" |

### TS-02: Employee Registration Flow
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Empleados | Employee list displays |
| 2 | Click "+ Nuevo Empleado" | Modal with company dropdown |
| 3 | Submit without company | Validation error |
| 4 | Submit with valid data | Success toast, list updates |
| 5 | Filter by company | Only company employees show |
| 6 | Filter by status | Filtered results display |

### TS-03: Document Expiration & Alerts
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create doc with past date | Status shows "vencido" |
| 2 | Create doc expiring in 20 days | Status shows "por_vencer" |
| 3 | Create doc expiring in 60 days | Status shows "vigente" |
| 4 | Click "Generar Alertas" | Alerts created for vencido/por_vencer |
| 5 | Dashboard updates | Alert count reflects new alerts |

### TS-04: WhatsApp Manual Send
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to Alertas section | Alerts list displays |
| 2 | Click WhatsApp button | Modal with phone input |
| 3 | Enter phone number | WhatsApp link opens in new tab |
| 4 | Return to system | Action logged as evidence |

### TS-05: Report Generation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select company in header | Company filter active |
| 2 | Navigate to Reportes | Report cards display |
| 3 | Click PDF button | PDF downloads |
| 4 | Click Excel button | XLSX downloads |
| 5 | Verify file contents | Company data present |

### TS-06: User Access Control
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create admin user | Full access to all modules |
| 2 | Create operador user | CRUD access, limited admin |
| 3 | Create consulta user | Read-only access |

---

## Legal Validation Checklist

### SG-SST Compliance (Colombian Law)

#### Decree 1072 of 2015 Requirements
- [x] Company can register SST policy document
- [x] Annual work plan can be documented
- [x] Risk matrix document type available
- [x] Emergency plan document type available
- [x] Training records can be stored
- [x] Accident investigation documents supported
- [x] Hygiene regulations can be registered
- [x] COPASST meeting minutes supported

#### Resolution 0312 of 2019 Minimum Standards
- [x] Multi-company support (1-10, 11-50, 50+ employees)
- [x] Document expiration tracking
- [x] Alert generation for compliance gaps
- [x] Evidence logging for audits

#### Document Control Requirements
- [x] Issue date tracking
- [x] Expiration date tracking
- [x] Responsible person assignment
- [x] Document status calculation (vigente/por_vencer/vencido)
- [x] Google Drive URL linking for file storage

#### Reporting Requirements
- [x] Compliance status report
- [x] Document inventory report
- [x] Accident/incident report
- [x] Training report
- [x] Alert history & actions report

---

## Technical Validation

### Frontend
- [x] Responsive design (mobile/tablet/desktop)
- [x] Dark theme consistent across all sections
- [x] All forms validate required fields
- [x] Toast notifications for user feedback
- [x] Loading states during API calls
- [x] Modal forms for CRUD operations

### Backend (Google Apps Script)
- [x] UUID generation for all records
- [x] Date formatting standardized
- [x] Input validation (NIT, cedula, email, phone)
- [x] Soft delete implementation
- [x] Role-based access control
- [x] Company data isolation

### Data Integrity
- [x] Foreign key relationships maintained
- [x] Required field validation
- [x] Duplicate prevention (by unique fields)
- [x] Status field constraints

---

## Known Limitations

1. **No automated email/WhatsApp** - By design, manual button only
2. **No file upload** - Uses Google Drive URL linking
3. **Single spreadsheet** - All data in one Sheet file
4. **Session management** - Relies on Google account auth
5. **No offline mode** - Requires internet connection

---

## Deployment Checklist

- [ ] Create Google Sheet with correct ID in CONFIG
- [ ] Create Google Drive folder for documents
- [ ] Run `initializeSystem()` to create sheet tabs
- [ ] Deploy as Web App (Anyone with link)
- [ ] Test all CRUD operations
- [ ] Verify report downloads
- [ ] Test WhatsApp button functionality
