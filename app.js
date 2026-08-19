/**
 * app.js
 * --------------------------------------------------------------
 * Lógica de Flota Master. Basada en el mismo modelo de datos que el
 * módulo Zontes 468M de El Trenzado (mantenimientos por km/tiempo,
 * repostajes con cálculo de consumo real, bitácora de taller, fondo de
 * ahorro para gastos futuros), pero multi-vehículo: cada vehículo de
 * VEHICULOS (ver datos-vehiculos.js) tiene su propio bloque de datos
 * completamente aislado en localStorage.
 */

const STORAGE_PREFIX = 'flota_master_';
const claveStorage = (id) => `${STORAGE_PREFIX}${id}_v1`;

let vehiculoActivoId = localStorage.getItem(`${STORAGE_PREFIX}ultimo_vehiculo`) || VEHICULOS[0].id;
let datosApp = {};
let miGrafico = null;
let ultimoAvisoTaller = null;

function vehiculoActivoConfig() {
  return VEHICULOS.find((v) => v.id === vehiculoActivoId) || VEHICULOS[0];
}

// ------------------------------------------------------------------
// Toasts
// ------------------------------------------------------------------
function mostrarToast(mensaje, tipo = 'info') {
  const estilos = {
    success: { border: 'border-success/40', bg: 'bg-success/10', text: 'text-success', icon: '✓' },
    danger: { border: 'border-danger/40', bg: 'bg-danger/10', text: 'text-danger', icon: '⚠' },
    warning: { border: 'border-warning/40', bg: 'bg-warning/10', text: 'text-warning', icon: '⚠' },
    info: { border: 'border-accent/40', bg: 'bg-accent/10', text: 'text-accent', icon: 'ℹ' }
  };
  const s = estilos[tipo] || estilos.info;
  const contenedor = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast-item p-3.5 rounded-xl border ${s.border} ${s.bg} ${s.text} text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2.5 max-w-sm`;
  toast.innerHTML = `<span class="text-sm">${s.icon}</span><span class="flex-1 text-gray-100">${mensaje}</span>`;
  contenedor.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity .3s, transform .3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ------------------------------------------------------------------
// Carga / guardado por vehículo
// ------------------------------------------------------------------
function cargarDatos() {
  const veh = vehiculoActivoConfig();
  const guardado = localStorage.getItem(claveStorage(veh.id));
  if (guardado) {
    try {
      datosApp = JSON.parse(guardado);
    } catch (e) {
      datosApp = JSON.parse(JSON.stringify(veh.datosDefecto));
    }
  } else {
    datosApp = JSON.parse(JSON.stringify(veh.datosDefecto));
  }
  if (!Array.isArray(datosApp.mantenimientos)) datosApp.mantenimientos = [];
  if (!Array.isArray(datosApp.repostajes)) datosApp.repostajes = [];
  if (!Array.isArray(datosApp.incidencias)) datosApp.incidencias = [];
  if (!Array.isArray(datosApp.gastosFuturos)) datosApp.gastosFuturos = [];
  if (!datosApp.vehiculo) datosApp.vehiculo = {};
}

function guardarDatos() {
  datosApp.vehiculo.kilometrosActuales = parseInt(document.getElementById('inputKm').value) || 0;
  datosApp.vehiculo.fechaUltimaRevision = document.getElementById('inputFechaRev').value;
  const kmSemanal = parseFloat(document.getElementById('inputKmSemanal').value);
  datosApp.vehiculo.kmSemanalManual = isNaN(kmSemanal) ? datosApp.vehiculo.kmSemanalManual : kmSemanal;
  datosApp.vehiculo.ultimaActualizacion = new Date().toISOString().split('T')[0];
  localStorage.setItem(claveStorage(vehiculoActivoId), JSON.stringify(datosApp));
}

function sincronizarInputsConEstado() {
  document.getElementById('inputKm').value = datosApp.vehiculo.kilometrosActuales;
  if (datosApp.vehiculo.fechaUltimaRevision) {
    document.getElementById('inputFechaRev').value = datosApp.vehiculo.fechaUltimaRevision;
  }
  document.getElementById('inputKmSemanal').value = datosApp.vehiculo.kmSemanalManual || '';
}

// ------------------------------------------------------------------
// Selector de vehículo
// ------------------------------------------------------------------
function pintarSelectorVehiculos() {
  const cont = document.getElementById('selectorVehiculos');
  cont.innerHTML = '';
  VEHICULOS.forEach((v) => {
    const activo = v.id === vehiculoActivoId;
    const btn = document.createElement('button');
    btn.className =
      `flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition ` +
      (activo
        ? 'bg-accent/10 border-accent text-accent'
        : 'bg-cardBg border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200');
    btn.innerHTML = `<span>${v.icono}</span><span>${v.nombre}</span>`;
    btn.addEventListener('click', () => { if (!activo) cambiarVehiculo(v.id); });
    cont.appendChild(btn);
  });
}

function pintarCabeceraVehiculo() {
  const v = vehiculoActivoConfig();
  document.getElementById('iconoVehiculoActivo').textContent = v.icono;
  document.getElementById('nombreVehiculoActivo').textContent = datosApp.vehiculo.modelo || v.nombre;
  document.getElementById('subtituloVehiculoActivo').textContent = v.subtitulo;
}

function cambiarVehiculo(id) {
  vehiculoActivoId = id;
  localStorage.setItem(`${STORAGE_PREFIX}ultimo_vehiculo`, id);
  cargarDatos();
  sincronizarInputsConEstado();
  pintarSelectorVehiculos();
  pintarCabeceraVehiculo();
  pintarMasterclass();
  renderizarTodo();
}

// ------------------------------------------------------------------
// Ritmo de uso (repostajes reales o estimación manual)
// ------------------------------------------------------------------
function calcularKmPorDia() {
  const reps = (datosApp.repostajes || []).filter((r) => r.km > 0).slice().sort((a, b) => a.km - b.km);
  if (reps.length >= 2) {
    const primero = reps[0];
    const ultimo = reps[reps.length - 1];
    const kmDiff = ultimo.km - primero.km;
    const diasDiff = (new Date(ultimo.fecha) - new Date(primero.fecha)) / 86400000;
    if (kmDiff > 0 && diasDiff >= 3) return { kmPorDia: kmDiff / diasDiff, fuente: 'uso real' };
  }
  const manual = datosApp.vehiculo.kmSemanalManual;
  if (manual && manual > 0) return { kmPorDia: manual / 7, fuente: 'estimación manual' };
  return null;
}

function formatearFechaEstimada(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + Math.round(dias));
  return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function estimarPorKm(kmObjetivo) {
  const kmActuales = datosApp.vehiculo.kilometrosActuales;
  const restante = kmObjetivo - kmActuales;
  if (restante <= 0) return { dias: 0, meses: 0, vencido: true };
  const ritmo = calcularKmPorDia();
  if (!ritmo || ritmo.kmPorDia <= 0) return null;
  const dias = restante / ritmo.kmPorDia;
  return { dias, meses: Math.max(1, dias / 30.44), vencido: false };
}

function calcularProximaFechaAnual(fechaBaseStr) {
  const base = new Date(fechaBaseStr);
  const hoy = new Date();
  let proxima = new Date(base);
  while (proxima <= hoy) proxima.setFullYear(proxima.getFullYear() + 1);
  return proxima;
}

// ------------------------------------------------------------------
// Render: mantenimientos + gráfico
// ------------------------------------------------------------------
function inicializarGrafico() {
  const ctx = document.getElementById('graficoMantenimiento');
  if (!ctx || miGrafico) return;
  miGrafico = new Chart(ctx, {
    type: 'bar',
    data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 1.5, borderRadius: 6, barThickness: 22 }] },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.parsed.x.toFixed(0)}%` } } },
      scales: {
        x: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#9ca3af', font: { size: 11 }, callback: (v) => v + '%' } },
        y: { grid: { display: false }, ticks: { color: '#e5e7eb', font: { size: 11 } } }
      }
    }
  });
}

