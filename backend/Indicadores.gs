/**
 * SG-SST Management System - Indicadores Legales Module
 * Automatic calculation of 6 mandatory legal indicators (Res. 0312/2019)
 * 
 * @author SG-SST System
 * @version 1.0.0
 */

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculate all 6 indicators automatically for a period
 * NO manual input required - all data extracted from sheets
 * 
 * @param {Object} params - { empresaId, year, month }
 * @returns {Object} { success, data: { mensuales, anuales, metadata } }
 */
function calculateIndicadoresAuto(params) {
  try {
    const { empresaId, year, month } = params;
    
    if (!empresaId || !year || !month) {
      throw new Error('empresaId, year, and month are required');
    }
    
    // Get metadata
    const totalTrabajadores = countActiveEmployees(empresaId, year, month);
    const diasLaborables = getWorkingDays(year, month);
    
    const results = {
      mensuales: [],
      anuales: [],
      metadata: {
        year: parseInt(year),
        month: parseInt(month),
        totalTrabajadores: totalTrabajadores,
        diasLaborables: diasLaborables,
        timestamp: new Date().toISOString()
      }
    };
    
    // 1. MENSUAL: Frecuencia de Accidentalidad
    results.mensuales.push(calcFrecuenciaAT(empresaId, year, month, totalTrabajadores));
    
    // 2. MENSUAL: Severidad de Accidentalidad
    results.mensuales.push(calcSeveridadAT(empresaId, year, month, totalTrabajadores));
    
    // 3. MENSUAL: Ausentismo
    results.mensuales.push(calcAusentismo(empresaId, year, month, totalTrabajadores, diasLaborables));
    
    // Calculate annual indicators for December or if explicitly requested
    if (parseInt(month) === 12) {
      // 4. ANUAL: Mortalidad AT
      results.anuales.push(calcMortalidadAT(empresaId, year));
      
      // 5. ANUAL: Prevalencia EL
      results.anuales.push(calcPrevalenciaEL(empresaId, year, totalTrabajadores));
      
      // 6. ANUAL: Incidencia EL
      results.anuales.push(calcIncidenciaEL(empresaId, year, totalTrabajadores));
    }
    
    return {
      success: true,
      data: results
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get historical data for an indicator (last 12 months)
 * For charting trends
 * 
 * @param {Object} params - { empresaId, indicadorId, months }
 * @returns {Object} { success, data: [{period, value}] }
 */
function getIndicadoresTimeSeries(params) {
  try {
    const { empresaId, indicadorId, months = 12 } = params;
    
    if (!empresaId || !indicadorId) {
      throw new Error('empresaId and indicadorId are required');
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-indexed
    
    const series = [];
    
    // Calculate for last N months
    for (let i = months - 1; i >= 0; i--) {
      let targetMonth = currentMonth - i;
      let targetYear = currentYear;
      
      // Handle year wrapping
      while (targetMonth <= 0) {
        targetMonth += 12;
        targetYear -= 1;
      }
      
      // Calculate indicator for that period
      const totalTrabajadores = countActiveEmployees(empresaId, targetYear, targetMonth);
      const diasLaborables = getWorkingDays(targetYear, targetMonth);
      
      let indicador;
      
      switch(indicadorId) {
        case 'frecuencia_at':
          indicador = calcFrecuenciaAT(empresaId, targetYear, targetMonth, totalTrabajadores);
          break;
        case 'severidad_at':
          indicador = calcSeveridadAT(empresaId, targetYear, targetMonth, totalTrabajadores);
          break;
        case 'ausentismo':
          indicador = calcAusentismo(empresaId, targetYear, targetMonth, totalTrabajadores, diasLaborables);
          break;
        case 'mortalidad_at':
          indicador = calcMortalidadAT(empresaId, targetYear);
          break;
        case 'prevalencia_el':
          indicador = calcPrevalenciaEL(empresaId, targetYear, totalTrabajadores);
          break;
        case 'incidencia_el':
          indicador = calcIncidenciaEL(empresaId, targetYear, totalTrabajadores);
          break;
        default:
          continue;
      }
      
      series.push({
        period: `${targetYear}-${String(targetMonth).padStart(2, '0')}`,
        month: targetMonth,
        year: targetYear,
        value: indicador.valor,
        nivel: indicador.nivel
      });
    }
    
    return {
      success: true,
      data: series
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// INDICATOR CALCULATION FUNCTIONS
// ============================================

/**
 * 1. Frecuencia de Accidentalidad (Mensual)
 * Fórmula: (N° AT mes / N° trabajadores mes) × 100
 */
function calcFrecuenciaAT(empresaId, year, month, totalTrabajadores) {
  const numAT = countATInPeriod(empresaId, year, month);
  const valor = totalTrabajadores > 0 ? (numAT / totalTrabajadores) * 100 : 0;
  
  return {
    id: 'frecuencia_at',
    nombre: 'Frecuencia de Accidentalidad',
    valor: Math.round(valor * 100) / 100,
    formula: `(${numAT} AT / ${totalTrabajadores} trabajadores) × 100`,
    periodo: 'mensual',
    unidad: '%',
    nivel: getNivelAlerta(valor, 'frecuencia'),
    icono: '📈'
  };
}

/**
 * 2. Severidad de Accidentalidad (Mensual)
 * Fórmula: (Días incapacidad + días cargados / N° trabajadores) × 100
 */
function calcSeveridadAT(empresaId, year, month, totalTrabajadores) {
  const diasIncapacidad = sumDiasIncapacidad(empresaId, year, month);
  const diasCargados = sumDiasCargados(empresaId, year, month);
  const totalDias = diasIncapacidad + diasCargados;
  
  const valor = totalTrabajadores > 0 ? (totalDias / totalTrabajadores) * 100 : 0;
  
  return {
    id: 'severidad_at',
    nombre: 'Severidad de Accidentalidad',
    valor: Math.round(valor * 100) / 100,
    formula: `(${diasIncapacidad} + ${diasCargados} días / ${totalTrabajadores} trabajadores) × 100`,
    periodo: 'mensual',
    unidad: '%',
    nivel: getNivelAlerta(valor, 'severidad'),
    icono: '🔴'
  };
}

/**
 * 3. Ausentismo por Causa Médica (Mensual)
 * Fórmula: (Días ausencia / Días programados) × 100
 */
function calcAusentismo(empresaId, year, month, totalTrabajadores, diasLaborables) {
  const diasAusencia = sumDiasIncapacidad(empresaId, year, month);
  const diasProgramados = totalTrabajadores * diasLaborables;
  
  const valor = diasProgramados > 0 ? (diasAusencia / diasProgramados) * 100 : 0;
  
  return {
    id: 'ausentismo',
    nombre: 'Ausentismo por Causa Médica',
    valor: Math.round(valor * 100) / 100,
    formula: `(${diasAusencia} días ausencia / ${diasProgramados} días programados) × 100`,
    periodo: 'mensual',
    unidad: '%',
    nivel: getNivelAlerta(valor, 'ausentismo'),
    icono: '🏥'
  };
}

/**
 * 4. Mortalidad por AT (Anual)
 * Fórmula: (AT mortales / Total AT) × 100
 */
function calcMortalidadAT(empresaId, year) {
  const numMortales = countMortalesInYear(empresaId, year);
  const totalAT = countATInYear(empresaId, year);
  
  const valor = totalAT > 0 ? (numMortales / totalAT) * 100 : 0;
  
  return {
    id: 'mortalidad_at',
    nombre: 'Mortalidad por AT',
    valor: Math.round(valor * 100) / 100,
    formula: `(${numMortales} mortales / ${totalAT} AT totales) × 100`,
    periodo: 'anual',
    unidad: '%',
    nivel: numMortales > 0 ? 'critico' : 'normal',
    icono: '☠️'
  };
}

/**
 * 5. Prevalencia de Enfermedad Laboral (Anual)
 * Fórmula: (Casos nuevos + antiguos EL / Promedio trabajadores) × 100,000
 */
function calcPrevalenciaEL(empresaId, year, promedioTrabajadores) {
  const casosEL = countELInYear(empresaId, year, false); // All cases
  
  const valor = promedioTrabajadores > 0 ? (casosEL / promedioTrabajadores) * 100000 : 0;
  
  return {
    id: 'prevalencia_el',
    nombre: 'Prevalencia de Enfermedad Laboral',
    valor: Math.round(valor * 100) / 100,
    formula: `(${casosEL} casos EL / ${promedioTrabajadores} trabajadores) × 100,000`,
    periodo: 'anual',
    unidad: 'por 100k',
    nivel: getNivelAlerta(valor, 'prevalencia'),
    icono: '🧬'
  };
}

/**
 * 6. Incidencia de Enfermedad Laboral (Anual)
 * Fórmula: (Casos nuevos EL / Promedio trabajadores) × 100,000
 */
function calcIncidenciaEL(empresaId, year, promedioTrabajadores) {
  const casosNuevos = countELInYear(empresaId, year, true); // Only new cases
  
  const valor = promedioTrabajadores > 0 ? (casosNuevos / promedioTrabajadores) * 100000 : 0;
  
  return {
    id: 'incidencia_el',
    nombre: 'Incidencia de Enfermedad Laboral',
    valor: Math.round(valor * 100) / 100,
    formula: `(${casosNuevos} casos nuevos / ${promedioTrabajadores} trabajadores) × 100,000`,
    periodo: 'anual',
    unidad: 'por 100k',
    nivel: getNivelAlerta(valor, 'incidencia'),
    icono: '📊'
  };
}

// ============================================
// HELPER FUNCTIONS (AUTO-CALCULATED)
// ============================================

/**
 * Count active employees in a specific month
 */
function countActiveEmployees(empresaId, year, month) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('empleados');
    
    if (!sheet) return 0;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Get column indices
    const empresaIdCol = headers.indexOf('empresa_id');
    const estadoCol = headers.indexOf('estado');
    
    if (empresaIdCol === -1) return 0;
    
    let count = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Match empresa and active status
      if (row[empresaIdCol] == empresaId && 
          (estadoCol === -1 || row[estadoCol] === 'activo' || row[estadoCol] === '')) {
        count++;
      }
    }
    
    return count;
    
  } catch (error) {
    Logger.log('Error counting employees: ' + error.message);
    return 0;
  }
}

/**
 * Get working days in a month (excludes weekends, simplified)
 */
function getWorkingDays(year, month) {
  // Simplified: assume 22 working days per month
  // Could be enhanced to calculate actual weekdays
  return 22;
}

/**
 * Count AT (accidents) in a specific month
 */
function countATInPeriod(empresaId, year, month) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('investigaciones_accidentes');
    
    if (!sheet) return 0;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const empresaIdCol = headers.indexOf('empresa_id');
    const fechaCol = headers.indexOf('fecha');
    const tipoCol = headers.indexOf('tipo');
    
    if (empresaIdCol === -1 || fechaCol === -1) return 0;
    
    let count = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const fecha = new Date(row[fechaCol]);
      
      if (row[empresaIdCol] == empresaId &&
          fecha.getFullYear() == year &&
          fecha.getMonth() + 1 == month &&
          (tipoCol === -1 || row[tipoCol] === 'accidente' || row[tipoCol] === '')) {
        count++;
      }
    }
    
    return count;
    
  } catch (error) {
    Logger.log('Error counting AT: ' + error.message);
    return 0;
  }
}

/**
 * Sum días de incapacidad in a month
 */
function sumDiasIncapacidad(empresaId, year, month) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('investigaciones_accidentes');
    
    if (!sheet) return 0;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const empresaIdCol = headers.indexOf('empresa_id');
    const fechaCol = headers.indexOf('fecha');
    const diasCol = headers.indexOf('dias_incapacidad');
    
    if (empresaIdCol === -1 || fechaCol === -1 || diasCol === -1) return 0;
    
    let total = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const fecha = new Date(row[fechaCol]);
      
      if (row[empresaIdCol] == empresaId &&
          fecha.getFullYear() == year &&
          fecha.getMonth() + 1 == month) {
        total += parseInt(row[diasCol]) || 0;
      }
    }
    
    return total;
    
  } catch (error) {
    Logger.log('Error summing días incapacidad: ' + error.message);
    return 0;
  }
}

