

# Análisis y Bloques de Cumplimiento Normativo para Dashboard SG-SST

## Resumen de la Normativa Analizada

He analizado dos documentos clave:
1. **Resolución 0312 de 2019** - Estándares Mínimos del SG-SST
2. **Decreto 1072 de 2015 (extractos)** - Normas laborales especiales (trabajo remoto, trabajo en casa, conductores, etc.)

---

## ARQUITECTURA DE BLOQUES PARA EL DASHBOARD

---

### 🔷 BLOQUE 0: CLASIFICACIÓN DE LA EMPRESA

**Propósito:** Determinar qué estándares aplican según el tipo de empresa.

| Componente | Descripción | Campos del Dashboard |
|---|---|---|
| 0.1 | Número de trabajadores | Input numérico + selector (≤10, 11-50, >50) |
| 0.2 | Clase de riesgo | Selector I, II, III, IV, V |
| 0.3 | Actividad económica | Código CIIU + descripción |
| 0.4 | Tipo de vinculación | Checkboxes (dependientes, contratistas, cooperados, misión, estudiantes) |
| 0.5 | Modalidades de trabajo | Checkboxes (presencial, teletrabajo, remoto, en casa) |

**Lógica del bloque:**
- ≤10 trabajadores + Riesgo I/II/III → Capítulo I (7 ítems)
- 11-50 trabajadores + Riesgo I/II/III → Capítulo II (21 ítems)
- >50 trabajadores OR ≤50 + Riesgo IV/V → Capítulo III (60 ítems completos)

---

### 🔷 BLOQUE 1: I. PLANEAR - RECURSOS (10%)

#### 1.1 Recursos financieros, técnicos, humanos (4%)

| Ítem | Estándar | Peso | Estado | Evidencia Requerida |
|---|---|---|---|---|
| 1.1.1 | Responsable del SG-SST | 0.5% | ✅❌🔲 | Documento de asignación + hoja de vida con licencia SST vigente + curso 50h |
| 1.1.2 | Responsabilidades en SST | 0.5% | ✅❌🔲 | Documento con asignación de responsabilidades a todos los niveles |
| 1.1.3 | Asignación de recursos | 0.5% | ✅❌🔲 | Documento soporte: talento humano, financiero, técnico, tecnológico |
| 1.1.4 | Afiliación al SGRL | 0.5% | ✅❌🔲 | Planillas PILA últimos 4 meses + muestreo (10% si 51-200, 30 si >201) |
| 1.1.5 | Trabajadores alto riesgo + pensión especial | 0.5% | ✅❌🔲N/A | Identificación + pago cotización especial Decreto 2090/2003 |
| 1.1.6 | Conformación COPASST | 0.5% | ✅❌🔲 | Actas convocatoria, elección, conformación, constitución vigente |
| 1.1.7 | Capacitación COPASST | 0.5% | ✅❌🔲 | Documentos de actividades de capacitación a integrantes |
| 1.1.8 | Conformación Comité Convivencia | 0.5% | ✅❌🔲 | Actas reuniones (mín. cada 3 meses) + informes de gestión |

**Widgets del dashboard:**
- Semáforo de cumplimiento (verde/amarillo/rojo)
- Calendario de vencimientos (licencias, conformación COPASST)
- Alerta de renovación de documentos
- Repositorio digital de evidencias

#### 1.2 Capacitación en SST (6%)

| Ítem | Estándar | Peso | Estado | Evidencia Requerida |
|---|---|---|---|---|
| 1.2.1 | Programa Capacitación P&P | 2% | ✅❌🔲 | Programa + planillas firmadas + acorde a matriz de peligros |
| 1.2.2 | Inducción y reinducción | 2% | ✅❌🔲 | Lista de trabajadores + soportes documentales (muestreo 10% o 30) |
| 1.2.3 | Curso virtual 50 horas | 2% | ✅❌🔲 | Certificado de aprobación del responsable del SG-SST |

**Widgets del dashboard:**
- Tracker de capacitaciones realizadas vs programadas
- Registro de asistencia digital
- % de cobertura de inducción/reinducción
- Alerta de nuevos ingresos sin inducción

---

### 🔷 BLOQUE 2: I. PLANEAR - GESTIÓN INTEGRAL DEL SG-SST (15%)

