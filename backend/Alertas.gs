/**
 * SG-SST Management System - Alerts Module
 * Centralized alert system for expiring documents, pending actions, and critical indicators.
 */

/**
 * Get all system alerts for a company
 * @param {string} empresaId
 */
function getSystemAlerts(empresaId) {
  try {
    if (!empresaId) throw new Error('Empresa ID is required');

    const alerts = [];
    
    // 1. Check Document Expirations
    const docAlerts = checkDocumentosVencidos(empresaId);
    alerts.push(...docAlerts);

    // 2. Check Pending Action Plans
    const planAlerts = checkPlanesVencidos(empresaId);
    alerts.push(...planAlerts);

    // 3. Check Critical Indicators (Current Month)
    const indAlerts = checkIndicadoresCriticos(empresaId);
    alerts.push(...indAlerts);

    // 4. Sort alerts by priority (CRÍTICO > ALERTA > INFO)
    alerts.sort((a, b) => {
      const priority = { 'CRÍTICO': 3, 'ALERTA': 2, 'INFO': 1 };
      return (priority[b.nivel] || 0) - (priority[a.nivel] || 0);
    });

    return {
      success: true,
      data: alerts,
      count: alerts.length
    };

  } catch (error) {
    Logger.log('Error getting system alerts: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger 1: Document Expirations
 * Rules:
 * - Expired (< 0 days): CRÍTICO
 * - Expiring soon (< 30 days): ALERTA
 */
function checkDocumentosVencidos(empresaId) {
  const alerts = [];
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('documentos');
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const empresaIdCol = headers.indexOf('empresa_id');
    const nombreCol = headers.indexOf('nombre');
    const fechaVencCol = headers.indexOf('fecha_vencimiento');
    const estadoCol = headers.indexOf('estado'); // vigente, vencido, etc.

    if (empresaIdCol === -1 || fechaVencCol === -1) return [];

    const today = new Date();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[empresaIdCol] == empresaId) {
        // Skip if explicitly marked as obsolete or historical if applicable
        // Assuming we check dates regardless of manual status to be safe, or check 'vigente'
        
        const fechaVenc = row[fechaVencCol];
        if (fechaVenc && fechaVenc instanceof Date) {
          const diffTime = fechaVenc - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const docName = row[nombreCol] || 'Documento sin nombre';

          if (diffDays < 0) {
            alerts.push({
              id: `doc_${i}`,
              tipo: 'DOCUMENTO',
              mensaje: `El documento "${docName}" está vencido por ${Math.abs(diffDays)} días.`,
              fecha: fechaVenc, // formatted later
              nivel: 'CRÍTICO',
              accion: 'Renovar inmediatamente',
              enlace: 'documentos' // section to navigate
            });
          } else if (diffDays <= 30) {
            alerts.push({
              id: `doc_${i}`,
              tipo: 'DOCUMENTO',
              mensaje: `El documento "${docName}" vence en ${diffDays} días.`,
              fecha: fechaVenc,
              nivel: 'ALERTA',
              accion: 'Programar renovación',
              enlace: 'documentos'
            });
          }
        }
      }
    }
  } catch (e) {
    console.error('Error checking documents: ' + e.message);
  }
  return alerts;
}

/**
 * Trigger 2: Pending Action Plans
 * Rules:
 * - Past deadline & Open: CRÍTICO
 * - Deadline within 7 days & Open: ALERTA
 */