function actualizarGraficoDatos() {
  if (!miGrafico) return;
  const kmActuales = datosApp.vehiculo.kilometrosActuales;
  const colores = datosApp.mantenimientos.map((m) => {
    if (m.completado) return { bg: 'rgba(107,114,128,.25)', border: '#6b7280' };
    const pct = (kmActuales / m.kmObjetivo) * 100;
    if (pct >= 100) return { bg: 'rgba(255,51,102,.25)', border: '#ff3366' };
    if (pct >= 80) return { bg: 'rgba(255,170,0,.25)', border: '#ffaa00' };
    return { bg: 'rgba(255,191,0,.2)', border: '#FFBF00' };
  });
  miGrafico.data.labels = datosApp.mantenimientos.map((m) => (m.titulo.length > 26 ? m.titulo.slice(0, 24) + '…' : m.titulo));
  miGrafico.data.datasets[0].data = datosApp.mantenimientos.map((m) => Math.min(100, (kmActuales / m.kmObjetivo) * 100));
  miGrafico.data.datasets[0].backgroundColor = colores.map((c) => c.bg);
  miGrafico.data.datasets[0].borderColor = colores.map((c) => c.border);
  miGrafico.update();
}

function renderizarMantenimientos() {
  const kmActuales = datosApp.vehiculo.kilometrosActuales;
  const cont = document.getElementById('listaMantenimientos');
  cont.innerHTML = '';

  if (datosApp.mantenimientos.length === 0) {
    cont.innerHTML = '<p class="text-xs text-gray-500 italic">No hay tareas de mantenimiento.</p>';
    return;
  }

  datosApp.mantenimientos.forEach((mant, index) => {
    const kmRestantes = mant.kmObjetivo - kmActuales;
    let estadoBorde = 'border-gray-800/80 bg-darkBg';
    let badge = `<span class="text-xs px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-900/50">Faltan ${kmRestantes} km</span>`;

    if (kmRestantes <= 0 && !mant.completado) {
      estadoBorde = 'border-danger/60 bg-danger/5';
      badge = `<span class="text-xs px-2.5 py-1 rounded-full bg-danger/20 text-danger border border-danger/40 font-bold">¡Toca ya!</span>`;
    } else if (mant.completado) {
      estadoBorde = 'border-gray-800/40 opacity-50 bg-darkBg';
      badge = `<span class="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400">Completado</span>`;
    }

    const div = document.createElement('div');
    div.className = `p-3.5 rounded-xl border ${estadoBorde} transition space-y-2`;
    div.innerHTML = `
      <div class="flex justify-between items-center gap-2">
        <div class="flex items-center gap-2.5">
          <input type="checkbox" ${mant.completado ? 'checked' : ''} data-accion="toggle-mant" data-index="${index}" class="w-4 h-4 rounded accent-accent cursor-pointer">
          <span class="font-bold text-white text-sm">${mant.titulo}</span>
        </div>
        ${badge}
      </div>
      <div class="text-xs text-gray-400 pl-7 flex flex-wrap justify-between items-center gap-2">
        <span>Meta: <strong class="text-gray-200">${mant.kmObjetivo} km</strong> · Límite: ${mant.mesesMaximo} meses</span>
        <button data-accion="eliminar-mant" data-index="${index}" class="text-danger font-semibold cursor-pointer">Eliminar</button>
      </div>
      ${mant.costeEstimado || mant.taller ? `<div class="pl-7 flex flex-wrap gap-2">
        ${mant.costeEstimado ? `<span class="text-[10px] bg-darkBg border border-gray-800 text-gray-300 px-2 py-1 rounded-lg">💰 ~${mant.costeEstimado} €</span>` : ''}
        ${mant.taller ? `<span class="text-[10px] bg-darkBg border border-gray-800 text-gray-300 px-2 py-1 rounded-lg">🔧 ${mant.taller}</span>` : ''}
      </div>` : ''}
      ${mant.tareas && mant.tareas.length ? `<ul class="text-xs text-gray-300 pl-7 list-disc space-y-0.5 pt-1 border-t border-gray-800/60">
        ${mant.tareas.map((t) => `<li>${t}</li>`).join('')}
      </ul>` : ''}
    `;
    cont.appendChild(div);
  });
}

