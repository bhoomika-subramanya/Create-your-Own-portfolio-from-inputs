// ---------- DOM Helpers ----------
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// ---------- Global Variables ----------
let profileDataURL = null;

// ---------- Global UI Elements ----------
const themeToggle = $('#theme-toggle');
const backToTop  = $('#backToTop');
const toast      = $('#toast');
const yearEl     = $('#year');
const customAccent = $('#customAccent');

// Builder List Containers
const eduList  = $('#eduList');
const certList = $('#certList');
const achList  = $('#achList');
const projList = $('#projList');
const previewSectionsContainer = $('#preview-sections');

// Portfolio Preview elements (PV = Preview View)
const pv = {
  root: $('#preview'),
  name: $('#pvName'),
  role: $('#pvRole'),
  summary: $('#pvSummary'),
  contact: $('#pvContact'),
  skills: $('#pvSkills'),
  proj: $('#pvProj'),
  edu: $('#pvEdu'),
  cert: $('#pvCert'),
  ach: $('#pvAch'),
  links: $('#pvLinks'),
  profile: $('#pvProfile'),
  sectionsContainer: previewSectionsContainer
};

// ---------- Utility Functions ----------

function showToast(msg){
  if (!toast) return;
  toast.textContent = msg; 
  toast.hidden = false;
  toast.classList.add('show');
  setTimeout(()=>{ 
    toast.classList.remove('show'); 
    setTimeout(()=> toast.hidden = true, 250); 
  }, 2000);
}

function applyShellTheme(t){
  if (t==='light') document.documentElement.setAttribute('data-theme','light');
  else document.documentElement.removeAttribute('data-theme');
  try {
    localStorage.setItem('shell-theme', t);
  } catch(e) {
    console.warn('Could not save theme preference');
  }
}

function v(id){ 
  const el = document.getElementById(id);
  return (el?.value || '').trim(); 
}

function themeVal(){ 
  const checked = document.querySelector('input[name="theme"]:checked');
  return checked?.value || 'pro'; 
}

function esc(s){ 
  return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"' : '&quot;'}[c] || c)); 
}

// ---------- Dynamic List Functions ----------

function addEducation() {
  const div = document.createElement('div');
  div.className = 'card min';
  div.innerHTML = `
    <div class="row">
      <label>Institution <input class="ed-inst" placeholder="College/School Name" required></label>
      <label>Degree/Program <input class="ed-deg" placeholder="B.E. CSE (AIML)"></label>
    </div>
    <div class="row">
      <label>Year/Duration <input class="ed-year" placeholder="2022–2026"></label>
      <label>Score/CGPA (optional) <input class="ed-score" placeholder="8.6 CGPA"></label>
    </div>
    <div class="actions">
      <button class="btn btn-ghost remove">Remove</button>
    </div>
  `;
  eduList.appendChild(div);
  attachListListeners(div);
  render(collect());
  saveInputs();
}

function addCertification() {
  const div = document.createElement('div');
  div.className = 'card min';
  div.innerHTML = `
    <div class="row">
      <label>Certification Title <input class="ct-title" placeholder="TensorFlow Developer"></label>
      <label>Issuer <input class="ct-issuer" placeholder="Coursera / Google"></label>
    </div>
    <div class="row">
      <label>Year <input class="ct-year" placeholder="2025"></label>
      <label>Credential URL (optional) <input class="ct-url" placeholder="https://..."></label>
    </div>
    <div class="actions">
      <button class="btn btn-ghost remove">Remove</button>
    </div>
  `;
  certList.appendChild(div);
  attachListListeners(div);
  render(collect());
  saveInputs();
}

function addAchievement() {
  const div = document.createElement('div');
  div.className = 'card min';
  div.innerHTML = `
    <label>Achievement / Award / Position <input class="ach-txt" placeholder="Winner – College Hackathon 2025"></label>
    <div class="actions">
      <button class="btn btn-ghost remove">Remove</button>
    </div>
  `;
  achList.appendChild(div);
  attachListListeners(div);
  render(collect());
  saveInputs();
}

