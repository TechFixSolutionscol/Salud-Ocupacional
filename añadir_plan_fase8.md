ADD PHASE 8 – GTC 45 SYSTEM INTEGRATION
CONTEXT (DO NOT REPEAT PREVIOUS PHASES)

All previous phases are already completed and implemented.
This instruction does NOT replace existing logic or code.
It only extends the system by adding an integration layer.

PHASE 8 – GTC 45 INTEGRATION & AUTOMATION LAYER
OBJECTIVE

Integrate the GTC 45 Risk Matrix as the core engine of the SG-SST system, ensuring that all modules, documents and alerts consume the same risk data consistently.

SCOPE (STRICT)

This phase must:

Integrate the GTC 45 matrix with all existing system modules

Create logical relationships using Google Sheets as a relational database

Enable automatic data reuse across documents

Maintain minimal UI changes (dashboard only)

Do NOT:

Redesign existing phases

Rewrite current application structure

Change previous data models unless strictly required for integration

1. DATA INTEGRATION (GOOGLE SHEETS RELATIONAL MODEL)
REQUIRED RELATIONSHIPS
Table	Relation
empresas	1 → N → matriz_riesgos_gtc45
empleados	1 → N → matriz_riesgos_gtc45
procesos	1 → N → matriz_riesgos_gtc45
matriz_riesgos_gtc45	1 → N → plan_intervencion
matriz_riesgos_gtc45	1 → N → investigaciones_accidentes
matriz_riesgos_gtc45	1 → N → capacitaciones

Foreign keys must be logical (IDs), not hardcoded values.

2. AUTOMATION RULES (SYSTEM-DRIVEN)

The system must automatically:

Calculate NP, NR and acceptability

Flag non-acceptable risks (Level I & II)

Generate pending intervention actions

Require residual risk evaluation after action closure

Mark risks for mandatory annual review

No manual risk classification is allowed.

3. DASHBOARD INTEGRATION (MINIMAL UI)

Add to the existing dashboard:

Risk summary by level (I, II, III, IV)

Open vs closed intervention actions

Overdue actions indicator

Risks pending review

Visuals must be:

Minimalist

Dark theme

Non-intrusive

4. DOCUMENT GENERATION INTEGRATION

The following documents must pull data directly from the GTC 45 matrix:

Risk Matrix (official format)

Annual Work Plan

Intervention Plan

Accident Investigation Support

Management Review Summary

Exports required:

PDF (official audit-ready format)

Excel (editable, structured)

5. WHATSAPP ALERT LINKING (MANUAL SEND)

For each critical event:

High or non-acceptable risk

Overdue intervention

Pending annual review

The system must generate:

A prefilled WhatsApp message

A manual “Send Alert” button

No automatic sending

6. ADMIN INTERFACE (DATA GOVERNANCE)

Add an internal admin view to:

Manage master tables (hazard types, scales, processes)

Lock GTC 45 calculation fields

Control document versions

Enable or disable modules per company

7. VALIDATION RULES

No document can exist without a linked risk record

No intervention can close without residual risk

No export allowed if mandatory fields are empty

DELIVERABLES

Integrated data flow documentation

Relationship map (Sheets-based)

Updated dashboard indicators

Export-ready documents

Validation checklist

EXECUTION RULE

This phase:

Extends the system only

Does not invalidate previous work

Becomes the final compliance layer

EXPECTED RESULT

A fully integrated SG-SST system where:

GTC 45 is the single source of truth

All documents stay synchronized

Audits require no manual corrections