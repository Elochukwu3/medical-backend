const PRODUCTION_BACKEND_URL = 'https://medical-backend-6mi7.onrender.com';
const LOCAL_BACKEND_URL = 'http://127.0.0.1:8000';

function getDefaultBackend() {
  const saved = localStorage.getItem('medlab_backend_host');
  if (saved) return saved;
  // If explicitly served on localhost without saved config, use local; otherwise default to Render Cloud
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocal ? LOCAL_BACKEND_URL : PRODUCTION_BACKEND_URL;
}

function getBackendHost() {
  return (localStorage.getItem('medlab_backend_host') || getDefaultBackend()).trim().replace(/\/+$/, '');
}

function setBackendHost(url) {
  const clean = (url || PRODUCTION_BACKEND_URL).trim().replace(/\/+$/, '');
  localStorage.setItem('medlab_backend_host', clean);
  const input = document.getElementById('backendUrl');
  if (input) input.value = clean;
  checkServerHealth(true);
}

function getApiUrl() {
  return `${getBackendHost()}/api`;
}

function getAuthUrl() {
  return `${getBackendHost()}/api-auth/login/`;
}

let token = localStorage.getItem('medlab_token') || '';
let page = 'dashboard', loggedIn = !!token;
let cache = { patients: [], tests: [], results: [], users: [] };
let serverHealth = { status: 'checking', message: 'Checking backend status...', latency: null };
let healthPollTimer = null;

