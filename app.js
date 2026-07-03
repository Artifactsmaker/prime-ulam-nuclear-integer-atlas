const columns = ATLAS_DATA.columns;
const rows = ATLAS_DATA.rows.map((values, index) => {
  const row = { index };
  columns.forEach((key, i) => row[key] = values[i]);
  row.search = `${row.Nuclide_Label} ${row.Element_Symbol} Z=${row.Z} N=${row.N} A=${row.A} ${row.PiSig_Z} ${row.PiSig_N} ${row.PiSig_A}`.toLowerCase();
  return row;
});

const metricRanges = {};
["Hpf_total", "Omega_total", "omega_total", "rad_total", "v2_total", "factor_overlap"].forEach(metric => {
  let min = Infinity;
  let max = -Infinity;
  rows.forEach(row => {
    min = Math.min(min, row[metric]);
    max = Math.max(max, row[metric]);
  });
  metricRanges[metric] = { min, max };
});

const canvas = document.getElementById("atlasCanvas");
const ctx = canvas.getContext("2d");
const searchBox = document.getElementById("searchBox");
const metricSelect = document.getElementById("metricSelect");
const regionSelect = document.getElementById("regionSelect");
const visibleCount = document.getElementById("visibleCount");
const rowsBody = document.getElementById("rowsBody");
const pageInfo = document.getElementById("pageInfo");
const legendMetric = document.getElementById("legendMetric");
const detailTitle = document.getElementById("detailTitle");
const detailGrid = document.getElementById("detailGrid");
const sigZ = document.getElementById("sigZ");
const sigN = document.getElementById("sigN");
const sigA = document.getElementById("sigA");
const langEn = document.getElementById("langEn");
const langVn = document.getElementById("langVn");

const controls = {
  zMin: document.getElementById("zMin"),
  zMax: document.getElementById("zMax"),
  nMin: document.getElementById("nMin"),
  nMax: document.getElementById("nMax"),
};

const pageSize = 120;
let filtered = rows;
let selected = null;
let page = 0;
let currentLang = "en";

const i18n = {
  en: {
    eyebrow: "Arithmetic Descriptor Atlas",
    subtitle: "PRIME-ULAM ARITHMETIC MAP OF NUCLEAR CONFIGURATION SPACE",
    configCount: "/ 51,772 configs",
    searchLabel: "Search",
    metricLabel: "Metric",
    regionLabel: "Region",
    regionAll: "All Z",
    zMin: "Z min",
    zMax: "Z max",
    nMin: "N min",
    nMax: "N max",
    reset: "Reset",
    topMetric: "Top metric",
    low: "low",
    high: "high",
    boundaryNote: "Descriptors are arithmetic transformations of Z, N, and A. This is not an observed-nuclide database.",
    axisN: "N axis: neutron number 0-300",
    axisZ: "Z axis: proton number 1-172",
    selectedConfig: "Selected Configuration",
    detailEmpty: "Hover or click a point",
    ledger: "Configuration Ledger",
    ledgerTitle: "51,772 integer configurations",
    prev: "Prev",
    next: "Next",
    page: "Page",
  },
  vn: {
    eyebrow: "Bản Đồ Mô Tả Số Học",
    subtitle: "BẢN ĐỒ MÔ TẢ SỐ HỌC PRIME-ULAM TRÊN KHÔNG GIAN CẤU HÌNH HẠT NHÂN",
    configCount: "/ 51.772 cấu hình",
    searchLabel: "Tìm kiếm",
    metricLabel: "Chỉ số",
    regionLabel: "Vùng",
    regionAll: "Toàn bộ Z",
    zMin: "Z nhỏ nhất",
    zMax: "Z lớn nhất",
    nMin: "N nhỏ nhất",
    nMax: "N lớn nhất",
    reset: "Đặt lại",
    topMetric: "Cực đại",
    low: "thấp",
    high: "cao",
    boundaryNote: "Các chỉ số là biến đổi số học từ Z, N và A. Đây không phải cơ sở dữ liệu nuclide quan sát thực nghiệm.",
    axisN: "Trục N: số neutron 0-300",
    axisZ: "Trục Z: số proton 1-172",
    selectedConfig: "Cấu hình đang chọn",
    detailEmpty: "Rê chuột hoặc bấm vào một điểm",
    ledger: "Sổ cái cấu hình",
    ledgerTitle: "51.772 cấu hình số nguyên",
    prev: "Trước",
    next: "Sau",
    page: "Trang",
  },
};

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang === "vn" ? "vi" : "en";
  document.querySelectorAll("[data-i18n]").forEach(node => {
    const key = node.dataset.i18n;
    node.textContent = i18n[lang][key] || i18n.en[key] || node.textContent;
  });
  langEn.classList.toggle("active", lang === "en");
  langVn.classList.toggle("active", lang === "vn");
  langEn.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
  langVn.setAttribute("aria-pressed", lang === "vn" ? "true" : "false");
  if (!selected && detailTitle.dataset.emptyKey) {
    detailTitle.textContent = i18n[lang][detailTitle.dataset.emptyKey];
  }
  renderTable();
}

