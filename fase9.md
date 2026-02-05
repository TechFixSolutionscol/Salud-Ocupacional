ADD PHASE 9 – SG-SST DOCUMENTAL COMPLETENESS & RELATIONAL CORE
CONTEXT

Phases 1–8 are already implemented and functional

This phase extends the system

No refactor of existing logic unless required for relational integrity

Google Sheets remains the primary structured data layer

PHASE 9 – SG-SST FULL DOCUMENTATION & RELATIONAL INTEGRATION
OBJECTIVE

Integrate ALL mandatory SG-SST documentation (Colombia – 2026) into the system, ensuring:

Complete legal coverage

Logical relationships between documents

Single source of truth

Audit-ready PDF and Excel outputs

This phase finalizes the SG-SST system from a legal, documental and operational standpoint.

1. DOCUMENTAL SCOPE (MANDATORY)

The system must include and manage the following document groups:

A. Governance & Strategy

SST Policy

Objectives and indicators

Annual SG-SST Work Plan

Legal Requirements Matrix

Initial SG-SST Evaluation

B. Risk Management

GTC 45 Risk Matrix (already implemented)

Risk-based Intervention Plan

Change Management Records

C. Operational Control

Procedures (SST core procedures)

Work instructions for critical tasks

Emergency Prevention, Preparedness and Response Plan

Emergency drills records

D. Training & Competence

Annual Training Program

Training attendance records

Induction and re-induction records

E. Accidents & Incidents

Accident and incident reports

Investigation records

Corrective and preventive actions

F. Occupational Health Surveillance

Medical surveillance programs

Epidemiological profile

Environmental and hygiene measurements

G. Participation & Communication

COPASST and committee meeting minutes

Internal SST communications

H. Contractors & Suppliers

Contractor SST control records

Contractor induction and compliance checklists

I. Measurement, Audit & Improvement

Internal audit records

Management review reports

SG-SST indicators

Continuous improvement actions

J. Document Control & Retention

Master document register

Version control

Retention periods

Access control

2. RELATIONAL DATA MODEL (GOOGLE SHEETS)

The system must implement logical relationships as follows:

Parent Entity	Relationship	Child Entity
empresas	1 → N	documentos_sst
matriz_riesgos_gtc45	1 → N	planes_intervencion
matriz_riesgos_gtc45	1 → N	capacitaciones
matriz_riesgos_gtc45	1 → N	investigaciones
empleados	1 → N	capacitaciones
empleados	1 → N	accidentes
procesos	1 → N	procedimientos
documentos_sst	1 → N	versiones_documento
auditorias	1 → N	acciones_mejora

All relations must be ID-based and system-enforced.

3. DOCUMENT MODEL (STANDARDIZED)

Each document type must share a common base structure:

document_id

empresa_id

tipo_documento

nombre_documento

version

fecha_emision

fecha_revision

responsable

estado (borrador / vigente / obsoleto)

fuente_datos (manual / sistema / matriz_riesgos)

observaciones

4. AUTOMATION RULES

The system must:

Auto-generate documents from system data where applicable

Prevent deletion of documents linked to active risks

Enforce annual review rules

Flag missing mandatory documentation per company

Block exports if required data is incomplete

5. DASHBOARD EXTENSION

Add indicators (no UI redesign):

% SG-SST documentation completeness

Documents pending review

Documents expired

Risks without linked controls or documents

Dark theme, minimal, read-only indicators.

6. EXPORT & REPORTING

All documents must be exportable as:

PDF (official, audit-ready)

Excel (structured, traceable)

Exports must:

Preserve document version

Include metadata (company, date, responsible)

Reflect live system data

7. VALIDATION & COMPLIANCE RULES

No company can be marked “SG-SST Active” without full documentation

No audit can close with missing documents

All risk-based documents must reference GTC 45 IDs

Retention rules must be enforced

DELIVERABLES

Full SG-SST document catalog

Relational map (Sheets-based)

Validation rules documentation

Export templates

Compliance checklist (Decreto 1072 / Resolución 0312)

EXECUTION RULE

This phase:

Completes the SG-SST system

Does not replace prior phases

Acts as the final compliance and audit layer

EXPECTED RESULT

A SG-SST system where:

All required documentation exists

Every document is linked, traceable and current

Audits can be passed without manual reconstruction

The system is legally defensible