async function checkServerHealth(force = false) {
  const host = getBackendHost();
  const statusEl = document.getElementById('serverStatusBox');
  if (!statusEl && !force) return;

  if (statusEl) {
    statusEl.className = 'server-status-card waking';
    statusEl.innerHTML = `<span><span class="status-dot dot-amber"></span> Checking server at <code>${esc(host)}</code>...</span> <span class="spinner dark"></span>`;
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    
    // Test either /health/ or /api-auth/login/
    const res = await fetch(`${host}/health/`, {
      method: 'GET',
      signal: controller.signal
    }).catch(async () => {
      // Fallback check to auth endpoint with OPTIONS or HEAD
      return await fetch(`${host}/api-auth/login/`, { method: 'OPTIONS' });
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    if (res && (res.ok || res.status === 400 || res.status === 405 || res.status === 200)) {
      serverHealth = { status: 'online', message: `Online & Ready (${latency}ms)`, latency };
      if (statusEl) {
        statusEl.className = 'server-status-card online';
        statusEl.innerHTML = `<span><span class="status-dot dot-green"></span> <b>Backend Online</b> (${latency}ms)</span><button class="btn sm secondary" onclick="checkServerHealth(true)">Ping</button>`;
      }
      return true;
    } else {
      throw new Error(`HTTP ${res ? res.status : 'Offline'}`);
    }
  } catch (e) {
    serverHealth = { status: 'waking', message: 'Standby / Waking up (~30s on Render free plan)', latency: null };
    if (statusEl) {
      statusEl.className = 'server-status-card waking';
      statusEl.innerHTML = `<span><span class="status-dot dot-amber"></span> <b>Waking from standby...</b> (Render free plan takes ~30s)</span><button class="btn sm secondary" onclick="checkServerHealth(true)">Retry</button>`;
    }
    return false;
  }
}

function startHealthPolling() {
  if (healthPollTimer) clearInterval(healthPollTimer);
  checkServerHealth();
  healthPollTimer = setInterval(() => {
    if (!loggedIn) checkServerHealth();
  }, 10000);
}

async function api(path, opts = {}) {
  opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  if (token) opts.headers.Authorization = 'Token ' + token;
  const res = await fetch(getApiUrl() + path, opts);
  if (!res.ok) {
    let t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

async function loadAll() {
  [cache.patients, cache.tests, cache.results] = await Promise.all([
    api('/patients/'), api('/tests/'), api('/results/')
  ]);
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function statusBadge(s) {
  let c = s === 'WITHIN RANGE' ? 'normal' : s === 'HIGH' ? 'high' : 'low';
  return `<span class="badge ${c}">${s}</span>`;
}

function patientName(id) {
  return cache.patients.find(x => x.id === id)?.full_name || id;
}

function testName(id) {
  return cache.tests.find(x => x.id === id)?.name || id;
}

function title() {
  return {
    dashboard: 'Laboratory Dashboard',
    patients: 'Patient Management',
    tests: 'Laboratory Tests',
    results: 'Enter Laboratory Result',
    history: 'Laboratory History',
    reports: 'Laboratory Reports',
    users: 'System Configuration'
  }[page];
}

function loginPage() {
  const curHost = getBackendHost();
  const isRender = curHost.includes('onrender.com');
  const isLocal = curHost.includes('127.0.0.1') || curHost.includes('localhost');

  return `
  <div class="login">
    <div class="loginbox">
      <h1>MedLab Analytics</h1>
      <p class="muted">Automated Medical Laboratory Decision-Support System</p>
      
      <div id="serverStatusBox" class="server-status-card waking">
        <span><span class="status-dot dot-amber"></span> Checking backend server status...</span>
        <span class="spinner dark"></span>
      </div>

      <div class="field">
        <label>Username</label>
        <input id="loginUser" value="labadmin" autocomplete="username">
      </div>
      <div class="field">
        <label>Password</label>
        <input id="loginPass" type="password" value="demo123" autocomplete="current-password">
      </div>
      
      <div class="field">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label style="margin:0">Backend API URL</label>
          <div class="quick-hosts">
            <button type="button" class="quick-host-btn ${isRender ? 'active' : ''}" onclick="setBackendHost('${PRODUCTION_BACKEND_URL}')">☁ Render Cloud</button>
            <button type="button" class="quick-host-btn ${isLocal ? 'active' : ''}" onclick="setBackendHost('${LOCAL_BACKEND_URL}')">💻 Local Django</button>
          </div>
        </div>
        <input id="backendUrl" value="${esc(curHost)}" placeholder="e.g. https://medical-backend-6mi7.onrender.com" onchange="setBackendHost(this.value)">
      </div>

      <button id="loginSubmitBtn" class="btn" style="width:100%; margin-top:8px;" onclick="login()">Sign in</button>
      
      <div id="loginFeedback"></div>

      <p class="muted" style="margin-top:14px; text-align:center;">Demo Account: <b>labadmin</b> / <b>demo123</b></p>
      
      <div class="defense-tip-box">
        💡 <b>Defense Day Notice:</b> Render's free tier sleeps after 15m of inactivity. If the server is waking up, signing in will automatically wait up to 40 seconds and connect smoothly!
      </div>
    </div>
  </div>`;
}

async function login() {
  const btn = document.getElementById('loginSubmitBtn');
  const feedback = document.getElementById('loginFeedback');
  const targetHost = (document.getElementById('backendUrl')?.value || getBackendHost()).trim().replace(/\/+$/, '');
  
  localStorage.setItem('medlab_backend_host', targetHost);

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Connecting to backend...`;
  }
  if (feedback) {
    feedback.innerHTML = `<div class="login-msg info">Connecting to <code>${esc(targetHost)}</code>... (If server was asleep, please give it ~20-30s to warm up)</div>`;
  }

  // Attempt login with automatic retries for cold start
  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1 && feedback) {
        feedback.innerHTML = `<div class="login-msg warning"><span class="spinner dark"></span> Server waking up... attempt ${attempt} of ${maxAttempts} (warm-up in progress)...</div>`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for Render cold start

      const res = await fetch(getAuthUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: document.getElementById('loginUser').value,
          password: document.getElementById('loginPass').value
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 400) {
          throw new Error('Invalid username or password. Please verify credentials (labadmin / demo123).');
        }
        throw new Error(`Authentication server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      token = data.token;
      localStorage.setItem('medlab_token', token);
      loggedIn = true;
      
      if (feedback) feedback.innerHTML = `<div class="login-msg info">✓ Authenticated! Loading clinical data...</div>`;
      
      await loadAll();
      if (healthPollTimer) clearInterval(healthPollTimer);
      render();
      return;
    } catch (e) {
      lastError = e;
      if (e.message.includes('Invalid username or password')) {
        break; // Don't retry credential errors
      }
      // Wait 4 seconds before next attempt
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 4000));
      }
    }
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `Sign in`;
  }
  if (feedback) {
    feedback.innerHTML = `
      <div class="login-msg error">
        <b>Connection failed:</b> ${esc(lastError ? lastError.message : 'Server unreachable')}<br>
        <small>Target: ${esc(targetHost)}</small>
      </div>`;
  }
}