// ------------------------------------------------------------------
// Render: alertas
// ------------------------------------------------------------------
function renderizarAlertas() {
  const panel = document.getElementById('panelAlertas');
  const kmActuales = datosApp.vehiculo.kilometrosActuales;
  const fechaRev = new Date(datosApp.vehiculo.fechaUltimaRevision);
  const hoy = new Date();
  const diffDays = Math.ceil(Math.abs(hoy - fechaRev) / 86400000);
  const mesesTranscurridos = Math.floor(diffDays / 30);

  let html = `
    <div class="p-3 rounded-xl bg-darkBg border border-gray-800 text-xs flex justify-between items-center">
      <span class="text-gray-300 font-medium">Odómetro</span>
      <strong class="text-accent text-sm font-black">${kmActuales} km</strong>
    </div>
    <div class="p-3 rounded-xl bg-darkBg border border-gray-800 text-xs flex justify-between items-center">
      <span class="text-gray-300 font-medium">Desde última revisión</span>
      <strong class="text-warning text-sm font-black">${mesesTranscurridos} meses</strong>
    </div>
  `;

  const proximo = datosApp.mantenimientos.find((m) => !m.completado && m.kmObjetivo >= kmActuales);
  if (proximo) {
    const restante = proximo.kmObjetivo - kmActuales;
    const ritmo = calcularKmPorDia();
    let lineaFecha = '<p class="text-[11px] text-gray-500 italic">Registra 2+ repostajes o tu estimación manual (km/semana) para calcular fechas.</p>';

    if (ritmo && ritmo.kmPorDia > 0) {
      const diasEstimados = restante / ritmo.kmPorDia;
      const fechaLlegada = formatearFechaEstimada(diasEstimados);
      lineaFecha = `<p class="text-[11px] text-gray-400">Estimado según tu ${ritmo.fuente} (~${ritmo.kmPorDia.toFixed(1)} km/día): <strong class="text-gray-200">${fechaLlegada}</strong></p>`;
    }

    html += `
      <div class="p-3 rounded-xl bg-accent/5 border border-accent/20 text-xs space-y-1.5">
        <span class="text-accent font-bold block">⚡ Próximo mantenimiento</span>
        <p class="text-gray-300">${proximo.titulo} en <strong>${restante} km</strong>.</p>
        ${lineaFecha}
      </div>
    `;
  } else {
    html += `<div class="p-3 rounded-xl bg-success/10 border border-success/30 text-xs text-success font-semibold">✓ Sin revisiones inmediatas pendientes.</div>`;
  }

  panel.innerHTML = html;
}