function addProject() {
  const div = document.createElement('div');
  div.className = 'card min';
  div.innerHTML = `
    <label>Project Title <input class="pr-title" placeholder="Phishing Detection using ML"></label>
    <label>Short Description <textarea class="pr-desc" placeholder="One or two lines about the project, stack, outcome."></textarea></label>
    <div class="row">
      <label>Tech/Tags <input class="pr-tags" placeholder="Python, Flask, ML"></label>
      <label>Link (Live/Repo) <input class="pr-link" placeholder="https://github.com/..."></label>
    </div>
    <div class="actions">
      <button class="btn btn-ghost remove">Remove</button>
    </div>
  `;
  projList.appendChild(div);
  attachListListeners(div);
  render(collect());
  saveInputs();
}

// ---------- Data Persistence ----------
const STORAGE_KEY = 'portfolio_builder_data';

function saveInputs() {
    try {
        const data = collect();
        data.eduListHTML = eduList ? eduList.innerHTML : '';
        data.certListHTML = certList ? certList.innerHTML : '';
        data.achListHTML = achList ? achList.innerHTML : '';
        data.projListHTML = projList ? projList.innerHTML : '';

        delete data.edus; delete data.certs; delete data.achs; delete data.projs;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("Could not save to local storage:", e);
    }
}

function attachListListeners(container) {
    if (!container) return;
    
    // Attach remove listeners
    container.querySelectorAll('.remove').forEach(btn => {
        btn.onclick = () => { 
            btn.closest('.card.min').remove(); 
            render(collect()); 
            saveInputs();
        };
    });

    // Attach input listeners
    container.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            render(collect());
            saveInputs();
        });
    });
}

function loadInputs() {
    let loaded = false;
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (!json) throw new Error("No saved data.");
        
        const data = JSON.parse(json);

        // Load simple inputs
        const simpleFields = ['name', 'role', 'age', 'location', 'email', 'phone', 'summary', 'skills', 'github', 'linkedin', 'website', 'metaDesc', 'ogImage'];
        simpleFields.forEach(id => {
            const el = document.getElementById(id);
            if (el && data[id]) el.value = data[id];
        });

        // Load Theme and Custom Color
        if (data.theme) {
            const radio = document.querySelector(`input[name="theme"][value="${data.theme}"]`);
            if (radio) radio.checked = true;
        }
        if (data.customAccent) {
            document.documentElement.style.setProperty('--user-color', data.customAccent);
            if (customAccent) customAccent.value = data.customAccent;
        }
        
        // Load Dynamic Lists innerHTML
        if (eduList && data.eduListHTML) {
            eduList.innerHTML = data.eduListHTML;
            attachListListeners(eduList);
        }
        if (certList && data.certListHTML) {
            certList.innerHTML = data.certListHTML;
            attachListListeners(certList);
        }
        if (achList && data.achListHTML) {
            achList.innerHTML = data.achListHTML;
            attachListListeners(achList);
        }
        if (projList && data.projListHTML) {
            projList.innerHTML = data.projListHTML;
            attachListListeners(projList);
        }
        
        loaded = true;

    } catch (e) {
        console.warn("Loading failed, seeding default data.", e);
    }
    
    if (!loaded) {
        seedDefaults();
    }
}

function seedDefaults() {
    // Add default entries if lists are empty
    if (eduList && eduList.children.length === 0) addEducation();
    if (certList && certList.children.length === 0) addCertification();
    if (achList && achList.children.length === 0) addAchievement();
    if (projList && projList.children.length === 0) addProject();
}

// ---------- Collect Data ----------
function collect(){
  const collectList = (listEl, fields) => {
    if (!listEl) return [];
    
    return [...listEl.querySelectorAll('.card.min')].map(card => {
        let item = {};
        fields.forEach(field => {
            const el = card.querySelector(`.${field}`);
            const key = field.split('-')[1] || 'txt';
            item[key] = el?.value.trim() || '';
        });
        return item;
    }).filter(item => {
        return Object.values(item).some(val => val.length > 0);
    });
  };

  const edus = collectList(eduList, ['ed-inst', 'ed-deg', 'ed-year', 'ed-score']);
  const certs = collectList(certList, ['ct-title', 'ct-issuer', 'ct-year', 'ct-url']);
  const projs = collectList(projList, ['pr-title', 'pr-desc', 'pr-tags', 'pr-link']);
  
  const achs = achList ? [...achList.querySelectorAll('.ach-txt')].map(input => input.value.trim()).filter(val => val.length > 0) : [];

  const defaultOrder = ['about','skills','projects','timeline','contact','education','certifications','achievements'];
  let sectionOrder = defaultOrder;
  
  const customAccentValue = customAccent ? customAccent.value : '#7c5cff';

  return {
    name:v('name'), role:v('role'), age:v('age'), location:v('location'),
    email:v('email'), phone:v('phone'), summary:v('summary'),
    skills:v('skills'), github:v('github'), linkedin:v('linkedin'), website:v('website'),
    theme: themeVal(), edus, certs, achs, projs, profile: profileDataURL,
    metaDesc: v('metaDesc'), ogImage: v('ogImage'),
    customAccent: customAccentValue,
    sectionOrder: sectionOrder
  };
}