function checkPlanesVencidos(empresaId) {
  const alerts = [];
  try {
    // Assuming 'planes_accion' sheet exists from previous context
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('planes_accion');
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const empresaIdCol = headers.indexOf('empresa_id');
    const hallazgoCol = headers.indexOf('hallazgo'); // or description
    const fechaLimiteCol = headers.indexOf('fecha_limite');
    const estadoCol = headers.indexOf('estado'); // abierto, cerrado, en_progreso

    if (empresaIdCol === -1 || fechaLimiteCol === -1 || estadoCol === -1) return [];

    const today = new Date();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[empresaIdCol] == empresaId) {
        const estado = row[estadoCol].toString().toLowerCase();
        
        if (estado !== 'cerrado' && estado !== 'completado') {
          const fechaLimite = row[fechaLimiteCol];
          if (fechaLimite && fechaLimite instanceof Date) {
            const diffTime = fechaLimite - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const hallazgo = row[hallazgoCol] || 'Plan de acción';

            if (diffDays < 0) {
              alerts.push({
                id: `plan_${i}`,
                tipo: 'PLAN_ACCION',
                mensaje: `Plan de acción vencido: "${hallazgo}" (${Math.abs(diffDays)} días de retraso).`,
                fecha: fechaLimite,
                nivel: 'CRÍTICO',
                accion: 'Cerrar plan inmediatamente',
                enlace: 'planes'
              });
            } else if (diffDays <= 7) {
              alerts.push({
                id: `plan_${i}`,
                tipo: 'PLAN_ACCION',
                mensaje: `Plan de acción vence pronto: "${hallazgo}" (${diffDays} días restantes).`,
                fecha: fechaLimite,
                nivel: 'ALERTA',
                accion: 'Verificar avances',
                enlace: 'planes'
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Error checking plans: ' + e.message);
  }
  return alerts;
}

/**
 * Trigger 3: Critical Indicators (Current Month)
 * Rules:
 * - Check current month's calculated indicators
 * - If status is 'critico' or 'alerta'
 */
function checkIndicadoresCriticos(empresaId) {
  const alerts = [];
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    // Reuse existing calculation logic
    // Ensure calculateIndicadoresAuto and related functions are available in scope
    if (typeof calculateIndicadoresAuto !== 'function') return [];

    const result = calculateIndicadoresAuto({
        empresaId: empresaId,
        year: currentYear,
        month: currentMonth
    });

    if (result.success && result.data && result.data.mensuales) {
        result.data.mensuales.forEach(ind => {
            if (ind.nivel === 'critico') {
                alerts.push({
                    id: `ind_${ind.id}`,
                    tipo: 'INDICADOR',
                    mensaje: `Indicador Crítico: ${ind.nombre} (${ind.valor}${ind.unidad})`,
                    fecha: today,
                    nivel: 'CRÍTICO',
                    accion: 'Analizar causas y crear plan de acción',
                    enlace: 'indicadores'
                });
            } else if (ind.nivel === 'alerta') {
                alerts.push({
                    id: `ind_${ind.id}`,
                    tipo: 'INDICADOR',
                    mensaje: `Alerta en Indicador: ${ind.nombre} (${ind.valor}${ind.unidad})`,
                    fecha: today,
                    nivel: 'ALERTA',
                    accion: 'Revisar tendencia',
                    enlace: 'indicadores'
                });
            }
        });
    }

  } catch (e) {
    console.error('Error checking indicators: ' + e.message);
  }
  return alerts;
}

// ============================================
// AUTOMATION & TRIGGERS
// ============================================

/**
 * AUTOMATIC DAILY CHECK
 * Should be set to run daily (e.g., 6:00 AM) via Apps Script Triggers.
 */
function monitorDailyAlerts() {
  try {
    console.log('Starting Daily Alerts Monitor...');
    
    // 1. Get all active companies
    const empresasRes = getEmpresas();
    if (!empresasRes.success || !empresasRes.data) {
        console.warn('Could not fetch companies');
        return;
    }
    
    // Convert object or array
    const empresasList = Array.isArray(empresasRes.data) ? empresasRes.data : [];
    const summaryReport = [];

    empresasList.forEach(empresa => {
      // 2. Check alerts for each company
      const alerts = getSystemAlerts(empresa.id);
      
      if (alerts.success && alerts.count > 0) {
        // Filter for critical/warning only
        const criticalAlerts = alerts.data.filter(a => a.nivel === 'CRÍTICO' || a.nivel === 'ALERTA');
        
        if (criticalAlerts.length > 0) {
          summaryReport.push({
            empresa: empresa.nombre_empresa || empresa.nombre || 'Empresa ID:' + empresa.id,
            alerts: criticalAlerts
          });
        }
      }
    });

    console.log(`Daily Monitor Completed. Found alerts for ${summaryReport.length} companies.`);
    
    if (summaryReport.length > 0) {
      const adminEmail = Session.getActiveUser().getEmail();
      if (adminEmail) {
        sendAdminSummaryEmail(adminEmail, summaryReport);
      }
    }

  } catch (error) {
    console.error('Error in monitorDailyAlerts: ' + error.message);
  }
}

/**
 * Install the Daily Trigger Programmatically
 * Run this function ONCE to set up the automation.
 */
function installAlertsTrigger() {
  try {
    // Check if trigger already exists to avoid duplicates
    const triggers = ScriptApp.getProjectTriggers();
    const existing = triggers.find(t => t.getHandlerFunction() === 'monitorDailyAlerts');
    
    if (existing) {
      return { success: true, message: 'Trigger already exists.' };
    }

    // Create daily trigger at 6 AM
    ScriptApp.newTrigger('monitorDailyAlerts')
      .timeBased()
      .everyDays(1)
      .atHour(6)
      .create();

    return { success: true, message: 'Daily trigger installed successfully.' };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Send summary email to Admin
 */
function sendAdminSummaryEmail(email, report) {
  try {
    const subject = `[SG-SST] Resumen Diario de Alertas - ${new Date().toLocaleDateString()}`;
    let body = 'Resumen de Alertas del Sistema SG-SST:\n\n';

    // Limit body size for email limits (simple check)
    let count = 0;
    
    report.forEach(item => {
      if (count > 20) return; // Limit to 20 companies in email body to avoid overflow
      
      body += `Empresa: ${item.empresa}\n`;
      body += `Alertas Críticas/Advertencias: ${item.alerts.length}\n`;
      item.alerts.forEach(alert => {
          body += `  - [${alert.nivel}] ${alert.tipo}: ${alert.mensaje}\n`;
      });
      body += '\n------------------\n';
      count++;
    });
    
    if (report.length > 20) {
        body += `\n... y ${report.length - 20} empresas más con alertas.`;
    }

    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: body
    });
    console.log('Admin summary email sent to ' + email);
  } catch (e) {
    console.error('Failed to send email: ' + e.message);
  }
}