// ------------------------------------------------------------------
// Render: repostajes + consumo
// ------------------------------------------------------------------
function renderizarRepostajes() {
  const cont = document.getElementById('listaRepostajes');
  const statConsumo = document.getElementById('statConsumoMedio');
  const statGasto = document.getElementById('statGastoTotal');
  const statCosteKm = document.getElementById('statCosteKm');
  const statCosteMes = document.getElementById('statCosteMes');
  cont.innerHTML = '';

  const repostajes = (datosApp.repostajes || []).slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha) || a.km - b.km);
  const gastoTotal = repostajes.reduce((acc, r) => acc + (r.precio || 0), 0);
  statGasto.textContent = `${gastoTotal.toFixed(2)} €`;

  if (repostajes.length > 0) {
    const fechas = repostajes.map((r) => new Date(r.fecha)).filter((d) => !isNaN(d));
    if (fechas.length > 0) {
      const fechaMin = new Date(Math.min(...fechas));
      const meses = Math.max(1, (new Date() - fechaMin) / (86400000 * 30));
      statCosteMes.textContent = `${(gastoTotal / meses).toFixed(2)} €`;
    }
  } else {
    statCosteMes.textContent = '0.00 €';
  }

  const llenados = repostajes.filter((r) => r.llenadoCompleto === true && r.km > 0 && r.litros > 0);
  let litrosValidos = 0, kmValidos = 0;
  for (let i = 1; i < llenados.length; i++) {
    const kmTramo = llenados[i].km - llenados[i - 1].km;
    if (kmTramo > 0) { kmValidos += kmTramo; litrosValidos += llenados[i].litros; }
  }

  if (kmValidos > 0) {
    statConsumo.textContent = `${((litrosValidos / kmValidos) * 100).toFixed(1)} L/100`;
    const kmList = repostajes.filter((r) => r.km > 0).map((r) => r.km);
    if (kmList.length >= 2) {
      const diffKm = Math.max(...kmList) - Math.min(...kmList);
      statCosteKm.textContent = `${(gastoTotal / (diffKm || 1)).toFixed(3)} €`;
    } else {
      statCosteKm.textContent = '-- €';
    }
  } else {
    statConsumo.textContent = '-- L/100';
    statCosteKm.textContent = '-- €';
  }

  if (repostajes.length === 0) {
    cont.innerHTML = '<p class="text-xs text-gray-500 italic">No hay repostajes registrados.</p>';
    return;
  }

  repostajes.slice().reverse().forEach((rep) => {
    const indexReal = datosApp.repostajes.findIndex((r) => r.id === rep.id);
    const div = document.createElement('div');
    div.className = 'p-2.5 rounded-xl bg-darkBg border border-gray-800/80 text-xs flex justify-between items-center';
    div.innerHTML = `
      <div>
        <span class="text-white font-bold">${rep.litros} L</span> <span class="text-gray-400">(${rep.precio} €)</span>
        ${rep.llenadoCompleto === false ? '<span class="text-[9px] text-warning border border-warning/30 bg-warning/10 px-1.5 py-0.5 rounded ml-1">Parcial</span>' : ''}
        <span class="block text-[10px] text-gray-500">Km: ${rep.km} · ${rep.fecha}</span>
      </div>
      <button data-accion="eliminar-repostaje" data-index="${indexReal}" class="text-danger font-bold cursor-pointer">✕</button>
    `;
    cont.appendChild(div);
  });
}