| Ítem | Estándar | Peso | Estado | Evidencia Requerida |
|---|---|---|---|---|
| 2.1.1 | Política SST | 1% | ✅❌🔲 | Política escrita, firmada, fechada, comunicada al COPASST, difundida, revisada anualmente |
| 2.2.1 | Objetivos del SG-SST | 1% | ✅❌🔲 | Objetivos claros, medibles, cuantificables, con metas, documentados, comunicados |
| 2.3.1 | Evaluación inicial | 1% | ✅❌🔲 | Evaluación mediante: matriz legal, matriz peligros, verificación controles, indicadores |
| 2.4.1 | Plan Anual de Trabajo | 2% | ✅❌🔲 | Plan con objetivos, metas, responsabilidades, recursos, cronograma, firmado |
| 2.5.1 | Archivo y retención documental | 2% | ✅❌🔲 | Sistema de archivo legible, identificable, accesible, protegido |
| 2.6.1 | Rendición de cuentas | 1% | ✅❌🔲 | Registros documentales anuales que incluyan todos los niveles |
| 2.7.1 | Matriz legal | 2% | ✅❌🔲 | Normas vigentes RL + normas técnicas + normas de otras entidades |
| 2.8.1 | Mecanismos de comunicación | 1% | ✅❌🔲 | Mecanismos internos/externos + autorreporte de condiciones |
| 2.9.1 | Adquisiciones | 1% | ✅❌🔲 | Procedimiento de identificación y evaluación de especificaciones SST |
| 2.10.1 | Contratación | 2% | ✅❌🔲 | Criterios SST para evaluación/selección de proveedores y contratistas |
| 2.11.1 | Gestión del cambio | 1% | ✅❌🔲 | Procedimiento para evaluar impacto de cambios internos/externos |

**Widgets del dashboard:**
- Visor de política SST con control de versiones
- Gantt del Plan Anual de Trabajo con % de avance
- Gestor documental con estados y vigencias
- Matriz legal interactiva con alertas de actualizaciones normativas
- Formulario de autorreporte de condiciones

---

### 🔷 BLOQUE 3: II. HACER - GESTIÓN DE LA SALUD (20%)

#### 3.1 Condiciones de salud en el trabajo (9%)

| Ítem | Estándar | Peso | Estado | Evidencia Requerida |
|---|---|---|---|---|
| 3.1.1 | Descripción sociodemográfica + diagnóstico | 1% | ✅❌🔲 | Perfil sociodemográfico + diagnóstico condiciones de salud |
| 3.1.2 | Actividades de P&P en salud | 1% | ✅❌🔲 | Evidencias de definición y ejecución de actividades de medicina del trabajo |
| 3.1.3 | Perfiles de cargo al médico | 1% | ✅❌🔲 | Soporte de remisión de perfiles al médico evaluador |
| 3.1.4 | Evaluaciones médicas ocupacionales | 1% | ✅❌🔲 | Conceptos de aptitud + frecuencia definida + comunicación al trabajador |
| 3.1.5 | Custodia de historias clínicas | 1% | ✅❌🔲 | Soporte de custodia por IPS en SST o médico evaluador |
| 3.1.6 | Restricciones y recomendaciones médicas | 1% | ✅❌🔲 | Recomendaciones EPS/ARL + acciones de reubicación/readaptación + documentos a juntas de calificación |
| 3.1.7 | Estilos de vida saludables | 1% | ✅❌🔲 | Programa con campañas (farmacodependencia, alcoholismo, tabaquismo) |
| 3.1.8 | Agua potable, sanitarios, basuras | 1% | ✅❌🔲 | Verificación observación directa + soporte fílmico/fotográfico |
| 3.1.9 | Eliminación de residuos | 1% | ✅❌🔲 | Evidencias de eliminación + contrato empresa de residuos peligrosos |

#### 3.2 Registro, reporte e investigación (5%)

| Ítem | Estándar | Peso | Estado | Evidencia Requerida |
|---|---|---|---|---|
| 3.2.1 | Reporte de AT y EL | 2% | ✅❌🔲 | FURAT/FUREL + reporte a ARL, EPS, Dirección Territorial dentro de 2 días hábiles |
| 3.2.2 | Investigación de incidentes, AT y EL | 2% | ✅❌🔲 | Investigaciones dentro de 15 días + participación COPASST + profesional licenciado (AT grave/mortal) |
| 3.2.3 | Registro y análisis estadístico | 1% | ✅❌🔲 | Registro estadístico actualizado + análisis + conclusiones para mejora |

