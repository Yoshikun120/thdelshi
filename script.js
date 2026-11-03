/*
  DEMO ACCESS GATE ONLY:
  A password stored in browser JavaScript is visible to visitors and is NOT secure.
  GitHub Pages is public/static hosting. Do not put personal or sensitive records here.
*/
const ACCESS_CODE = "th.delshique";
const loginView = document.getElementById("loginView");
const searchView = document.getElementById("searchView");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const searchForm = document.getElementById("searchForm");
const results = document.getElementById("results");
const resultCount = document.getElementById("resultCount");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passwordInput.value === ACCESS_CODE) {
    loginView.hidden = true;
    searchView.hidden = false;
    loginError.textContent = "";
  } else {
    loginError.textContent = "รหัสไม่ถูกต้อง กรุณาลองอีกครั้ง";
    passwordInput.select();
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  searchView.hidden = true;
  loginView.hidden = false;
  passwordInput.value = "";
  document.getElementById("nameQuery").value = "";
  document.getElementById("refQuery").value = "";
  showEmpty("กรอกคำค้นหาเพื่อเริ่มต้น");
});

function parseDatabase(text) {
  // TXT format: one record per block; fields use KEY: VALUE.
  // Supported fields: NAME, REF, NOTE, CATEGORY, STATUS.
  return text.split(/\r?\n\s*\r?\n/).map(block => {
    const record = {};
    block.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([A-Z_]+)\s*:\s*(.*?)\s*$/i);
      if (match) record[match[1].toUpperCase()] = match[2];
    });
    return record;
  }).filter(record => record.NAME);
}

async function loadDatabase() {
  const response = await fetch("data/database.txt", { cache: "no-store" });
  if (!response.ok) throw new Error("ไม่พบไฟล์ data/database.txt");
  return parseDatabase(await response.text());
}

function showEmpty(message) {
  results.innerHTML = `<div class="empty-state"><div class="empty-icon">⌕</div><p>${escapeHtml(message)}</p></div>`;
  resultCount.textContent = "0 รายการ";
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[char]);
}
function renderRecords(records) {
  resultCount.textContent = `${records.length} รายการ`;
  if (!records.length) return showEmpty("ไม่มีในฐานข้อมูล");
  results.innerHTML = records.map(record => {
    const fields = [
      ["รหัสอ้างอิง", record.REF],
      ["หมวดหมู่", record.CATEGORY],
      ["สถานะ", record.STATUS],
      ["หมายเหตุ", record.NOTE]
    ].filter(([, value]) => value);
    return `<article class="result-card">
      <h2>${escapeHtml(record.NAME)}</h2>
      <div class="detail-grid">${fields.map(([label,value]) =>
        `<div class="detail"><small>${escapeHtml(label)}</small><p>${escapeHtml(value)}</p></div>`
      ).join("")}</div>
    </article>`;
  }).join("");
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("nameQuery").value.trim().toLocaleLowerCase("th");
  const ref = document.getElementById("refQuery").value.trim().toLocaleLowerCase("th");
  if (!name && !ref) return showEmpty("กรุณากรอกชื่อหรือรหัสอ้างอิง");
  results.innerHTML = '<div class="empty-state">กำลังค้นหา…</div>';
  try {
    const records = await loadDatabase();
    const matches = records.filter(record => {
      const nameMatch = name && record.NAME.toLocaleLowerCase("th").includes(name);
      const refMatch = ref && (record.REF || "").toLocaleLowerCase("th") === ref;
      return name && ref ? nameMatch && refMatch : Boolean(nameMatch || refMatch);
    });
    renderRecords(matches);
  } catch (error) {
    showEmpty(error.message);
  }
});
