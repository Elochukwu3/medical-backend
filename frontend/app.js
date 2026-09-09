const DEFAULT_API_HOST = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:8000'
  : (localStorage.getItem('medlab_backend_host') || 'http://127.0.0.1:8000');

function getBackendHost() {
  return localStorage.getItem('medlab_backend_host') || DEFAULT_API_HOST;
}

function getApiUrl() {
  return `${getBackendHost().replace(/\/+$/, '')}/api`;
}

function getAuthUrl() {
  return `${getBackendHost().replace(/\/+$/, '')}/api-auth/login/`;
}

let token = localStorage.getItem('medlab_token') || '';
let page = 'dashboard', loggedIn = !!token;
let cache = {patients:[], tests:[], results:[], users:[]};

async function api(path, opts={}) {
  opts.headers = Object.assign({'Content-Type':'application/json'}, opts.headers || {});
  if(token) opts.headers.Authorization = 'Token ' + token;
  const res = await fetch(getApiUrl() + path, opts);
  if(!res.ok) { let t = await res.text(); throw new Error(t || `HTTP ${res.status}`); }
  return res.status === 204 ? null : res.json();
}
async function loadAll(){
  [cache.patients,cache.tests,cache.results]=await Promise.all([
    api('/patients/'),api('/tests/'),api('/results/')
  ]);
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function statusBadge(s){let c=s==='WITHIN RANGE'?'normal':s==='HIGH'?'high':'low';return `<span class="badge ${c}">${s}</span>`}
function patientName(id){return cache.patients.find(x=>x.id===id)?.full_name||id}
function testName(id){return cache.tests.find(x=>x.id===id)?.name||id}
function title(){return {dashboard:'Laboratory Dashboard',patients:'Patient Management',tests:'Laboratory Tests',results:'Enter Laboratory Result',history:'Laboratory History',reports:'Laboratory Reports',users:'User Management'}[page]}
function loginPage(){
  const curHost = getBackendHost();
  return `<div class="login"><div class="loginbox"><h1>MedLab Analytics</h1><p class="muted">Medical Automated Data Analysis System</p><div class="field"><label>Username</label><input id="loginUser" value="labadmin"></div><div class="field"><label>Password</label><input id="loginPass" type="password" value="demo123"></div><div class="field"><label>Backend API URL</label><input id="backendUrl" value="${esc(curHost)}" placeholder="e.g. https://your-backend.onrender.com"></div><button class="btn" style="width:100%" onclick="login()">Sign in</button><p class="muted">Demo account: labadmin / demo123</p><p id="loginError" style="color:#b42318"></p></div></div>`;
}
async function login(){
 try{
  const targetHost = (document.getElementById('backendUrl')?.value || getBackendHost()).trim().replace(/\/+$/, '');
  localStorage.setItem('medlab_backend_host', targetHost);
  const res=await fetch(getAuthUrl(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:loginUser.value,password:loginPass.value})});
  if(!res.ok) throw Error('Invalid login or backend is not running at: ' + targetHost);
  const data=await res.json(); token=data.token; localStorage.setItem('medlab_token',token); loggedIn=true; await loadAll(); render();
 }catch(e){document.getElementById('loginError').textContent=e.message}
}
function logout(){token='';localStorage.removeItem('medlab_token');loggedIn=false;render()}
async function render(){
 if(!loggedIn){document.getElementById('app').innerHTML=loginPage();return}
 try{await loadAll()}catch(e){document.getElementById('app').innerHTML=`<div style="padding:30px"><h2>Backend connection failed</h2><p>Start Django first, then reload this page.</p><pre>${esc(e.message)}</pre></div>`;return}
 document.getElementById('app').innerHTML=`<aside class="sidebar"><div class="brand">MedLab <span>Analytics</span></div><nav class="nav">${['dashboard','patients','tests','results','history','reports','users'].map(x=>`<button class="${page===x?'active':''}" onclick="go('${x}')">${({dashboard:'▦ Dashboard',patients:'♙ Patients',tests:'⚗ Tests',results:'＋ Enter Results',history:'◷ History',reports:'▤ Reports',users:'⚙ Users'})[x]}</button>`).join('')}<button onclick="logout()">↪ Logout</button></nav></aside><main class="main"><div class="top"><h1>${title()}</h1><div class="user">● Lab Administrator</div></div><div class="notice"><b>Academic decision-support demo:</b> automated flags are not medical diagnoses. Real deployment requires validated laboratory-specific reference intervals, privacy controls and qualified professional review.</div>${content()}</main>`;
}
function go(p){page=p;render()}
function content(){if(page==='dashboard')return dashboard();if(page==='patients')return patients();if(page==='tests')return tests();if(page==='results')return resultsForm();if(page==='history')return history();if(page==='reports')return reports();return users()}
function dashboard(){let high=cache.results.filter(r=>r.status==='HIGH').length,low=cache.results.filter(r=>r.status==='LOW').length,n=cache.results.filter(r=>r.status==='WITHIN RANGE').length;return `<div class="cards"><div class="card"><div class="muted">Patients</div><div class="metric">${cache.patients.length}</div></div><div class="card"><div class="muted">Laboratory Tests</div><div class="metric">${cache.tests.length}</div></div><div class="card"><div class="muted">Results</div><div class="metric">${cache.results.length}</div></div><div class="card"><div class="muted">Flagged Results</div><div class="metric">${high+low}</div></div></div><div class="grid2"><div class="panel"><h2>Result Overview</h2><p>Within range: <b>${n}</b></p><p>High: <b>${high}</b></p><p>Low: <b>${low}</b></p></div><div class="panel"><h2>Recent Results</h2>${cache.results.slice(0,5).map(r=>`<p><b>${patientName(r.patient)}</b> — ${testName(r.test)}: ${r.value} ${cache.tests.find(t=>t.id===r.test)?.unit||''} ${statusBadge(r.status)}</p>`).join('')}</div></div>`}
function patients(){return `<div class="panel"><div class="actions" style="justify-content:space-between"><h2>Registered Patients</h2><button class="btn" onclick="showPatientForm()">+ Register Patient</button></div><table><tr><th>ID</th><th>Name</th><th>Sex</th><th>Date of Birth</th><th>Phone</th></tr>${cache.patients.map(p=>`<tr><td>${p.patient_id}</td><td>${esc(p.full_name)}</td><td>${p.sex}</td><td>${p.date_of_birth}</td><td>${esc(p.phone)}</td></tr>`).join('')}</table></div>`}
function showPatientForm(){document.querySelector('.main').insertAdjacentHTML('beforeend',`<div class="panel"><h2>Register Patient</h2><div class="formgrid"><div class="field"><label>Patient ID</label><input id="pid"></div><div class="field"><label>Full Name</label><input id="pname"></div><div class="field"><label>Sex</label><select id="psex"><option>Female</option><option>Male</option></select></div><div class="field"><label>Date of Birth</label><input id="pdob" type="date"></div><div class="field"><label>Phone</label><input id="pphone"></div></div><div class="form-actions"><button class="btn" onclick="addPatient()">Save Patient</button></div></div>`)}
async function addPatient(){try{await api('/patients/',{method:'POST',body:JSON.stringify({patient_id:pid.value,full_name:pname.value,sex:psex.value,date_of_birth:pdob.value,phone:pphone.value})});go('patients')}catch(e){alert(e.message)}}
function tests(){return `<div class="panel"><div class="actions" style="justify-content:space-between"><h2>Configured Laboratory Tests</h2><button class="btn" onclick="showTestForm()">+ Add Test</button></div><table><tr><th>ID</th><th>Test</th><th>Unit</th><th>Lower</th><th>Upper</th></tr>${cache.tests.map(t=>`<tr><td>${t.test_id}</td><td>${esc(t.name)}</td><td>${esc(t.unit)}</td><td>${t.lower_reference}</td><td>${t.upper_reference}</td></tr>`).join('')}</table></div>`}
function showTestForm(){document.querySelector('.main').insertAdjacentHTML('beforeend',`<div class="panel"><h2>Add Laboratory Test</h2><div class="formgrid"><div class="field"><label>Test ID</label><input id="tid"></div><div class="field"><label>Test Name</label><input id="tname"></div><div class="field"><label>Unit</label><input id="tunit"></div><div class="field"><label>Lower Reference</label><input id="tlow" type="number" step="any"></div><div class="field"><label>Upper Reference</label><input id="thigh" type="number" step="any"></div></div><div class="form-actions"><button class="btn" onclick="addTest()">Save Test</button></div></div>`)}
async function addTest(){try{await api('/tests/',{method:'POST',body:JSON.stringify({test_id:tid.value,name:tname.value,unit:tunit.value,lower_reference:Number(tlow.value),upper_reference:Number(thigh.value),category:''})});go('tests')}catch(e){alert(e.message)}}
function resultsForm(){return `<div class="panel"><h2>Analyze New Laboratory Result</h2><div class="formgrid"><div class="field"><label>Patient</label><select id="rpatient">${cache.patients.map(p=>`<option value="${p.id}">${p.patient_id} — ${esc(p.full_name)}</option>`).join('')}</select></div><div class="field"><label>Laboratory Test</label><select id="rtest">${cache.tests.map(t=>`<option value="${t.id}">${esc(t.name)} (${t.unit}) — ${t.lower_reference}–${t.upper_reference}</option>`).join('')}</select></div><div class="field"><label>Result Value</label><input id="rvalue" type="number" step="any"></div><div class="field"><label>Test Date</label><input id="rdate" type="date" value="${new Date().toISOString().slice(0,10)}"></div></div><button class="btn" onclick="analyze()">Analyze & Save</button></div>`}
async function analyze(){try{let r=await api('/results/',{method:'POST',body:JSON.stringify({patient:Number(rpatient.value),test:Number(rtest.value),value:Number(rvalue.value),test_date:rdate.value})});alert(`Analysis complete: ${r.status}`);go('history')}catch(e){alert(e.message)}}
function history(){return `<div class="panel"><h2>Laboratory Result History</h2><table><tr><th>Date</th><th>Patient</th><th>Test</th><th>Result</th><th>Status</th></tr>${cache.results.map(r=>`<tr><td>${r.test_date}</td><td>${patientName(r.patient)}</td><td>${testName(r.test)}</td><td>${r.value}</td><td>${statusBadge(r.status)}</td></tr>`).join('')}</table></div>`}
function reports(){return `<div class="panel"><h2>Laboratory Reports</h2><p class="muted">Select a patient and print the report from the browser.</p><select id="reportPatient" onchange="renderReport()">${cache.patients.map(p=>`<option value="${p.id}">${p.patient_id} — ${esc(p.full_name)}</option>`).join('')}</select><div id="reportBox" style="margin-top:18px">${reportHTML(cache.patients[0]?.id)}</div></div>`}
function renderReport(){document.getElementById('reportBox').innerHTML=reportHTML(Number(reportPatient.value))}
function reportHTML(pid){let p=cache.patients.find(x=>x.id===pid),rs=cache.results.filter(r=>r.patient===pid);if(!p)return '';return `<div class="panel" style="box-shadow:none"><h2>MEDICAL LABORATORY REPORT</h2><p><b>Patient:</b> ${esc(p.full_name)} &nbsp; <b>ID:</b> ${p.patient_id}</p><table><tr><th>Date</th><th>Test</th><th>Result</th><th>Status</th></tr>${rs.map(r=>`<tr><td>${r.test_date}</td><td>${testName(r.test)}</td><td>${r.value}</td><td>${statusBadge(r.status)}</td></tr>`).join('')}</table><button class="btn" onclick="window.print()">Print / Save PDF</button></div>`}
function users(){return `<div class="panel"><h2>Backend Connected</h2><p>The application is authenticated against the Django backend. Patient, test and result data are stored in the database.</p><p class="muted">Admin users can be managed from Django Admin.</p></div>`}
render();