// ---------- Render Preview ----------

function setTemplate(t){
  if (!pv.root) return;
  pv.root.classList.remove('theme-pro','theme-cre','theme-norm', 'theme-custom');
  if(t==='cre') pv.root.classList.add('theme-cre');
  else if(t==='norm') pv.root.classList.add('theme-norm');
  else if(t==='custom') pv.root.classList.add('theme-custom');
  else pv.root.classList.add('theme-pro');
}

function render(d){
  if (!pv.root) return;
  setTemplate(d.theme);
  
  // Update all preview fields
  if (pv.name) pv.name.textContent = d.name || 'Your Name';
  if (pv.role) pv.role.textContent = d.role || 'Role / Title';
  if (pv.summary) pv.summary.textContent = d.summary || 'Short objective appears here.';
  if (pv.contact) pv.contact.textContent = [d.email, d.phone, d.location].filter(Boolean).join(' • ') || 'email • phone • location';
  if (pv.profile && d.profile) pv.profile.src = d.profile;

  if (pv.skills) pv.skills.innerHTML = (d.skills||'').split(',').map(s=>s.trim()).filter(Boolean).map(s=>`<span class="chip">${esc(s)}</span>`).join('') || '<span class="muted">—</span>';

  if (pv.proj) pv.proj.innerHTML = d.projs.map(p=>`
    <div class="card min">
      <strong>${esc(p.title)}</strong>
      <div class="muted" style="margin:6px 0">${esc(p.desc||'')}</div>
      <div class="flex">${(p.tags||'').split(',').map(t=>t.trim()).filter(Boolean).map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div>
      ${p.link ? `<div style="margin-top:6px"><a href="${esc(p.link)}" target="_blank" rel="noopener">View</a></div>`:''}
    </div>
  `).join('') || '<div class="muted">—</div>';

  if (pv.edu) pv.edu.innerHTML = d.edus.map(e=>`
    <div class="card min"><strong>${esc(e.inst)}</strong> – ${esc(e.deg||'')}
      <div class="muted">${esc(e.year||'')}${e.score? ' • '+esc(e.score):''}</div>
    </div>
  `).join('') || '<div class="muted">—</div>';

  if (pv.cert) pv.cert.innerHTML = d.certs.map(c=>`
    <div class="card min"><strong>${esc(c.title)}</strong> – ${esc(c.issuer||'')}
      <span class="muted">${esc(c.year||'')}</span>
      ${c.url? `<div><a href="${esc(c.url)}" target="_blank" rel="noopener">View Credential</a></div>`:''}
    </div>
  `).join('') || '<div class="muted">—</div>';

  if (pv.ach) pv.ach.innerHTML = d.achs.map(a=>`<li>${esc(a)}</li>`).join('') || '<li class="muted">—</li>';

  const links = [];
  if (d.github)   links.push(`<a class="chip" href="${esc(d.github)}" target="_blank" rel="noopener">GitHub</a>`);
  if (d.linkedin) links.push(`<a class="chip" href="${esc(d.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`);
  if (d.website)  links.push(`<a class="chip" href="${esc(d.website)}" target="_blank" rel="noopener">Website</a>`);
  if (pv.links) pv.links.innerHTML = links.join(' ') || '<span class="muted">—</span>';
}

// ---------- Export Functions ----------