/**
 * Sum días cargados based on consecuencia
 */
function sumDiasCargados(empresaId, year, month) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('investigaciones_accidentes');
    
    if (!sheet) return 0;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const empresaIdCol = headers.indexOf('empresa_id');
    const fechaCol = headers.indexOf('fecha');
    const consecuenciaCol = headers.indexOf('consecuencia');
    
    if (empresaIdCol === -1 || fechaCol === -1 || consecuenciaCol === -1) return 0;
    
    let total = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const fecha = new Date(row[fechaCol]);
      
      if (row[empresaIdCol] == empresaId &&
          fecha.getFullYear() == year &&
          fecha.getMonth() + 1 == month) {
        total += getDiasCargadosPorConsecuencia(row[consecuenciaCol]);
      }
    }
    
    return total;
    
  } catch (error) {
    Logger.log('Error summing días cargados: ' + error.message);
    return 0;
  }
}

/**
 * Get días cargados by consecuencia type
 */
function getDiasCargadosPorConsecuencia(consecuencia) {
  const map = {
    'mortal': 6000,
    'incapacidad_permanente_total': 6000,
    'incapacidad_permanente_parcial': 3000,
    'grave': 0,
    'leve': 0
  };
  
  return map[consecuencia] || 0;
}

/**
 * Count mortales in a year
 */
