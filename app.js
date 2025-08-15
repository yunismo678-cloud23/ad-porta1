
// تحميل الإعلانات من ملف JSON
let ADS = [];
const CATEGORIES = ["الكل","عقارات","وظائف","سيارات","خدمات","متفرقات"];

// تهيئة
async function init() {
  await loadAds();
  buildCategoryOptions();
  renderAds(ADS);
  wireSearch();
}

async function loadAds() {
  try {
    const res = await fetch('ads.json?ts=' + Date.now());
    ADS = await res.json();
    // ترتيب حسب التاريخ تنازلياً
    ADS.sort((a,b)=> new Date(b.date) - new Date(a.date));
  } catch (e) {
    console.error('تعذر تحميل ads.json', e);
    ADS = [];
  }
}

function buildCategoryOptions() {
  const select = document.getElementById('category');
  CATEGORIES.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString('ar-EG', {year:'numeric', month:'short', day:'numeric'});
}

function renderAds(list) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'small';
    empty.style.padding = '20px';
    empty.textContent = 'لا توجد نتائج مطابقة الآن.';
    grid.appendChild(empty);
    return;
  }

  list.forEach(ad => {
    const card = document.createElement('div');
    card.className = 'card';

    const imgSrc = (ad.images && ad.images[0]) ? ad.images[0] : '';
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    if (imgSrc) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = ad.title;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      thumb.appendChild(img);
    } else {
      thumb.textContent = 'لا توجد صورة';
    }

    const body = document.createElement('div');
    body.className = 'body';

    const h3 = document.createElement('h3');
    h3.textContent = ad.title;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `
      <span class="badge">📅 ${fmtDate(ad.date)}</span>
      <span class="badge">🏷️ ${ad.category}</span>
      <span class="badge">📍 ${ad.location || 'غير محدد'}</span>
    `;

    const desc = document.createElement('div');
    desc.className = 'small';
    desc.textContent = ad.description;

    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = ad.price || '';

    const contact = document.createElement('div');
    contact.className = 'contact';
    const phone = ad.contact?.phone ? `<a class="badge" href="tel:${ad.contact.phone}">📞 اتصال</a>` : '';
    const wa = ad.contact?.whatsapp ? `<a class="badge" href="https://wa.me/${ad.contact.whatsapp.replace(/^0/,'')}" target="_blank" rel="noopener">🟢 واتساب</a>` : '';
    const email = ad.contact?.email ? `<a class="badge" href="mailto:${ad.contact.email}">✉️ بريد</a>` : '';
    contact.innerHTML = phone + wa + email;

    body.appendChild(h3);
    body.appendChild(meta);
    body.appendChild(desc);
    body.appendChild(price);
    body.appendChild(contact);

    card.appendChild(thumb);
    card.appendChild(body);

    grid.appendChild(card);
  });
}

function wireSearch() {
  const q = document.getElementById('q');
  const category = document.getElementById('category');
  const location = document.getElementById('location');

  function apply() {
    const txt = (q.value || '').trim().toLowerCase();
    const cat = category.value;
    const loc = (location.value || '').trim().toLowerCase();

    const filtered = ADS.filter(ad => {
      const inTxt = !txt || [ad.title, ad.description].filter(Boolean).join(' ').toLowerCase().includes(txt);
      const inCat = (cat === 'الكل') || ad.category === cat;
      const inLoc = !loc || (ad.location || '').toLowerCase().includes(loc);
      return inTxt && inCat && inLoc;
    });
    renderAds(filtered);
  }

  q.addEventListener('input', apply);
  category.addEventListener('change', apply);
  location.addEventListener('input', apply);
}

document.addEventListener('DOMContentLoaded', init);