// ------------------------------------------------------------------
// Render: incidencias
// ------------------------------------------------------------------
function renderizarIncidencias() {
  const cont = document.getElementById('listaIncidencias');
  cont.innerHTML = '';
  if (!datosApp.incidencias || datosApp.incidencias.length === 0) {
    cont.innerHTML = '<p class="text-xs text-gray-500 italic">Sin notas de taller registradas.</p>';
    return;
  }
  datosApp.incidencias.forEach((inc, index) => {
    const div = document.createElement('div');
    div.className = 'p-3 rounded-xl bg-darkBg border border-gray-800/80 text-xs space-y-1';
    div.innerHTML = `
      <div class="flex justify-between items-center">
        <strong class="text-warning">${inc.titulo}</strong>
        <span class="text-[10px] text-gray-500">${inc.fecha}</span>
      </div>
      <p class="text-gray-300">${inc.descripcion}</p>
      <div class="flex justify-end pt-1">
        <button data-accion="eliminar-incidencia" data-index="${index}" class="text-danger text-[10px] font-semibold cursor-pointer">Eliminar</button>
      </div>
    `;
    cont.appendChild(div);
  });
}

// ------------------------------------------------------------------
// Render: fondo de ahorro
// ------------------------------------------------------------------
function renderizarFondoAhorro() {
  const cont = document.getElementById('listaFondoAhorro');
  const totalEl = document.getElementById('totalAhorroMensual');
  cont.innerHTML = '';
  let totalMensual = 0;
  let items = [];

  datosApp.mantenimientos.forEach((mant) => {
    if (mant.completado || !mant.costeEstimado) return;
    items.push({ concepto: mant.titulo, monto: mant.costeEstimado, tipo: 'Revisión', est: estimarPorKm(mant.kmObjetivo) });
  });

  (datosApp.gastosFuturos || []).forEach((gasto, idx) => {
    if (gasto.tipo === 'anual') {
      const proxima = calcularProximaFechaAnual(gasto.fechaBase);
      const diasRestantes = (proxima - new Date()) / 86400000;
      items.push({
        concepto: gasto.concepto, monto: gasto.montoEstimado, tipo: 'Anual',
        est: { dias: diasRestantes, meses: 12 },
        fechaTexto: proxima.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        idxGasto: idx
      });
    } else {
      items.push({
        concepto: gasto.concepto, monto: gasto.montoEstimado, tipo: `${gasto.kmObjetivo} km`,
        est: estimarPorKm(gasto.kmObjetivo), idxGasto: idx
      });
    }
  });

  if (items.length === 0) {
    cont.innerHTML = '<p class="text-xs text-gray-500 italic">No hay gastos futuros registrados.</p>';
    totalEl.textContent = '0.00 €/mes';
    return;
  }

  items.forEach((item) => {
    let textoCuota, textoFecha = item.fechaTexto || '';
    if (!item.est) {
      textoCuota = '<span class="text-gray-500 italic">Faltan datos para calcular</span>';
    } else if (item.est.vencido) {
      textoCuota = '<span class="text-danger font-bold">Ya alcanzado</span>';
    } else {
      const cuota = item.monto / item.est.meses;
      totalMensual += cuota;
      if (!textoFecha) textoFecha = formatearFechaEstimada(item.est.dias);
      textoCuota = `<strong class="text-success">${cuota.toFixed(2)} €/mes</strong>`;
    }

    const div = document.createElement('div');
    div.className = 'p-3 rounded-xl bg-darkBg border border-gray-800/80 text-xs space-y-1';
    div.innerHTML = `
      <div class="flex justify-between items-start gap-2">
        <div><span class="text-white font-bold">${item.concepto}</span>
          <span class="text-[9px] text-gray-500 bg-cardBg border border-gray-800 px-1.5 py-0.5 rounded ml-1">${item.tipo}</span></div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-gray-300 font-bold">${item.monto} €</span>
          ${item.idxGasto !== undefined ? `<button data-accion="eliminar-gasto" data-index="${item.idxGasto}" class="text-danger font-bold cursor-pointer">✕</button>` : ''}
        </div>
      </div>
      <div class="flex justify-between items-center text-[10px] text-gray-500">
        <span>${textoFecha ? `Previsto: ${textoFecha}` : ''}</span><span>${textoCuota}</span>
      </div>
    `;
    cont.appendChild(div);
  });

  totalEl.textContent = `${totalMensual.toFixed(2)} €/mes`;
}