function logout() {
  token = '';
  localStorage.removeItem('medlab_token');
  loggedIn = false;
  render();
}

async function render() {
  if (!loggedIn) {
    document.getElementById('app').innerHTML = loginPage();
    startHealthPolling();
    return;
  }
  
  try {
    await loadAll();
  } catch (e) {
    document.getElementById('app').innerHTML = `
      <div style="padding:40px; max-width:600px; margin:40px auto; background:#fff; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <h2 style="color:#b91c1c; margin-top:0;">⚠️ Backend Connection Issue</h2>
        <p>Could not retrieve laboratory records from <code>${esc(getBackendHost())}</code>.</p>
        <pre style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0; overflow:auto;">${esc(e.message)}</pre>
        <div style="display:flex; gap:10px; margin-top:20px;">
          <button class="btn" onclick="render()">🔄 Retry Connection</button>
          <button class="btn secondary" onclick="logout()">↩ Switch Backend / Logout</button>
        </div>
      </div>`;
    return;
  }

  const curHost = getBackendHost();
  const hostLabel = curHost.includes('onrender.com') ? '☁ Render Cloud' : curHost.includes('127.0.0.1') || curHost.includes('localhost') ? '💻 Local Django' : curHost;

  document.getElementById('app').innerHTML = `
    <aside class="sidebar">
      <div>
        <div class="brand">MedLab <span>Analytics</span></div>
        <nav class="nav">
          ${['dashboard', 'patients', 'tests', 'results', 'history', 'reports', 'users'].map(x => `
            <button class="${page === x ? 'active' : ''}" onclick="go('${x}')">
              ${({
                dashboard: '▦ Dashboard',
                patients: '♙ Patients',
                tests: '⚗ Tests Catalog',
                results: '＋ Enter Result',
                history: '◷ Result History',
                reports: '▤ Clinical Reports',
                users: '⚙ System & API'
              })[x]}
            </button>
          `).join('')}
          <button onclick="logout()">↪ Logout</button>
        </nav>
      </div>
      <div class="sidebar-footer">
        <div class="backend-indicator">
          <span class="status-dot dot-green"></span>
          <span><b>API:</b> ${esc(hostLabel)}</span>
        </div>
        <div style="opacity:0.75; font-size:10px;">MedLab Decision Support v1.0</div>
      </div>
    </aside>
    <main class="main">
      <div class="top">
        <h1>${title()}</h1>
        <div class="top-meta">
          <div class="backend-badge">
            <span class="status-dot dot-green"></span>
            <span>${esc(hostLabel)}</span>
          </div>
          <div class="user">● Lab Administrator</div>
        </div>
      </div>
      <div class="notice">
        <b>Academic Decision-Support Prototype:</b> Automated reference flags (HIGH, LOW, WITHIN RANGE) assist qualified personnel. Reference intervals are configured per laboratory protocols.
      </div>
      ${content()}
    </main>`;
}

function go(p) {
  page = p;
  render();
}

function content() {
  if (page === 'dashboard') return dashboard();
  if (page === 'patients') return patients();
  if (page === 'tests') return tests();
  if (page === 'results') return resultsForm();
  if (page === 'history') return history();
  if (page === 'reports') return reports();
  return users();
}