function fmt(value) {
  if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(3);
  return value;
}

function color(metric, value, official) {
  const range = metricRanges[metric];
  const t = Math.max(0, Math.min(1, (value - range.min) / (range.max - range.min || 1)));
  const stops = [
    [0.00, [7, 16, 23]],
    [0.22, [12, 55, 80]],
    [0.48, [20, 184, 198]],
    [0.70, [125, 92, 255]],
    [0.88, [241, 197, 91]],
    [1.00, [247, 247, 218]],
  ];
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const local = (t - a[0]) / (b[0] - a[0] || 1);
  const rgb = a[1].map((v, i) => Math.round(v + (b[1][i] - v) * local));
  if (!official) {
    rgb[0] = Math.round(rgb[0] * 0.72);
    rgb[1] = Math.round(rgb[1] * 0.72);
    rgb[2] = Math.round(rgb[2] * 0.82);
  }
  return `rgb(${rgb.join(",")})`;
}

function point(row) {
  const pad = 46;
  const w = canvas.width - pad * 2;
  const h = canvas.height - pad * 2;
  return {
    x: pad + (row.N / 300) * w,
    y: pad + ((172 - row.Z) / 171) * h,
  };
}

function draw() {
  const metric = metricSelect.value;
  legendMetric.textContent = metric;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#02050a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(107,232,247,0.10)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const x = 46 + i * ((canvas.width - 92) / 10);
    const y = 46 + i * ((canvas.height - 92) / 10);
    ctx.beginPath(); ctx.moveTo(x, 46); ctx.lineTo(x, canvas.height - 46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(46, y); ctx.lineTo(canvas.width - 46, y); ctx.stroke();
  }

  [2, 8, 20, 28, 50, 82, 126].forEach(n => {
    const x = 46 + (n / 300) * (canvas.width - 92);
    ctx.strokeStyle = "rgba(107,232,247,0.24)";
    ctx.beginPath(); ctx.moveTo(x, 46); ctx.lineTo(x, canvas.height - 46); ctx.stroke();
  });
  [2, 8, 20, 28, 50, 82, 126].forEach(z => {
    const y = 46 + ((172 - z) / 171) * (canvas.height - 92);
    ctx.strokeStyle = "rgba(245,204,103,0.20)";
    ctx.beginPath(); ctx.moveTo(46, y); ctx.lineTo(canvas.width - 46, y); ctx.stroke();
  });

  const boundary = 46 + ((172 - 118) / 171) * (canvas.height - 92);
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = "rgba(245,204,103,0.86)";
  ctx.beginPath(); ctx.moveTo(46, boundary); ctx.lineTo(canvas.width - 46, boundary); ctx.stroke();
  ctx.setLineDash([]);

  const cellW = (canvas.width - 92) / 301;
  const cellH = (canvas.height - 92) / 172;
  filtered.forEach(row => {
    const p = point(row);
    ctx.fillStyle = color(metric, row[metric], row.Z <= 118);
    ctx.globalAlpha = row.factor_overlap >= 0.75 ? 0.95 : 0.66;
    ctx.fillRect(p.x - cellW / 2, p.y - cellH / 2, Math.max(1.4, cellW), Math.max(1.4, cellH));
  });
  ctx.globalAlpha = 1;

  const anchors = ["He-4", "C-12", "Fe-56", "Pb-208", "U-238", "Og-294", "Ubo-384", "Usb-472"];
  ctx.font = "700 14px Segoe UI";
  anchors.forEach(label => {
    const row = rows.find(item => item.Nuclide_Label === label);
    if (!row) return;
    const p = point(row);
    ctx.strokeStyle = "#f5cc67";
    ctx.fillStyle = "#fff7c7";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff1bf";
    ctx.fillText(label, p.x + 10, p.y - 8);
  });

  if (selected) {
    const p = point(selected);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p.x, p.y, 13, 0, Math.PI * 2); ctx.stroke();
  }
}

function passes(row, query, zMin, zMax, nMin, nMax, region) {
  if (row.Z < zMin || row.Z > zMax || row.N < nMin || row.N > nMax) return false;
  if (region === "official" && row.Z > 118) return false;
  if (region === "beyond" && row.Z <= 118) return false;
  if (/^[a-z]{1,3}-\d+$/.test(query)) return row.Nuclide_Label.toLowerCase() === query;
  return !query || row.search.includes(query);
}