// ------------------------------------------------------------------
// Masterclass
// ------------------------------------------------------------------
function pintarMasterclass() {
  const data = MASTERCLASS[vehiculoActivoId];
  const cont = document.getElementById('listaMasterclass');
  const nota = document.getElementById('masterclassNota');
  cont.innerHTML = '';
  nota.textContent = data ? data.nota : '';
  if (!data) return;
  data.temas.forEach((tema) => {
    const btn = document.createElement('button');
    btn.className = 'w-full text-left p-3 rounded-xl bg-darkBg border border-gray-800 hover:border-accent/40 transition text-xs';
    btn.innerHTML = `<span class="text-white font-bold block">${tema.titulo}</span><span class="text-gray-500">${tema.sub}</span>`;
    btn.addEventListener('click', () => abrirMasterclass(tema));
    cont.appendChild(btn);
  });
}

function abrirMasterclass(tema) {
  document.getElementById('masterclassContenido').innerHTML = `
    <h3 class="text-lg font-bold text-white">${tema.titulo}</h3>
    <p class="text-xs text-gray-400 mb-2">${tema.sub}</p>
    <ol class="space-y-2 text-xs text-gray-300">
      ${tema.pasos.map((p, i) => `
        <li class="bg-darkBg p-3 rounded-xl border border-gray-800 flex gap-3 items-start">
          <span class="bg-accent/20 text-accent font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]">${i + 1}</span>
          <span class="leading-relaxed">${p}</span>
        </li>`).join('')}
    </ol>
    <div class="p-3 rounded-xl bg-warning/10 border border-warning/30 text-xs text-gray-300 mt-3"><strong class="text-warning block mb-0.5">Nota:</strong>${tema.nota}</div>
  `;
  toggleModal('modalMasterclass', true);
}

// ------------------------------------------------------------------
// Render conjunto
// ------------------------------------------------------------------
function renderizarTodo() {
  guardarDatos();
  renderizarMantenimientos();
  renderizarAlertas();
  renderizarRepostajes();
  renderizarIncidencias();
  renderizarFondoAhorro();
  actualizarGraficoDatos();
}

// ------------------------------------------------------------------
// Modales
// ------------------------------------------------------------------
function toggleModal(id, mostrar) {
  const modal = document.getElementById(id);
  if (mostrar) {
    modal.classList.remove('pointer-events-none');
    modal.classList.remove('opacity-0');
  } else {
    modal.classList.add('opacity-0');
    modal.classList.add('pointer-events-none');
  }
}

// --- Mantenimiento ---
document.getElementById('btnNuevoMantenimiento').addEventListener('click', () => toggleModal('modalMantenimiento', true));
document.getElementById('btnCancelarMantenimiento').addEventListener('click', () => toggleModal('modalMantenimiento', false));
document.getElementById('btnGuardarMantenimiento').addEventListener('click', () => {
  const titulo = document.getElementById('mantTitulo').value.trim();
  const km = parseInt(document.getElementById('mantKm').value);
  const meses = parseInt(document.getElementById('mantMeses').value) || 12;
  const coste = parseFloat(document.getElementById('mantCoste').value) || 0;
  const taller = document.getElementById('mantTaller').value.trim();
  const tareas = document.getElementById('mantTareas').value.split('\n').map((t) => t.trim()).filter(Boolean);

  if (!titulo || isNaN(km) || km <= 0) {
    mostrarToast('Introduce un título y un kilometraje objetivo válido.', 'danger');
    return;
  }

  datosApp.mantenimientos.push({ id: 'mant_' + Date.now(), titulo, kmObjetivo: km, mesesMaximo: meses, completado: false, costeEstimado: coste, taller, tareas });
  renderizarTodo();
  toggleModal('modalMantenimiento', false);
  ['mantTitulo', 'mantKm', 'mantMeses', 'mantCoste', 'mantTaller', 'mantTareas'].forEach((id) => document.getElementById(id).value = '');
  mostrarToast('Tarea de mantenimiento añadida.', 'success');
});

