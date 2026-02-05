PLAN DE IMPLEMENTACIÓN
Software SG-SST Automatizado (Google Stack – Bajo Costo)
Objetivo general

Desarrollar un software SG-SST que permita gestionar documentación legal, empleados, alertas y reportes, usando:

Google Sheets como base de datos

Google Apps Script como backend

HTML/CSS/JS como frontend

Alertas manuales por WhatsApp

Exportación de informes en PDF y Excel

FASE 1 – Definición de arquitectura base
1.1 Arquitectura general

El sistema debe seguir esta arquitectura:

Frontend (HTML / CSS / JS)
        ↓
Backend (Google Apps Script)
        ↓
Base de datos (Google Sheets)
        ↓
Almacenamiento documentos (Google Drive)


No se deben usar:

Gmail

Automatizaciones de WhatsApp

APIs externas complejas

1.2 Principios de diseño

Multiempresa

Multiempleado

Relacional (lógica, no técnica)

Trazabilidad legal

Bajo costo

Fácil auditoría

FASE 2 – Diseño de base de datos (Google Sheets)
2.1 Reglas obligatorias

Cada hoja = una tabla

Cada tabla tiene ID único

Ninguna relación se hace en Sheets

Todas las relaciones se gestionan desde Apps Script

Prohibido editar datos críticos manualmente

2.2 Tablas obligatorias
Tabla: empresas

Campos mínimos:

empresa_id

nombre

nit

telefono

estado

Tabla: empleados

empleado_id

empresa_id (relación lógica)

nombre

cedula

cargo

estado

Tabla: documentos_sst

documento_id

empresa_id

tipo_documento

fecha_emision

fecha_vencimiento

estado

responsable

Tabla: alertas

alerta_id

empresa_id

tipo_alerta

referencia_id

fecha_alerta

estado

Tabla: acciones

(Evidencia de gestión)

accion_id

alerta_id

tipo_accion (WhatsApp / PDF / Excel)

fecha

usuario

FASE 3 – Backend (Google Apps Script)
3.1 Estructura lógica de archivos

Antigravity debe crear el backend separado por responsabilidades:

Inicialización del sistema

Gestión de empresas

Gestión de empleados

Gestión documental SG-SST

Generación de alertas

Generación de reportes

Utilidades generales

No se debe centralizar toda la lógica en un solo archivo.

3.2 Responsabilidades del backend

Leer y escribir en Sheets

Validar datos

Generar alertas

Preparar información para reportes

Devolver datos al frontend vía JSON

FASE 4 – Lógica SG-SST
4.1 Documentos obligatorios

El sistema debe manejar como mínimo:

Política SST

Plan anual

Matriz de riesgos

Plan de emergencias

Capacitaciones

Investigación de accidentes

4.2 Alertas

Las alertas se generan por:

Vencimiento de documentos

Capacitaciones pendientes

Accidentes abiertos

⚠ Importante:

El sistema NO envía WhatsApp automáticamente

Solo muestra alertas y habilita botones manuales

FASE 5 – WhatsApp (manual)
5.1 Comportamiento esperado

Botón visible en cada alerta

Al hacer clic:

Se abre WhatsApp con mensaje precargado

El usuario decide enviarlo

5.2 Evidencia

Cuando el usuario hace clic:

Se registra una acción

Se guarda fecha, tipo y usuario

Sirve como evidencia de gestión SST

FASE 6 – Reportes e informes
6.1 Tipos de salida

El sistema debe permitir:

Descargar informes en PDF

Descargar informes en Excel

6.2 Informes mínimos

Estado general SG-SST por empresa

Documentos vigentes / vencidos

Accidentes e incidentes

Capacitaciones realizadas

Indicadores básicos

6.3 Requisitos legales del PDF

Todo PDF debe incluir:

Nombre de la empresa

Fecha de generación

Responsable

Periodo evaluado

Datos trazables

FASE 7 – Frontend (Dashboard)
7.1 Estilo

Minimalista

Tema dark

Enfoque en tablas y alertas

Sin animaciones complejas

7.2 Vistas obligatorias

Dashboard general

Empresas

Empleados

Documentos SST

Alertas

Reportes

FASE 8 – Interfaz de administrador
Funciones clave

Crear empresa

Inicializar estructura SST

Ver estado de cumplimiento

Acceder a reportes globales

Todo debe hacerse desde la interfaz, no desde Sheets.

FASE 9 – Pruebas y validación
Escenarios mínimos

Empresa sin documentos

Empresa con documentos vencidos

Empresa con accidente

Generación de reporte

Registro de acción WhatsApp

FASE 10 – Entregables de Antigravity

Antigravity debe entregar:

Google Sheet estructurado

Apps Script funcional

Frontend operativo

Documentación técnica

Manual de uso básico

Flujo de datos explicado

CIERRE (importante para Antigravity)

Este sistema NO busca alta concurrencia ni automatización compleja,
busca cumplimiento legal, orden documental y evidencia,
usando herramientas de bajo costo y alta disponibilidad.