function countMortalesInYear(empresaId, year) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('investigaciones_accidentes');
    
    if (!sheet) return 0;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const empresaIdCol = headers.indexOf('empresa_id');
    const fechaCol = headers.indexOf('fecha');
    const consecuenciaCol = headers.indexOf('consecuencia');
    
    if (empresaIdCol === -1 || fechaCol === -1 || consecuenciaCol === -1) return 0;
    
    let count = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const fecha = new Date(row[fechaCol]);
      
      if (row[empresaIdCol] == empresaId &&
          fecha.getFullYear() == year &&
          row[consecuenciaCol] === 'mortal') {
        count++;
      }
    }
    
    return count;
    
  } catch (error) {
    Logger.log('Error counting mortales: ' + error.message);
    return 0;
  }
}

/**
 * Count total AT in a year
 */
function countATInYear(empresaId, year) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('investigaciones_accidentes');
    
    if (!sheet) return 0;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const empresaIdCol = headers.indexOf('empresa_id');
    const fechaCol = headers.indexOf('fecha');
    const tipoCol = headers.indexOf('tipo');
    
    if (empresaIdCol === -1 || fechaCol === -1) return 0;
    
    let count = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const fecha = new Date(row[fechaCol]);
      
      if (row[empresaIdCol] == empresaId &&
          fecha.getFullYear() == year &&
          (tipoCol === -1 || row[tipoCol] === 'accidente' || row[tipoCol] === '')) {
        count++;
      }
    }
    
    return count;
    
  } catch (error) {
    Logger.log('Error counting AT in year: ' + error.message);
    return 0;
  }
}