// --- Repostaje ---
document.getElementById('btnNuevoRepostaje').addEventListener('click', () => toggleModal('modalRepostaje', true));
document.getElementById('btnCancelarRepostaje').addEventListener('click', () => toggleModal('modalRepostaje', false));
document.getElementById('btnGuardarRepostaje').addEventListener('click', () => {
  const litros = parseFloat(document.getElementById('repLitros').value);
  const precio = parseFloat(document.getElementById('repPrecio').value);
  const km = parseInt(document.getElementById('repKm').value);
  const lleno = document.getElementById('repLleno').checked;

  if (isNaN(litros) || isNaN(precio) || isNaN(km)) {
    mostrarToast('Rellena litros, precio y kilómetros.', 'danger');
    return;
  }

  datosApp.repostajes.push({ id: 'rep_' + Date.now(), litros, precio, km, fecha: new Date().toISOString().split('T')[0], llenadoCompleto: lleno });
  renderizarTodo();
  toggleModal('modalRepostaje', false);
  ['repLitros', 'repPrecio', 'repKm'].forEach((id) => document.getElementById(id).value = '');
  mostrarToast('Repostaje registrado.', 'success');
});

// --- Incidencia ---
document.getElementById('btnNuevaIncidencia').addEventListener('click', () => toggleModal('modalIncidencia', true));
document.getElementById('btnCancelarIncidencia').addEventListener('click', () => toggleModal('modalIncidencia', false));
document.getElementById('btnGuardarIncidencia').addEventListener('click', () => {
  const titulo = document.getElementById('incTitulo').value.trim();
  const desc = document.getElementById('incDesc').value.trim();
  if (!titulo) { mostrarToast('Introduce un título para la nota.', 'danger'); return; }

  datosApp.incidencias.push({ id: 'inc_' + Date.now(), titulo, descripcion: desc, fecha: new Date().toISOString().split('T')[0] });
  renderizarTodo();
  toggleModal('modalIncidencia', false);
  ['incTitulo', 'incDesc'].forEach((id) => document.getElementById(id).value = '');
  mostrarToast('Nota añadida a la bitácora.', 'success');
});

// --- Gasto futuro ---
document.getElementById('gastoTipo').addEventListener('change', () => {
  document.getElementById('campoGastoKm').style.display = document.getElementById('gastoTipo').value === 'km' ? 'block' : 'none';
});
document.getElementById('btnNuevoGasto').addEventListener('click', () => toggleModal('modalGasto', true));
document.getElementById('btnCancelarGasto').addEventListener('click', () => toggleModal('modalGasto', false));
document.getElementById('btnGuardarGasto').addEventListener('click', () => {
  const concepto = document.getElementById('gastoConcepto').value.trim();
  const monto = parseFloat(document.getElementById('gastoMonto').value);
  const tipo = document.getElementById('gastoTipo').value;
  const km = parseInt(document.getElementById('gastoKm').value);

  if (!concepto || isNaN(monto) || monto <= 0) { mostrarToast('Introduce un concepto y un monto válido.', 'danger'); return; }
  if (tipo === 'km' && isNaN(km)) { mostrarToast('Introduce el kilometraje previsto.', 'danger'); return; }

  const nuevo = { id: 'gasto_' + Date.now(), concepto, montoEstimado: monto, tipo };
  if (tipo === 'anual') nuevo.fechaBase = new Date().toISOString().split('T')[0];
  else nuevo.kmObjetivo = km;
  datosApp.gastosFuturos.push(nuevo);

  renderizarTodo();
  toggleModal('modalGasto', false);
  ['gastoConcepto', 'gastoMonto', 'gastoKm'].forEach((id) => document.getElementById(id).value = '');
  mostrarToast('Gasto futuro añadido.', 'success');
});

document.getElementById('btnCerrarMasterclass').addEventListener('click', () => toggleModal('modalMasterclass', false));

// ------------------------------------------------------------------
// Creador y Guía de Usuario
// ------------------------------------------------------------------
document.getElementById('btnCreador').addEventListener('click', () => toggleModal('modalCreador', true));
document.getElementById('btnCerrarCreador').addEventListener('click', () => toggleModal('modalCreador', false));

let guiaTabActiva = GUIA_TABS[0].id;