#### 3.3 Mecanismos de vigilancia (6%)

| Ítem | Estándar | Peso | Estado | Evidencia Requerida |
|---|---|---|---|---|
| 3.3.1 | Frecuencia de accidentalidad | 1% | ✅❌🔲 | (N° AT mes / N° trabajadores mes) × 100 - MENSUAL |
| 3.3.2 | Severidad de accidentalidad | 1% | ✅❌🔲 | (Días incapacidad + días cargados / N° trabajadores mes) × 100 - MENSUAL |
| 3.3.3 | Mortalidad por AT | 1% | ✅❌🔲 | (AT mortales año / Total AT año) × 100 - ANUAL |
| 3.3.4 | Prevalencia enfermedad laboral | 1% | ✅❌🔲 | (Casos nuevos+antiguos EL / Promedio trabajadores) × 100.000 - ANUAL |
| 3.3.5 | Incidencia enfermedad laboral | 1% | ✅❌🔲 | (Casos nuevos EL / Promedio trabajadores) × 100.000 - ANUAL |
| 3.3.6 | Ausentismo por causa médica | 1% | ✅❌🔲 | (Días ausencia / Días programados) × 100 - MENSUAL |

**Widgets del dashboard:**
- Panel de indicadores con gráficas de tendencia (línea temporal)
- Calculadora automática de indicadores (fórmulas precargadas)
- Módulo de reportes FURAT/FUREL con temporizador de 2 días
- Tracker de investigaciones con estado y cumplimiento de 15 días
- Dashboard de evaluaciones médicas con programación y alertas
- Mapa de calor de ausentismo

---

### 🔷 BLOQUE 4: II. HACER - GESTIÓN DE PELIGROS Y RIESGOS (30%)

#### 4.1 Identificación de peligros, evaluación y valoración de riesgos (15%)

| Ítem | Estándar | Peso | Estado | Evidencia Requerida |
|---|---|---|---|---|
| 4.1.1 | Metodología IPER | 4% | ✅❌🔲 | Documento metodología + verificación de aplicación con participación de trabajadores |
| 4.1.2 | IPER con participación de todos los niveles | 4% | ✅❌🔲 | Evidencias de participación + actualización anual o tras AT mortal/catastrófico/cambios |
| 4.1.3 | Sustancias carcinógenas/toxicidad aguda | 3% | ✅❌🔲 | Lista materias primas + verificación IARC grupo 1 + SGA categorías I y II + áreas almacenamiento |
| 4.1.4 | Mediciones ambientales | 4% | ✅❌🔲 | Soportes documentales de mediciones + remisión resultados al COPASST |

#### 4.2 Medidas de prevención y control (15%)

| Ítem | Estándar | Peso | Estado | Evidencia Requerida |
|---|---|---|---|---|
| 4.2.1 | Implementación medidas de prevención/control | 2.5% | ✅❌🔲 | Evidencias de ejecución según jerarquización (fuente→medio→individuo) |
| 4.2.2 | Verificación aplicación por trabajadores | 2.5% | ✅❌🔲 | Soportes documentales + visitas de verificación a instalaciones |
| 4.2.3 | Procedimientos, instructivos, fichas, protocolos | 2.5% | ✅❌🔲 | Documentos + soporte de entrega a trabajadores |
| 4.2.4 | Inspecciones con COPASST | 2.5% | ✅❌🔲 | Formatos de inspección + evidencia de inspecciones + participación COPASST |
| 4.2.5 | Mantenimiento periódico | 2.5% | ✅❌🔲 | Evidencia de mantenimiento preventivo/correctivo según manuales e informes |
| 4.2.6 | EPP + capacitación uso | 2.5% | ✅❌🔲 | Entrega + reposición + capacitación + verificación contratistas/subcontratistas |

**Widgets del dashboard:**
- Matriz de peligros y riesgos interactiva con código de colores
- Módulo de gestión de sustancias químicas (IARC + SGA)
- Calendario de mediciones ambientales
- Tracker de inspecciones con participación COPASST
- Inventario de EPP con control de entregas y reposiciones
- Módulo de mantenimiento preventivo/correctivo

---

### 🔷 BLOQUE 5: II. HACER - GESTIÓN DE AMENAZAS (10%)

