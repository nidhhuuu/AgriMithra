// AgriMitra - single-file working demo
// Run: npm init -y && npm install express && node server.js
// Open: http://localhost:3000

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- In-memory "database" ----------
const db = {
  scans: [],
  chats: [],
  experts: [],
  products: [
    { id: 1, name: 'Urea Fertilizer 50kg', price: 266, category: 'Fertilizer' },
    { id: 2, name: 'Neem Oil Spray 1L', price: 350, category: 'Pesticide' },
    { id: 3, name: 'Drip Irrigation Kit', price: 4500, category: 'Equipment' },
    { id: 4, name: 'Hybrid Tomato Seeds', price: 120, category: 'Seeds' },
  ],
  schemes: [
    { id: 1, name: 'PM-KISAN', desc: '₹6000/year income support to small farmers', link: 'https://pmkisan.gov.in' },
    { id: 2, name: 'Pradhan Mantri Fasal Bima Yojana', desc: 'Crop insurance against natural calamities', link: 'https://pmfby.gov.in' },
    { id: 3, name: 'Kisan Credit Card', desc: 'Low-interest credit for farm needs', link: 'https://www.nabard.org' },
    { id: 4, name: 'Soil Health Card', desc: 'Free soil testing and nutrient advice', link: 'https://soilhealth.dac.gov.in' },
  ],
};

// ---------- Mock AI diagnosis ----------
function diagnoseCrop(cropName, symptoms) {
  const s = (symptoms || '').toLowerCase();
  let disease = 'Unknown - needs expert review';
  let confidence = 0.45;
  let treatment = 'Consult a local agriculture officer for accurate diagnosis.';

  if (s.includes('yellow') || s.includes('yellowing')) {
    disease = 'Nitrogen Deficiency';
    confidence = 0.78;
    treatment = 'Apply urea (50kg/acre) or organic compost. Ensure proper irrigation.';
  } else if (s.includes('spot') || s.includes('spots')) {
    disease = 'Leaf Spot Disease';
    confidence = 0.72;
    treatment = 'Spray Mancozeb 2g/L. Remove infected leaves. Avoid overhead watering.';
  } else if (s.includes('white') || s.includes('powder')) {
    disease = 'Powdery Mildew';
    confidence = 0.75;
    treatment = 'Spray sulfur-based fungicide. Improve air circulation.';
  } else if (s.includes('wilt') || s.includes('droop')) {
    disease = 'Bacterial Wilt';
    confidence = 0.68;
    treatment = 'Remove affected plants. Apply Trichoderma. Rotate crops next season.';
  } else if (s.includes('hole') || s.includes('insect') || s.includes('chew')) {
    disease = 'Insect Pest Damage';
    confidence = 0.7;
    treatment = 'Spray Neem oil (5ml/L) or recommended insecticide. Install traps.';
  }

  return { cropName, disease, confidence, treatment, needsExpert: confidence < 0.7 };
}

// ---------- Mock chat bot ----------
function chatReply(message, lang) {
  const m = message.toLowerCase();
  if (m.includes('weather') || m.includes('మausam')) {
    return 'Today: 28°C, humidity 65%, light showers expected in evening. Good for sowing.';
  }
  if (m.includes('fertilizer') || m.includes('urea')) {
    return 'For most crops, apply NPK 19:19:19 at 5g/L as foliar spray every 15 days.';
  }
  if (m.includes('water') || m.includes('irrigation')) {
    return 'Water early morning or evening. Drip irrigation saves 40% water vs flood.';
  }
  if (m.includes('price') || m.includes('market')) {
    return 'Check local mandi rates daily. Current tomato: ₹25/kg, wheat: ₹22/kg.';
  }
  return 'I can help with crop diseases, weather, fertilizers, irrigation, and market prices. What would you like to know?';
}