function dashboard() {
  let high = cache.results.filter(r => r.status === 'HIGH').length;
  let low = cache.results.filter(r => r.status === 'LOW').length;
  let normal = cache.results.filter(r => r.status === 'WITHIN RANGE').length;

  return `
    <div class="cards">
      <div class="card"><div class="muted">Total Patients</div><div class="metric">${cache.patients.length}</div></div>
      <div class="card"><div class="muted">Configured Tests</div><div class="metric">${cache.tests.length}</div></div>
      <div class="card"><div class="muted">Total Results</div><div class="metric">${cache.results.length}</div></div>
      <div class="card"><div class="muted">Abnormal Flags</div><div class="metric" style="color:#b91c1c">${high + low}</div></div>
    </div>
    <div class="grid2">
      <div class="panel">
        <h2>Clinical Distribution</h2>
        <p style="display:flex; justify-content:space-between; margin:10px 0;"><span>Within Range:</span> <b>${normal}</b></p>
        <p style="display:flex; justify-content:space-between; margin:10px 0;"><span>High Flag:</span> <b style="color:#b42318">${high}</b></p>
        <p style="display:flex; justify-content:space-between; margin:10px 0;"><span>Low Flag:</span> <b style="color:#b42318">${low}</b></p>
      </div>
      <div class="panel">
        <h2>Recent Laboratory Results</h2>
        ${cache.results.length === 0 ? '<p class="muted">No results entered yet.</p>' : cache.results.slice(0, 5).map(r => `
          <div style="padding:8px 0; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b>${esc(patientName(r.patient))}</b> — <span class="muted">${esc(testName(r.test))}</span>: <b>${r.value}</b> ${esc(cache.tests.find(t => t.id === r.test)?.unit || '')}
            </div>
            <div>${statusBadge(r.status)}</div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function patients() {
  return `
    <div class="panel">
      <div class="actions" style="justify-content:space-between; margin-bottom:14px;">
        <h2 style="margin:0">Registered Patients</h2>
        <button class="btn" onclick="showPatientForm()">+ Register Patient</button>
      </div>
      <div class="table-wrap">
        <table>
          <tr><th>ID</th><th>Full Name</th><th>Sex</th><th>Date of Birth</th><th>Phone</th></tr>
          ${cache.patients.map(p => `
            <tr>
              <td><b>${esc(p.patient_id)}</b></td>
              <td>${esc(p.full_name)}</td>
              <td>${esc(p.sex)}</td>
              <td>${esc(p.date_of_birth)}</td>
              <td>${esc(p.phone || '—')}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    </div>`;
}

function showPatientForm() {
  const existing = document.getElementById('newPatientPanel');
  if (existing) { existing.remove(); return; }

  document.querySelector('.main').insertAdjacentHTML('beforeend', `
    <div id="newPatientPanel" class="panel" style="border:2px solid #1769e0;">
      <h2>Register New Patient</h2>
      <div class="formgrid">
        <div class="field"><label>Patient ID (e.g. P004)</label><input id="pid" placeholder="P004"></div>
        <div class="field"><label>Full Name</label><input id="pname" placeholder="John Doe"></div>
        <div class="field"><label>Sex</label><select id="psex"><option>Female</option><option>Male</option></select></div>
        <div class="field"><label>Date of Birth</label><input id="pdob" type="date"></div>
        <div class="field"><label>Phone Number</label><input id="pphone" placeholder="+234..."></div>
      </div>
      <div class="form-actions" style="display:flex; gap:10px;">
        <button class="btn" onclick="addPatient()">Save Patient</button>
        <button class="btn secondary" onclick="document.getElementById('newPatientPanel').remove()">Cancel</button>
      </div>
    </div>`);
}

async function addPatient() {
  try {
    await api('/patients/', {
      method: 'POST',
      body: JSON.stringify({
        patient_id: pid.value,
        full_name: pname.value,
        sex: psex.value,
        date_of_birth: pdob.value,
        phone: pphone.value
      })
    });
    go('patients');
  } catch (e) {
    alert('Error adding patient: ' + e.message);
  }
}

function tests() {
  return `
    <div class="panel">
      <div class="actions" style="justify-content:space-between; margin-bottom:14px;">
        <h2 style="margin:0">Configured Laboratory Tests</h2>
        <button class="btn" onclick="showTestForm()">+ Add Test</button>
      </div>
      <div class="table-wrap">
        <table>
          <tr><th>Test ID</th><th>Test Name</th><th>Unit</th><th>Lower Ref</th><th>Upper Ref</th></tr>
          ${cache.tests.map(t => `
            <tr>
              <td><b>${esc(t.test_id)}</b></td>
              <td>${esc(t.name)}</td>
              <td>${esc(t.unit)}</td>
              <td>${t.lower_reference}</td>
              <td>${t.upper_reference}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    </div>`;
}

function showTestForm() {
  const existing = document.getElementById('newTestPanel');
  if (existing) { existing.remove(); return; }

  document.querySelector('.main').insertAdjacentHTML('beforeend', `
    <div id="newTestPanel" class="panel" style="border:2px solid #1769e0;">
      <h2>Add Laboratory Test Parameter</h2>
      <div class="formgrid">
        <div class="field"><label>Test ID (e.g. GLU)</label><input id="tid" placeholder="GLU"></div>
        <div class="field"><label>Test Name (e.g. Fasting Blood Glucose)</label><input id="tname"></div>
        <div class="field"><label>Unit (e.g. mg/dL, mmol/L)</label><input id="tunit"></div>
        <div class="field"><label>Lower Reference Interval</label><input id="tlow" type="number" step="any"></div>
        <div class="field"><label>Upper Reference Interval</label><input id="thigh" type="number" step="any"></div>
      </div>
      <div class="form-actions" style="display:flex; gap:10px;">
        <button class="btn" onclick="addTest()">Save Test Parameter</button>
        <button class="btn secondary" onclick="document.getElementById('newTestPanel').remove()">Cancel</button>
      </div>
    </div>`);
}

async function addTest() {
  try {
    await api('/tests/', {
      method: 'POST',
      body: JSON.stringify({
        test_id: tid.value,
        name: tname.value,
        unit: tunit.value,
        lower_reference: Number(tlow.value),
        upper_reference: Number(thigh.value),
        category: ''
      })
    });
    go('tests');
  } catch (e) {
    alert('Error adding test: ' + e.message);
  }
}

function resultsForm() {
  return `
    <div class="panel">
      <h2>Analyze New Laboratory Result</h2>
      <div class="formgrid">
        <div class="field">
          <label>Patient</label>
          <select id="rpatient">
            ${cache.patients.map(p => `<option value="${p.id}">${esc(p.patient_id)} — ${esc(p.full_name)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Laboratory Test</label>
          <select id="rtest">
            ${cache.tests.map(t => `<option value="${t.id}">${esc(t.name)} (${esc(t.unit)}) — [${t.lower_reference} - ${t.upper_reference}]</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Observed Result Value</label>
          <input id="rvalue" type="number" step="any" placeholder="e.g. 14.5">
        </div>
        <div class="field">
          <label>Test Date</label>
          <input id="rdate" type="date" value="${new Date().toISOString().slice(0, 10)}">
        </div>
      </div>
      <button class="btn" style="margin-top:16px;" onclick="analyze()">⚡ Automated Decision Analysis & Save</button>
    </div>`;
}

async function analyze() {
  try {
    let r = await api('/results/', {
      method: 'POST',
      body: JSON.stringify({
        patient: Number(rpatient.value),
        test: Number(rtest.value),
        value: Number(rvalue.value),
        test_date: rdate.value
      })
    });
    alert(`Automated Analysis Complete:\nResult status determined as "${r.status}" based on reference intervals.`);
    go('history');
  } catch (e) {
    alert('Error saving result: ' + e.message);
  }
}

function history() {
  return `
    <div class="panel">
      <h2>Laboratory Result History & Audit Trail</h2>
      <div class="table-wrap">
        <table>
          <tr><th>Test Date</th><th>Patient</th><th>Test</th><th>Observed Value</th><th>Automated Decision</th></tr>
          ${cache.results.map(r => `
            <tr>
              <td>${r.test_date}</td>
              <td><b>${esc(patientName(r.patient))}</b></td>
              <td>${esc(testName(r.test))}</td>
              <td><b>${r.value}</b> ${esc(cache.tests.find(t => t.id === r.test)?.unit || '')}</td>
              <td>${statusBadge(r.status)}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    </div>`;
}

function reports() {
  return `
    <div class="panel">
      <h2>Laboratory Diagnostic Reports</h2>
      <p class="muted">Select a patient record to preview and generate printable PDF clinical report.</p>
      <div class="field" style="max-width:400px;">
        <label>Select Patient</label>
        <select id="reportPatient" onchange="renderReport()">
          ${cache.patients.map(p => `<option value="${p.id}">${esc(p.patient_id)} — ${esc(p.full_name)}</option>`).join('')}
        </select>
      </div>
      <div id="reportBox" style="margin-top:18px">
        ${reportHTML(cache.patients[0]?.id)}
      </div>
    </div>`;
}

function renderReport() {
  document.getElementById('reportBox').innerHTML = reportHTML(Number(reportPatient.value));
}

function reportHTML(pid) {
  let p = cache.patients.find(x => x.id === pid);
  let rs = cache.results.filter(r => r.patient === pid);
  if (!p) return '<p class="muted">No patient selected.</p>';

  return `
    <div class="panel" style="box-shadow:none; border:2px solid #e2e8f0; padding:24px; background:#fafcff;">
      <div style="border-bottom:2px solid #10233f; padding-bottom:12px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:flex-end;">
        <div>
          <h2 style="margin:0; color:#10233f; font-size:20px;">CLINICAL LABORATORY REPORT</h2>
          <div class="muted" style="font-size:12px;">MedLab Automated Decision-Support System</div>
        </div>
        <div style="text-align:right; font-size:12px;" class="muted">
          Date: ${new Date().toLocaleDateString()}<br>
          Backend: ${esc(getBackendHost())}
        </div>
      </div>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:18px; font-size:14px; background:#fff; padding:12px; border-radius:8px; border:1px solid #edf2f7;">
        <div><b>Patient Name:</b> ${esc(p.full_name)}</div>
        <div><b>Patient ID:</b> ${esc(p.patient_id)}</div>
        <div><b>Sex:</b> ${esc(p.sex)}</div>
        <div><b>Date of Birth:</b> ${esc(p.date_of_birth)}</div>
      </div>

      <table>
        <tr><th>Date</th><th>Test Parameter</th><th>Observed Value</th><th>Unit</th><th>Automated Decision Flag</th></tr>
        ${rs.length === 0 ? '<tr><td colspan="5" style="text-align:center;" class="muted">No test results recorded for this patient.</td></tr>' : rs.map(r => {
          const t = cache.tests.find(x => x.id === r.test);
          return `
            <tr>
              <td>${r.test_date}</td>
              <td><b>${esc(testName(r.test))}</b></td>
              <td>${r.value}</td>
              <td>${esc(t?.unit || '—')}</td>
              <td>${statusBadge(r.status)}</td>
            </tr>`;
        }).join('')}
      </table>

      <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
        <button class="btn" onclick="window.print()">🖨 Print / Export PDF</button>
        <span class="muted" style="font-size:11px;">Validated for Academic Presentation & Defense</span>
      </div>
    </div>`;
}

function users() {
  const host = getBackendHost();
  return `
    <div class="panel">
      <h2>Connected System & API Details</h2>
      <p>The application is actively authenticated with token authorization against the Django backend API.</p>
      
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin:16px 0;">
        <p style="margin:6px 0;"><b>Active Backend URL:</b> <code>${esc(host)}</code></p>
        <p style="margin:6px 0;"><b>API Base Endpoint:</b> <code>${esc(getApiUrl())}</code></p>
        <p style="margin:6px 0;"><b>Authentication Endpoint:</b> <code>${esc(getAuthUrl())}</code></p>
        <p style="margin:6px 0;"><b>Authentication Mode:</b> Token Authentication</p>
      </div>

      <div class="actions" style="margin-top:18px;">
        <button class="btn secondary" onclick="checkServerHealth(true)">⚡ Test API Latency</button>
        <button class="btn danger" onclick="logout()">↪ Logout & Change Backend</button>
      </div>
    </div>`;
}

// Initial render
render();