| Ítem | Estándar | Peso | Estado | Evidencia Requerida |
|---|---|---|---|---|
| 5.1.1 | Plan de prevención, preparación y respuesta ante emergencias | 5% | ✅❌🔲 | Plan con amenazas, vulnerabilidad, planos, señalización, simulacros (mín. 1/año), divulgación, todas las jornadas |
| 5.1.2 | Brigada de emergencias | 5% | ✅❌🔲 | Documento conformación + capacitación + dotación (primeros auxilios, incendios, evacuación) |

**Widgets del dashboard:**
- Gestor del plan de emergencias con versionado
- Calendario de simulacros con registro fotográfico/video
- Registro de integrantes de brigada + capacitaciones + dotación
- Planos interactivos con rutas de evacuación

---

### 🔷 BLOQUE 6: III. VERIFICAR - VERIFICACIÓN DEL SG-SST (5%)

| Ítem | Estándar | Peso | Estado | Evidencia Requerida |
|---|---|---|---|---|
| 6.1.1 | Indicadores del SG-SST | 1.25% | ✅❌🔲 | Indicadores definidos + informe de resultados de evaluación |
| 6.1.2 | Auditoría anual | 1.25% | ✅❌🔲 | Soportes de auditoría (todas las áreas) + programa de auditoría (idoneidad, alcance, periodicidad, metodología) |
| 6.1.3 | Revisión por alta dirección | 1.25% | ✅❌🔲 | Soportes del alcance de la auditoría conforme Art. 2.2.4.6.30 Decreto 1072/2015 |
| 6.1.4 | Planificación auditoría con COPASST | 1.25% | ✅❌🔲 | Documento de revisión anual + comunicación resultados a COPASST y responsable SG-SST |

**Widgets del dashboard:**
- Panel de indicadores con comparativos anuales
- Módulo de auditoría con programa, hallazgos y seguimiento
- Registro de revisiones por alta dirección
- Actas de socialización de resultados

---

### 🔷 BLOQUE 7: IV. ACTUAR - MEJORAMIENTO (10%)

| Ítem | Estándar | Peso | Estado | Evidencia Requerida |
|---|---|---|---|---|
| 7.1.1 | Acciones preventivas y correctivas | 2.5% | ✅❌🔲 | Evidencia documental de implementación basada en supervisión, inspecciones, indicadores, COPASST |
| 7.1.2 | Acciones de mejora conforme revisión alta dirección | 2.5% | ✅❌🔲 | Evidencia de acciones correctivas/preventivas/mejora según revisión de alta dirección |
| 7.1.3 | Acciones de mejora basadas en investigaciones AT/EL | 2.5% | ✅❌🔲 | Evidencia de acciones de mejora + verificación de efectividad |
| 7.1.4 | Plan de mejoramiento | 2.5% | ✅❌🔲 | Evidencias de acciones correctivas por requerimientos de autoridades y ARL |

**Widgets del dashboard:**
- Gestor de acciones correctivas/preventivas/mejora con estados
- Trazabilidad de hallazgos → acción → cierre → verificación efectividad
- Dashboard de planes de mejoramiento con cumplimiento

---

### 🔷 BLOQUE 8: AUTOEVALUACIÓN Y CALIFICACIÓN (Art. 27-28)

**Propósito:** Calcular automáticamente la calificación del SG-SST.

| Rango | Valoración | Acción Requerida |
|---|---|---|
| < 60% | **CRÍTICO** 🔴 | Plan de mejoramiento inmediato + reporte a ARL en 3 meses + visita Min. Trabajo |
| 60% - 85% | **MODERADAMENTE ACEPTABLE** 🟡 | Plan de mejoramiento + reporte a ARL en 6 meses + plan de visita |
| > 85% | **ACEPTABLE** 🟢 | Mantener calificación + incluir mejoras en Plan Anual |

**Widgets del dashboard:**
- Formulario de autoevaluación digital con cálculo automático
- Gauge/velocímetro con calificación total (0-100%)
- Breakdown por ciclo PHVA con % por cada componente
- Generador automático de Plan de Mejora según brechas
- Histórico de autoevaluaciones con tendencia
- Exportación del formulario para registro en Min. Trabajo

---

### 🔷 BLOQUE 9: INDICADORES MÍNIMOS DE SST (Art. 30)