function inlineCSS(d){
  const accentColor = d.theme === 'custom' ? d.customAccent : (d.theme === 'pro' ? '#2563eb' : (d.theme === 'norm' ? '#2b6cb0' : '#7c5cff'));
  const accentColor2 = d.theme === 'custom' ? d.customAccent : (d.theme === 'pro' ? '#2563eb' : (d.theme === 'norm' ? '#2b6cb0' : '#00c6ff'));
  
  return `
  body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:#0f1724;color:#e6eef8}
  .preview{max-width:980px;margin:0 auto;border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden}
  .export-nav{position:sticky;top:0;padding:12px 18px;background:rgba(10,18,36,.9);border-bottom:1px solid rgba(255,255,255,.12);backdrop-filter:blur(10px);display:flex;justify-content:space-between;align-items:center}
  .export-nav a{color:#e6eef8;text-decoration:none;margin:0 6px}
  .export-nav nav{display:flex;gap:12px}
  .export-hero{padding:28px 18px;background:linear-gradient(180deg, rgba(255,255,255,.04), transparent)}
  .export-hero-inner{display:grid;grid-template-columns:1.2fr 320px;gap:18px;align-items:center}
  .profile-frame{width:320px;height:320px;border-radius:999px;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.02)}
  .profile-frame img{width:100%;height:100%;object-fit:cover}
  .wrap{padding:18px}
  .section{padding:16px 0;border-bottom:1px solid rgba(255,255,255,.08)}
  .accent{color:${accentColor}} 
  .muted{color:#9aa7b8}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  @media (max-width:700px){ .grid2{grid-template-columns:1fr} .export-hero-inner{grid-template-columns:1fr} .profile-frame{width:220px;height:220px} }
  .card{background:linear-gradient(180deg, #111a2c, #162035);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px}
  .chip{display:inline-block;padding:6px 10px;border-radius:999px;font-size:.85rem;margin:4px 6px 0 0;border:1px solid rgba(255,255,255,.1);color:#9aa7b8}
  .list{margin:6px 0 0 16px}
  .btn{background:linear-gradient(90deg, ${accentColor}, ${accentColor2});color:#fff;border:1px solid rgba(255,255,255,.1);padding:10px 14px;border-radius:12px;display:inline-flex;align-items:center;gap:8px;text-decoration:none}
  .flex{display:flex;gap:8px;flex-wrap:wrap}
  h1{font-size:2.6rem;margin:0 0 6px}
  .subtitle{margin:0 0 6px;color:#9aa7b8}
  .lead{color:#9aa7b8;max-width:60ch;margin:6px 0 12px}
  .hero-cta{margin:12px 0}
  .hero-cta .btn{margin-right:8px}
  .nav-brand{font-weight:800;color:#e6eef8;text-decoration:none;display:flex;gap:6px;align-items:center}
  .brand-mark{color:${accentColor}}
  
  .theme-pro{background:#fff;color:#0b1220}
  .theme-pro .export-nav{background:#fff;border-bottom:1px solid #e2e8f0}
  .theme-pro .export-nav a{color:#4a5568}
  .theme-pro .export-hero{background:#f7fafc}
  .theme-pro .accent{color:#2563eb}
  .theme-pro .muted{color:#4a5568}
  .theme-pro .card{background:#fff;border:1px solid #e2e8f0;box-shadow:none}
  .theme-pro .nav-brand{color:#0b1220}
  .theme-pro .brand-mark{color:#2563eb}
  
  .theme-norm{background:#f7fafc;color:#1a202c}
  .theme-norm .export-nav{background:#fff;border-bottom:1px solid #e2e8f0}
  .theme-norm .export-nav a{color:#4a5568}
  .theme-norm .export-hero{background:#fff}
  .theme-norm .accent{color:#2b6cb0}
  .theme-norm .muted{color:#4a5568}
  .theme-norm .card{background:#fff;border:1px solid #e2e8f0;box-shadow:none}
  .theme-norm .nav-brand{color:#1a202c}
  .theme-norm .brand-mark{color:#2b6cb0}
  
  .theme-cre{background:linear-gradient(180deg,#0b132b,#0f172a);color:#f5f7ff}
  .theme-cre .export-nav{background:linear-gradient(90deg,#4318ff,#e5383b);border:none}
  .theme-cre .export-nav .nav-brand{color:#fff}
  .theme-cre .export-nav .brand-mark{color:#fff}
  .theme-cre .export-nav a{color:#fff}
  .theme-cre .export-hero{background:radial-gradient(600px 300px at 10% 10%, rgba(67,24,255,.3), transparent),radial-gradient(600px 300px at 90% 15%, rgba(229,56,59,.25), transparent)}
  .theme-cre .accent{background:linear-gradient(90deg,#4318ff,#e5383b);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:800}
  .theme-cre .muted{color:#b8c1ec}
  .theme-cre .card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(6px)}
  
  .theme-custom .accent{color:${accentColor}}
  .theme-custom .brand-mark{color:${accentColor}}

  @media print{ .export-nav{position:static;background:#fff !important;border-bottom:1px solid #ddd} body{background:#fff;color:#000} a{color:#000} }
  `;
}