function pintarGuiaTabs() {
  const cont = document.getElementById('guiaTabs');
  cont.innerHTML = '';
  GUIA_TABS.forEach((t) => {
    const activo = t.id === guiaTabActiva;
    const btn = document.createElement('button');
    btn.className =
      `px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ` +
      (activo ? 'bg-accent text-darkBg' : 'bg-darkBg text-gray-400 hover:bg-gray-800 border border-gray-800');
    btn.innerHTML = `<span>${t.icon}</span>${t.label}`;
    btn.addEventListener('click', () => {
      guiaTabActiva = t.id;
      pintarGuiaTabs();
      pintarGuiaContenido();
    });
    cont.appendChild(btn);
  });
}

function pintarGuiaContenido() {
  document.getElementById('guiaContenido').innerHTML = GUIA_CONTENIDO[guiaTabActiva] || '';
}

document.getElementById('btnGuia').addEventListener('click', () => {
  guiaTabActiva = GUIA_TABS[0].id;
  pintarGuiaTabs();
  pintarGuiaContenido();
  toggleModal('modalGuia', true);
});
document.getElementById('btnCerrarGuia').addEventListener('click', () => toggleModal('modalGuia', false));

// --- Delegación de eventos para las listas (checkboxes / botones ✕ generados dinámicamente) ---
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-accion]');
  if (!el) return;
  const index = parseInt(el.dataset.index);
  switch (el.dataset.accion) {
    case 'eliminar-mant': datosApp.mantenimientos.splice(index, 1); renderizarTodo(); mostrarToast('Tarea eliminada.', 'info'); break;
    case 'eliminar-repostaje': datosApp.repostajes.splice(index, 1); renderizarTodo(); mostrarToast('Repostaje eliminado.', 'info'); break;
    case 'eliminar-incidencia': datosApp.incidencias.splice(index, 1); renderizarTodo(); mostrarToast('Nota eliminada.', 'info'); break;
    case 'eliminar-gasto': datosApp.gastosFuturos.splice(index, 1); renderizarTodo(); mostrarToast('Gasto eliminado.', 'info'); break;
  }
});
document.addEventListener('change', (e) => {
  const el = e.target.closest('[data-accion="toggle-mant"]');
  if (!el) return;
  const index = parseInt(el.dataset.index);
  datosApp.mantenimientos[index].completado = !datosApp.mantenimientos[index].completado;
  renderizarTodo();
});

// --- Inputs de cabecera ---
['inputKm', 'inputFechaRev', 'inputKmSemanal'].forEach((id) => {
  document.getElementById(id).addEventListener('change', renderizarTodo);
  document.getElementById(id).addEventListener('input', () => { guardarDatos(); });
});

// --- Exportar / Importar JSON ---
document.getElementById('btnExportar').addEventListener('click', () => {
  guardarDatos();
  const jsonStr = JSON.stringify(datosApp, null, 2);
  const nombreArchivo = `flota_${vehiculoActivoId}_backup.json`;
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nombreArchivo;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  mostrarToast('Backup JSON exportado.', 'success');
});

document.getElementById('inputArchivoJson').addEventListener('change', (event) => {
  const archivo = event.target.files[0];
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = (e) => {
    try {
      const contenido = JSON.parse(e.target.result);
      if (!contenido.vehiculo || typeof contenido.vehiculo.kilometrosActuales !== 'number') {
        mostrarToast('El archivo JSON no tiene una estructura compatible.', 'danger');
        return;
      }
      if (!Array.isArray(contenido.mantenimientos)) contenido.mantenimientos = [];
      if (!Array.isArray(contenido.repostajes)) contenido.repostajes = [];
      if (!Array.isArray(contenido.incidencias)) contenido.incidencias = [];
      if (!Array.isArray(contenido.gastosFuturos)) contenido.gastosFuturos = [];

      datosApp = contenido;
      guardarDatos();
      sincronizarInputsConEstado();
      pintarCabeceraVehiculo();
      renderizarTodo();
      mostrarToast('Backup importado con éxito.', 'success');
    } catch (err) {
      mostrarToast('Error al leer el archivo JSON. Revisa el formato.', 'danger');
    }
  };
  lector.readAsText(archivo);
  event.target.value = '';
});

// ------------------------------------------------------------------
// Arranque
// ------------------------------------------------------------------
window.addEventListener('load', () => {
  cargarDatos();
  pintarSelectorVehiculos();
  pintarCabeceraVehiculo();
  sincronizarInputsConEstado();
  inicializarGrafico();
  pintarMasterclass();
  renderizarTodo();

  if ('serviceWorker' in navigator) {
    // No hay sw.js todavía en este proyecto — se añadirá si se decide
    // publicarla también como PWA aparte de la app Android nativa.
  }
});