| Indicador | Fórmula | Periodicidad |
|---|---|---|
| Frecuencia de accidentalidad | (N° AT mes / N° trabajadores mes) × 100 | Mensual |
| Severidad de accidentalidad | (Días incapacidad + días cargados mes / N° trabajadores mes) × 100 | Mensual |
| Proporción AT mortales | (AT mortales año / Total AT año) × 100 | Anual |
| Prevalencia EL | (Casos nuevos + antiguos EL período Z / Promedio trabajadores Z) × 100.000 | Anual |
| Incidencia EL | (Casos nuevos EL período Z / Promedio trabajadores Z) × 100.000 | Anual |
| Ausentismo causa médica | (Días ausencia por incapacidad mes / Días programados mes) × 100 | Mensual |

**Reglas importantes para el dashboard:**
- ❌ No crear mecanismos que fomenten el no reporte de AT/EL
- ❌ No reconocer bonos/premios por "cero accidentes"
- ❌ No levantar/suspender incapacidades temporales
- ✅ Reportar todo AT/EL con incapacidad ≥1 día
- ✅ Contabilizar TODOS los trabajadores (dependientes, independientes, misión, cooperados, estudiantes)

---

### 🔷 BLOQUE 10: MÓDULO DE MODALIDADES DE TRABAJO (Decreto 1072)

#### 10.1 Trabajo Remoto (Decreto 555/2022)

| Componente | Requerimiento | Estado |
|---|---|---|
| 10.1.1 | Contrato de trabajo remoto con cláusulas mínimas | ✅❌ |
| 10.1.2 | Copia contrato a ARL + formulario | ✅❌ |
| 10.1.3 | Información a ARL del lugar de trabajo | ✅❌ |
| 10.1.4 | Inclusión en IPER del SG-SST | ✅❌ |
| 10.1.5 | Mecanismos de comunicación para reporte | ✅❌ |
| 10.1.6 | Equipos seguros + formación en riesgos | ✅❌ |
| 10.1.7 | Verificación virtual de condiciones HSI | ✅❌ |
| 10.1.8 | Derecho a desconexión laboral (Ley 2191/2022) | ✅❌ |
| 10.1.9 | Evaluaciones médicas ocupacionales | ✅❌ |
| 10.1.10 | Auxilio compensatorio servicios públicos (≥ auxilio transporte) | ✅❌ |

#### 10.2 Trabajo en Casa (Decreto 649/2022)

| Componente | Requerimiento | Estado |
|---|---|---|
| 10.2.1 | Escrito de habilitación con contenido mínimo (9 puntos) | ✅❌ |
| 10.2.2 | Comunicación a ARL con formulario | ✅❌ |
| 10.2.3 | Procedimiento de desconexión laboral | ✅❌ |
| 10.2.4 | Capacitación en TIC | ✅❌ |
| 10.2.5 | Inclusión en IPER del SG-SST | ✅❌ |
| 10.2.6 | Programas de bienestar (virtual/presencial/híbrido) | ✅❌ |
| 10.2.7 | Control de término máximo (Art. 7 Ley 2088/2021) | ✅❌ |

---

### 🔷 BLOQUE 11: ACREDITACIÓN EN SST (Art. 22)

| Requisito | Descripción | Estado |
|---|---|---|
| 11.1 | ≥2 planes anuales con 100% cumplimiento estándares mínimos | ✅❌ |
| 11.2 | Programa de auditoría >2 años funcionamiento | ✅❌ |
| 11.3 | Bajos indicadores (frecuencia, severidad, mortalidad, prevalencia, incidencia, ausentismo) vs 2 años anteriores | ✅❌ |
| 11.4 | Programas/planes/proyectos de valor agregado >2 años | ✅❌ |
| 11.5 | Aprobación de visita de verificación | ✅❌ |

**Beneficios:** Disminución de cotización al SGRL + referente para contratación pública/privada

---

### 🔷 BLOQUE 12: FASES DE IMPLEMENTACIÓN Y CRONOGRAMA

