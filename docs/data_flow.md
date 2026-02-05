# SG-SST System - Data Flow & Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│  index.html + css/styles.css + js/app.js + js/reports.js       │
│  (Dark Theme Dashboard, PDF/Excel Generation)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ google.script.run
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE APPS SCRIPT                            │
├─────────────────────────────────────────────────────────────────┤
│  Code.gs      - Entry point, routing                            │
│  Utils.gs     - Utilities, validation                           │
│  Empresas.gs  - Company CRUD                                     │
│  Empleados.gs - Employee CRUD                                    │
│  Documentos.gs- Document CRUD + status calculation              │
│  Alertas.gs   - Alert generation + WhatsApp links               │
│  Acciones.gs  - Evidence logging                                 │
│  Usuarios.gs  - User management + RBAC                          │
│  Reportes.gs  - Report data generation                          │
│  TestData.gs  - Sample data + validation                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ SpreadsheetApp / DriveApp
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GOOGLE SERVICES                             │
├──────────────────────────┬──────────────────────────────────────┤
│    GOOGLE SHEETS         │        GOOGLE DRIVE                  │
│    (Database)            │        (Document Storage)            │
├──────────────────────────┼──────────────────────────────────────┤
│ • empresas               │ • SST Policy files                   │
│ • empleados              │ • Training certificates              │
│ • documentos_sst         │ • Investigation reports              │
│ • alertas                │ • COPASST minutes                    │
│ • acciones               │                                      │
│ • usuarios               │                                      │
└──────────────────────────┴──────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Document Status Flow
```
┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│ Create Doc   │ ──▶ │ Calculate Status │ ──▶ │ Store in    │
│ with dates   │     │ (fecha_vencim.)  │     │ Sheet       │
└──────────────┘     └──────────────────┘     └─────────────┘
                              │
        ┌─────────────────────┼──────────────────────┐
        ▼                     ▼                      ▼
   ┌─────────┐         ┌───────────┐          ┌──────────┐
   │ VIGENTE │         │ POR_VENCER│          │ VENCIDO  │
   │ >30 days│         │ ≤30 days  │          │ <today   │
   └─────────┘         └───────────┘          └──────────┘
```

### 2. Alert Generation Flow
```
┌─────────────────┐
│ generarAlertas()│
└────────┬────────┘
         ▼
┌─────────────────────────────┐
│ Get all docs from empresa   │
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│ For each doc:               │
│ - Calculate current status  │
│ - Check if por_vencer/      │◀─┐
│   vencido                   │  │
└────────────┬────────────────┘  │
             ▼                   │
┌─────────────────────────────┐  │
│ Check if alert exists       │  │
│ for this doc                │  │
└────────────┬────────────────┘  │
             ▼                   │
      ┌──────────────┐           │
      │ No existing  │ ──▶ Create Alert
      │ alert?       │           │
      └──────────────┘           │
             │                   │
             ▼                   │
      Return to next doc ────────┘
```

### 3. WhatsApp Action Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ User clicks │ ──▶ │ Modal opens │ ──▶ │ User enters │
│ WhatsApp btn│     │ with phone  │     │ phone number│
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Evidence    │ ◀── │ wa.me link  │ ◀── │ Generate    │
│ logged      │     │ opens       │     │ message     │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Scaling Recommendations

### Current Limits
- Google Sheets: ~5M cells, ~200MB
- Apps Script: 6 min execution, 50MB/day triggers
- Suitable for: **50-100 companies, <5000 employees**

### Scaling Path

| Scale | Solution |
|-------|----------|
| 100+ companies | Split into multiple Sheets |
| 5000+ employees | Consider Cloud SQL + App Engine |
| High traffic | Add caching layer with CacheService |
| Real-time updates | Use Apps Script triggers |

### Performance Tips
1. Use batch operations for bulk updates
2. Implement pagination for large tables
3. Cache dropdown data in frontend
4. Use indexed columns for frequent filters