function buildStandaloneHTML(d){
  const themeClass = d.theme==='cre' ? 'theme-cre' : d.theme==='norm' ? 'theme-norm' : d.theme==='custom' ? 'theme-custom' : 'theme-pro';

  const sectionsContent = pv.sectionsContainer ? pv.sectionsContainer.innerHTML : '';
  
  const exportedContent = `
    <header class="export-nav">
      <a class="nav-brand" href="#about"><span class="brand-mark">◆</span> ${d.name || 'Your'}<span>Portfolio</span></a>
      <nav aria-label="Portfolio sections">
        ${d.sectionOrder.map(id => {
          const name = id.charAt(0).toUpperCase() + id.slice(1);
          return `<a href="#${id}">${name}</a>`;
        }).join('')}
      </nav>
    </header>
    <div class="export-hero">
      <div class="export-hero-inner">
        <div class="hero-left">
          <h1>Hi, I'm <span>${d.name || 'Your Name'}</span></h1>
          <p class="subtitle">${d.role || 'Role / Title'}</p>
          <p class="lead">${d.summary || 'Short objective appears here.'}</p>
          <div class="hero-cta">
            <a href="#projects" class="btn">View Projects</a>
            <a href="#contact" class="btn" style="background:transparent;color:inherit;border:1px solid currentColor">Contact Me</a>
          </div>
          <p class="muted">${[d.email, d.phone, d.location].filter(Boolean).join(' • ') || 'email • phone • location'}</p>
        </div>
        <div class="hero-right">
          <div class="profile-frame">
            <img src="${d.profile || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'340\' height=\'340\' viewBox=\'0 0 340 340\'%3E%3Crect width=\'340\' height=\'340\' fill=\'%23e2e8f0\'/%3E%3Ctext x=\'170\' y=\'180\' font-family=\'Arial\' font-size=\'24\' text-anchor=\'middle\' fill=\'%23718096\'%3EProfile Photo%3C/text%3E%3C/svg%3E'}" alt="Profile">
          </div>
        </div>
      </div>
    </div>
    <div class="wrap">
      ${sectionsContent}
    </div>
  `;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${d.name ? esc(d.name)+' – Portfolio' : 'Portfolio'}</title>
  ${d.metaDesc ? `<meta name="description" content="${esc(d.metaDesc)}"/>` : ''}
  ${d.name ? `<meta property="og:title" content="${esc(d.name)}'s Portfolio"/>` : ''}
  ${d.metaDesc ? `<meta property="og:description" content="${esc(d.metaDesc)}"/>` : ''}
  ${d.ogImage ? `<meta property="og:image" content="${esc(d.ogImage)}"/>` : ''}
  <style>${inlineCSS(d)}</style>
</head>
<body>
  <div class="preview ${themeClass}">
    ${exportedContent}
  </div>
</body>
</html>`;
}

function downloadFile(filename, content, mimeType = 'text/html') {
  try {
    // Check if browser supports downloads
    if (!window.URL || !window.URL.createObjectURL) {
      throw new Error('Browser does not support file downloads');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
}

// ---------- Event Handlers ----------

function setupButtonHandlers() {
  // Download HTML button
  const btnDownloadHtml = $('#btnDownloadHtml');
  if (btnDownloadHtml) {
    btnDownloadHtml.addEventListener('click', () => {
      try {
        const data = collect();
        data.customAccent = document.documentElement.style.getPropertyValue('--user-color') || customAccent?.value || '#7c5cff';
        
        render(data);
        const html = buildStandaloneHTML(data);
        const filename = (data.name || 'portfolio').replace(/[^a-zA-Z0-9]/g, '_') + '.html';
        
        const success = downloadFile(filename, html, 'text/html;charset=utf-8');
        
        if (success) {
          showToast('Portfolio HTML downloaded successfully!');
          $('#status').textContent = 'Downloaded standalone HTML file.';
        } else {
          throw new Error('Download failed');
        }
      } catch (error) {
        console.error('HTML Download Error:', error);
        showToast('Download failed. Please try again.');
        $('#status').textContent = 'Download failed. Check browser settings.';
      }
    });
  }

  // Download PDF button
  const btnDownloadPdf = $('#btnDownloadPdf');
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', () => {
      try {
        const data = collect();
        data.customAccent = document.documentElement.style.getPropertyValue('--user-color') || customAccent?.value || '#7c5cff';
        
        render(data);
        const html = buildStandaloneHTML(data);
        
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(html);
          printWindow.document.close();
          
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 500);
          };
          
          showToast('Print dialog opened for PDF generation');
          $('#status').textContent = 'Generating PDF via print dialog...';
        } else {
          throw new Error('Popup blocked');
        }
      } catch (error) {
        console.error('PDF Download Error:', error);
        showToast('PDF generation failed. Please allow popups.');
        $('#status').textContent = 'PDF generation failed. Check popup settings.';
      }
    });
  }

  // Share button (copy HTML)
  const btnShare = $('#btnShare');
  if (btnShare) {
    btnShare.addEventListener('click', async () => {
      try {
        const data = collect();
        data.customAccent = document.documentElement.style.getPropertyValue('--user-color') || customAccent?.value || '#7c5cff';
        
        render(data);
        const html = buildStandaloneHTML(data);
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(html);
          showToast('Full HTML code copied to clipboard!');
          $('#status').textContent = 'HTML code copied to clipboard.';
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = html;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          showToast('HTML code copied to clipboard!');
          $('#status').textContent = 'HTML code copied to clipboard.';
        }
      } catch (error) {
        console.error('Copy Error:', error);
        showToast('Copy failed. Try downloading the HTML file instead.');
        $('#status').textContent = 'Copy failed. Try download instead.';
      }
    });
  }

  // Preview button
  const btnPreview = $('#btnPreview');
  if (btnPreview) {
    btnPreview.addEventListener('click', () => {
      render(collect());
      showToast('Preview updated successfully!');
      $('#status').textContent = 'Preview updated.';
      saveInputs();
    });
  }
}

// ---------- Initialization ----------

document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Initializing Portfolio Builder...');
    
    // Set current year
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    // Load saved data or seed defaults
    loadInputs();
    
    // Setup add button listeners
    $('#addEdu')?.addEventListener('click', addEducation);
    $('#addCert')?.addEventListener('click', addCertification);
    $('#addAch')?.addEventListener('click', addAchievement);
    $('#addProj')?.addEventListener('click', addProject);
    
    // Setup profile photo upload
    const profileFileInput = $('#profileFile');
    const fileDisplay = $('.file-input-display');
    
    if (profileFileInput && fileDisplay) {
      profileFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showToast('Image too large. Please choose a file under 5MB.');
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (e) => {
            profileDataURL = e.target.result;
            fileDisplay.textContent = file.name;
            render(collect());
            saveInputs();
          };
          reader.onerror = () => {
            showToast('Failed to read image file.');
          };
          reader.readAsDataURL(file);
        } else {
          profileDataURL = null;
          fileDisplay.textContent = 'Click to choose profile image...';
          render(collect());
          saveInputs();
        }
      });
    }
    
    // Setup input listeners for live updates
    const inputFields = ['name', 'role', 'age', 'location', 'email', 'phone', 'summary', 'skills', 'github', 'linkedin', 'website', 'metaDesc', 'ogImage'];
    inputFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          render(collect());
          saveInputs();
        });
      }
    });
    
    // Setup theme radio listeners
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
      radio.addEventListener('change', () => {
        render(collect());
        saveInputs();
      });
    });
    
    // Setup custom color picker
    if (customAccent) {
      customAccent.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--user-color', e.target.value);
        const customRadio = document.getElementById('themeCustomRadio');
        if (customRadio) customRadio.checked = true;
        render(collect());
        saveInputs();
      });
    }
    
    // Setup main action buttons
    setupButtonHandlers();
    
    // Setup theme toggle
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const current = localStorage.getItem('shell-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        applyShellTheme(next);
        showToast(next === 'light' ? 'Light theme enabled' : 'Dark theme enabled');
      });
    }
    
    // Setup back to top button
    if (backToTop) {
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          backToTop.classList.add('show');
        } else {
          backToTop.classList.remove('show');
        }
      });
      
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    
    // Initial render
    render(collect());
    
    console.log('Portfolio Builder initialized successfully!');
    
  } catch (error) {
    console.error('Initialization failed:', error);
    if ($('#status')) {
      $('#status').textContent = 'Initialization failed. Please refresh the page.';
    }
  }
});