| Fase | Actividad | Responsable | Frecuencia |
|---|---|---|---|
| Autoevaluación | Aplicar Tabla de Valores Art. 27 | Empresa + ARL | Anual (diciembre) |
| Plan de Mejora | Elaborar según resultado autoevaluación | Empresa | Anual (diciembre) |
| Plan Anual | Formular Plan Anual SG-SST siguiente año | Empresa | Anual (diciembre) |
| Ejecución | Ejecutar Plan Anual | Empresa + ARL | Enero a diciembre |
| Informe avance | Rendir informe del plan de mejoramiento | Empresa a ARL | Julio de cada año |
| Registro | Registrar en plataforma Min. Trabajo | Empresa | Diciembre (desde 2020) |

---

## ARQUITECTURA TÉCNICA SUGERIDA PARA EL DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD SG-SST                       │
├─────────────────────────────────────────────────────────┤
│  🏢 BLOQUE 0: Clasificación Empresa                      │
│  ├── Auto-selección de capítulo aplicable                 │
├─────────────────────────────────────────────────────────┤
│  📊 PANEL PRINCIPAL                                       │
│  ├── Gauge Total: XX/100%                                 │
│  ├── Semáforo: 🔴🟡🟢                                    │
│  ├── PHVA Breakdown:                                      │
│  │   ├── PLANEAR: XX/25%                                  │
│  │   ├── HACER: XX/60%                                    │
│  │   ├── VERIFICAR: XX/5%                                 │
│  │   └── ACTUAR: XX/10%                                   │
├─────────────────────────────────────────────────────────┤
│  📋 MÓDULOS OPERATIVOS                                    │
│  ├── Bloque 1: Recursos (4%)                              │
│  ├── Bloque 2: Capacitación (6%)                          │
│  ├── Bloque 3: Gestión Integral (15%)                     │
│  ├── Bloque 4: Gestión Salud (20%)                        │
│  ├── Bloque 5: Gestión Peligros y Riesgos (30%)          │
│  ├── Bloque 6: Gestión Amenazas (10%)                     │
│  ├── Bloque 7: Verificación (5%)                          │
│  ├── Bloque 8: Mejoramiento (10%)                         │
│  ├── Bloque 9: Modalidades de Trabajo                     │
│  └── Bloque 10: Acreditación                              │
├─────────────────────────────────────────────────────────┤
│  📈 INDICADORES MÍNIMOS                                   │
│  ├── Frecuencia AT (mensual)                              │
│  ├── Severidad AT (mensual)                               │
│  ├── Mortalidad AT (anual)                                │
│  ├── Prevalencia EL (anual)                               │
│  ├── Incidencia EL (anual)                                │
│  └── Ausentismo (mensual)                                 │
├─────────────────────────────────────────────────────────┤
│  📄 GESTIÓN DOCUMENTAL                                    │
│  ├── Repositorio de evidencias por ítem                   │
│  ├── Control de versiones                                 │
│  ├── Alertas de vencimiento                               │
│  └── Exportación para Min. Trabajo / ARL                  │
├─────────────────────────────────────────────────────────┤
│  🔔 ALERTAS Y NOTIFICACIONES                              │
│  ├── Vencimiento licencia SST responsable                 │
│  ├── Renovación COPASST                                   │
│  ├── Evaluaciones médicas pendientes                      │
│  ├── Plazo de reporte AT/EL (2 días hábiles)             │
│  ├── Plazo investigación AT (15 días)                     │
│  ├── Simulacro anual                                      │
│  ├── Auditoría anual                                      │
│  ├── Autoevaluación diciembre                             │
│  └── Informe semestral plan de mejora (julio)            │
└─────────────────────────────────────────────────────────┘
```

---

## MATRIZ DE INTEGRACIÓN CON DESPLIEGUE ANTERIOR

Si ya existe un dashboard desplegado, estos bloques se integran como:

1. **Nuevas secciones/pestañas** en la navegación principal del dashboard
2. **APIs de datos** para alimentar los cálculos automáticos de indicadores
3. **Base de datos** extendida con tablas para:
   - `estandares_minimos` (60 ítems con pesos)
   - `autoevaluaciones` (historial anual)
   - `planes_mejora` (actividades, responsables, plazos)
   - `indicadores_sst` (registro mensual/anual)
   - `evidencias` (archivos vinculados a cada ítem)
   - `modalidades_trabajo` (remoto, en casa, presencial)
   - `alertas` (calendario de cumplimiento)
4. **Roles de usuario**: Responsable SG-SST, Alta Dirección, COPASST, Trabajadores, ARL
5. **Reportes exportables**: Formulario Art. 27 para registro en Min. Trabajo, planes de mejora para ARL