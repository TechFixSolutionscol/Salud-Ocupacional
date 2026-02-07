/**
 * SG-SST Management System - Frontend Application
 * Main JavaScript file
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    currentUser: null,
    sessionToken: null,
    currentSection: 'dashboard',
    currentEmpresa: '',
    empresas: [],
    documentTypes: [],
    alertTypes: [],
    isLoading: false
};

// ============================================
// API COMMUNICATION
// ============================================

// Production deployment URL
const DEPLOYMENT_URL = 'https://script.google.com/macros/s/AKfycbx1JRo7pSeA1rfZLjdQVlMfyKd-6SMB3-RK_IX4rHfU5PjLLOLrrdmzLVY0X_GbmHUjBw/exec';

/**
 * Call backend function
 */
/**
 * Call backend function
 * Supports both GAS Environment (google.script.run) and Local Environment (JSONP)
 */
async function callBackend(action, params = {}) {
    return new Promise((resolve, reject) => {
        // 1. Google Apps Script Environment
        if (typeof google !== 'undefined' && google.script) {
            google.script.run
                .withSuccessHandler(result => resolve(result))
                .withFailureHandler(error => reject(error))
                .apiDispatcher({ action, params });
        }
        // 2. Local Environment (JSONP Tunnel)
        else {
            requestJsonp(action, params)
                .then(resolve)
                .catch(reject);
        }
    });
}

/**
 * Make a JSONP request to Google Apps Script
 */
function requestJsonp(action, params) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_cb_' + Math.round(100000 * Math.random());
        const script = document.createElement('script');

        // Timeout handling (30 seconds)
        const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('Timeout: El servidor tardó demasiado en responder.'));
        }, 30000);

        // Cleanup function
        function cleanup() {
            delete window[callbackName];
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            clearTimeout(timeoutId);
        }

        // Define global callback
        window[callbackName] = function (data) {
            cleanup();
            resolve(data);
        };

        // Handle script loading errors
        script.onerror = function () {
            cleanup();
            reject(new Error('Error de conexión (Script Load Error). Verifica tu URL de despliegue.'));
        };

        // Construct URL
        const payload = JSON.stringify({ action: action, params: params });
        const url = `${DEPLOYMENT_URL}?callback=${callbackName}&payload=${encodeURIComponent(payload)}`;

        script.src = url;
        document.body.appendChild(script);
    });
}

/**
 * Mock data for local development
 */
function getMockData(action, params) {
    // Auth mocks
    if (action === 'loginUsuario') {
        if (params.email === 'admin@sgsst.com' && params.password === '123456') {
            return {
                success: true,
                data: {
                    usuario_id: '1',
                    nombre: 'Admin Sistema',
                    email: 'admin@sgsst.com',
                    rol: 'admin',
                    empresa_id: '',
                    token: 'mock-token-123'
                }
            };
        }
        return { success: false, error: 'Credenciales inválidas' };
    }

    if (action === 'validateSession') {
        if (params.token === 'mock-token-123') {
            return {
                success: true,
                valid: true,
                data: {
                    usuario_id: '1',
                    nombre: 'Admin Sistema',
                    email: 'admin@sgsst.com',
                    rol: 'admin',
                    empresa_id: ''
                }
            };
        }
        return { success: false, valid: false };
    }

    if (action === 'logoutUsuario') {
        return { success: true };
    }

    const mockEmpresas = [
        { empresa_id: '1', nombre: 'Empresa Demo S.A.S', nit: '900123456', telefono: '3001234567', responsable_sst: 'Juan Pérez', estado: 'activo', fecha_registro: '2024-01-15' },
        { empresa_id: '2', nombre: 'Construcciones ABC', nit: '900789012', telefono: '3109876543', responsable_sst: 'María García', estado: 'activo', fecha_registro: '2024-02-20' }
    ];

    const mockEmpleados = [
        { empleado_id: '1', empresa_id: '1', nombre: 'Pedro López', cedula: '1234567890', cargo: 'Operario', area: 'Producción', estado: 'activo' },
        { empleado_id: '2', empresa_id: '1', nombre: 'Ana Martínez', cedula: '0987654321', cargo: 'Supervisor', area: 'Calidad', estado: 'activo' }
    ];

    const mockDocumentos = [
        { documento_id: '1', empresa_id: '1', tipo_documento: 'POL_SST', nombre: 'Política SST 2024', fecha_emision: '2024-01-01', fecha_vencimiento: '2025-01-01', estado: 'vigente', responsable: 'Juan Pérez' },
        { documento_id: '2', empresa_id: '1', tipo_documento: 'MATRIZ_RIESGOS', nombre: 'Matriz de Riesgos', fecha_emision: '2024-01-15', fecha_vencimiento: '2024-03-15', estado: 'por_vencer', responsable: 'María García' }
    ];

    const mockAlertas = [
        { alerta_id: '1', empresa_id: '1', tipo_alerta: 'DOC_POR_VENCER', mensaje: 'Matriz de Riesgos próxima a vencer', prioridad: 'media', estado: 'pendiente', fecha_alerta: '2024-02-01' },
        { alerta_id: '2', empresa_id: '1', tipo_alerta: 'EXAMEN_VENCIDO', mensaje: 'Examen médico vencido - Pedro López', prioridad: 'alta', estado: 'pendiente', fecha_alerta: '2024-02-15' }
    ];

    const mockUsuarios = [
        { usuario_id: '1', nombre: 'Admin Sistema', email: 'admin@sgsst.com', rol: 'admin', empresa_id: '', estado: 'activo' },
        { usuario_id: '2', nombre: 'Operador Demo', email: 'operador@empresa.com', rol: 'operador', empresa_id: '1', estado: 'activo' }
    ];

    switch (action) {
        case 'getDashboardData':
            return {
                success: true,
                data: {
                    stats: {
                        totalEmpresas: 2,
                        totalEmpleados: 15,
                        totalDocumentos: 8,
                        documentosVigentes: 5,
                        documentosPorVencer: 2,
                        documentosVencidos: 1,
                        alertasPendientes: 3,
                        alertasPrioridadAlta: 1
                    },
                    recentAlertas: mockAlertas,
                    docsProximosVencer: mockDocumentos.filter(d => d.estado === 'por_vencer'),
                    cumplimiento: 75
                }
            };
        case 'getEmpresas': return { success: true, data: mockEmpresas };
        case 'getEmpleados': return { success: true, data: mockEmpleados };
        case 'getDocumentos': return { success: true, data: mockDocumentos };
        case 'getAlertas': return { success: true, data: mockAlertas };
        case 'getUsuarios': return { success: true, data: mockUsuarios };
        default: return { success: true, data: [] };
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    checkSession();
}

async function loadInitialData() {
    showLoading();
    try {
        // Load empresas for selectors
        const empresasResult = await callBackend('getEmpresas', { estado: 'activo' });
        if (empresasResult.success) {
            state.empresas = empresasResult.data;
            populateEmpresaSelectors();
        }

        // Load dashboard data
        await loadDashboard();
    } catch (error) {
        showToast('Error loading initial data: ' + error.message, 'error');
    }
    hideLoading();
}

// ============================================
// AUTHENTICATION
// ============================================

async function checkSession() {
    const token = localStorage.getItem('sgsst_token');

    if (!token) {
        showLogin();
        return;
    }

    showLoading();
    try {
        const result = await callBackend('validateSession', { token });

        if (result.success && result.valid) {
            state.currentUser = result.data;
            state.sessionToken = token;
            showApp();
        } else {
            localStorage.removeItem('sgsst_token');
            showLogin();
        }
    } catch (error) {
        console.error('Session check failed', error);
        // Offline support: If network fails, keep session but maybe warn user?
        // For now, force login to be safe
        showLogin();
    }
    hideLoading();
}

function showLogin() {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');

    // Setup login form
    const loginForm = document.getElementById('loginForm');
    const newLoginForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newLoginForm, loginForm);
    newLoginForm.addEventListener('submit', handleLogin);
}

function showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    if (state.currentUser) {
        document.getElementById('currentUser').textContent = state.currentUser.nombre;
        const roles = { 'admin': 'Administrador', 'operador': 'Operador', 'consulta': 'Solo Consulta' };
        document.getElementById('currentRole').textContent = roles[state.currentUser.rol] || state.currentUser.rol;
    }

    setupEventListeners();
    loadInitialData();
    showSection('dashboard');
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');

    errorDiv.classList.add('hidden');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Iniciando sesión...';

    try {
        // Now callBackend handles the Local->GAS tunnel automatically
        const result = await callBackend('loginUsuario', { email, password });

        if (result.success) {
            state.currentUser = result.data;
            state.sessionToken = result.data.token;
            localStorage.setItem('sgsst_token', result.data.token);
            showApp();
        } else {
            errorDiv.textContent = result.error || 'Error al iniciar sesión';
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = 'Error de conexión: ' + error.message;
        errorDiv.classList.remove('hidden');
    }

    loginBtn.disabled = false;
    loginBtn.textContent = 'Iniciar Sesión';
}

function logout() {
    if (confirm('¿Está seguro de cerrar sesión?')) {
        callBackend('logoutUsuario', { token: state.sessionToken });
        localStorage.removeItem('sgsst_token');
        state.currentUser = null;
        state.sessionToken = null;
        window.location.reload();
    }
}

async function loadInitialData() {
    showLoading();
    try {
        // Load empresas for selectors
        const empresasResult = await callBackend('getEmpresas', { estado: 'activo' });
        if (empresasResult.success) {
            state.empresas = empresasResult.data;
            populateEmpresaSelectors();
        }

        // Load dashboard data
        await loadDashboard();
    } catch (error) {
        showToast('Error loading initial data: ' + error.message, 'error');
    }
    hideLoading();
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
        });
    });

    // Card actions with section navigation
    document.querySelectorAll('.card-action').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (section) showSection(section);
        });
    });

    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    // Empresa selector
    document.getElementById('empresaSelector').addEventListener('change', (e) => {
        state.currentEmpresa = e.target.value;
        refreshCurrentSection();
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') closeModal();
    });

    // Section-specific event listeners
    setupEmpresasEvents();
    setupEmpleadosEvents();
    // setupDocumentosEvents(); // Removed - Replaced by setupStandardsEvents
    setupAlertasEvents();
    setupReportesEvents();
    setupUsuariosEvents();
    setupProcesosEvents();
    setupRiesgosEvents();
    setupInvestigacionesEvents();
    setupPlanesEvents();
    setupAuditoriasEvents();
    setupStandardsEvents();
}

// ============================================
// REPORTES AVANZADOS (PHASE 3)
// ============================================

function setupReportesEvents() {
    // Handle specific report button clicks within the cards
    document.querySelectorAll('.report-actions button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.report-card');
            const type = card.dataset.report;
            const format = e.target.textContent.includes('PDF') ? 'pdf' : 'excel';

            generateFullReport(type, state.currentEmpresa, format);
        });
    });
}

function loadReportes() {
    // Just ensure the section is visible. 
    // The cards are static HTML for now, but could be dynamic updates later.
}

// ============================================
// MATRIZ DE RIESGOS (GTC-45)
// ============================================

let riesgosData = [];

function setupRiesgosEvents() {
    document.getElementById('addRiesgoBtn').addEventListener('click', () => openRiesgoModal());
    document.getElementById('riesgosFilterBtn').addEventListener('click', filterRiesgos);
}

async function loadRiesgos() {
    const empresaId = state.currentEmpresa;
    if (!empresaId) return;

    const tableBody = document.getElementById('riesgosTableBody');
    tableBody.innerHTML = '<tr><td colspan="6" class="loading"><div class="spinner"></div> Cargando matriz...</td></tr>';

    try {
        // Need processes for context
        const [riesgosResult, procesosResult] = await Promise.all([
            callBackend('getMatrizRiesgos', { empresaId }),
            callBackend('getProcesos', { empresaId }) // We assume this exists or returns empty
        ]);

        if (riesgosResult.success) {
            riesgosData = riesgosResult.data;
            state.procesos = procesosResult.success ? procesosResult.data : []; // Cache processes
            renderRiesgosTable(riesgosData);
            populateRiesgosFilters();
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" class="error-msg">Error: ${riesgosResult.error}</td></tr>`;
        }
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="6" class="error-msg">Error de conexión</td></tr>';
    }
}