/**
 * Count EL (enfermedad laboral) cases in a year
 */
function countELInYear(empresaId, year, onlyNew) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('investigaciones_accidentes');
    
    if (!sheet) return 0;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const empresaIdCol = headers.indexOf('empresa_id');
    const fechaCol = headers.indexOf('fecha');
    const tipoCol = headers.indexOf('tipo');
    const esCasoNuevoCol = headers.indexOf('es_caso_nuevo');
    
    if (empresaIdCol === -1 || fechaCol === -1 || tipoCol === -1) return 0;
    
    let count = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const fecha = new Date(row[fechaCol]);
      
      if (row[empresaIdCol] == empresaId &&
          fecha.getFullYear() == year &&
          row[tipoCol] === 'enfermedad_laboral') {
        
        // If only counting new cases, check es_caso_nuevo flag
        if (onlyNew && esCasoNuevoCol !== -1) {
          if (row[esCasoNuevoCol] === true || row[esCasoNuevoCol] === 'true' || row[esCasoNuevoCol] === 'TRUE') {
            count++;
          }
        } else if (!onlyNew) {
          count++;
        }
      }
    }
    
    return count;
    
  } catch (error) {
    Logger.log('Error counting EL: ' + error.message);
    return 0;
  }
}

/**
 * Get alert level based on indicator value and thresholds
 */
function getNivelAlerta(valor, tipo) {
  // Simplified thresholds - can be customized per industry/company
  const thresholds = {
    'frecuencia': { alto: 5, medio: 2 },
    'severidad': { alto: 50, medio: 20 },
    'ausentismo': { alto: 5, medio: 2 },
    'prevalencia': { alto: 1000, medio: 500 },
    'incidencia': { alto: 800, medio: 400 }
  };
  
  const t = thresholds[tipo];
  if (!t) return 'normal';
  
  if (valor >= t.alto) return 'critico';
  if (valor >= t.medio) return 'alerta';
  return 'normal';
}