function applyFilters() {
  const query = searchBox.value.trim().toLowerCase();
  const zMin = Number(controls.zMin.value) || 1;
  const zMax = Number(controls.zMax.value) || 172;
  const nMin = Number(controls.nMin.value) || 0;
  const nMax = Number(controls.nMax.value) || 300;
  const region = regionSelect.value;
  filtered = rows.filter(row => passes(row, query, zMin, zMax, nMin, nMax, region));
  page = 0;
  visibleCount.textContent = filtered.length.toLocaleString();
  if (!selected && filtered.length) selectRow(filtered[0], false);
  draw();
  renderTable();
}

function renderTable() {
  const maxPage = Math.max(0, Math.ceil(filtered.length / pageSize) - 1);
  page = Math.max(0, Math.min(page, maxPage));
  const start = page * pageSize;
  const sample = filtered.slice(start, start + pageSize);
  rowsBody.innerHTML = sample.map(row => `
    <tr data-index="${row.index}">
      <td>${row.Nuclide_Label}</td>
      <td>${row.Z}</td>
      <td>${row.N}</td>
      <td>${row.A}</td>
      <td>${fmt(row.Omega_total)}</td>
      <td>${fmt(row.omega_total)}</td>
      <td>${fmt(row.rad_total)}</td>
      <td>${fmt(row.v2_total)}</td>
      <td>${fmt(row.factor_overlap)}</td>
      <td>${fmt(row.Hpf_total)}</td>
    </tr>
  `).join("");
  pageInfo.textContent = `${i18n[currentLang].page} ${page + 1} / ${maxPage + 1}`;
}

function renderStats() {
  const stats = ATLAS_DATA.stats;
  const cards = [
    ["rows", stats.rows.toLocaleString()],
    ["official", stats.official.toLocaleString()],
    ["beyond", stats.beyond.toLocaleString()],
    ["mean Hpf", stats.mean_hpf.toFixed(3)],
    ["max Hpf", `${stats.max_hpf.label} ${stats.max_hpf.value.toFixed(1)}`],
    ["max Omega", `${stats.max_omega.label} ${stats.max_omega.value.toFixed(0)}`],
  ];
  document.getElementById("statsGrid").innerHTML = cards.map(([k, v]) => `<article><span>${k}</span><strong>${v}</strong></article>`).join("");
}

function selectRow(row, redraw = true) {
  selected = row;
  detailTitle.textContent = row.Nuclide_Label;
  const fields = [
    ["Symbol", row.Element_Symbol],
    ["Z", row.Z],
    ["N", row.N],
    ["A", row.A],
    ["Omega", row.Omega_total],
    ["omega", row.omega_total],
    ["rad", row.rad_total],
    ["v2", row.v2_total],
    ["Overlap", row.factor_overlap],
    ["Hpf", row.Hpf_total],
  ];
  detailGrid.innerHTML = fields.map(([k, v]) => `<div><span>${k}</span><strong>${fmt(v)}</strong></div>`).join("");
  sigZ.textContent = row.PiSig_Z;
  sigN.textContent = row.PiSig_N;
  sigA.textContent = row.PiSig_A;
  if (redraw) draw();
}

function nearestRow(event) {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  let best = null;
  let bestD = Infinity;
  const pool = filtered.length ? filtered : rows;
  for (const row of pool) {
    const p = point(row);
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = row;
    }
  }
  return bestD < 900 ? best : null;
}

canvas.addEventListener("click", event => {
  const row = nearestRow(event);
  if (row) selectRow(row);
});

canvas.addEventListener("mousemove", event => {
  const row = nearestRow(event);
  canvas.style.cursor = row ? "crosshair" : "default";
});

rowsBody.addEventListener("click", event => {
  const tr = event.target.closest("tr");
  if (!tr) return;
  selectRow(rows[Number(tr.dataset.index)]);
});

document.getElementById("prevPage").addEventListener("click", () => { page -= 1; renderTable(); });
document.getElementById("nextPage").addEventListener("click", () => { page += 1; renderTable(); });
document.getElementById("resetBtn").addEventListener("click", () => {
  searchBox.value = "";
  metricSelect.value = "Hpf_total";
  regionSelect.value = "all";
  controls.zMin.value = 1;
  controls.zMax.value = 172;
  controls.nMin.value = 0;
  controls.nMax.value = 300;
  applyFilters();
});
document.getElementById("topBtn").addEventListener("click", () => {
  const metric = metricSelect.value;
  const row = filtered.reduce((best, item) => item[metric] > best[metric] ? item : best, filtered[0] || rows[0]);
  selectRow(row);
});
langEn.addEventListener("click", () => applyLanguage("en"));
langVn.addEventListener("click", () => applyLanguage("vn"));

[searchBox, metricSelect, regionSelect, ...Object.values(controls)].forEach(control => {
  control.addEventListener("input", applyFilters);
});

window.addEventListener("resize", draw);

renderStats();
applyFilters();
selectRow(rows.find(row => row.Nuclide_Label === "U-238") || rows[0]);
applyLanguage("en");