function renderRiesgosTable(data) {
    const tableBody = document.getElementById('riesgosTableBody');
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay riesgos registrados.</td></tr>';
        return;
    }

    tableBody.innerHTML = data.map(r => {
        let badgeClass = 'success';
        if (r.interpretacion_nr === 'I') badgeClass = 'danger';
        if (r.interpretacion_nr === 'II') badgeClass = 'warning';
        if (r.interpretacion_nr === 'III') badgeClass = 'info';

        return `
        <tr>
            <td>
                <div class="fw-bold">${r.proceso_id || 'N/A'}</div>
                <small class="text-muted">${r.actividad || ''}</small>
            </td>
            <td>
                <div class="fw-bold">${r.peligro_descripcion}</div>
                <small class="text-muted">${r.peligro_clasificacion}</small>
            </td>
            <td class="text-center">
                <div class="fs-5 fw-bold">${r.nivel_riesgo}</div>
            </td>
            <td class="text-center">
                <span class="badge badge-${badgeClass}">Nivel ${r.interpretacion_nr}</span>
            </td>
            <td>${r.aceptabilidad}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" onclick="openRiesgoModal('${r.riesgo_id}')" title="Editar">✏️</button>
                    <button class="btn-icon text-danger" onclick="deleteRiesgo('${r.riesgo_id}')" title="Eliminar">🗑️</button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

function populateRiesgosFilters() {
    // Populate Process Select
    const select = document.getElementById('riesgoProceso');
    const uniqueProcesos = [...new Set(riesgosData.map(r => r.proceso_id).filter(Boolean))];
    select.innerHTML = '<option value="">Todos los procesos</option>' +
        uniqueProcesos.map(p => `<option value="${p}">${p}</option>`).join('');
}

function filterRiesgos() {
    const proc = document.getElementById('riesgoProceso').value;
    const nivel = document.getElementById('riesgoNivel').value; // I, II, III, IV

    const filtered = riesgosData.filter(r => {
        return (!proc || r.proceso_id === proc) &&
            (!nivel || r.interpretacion_nr === nivel);
    });

    renderRiesgosTable(filtered);
}

// Modal & Form Logic
function openRiesgoModal(id = null) {
    const isEdit = !!id;
    const riesgo = isEdit ? riesgosData.find(r => r.riesgo_id === id) : {};

    // GTC-45 Options
    const deficienciaOpts = [
        { val: '10', label: '10 - Muy Alto' }, { val: '6', label: '6 - Alto' },
        { val: '2', label: '2 - Medio' }, { val: '0', label: '0 - Bajo' }
    ];
    const exposicionOpts = [
        { val: '4', label: '4 - Continua' }, { val: '3', label: '3 - Frecuente' },
        { val: '2', label: '2 - Ocasional' }, { val: '1', label: '1 - Esporádica' }
    ];
    const consecuenciaOpts = [
        { val: '100', label: '100 - Mortal/Catastrófico' }, { val: '60', label: '60 - Muy Grave' },
        { val: '25', label: '25 - Grave' }, { val: '10', label: '10 - Leve' }
    ];

    const modalBody = `
        <form id="riesgoForm">
            <input type="hidden" name="riesgo_id" value="${riesgo.riesgo_id || ''}">
            
            <div class="wizard-step active">
                <h4>1. Identificación</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Proceso</label>
                        <input type="text" name="proceso_id" class="form-input" value="${riesgo.proceso_id || ''}" required list="procesosList">
                        <datalist id="procesosList">
                            ${(state.procesos || []).map(p => `<option value="${p.nombre}">`).join('')}
                        </datalist>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Actividad</label>
                        <input type="text" name="actividad" class="form-input" value="${riesgo.actividad || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Descripción del Peligro</label>
                    <input type="text" name="peligro_descripcion" class="form-input" value="${riesgo.peligro_descripcion || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Clasificación (GTC 45)</label>
                    <select name="peligro_clasificacion" class="form-select">
                        <option value="Biológico" ${riesgo.peligro_clasificacion === 'Biológico' ? 'selected' : ''}>Biológico</option>
                        <option value="Físico" ${riesgo.peligro_clasificacion === 'Físico' ? 'selected' : ''}>Físico</option>
                        <option value="Químico" ${riesgo.peligro_clasificacion === 'Químico' ? 'selected' : ''}>Químico</option>
                        <option value="Psicosocial" ${riesgo.peligro_clasificacion === 'Psicosocial' ? 'selected' : ''}>Psicosocial</option>
                        <option value="Biomecánico" ${riesgo.peligro_clasificacion === 'Biomecánico' ? 'selected' : ''}>Biomecánico</option>
                        <option value="Condiciones de Seguridad" ${riesgo.peligro_clasificacion === 'Condiciones de Seguridad' ? 'selected' : ''}>Condiciones de Seguridad</option>
                        <option value="Fenómenos Naturales" ${riesgo.peligro_clasificacion === 'Fenómenos Naturales' ? 'selected' : ''}>Fenómenos Naturales</option>
                    </select>
                </div>
                
                <h4>2. Evaluación (GTC 45)</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nivel Deficiencia (ND)</label>
                        <select name="nivel_deficiencia" id="calcND" class="form-select" onchange="calculateGTC45Live()">
                            ${deficienciaOpts.map(o => `<option value="${o.val}" ${riesgo.nivel_deficiencia == o.val ? 'selected' : ''}>${o.label}</option>`).join('')}
                        </select>
                    </div>
                     <div class="form-group">
                        <label class="form-label">Nivel Exposición (NE)</label>
                        <select name="nivel_exposicion" id="calcNE" class="form-select" onchange="calculateGTC45Live()">
                            ${exposicionOpts.map(o => `<option value="${o.val}" ${riesgo.nivel_exposicion == o.val ? 'selected' : ''}>${o.label}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="stats-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div class="stat-card" style="padding: 0.5rem;">NP: <strong id="resNP">0</strong></div>
                    <div class="stat-card" style="padding: 0.5rem;" id="resIntNP">...</div>
                </div>

                <div class="form-group">
                    <label class="form-label">Nivel Consecuencia (NC)</label>
                    <select name="nivel_consecuencia" id="calcNC" class="form-select" onchange="calculateGTC45Live()">
                        ${consecuenciaOpts.map(o => `<option value="${o.val}" ${riesgo.nivel_consecuencia == o.val ? 'selected' : ''}>${o.label}</option>`).join('')}
                    </select>
                </div>

                <div class="result-card" style="background:var(--bg-hover); padding:1rem; border-radius:8px;">
                     <div style="display:flex; justify-content:space-between;">
                        <span>Nivel Riesgo (NR): <strong id="resNR">0</strong></span>
                        <span class="badge" id="resIntNR">...</span>
                     </div>
                     <div style="margin-top:0.5rem; font-weight:bold; text-align:center;" id="resAcept">...</div>
                </div>

                <h4 style="margin-top:1rem;">3. Intervención</h4>
                <div class="form-group">
                    <label class="form-label">Medidas de Intervención</label>
                    <textarea name="medidas_intervencion" class="form-textarea" placeholder="Eliminación, Sustitución, Controles...">${riesgo.medidas_intervencion || ''}</textarea>
                </div>
            </div>
        </form>
    `;

    openModal(isEdit ? 'Editar Riesgo' : 'Nuevo Riesgo', modalBody, () => saveRiesgo(isEdit));
    calculateGTC45Live(); // Initial calc
}

window.calculateGTC45Live = function () {
    const nd = parseInt(document.getElementById('calcND').value) || 0;
    const ne = parseInt(document.getElementById('calcNE').value) || 0;
    const nc = parseInt(document.getElementById('calcNC').value) || 0;

    const np = nd * ne;
    const nr = np * nc;

    document.getElementById('resNP').textContent = np;

    // Interpretacion NP
    let intNp = 'Bajo';
    if (np >= 40) intNp = 'Muy Alto';
    else if (np >= 24) intNp = 'Alto';
    else if (np >= 10) intNp = 'Medio';
    document.getElementById('resIntNP').textContent = intNp;

    document.getElementById('resNR').textContent = nr;

    // Interpretacion NR
    let intNr = 'IV';
    let color = 'success';
    let acept = 'ACEPTABLE';

    if (nr >= 600) { intNr = 'I'; color = 'danger'; acept = 'NO ACEPTABLE'; }
    else if (nr >= 150) { intNr = 'II'; color = 'warning'; acept = 'NO ACEPTABLE O ACEPTABLE CON CONTROL'; }
    else if (nr >= 40) { intNr = 'III'; color = 'info'; acept = 'MEJORABLE'; }

    const badge = document.getElementById('resIntNR');
    badge.textContent = `Nivel ${intNr}`;
    badge.className = `badge badge-${color}`;

    const aceptDiv = document.getElementById('resAcept');
    aceptDiv.textContent = acept;
    aceptDiv.style.color = (color === 'danger' || color === 'warning') ? 'var(--accent-danger)' : 'var(--accent-success)';
};

async function saveRiesgo(isEdit) {
    const form = document.getElementById('riesgoForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    data.empresa_id = state.currentEmpresa; // Ensure company context

    const action = isEdit ? 'updateRiesgo' : 'createRiesgo';

    showToast('Guardando...', 'info');

    try {
        const result = await callBackend(action, data);
        if (result.success) {
            showToast('Riesgo guardado exitosamente', 'success');
            closeModal();
            loadRiesgos();
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

window.deleteRiesgo = async function (id) {
    if (!confirm('¿Está seguro de eliminar este riesgo?')) return;

    try {
        const result = await callBackend('deleteRiesgo', { riesgo_id: id });
        if (result.success) {
            showToast('Riesgo eliminado', 'success');
            loadRiesgos();
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (e) { /*...*/ }
};


// ============================================
// ESTANDARES Y DOCUMENTOS (PHASE 2)
// ============================================

let standardsData = []; // Store loaded standards
let currentTab = 'planear'; // Default tab

function setupStandardsEvents() {
    // 1. Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentTab = e.target.dataset.tab; // planear, hacer, verificar, actuar
            filterAndRenderStandards();
        });
    });

    // 2. Filters
    document.getElementById('stdSearch').addEventListener('input', filterAndRenderStandards);
    document.getElementById('stdFilterState').addEventListener('change', filterAndRenderStandards);
}

async function loadStandards() {
    const empresaId = state.currentEmpresa;
    if (!empresaId) return;

    const listContainer = document.getElementById('standardsList');
    listContainer.innerHTML = '<div class="loading"><div class="spinner"></div> Cargando estándares...</div>';

    try {
        const result = await callBackend('getEstandares', { empresaId });
        if (result.success) {
            standardsData = result.data;

            // Update Header Info
            const subtitle = document.getElementById('standardsSubtitle');
            const type = result.meta.clasificacion;
            let label = 'Desconocido';
            if (type === 'ESTANDARES_7') label = 'Estándares Mínimos (7 Ítems)';
            else if (type === 'ESTANDARES_21') label = 'Estándares Medios (21 Ítems)';
            else if (type === 'ESTANDARES_60') label = 'Estándares Máximos (>50 / Riesgo Alto)';

            subtitle.textContent = `Empresa: ${getCompanyName(empresaId)} | Clasificación: ${label}`;

            // Initial Render
            filterAndRenderStandards();
            updateProgress();
        } else {
            console.error('getEstandares failed:', result.error); // Log to console
            listContainer.innerHTML = `<div class="alert-item alta">Error (Backend): ${result.error}</div>`;
        }
    } catch (error) {
        console.error('loadStandards failed:', error);
        listContainer.innerHTML = `<div class="alert-item alta">Error de conexión al cargar estándares: ${error.message}</div>`;
    }
}

function filterAndRenderStandards() {
    const listContainer = document.getElementById('standardsList');
    const searchTerm = document.getElementById('stdSearch').value.toLowerCase();
    const filterState = document.getElementById('stdFilterState').value;

    // Filter by Tab (Cycle), Search, and State
    const filtered = standardsData.filter(std => {
        // 1. Cycle Filter (Map 'I. PLANEAR' -> 'planear')
        const cycleKey = std.ciclo.split('.')[1].trim().toLowerCase();
        if (cycleKey !== currentTab) return false;

        // 2. Search
        const matchesSearch = std.nombre.toLowerCase().includes(searchTerm) ||
            std.codigo.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;

        // 3. State
        if (filterState !== 'all' && std.estado !== filterState) return false;

        return true;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div class="loading">No se encontraron estándares en esta sección.</div>';
        return;
    }

    listContainer.innerHTML = filtered.map(std => renderStandardItem(std)).join('');

    // Re-attach event listeners for newly created elements
    attachStandardItemEvents();
}

function renderStandardItem(std) {
    let statusIcon = '⚪';
    let statusClass = '';

    if (std.estado === 'CUMPLE') { statusIcon = '✅'; statusClass = 'cumple'; }
    else if (std.estado === 'NO_CUMPLE') { statusIcon = '❌'; statusClass = 'no-cumple'; }
    else if (std.estado === 'NO_APLICA') { statusIcon = '➖'; statusClass = 'no-aplica'; }

    return `
    <div class="standard-item" data-code="${std.codigo}">
        <div class="std-header" onclick="toggleStandard('${std.codigo}')">
            <span class="std-status-icon">${statusIcon}</span>
            <span class="std-code">${std.codigo}</span>
            <span class="std-name">${std.nombre}</span>
            <span class="std-weight">Peso: ${std.peso}%</span>
        </div>
        <div class="std-body" id="body-${std.codigo}">
            <div class="form-group">
                <label class="form-label">Estado de Cumplimiento:</label>
                <div class="std-status-group">
                    <button class="status-btn ${std.estado === 'CUMPLE' ? 'active' : ''}" 
                        onclick="updateStandardStatus('${std.codigo}', 'CUMPLE') " data-status="CUMPLE">CUMPLE</button>
                    <button class="status-btn ${std.estado === 'NO_CUMPLE' ? 'active' : ''}" 
                        onclick="updateStandardStatus('${std.codigo}', 'NO_CUMPLE')" data-status="NO_CUMPLE">NO CUMPLE</button>
                    <button class="status-btn ${std.estado === 'NO_APLICA' ? 'active' : ''}" 
                        onclick="updateStandardStatus('${std.codigo}', 'NO_APLICA')" data-status="NO_APLICA">NO APLICA</button>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Observaciones / Hallazgos:</label>
                <textarea class="form-textarea" id="obs-${std.codigo}" placeholder="Describa el hallazgo o justificación..." onchange="saveObservation('${std.codigo}')">${std.observacion || ''}</textarea>
            </div>
             <div class="std-actions">
                <button class="btn btn-secondary btn-sm" onclick="openEvidenceModal('${std.codigo}')">📎 Gestionar Evidencias ${std.evidencia_doc_id ? '(1)' : ''}</button>
                <button class="btn btn-secondary btn-sm" onclick="createStandardPlan('${std.codigo}')">⚡ Crear Plan de Acción</button>
            </div>
        </div>
    </div>
    `;
}

// Helper to get company name from state (assuming loaded)
function getCompanyName(id) {
    if (!state.empresas) return id;
    const emp = state.empresas.find(e => e.empresa_id === id);
    return emp ? emp.nombre : id;
}

// ============================================
// GESTIÓN DE EVIDENCIAS (MODAL)
// ============================================

window.openEvidenceModal = async function (code) {
    const std = standardsData.find(s => s.codigo === code);
    if (!std) return;

    // Load available documents
    let docs = [];
    try {
        const res = await callBackend('getDocumentos', { empresa_id: state.currentEmpresa });
        if (res.success) docs = res.data;
    } catch (e) { console.error(e); }

    const currentDoc = docs.find(d => d.documento_id === std.evidencia_doc_id);

    const modalBody = `
        <div style="padding: 1rem;">
            <p><strong>Estándar:</strong> ${std.codigo} - ${std.nombre}</p>
            <p>Seleccione un documento existente como evidencia o suba uno nuevo en la sección de Documentos.</p>
            
            <div class="form-group">
                <label class="form-label">Documento Vinculado</label>
                <select id="evidenceSelect" class="form-select">
                    <option value="">-- Sin evidencia --</option>
                    ${docs.map(d => `<option value="${d.documento_id}" ${std.evidencia_doc_id === d.documento_id ? 'selected' : ''}>${d.nombre} (${d.tipo_documento})</option>`).join('')}
                </select>
            </div>

            <div id="docPreview" style="margin-top:1rem; padding:1rem; background:#f5f5f5; border-radius:8px; display:${currentDoc ? 'block' : 'none'}">
                ${currentDoc ? `🔗 <a href="${currentDoc.url_documento}" target="_blank">Ver Documento Actual</a>` : ''}
            </div>
        </div>
    `;

    openModal('Gestionar Evidencia', modalBody, async () => {
        const selectedId = document.getElementById('evidenceSelect').value;

        // Save to backend
        try {
            const result = await callBackend('updateEstandar', {
                empresa_id: state.currentEmpresa,
                codigo_estandar: code,
                estado: std.estado,
                evidencia_doc_id: selectedId
            });

            if (result.success) {
                showToast('Evidencia vinculada correctamente', 'success');
                // Update local state
                std.evidencia_doc_id = selectedId;
                filterAndRenderStandards(); // Re-render to show updated count
                closeModal();
            } else {
                showToast('Error: ' + result.error, 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        }
    });

    // Simple listener for preview update
    setTimeout(() => {
        const sel = document.getElementById('evidenceSelect');
        if (sel) {
            sel.addEventListener('change', (e) => {
                const d = docs.find(doc => doc.documento_id === e.target.value);
                const prev = document.getElementById('docPreview');
                if (d && d.url_documento) {
                    prev.style.display = 'block';
                    prev.innerHTML = `🔗 <a href="${d.url_documento}" target="_blank">Ver Documento Seleccionado</a>`;
                } else {
                    prev.style.display = 'none';
                }
            });
        }
    }, 100);
};

window.createStandardPlan = function (code) {
    const std = standardsData.find(s => s.codigo === code);
    if (!std) return;

    // We reuse the existing Plan Modal logic but pre-fill it
    // We need to slightly modify openPlanModal or just hack it here by setting values after open
    // Since openPlanModal is async/complex, let's call it then fill

    openPlanModal();

    // Small timeout to allow modal to render
    setTimeout(() => {
        const activityInput = document.querySelector('input[name="actividad_intervencion"]');
        const obsInput = document.createElement('textarea'); // We might need to inject if not there, but let's use existing fields

        if (activityInput) {
            activityInput.value = `Plan de Acción Estándar ${code}: ${std.nombre}`;
        }

        // We might want to store the standard reference. 
        // Current form has risk_id. We can leave it empty or maybe use it if strictly needed.
        // For now, the activity name is the main link.
    }, 200);
};

// Global functions for inline onclick handlers (needs to be window scope or attached)
// For cleaner code, we'll attach these to window
window.toggleStandard = function (code) {
    const body = document.getElementById(`body-${code}`);
    if (body) {
        const isOpen = body.classList.contains('open');
        // Close others? Optional.
        body.classList.toggle('open');
    }
};

window.updateStandardStatus = async function (code, newStatus) {
    const empresaId = state.currentEmpresa;

    // Optimistic UI Update
    const stdIndex = standardsData.findIndex(s => s.codigo === code);
    if (stdIndex === -1) return;

    const oldStatus = standardsData[stdIndex].estado;
    standardsData[stdIndex].estado = newStatus;

    // Update DOM immediately to reflect change
    filterAndRenderStandards();
    updateProgress();

    try {
        const result = await callBackend('updateEstandar', {
            empresa_id: empresaId,
            codigo_estandar: code,
            estado: newStatus,
            observacion: document.getElementById(`obs-${code}`) ? document.getElementById(`obs-${code}`).value : ''
        });

        if (!result.success) {
            // Revert on error
            standardsData[stdIndex].estado = oldStatus;
            filterAndRenderStandards();
            showToast('Error al actualizar: ' + result.error, 'error');
        }
    } catch (error) {
        standardsData[stdIndex].estado = oldStatus;
        filterAndRenderStandards();
        showToast('Error de conexión', 'error');
    }
};

window.saveObservation = async function (code) {
    const val = document.getElementById(`obs-${code}`).value;
    const std = standardsData.find(s => s.codigo === code);
    if (std) {
        std.observacion = val;
        // Silent save
        await callBackend('updateEstandar', {
            empresa_id: state.currentEmpresa,
            codigo_estandar: code,
            estado: std.estado,
            observacion: val
        });
    }
};


function updateProgress() {
    if (!standardsData.length) return;

    const totalWeight = standardsData.reduce((acc, curr) => acc + curr.peso, 0);
    const achievedWeight = standardsData.reduce((acc, curr) => {
        if (curr.estado === 'CUMPLE' || curr.estado === 'NO_APLICA') {
            return acc + curr.peso; // NO_APLICA counts as compliant usually, or excluded from base. Res 0312 says it justifies total.
            // Simplified: If NO_APLICA, we give the points if justified. Assume justified for now.
        }
        return acc;
    }, 0);

    const percentage = Math.round((achievedWeight / totalWeight) * 100) || 0;

    document.getElementById('standardsProgress').style.width = `${percentage}%`;
    document.getElementById('standardsProgressText').textContent = `${percentage}%`;
}

function attachStandardItemEvents() {
    // Empty for now as we use inline onclicks for simplicity in generated HTML
}


// ============================================
// WIZARD CLASIFICACIÓN (BLOQUE 0)
// ============================================

function setupWizardEvents() {
    // Inputs change listeners for real-time calculation
    document.getElementById('wizTrabajadores').addEventListener('input', calculateStandard);
    document.getElementById('wizRiesgo').addEventListener('change', calculateStandard);

    // Save button
    document.getElementById('wizSaveBtn').addEventListener('click', saveClassification);
}

function calculateStandard() {
    const workers = parseInt(document.getElementById('wizTrabajadores').value) || 0;
    const risk = document.getElementById('wizRiesgo').value;
    const resultDiv = document.getElementById('wizResult');
    const resultText = document.getElementById('wizClassificationText');
    const resultBadge = document.getElementById('wizStandardBadge');
    const saveBtn = document.getElementById('wizSaveBtn');

    if (workers > 0 && risk) {
        resultDiv.classList.remove('hidden');
        let standardType = '';
        let standardLabel = '';

        // Logic based on Res. 0312/2019
        if (risk === 'IV' || risk === 'V') {
            standardType = 'ESTANDARES_60';
            standardLabel = 'Estándares Máximos (>50 o Riesgo IV/V)';
        } else if (workers > 50) {
            standardType = 'ESTANDARES_60';
            standardLabel = 'Estándares Máximos (>50 Trabajadores)';
        } else if (workers > 10) {
            standardType = 'ESTANDARES_21';
            standardLabel = 'Estándares Medios (11-50 Trabajadores)';
        } else {
            standardType = 'ESTANDARES_7';
            standardLabel = 'Estándares Mínimos (Microempresas)';
        }

        resultText.textContent = standardLabel;
        resultBadge.textContent = (standardType === 'ESTANDARES_60' ? '60 Ítems' : (standardType === 'ESTANDARES_21' ? '21 Ítems' : '7 Ítems'));

        // Store calculated type in dataset for saving
        resultDiv.dataset.type = standardType;
        saveBtn.disabled = false;
    } else {
        resultDiv.classList.add('hidden');
        saveBtn.disabled = true;
    }
}

async function saveClassification() {
    const empresaId = state.currentEmpresa;
    if (!empresaId) return;

    const workers = document.getElementById('wizTrabajadores').value;
    const risk = document.getElementById('wizRiesgo').value;
    const type = document.getElementById('wizResult').dataset.type;

    const btn = document.getElementById('wizSaveBtn');
    btn.textContent = 'Guardando...';
    btn.disabled = true;

    try {
        const result = await callBackend('updateEmpresa', {
            empresa_id: empresaId,
            numero_trabajadores: workers,
            nivel_riesgo: risk,
            clasificacion_tipo: type
        });

        if (result.success) {
            showToast('Clasificación guardada correctamente', 'success');
            document.getElementById('wizardOverlay').classList.add('hidden');
            // Refresh dashboard to apply new standards (TODO: Filter logic in next phase)
            loadDashboard();
        } else {
            showToast('Error al guardar: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }

    btn.textContent = 'Guardar y Configurar Estándares';
    btn.disabled = false;
}

function checkEmpresaClassification(empresa) {
    // If no classification, show wizard
    if (!empresa.clasificacion_tipo || !empresa.nivel_riesgo) {
        showWizard();
    }
}

function showWizard() {
    const overlay = document.getElementById('wizardOverlay');
    overlay.classList.remove('hidden');
    // Pre-fill if data exists (edit mode)
    // For now, reset
    document.getElementById('wizTrabajadores').value = '';
    document.getElementById('wizRiesgo').value = '';
    document.getElementById('wizResult').classList.add('hidden');
    document.getElementById('wizSaveBtn').disabled = true;
}

// ============================================
// NAVIGATION
// ============================================

function showSection(sectionName) {
    state.currentSection = sectionName;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionName);
    });

    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    const section = document.getElementById(`${sectionName}Section`);
    if (section) {
        section.classList.remove('hidden');
    }

    // Update header title
    const titles = {
        dashboard: 'Dashboard',
        empresas: 'Empresas',
        empleados: 'Empleados',
        documentos: 'Documentos SST',
        alertas: 'Alertas',
        reportes: 'Reportes',
        usuarios: 'Usuarios',
        riesgos: 'Matriz de Riesgos (GTC 45)',
        investigaciones: 'Investigaciones de Accidentes',
        planes: 'Planes de Acción',
        auditorias: 'Auditorías y Revisiones'
    };
    document.getElementById('sectionTitle').textContent = titles[sectionName] || sectionName;

    // Load section data
    loadSectionData(sectionName);

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

async function loadSectionData(section) {
    switch (section) {
        case 'dashboard': loadDashboard(); break;
        case 'empresas': loadEmpresas(); break;
        case 'empleados': loadEmpleados(); break;
        case 'documentos': loadStandards(); break; // Redirect 'documentos' to Standards
        case 'alertas': await loadAlertas(); break;
        case 'usuarios': await loadUsuarios(); break;
        case 'riesgos': loadRiesgos(); break;
        case 'investigaciones': await loadInvestigaciones(); break;
        case 'planes': await loadPlanes(); break;
        case 'auditorias': await loadAuditorias(); break;
    }
}

function refreshCurrentSection() {
    loadSectionData(state.currentSection);
}

// ============================================
// DASHBOARD
// ============================================

async function loadDashboard() {
    showLoading();
    try {
        const result = await callBackend('getDashboardData', { empresaId: state.currentEmpresa });

        if (result.success) {
            // Check classification for current company
            // Need to fetch company details first or include in dashboard data
            // For now, let's fetch company details if we have an ID
            if (state.currentEmpresa) {
                const empResult = await callBackend('getEmpresa', { id: state.currentEmpresa });
                if (empResult.success) {
                    checkEmpresaClassification(empResult.data);
                }
            }

            const { stats, recentAlertas, docsProximosVencer, cumplimiento } = result.data;

            // Update stats
            document.getElementById('statEmpresas').textContent = stats.totalEmpresas;
            document.getElementById('statEmpleados').textContent = stats.totalEmpleados;
            document.getElementById('statDocumentos').textContent = stats.totalDocumentos;
            document.getElementById('statAlertas').textContent = stats.alertasPendientes;

            // Update compliance
            document.getElementById('docsVigentes').textContent = stats.documentosVigentes;
            document.getElementById('docsPorVencer').textContent = stats.documentosPorVencer;
            document.getElementById('docsVencidos').textContent = stats.documentosVencidos;
            document.getElementById('complianceBar').style.width = cumplimiento + '%';

            // Update recent alerts
            const alertsContainer = document.getElementById('recentAlerts');
            if (recentAlertas && recentAlertas.length > 0) {
                alertsContainer.innerHTML = recentAlertas.map(alert => `
          <div class="alert-item ${alert.prioridad}">
            <div class="alert-content">
              <span class="alert-message">${alert.mensaje}</span>
              <span class="alert-date">${formatDate(alert.fecha_alerta)}</span>
            </div>
          </div>
        `).join('');
            } else {
                alertsContainer.innerHTML = '<div class="loading">No hay alertas pendientes</div>';
            }

            // Update expiring docs
            const docsContainer = document.getElementById('expiringDocs');
            if (docsProximosVencer && docsProximosVencer.length > 0) {
                docsContainer.innerHTML = docsProximosVencer.map(doc => `
          <div class="doc-item">
            <div class="doc-content">
              <span class="doc-name">${doc.nombre}</span>
              <span class="doc-date">Vence: ${formatDate(doc.fecha_vencimiento)}</span>
            </div>
          </div>
        `).join('');
            } else {
                docsContainer.innerHTML = '<div class="loading">No hay documentos por vencer</div>';
            }

            // Update alerts badge
            document.getElementById('alertasBadge').textContent = stats.alertasPendientes;
        }
    } catch (error) {
        showToast('Error loading dashboard: ' + error.message, 'error');
    }
    hideLoading();
}

// ============================================
// EMPRESAS
// ============================================

function setupEmpresasEvents() {
    document.getElementById('addEmpresaBtn').addEventListener('click', () => showEmpresaModal());
    document.getElementById('empresasFilterBtn').addEventListener('click', () => loadEmpresas());
    document.getElementById('empresasClearBtn').addEventListener('click', () => {
        document.getElementById('empresaBusqueda').value = '';
        document.getElementById('empresaEstado').value = '';
        loadEmpresas();
    });
}

async function loadEmpresas() {
    const filters = {
        busqueda: document.getElementById('empresaBusqueda').value,
        estado: document.getElementById('empresaEstado').value
    };

    showLoading();
    try {
        const result = await callBackend('getEmpresas', filters);
        if (result.success) {
            renderEmpresasTable(result.data);
        }
    } catch (error) {
        showToast('Error loading empresas: ' + error.message, 'error');
    }
    hideLoading();
}

function renderEmpresasTable(empresas) {
    const tbody = document.getElementById('empresasTableBody');

    if (!empresas || empresas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No se encontraron empresas</td></tr>';
        return;
    }

    tbody.innerHTML = empresas.map(emp => `
    <tr>
      <td><strong>${emp.nombre}</strong></td>
      <td>${emp.nit}</td>
      <td>${emp.telefono}</td>
      <td>${emp.responsable_sst}</td>
      <td><span class="status-badge ${emp.estado}">${emp.estado}</span></td>
      <td class="table-actions">
        <button class="btn btn-sm btn-secondary" onclick="showEmpresaModal('${emp.empresa_id}')">✏️</button>
        <button class="btn btn-sm btn-ghost" onclick="viewEmpresaStats('${emp.empresa_id}')">📊</button>
      </td>
    </tr>
  `).join('');
}

function showEmpresaModal(empresaId = null) {
    const isEdit = !!empresaId;
    const title = isEdit ? 'Editar Empresa' : 'Nueva Empresa';

    const formHtml = `
    <form id="empresaForm">
      <input type="hidden" id="empresaId" value="${empresaId || ''}">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input type="text" id="empresaNombre" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">NIT *</label>
          <input type="text" id="empresaNit" class="form-input" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Dirección *</label>
        <input type="text" id="empresaDireccion" class="form-input" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Teléfono *</label>
          <input type="tel" id="empresaTelefono" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="empresaEmail" class="form-input">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Representante Legal *</label>
          <input type="text" id="empresaRepresentante" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">Responsable SST *</label>
          <input type="text" id="empresaResponsableSST" class="form-input" required>
        </div>
      </div>
      ${isEdit ? `
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select id="empresaEstadoForm" class="form-select">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      ` : ''}
    </form>
  `;

    showModal(title, formHtml, [
        { text: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { text: 'Guardar', class: 'btn-primary', onclick: 'saveEmpresa()' }
    ]);

    if (isEdit) {
        loadEmpresaData(empresaId);
    }
}

async function loadEmpresaData(empresaId) {
    try {
        const result = await callBackend('getEmpresa', { id: empresaId });
        if (result.success) {
            const emp = result.data;
            document.getElementById('empresaNombre').value = emp.nombre;
            document.getElementById('empresaNit').value = emp.nit;
            document.getElementById('empresaDireccion').value = emp.direccion;
            document.getElementById('empresaTelefono').value = emp.telefono;
            document.getElementById('empresaEmail').value = emp.email || '';
            document.getElementById('empresaRepresentante').value = emp.representante_legal;
            document.getElementById('empresaResponsableSST').value = emp.responsable_sst;
            document.getElementById('empresaEstadoForm').value = emp.estado;
        }
    } catch (error) {
        showToast('Error loading empresa data: ' + error.message, 'error');
    }
}

async function saveEmpresa() {
    const empresaId = document.getElementById('empresaId').value;
    const data = {
        nombre: document.getElementById('empresaNombre').value,
        nit: document.getElementById('empresaNit').value,
        direccion: document.getElementById('empresaDireccion').value,
        telefono: document.getElementById('empresaTelefono').value,
        email: document.getElementById('empresaEmail').value,
        representante_legal: document.getElementById('empresaRepresentante').value,
        responsable_sst: document.getElementById('empresaResponsableSST').value
    };

    if (empresaId) {
        data.empresa_id = empresaId;
        data.estado = document.getElementById('empresaEstadoForm').value;
    }

    showLoading();
    try {
        const action = empresaId ? 'updateEmpresa' : 'createEmpresa';
        const result = await callBackend(action, data);

        if (result.success) {
            showToast(empresaId ? 'Empresa actualizada' : 'Empresa creada', 'success');
            closeModal();
            await loadEmpresas();
            await loadInitialData(); // Refresh empresa selectors
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
    hideLoading();
}

// ============================================
// EMPLEADOS
// ============================================

function setupEmpleadosEvents() {
    document.getElementById('addEmpleadoBtn').addEventListener('click', () => showEmpleadoModal());
    document.getElementById('empleadosFilterBtn').addEventListener('click', () => loadEmpleados());
    document.getElementById('empleadosClearBtn').addEventListener('click', () => {
        document.getElementById('empleadoEmpresa').value = '';
        document.getElementById('empleadoBusqueda').value = '';
        document.getElementById('empleadoEstado').value = '';
        loadEmpleados();
    });
}

async function loadEmpleados() {
    const filters = {
        empresa_id: document.getElementById('empleadoEmpresa').value || state.currentEmpresa,
        busqueda: document.getElementById('empleadoBusqueda').value,
        estado: document.getElementById('empleadoEstado').value
    };

    showLoading();
    try {
        const result = await callBackend('getEmpleados', filters);
        if (result.success) {
            renderEmpleadosTable(result.data);
        }
    } catch (error) {
        showToast('Error loading empleados: ' + error.message, 'error');
    }
    hideLoading();
}

function renderEmpleadosTable(empleados) {
    const tbody = document.getElementById('empleadosTableBody');

    if (!empleados || empleados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No se encontraron empleados</td></tr>';
        return;
    }

    tbody.innerHTML = empleados.map(emp => {
        const empresa = state.empresas.find(e => e.empresa_id === emp.empresa_id);
        return `
      <tr>
        <td><strong>${emp.nombre}</strong></td>
        <td>${emp.cedula}</td>
        <td>${empresa ? empresa.nombre : emp.empresa_id}</td>
        <td>${emp.cargo}</td>
        <td>${emp.area || '-'}</td>
        <td><span class="status-badge ${emp.estado}">${emp.estado}</span></td>
        <td class="table-actions">
          <button class="btn btn-sm btn-secondary" onclick="showEmpleadoModal('${emp.empleado_id}')">✏️</button>
        </td>
      </tr>
    `;
    }).join('');
}

function showEmpleadoModal(empleadoId = null) {
    const isEdit = !!empleadoId;
    const title = isEdit ? 'Editar Empleado' : 'Nuevo Empleado';

    const empresasOptions = state.empresas.map(e =>
        `<option value="${e.empresa_id}">${e.nombre}</option>`
    ).join('');

    const formHtml = `
    <form id="empleadoForm">
      <input type="hidden" id="empleadoId" value="${empleadoId || ''}">
      <div class="form-group">
        <label class="form-label">Empresa *</label>
        <select id="empleadoEmpresaForm" class="form-select" required>
          <option value="">Seleccionar...</option>
          ${empresasOptions}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nombre Completo *</label>
          <input type="text" id="empleadoNombre" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">Cédula *</label>
          <input type="text" id="empleadoCedula" class="form-input" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cargo *</label>
          <input type="text" id="empleadoCargo" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">Área</label>
          <input type="text" id="empleadoArea" class="form-input">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input type="tel" id="empleadoTelefono" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="empleadoEmailForm" class="form-input">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Fecha Ingreso *</label>
          <input type="date" id="empleadoFechaIngreso" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">Tipo Contrato</label>
          <input type="text" id="empleadoTipoContrato" class="form-input">
        </div>
      </div>
      ${isEdit ? `
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select id="empleadoEstadoForm" class="form-select">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      ` : ''}
    </form>
  `;

    showModal(title, formHtml, [
        { text: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { text: 'Guardar', class: 'btn-primary', onclick: 'saveEmpleado()' }
    ]);
}

async function saveEmpleado() {
    const empleadoId = document.getElementById('empleadoId').value;
    const data = {
        empresa_id: document.getElementById('empleadoEmpresaForm').value,
        nombre: document.getElementById('empleadoNombre').value,
        cedula: document.getElementById('empleadoCedula').value,
        cargo: document.getElementById('empleadoCargo').value,
        area: document.getElementById('empleadoArea').value,
        telefono: document.getElementById('empleadoTelefono').value,
        email: document.getElementById('empleadoEmailForm').value,
        fecha_ingreso: document.getElementById('empleadoFechaIngreso').value,
        tipo_contrato: document.getElementById('empleadoTipoContrato').value
    };

    if (empleadoId) {
        data.empleado_id = empleadoId;
        data.estado = document.getElementById('empleadoEstadoForm').value;
    }

    showLoading();
    try {
        const action = empleadoId ? 'updateEmpleado' : 'createEmpleado';
        const result = await callBackend(action, data);

        if (result.success) {
            showToast(empleadoId ? 'Empleado actualizado' : 'Empleado creado', 'success');
            closeModal();
            await loadEmpleados();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
    hideLoading();
}

// ============================================
// DOCUMENTOS
// ============================================

// function setupDocumentosEvents() { ... } // Legacy moved to setupStandardsEvents

async function loadDocumentos() {
    const filters = {
        empresa_id: document.getElementById('documentoEmpresa').value || state.currentEmpresa,
        tipo_documento: document.getElementById('documentoTipo').value,
        estado: document.getElementById('documentoEstado').value
    };

    showLoading();
    try {
        const result = await callBackend('getDocumentos', filters);
        if (result.success) {
            renderDocumentosTable(result.data);
        }
    } catch (error) {
        showToast('Error loading documentos: ' + error.message, 'error');
    }
    hideLoading();
}

function renderDocumentosTable(documentos) {
    const tbody = document.getElementById('documentosTableBody');
    const docTypes = {
        'POL_SST': 'Política SST',
        'PLAN_ANUAL': 'Plan Anual',
        'MATRIZ_RIESGOS': 'Matriz Riesgos',
        'PLAN_EMERGENCIAS': 'Plan Emergencias',
        'CAPACITACION': 'Capacitación',
        'INV_ACCIDENTE': 'Inv. Accidente',
        'REG_HIGIENE': 'Reg. Higiene',
        'ACTA_COPASST': 'Acta COPASST',
        'EXAMEN_MEDICO': 'Examen Médico',
        'INV_INCIDENTE': 'Inv. Incidente'
    };

    if (!documentos || documentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No se encontraron documentos</td></tr>';
        return;
    }

    tbody.innerHTML = documentos.map(doc => {
        const empresa = state.empresas.find(e => e.empresa_id === doc.empresa_id);
        return `
      <tr>
        <td><strong>${doc.nombre}</strong></td>
        <td>${docTypes[doc.tipo_documento] || doc.tipo_documento}</td>
        <td>${empresa ? empresa.nombre : doc.empresa_id}</td>
        <td>${formatDate(doc.fecha_emision)}</td>
        <td>${formatDate(doc.fecha_vencimiento)}</td>
        <td><span class="status-badge ${doc.estado}">${doc.estado.replace('_', ' ')}</span></td>
        <td class="table-actions">
          <button class="btn btn-sm btn-secondary" onclick="showDocumentoModal('${doc.documento_id}')">✏️</button>
          ${doc.url_documento ? `<a href="${doc.url_documento}" target="_blank" class="btn btn-sm btn-ghost">📎</a>` : ''}
        </td>
      </tr>
    `;
    }).join('');
}

function showDocumentoModal(documentoId = null) {
    const isEdit = !!documentoId;
    const title = isEdit ? 'Editar Documento' : 'Nuevo Documento';

    const empresasOptions = state.empresas.map(e =>
        `<option value="${e.empresa_id}">${e.nombre}</option>`
    ).join('');

    const docTypeOptions = [
        { value: 'POL_SST', label: 'Política SST' },
        { value: 'PLAN_ANUAL', label: 'Plan Anual SST' },
        { value: 'MATRIZ_RIESGOS', label: 'Matriz de Riesgos' },
        { value: 'PLAN_EMERGENCIAS', label: 'Plan de Emergencias' },
        { value: 'CAPACITACION', label: 'Capacitación' },
        { value: 'INV_ACCIDENTE', label: 'Investigación de Accidente' },
        { value: 'REG_HIGIENE', label: 'Reglamento de Higiene' },
        { value: 'ACTA_COPASST', label: 'Acta COPASST' },
        { value: 'EXAMEN_MEDICO', label: 'Examen Médico Ocupacional' },
        { value: 'INV_INCIDENTE', label: 'Investigación de Incidente' }
    ].map(t => `<option value="${t.value}">${t.label}</option>`).join('');

    const formHtml = `
    <form id="documentoForm">
      <input type="hidden" id="documentoId" value="${documentoId || ''}">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Empresa *</label>
          <select id="documentoEmpresaForm" class="form-select" required>
            <option value="">Seleccionar...</option>
            ${empresasOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de Documento *</label>
          <select id="documentoTipoForm" class="form-select" required>
            <option value="">Seleccionar...</option>
            ${docTypeOptions}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Nombre del Documento *</label>
        <input type="text" id="documentoNombre" class="form-input" required>
      </div>
      <div class="form-group">
        <label class="form-label">Descripción</label>
        <textarea id="documentoDescripcion" class="form-textarea"></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Fecha Emisión *</label>
          <input type="date" id="documentoFechaEmision" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha Vencimiento *</label>
          <input type="date" id="documentoFechaVencimiento" class="form-input" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Responsable *</label>
          <input type="text" id="documentoResponsable" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">URL Documento (Google Drive)</label>
          <input type="url" id="documentoUrl" class="form-input">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Observaciones</label>
        <textarea id="documentoObservaciones" class="form-textarea"></textarea>
      </div>
    </form>
  `;

    showModal(title, formHtml, [
        { text: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { text: 'Guardar', class: 'btn-primary', onclick: 'saveDocumento()' }
    ]);
}

async function saveDocumento() {
    const documentoId = document.getElementById('documentoId').value;
    const data = {
        empresa_id: document.getElementById('documentoEmpresaForm').value,
        tipo_documento: document.getElementById('documentoTipoForm').value,
        nombre: document.getElementById('documentoNombre').value,
        descripcion: document.getElementById('documentoDescripcion').value,
        fecha_emision: document.getElementById('documentoFechaEmision').value,
        fecha_vencimiento: document.getElementById('documentoFechaVencimiento').value,
        responsable: document.getElementById('documentoResponsable').value,
        url_documento: document.getElementById('documentoUrl').value,
        observaciones: document.getElementById('documentoObservaciones').value
    };

    if (documentoId) {
        data.documento_id = documentoId;
    }

    showLoading();
    try {
        const action = documentoId ? 'updateDocumento' : 'createDocumento';
        const result = await callBackend(action, data);

        if (result.success) {
            showToast(documentoId ? 'Documento actualizado' : 'Documento creado', 'success');
            closeModal();
            await loadDocumentos();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
    hideLoading();
}

// ============================================
// ALERTAS
// ============================================

function setupAlertasEvents() {
    document.getElementById('generarAlertasBtn').addEventListener('click', () => generateAlertas());
    document.getElementById('alertasFilterBtn').addEventListener('click', () => loadAlertas());
    document.getElementById('alertasClearBtn').addEventListener('click', () => {
        document.getElementById('alertaEmpresa').value = '';
        document.getElementById('alertaTipo').value = '';
        document.getElementById('alertaPrioridad').value = '';
        document.getElementById('alertaEstado').value = '';
        loadAlertas();
    });
}

async function loadAlertas() {
    const filters = {
        empresa_id: document.getElementById('alertaEmpresa').value || state.currentEmpresa,
        tipo_alerta: document.getElementById('alertaTipo').value,
        prioridad: document.getElementById('alertaPrioridad').value,
        estado: document.getElementById('alertaEstado').value
    };

    showLoading();
    try {
        const result = await callBackend('getAlertas', filters);
        if (result.success) {
            renderAlertasTable(result.data);
        }
    } catch (error) {
        showToast('Error loading alertas: ' + error.message, 'error');
    }
    hideLoading();
}

function renderAlertasTable(alertas) {
    const tbody = document.getElementById('alertasTableBody');
    const alertTypes = {
        'DOC_POR_VENCER': 'Doc. Por Vencer',
        'DOC_VENCIDO': 'Doc. Vencido',
        'CAP_PENDIENTE': 'Cap. Pendiente',
        'ACC_SIN_INV': 'Accidente Sin Inv.',
        'EXAMEN_VENCIDO': 'Examen Vencido'
    };

    if (!alertas || alertas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No se encontraron alertas</td></tr>';
        return;
    }

    tbody.innerHTML = alertas.map(alert => {
        const empresa = state.empresas.find(e => e.empresa_id === alert.empresa_id);
        return `
      <tr>
        <td>${empresa ? empresa.nombre : alert.empresa_id}</td>
        <td>${alertTypes[alert.tipo_alerta] || alert.tipo_alerta}</td>
        <td>${alert.mensaje}</td>
        <td><span class="priority-badge ${alert.prioridad}">${alert.prioridad}</span></td>
        <td>${formatDate(alert.fecha_alerta)}</td>
        <td><span class="status-badge ${alert.estado}">${alert.estado}</span></td>
        <td class="table-actions">
          <button class="btn btn-sm btn-success" onclick="sendWhatsApp('${alert.alerta_id}', '${alert.empresa_id}')" title="Enviar WhatsApp">💬</button>
          <button class="btn btn-sm btn-secondary" onclick="updateAlertaEstado('${alert.alerta_id}', 'gestionada')">✓</button>
          <button class="btn btn-sm btn-ghost" onclick="updateAlertaEstado('${alert.alerta_id}', 'cerrada')">✕</button>
        </td>
      </tr>
    `;
    }).join('');
}

async function generateAlertas() {
    showLoading();
    try {
        const result = await callBackend('generarAlertas', { empresaId: state.currentEmpresa });
        if (result.success) {
            showToast(`${result.alertasGeneradas} alertas generadas`, 'success');
            await loadAlertas();
            await loadDashboard();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
    hideLoading();
}

async function updateAlertaEstado(alertaId, estado) {
    showLoading();
    try {
        const result = await callBackend('updateAlerta', { alerta_id: alertaId, estado: estado });
        if (result.success) {
            showToast('Alerta actualizada', 'success');
            await loadAlertas();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
    hideLoading();
}

function sendWhatsApp(alertaId, empresaId) {
    const empresa = state.empresas.find(e => e.empresa_id === empresaId);
    const telefono = empresa ? empresa.telefono : '';

    const modalHtml = `
    <div class="form-group">
      <label class="form-label">Teléfono de destino *</label>
      <input type="tel" id="whatsappTelefono" class="form-input" value="${telefono}" required>
      <small style="color: var(--text-muted);">Incluir código de país (57 para Colombia)</small>
    </div>
  `;

    showModal('Enviar WhatsApp', modalHtml, [
        { text: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { text: 'Abrir WhatsApp', class: 'btn-success', onclick: `openWhatsAppLink('${alertaId}', '${empresaId}')` }
    ]);
}

async function openWhatsAppLink(alertaId, empresaId) {
    const telefono = document.getElementById('whatsappTelefono').value;

    if (!telefono) {
        showToast('Ingrese un número de teléfono', 'warning');
        return;
    }

    showLoading();
    try {
        // In a real implementation, this would call the backend
        // For now, we'll create a simple WhatsApp link
        let cleanPhone = telefono.replace(/[\s\-\(\)\+]/g, '');
        if (!cleanPhone.startsWith('57')) {
            cleanPhone = '57' + cleanPhone;
        }

        const mensaje = encodeURIComponent('🔔 ALERTA SG-SST\n\nSe requiere su atención para resolver una alerta del sistema.');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${mensaje}`;

        window.open(whatsappUrl, '_blank');

        // Register the action
        await callBackend('registrarAccion', {
            alerta_id: alertaId,
            empresa_id: empresaId,
            tipo_accion: 'whatsapp',
            descripcion: `WhatsApp enviado al ${telefono}`,
            usuario_id: 'admin' // Would get from session
        });

        showToast('Acción registrada como evidencia', 'success');
        closeModal();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
    hideLoading();
}

// ============================================
// REPORTES
// ============================================

function setupReportesEvents() {
    document.querySelectorAll('.report-card').forEach(card => {
        const reportType = card.dataset.report;
        const pdfBtn = card.querySelector('.btn-primary');
        const excelBtn = card.querySelector('.btn-secondary');

        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => generateReport(reportType, 'pdf'));
        }
        if (excelBtn) {
            excelBtn.addEventListener('click', () => generateReport(reportType, 'excel'));
        }
    });
}

async function generateReport(reportType, format) {
    if (!state.currentEmpresa) {
        showToast('Seleccione una empresa para generar el reporte', 'warning');
        return;
    }

    // Use the generateFullReport from reports.js
    await generateFullReport(reportType, state.currentEmpresa, format);
}

// ============================================
// USUARIOS
// ============================================

function setupUsuariosEvents() {
    document.getElementById('addUsuarioBtn').addEventListener('click', () => showUsuarioModal());
    document.getElementById('usuariosFilterBtn').addEventListener('click', () => loadUsuarios());
    document.getElementById('usuariosClearBtn').addEventListener('click', () => {
        document.getElementById('usuarioBusqueda').value = '';
        document.getElementById('usuarioRol').value = '';
        loadUsuarios();
    });
}

async function loadUsuarios() {
    const filters = {
        busqueda: document.getElementById('usuarioBusqueda').value,
        rol: document.getElementById('usuarioRol').value
    };

    showLoading();
    try {
        const result = await callBackend('getUsuarios', filters);
        if (result.success) {
            renderUsuariosTable(result.data);
        }
    } catch (error) {
        showToast('Error loading usuarios: ' + error.message, 'error');
    }
    hideLoading();
}

function renderUsuariosTable(usuarios) {
    const tbody = document.getElementById('usuariosTableBody');
    const roles = {
        'admin': 'Administrador',
        'operador': 'Operador',
        'consulta': 'Solo Consulta'
    };

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No se encontraron usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = usuarios.map(user => {
        const empresa = state.empresas.find(e => e.empresa_id === user.empresa_id);
        return `
      <tr>
        <td><strong>${user.nombre}</strong></td>
        <td>${user.email}</td>
        <td>${roles[user.rol] || user.rol}</td>
        <td>${empresa ? empresa.nombre : (user.rol === 'admin' ? 'Global' : '-')}</td>
        <td><span class="status-badge ${user.estado}">${user.estado}</span></td>
        <td class="table-actions">
          <button class="btn btn-sm btn-secondary" onclick="showUsuarioModal('${user.usuario_id}')">✏️</button>
        </td>
      </tr>
    `;
    }).join('');
}

function showUsuarioModal(usuarioId = null) {
    const isEdit = !!usuarioId;
    const title = isEdit ? 'Editar Usuario' : 'Nuevo Usuario';

    const empresasOptions = state.empresas.map(e =>
        `<option value="${e.empresa_id}">${e.nombre}</option>`
    ).join('');

    const formHtml = `
    <form id="usuarioForm">
      <input type="hidden" id="usuarioId" value="${usuarioId || ''}">
      <div class="form-group">
        <label class="form-label">Nombre Completo *</label>
        <input type="text" id="usuarioNombre" class="form-input" required>
      </div>
      <div class="form-group">
        <label class="form-label">Email *</label>
        <input type="email" id="usuarioEmailForm" class="form-input" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Rol *</label>
          <select id="usuarioRolForm" class="form-select" required>
            <option value="">Seleccionar...</option>
            <option value="admin">Administrador</option>
            <option value="operador">Operador</option>
            <option value="consulta">Solo Consulta</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Empresa (para no-admin)</label>
          <select id="usuarioEmpresaForm" class="form-select">
            <option value="">N/A (Admin global)</option>
            ${empresasOptions}
          </select>
        </div>
      </div>
      ${isEdit ? `
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select id="usuarioEstadoForm" class="form-select">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      ` : ''}
    </form>
  `;

    showModal(title, formHtml, [
        { text: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { text: 'Guardar', class: 'btn-primary', onclick: 'saveUsuario()' }
    ]);
}

async function saveUsuario() {
    const usuarioId = document.getElementById('usuarioId').value;
    const data = {
        nombre: document.getElementById('usuarioNombre').value,
        email: document.getElementById('usuarioEmailForm').value,
        rol: document.getElementById('usuarioRolForm').value,
        empresa_id: document.getElementById('usuarioEmpresaForm').value
    };

    if (usuarioId) {
        data.usuario_id = usuarioId;
        data.estado = document.getElementById('usuarioEstadoForm').value;
    }

    showLoading();
    try {
        const action = usuarioId ? 'updateUsuario' : 'createUsuario';
        const result = await callBackend(action, data);

        if (result.success) {
            showToast(usuarioId ? 'Usuario actualizado' : 'Usuario creado', 'success');
            closeModal();
            await loadUsuarios();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
    hideLoading();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function populateEmpresaSelectors() {
    const selectors = [
        'empresaSelector',
        'empleadoEmpresa',
        'documentoEmpresa',
        'alertaEmpresa',
        'procesoEmpresa',
        'riesgoEmpresa',
        'invEmpresa',
        'planEmpresa',
        'auditEmpresa'
    ];

    const options = state.empresas.map(e =>
        `<option value="${e.empresa_id}">${e.nombre}</option>`
    ).join('');

    selectors.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            const firstOption = select.options[0];
            select.innerHTML = '';
            select.appendChild(firstOption);
            select.insertAdjacentHTML('beforeend', options);
        }
    });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function showModal(title, bodyContent, footerButtons = []) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyContent;

    const footer = document.getElementById('modalFooter');
    footer.innerHTML = footerButtons.map(btn =>
        `<button class="btn ${btn.class}" onclick="${btn.onclick}">${btn.text}</button>`
    ).join('');

    document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 5000);
}

// ============================================
// LOADING FUNCTIONS
// ============================================

function showLoading() {
    state.isLoading = true;
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    state.isLoading = false;
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// ============================================
// PROCESOS (Mapa de Procesos)
// ============================================

function setupProcesosEvents() {
    document.getElementById('addProcesoBtn').addEventListener('click', () => showProcesoModal());
    document.getElementById('procesosFilterBtn').addEventListener('click', () => loadProcesos());
}

async function loadProcesos() {
    const empresaId = document.getElementById('procesoEmpresa').value || state.currentEmpresa;

    if (!empresaId) {
        document.getElementById('procesosTableBody').innerHTML = '<tr><td colspan="6" class="loading">apara ver los procesos debe seleccionar una empresa</td></tr>';
        return;
    }

    showLoading();
    try {
        const result = await callBackend('getProcesos', { empresaId });
        if (result.success) {
            renderProcesosTable(result.data);
        }
    } catch (error) {
        showToast('Error loading procesos: ' + error.message, 'error');
    }
    hideLoading();
}

function renderProcesosTable(procesos) {
    const tbody = document.getElementById('procesosTableBody');
    if (!procesos || procesos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay procesos registrados para esta empresa</td></tr>';
        return;
    }

    tbody.innerHTML = procesos.map(p => `
        <tr>
            <td><strong>${p.nombre}</strong></td>
            <td><span class="status-badge vigente">${p.tipo_proceso}</span></td>
            <td>${p.descripcion || '-'}</td>
            <td>${p.responsable || '-'}</td>
            <td><span class="status-badge ${p.estado === 'activo' ? 'vigente' : 'vencido'}">${p.estado}</span></td>
            <td class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="showProcesoModal('${p.proceso_id}')" title="Editar">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProceso('${p.proceso_id}')" title="Eliminar">🗑️</button>
            </td>
        </tr>
    `).join('');
}

async function deleteProceso(id) {
    if (!confirm('¿Está seguro de eliminar este proceso? esta acción no se puede deshacer.')) return;

    showLoading();
    try {
        const result = await callBackend('deleteProceso', { id });
        if (result.success) {
            showToast('Proceso eliminado exitosamente', 'success');
            loadProcesos();
        } else {
            showToast('Error al eliminar: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error de conexión: ' + error.message, 'error');
    }
    hideLoading();
}


async function saveProceso() {
    const procesoId = document.getElementById('procesoId').value;
    const isEdit = !!procesoId;
    const empresaId = document.getElementById('modalProcesoEmpresa').value;

    if (!empresaId) {
        showToast('Debe seleccionar una empresa', 'error');
        return;
    }

    const data = {
        empresa_id: empresaId,
        nombre: document.getElementById('procesoNombre').value,
        tipo_proceso: document.getElementById('modalProcesoTipo').value,
        descripcion: document.getElementById('procesoDescripcion').value,
        responsable: document.getElementById('procesoResponsable').value
    };

    if (isEdit) {
        data.proceso_id = procesoId;
        data.estado = document.getElementById('procesoEstado').value;
    }

    showLoading();
    try {
        const action = isEdit ? 'updateProceso' : 'createProceso';
        const result = await callBackend(action, data);

        if (result.success) {
            showToast(isEdit ? 'Proceso actualizado' : 'Proceso creado exitosamente', 'success');
            closeModal();

            // Auto-switch to the saved company context so the user sees their data
            if (state.currentEmpresa !== empresaId) {
                state.currentEmpresa = empresaId;
                // Update selectors
                const mainSelector = document.getElementById('empresaSelector');
                const procesoSelector = document.getElementById('procesoEmpresa');
                if (mainSelector) mainSelector.value = empresaId;
                if (procesoSelector) procesoSelector.value = empresaId;

                showToast(`Vista cambiada a ${mainSelector.options[mainSelector.selectedIndex].text}`, 'info');
            }

            loadProcesos();
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error saving proceso: ' + error.message, 'error');
    }
    hideLoading();
}

function showProcesoModal(procesoId = null) {
    const isEdit = !!procesoId;
    const title = isEdit ? 'Editar Proceso' : 'Nuevo Proceso';

    const formHtml = `
    <form id="procesoForm">
      <input type="hidden" id="procesoId" value="${procesoId || ''}">
      
      <div class="form-group">
        <label class="form-label">Empresa *</label>
        <select id="modalProcesoEmpresa" class="form-input" required ${isEdit ? 'disabled' : ''}>
          <option value="">Seleccionar empresa...</option>
          ${state.empresas.map(e => `<option value="${e.empresa_id}">${e.nombre}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Nombre del Proceso *</label>
        <input type="text" id="procesoNombre" class="form-input" placeholder="Ej: Gestión de Recursos Humanos" required>
      </div>

      <div class="form-group">
        <label class="form-label">Tipo de Proceso *</label>
        <select id="modalProcesoTipo" class="form-input" required>
          <option value="">Seleccionar...</option>
          <option value="Estratégico">Estratégico</option>
          <option value="Misional">Misional</option>
          <option value="Apoyo">Apoyo</option>
          <option value="Evaluación">Evaluación</option>
        </select>
        <small style="color: var(--text-secondary);">
          <strong>Estratégico:</strong> Dirección, planeación<br>
          <strong>Misional:</strong> Producción, servicios core<br>
          <strong>Apoyo:</strong> RRHH, finanzas, logística<br>
          <strong>Evaluación:</strong> Auditorías, control
        </small>
      </div>

      <div class="form-group">
        <label class="form-label">Descripción</label>
        <textarea id="procesoDescripcion" class="form-input" rows="3" placeholder="Descripción del proceso..."></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Responsable</label>
        <input type="text" id="procesoResponsable" class="form-input" placeholder="Nombre del responsable">
      </div>

      ${isEdit ? `
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="procesoEstado" class="form-input">
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>
      ` : ''}

      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar Proceso</button>
      </div>
    </form>
  `;

    showModal(title, formHtml);

    // Initial value for company selector
    if (!isEdit && state.currentEmpresa) {
        document.getElementById('modalProcesoEmpresa').value = state.currentEmpresa;
    }

    // Load data if editing
    if (isEdit) {
        loadProcesoData(procesoId);
    }

    // Form submission
    document.getElementById('procesoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProceso();
    });
}

async function loadProcesoData(procesoId) {
    try {
        // Here we might need to search across all companies or rely on the filter
        // Ideally getProcesos returns data for the filtered company.
        // If we are editing, we assume the user has access to it.
        const result = await callBackend('getProcesos', { empresaId: state.currentEmpresa || '' });
        // Note: getProcesos usually filters by ID. If empty, it might return all or error based on implementation.
        // For editing, we need to find it even if filter is different. 
        // Let's rely on what's loaded or fetch specific if API supports it.
        // Current getProcesos requires empresaId. 

        if (result.success) {
            const proceso = result.data.find(p => p.proceso_id === procesoId);
            if (proceso) {
                document.getElementById('modalProcesoEmpresa').value = proceso.empresa_id || '';
                document.getElementById('procesoNombre').value = proceso.nombre || '';
                document.getElementById('modalProcesoTipo').value = proceso.tipo_proceso || '';
                document.getElementById('procesoDescripcion').value = proceso.descripcion || '';
                document.getElementById('procesoResponsable').value = proceso.responsable || '';
                if (document.getElementById('procesoEstado')) {
                    document.getElementById('procesoEstado').value = proceso.estado || 'activo';
                }
            }
        }
    } catch (error) {
        showToast('Error loading proceso data: ' + error.message, 'error');
    }
}

async function saveProceso() {
    const procesoId = document.getElementById('procesoId').value;
    const isEdit = !!procesoId;
    const empresaId = document.getElementById('modalProcesoEmpresa').value;

    if (!empresaId) {
        showToast('Debe seleccionar una empresa', 'error');
        return;
    }

    const data = {
        empresa_id: empresaId,
        nombre: document.getElementById('procesoNombre').value,
        tipo_proceso: document.getElementById('modalProcesoTipo').value,
        descripcion: document.getElementById('procesoDescripcion').value,
        responsable: document.getElementById('procesoResponsable').value
    };

    if (isEdit) {
        data.proceso_id = procesoId;
        data.estado = document.getElementById('procesoEstado').value;
    }

    showLoading();
    try {
        const action = isEdit ? 'updateProceso' : 'createProceso';
        const result = await callBackend(action, data);

        if (result.success) {
            showToast(isEdit ? 'Proceso actualizado' : 'Proceso creado exitosamente', 'success');
            closeModal();
            loadProcesos();
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error saving proceso: ' + error.message, 'error');
    }
    hideLoading();
}

// ============================================
// MATRIZ RIESGOS (GTC 45)
// ============================================

function setupRiesgosEvents() {
    document.getElementById('addRiesgoBtn').addEventListener('click', () => showRiesgoModal());
    document.getElementById('riesgosFilterBtn').addEventListener('click', () => loadRiesgos());
}

async function loadRiesgos() {
    const empresaId = document.getElementById('riesgoEmpresa').value || state.currentEmpresa;
    if (!empresaId) return;

    showLoading();
    try {
        // Fetch risks and processes in parallel to allow name lookup
        const [riesgosResult, procesosResult] = await Promise.all([
            callBackend('getMatrizRiesgos', { empresaId }),
            callBackend('getProcesos', { empresaId })
        ]);

        if (riesgosResult.success) {
            // Create a lookup map for process names
            const procesosMap = {};
            if (procesosResult.success && Array.isArray(procesosResult.data)) {
                procesosResult.data.forEach(p => {
                    procesosMap[p.proceso_id] = p.nombre;
                });
            }

            renderRiesgosTable(riesgosResult.data, procesosMap);
        }
    } catch (error) {
        showToast('Error loading riesgos: ' + error.message, 'error');
    }
    hideLoading();
}

function renderRiesgosTable(riesgos, procesosMap = {}) {
    const tbody = document.getElementById('riesgosTableBody');
    if (!riesgos || riesgos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay riesgos registrados</td></tr>';
        return;
    }

    tbody.innerHTML = riesgos.map(r => `
        <tr>
            <td>
                <strong>${procesosMap[r.proceso_id] || 'Proceso no encontrado'}</strong>
                <br><small style="color: var(--text-secondary); font-size: 0.8em;">${r.actividad || ''}</small>
            </td>
            <td>${r.peligro_descripcion}</td>
            <td><strong>${r.nivel_riesgo}</strong></td>
            <td>${r.interpretacion_nr}</td>
            <td><span class="status-badge ${r.aceptabilidad === 'NO ACEPTABLE' ? 'vencido' : 'vigente'}">${r.aceptabilidad}</span></td>
            <td class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="showRiesgoModal('${r.riesgo_id}')">✏️</button>
            </td>
        </tr>
    `).join('');
}

function showRiesgoModal(riesgoId = null) {
    const isEdit = !!riesgoId;
    const title = isEdit ? 'Editar Riesgo' : 'Nuevo Riesgo GTC 45';

    const formHtml = `
    <form id="riesgoForm">
      <input type="hidden" id="riesgoId" value="${riesgoId || ''}">
      
      <!-- Basic Information -->
      <div class="form-group">
        <label class="form-label">Empresa *</label>
        <select id="modalRiesgoEmpresa" class="form-input" required ${isEdit ? 'disabled' : ''} onchange="loadProcesosForDropdown()">
          <option value="">Seleccionar empresa...</option>
          ${state.empresas.map(e => `<option value="${e.empresa_id}">${e.nombre}</option>`).join('')}
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Proceso *</label>
          <select id="riesgoProcesoId" class="form-input" required>
            <option value="">Seleccionar proceso...</option>
            <!-- Will be populated dynamically based on company -->
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Actividad</label>
          <input type="text" id="riesgoActividad" class="form-input" placeholder="Actividad realizada">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Zona/Lugar</label>
          <input type="text" id="riesgoZona" class="form-input" placeholder="Ubicación">
        </div>
        <div class="form-group">
          <label class="form-label">Tarea</label>
          <input type="text" id="riesgoTarea" class="form-input" placeholder="Tarea específica">
        </div>
      </div>

      <!-- Hazard Information -->
      <div class="form-group">
        <label class="form-label">Descripción del Peligro *</label>
        <textarea id="riesgoPeligroDesc" class="form-input" rows="2" required></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Clasificación del Peligro</label>
          <select id="riesgoPeligroClasif" class="form-input">
            <option value="">Seleccionar...</option>
            <option value="BIOLOGICO">Biológico</option>
            <option value="FISICO">Físico</option>
            <option value="QUIMICO">Químico</option>
            <option value="PSICOSOCIAL">Psicosocial</option>
            <option value="BIOMECANICO">Biomecánico</option>
            <option value="CONDICIONES_SEGURIDAD">Condiciones de Seguridad</option>
            <option value="FENOMENOS_NATURALES">Fenómenos Naturales</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Efectos Posibles</label>
          <input type="text" id="riesgoEfectos" class="form-input" placeholder="Lesiones, enfermedades...">
        </div>
      </div>

      <!-- Existing Controls -->
      <div class="form-group">
        <label class="form-label">Controles Existentes - Fuente</label>
        <input type="text" id="riesgoControlFuente" class="form-input" placeholder="Controles en la fuente">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Controles - Medio</label>
          <input type="text" id="riesgoControlMedio" class="form-input" placeholder="Controles en el medio">
        </div>
        <div class="form-group">
          <label class="form-label">Controles - Individuo</label>
          <input type="text" id="riesgoControlIndividuo" class="form-input" placeholder="EPP, capacitación...">
        </div>
      </div>

      <!-- GTC 45 Calculation Parameters -->
      <h3 style="margin-top: 20px; margin-bottom: 10px; color: var(--text-primary);">Evaluación GTC 45</h3>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nivel de Deficiencia (ND) *</label>
          <select id="riesgoND" class="form-input" required onchange="calcularRiesgoPreview()">
            <option value="">Seleccionar...</option>
            <option value="10">10 - Muy Alto</option>
            <option value="6">6 - Alto</option>
            <option value="2">2 - Medio</option>
            <option value="0">0 - Bajo</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nivel de Exposición (NE) *</label>
          <select id="riesgoNE" class="form-input" required onchange="calcularRiesgoPreview()">
            <option value="">Seleccionar...</option>
            <option value="4">4 - Continua</option>
            <option value="3">3 - Frecuente</option>
            <option value="2">2 - Ocasional</option>
            <option value="1">1 - Esporádica</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nivel de Consecuencia (NC) *</label>
          <select id="riesgoNC" class="form-input" required onchange="calcularRiesgoPreview()">
            <option value="">Seleccionar...</option>
            <option value="100">100 - Mortal/Catastrófico</option>
            <option value="60">60 - Muy Grave</option>
            <option value="25">25 - Grave</option>
            <option value="10">10 - Leve</option>
          </select>
        </div>
      </div>

      <!-- Calculation Preview -->
      <div id="riesgoPreview" style="padding: 15px; background: var(--bg-secondary); border-radius: 8px; margin-top: 15px; display: none;">
        <h4 style="margin: 0 0 10px 0; color: var(--text-primary);">Resultado del Cálculo:</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div>
            <small style="color: var(--text-secondary);">Nivel Probabilidad (NP)</small>
            <div id="previewNP" style="font-size: 20px; font-weight: bold; color: var(--primary);"></div>
          </div>
          <div>
            <small style="color: var(--text-secondary);">Nivel Riesgo (NR)</small>
            <div id="previewNR" style="font-size: 20px; font-weight: bold; color: var(--primary);"></div>
          </div>
          <div>
            <small style="color: var(--text-secondary);">Aceptabilidad</small>
            <div id="previewAceptabilidad" style="font-size: 14px; font-weight: bold;"></div>
          </div>
        </div>
      </div>

      <div class="form-group" style="margin-top: 15px;">
        <label class="form-label">Medidas de Intervención Propuestas</label>
        <textarea id="riesgoMedidas" class="form-input" rows="2" placeholder="Acciones recomendadas..."></textarea>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar Riesgo</button>
      </div>
    </form>
  `;

    showModal(title, formHtml);

    // Initial value for company selector or default to current
    if (!isEdit && state.currentEmpresa) {
        const companySelect = document.getElementById('modalRiesgoEmpresa');
        if (companySelect) companySelect.value = state.currentEmpresa;
    }

    // Load processes for dropdown (will use selected company)
    loadProcesosForDropdown();

    // Load data if editing
    if (isEdit) {
        loadRiesgoData(riesgoId);
    }

    // Form submission
    document.getElementById('riesgoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveRiesgo();
    });
}

async function loadProcesosForDropdown() {
    const empresaId = document.getElementById('modalRiesgoEmpresa').value;
    const select = document.getElementById('riesgoProcesoId');

    // Clear current options except default
    select.innerHTML = '<option value="">Seleccionar proceso...</option>';

    if (!empresaId) return;

    try {
        const result = await callBackend('getProcesos', { empresaId: empresaId });
        if (result.success && result.data) {
            const procesosOptions = result.data
                .filter(p => p.estado === 'activo')
                .map(p => `<option value="${p.proceso_id}">${p.nombre} (${p.tipo_proceso})</option>`)
                .join('');

            select.innerHTML += procesosOptions;
        }
    } catch (error) {
        console.error('Error loading processes:', error);
        showToast('No hay procesos registrados para esta empresa.', 'warning');
    }
}

// Calculate risk preview in real-time
function calcularRiesgoPreview() {
    const nd = parseInt(document.getElementById('riesgoND').value);
    const ne = parseInt(document.getElementById('riesgoNE').value);
    const nc = parseInt(document.getElementById('riesgoNC').value);

    if (!nd || !ne || !nc) {
        document.getElementById('riesgoPreview').style.display = 'none';
        return;
    }

    // Calculate NP
    const np = nd * ne;
    let intNp = '';
    if (np >= 40) intNp = 'Muy Alto';
    else if (np >= 24) intNp = 'Alto';
    else if (np >= 10) intNp = 'Medio';
    else intNp = 'Bajo';

    // Calculate NR
    const nr = np * nc;
    let intNr = '';
    if (nr >= 600) intNr = 'I';
    else if (nr >= 150) intNr = 'II';
    else if (nr >= 40) intNr = 'III';
    else intNr = 'IV';

    // Acceptability
    let aceptabilidad = '';
    let colorClass = '';
    if (intNr === 'I') {
        aceptabilidad = 'NO ACEPTABLE';
        colorClass = 'color: #ef4444;';
    } else if (intNr === 'II') {
        aceptabilidad = 'ACEPTABLE CON CONTROL';
        colorClass = 'color: #f59e0b;';
    } else {
        aceptabilidad = 'ACEPTABLE';
        colorClass = 'color: #10b981;';
    }

    // Display results
    document.getElementById('riesgoPreview').style.display = 'block';
    document.getElementById('previewNP').textContent = `${np} (${intNp})`;
    document.getElementById('previewNR').textContent = `${nr} (Nivel ${intNr})`;
    document.getElementById('previewAceptabilidad').innerHTML = `<span style="${colorClass}">${aceptabilidad}</span>`;
}

async function loadRiesgoData(riesgoId) {
    try {
        const result = await callBackend('getRiesgoById', { riesgo_id: riesgoId });
        if (result.success) {
            const r = result.data;
            document.getElementById('riesgoProcesoId').value = r.proceso_id || '';
            document.getElementById('riesgoActividad').value = r.actividad || '';
            document.getElementById('riesgoZona').value = r.zona_lugar || '';
            document.getElementById('riesgoTarea').value = r.tarea || '';
            document.getElementById('riesgoPeligroDesc').value = r.peligro_descripcion || '';
            document.getElementById('riesgoPeligroClasif').value = r.peligro_clasificacion || '';
            document.getElementById('riesgoEfectos').value = r.efectos_posibles || '';
            document.getElementById('riesgoControlFuente').value = r.controles_existentes_fuente || '';
            document.getElementById('riesgoControlMedio').value = r.controles_existentes_medio || '';
            document.getElementById('riesgoControlIndividuo').value = r.controles_existentes_individuo || '';
            document.getElementById('riesgoND').value = r.nivel_deficiencia || '';
            document.getElementById('riesgoNE').value = r.nivel_exposicion || '';
            document.getElementById('riesgoNC').value = r.nivel_consecuencia || '';
            document.getElementById('riesgoMedidas').value = r.medidas_intervencion || '';

            calcularRiesgoPreview();
        }
    } catch (error) {
        showToast('Error loading risk data: ' + error.message, 'error');
    }
}

async function saveRiesgo() {
    const riesgoId = document.getElementById('riesgoId').value;
    const isEdit = !!riesgoId;
    const empresaId = document.getElementById('modalRiesgoEmpresa').value;

    if (!empresaId) {
        showToast('Debe seleccionar una empresa', 'error');
        return;
    }

    const data = {
        empresa_id: empresaId,
        proceso_id: document.getElementById('riesgoProcesoId').value,
        actividad: document.getElementById('riesgoActividad').value,
        zona_lugar: document.getElementById('riesgoZona').value,
        tarea: document.getElementById('riesgoTarea').value,
        peligro_descripcion: document.getElementById('riesgoPeligroDesc').value,
        peligro_clasificacion: document.getElementById('riesgoPeligroClasif').value,
        efectos_posibles: document.getElementById('riesgoEfectos').value,

        control_fuente: document.getElementById('riesgoControlFuente').value,
        control_medio: document.getElementById('riesgoControlMedio').value,
        control_individuo: document.getElementById('riesgoControlIndividuo').value,

        nivel_deficiencia: document.getElementById('riesgoND').value,
        nivel_exposicion: document.getElementById('riesgoNE').value,
        nivel_consecuencia: document.getElementById('riesgoNC').value,

        nivel_probabilidad: document.getElementById('previewNP').textContent,
        nivel_riesgo: document.getElementById('previewNR').textContent,
        interpretacion_nr: document.getElementById('previewInt') ? document.getElementById('previewInt').textContent : '',
        aceptabilidad: document.getElementById('previewAceptabilidad').textContent,

        medidas_intervencion: document.getElementById('riesgoMedidas').value
    };

    if (isEdit) {
        data.riesgo_id = riesgoId;
    }

    showLoading();
    try {
        const action = isEdit ? 'updateRiesgo' : 'createRiesgo';
        const result = await callBackend(action, data);

        if (result.success) {
            showToast(isEdit ? 'Riesgo actualizado' : 'Riesgo creado exitosamente', 'success');
            closeModal();
            loadRiesgos();
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error saving risk: ' + error.message, 'error');
    }
    hideLoading();
}

// ============================================
// INVESTIGACIONES
// ============================================

function setupInvestigacionesEvents() {
    document.getElementById('addInvBtn').addEventListener('click', () => showInvModal());
    document.getElementById('invFilterBtn').addEventListener('click', () => loadInvestigaciones());
}

async function loadInvestigaciones() {
    const empresaId = document.getElementById('invEmpresa').value || state.currentEmpresa;
    if (!empresaId) return;

    showLoading();
    try {
        const result = await callBackend('getAccidentes', { empresaId });
        if (result.success) {
            renderInvTable(result.data);
        }
    } catch (error) {
        showToast('Error loading investigaciones: ' + error.message, 'error');
    }
    hideLoading();
}

function renderInvTable(items) {
    const tbody = document.getElementById('invTableBody');
    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay investigaciones registradas</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${formatDate(item.fecha_accidente)}</td>
            <td>${item.empleado_id}</td>
            <td>${item.tipo_evento}</td>
            <td>${item.descripcion ? (item.descripcion.substring(0, 50) + '...') : '-'}</td>
            <td>${item.riesgo_id ? '🔗 ' + item.riesgo_id.substring(0, 8) : '-'}</td>
            <td><span class="status-badge ${item.estado}">${item.estado}</span></td>
            <td class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="showInvModal('${item.investigacion_id}')">✏️</button>
            </td>
        </tr>
    `).join('');
}

function showInvModal(invId = null) {
    const isEdit = !!invId;
    const title = isEdit ? 'Editar Investigación' : 'Nueva Investigación de Accidente/Incidente';

    const formHtml = `
    <form id="invForm">
      <input type="hidden" id="invId" value="${invId || ''}">
      
      <!-- Basic Information -->
      <div class="form-group">
        <label class="form-label">Empresa *</label>
        <select id="invEmpresaId" class="form-input" required ${isEdit ? 'disabled' : ''} onchange="loadEmpleadosForDropdown(); loadRiesgosForDropdown();">
          <option value="">Seleccionar empresa...</option>
          ${state.empresas.map(e => `<option value="${e.empresa_id}">${e.nombre}</option>`).join('')}
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Empleado Afectado *</label>
          <select id="invEmpleadoId" class="form-input" required>
            <option value="">Seleccionar empleado...</option>
            <!-- Will be populated dynamically -->
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha del Evento *</label>
          <input type="date" id="invFecha" class="form-input" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Tipo de Evento *</label>
        <select id="invTipo" class="form-input" required>
          <option value="">Seleccionar...</option>
          <option value="Accidente">Accidente (con lesión)</option>
          <option value="Incidente">Incidente (sin lesión)</option>
          <option value="Enfermedad Laboral">Enfermedad Laboral</option>
        </select>
      </div>

      <!-- Event Description -->
      <div class="form-group">
        <label class="form-label">Descripción del Evento *</label>
        <textarea id="invDescripcion" class="form-input" rows="3" placeholder="Describa detalladamente lo ocurrido..." required></textarea>
      </div>

      <!-- Phase 9: Risk Linking -->
      <div class="form-group">
        <label class="form-label">Riesgo Relacionado (GTC 45) - Opcional</label>
        <select id="invRiesgoId" class="form-input">
          <option value="">Sin vincular a riesgo específico</option>
          <!-- Will be populated dynamically -->
        </select>
        <small style="color: var(--text-secondary);">Si el evento está relacionado con un riesgo identificado en la Matriz GTC 45</small>
      </div>

      <!-- Cause Analysis -->
      <div class="form-group">
        <label class="form-label">Análisis de Causas</label>
        <textarea id="invCausas" class="form-input" rows="3" placeholder="Causas inmediatas, causas raíz, factores contribuyentes..."></textarea>
      </div>

      <!-- Action Plan -->
      <div class="form-group">
        <label class="form-label">Plan de Acción Correctivo</label>
        <textarea id="invPlanAccion" class="form-input" rows="3" placeholder="Acciones correctivas y preventivas a implementar..."></textarea>
      </div>

      ${isEdit ? `
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="invEstado" class="form-input">
          <option value="abierto">Abierto (En investigación)</option>
          <option value="cerrado">Cerrado (Finalizado)</option>
        </select>
      </div>
      ` : ''}

      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar Investigación</button>
      </div>
    </form>
  `;

    showModal(title, formHtml);

    // Initial value for company selector or default to current
    if (!isEdit && state.currentEmpresa) {
        const companySelect = document.getElementById('invEmpresaId');
        if (companySelect) companySelect.value = state.currentEmpresa;
    }

    // Load dropdowns based on initial or default company
    loadEmpleadosForDropdown();
    // Load risks for dropdown (Phase 9)
    loadRiesgosForDropdown();

    // Load data if editing
    if (isEdit) {
        // We need to wait for employees to load to set the value correctly, 
        // but since we don't have top-level await here, we rely on the speed 
        // or we could chain it. For now, let's load data. 
        // A robust way:
        loadInvData(invId);
    }

    // Form submission
    document.getElementById('invForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveInvestigacion();
    });
}

async function loadEmpleadosForDropdown() {
    const empresaId = document.getElementById('invEmpresaId').value;
    const select = document.getElementById('invEmpleadoId');

    select.innerHTML = '<option value="">Seleccionar empleado...</option>';

    if (!empresaId) return;

    try {
        // Fix: Backend expects snake_case for filters matching column names
        const result = await callBackend('getEmpleados', { empresa_id: empresaId });
        if (result.success && result.data) {
            if (!select) return;

            const currentOptions = select.innerHTML;
            const empleadosOptions = result.data
                .filter(e => !e.estado || e.estado.toLowerCase() === 'activo') // Relaxed filter
                .map(e => `<option value="${e.cedula || e.id || e.empleado_id}">${e.nombre} ${e.apellidos || ''} (${e.cedula || e.id || e.empleado_id})</option>`)
                .join('');

            select.innerHTML = currentOptions.split('</option>')[0] + '</option>' + empleadosOptions;

            // Re-set value if it was set by loadInvData before options arrived
            // This is a simple trick: store the intended value on the element dataset
            if (select.dataset.pendingValue) {
                select.value = select.dataset.pendingValue;
                delete select.dataset.pendingValue;
            }
        }
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

async function loadRiesgosForDropdown() {
    const empresaId = document.getElementById('invEmpresaId').value;
    const select = document.getElementById('invRiesgoId');

    // Reset to default
    select.innerHTML = '<option value="">Sin vincular a riesgo específico</option>';

    if (!empresaId) return;

    try {
        // Fix: Use snake_case 'empresa_id' for backend filter
        const result = await callBackend('getMatrizRiesgos', { empresa_id: empresaId });
        if (result.success && result.data) {
            const riesgosOptions = result.data.map(r =>
                `<option value="${r.riesgo_id}">${r.peligro_descripcion} (NR: ${r.nivel_riesgo})</option>`
            ).join('');

            // Append to existing default option
            select.innerHTML += riesgosOptions;
        }
    } catch (error) {
        console.error('Error loading risks:', error);
    }
}

async function loadInvData(invId) {
    try {
        const result = await callBackend('getAccidentes', { empresaId: state.currentEmpresa });
        if (result.success) {
            const inv = result.data.find(i => i.investigacion_id === invId);
            if (inv) {
                // Set company ID first to trigger dropdown loads
                // Assuming we can get it from the item or use global if not present
                // Ideally backend returns it. If not, and we are filtering by currentEmpresa, we use that.
                // But for explicit field, better if it's in the data.
                // If the data doesn't have empresa_id, we fall back to state.
                const empresaId = inv.empresa_id || state.currentEmpresa;
                document.getElementById('invEmpresaId').value = empresaId;

                // Trigger loads manually since we're setting value programmatically
                loadEmpleadosForDropdown();
                loadRiesgosForDropdown();

                const empSelect = document.getElementById('invEmpleadoId');
                const empId = inv.empleado_id || '';

                // Set value and store as pending in case options aren't loaded yet
                empSelect.value = empId;
                empSelect.dataset.pendingValue = empId;

                document.getElementById('invFecha').value = inv.fecha_accidente || '';
                document.getElementById('invTipo').value = inv.tipo_evento || '';
                document.getElementById('invDescripcion').value = inv.descripcion || '';
                document.getElementById('invRiesgoId').value = inv.riesgo_id || '';
                document.getElementById('invCausas').value = inv.causas || '';
                document.getElementById('invPlanAccion').value = inv.plan_accion || '';
                if (document.getElementById('invEstado')) {
                    document.getElementById('invEstado').value = inv.estado || 'abierto';
                }
            }
        }
    } catch (error) {
        showToast('Error loading investigation data: ' + error.message, 'error');
    }
}

async function saveInvestigacion() {
    // Get form context to avoid ID collisions
    const form = document.getElementById('invForm');
    if (!form) return;

    const invId = form.querySelector('#invId').value;
    const isEdit = !!invId;
    const empresaId = form.querySelector('#invEmpresaId').value;

    if (!empresaId) {
        showToast('Debe seleccionar una empresa', 'error');
        return;
    }

    // Validate date is not in the future
    const fecha = form.querySelector('#invFecha').value;
    if (new Date(fecha) > new Date()) {
        showToast('La fecha del evento no puede ser futura', 'error');
        return;
    }

    // Explicitly debug values if needed - using scoped selection
    const data = {
        empresa_id: empresaId,
        empleado_id: form.querySelector('#invEmpleadoId').value,
        fecha_accidente: fecha,
        tipo_evento: form.querySelector('#invTipo').value,
        descripcion: form.querySelector('#invDescripcion').value,
        riesgo_id: form.querySelector('#invRiesgoId').value,
        causas: form.querySelector('#invCausas').value,
        plan_accion: form.querySelector('#invPlanAccion').value
    };

    if (isEdit) {
        data.investigacion_id = invId;
        data.estado = document.getElementById('invEstado').value;

        // Validate closure
        if (data.estado === 'cerrado' && !data.plan_accion) {
            showToast('Debe documentar el plan de acción antes de cerrar la investigación', 'error');
            return;
        }
    }

    showLoading();
    try {
        const action = isEdit ? 'updateAccidente' : 'createAccidente';
        const result = await callBackend(action, data);

        if (result.success) {
            showToast(isEdit ? 'Investigación actualizada' : 'Investigación registrada exitosamente', 'success');
            closeModal();
            loadInvestigaciones();
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error saving investigation: ' + error.message, 'error');
    }
    hideLoading();
}

// ============================================
// PLANES DE ACCIÓN
// ============================================

function setupPlanesEvents() {
    document.getElementById('addPlanBtn').addEventListener('click', () => showPlanModal());
    document.getElementById('planFilterBtn').addEventListener('click', () => loadPlanes());
}

async function loadPlanes() {
    const empresaId = document.getElementById('planEmpresa').value || state.currentEmpresa;
    if (!empresaId) return;

    showLoading();
    try {
        const result = await callBackend('getPlanesIntervencion', { empresaId });
        if (result.success) {
            renderPlanesTable(result.data);
        }
    } catch (error) {
        showToast('Error loading planes: ' + error.message, 'error');
    }
    hideLoading();
}

function renderPlanesTable(planes) {
    const tbody = document.getElementById('planesTableBody');
    if (!planes || planes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay planes registrados</td></tr>';
        return;
    }

    tbody.innerHTML = planes.map(plan => `
        <tr>
            <td>${plan.actividad_intervencion}</td>
            <td>${plan.responsable}</td>
            <td>${formatDate(plan.fecha_propuesta)}</td>
            <td>${formatDate(plan.fecha_cierre)}</td>
            <td><span class="status-badge ${plan.estado}">${plan.estado}</span></td>
            <td class="table-actions">
                <button class="btn btn-sm btn-secondary">✏️</button>
            </td>
        </tr>
    `).join('');
}

function showPlanModal() {
    openPlanModal();
}

// ============================================
// AUDITORÍAS
// ============================================

function setupAuditoriasEvents() {
    document.getElementById('addAuditBtn').addEventListener('click', () => showAuditModal());
    document.getElementById('auditFilterBtn').addEventListener('click', () => loadAuditorias());
}

async function loadAuditorias() {
    const empresaId = document.getElementById('auditEmpresa').value || state.currentEmpresa;
    if (!empresaId) return;

    showLoading();
    try {
        const result = await callBackend('getAuditorias', { empresaId });
        if (result.success) {
            renderAuditoriasTable(result.data);
        }
    } catch (error) {
        showToast('Error loading auditorias: ' + error.message, 'error');
    }
    hideLoading();
}

function renderAuditoriasTable(items) {
    const tbody = document.getElementById('auditoriasTableBody');
    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay auditorías registradas</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.tipo}</td>
            <td>${formatDate(item.fecha_programada)}</td>
            <td>${formatDate(item.fecha_ejecucion)}</td>
            <td>${item.auditor}</td>
            <td><span class="status-badge ${item.estado}">${item.estado}</span></td>
            <td class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="openAuditModal('${item.auditoria_id}')">✏️</button>
            </td>
        </tr>
    `).join('');
}

function showAuditModal() {
    openAuditModal();
}

/**
 * Open Audit Modal
 */
function openAuditModal(id = null) {
    const isEdit = !!id;
    let audit = {};

    // Validar estado de la empresa
    if (!state.currentEmpresa) {
        showToast('Seleccione una empresa primero', 'warning');
        return;
    }

    // TODO: fetch audit if isEdit (reuse pattern later)

    const modalBody = `
        <form id="auditForm">
            <input type="hidden" name="auditoria_id" value="${audit.auditoria_id || ''}">
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Tipo de Auditoría</label>
                    <select name="tipo" class="form-select" required>
                         <option value="Interna" ${audit.tipo === 'Interna' ? 'selected' : ''}>Interna</option>
                         <option value="Externa" ${audit.tipo === 'Externa' ? 'selected' : ''}>Externa</option>
                         <option value="Revision_Direccion" ${audit.tipo === 'Revision_Direccion' ? 'selected' : ''}>Revisión por Dirección</option>
                    </select>
                </div>
                 <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select name="estado" class="form-select">
                        <option value="programada" ${audit.estado === 'programada' ? 'selected' : ''}>Programada</option>
                        <option value="ejecutada" ${audit.estado === 'ejecutada' ? 'selected' : ''}>Ejecutada</option>
                        <option value="cerrada" ${audit.estado === 'cerrada' ? 'selected' : ''}>Cerrada</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Fecha Programada</label>
                    <input type="date" name="fecha_programada" class="form-input" value="${audit.fecha_programada ? audit.fecha_programada.split('T')[0] : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Fecha Ejecución (Real)</label>
                    <input type="date" name="fecha_ejecucion" class="form-input" value="${audit.fecha_ejecucion ? audit.fecha_ejecucion.split('T')[0] : ''}">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Auditor / Responsable</label>
                <input type="text" name="auditor" class="form-input" value="${audit.auditor || ''}" placeholder="Nombre del auditor o ente certificador" required>
            </div>

            <div class="form-group">
                <label class="form-label">Alcance</label>
                <textarea name="alcance" class="form-textarea" placeholder="Procesos auditados, sedes, requisitos...">${audit.alcance || ''}</textarea>
            </div>

             <div class="form-group">
                <label class="form-label">Hallazgos / Conclusiones</label>
                <textarea name="hallazgos" class="form-textarea" placeholder="Resumen de no conformidades o resultados...">${audit.hallazgos || ''}</textarea>
            </div>
        </form>
    `;

    openModal(isEdit ? 'Editar Auditoría' : 'Nueva Auditoría', modalBody, () => saveAudit(isEdit));
}

async function saveAudit(isEdit) {
    const form = document.getElementById('auditForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    data.empresa_id = state.currentEmpresa;
    const action = isEdit ? 'updateAuditoria' : 'createAuditoria';

    showToast('Guardando...', 'info');

    try {
        const result = await callBackend(action, data);
        if (result.success) {
            showToast('Auditoría guardada', 'success');
            closeModal();
            loadAuditorias();
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

// ============================================
// COMPATIBILITY & MISSING FUNCTIONS
// ============================================

/**
 * Open Modal Wrapper
 * Adapts specific calls to the generic showModal or directly manipulates the DOM
 */
function openModal(title, bodyContent, onConfirm) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyContent;

    const footer = document.getElementById('modalFooter');
    footer.innerHTML = '';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.onclick = closeModal;

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-primary';
    confirmBtn.textContent = 'Guardar';
    confirmBtn.onclick = onConfirm;

    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);

    document.getElementById('modalOverlay').classList.remove('hidden');
}

/**
 * Open Plan of Action Modal (Phase 3)
 */
async function openPlanModal(id = null) {
    const isEdit = !!id;
    let plan = {};

    // Validar estado de la empresa
    if (!state.currentEmpresa) {
        showToast('Seleccione una empresa primero', 'warning');
        return;
    }

    // Fetch Risks for Dropdown
    let riesgosOpts = '<option value="">-- Sin vincular --</option>';
    try {
        const riesgosRes = await callBackend('getMatrizRiesgos', { empresaId: state.currentEmpresa });
        if (riesgosRes.success) {
            riesgosOpts += riesgosRes.data.map(r =>
                `<option value="${r.riesgo_id}" ${plan.riesgo_id === r.riesgo_id ? 'selected' : ''}>${r.peligro_descripcion} (${r.nivel_riesgo})</option>`
            ).join('');
        }
    } catch (e) { console.error(e); }

    const modalBody = `
        <form id="planForm">
            <input type="hidden" name="plan_id" value="${plan.plan_id || ''}">
            
            <div class="form-group">
                <label class="form-label">Actividad de Intervención</label>
                <input type="text" name="actividad_intervencion" class="form-input" value="${plan.actividad_intervencion || ''}" required placeholder="Descripción de la acción">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Responsable</label>
                    <input type="text" name="responsable_id" class="form-input" value="${plan.responsable_id || ''}" placeholder="Nombre o ID">
                </div>
                <div class="form-group">
                    <label class="form-label">Fecha Límite</label>
                    <input type="date" name="fecha_limite" class="form-input" value="${plan.fecha_limite ? plan.fecha_limite.split('T')[0] : ''}" required>
                </div>
            </div>

             <div class="form-group box-highlight">
                <label class="form-label">🔗 Origen (Riesgo Asociado)</label>
                <select name="riesgo_id" class="form-select">
                    ${riesgosOpts}
                </select>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select name="estado" class="form-select">
                        <option value="programado" ${plan.estado === 'programado' ? 'selected' : ''}>Programado</option>
                        <option value="en_curso" ${plan.estado === 'en_curso' ? 'selected' : ''}>En Curso</option>
                        <option value="completado" ${plan.estado === 'completado' ? 'selected' : ''}>Completado</option>
                    </select>
                </div>
                 <div class="form-group">
                    <label class="form-label">Prioridad</label>
                    <select name="prioridad" class="form-select">
                        <option value="alta" ${plan.prioridad === 'alta' ? 'selected' : ''}>Alta</option>
                        <option value="media" ${plan.prioridad === 'media' ? 'selected' : 'selected'}>Media</option>
                        <option value="baja" ${plan.prioridad === 'baja' ? 'selected' : ''}>Baja</option>
                    </select>
                </div>
            </div>
            
             <div class="form-group">
                <label class="form-label">Recursos Necesarios</label>
                <textarea name="recursos" class="form-textarea">${plan.recursos || ''}</textarea>
            </div>
        </form>
    `;

    openModal(isEdit ? 'Editar Plan de Acción' : 'Nuevo Plan de Acción', modalBody, () => savePlan(isEdit));
}

async function savePlan(isEdit) {
    const form = document.getElementById('planForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    data.empresa_id = state.currentEmpresa;
    const action = isEdit ? 'updatePlanIntervencion' : 'createPlanIntervencion';

    showToast('Guardando...', 'info');

    try {
        const result = await callBackend(action, data);
        if (result.success) {
            showToast('Plan de acción guardado', 'success');
            closeModal();
            if (window.loadPlanes) loadPlanes(); // Refresh if on planes view
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}