// ---------- API Routes ----------
app.post('/api/scan', (req, res) => {
  const { cropName, symptoms } = req.body;
  const result = diagnoseCrop(cropName, symptoms);
  const record = { id: Date.now(), ...result, timestamp: new Date() };
  db.scans.push(record);
  if (result.needsExpert) {
    db.experts.push({ id: Date.now(), ...record, status: 'pending' });
  }
  res.json({ success: true, result });
});

app.post('/api/chat', (req, res) => {
  const { message, lang } = req.body;
  const reply = chatReply(message || '', lang || 'en');
  db.chats.push({ id: Date.now(), message, reply, timestamp: new Date() });
  res.json({ success: true, reply });
});

app.get('/api/schemes', (req, res) => res.json(db.schemes));
app.get('/api/products', (req, res) => res.json(db.products));
app.get('/api/experts', (req, res) => res.json(db.experts));

app.post('/api/order', (req, res) => {
  const { productId, name, phone, address } = req.body;
  const product = db.products.find(p => p.id == productId);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  res.json({ success: true, order: { id: Date.now(), product, name, phone, address, status: 'confirmed' } });
});

// ---------- Frontend (single HTML page) ----------
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AgriMitra - One digital assistant for every farming problem</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
body { background: #f8faf7; color: #1a2e1a; line-height: 1.6; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
nav { background: #1a5d1a; color: white; padding: 15px 0; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
nav .container { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.logo { font-size: 1.5rem; font-weight: bold; }
.logo span { color: #8fd14f; }
.nav-links { display: flex; gap: 20px; flex-wrap: wrap; }
.nav-links a { color: white; text-decoration: none; font-size: 0.95rem; }
.nav-links a:hover { color: #8fd14f; }
.lang-switch { display: flex; gap: 8px; }
.lang-switch button { background: transparent; border: 1px solid #8fd14f; color: white; padding: 5px 12px; border-radius: 15px; cursor: pointer; font-size: 0.85rem; }
.lang-switch button.active { background: #8fd14f; color: #1a5d1a; font-weight: bold; }
.hero { background: linear-gradient(135deg, #1a5d1a 0%, #2d7a2d 100%); color: white; padding: 70px 0; text-align: center; }
.hero h1 { font-size: 2.5rem; margin-bottom: 20px; line-height: 1.2; }
.hero p { font-size: 1.15rem; max-width: 700px; margin: 0 auto 30px; opacity: 0.95; }
.btn { background: #8fd14f; color: #1a5d1a; padding: 14px 32px; border: none; border-radius: 30px; font-size: 1rem; font-weight: bold; cursor: pointer; text-decoration: none; display: inline-block; transition: transform 0.2s; }
.btn:hover { transform: translateY(-2px); }
.btn-outline { background: transparent; border: 2px solid white; color: white; margin-left: 10px; }
.section { padding: 60px 0; }
.section h2 { font-size: 2rem; margin-bottom: 15px; color: #1a5d1a; text-align: center; }
.section .subtitle { text-align: center; color: #666; margin-bottom: 40px; max-width: 700px; margin-left: auto; margin-right: auto; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; }
.card { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); transition: transform 0.2s; }
.card:hover { transform: translateY(-5px); }
.card h3 { color: #1a5d1a; margin-bottom: 12px; font-size: 1.2rem; }
.card p { color: #555; font-size: 0.95rem; }
.card .icon { font-size: 2.5rem; margin-bottom: 15px; }
.step-flow { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 30px; }
.step { background: white; padding: 12px 20px; border-radius: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); font-size: 0.9rem; color: #1a5d1a; font-weight: 600; }
.step::before { content: '→ '; color: #8fd14f; }
.step:first-child::before { content: ''; }
.tool-panel { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin-top: 30px; }
.tool-panel input, .tool-panel textarea, .tool-panel select { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; margin-bottom: 15px; font-size: 1rem; font-family: inherit; }
.tool-panel input:focus, .tool-panel textarea:focus { outline: none; border-color: #8fd14f; }
.result { background: #f0f9e8; border-left: 4px solid #8fd14f; padding: 20px; border-radius: 10px; margin-top: 20px; }
.result h4 { color: #1a5d1a; margin-bottom: 10px; }
.confidence { display: inline-block; padding: 4px 12px; border-radius: 15px; font-size: 0.85rem; font-weight: bold; margin-top: 8px; }
.conf-high { background: #8fd14f; color: #1a5d1a; }
.conf-mid { background: #ffd93d; color: #7a5a00; }
.conf-low { background: #ff8a8a; color: #7a0000; }
.chat-box { height: 300px; overflow-y: auto; border: 2px solid #e0e0e0; border-radius: 10px; padding: 15px; margin-bottom: 15px; background: #fafafa; }
.msg { margin-bottom: 12px; padding: 10px 15px; border-radius: 12px; max-width: 80%; }
.msg.user { background: #8fd14f; color: #1a5d1a; margin-left: auto; }
.msg.bot { background: white; border: 1px solid #e0e0e0; }
.product { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: white; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.product .price { font-weight: bold; color: #1a5d1a; }
.scheme { background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.scheme h4 { color: #1a5d1a; margin-bottom: 8px; }
.scheme a { color: #2d7a2d; font-size: 0.9rem; }
footer { background: #1a5d1a; color: white; text-align: center; padding: 30px 0; margin-top: 40px; }
.tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; justify-content: center; }
.tab { padding: 10px 20px; border: 2px solid #8fd14f; background: white; color: #1a5d1a; border-radius: 25px; cursor: pointer; font-weight: 600; }
.tab.active { background: #8fd14f; color: #1a5d1a; }
.hidden { display: none; }
@media (max-width: 600px) { .hero h1 { font-size: 1.8rem; } .nav-links { display: none; } }
</style>
</head>
<body>

<nav>
  <div class="container">
    <div class="logo">Agri<span>Mitra</span></div>
    <div class="lang-switch">
      <button data-lang="en" class="active">English</button>
      <button data-lang="hi">हिन्दी</button>
      <button data-lang="te">తెలుగు</button>
    </div>
  </div>
</nav>

<section class="hero">
  <div class="container">
    <h1 data-i18n="heroTitle">One digital assistant for every farming problem</h1>
    <p data-i18n="heroSub">AgriMitra brings AI crop diagnosis, weather guidance, government schemes, real agriculture experts and a farm supply store into a single app — in the farmer's own language.</p>
    <a href="#tools" class="btn" data-i18n="cta">Get Started</a>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 data-i18n="featuresTitle">Everything a farmer needs, in one place</h2>
    <div class="grid">
      <div class="card"><div class="icon">🔬</div><h3>Scan your crop</h3><p>Photograph a sick leaf and get an instant, honest assessment — never a false 100% guarantee.</p></div>
      <div class="card"><div class="icon">💬</div><h3>Ask AI anytime</h3><p>Type or speak a question in your own language, like talking to a knowledgeable friend.</p></div>
      <div class="card"><div class="icon">👨‍🌾</div><h3>Real experts when it matters</h3><p>When the AI isn't confident, a human agriculture officer reviews your case.</p></div>
      <div class="card"><div class="icon">🏛️</div><h3>Schemes & marketplace</h3><p>Government schemes, local weather, and farm supplies — without visiting an office.</p></div>
      <div class="card"><div class="icon">✅</div><h3>Diagnosis you can trust</h3><p>Every scan comes with a confidence score and clear next steps.</p></div>
      <div class="card"><div class="icon">🤝</div><h3>A human is always one tap away</h3><p>Uncertain cases go straight to an agriculture officer.</p></div>
    </div>
  </div>
</section>

<section class="section" style="background:#f0f9e8;">
  <div class="container">
    <h2>From problem to solution</h2>
    <p class="subtitle">AI never claims a photo is a confirmed diagnosis</p>
    <div class="step-flow">
      <div class="step">Problem</div><div class="step">Understanding</div><div class="step">Diagnosis</div>
      <div class="step">Guidance</div><div class="step">Expert help</div><div class="step">Product</div><div class="step">Order</div>
    </div>
  </div>
</section>

<section class="section" id="tools">
  <div class="container">
    <h2>Try AgriMitra</h2>
    <div class="tabs">
      <button class="tab active" data-tab="scan">🔬 Crop Scan</button>
      <button class="tab" data-tab="chat">💬 AI Chat</button>
      <button class="tab" data-tab="schemes">🏛️ Schemes</button>
      <button class="tab" data-tab="market">🛒 Marketplace</button>
      <button class="tab" data-tab="experts">👨‍🌾 Experts</button>
    </div>

    <div id="tab-scan" class="tool-panel">
      <h3 style="color:#1a5d1a;margin-bottom:15px;">Scan your crop</h3>
      <input id="cropName" placeholder="Crop name (e.g. Tomato, Wheat)" />
      <textarea id="symptoms" rows="3" placeholder="Describe symptoms (e.g. yellow leaves, brown spots, wilting)"></textarea>
      <button class="btn" onclick="runScan()">Diagnose</button>
      <div id="scanResult"></div>
    </div>

    <div id="tab-chat" class="tool-panel hidden">
      <h3 style="color:#1a5d1a;margin-bottom:15px;">Ask AI anytime</h3>
      <div class="chat-box" id="chatBox">
        <div class="msg bot">Hello! Ask me about crops, weather, fertilizers, or market prices.</div>
      </div>
      <input id="chatInput" placeholder="Type your question..." onkeypress="if(event.key==='Enter')sendChat()" />
      <button class="btn" onclick="sendChat()">Send</button>
    </div>

    <div id="tab-schemes" class="tool-panel hidden">
      <h3 style="color:#1a5d1a;margin-bottom:15px;">Government Schemes</h3>
      <div id="schemesList">Loading...</div>
    </div>

    <div id="tab-market" class="tool-panel hidden">
      <h3 style="color:#1a5d1a;margin-bottom:15px;">Farm Supply Store</h3>
      <div id="productsList">Loading...</div>
    </div>

    <div id="tab-experts" class="tool-panel hidden">
      <h3 style="color:#1a5d1a;margin-bottom:15px;">Expert Review Queue</h3>
      <p style="color:#666;margin-bottom:15px;">Cases where AI confidence was low — awaiting agriculture officer review.</p>
      <div id="expertsList">Loading...</div>
    </div>
  </div>
</section>

<footer>
  <div class="container">
    <p>AgriMitra — Built for rural farmers</p>
    <p style="opacity:0.7;font-size:0.9rem;margin-top:8px;">Demo project · Not a substitute for professional agronomic advice</p>
  </div>
</footer>

<script>
const i18n = {
  en: { heroTitle: "One digital assistant for every farming problem", heroSub: "AgriMitra brings AI crop diagnosis, weather guidance, government schemes, real agriculture experts and a farm supply store into a single app — in the farmer's own language.", cta: "Get Started", featuresTitle: "Everything a farmer needs, in one place" },
  hi: { heroTitle: "हर खेती की समस्या के लिए एक डिजिटल सहायक", heroSub: "AgriMitra AI फसल निदान, मौसम मार्गदर्शन, सरकारी योजनाएं, वास्तविक कृषि विशेषज्ञ और कृषि आपूर्ति स्टोर को एक ऐप में लाता है।", cta: "शुरू करें", featuresTitle: "किसान की हर जरूरत, एक जगह" },
  te: { heroTitle: "ప్రతి వ్యవసాయ సమస్యకు ఒక డిజిటల్ సహాయకుడు", heroSub: "AgriMitra AI పంట నిర్ధారణ, వాతావరణ మార్గదర్శకం, ప్రభుత్వ పథకాలు, నిజమైన వ్యవసాయ నిపుణులు మరియు వ్యవసాయ సరఫరా స్టోర్‌ను ఒక యాప్‌లోకి తెస్తుంది.", cta: "ప్రారంభించండి", featuresTitle: "రైతుకు కావాల్సినవన్నీ, ఒకే చోట" }
};

let currentLang = 'en';
document.querySelectorAll('.lang-switch button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.lang-switch button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLang = btn.dataset.lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (i18n[currentLang][key]) el.textContent = i18n[currentLang][key];
    });
  };
});

document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tool-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById('tab-' + tab.dataset.tab).classList.remove('hidden');
    if (tab.dataset.tab === 'schemes') loadSchemes();
    if (tab.dataset.tab === 'market') loadProducts();
    if (tab.dataset.tab === 'experts') loadExperts();
  };
});

async function runScan() {
  const cropName = document.getElementById('cropName').value.trim();
  const symptoms = document.getElementById('symptoms').value.trim();
  if (!cropName) { alert('Please enter crop name'); return; }
  const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cropName, symptoms }) });
  const data = await res.json();
  const r = data.result;
  let confClass = r.confidence >= 0.7 ? 'conf-high' : r.confidence >= 0.5 ? 'conf-mid' : 'conf-low';
  document.getElementById('scanResult').innerHTML = \`
    <div class="result">
      <h4>Diagnosis: \${r.disease}</h4>
      <p><strong>Crop:</strong> \${r.cropName}</p>
      <p><strong>Treatment:</strong> \${r.treatment}</p>
      <span class="confidence \${confClass}">Confidence: \${Math.round(r.confidence * 100)}%</span>
      \${r.needsExpert ? '<p style="margin-top:12px;color:#b45309;"><strong>⚠️ Low confidence — sent to an agriculture officer for review.</strong></p>' : ''}
    </div>\`;
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;
  const box = document.getElementById('chatBox');
  box.innerHTML += \`<div class="msg user">\${message}</div>\`;
  input.value = '';
  box.scrollTop = box.scrollHeight;
  const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, lang: currentLang }) });
  const data = await res.json();
  box.innerHTML += \`<div class="msg bot">\${data.reply}</div>\`;
  box.scrollTop = box.scrollHeight;
}

async function loadSchemes() {
  const res = await fetch('/api/schemes');
  const schemes = await res.json();
  document.getElementById('schemesList').innerHTML = schemes.map(s => \`
    <div class="scheme"><h4>\${s.name}</h4><p>\${s.desc}</p><a href="\${s.link}" target="_blank">Learn more →</a></div>\`).join('');
}

async function loadProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();
  document.getElementById('productsList').innerHTML = products.map(p => \`
    <div class="product"><div><strong>\${p.name}</strong><br><small>\${p.category}</small></div>
    <div><span class="price">₹\${p.price}</span> <button class="btn" style="padding:8px 16px;font-size:0.9rem;" onclick="orderProduct(\${p.id})">Order</button></div></div>\`).join('');
}

async function orderProduct(id) {
  const name = prompt('Your name:'); if (!name) return;
  const phone = prompt('Phone:'); if (!phone) return;
  const address = prompt('Delivery address:'); if (!address) return;
  const res = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id, name, phone, address }) });
  const data = await res.json();
  if (data.success) alert('Order confirmed! Order ID: ' + data.order.id);
  else alert('Error: ' + data.error);
}

async function loadExperts() {
  const res = await fetch('/api/experts');
  const experts = await res.json();
  if (experts.length === 0) { document.getElementById('expertsList').innerHTML = '<p style="color:#666;">No pending cases. All clear! ✅</p>'; return; }
  document.getElementById('expertsList').innerHTML = experts.map(e => \`
    <div class="scheme"><h4>\${e.cropName} - \${e.disease}</h4>
      <p><strong>Symptoms:</strong> \${e.treatment}</p>
      <p><span class="confidence conf-low">Pending expert review</span></p>
    </div>\`).join('');
}
</script>
</body>
</html>`;

app.get('/', (req, res) => res.send(HTML));

app.listen(PORT, () => {
  console.log(`AgriMitra is running at http://localhost:${PORT}`);
});