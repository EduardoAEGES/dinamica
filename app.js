// ===== CONFIGURACIÓN SUPABASE =====
const SUPABASE_URL = "https://klmjmlhwuzhymrplemgw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbWptbGh3dXpoeW1ycGxlbWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTMyNjQsImV4cCI6MjA4NzE2OTI2NH0.xFWMvUJa9n9TBcBG1WSeqCGiWBaCAtCU9aY7GXk4W6E";

// Caché local para descripciones del catálogo del PCGE
const accountCache = {};

// Códigos personalizados ingresados por el usuario
const userCustomCodes = {};

// Montos personalizados ingresados por el usuario
const userCustomAmounts = {};

// Descripciones por defecto (fallback inmediato para excelente UX)
const defaultDescriptions = {
  "10": "EFECTIVO Y EQUIVALENTES DE EFECTIVO",
  "101": "Caja",
  "102": "Fondos fijos",
  "103": "Efectivo y cheques en tránsito",
  "1031": "Efectivo en tránsito",
  "1032": "Cheques en tránsito",
  "104": "Cuentas corrientes en instituciones financieras",
  "1041": "Cuentas corrientes operativas",
  "12": "CUENTAS POR COBRAR COMERCIALES – TERCEROS",
  "121": "Facturas, boletas y otros comprobantes por cobrar",
  "1212": "Emitidas en cartera",
  "1673": "IGV por acreditar en compras",
  "19": "ESTIMACIÓN DE CUENTAS DE COBRANZA DUDOSA",
  "1911": "Facturas, boletas y otros comprobantes por cobrar",
  "20": "MERCADERÍAS",
  "20111": "Mercaderías manufacturadas - Costo",
  "21": "PRODUCTOS TERMINADOS",
  "21511": "Inventario de servicios terminados - Costo",
  "24": "MATERIAS PRIMAS",
  "24111": "Materias primas para prod. manufacturados",
  "25": "MATERIALES AUXILIARES, SUMINISTROS Y REPUESTOS",
  "2511": "Materiales auxiliares",
  "2524": "Otros suministros",
  "29": "DESVALORIZACIÓN DE INVENTARIOS",
  "29111": "Mercaderías manufacturadas",
  "33": "PROPIEDAD, PLANTA Y EQUIPO",
  "3XXX": "PROPIEDAD, PLANTA Y EQUIPO (Por definir)",
  "33411": "Vehículos motorizados - Costo",
  "39": "DEPRECIACIÓN, AMORTIZACIÓN Y AGOTAMIENTO ACUMULADOS",
  "39525": "Vehículos motorizados - Depreciación acumulada",
  "40": "TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SISTEMA DE PENSIONES Y DE SALUD POR PAGAR",
  "40XX": "TRIBUTOS POR PAGAR (Por definir)",
  "40111": "IGV - Cuenta propia",
  "4031": "ESSALUD",
  "4032": "ONP",
  "41": "REMUNERACIONES Y PARTICIPACIONES POR PAGAR",
  "4111": "Sueldos y salarios por pagar",
  "417": "Administradoras de fondos de pensiones (AFP)",
  "42": "CUENTAS POR PAGAR COMERCIALES – TERCEROS",
  "4212": "Emitidas",
  "46": "CUENTAS POR PAGAR DIVERSAS – TERCEROS",
  "465X": "CUENTAS POR PAGAR DIVERSAS (Por definir)",
  "4654": "Propiedad, planta y equipo por pagar",
  "50": "CAPITAL",
  "5011": "Acciones",
  "59": "RESULTADOS ACUMULADOS",
  "5911": "Utilidades acumuladas",
  "60": "COMPRAS",
  "601": "Mercaderías",
  "602": "Materias primas",
  "6033": "Repuestos",
  "61": "VARIACIÓN DE INVENTARIOS",
  "611": "Mercaderías",
  "6121": "Materias primas",
  "613": "Materiales auxiliares, suministros y repuestos",
  "62": "GASTOS DE PERSONAL Y DIRECTORES",
  "6211": "Sueldos y salarios",
  "6271": "Régimen de prestaciones de salud (ESSALUD)",
  "63": "GASTOS DE SERVICIOS PRESTADOS POR TERCEROS",
  "6361": "Energía eléctrica",
  "65": "OTROS GASTOS DE GESTIÓN",
  "68": "VALORIZACIÓN Y DETERIORO DE ACTIVOS Y PROVISIONES",
  "681": "Depreciación de propiedad, planta y equipo",
  "682231": "Depreciación de vehículos motorizados",
  "68711": "Estimación de cobranza dudosa - Facturas comerciales",
  "69": "COSTO DE VENTAS",
  "6911": "Mercaderías de exportación",
  "69321": "Costo de servicios terminados - Terceros",
  "695": "Gastos por desvalorización de inventarios",
  "6951": "Mercaderías",
  "70": "VENTAS",
  "70321": "Servicios terminados - Terceros",
  "78": "CARGAS CUBIERTAS POR PROVISIONES",
  "781": "Cargas cubiertas por provisiones",
  "79": "CARGAS IMPUTABLES A CUENTAS DE COSTOS Y GASTOS",
  "791": "Cargas imputables a cuentas de costos y gastos",
  "901": "Costo de Producción",
  "941": "Gastos de Administración",
  "951": "Gastos de Ventas"
};

// Función para obtener descripciones dinámicas desde Supabase
async function getAccountDescription(code) {
  if (code.length === 1) {
    return getElementoName(code);
  }
  if (accountCache[code]) {
    return accountCache[code];
  }
  
  let desc = defaultDescriptions[code] || "—";
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/pcge_catalogo?codigo=eq.${code}&select=descripcion`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        desc = data[0].descripcion;
        accountCache[code] = desc;
      }
    }
  } catch (error) {
    console.warn(`Error al consultar Supabase para cuenta ${code}:`, error);
  }
  
  return desc;
}

const operations = [
  {
    id: 6,
    name: "Compra de activos inmovilizados (PPE)",
    description: "Adquisición de propiedad, planta y equipo (maquinaria, vehículos, muebles) para uso de la empresa.",
    inputTemplate: "compra_ppe",
    defaultValues: { valor: 33037.20 },
    calculate: (vals) => {
      const valor = vals.valor;
      const igv = valor * 0.18;
      const precio = valor + igv;
      
      return {
        blocks: [
          {
            title: "Asiento de Naturaleza (Compra de Propiedad, Planta y Equipo)",
            entries: [
              { code: "3XXX", type: "debe", value: valor, helper: "Propiedad, planta y equipo - Costo" },
              { code: "40XX", type: "debe", value: igv, helper: "IGV - Crédito Fiscal" },
              { code: "465X", type: "haber", value: precio, helper: "Cuentas por pagar diversas - Activos" }
            ]
          }
        ]
      };
    }
  }
];

// ===== LÓGICA DE NAVEGACIÓN Y ENRUTADOR =====
let activeOpId = null;
let navigationHistory = ["hub"];

function navigateTo(screenId) {
  // Ocultar todas las pantallas y quitar animación
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  
  // Activar pantalla objetivo
  const targetScreen = document.getElementById(`screen-${screenId}`);
  if (targetScreen) {
    targetScreen.classList.add("active");
  }
  
  // Actualizar Bottom Navigation activos
  document.querySelectorAll(".nav-item").forEach(item => {
    const itemScreen = item.dataset.screen;
    if ((itemScreen === "hub" && screenId === "hub") ||
        (itemScreen === "dinamica" && (screenId === "dinamica" || screenId === "op-detail"))) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
  
  // Control de cabecera y botón volver
  const backBtn = document.getElementById("back-btn");
  const logoIcon = document.getElementById("logo-icon");
  const logoText = document.getElementById("logo-text");
  
  let headerTitle = "CERTUS CONTAPEDIA";
  let showBack = true;
  
  switch (screenId) {
    case "hub":
      headerTitle = "CERTUS CONTAPEDIA";
      showBack = false;
      break;
    case "dinamica":
      headerTitle = "DINAMICA - NIIF";
      break;
    case "op-detail":
      headerTitle = "ASIENTO CONTABLE";
      break;
    case "costos":
      headerTitle = "GERENCIAL - COSTOS";
      break;
    case "tributacion":
      headerTitle = "TRIBUTACIÓN - LABORAL";
      break;
    case "auditoria":
      headerTitle = "AUDITORÍA - CTRL INT.";
      break;
    case "logica":
      headerTitle = "PENSAMIENTO LÓGICO";
      break;
    case "sistemas":
      headerTitle = "SISTEMAS CONTABLES";
      break;
  }
  
  logoText.textContent = headerTitle;
  if (logoIcon && logoIcon.tagName !== "IMG") {
    logoIcon.textContent = headerTitle.charAt(0);
  }
  
  if (showBack) {
    backBtn.style.display = "flex";
    if (logoIcon) logoIcon.style.display = "none";
  } else {
    backBtn.style.display = "none";
    if (logoIcon) logoIcon.style.display = "block";
  }
  
  // Guardar en historial si es diferente al último
  if (navigationHistory[navigationHistory.length - 1] !== screenId) {
    navigationHistory.push(screenId);
  }

  // Si navegamos a la pantalla de Dinámica, nos aseguramos de mostrar su panel principal (hub)
  if (screenId === "dinamica") {
    showDinamicaPanel("panel-dinamica-hub");
  }
}

// Cambiar de panel interno dentro de la pantalla de Dinámica
function showDinamicaPanel(panelId) {
  const container = document.getElementById("screen-dinamica");
  if (!container) return;
  
  container.querySelectorAll(".sub-panel").forEach(panel => {
    panel.classList.remove("active");
  });
  
  const target = document.getElementById(panelId);
  if (target) {
    target.classList.add("active");
  }
}

// Configurar clicks de botones de navegación
function setupNavigation() {
  // Botones del Hub de Cursos
  document.querySelectorAll(".course-card").forEach(card => {
    card.addEventListener("click", () => {
      const screen = card.dataset.screen;
      navigateTo(screen);
    });
  });

  // Items de la barra de navegación inferior
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const screen = btn.dataset.screen;
      navigateTo(screen);
    });
  });
  
  // Botones de Dinámica Hub a subpaneles
  const toCatalogo = document.getElementById("btn-to-catalogo");
  if (toCatalogo) {
    toCatalogo.addEventListener("click", () => {
      showDinamicaPanel("panel-catalogo");
    });
  }
  
  const toAsientos = document.getElementById("btn-to-asientos");
  if (toAsientos) {
    toAsientos.addEventListener("click", () => {
      showDinamicaPanel("panel-asientos");
    });
  }
  
  const toPlan = document.getElementById("btn-to-plan");
  if (toPlan) {
    toPlan.addEventListener("click", () => {
      showDinamicaPanel("panel-dinamica-plan");
    });
  }
  
  const toGeneralidades = document.getElementById("btn-to-generalidades");
  if (toGeneralidades) {
    toGeneralidades.addEventListener("click", () => {
      showDinamicaPanel("panel-generalidades");
    });
  }
  
  // Botones de regreso dentro de los subpaneles de Dinámica
  document.querySelectorAll(".btn-back-to-dinamica-hub").forEach(btn => {
    btn.addEventListener("click", () => {
      showDinamicaPanel("panel-dinamica-hub");
    });
  });
  
  // Botón Volver
  document.getElementById("back-btn").addEventListener("click", () => {
    // Si estamos en la pantalla de dinámica y no estamos en el hub, volver al hub de dinámica
    const screenDinamica = document.getElementById("screen-dinamica");
    if (screenDinamica && screenDinamica.classList.contains("active")) {
      const hubPanel = document.getElementById("panel-dinamica-hub");
      if (hubPanel && !hubPanel.classList.contains("active")) {
        showDinamicaPanel("panel-dinamica-hub");
        return;
      }
    }

    if (navigationHistory[navigationHistory.length - 1] === "op-detail") {
      // Si estamos regresando de op-detail, ir al panel de asientos más comunes
      if (screenDinamica) {
        navigationHistory.pop(); // Sacar op-detail
        navigateTo("dinamica");
        showDinamicaPanel("panel-asientos");
        return;
      }
    }

    if (navigationHistory.length > 1) {
      navigationHistory.pop(); // Sacar pantalla actual
      const prevScreen = navigationHistory.pop(); // Sacar anterior para navegar de nuevo
      navigateTo(prevScreen);
    } else {
      navigateTo("hub");
    }
  });
}

// Notificaciones flotantes tipo Toast
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Configurar Sub-pestañas internas en las pantallas de cursos
function setupSubTabs() {
  document.querySelectorAll(".sub-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const parentScreen = btn.closest(".screen");
      const targetPanelId = btn.dataset.panel;
      
      // Desactivar botones de pestaña de esta pantalla
      parentScreen.querySelectorAll(".sub-tab-btn").forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      
      // Desactivar paneles de esta pantalla
      parentScreen.querySelectorAll(".sub-panel").forEach(p => p.classList.remove("active"));
      const targetPanel = parentScreen.querySelector(`#${targetPanelId}`);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });
}

// ===== INICIO DE LA APLICACIÓN =====
document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  setupNavigation();
  setupSubTabs();
  
  // Inicializaciones de dinámica
  renderOperationsList();
  setupSearchFilters();
  setupPcgeExplorer();
  
  // Inicialización de nuevos módulos de cursos
  setupCostosModule();
  setupTributacionModule();
  setupAuditoriaModule();
  setupLogicaModule();
  setupSistemasModule();
  
  // Por defecto ir al portal CERTUS CONTAPEDIA (Hub)
  navigateTo("hub");
});

// Selector de Tema Claro/Oscuro
function setupTheme() {
  const toggleBtn = document.getElementById("theme-toggle");
  const storedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", storedTheme);
  
  toggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    toggleBtn.innerHTML = newTheme === "dark" ? "☀️" : "🌙";
  });
  
  toggleBtn.innerHTML = storedTheme === "dark" ? "☀️" : "🌙";
}

// Renderizar menú principal con las 15 operaciones
function renderOperationsList() {
  const menuContainer = document.getElementById("operations-menu");
  menuContainer.innerHTML = "";
  
  operations.forEach(op => {
    const btn = document.createElement("button");
    btn.className = "op-menu-item";
    btn.onclick = () => {
      selectOperation(op.id);
      navigateTo("op-detail");
    };
    
    btn.innerHTML = `
      <span class="op-menu-num">${op.id}</span>
      <span class="op-menu-name">${op.name}</span>
      <span class="op-menu-arrow">→</span>
    `;
    menuContainer.appendChild(btn);
  });
}

// Filtro de búsqueda en la lista de operaciones
function setupSearchFilters() {
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    document.querySelectorAll(".op-menu-item").forEach(item => {
      const opName = item.querySelector(".op-menu-name").textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const opNum = item.querySelector(".op-menu-num").textContent;
      const op = operations.find(o => o.id == opNum);
      const opDesc = op ? op.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
      
      if (opName.includes(query) || opDesc.includes(query) || opNum === query) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });
}

// Seleccionar operación y cargar su calculadora
function selectOperation(id) {
  activeOpId = id;
  const op = operations.find(o => o.id === id);
  if (!op) return;
  
  renderInputs(op);
  updateLedger(op);
}

// Generar inputs específicos de la calculadora
function renderInputs(op) {
  const inputsContainer = document.getElementById("calc-inputs");
  inputsContainer.innerHTML = "";
  
  if (op.inputTemplate === "apertura") {
    const fields = [
      { id: "caja", label: "Caja y Bancos (Activo S/)", val: op.defaultValues.caja },
      { id: "mercaderias", label: "Mercaderías (Activo S/)", val: op.defaultValues.mercaderias },
      { id: "suministros", label: "Suministros (Activo S/)", val: op.defaultValues.suministros },
      { id: "ctasPagar", label: "Cuentas por Pagar (Pasivo S/)", val: op.defaultValues.ctasPagar },
      { id: "capital", label: "Capital Social (Patrimonio S/)", val: op.defaultValues.capital },
      { id: "resultados", label: "Resultados Acumulados (Patrimonio S/)", val: op.defaultValues.resultados }
    ];
    
    fields.forEach(f => {
      const group = document.createElement("div");
      group.className = "input-group";
      group.innerHTML = `
        <label for="input-${f.id}">${f.label}</label>
        <input type="number" id="input-${f.id}" class="calc-input" value="${f.val}" min="0">
      `;
      inputsContainer.appendChild(group);
      group.querySelector("input").addEventListener("input", () => updateLedger(op));
    });
    
  } else if (op.inputTemplate === "compra_almacenada") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-valor">Valor de Compra (Neto S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0">
      </div>
      <div class="input-group">
        <label for="input-tipo">Tipo de Bien</label>
        <select id="input-tipo" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="materia_prima" ${op.defaultValues.tipo === 'materia_prima' ? 'selected' : ''}>Materia Prima (C-602/A-24)</option>
          <option value="mercaderia" ${op.defaultValues.tipo === 'mercaderia' ? 'selected' : ''}>Mercaderías (C-601/A-20)</option>
          <option value="suministros" ${op.defaultValues.tipo === 'suministros' ? 'selected' : ''}>Repuestos/Suministros (C-6033/A-25)</option>
        </select>
      </div>
    `;
    inputsContainer.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => updateLedger(op));
    });
    
  } else if (op.inputTemplate === "consumo_activos") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-valor">Monto de Consumo (S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0">
      </div>
      <div class="input-group">
        <label for="input-area">Área Destino del Gasto</label>
        <select id="input-area" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="produccion" ${op.defaultValues.area === 'produccion' ? 'selected' : ''}>Costo de Producción (C-901)</option>
          <option value="administracion" ${op.defaultValues.area === 'administracion' ? 'selected' : ''}>Gastos Administrativos (C-941)</option>
        </select>
      </div>
    `;
    inputsContainer.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => updateLedger(op));
    });
    
  } else if (op.inputTemplate === "compra_inmediata") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-valor">Valor de Compra (Neto S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0">
      </div>
      <div class="input-group">
        <label for="input-destino">Área Destino del Gasto</label>
        <select id="input-destino" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="produccion" ${op.defaultValues.destino === 'produccion' ? 'selected' : ''}>Costo de Producción (C-901)</option>
          <option value="administracion" ${op.defaultValues.destino === 'administracion' ? 'selected' : ''}>Gastos Administrativos (C-941)</option>
        </select>
      </div>
    `;
    inputsContainer.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => updateLedger(op));
    });
    
  } else if (op.inputTemplate === "gastos_servicios") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-valor">Valor del Servicio (Neto S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0">
      </div>
      <div class="input-group">
        <label for="input-area">Destino del Gasto</label>
        <select id="input-area" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="administracion" ${op.defaultValues.area === 'administracion' ? 'selected' : ''}>Gastos Administrativos (C-941)</option>
          <option value="ventas" ${op.defaultValues.area === 'ventas' ? 'selected' : ''}>Gastos de Ventas (C-951)</option>
        </select>
      </div>
    `;
    inputsContainer.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => updateLedger(op));
    });
    
  } else if (op.inputTemplate === "compra_ppe") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-valor">Costo Neto del Activo (S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0">
      </div>
    `;
    inputsContainer.querySelector("input").addEventListener("input", () => updateLedger(op));
    
  } else if (op.inputTemplate === "pago") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-valor">Monto a Cancelar (S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0">
      </div>
      <div class="input-group">
        <label for="input-tipo">Tipo de Obligación</label>
        <select id="input-tipo" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="activo" ${op.defaultValues.tipo === 'activo' ? 'selected' : ''}>Cuentas por pagar diversas (C-4654)</option>
          <option value="comercial" ${op.defaultValues.tipo === 'comercial' ? 'selected' : ''}>Cuentas comerciales (C-4212)</option>
        </select>
      </div>
    `;
    inputsContainer.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => updateLedger(op));
    });
    
  } else if (op.inputTemplate === "venta") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-valor">Valor de Venta (Neto S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0">
      </div>
    `;
    inputsContainer.querySelector("input").addEventListener("input", () => updateLedger(op));
    
  } else if (op.inputTemplate === "cobro") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-valor">Importe a Cobrar (Total S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0">
      </div>
      <div class="input-group">
        <label for="input-destino">Destino de Fondos</label>
        <select id="input-destino" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="caja" ${op.defaultValues.destino === 'caja' ? 'selected' : ''}>Efectivo en Caja (C-101)</option>
          <option value="banco" ${op.defaultValues.destino === 'banco' ? 'selected' : ''}>Cuentas Corrientes (C-1041)</option>
        </select>
      </div>
    `;
    inputsContainer.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => updateLedger(op));
    });
    
  } else if (op.inputTemplate === "costo_ventas") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-valor">Costo de Ventas (S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0">
      </div>
      <div class="input-group">
        <label for="input-tipo">Tipo de Venta</label>
        <select id="input-tipo" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="servicio" ${op.defaultValues.tipo === 'servicio' ? 'selected' : ''}>Prestación de Servicios (C-69321/A-21511)</option>
          <option value="mercaderia" ${op.defaultValues.tipo === 'mercaderia' ? 'selected' : ''}>Venta de Mercadería (C-6911/A-20111)</option>
        </select>
      </div>
    `;
    inputsContainer.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => updateLedger(op));
    });
    
  } else if (op.inputTemplate === "depreciacion") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-valor">Monto Depreciación (S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0">
      </div>
      <div class="input-group">
        <label for="input-area">Centro de Costo</label>
        <select id="input-area" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="ventas" ${op.defaultValues.area === 'ventas' ? 'selected' : ''}>Gastos de Ventas (C-951)</option>
          <option value="administracion" ${op.defaultValues.area === 'administracion' ? 'selected' : ''}>Gastos Administrativos (C-941)</option>
        </select>
      </div>
    `;
    inputsContainer.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => updateLedger(op));
    });
    
  } else if (op.inputTemplate === "cobranza_dudosa" || op.inputTemplate === "desvalorizacion" || op.inputTemplate === "castigo_cuentas") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-valor">Importe Estimado (S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0">
      </div>
    `;
    inputsContainer.querySelector("input").addEventListener("input", () => updateLedger(op));
    
  } else if (op.inputTemplate === "planilla") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-bruto">Sueldo Bruto Mensual (S/)</label>
        <input type="number" id="input-bruto" class="calc-input" value="${op.defaultValues.sueldoBruto}" min="0">
      </div>
      <div class="input-group">
        <label for="input-regimen">Fondo Pensionario</label>
        <select id="input-regimen" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="afp" ${op.defaultValues.regimen === 'afp' ? 'selected' : ''}>AFP (Retención 11.37%)</option>
          <option value="onp" ${op.defaultValues.regimen === 'onp' ? 'selected' : ''}>ONP (Retención 13.00%)</option>
        </select>
      </div>
    `;
    inputsContainer.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => updateLedger(op));
    });
  }
}

// Leer valores ingresados en el formulario
function getValuesFromInputs(op) {
  const inputsContainer = document.getElementById("calc-inputs");
  if (!inputsContainer.children.length) return op.defaultValues;
  
  if (op.inputTemplate === "apertura") {
    return {
      caja: Number(document.getElementById("input-caja").value) || 0,
      mercaderias: Number(document.getElementById("input-mercaderias").value) || 0,
      suministros: Number(document.getElementById("input-suministros").value) || 0,
      ctasPagar: Number(document.getElementById("input-ctasPagar").value) || 0,
      capital: Number(document.getElementById("input-capital").value) || 0,
      resultados: Number(document.getElementById("input-resultados").value) || 0
    };
  } else if (op.inputTemplate === "compra_almacenada") {
    return {
      valor: Number(document.getElementById("input-valor").value) || 0,
      tipo: document.getElementById("input-tipo").value
    };
  } else if (op.inputTemplate === "consumo_activos") {
    return {
      valor: Number(document.getElementById("input-valor").value) || 0,
      area: document.getElementById("input-area").value
    };
  } else if (op.inputTemplate === "compra_inmediata") {
    return {
      valor: Number(document.getElementById("input-valor").value) || 0,
      destino: document.getElementById("input-destino").value
    };
  } else if (op.inputTemplate === "gastos_servicios") {
    return {
      valor: Number(document.getElementById("input-valor").value) || 0,
      area: document.getElementById("input-area").value
    };
  } else if (op.inputTemplate === "compra_ppe") {
    return {
      valor: Number(document.getElementById("input-valor").value) || 0
    };
  } else if (op.inputTemplate === "pago") {
    return {
      valor: Number(document.getElementById("input-valor").value) || 0,
      tipo: document.getElementById("input-tipo").value
    };
  } else if (op.inputTemplate === "venta") {
    return {
      valor: Number(document.getElementById("input-valor").value) || 0
    };
  } else if (op.inputTemplate === "cobro") {
    return {
      valor: Number(document.getElementById("input-valor").value) || 0,
      destino: document.getElementById("input-destino").value
    };
  } else if (op.inputTemplate === "costo_ventas") {
    return {
      valor: Number(document.getElementById("input-valor").value) || 0,
      tipo: document.getElementById("input-tipo").value
    };
  } else if (op.inputTemplate === "depreciacion") {
    return {
      valor: Number(document.getElementById("input-valor").value) || 0,
      area: document.getElementById("input-area").value
    };
  } else if (op.inputTemplate === "cobranza_dudosa" || op.inputTemplate === "desvalorizacion" || op.inputTemplate === "castigo_cuentas") {
    return {
      valor: Number(document.getElementById("input-valor").value) || 0
    };
  } else if (op.inputTemplate === "planilla") {
    return {
      sueldoBruto: Number(document.getElementById("input-bruto").value) || 0,
      regimen: document.getElementById("input-regimen").value
    };
  }
  return {};
}

// Recalcular y pintar el asiento en la vista detallada
async function updateLedger(op) {
  document.getElementById("op-title").textContent = op.name;
  document.getElementById("op-description").textContent = op.description;
  
  const inputs = getValuesFromInputs(op);
  const calculations = op.calculate(inputs);
  
  // Resumen Dinámico Horizontal
  renderSummary(op, inputs);
  
  const ledgerView = document.getElementById("ledger-view");
  ledgerView.innerHTML = "";
  
  if (op.inputTemplate === "apertura") {
    const block = {
      title: "Asiento de Apertura Inicial",
      entries: calculations.entries
    };
    await renderLedgerBlock(block, ledgerView, 0);
  } else {
    let blockIdx = 0;
    for (const block of calculations.blocks) {
      await renderLedgerBlock(block, ledgerView, blockIdx);
      blockIdx++;
    }
  }
}

// Pintar resumen en celular
function renderSummary(op, inputs) {
  const sumVal1 = document.getElementById("sum-val-1");
  const sumVal2 = document.getElementById("sum-val-2");
  const sumVal3 = document.getElementById("sum-val-3");
  
  const label1 = document.getElementById("sum-label-1");
  const label2 = document.getElementById("sum-label-2");
  const label3 = document.getElementById("sum-label-3");

  const formatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
  
  if (op.inputTemplate === "apertura") {
    label1.textContent = "Activos";
    sumVal1.textContent = formatter.format(inputs.caja + inputs.mercaderias + inputs.suministros);
    label2.textContent = "Pas+Pat";
    sumVal2.textContent = formatter.format(inputs.ctasPagar + inputs.capital + inputs.resultados);
    label3.textContent = "Estado";
    const balanced = (inputs.caja + inputs.mercaderias + inputs.suministros) === (inputs.ctasPagar + inputs.capital + inputs.resultados);
    sumVal3.textContent = balanced ? "OK" : "Error";
    sumVal3.style.color = balanced ? "var(--primary)" : "var(--haber)";
    
  } else if (op.inputTemplate === "compra_almacenada" || op.inputTemplate === "compra_inmediata" || op.inputTemplate === "gastos_servicios" || op.inputTemplate === "compra_ppe") {
    const valor = inputs.valor || 0;
    const igv = valor * 0.18;
    const total = valor + igv;
    
    label1.textContent = "Neto";
    sumVal1.textContent = formatter.format(valor);
    label2.textContent = "IGV (18%)";
    sumVal2.textContent = formatter.format(igv);
    label3.textContent = "Total";
    sumVal3.textContent = formatter.format(total);
    sumVal3.style.color = "var(--primary)";
    
  } else if (op.inputTemplate === "venta") {
    const valor = inputs.valor || 0;
    const igv = valor * 0.18;
    const total = valor + igv;
    
    label1.textContent = "Venta";
    sumVal1.textContent = formatter.format(valor);
    label2.textContent = "IGV (18%)";
    sumVal2.textContent = formatter.format(igv);
    label3.textContent = "Total";
    sumVal3.textContent = formatter.format(total);
    sumVal3.style.color = "var(--primary)";
    
  } else if (op.inputTemplate === "planilla") {
    const bruto = inputs.sueldoBruto || 0;
    const essalud = bruto * 0.09;
    const retencion = inputs.regimen === "onp" ? bruto * 0.13 : bruto * 0.1137;
    const neto = bruto - retencion;
    
    label1.textContent = "Costo Empl.";
    sumVal1.textContent = formatter.format(bruto + essalud);
    label2.textContent = "Pensión";
    sumVal2.textContent = formatter.format(retencion);
    label3.textContent = "Neto";
    sumVal3.textContent = formatter.format(neto);
    sumVal3.style.color = "var(--primary)";
    
  } else {
    const valor = inputs.valor || 0;
    label1.textContent = "Monto";
    sumVal1.textContent = formatter.format(valor);
    label2.textContent = "IGV";
    sumVal2.textContent = formatter.format(0);
    label3.textContent = "Total";
    sumVal3.textContent = formatter.format(valor);
    sumVal3.style.color = "var(--primary)";
  }
}

// Función para aplicar máscara y prefijo a un código contable
function formatCodeWithTemplate(val, template) {
  if (!template || !/[Xx]/.test(template)) return val;
  
  const prefix = template.split(/[Xx]/)[0];
  const templateLength = template.length;
  
  // Extraer solo los números del valor ingresado
  let digits = val.replace(/[^0-9]/g, '');
  
  // Si no empieza con el prefijo obligatorio, forzarlo
  if (!digits.startsWith(prefix)) {
    if (digits.includes(prefix)) {
      digits = digits.substring(digits.indexOf(prefix));
    } else {
      digits = prefix;
    }
  }
  
  // Si tiene menos caracteres que la plantilla, rellenar con 'X'
  if (digits.length < templateLength) {
    return digits + 'X'.repeat(templateLength - digits.length);
  }
  
  // Si es igual o mayor longitud, dejar el número tal como está
  return digits;
}

// Pintar un bloque de asiento en formato de tabla clásica contable
async function renderLedgerBlock(block, container, blockIdx = 0) {
  const blockDiv = document.createElement("div");
  blockDiv.className = "ledger-block";
  
  blockDiv.innerHTML = `
    <h4 class="ledger-block-title">${block.title}</h4>
    <table class="ledger-table">
      <thead>
        <tr>
          <th style="width: 22%;">CODIGO</th>
          <th style="width: 48%;">DENOMINACION</th>
          <th style="width: 15%;">DEBE</th>
          <th style="width: 15%;">HABER</th>
        </tr>
      </thead>
      <tbody class="ledger-rows-container"></tbody>
    </table>
  `;
  
  const rowsContainer = blockDiv.querySelector(".ledger-rows-container");
  
  // Función interna para determinar el texto del placeholder contable
  function getPlaceholderText(code, type) {
    const cleanCode = code.replace(/X/gi, '');
    if (cleanCode.startsWith("3") || cleanCode.startsWith("60")) {
      return type === "debe" ? "VC" : "";
    }
    if (cleanCode.startsWith("4011") || cleanCode.startsWith("40")) {
      return "IGV";
    }
    if (cleanCode.startsWith("42") || cleanCode.startsWith("46")) {
      return type === "haber" ? "PC" : "";
    }
    if (cleanCode.startsWith("12")) {
      return type === "debe" ? "PV" : "";
    }
    if (cleanCode.startsWith("70")) {
      return type === "haber" ? "VV" : "";
    }
    return "";
  }
  
  for (let entryIdx = 0; entryIdx < block.entries.length; entryIdx++) {
    const entry = block.entries[entryIdx];
    const slotKey = `${activeOpId}_${blockIdx}_${entryIdx}`;
    const code = userCustomCodes[slotKey] || entry.code;
    const officialDesc = await getAccountDescription(code);
    
    const tr = document.createElement("tr");
    
    const debeCell = entry.type === "debe" 
      ? `<input type="text" class="ledger-amount-input" data-op-id="${activeOpId}" data-block-idx="${blockIdx}" data-entry-idx="${entryIdx}" data-type="debe" placeholder="${getPlaceholderText(code, "debe")}" value="${userCustomAmounts[`${activeOpId}_${blockIdx}_${entryIdx}_debe`] || ''}">` 
      : "";
      
    const haberCell = entry.type === "haber" 
      ? `<input type="text" class="ledger-amount-input" data-op-id="${activeOpId}" data-block-idx="${blockIdx}" data-entry-idx="${entryIdx}" data-type="haber" placeholder="${getPlaceholderText(code, "haber")}" value="${userCustomAmounts[`${activeOpId}_${blockIdx}_${entryIdx}_haber`] || ''}">` 
      : "";
    
    tr.innerHTML = `
      <td class="center">
        <div class="code-input-wrapper">
          <input 
            type="text" 
            class="ledger-code-input" 
            value="${code}" 
            data-op-id="${activeOpId}"
            data-block-idx="${blockIdx}"
            data-entry-idx="${entryIdx}" 
            autocomplete="off"
            aria-label="Código de cuenta"
          >
          <div class="suggestions-list"></div>
        </div>
      </td>
      <td>
        <span class="desc-official" style="font-size: 0.8rem; font-weight: 500;">${officialDesc}</span>
      </td>
      <td class="center" style="font-size: 0.85rem; font-weight: 700; color: var(--debe);">
        ${debeCell}
      </td>
      <td class="center" style="font-size: 0.85rem; font-weight: 700; color: var(--haber);">
        ${haberCell}
      </td>
    `;
    
    rowsContainer.appendChild(tr);
  }
  
  container.appendChild(blockDiv);
  
  // Vincular autocompletado Supabase
  const codeInputs = blockDiv.querySelectorAll(".ledger-code-input");
  codeInputs.forEach(input => {
    const opId = Number(input.dataset.opId);
    const bIdx = Number(input.dataset.blockIdx);
    const eIdx = Number(input.dataset.entryIdx);
    const suggestionsList = input.nextElementSibling;
    
    const originalTemplate = block.entries[eIdx].code;
    const isTemplate = /[Xx]/.test(originalTemplate);
    const prefix = isTemplate ? originalTemplate.split(/[Xx]/)[0] : "";
    
    let debounceTimer = null;
    
    input.addEventListener("input", (e) => {
      let val = e.target.value;
      clearTimeout(debounceTimer);
      
      if (isTemplate) {
        const digits = val.replace(/[^0-9]/g, '');
        const finalDigits = digits.startsWith(prefix) ? digits : prefix;
        const formatted = formatCodeWithTemplate(val, originalTemplate);
        
        if (input.value !== formatted) {
          input.value = formatted;
        }
        
        const cursorPosition = finalDigits.length;
        input.setSelectionRange(cursorPosition, cursorPosition);
        
        val = formatted;
      }
      
      const slotKey = `${opId}_${bIdx}_${eIdx}`;
      userCustomCodes[slotKey] = val;
      
      const cleanQuery = isTemplate ? val.replace(/[^0-9]/g, '') : val.trim();
      
      if (cleanQuery.length < 1) {
        suggestionsList.classList.remove("show");
        return;
      }
      
      debounceTimer = setTimeout(async () => {
        try {
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/pcge_catalogo?codigo=like.${cleanQuery}*&nivel=eq.${cleanQuery.length + 1}&limit=15&order=codigo.asc`,
            {
              headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            renderSuggestions(data, input, suggestionsList, opId, bIdx, eIdx);
          }
        } catch (error) {
          console.error("Error al consultar autocompletado:", error);
        }
      }, 200);
    });
    
    input.addEventListener("blur", () => {
      setTimeout(() => {
        suggestionsList.classList.remove("show");
      }, 250);
    });
    
    if (isTemplate) {
      const snapCursor = () => {
        const digits = input.value.replace(/[^0-9]/g, '');
        const finalDigits = digits.startsWith(prefix) ? digits : prefix;
        const cursorPosition = finalDigits.length;
        input.setSelectionRange(cursorPosition, cursorPosition);
      };
      
      input.addEventListener("focus", () => {
        setTimeout(snapCursor, 0);
        input.dispatchEvent(new Event("input"));
      });
      
      input.addEventListener("click", snapCursor);
    } else {
      input.addEventListener("focus", () => {
        const val = input.value.trim();
        if (val.length > 0) {
          input.dispatchEvent(new Event("input"));
        }
      });
    }
 
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        suggestionsList.classList.remove("show");
      }
    });
  });
  
  // Vincular cambio de montos en Debe/Haber
  const amountInputs = blockDiv.querySelectorAll(".ledger-amount-input");
  amountInputs.forEach(input => {
    input.addEventListener("input", (e) => {
      const val = e.target.value;
      const opId = Number(input.dataset.opId);
      const bIdx = Number(input.dataset.blockIdx);
      const eIdx = Number(input.dataset.entryIdx);
      const type = input.dataset.type;
      
      const slotKey = `${opId}_${bIdx}_${eIdx}_${type}`;
      userCustomAmounts[slotKey] = val;
    });
  });
}

// Renderizar las sugerencias flotantes del ledger
function renderSuggestions(data, input, suggestionsList, opId, bIdx, eIdx) {
  suggestionsList.innerHTML = "";
  
  if (!data || data.length === 0) {
    suggestionsList.classList.remove("show");
    return;
  }
  
  data.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "suggestion-item";
    btn.type = "button";
    btn.innerHTML = `
      <span class="sugg-code" style="font-weight: 700; color: var(--primary); flex-shrink: 0; margin-right: 0.5rem;">${item.codigo}</span>
      <span class="sugg-desc" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;" title="${item.descripcion}">${item.descripcion}</span>
    `;
    
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
    });
    
    btn.addEventListener("click", async () => {
      const selectedCode = item.codigo;
      input.value = selectedCode;
      suggestionsList.classList.remove("show");
      
      const slotKey = `${opId}_${bIdx}_${eIdx}`;
      userCustomCodes[slotKey] = selectedCode;
      
      accountCache[selectedCode] = item.descripcion;
      
      const op = operations.find(o => o.id === opId);
      if (op) {
        await updateLedger(op);
      }
    });
    
    suggestionsList.appendChild(btn);
  });
  
  suggestionsList.classList.add("show");
}

// ===== SISTEMA EXPLORADOR PCGE JERÁRQUICO (PANTALLA 3) =====
let pcgeExplorerCodePath = []; // Historial de códigos para el pan de migas (breadcrumbs)

function setupPcgeExplorer() {
  const pcgeSearchInput = document.getElementById("pcge-search-input");
  const pcgeList = document.getElementById("pcge-results-list");
  const breadcrumbs = document.getElementById("pcge-breadcrumbs");
  
  let debounceTimeout = null;
  
  pcgeSearchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 1) {
      // Revertir a la exploración jerárquica
      breadcrumbs.style.display = "flex";
      explorePcgeLevel(pcgeExplorerCodePath[pcgeExplorerCodePath.length - 1] || "");
      return;
    }
    
    // Ocultar breadcrumbs durante la búsqueda de texto libre
    breadcrumbs.style.display = "none";
    
    debounceTimeout = setTimeout(() => {
      searchPcgeAccounts(query);
    }, 300);
  });
  
  // Carga inicial: Exploración jerárquica en el nivel raíz (2 dígitos)
  explorePcgeLevel("");
  
  // Eventos para cerrar Bottom Sheet
  document.getElementById("bottom-sheet-close").addEventListener("click", hideBottomSheet);
  document.getElementById("modal-backdrop").addEventListener("click", hideBottomSheet);
  document.getElementById("bottom-sheet-handle").addEventListener("click", hideBottomSheet);
}

// Renderizar el pan de migas (breadcrumbs) para la jerarquía del PCGE
function renderPcgeBreadcrumbs() {
  const container = document.getElementById("pcge-breadcrumbs");
  container.innerHTML = "";
  
  // Botón de Inicio (Raíz)
  const homeBtn = document.createElement("button");
  homeBtn.className = `breadcrumb-item ${pcgeExplorerCodePath.length === 0 ? 'active' : ''}`;
  homeBtn.textContent = "Inicio (Elementos)";
  homeBtn.type = "button";
  homeBtn.onclick = () => {
    pcgeExplorerCodePath = [];
    explorePcgeLevel("");
  };
  container.appendChild(homeBtn);
  
  // Renderizar cada nivel del historial
  pcgeExplorerCodePath.forEach((code, idx) => {
    const sep = document.createElement("span");
    sep.className = "breadcrumb-separator";
    sep.textContent = ">";
    container.appendChild(sep);
    
    const btn = document.createElement("button");
    btn.className = `breadcrumb-item ${idx === pcgeExplorerCodePath.length - 1 ? 'active' : ''}`;
    btn.textContent = code;
    btn.type = "button";
    btn.onclick = () => {
      // Recortar la ruta hasta el nivel clicado
      pcgeExplorerCodePath = pcgeExplorerCodePath.slice(0, idx + 1);
      explorePcgeLevel(code);
    };
    container.appendChild(btn);
  });
}

// Explorar un nivel de la jerarquía (Cuentas -> Subcuentas -> Divisionarias -> Subdivisionarias)
async function explorePcgeLevel(parentCode = "") {
  const pcgeList = document.getElementById("pcge-results-list");
  const countLabel = document.getElementById("pcge-count");
  
  pcgeList.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);"><span style="display: inline-block; animation: spin 1s linear infinite; margin-right: 0.5rem;">⏳</span> Cargando...</div>`;
  
  // Renderizar el pan de migas actual
  renderPcgeBreadcrumbs();
  
  try {
    let url = `${SUPABASE_URL}/rest/v1/pcge_catalogo`;
    let queryParams = "";
    
    if (!parentCode) {
      // Mostrar los 10 elementos de un solo dígito de manera local e inmediata
      const elements = [
        { codigo: "1", descripcion: "Activo Disponible y Exigible" },
        { codigo: "2", descripcion: "Activo Realizable (Inventarios)" },
        { codigo: "3", descripcion: "Activo Inmovilizado" },
        { codigo: "4", descripcion: "Pasivo (Obligaciones)" },
        { codigo: "5", descripcion: "Patrimonio Neto" },
        { codigo: "6", descripcion: "Gastos por Naturaleza" },
        { codigo: "7", descripcion: "Ingresos" },
        { codigo: "8", descripcion: "Saldos Intermediarios" },
        { codigo: "9", descripcion: "Costos/Gastos" },
        { codigo: "0", descripcion: "Cuentas de Orden" }
      ];
      
      countLabel.textContent = elements.length;
      pcgeList.innerHTML = "";
      
      elements.forEach(acc => {
        const item = document.createElement("button");
        item.className = "pcge-menu-item element-item";
        item.onclick = () => {
          pcgeExplorerCodePath.push(acc.codigo);
          explorePcgeLevel(acc.codigo);
        };
        
        item.innerHTML = `
          <span class="pcge-menu-code">Elemento ${acc.codigo}</span>
          <span class="pcge-menu-desc" title="${acc.descripcion}">${acc.descripcion}</span>
        `;
        pcgeList.appendChild(item);
      });
      return;
    }
    
    // Si hay parentCode (ej: "1" o "10"), consultamos en Supabase
    const nextLength = parentCode.length + 1;
    queryParams = `codigo=like.${parentCode}*&nivel=eq.${nextLength}&order=codigo.asc`;
    
    const response = await fetch(`${url}?${queryParams}`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (response.ok) {
      let accounts = await response.json();
      
      // Si el nivel siguiente no arrojó resultados directos pero hay de niveles más profundos
      if (accounts.length === 0) {
        // Consultar cualquier descendiente de mayor longitud para saltar niveles vacíos
        const fallbackResponse = await fetch(`${url}?codigo=like.${parentCode}*&codigo=neq.${parentCode}&order=codigo.asc&limit=25`, {
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
          }
        });
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.length > 0) {
            accounts = fallbackData;
          }
        }
      }
      
      countLabel.textContent = accounts.length;
      pcgeList.innerHTML = "";
      
      // Si la cuenta no tiene subcuentas hijas, es una hoja final: mostrar directamente el detalle
      if (accounts.length === 0) {
        pcgeList.innerHTML = `<p style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">Esta cuenta no contiene subcuentas.</p>`;
        
        // Obtener el detalle de la cuenta padre en Supabase
        const detailResp = await fetch(`${url}?codigo=eq.${parentCode}`, {
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
          }
        });
        if (detailResp.ok) {
          const detailData = await detailResp.json();
          if (detailData.length > 0) {
            showBottomSheet(detailData[0]);
          }
        }
        return;
      }
      
      // SI HAY RESULTADOS:
      
      // 1. Agregar tarjeta de información del elemento padre
      const parentDesc = await getAccountDescription(parentCode);
      const parentCard = document.createElement("div");
      parentCard.className = "parent-info-card";
      parentCard.innerHTML = `
        <div class="parent-info-title" title="${parentCode} - ${parentDesc}">
          ${parentCode} - ${parentDesc}
        </div>
        <button class="parent-info-btn" type="button">Ver Detalle 📖</button>
      `;
      parentCard.querySelector("button").onclick = () => {
        showBottomSheet({ codigo: parentCode, descripcion: parentDesc, nivel: parentCode.length });
      };
      pcgeList.appendChild(parentCard);
      
      // 2. Renderizar los botones de las subcuentas
      accounts.forEach(acc => {
        const item = document.createElement("button");
        item.className = "pcge-menu-item";
        item.onclick = () => {
          pcgeExplorerCodePath.push(acc.codigo);
          explorePcgeLevel(acc.codigo);
        };
        
        item.innerHTML = `
          <span class="pcge-menu-code">${acc.codigo}</span>
          <span class="pcge-menu-desc" title="${acc.descripcion}">${acc.descripcion}</span>
        `;
        pcgeList.appendChild(item);
      });
      
    } else {
      pcgeList.innerHTML = `<p style="padding: 1.5rem; text-align: center; color: var(--haber); font-size: 0.9rem;">Error al cargar datos.</p>`;
    }
  } catch (error) {
    pcgeList.innerHTML = `<p style="padding: 1.5rem; text-align: center; color: var(--haber); font-size: 0.9rem;">Error de conexión.</p>`;
    console.error(error);
  }
}

// Búsqueda de texto libre (cuando el usuario escribe activamente en la barra de búsqueda)
async function searchPcgeAccounts(query) {
  const pcgeList = document.getElementById("pcge-results-list");
  const countLabel = document.getElementById("pcge-count");
  
  pcgeList.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);"><span style="display: inline-block; animation: spin 1s linear infinite; margin-right: 0.5rem;">⏳</span> Buscando...</div>`;
  
  try {
    let url = `${SUPABASE_URL}/rest/v1/pcge_catalogo`;
    let queryParams = "";
    
    if (/^\d+$/.test(query)) {
      // Buscar coincidencia parcial por código
      queryParams = `codigo=like.${query}*&limit=30&order=codigo.asc`;
    } else {
      // Buscar coincidencia de texto en la descripción
      const cleanQuery = query.toLowerCase();
      queryParams = `descripcion=ilike.*${cleanQuery}*&limit=30&order=codigo.asc`;
    }
    
    const response = await fetch(`${url}?${queryParams}`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (response.ok) {
      const accounts = await response.json();
      countLabel.textContent = accounts.length;
      pcgeList.innerHTML = "";
      
      if (accounts.length === 0) {
        pcgeList.innerHTML = `<p style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">No se encontraron cuentas.</p>`;
        return;
      }
      
      // En la búsqueda directa de texto, hacer click abre el Bottom Sheet
      accounts.forEach(acc => {
        const item = document.createElement("button");
        item.className = "pcge-menu-item";
        item.onclick = () => selectPcgeAccount(acc);
        item.innerHTML = `
          <span class="pcge-menu-code">${acc.codigo}</span>
          <span class="pcge-menu-desc" title="${acc.descripcion}">${acc.descripcion}</span>
        `;
        pcgeList.appendChild(item);
      });
    } else {
      pcgeList.innerHTML = `<p style="padding: 1.5rem; text-align: center; color: var(--haber); font-size: 0.9rem;">Error al buscar en Supabase.</p>`;
    }
  } catch (error) {
    pcgeList.innerHTML = `<p style="padding: 1.5rem; text-align: center; color: var(--haber); font-size: 0.9rem;">Error de conexión.</p>`;
    console.error(error);
  }
}

// Seleccionar cuenta en buscador libre y abrir bottom sheet modal
function selectPcgeAccount(acc) {
  showBottomSheet(acc);
}

// Mostrar Bottom Sheet Modal
function showBottomSheet(acc) {
  const bs = document.getElementById("pcge-bottom-sheet");
  const backdrop = document.getElementById("modal-backdrop");
  
  document.getElementById("pcge-detail-container").innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 0.85rem; padding-top: 0.25rem;">
      <div class="pcge-detail-badge">${acc.codigo}</div>
      
      <div class="pcge-detail-info">
        <label>Nombre de la Cuenta / Descripción</label>
        <span style="line-height: 1.3;">${acc.descripcion}</span>
      </div>
      
      <div class="pcge-detail-info">
        <label>Nivel de Clasificación</label>
        <span>Nivel ${acc.nivel} (${getNivelName(acc.nivel)})</span>
        <div class="nivel-dots">
          <div class="nivel-dot ${acc.nivel >= 1 ? 'active' : ''}"></div>
          <div class="nivel-dot ${acc.nivel >= 2 ? 'active' : ''}"></div>
          <div class="nivel-dot ${acc.nivel >= 3 ? 'active' : ''}"></div>
          <div class="nivel-dot ${acc.nivel >= 4 ? 'active' : ''}"></div>
          <div class="nivel-dot ${acc.nivel >= 5 ? 'active' : ''}"></div>
        </div>
      </div>
      
      <div class="pcge-detail-info" style="border-bottom: none;">
        <label>Elemento Contable</label>
        <span style="font-weight: 700; color: var(--debe);">${acc.codigo.substring(0, 1)} (${getElementoName(acc.codigo.substring(0, 1))})</span>
      </div>
    </div>
  `;
  
  backdrop.style.display = "block";
  backdrop.offsetHeight; // Forzar reflujo
  backdrop.classList.add("show");
  bs.classList.add("show");
}

// Ocultar Bottom Sheet Modal
function hideBottomSheet() {
  const bs = document.getElementById("pcge-bottom-sheet");
  const backdrop = document.getElementById("modal-backdrop");
  
  bs.classList.remove("show");
  backdrop.classList.remove("show");
  setTimeout(() => {
    backdrop.style.display = "none";
  }, 250);
}

// Clasificaciones del Nivel Contable
function getNivelName(nivel) {
  switch(nivel) {
    case 1: return "Elemento Contable";
    case 2: return "Cuenta Contable";
    case 3: return "Subcuenta Contable";
    case 4: return "Divisionaria Contable";
    case 5: return "Subdivisionaria";
    default: return "Auxiliar";
  }
}

// Clasificaciones del Elemento Contable
function getElementoName(elem) {
  switch(elem) {
    case "1": return "Activo Disponible y Exigible";
    case "2": return "Activo Realizable (Inventarios)";
    case "3": return "Activo Inmovilizado";
    case "4": return "Pasivo (Obligaciones)";
    case "5": return "Patrimonio Neto";
    case "6": return "Gastos por Naturaleza";
    case "7": return "Ingresos";
    case "8": return "Saldos Intermediarios";
    case "9": return "Costos/Gastos";
    case "0": return "Cuentas de Orden";
    default: return "Desconocido";
  }
}

// ==========================================
// SECCIONES EXTRA - CURSOS CERTUS CONTAPEDIA
// ==========================================

// ----- 1. GERENCIAL - COSTOS -----
function setupCostosModule() {
  const btn = document.getElementById("btn-calc-costos");
  if (!btn) return;
  
  btn.addEventListener("click", () => {
    const cf = parseFloat(document.getElementById("costos-fijos").value) || 0;
    const pvu = parseFloat(document.getElementById("precio-unitario").value) || 0;
    const cvu = parseFloat(document.getElementById("costo-variable").value) || 0;
    
    if (pvu <= cvu) {
      showToast("El precio de venta debe ser mayor al costo variable unitario.", "error");
      return;
    }
    
    const mcu = pvu - cvu;
    const mcuPct = (mcu / pvu) * 100;
    const peUnidades = cf / mcu;
    const peSoles = peUnidades * pvu;
    
    document.getElementById("res-mcu").textContent = `S/ ${mcu.toFixed(2)}`;
    document.getElementById("res-mcu-pct").textContent = `${mcuPct.toFixed(2)}%`;
    document.getElementById("res-pe-unidades").textContent = `${Math.ceil(peUnidades)} Unidades`;
    document.getElementById("res-pe-soles").textContent = `S/ ${peSoles.toFixed(2)}`;
    
    // Gráfico de barra de estructura
    const cvuPct = (cvu / pvu) * 100;
    const mcuPctBar = (mcu / pvu) * 100;
    
    const barCvu = document.getElementById("bar-cvu");
    const barMcu = document.getElementById("bar-mcu");
    barCvu.style.width = `${cvuPct}%`;
    barCvu.textContent = `CVU: ${cvuPct.toFixed(0)}%`;
    barMcu.style.width = `${mcuPctBar}%`;
    barMcu.textContent = `MCU: ${mcuPctBar.toFixed(0)}%`;
    
    document.getElementById("costos-results").style.display = "block";
    
    // Volver a renderizar fórmulas en MathJax si está cargado
    if (window.MathJax && window.MathJax.typeset) {
      window.MathJax.typeset();
    }
  });
}

// ----- 2. TRIBUTACIÓN - LABORAL -----
function setupTributacionModule() {
  // Planilla
  const btnPlanilla = document.getElementById("btn-calc-planilla");
  if (btnPlanilla) {
    btnPlanilla.addEventListener("click", () => {
      const sueldo = parseFloat(document.getElementById("sueldo-basico").value) || 0;
      const asigFamChecked = document.getElementById("asig-familiar").checked;
      const asigFamVal = asigFamChecked ? 102.50 : 0;
      const totalRem = sueldo + asigFamVal;
      
      const system = document.getElementById("regimen-pension").value;
      let pensionRate = 0.13;
      let pensionName = "ONP";
      
      if (system === "afp-integra") {
        pensionRate = 0.128;
        pensionName = "AFP Integra";
      } else if (system === "afp-prima") {
        pensionRate = 0.129;
        pensionName = "AFP Prima";
      } else if (system === "afp-profuturo") {
        pensionRate = 0.130;
        pensionName = "AFP Profuturo";
      }
      
      const pensionVal = totalRem * pensionRate;
      const neto = totalRem - pensionVal;
      const essalud = totalRem * 0.09;
      
      const grati = totalRem / 6;
      const cts = (totalRem + grati) / 12;
      const vac = totalRem / 12;
      
      document.getElementById("bol-basico").textContent = `S/ ${sueldo.toFixed(2)}`;
      document.getElementById("bol-asig").textContent = `S/ ${asigFamVal.toFixed(2)}`;
      document.getElementById("bol-total-rem").textContent = `S/ ${totalRem.toFixed(2)}`;
      document.getElementById("bol-pension-lbl").textContent = pensionName;
      document.getElementById("bol-pension-val").textContent = `-S/ ${pensionVal.toFixed(2)}`;
      document.getElementById("bol-neto").textContent = `S/ ${neto.toFixed(2)}`;
      document.getElementById("bol-essalud").textContent = `S/ ${essalud.toFixed(2)}`;
      document.getElementById("bol-grati").textContent = `S/ ${grati.toFixed(2)}`;
      document.getElementById("bol-cts").textContent = `S/ ${cts.toFixed(2)}`;
      document.getElementById("bol-vacaciones").textContent = `S/ ${vac.toFixed(2)}`;
      
      document.getElementById("planilla-results").style.display = "block";
    });
  }
  
  // IGV y detracciones
  const btnTributos = document.getElementById("btn-calc-tributos");
  if (btnTributos) {
    btnTributos.addEventListener("click", () => {
      const monto = parseFloat(document.getElementById("monto-operacion").value) || 0;
      const tipo = document.getElementById("tipo-monto").value;
      const tasaDet = parseFloat(document.getElementById("tasa-detraccion").value) || 0;
      
      let base = 0;
      let igv = 0;
      let total = 0;
      
      if (tipo === "base") {
        base = monto;
        igv = base * 0.18;
        total = base + igv;
      } else {
        total = monto;
        base = total / 1.18;
        igv = total - base;
      }
      
      const det = total * tasaDet;
      const neto = total - det;
      
      document.getElementById("trib-base").textContent = `S/ ${base.toFixed(2)}`;
      document.getElementById("trib-igv").textContent = `S/ ${igv.toFixed(2)}`;
      document.getElementById("trib-total").textContent = `S/ ${total.toFixed(2)}`;
      document.getElementById("trib-det-pct").textContent = `${(tasaDet * 100).toFixed(0)}%`;
      document.getElementById("trib-det-val").textContent = `S/ ${det.toFixed(2)}`;
      document.getElementById("trib-neto-pagar").textContent = `S/ ${neto.toFixed(2)}`;
      
      document.getElementById("tributos-results").style.display = "block";
    });
  }
}

// ----- 3. AUDITORÍA Y CONTROL INTERNO -----
const risksData = [
  { area: "caja", level: "alto", title: "Pagos duplicados o no autorizados", desc: "El área de tesorería emite transferencias sin doble firma o sustento de facturas aprobadas.", control: "Implementar firmas mancomunadas y conciliación bancaria diaria por un personal ajeno a tesorería." },
  { area: "caja", level: "medio", title: "Diferencias no explicadas en arqueo de caja", desc: "La caja chica de la empresa presenta faltantes constantes al final del día.", control: "Realizar arqueos sorpresivos frecuentes y establecer responsabilidad económica al cajero." },
  { area: "inventarios", level: "alto", title: "Robo sistemático de mercaderías en almacén", desc: "Falta de cámaras de seguridad y control de acceso peatonal en la zona de almacenamiento de alto valor.", control: "Implementar tarjetas electrónicas de acceso, inventarios cíclicos mensuales y cámaras de seguridad CCTV." },
  { area: "inventarios", level: "bajo", title: "Obsolescencia de mercaderías no identificada", desc: "Productos guardados por más de un año no se castigan o desvalorizan contablemente.", control: "Establecer una política de desvalorización automática según el reporte de rotación del ERP." },
  { area: "cobrar", level: "alto", title: "Ventas a crédito a clientes con alto riesgo de morosidad", desc: "El equipo comercial otorga líneas de crédito de forma autónoma sin evaluación del área de riesgos.", control: "Establecer flujos de aprobación centralizados y scoring de crédito previo al despacho." },
  { area: "cobrar", level: "medio", title: "Falta de conciliación de saldos de clientes", desc: "Los clientes reclaman cobros de facturas ya pagadas debido a fallas en la aplicación del depósito contable.", control: "Envío mensual de estados de cuenta detallados para confirmación de saldos con el cliente." },
  { area: "compras", level: "medio", title: "Adquisiciones con sobreprecio", desc: "Se realizan compras directas a proveedores sin solicitar cotizaciones comparativas.", control: "Establecer política de compras que exija un mínimo de tres cotizaciones aprobadas para montos mayores a 1 UIT." }
];

const auditProcedures = {
  efectivo: [
    "Obtener las conciliaciones bancarias de fin de mes y verificar la precisión matemática.",
    "Confirmar los saldos bancarios directamente con las entidades financieras (carta de confirmación).",
    "Realizar un arqueo de efectivo en caja chica al cierre del ejercicio, presenciado por el custodio.",
    "Verificar que las partidas en tránsito (depósitos o cheques no cobrados) hayan sido liquidadas el mes posterior."
  ],
  ventas: [
    "Seleccionar una muestra de facturas de venta y cruzarlas con sus respectivas guías de remisión y órdenes de compra.",
    "Enviar solicitudes de confirmación de saldos (circularización) a clientes clave y conciliar respuestas.",
    "Evaluar la razonabilidad de la provisión para cuentas de cobranza dudosa según políticas internas y tributarias.",
    "Realizar pruebas de corte de ventas de fin de año para asegurar que las transacciones se registren en el período correcto."
  ],
  inventarios: [
    "Participar físicamente en la toma de inventario físico anual de almacenes y realizar conteos de prueba.",
    "Verificar la correcta valuación de los inventarios (Método Promedio o PEPS) y asegurar su costo neto realizable.",
    "Revisar el listado de existencias de lento movimiento u obsoletas para constatar la provisión de desvalorización.",
    "Cruzar el reporte de inventario físico con los saldos del Kardex valorizado en el libro contable oficial."
  ]
};

function setupAuditoriaModule() {
  // Matriz de riesgos filtro
  const selectArea = document.getElementById("select-area-riesgo");
  if (selectArea) {
    selectArea.addEventListener("change", (e) => {
      renderRisks(e.target.value);
    });
    renderRisks("todos");
  }
  
  // Programa de auditoría
  document.querySelectorAll(".btn-audit-select").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-audit-select").forEach(b => {
        b.classList.remove("active");
        b.style.background = "var(--border)";
        b.style.color = "var(--text-main)";
      });
      btn.classList.add("active");
      btn.style.background = "var(--primary)";
      btn.style.color = "white";
      
      const auditType = btn.dataset.audit;
      renderAuditChecklist(auditType);
    });
  });
  renderAuditChecklist("efectivo");
}

function renderRisks(areaFilter) {
  const container = document.getElementById("risk-matrix-list");
  if (!container) return;
  container.innerHTML = "";
  
  const filtered = risksData.filter(r => areaFilter === "todos" || r.area === areaFilter);
  
  if (filtered.length === 0) {
    container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:1rem;">No se encontraron riesgos para esta área.</p>`;
    return;
  }
  
  filtered.forEach(risk => {
    const card = document.createElement("div");
    card.className = "risk-card";
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="risk-level-badge ${risk.level}">${risk.level}</span>
        <span style="font-size:0.65rem; color:var(--text-muted); font-weight:700;">Área: ${risk.area.toUpperCase()}</span>
      </div>
      <h4 class="risk-title">${risk.title}</h4>
      <p class="risk-desc">${risk.desc}</p>
      <div class="risk-control">
        <strong>Control Mitigante:</strong> ${risk.control}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderAuditChecklist(type) {
  const container = document.getElementById("audit-checklist");
  const titleText = document.getElementById("audit-title-text");
  if (!container) return;
  
  container.innerHTML = "";
  
  let titleLabel = "Procedimientos para Caja-Bancos";
  if (type === "ventas") titleLabel = "Procedimientos para Cuentas por Cobrar y Ventas";
  if (type === "inventarios") titleLabel = "Procedimientos para Inventarios y Almacenes";
  if (titleText) titleText.textContent = titleLabel;
  
  const procedures = auditProcedures[type] || [];
  procedures.forEach((proc, idx) => {
    const div = document.createElement("label");
    div.className = "audit-check-item";
    div.innerHTML = `
      <input type="checkbox" id="chk-proc-${type}-${idx}">
      <span>${proc}</span>
    `;
    container.appendChild(div);
  });
}

// ----- 4. PENSAMIENTO LÓGICO -----
const challenges = [
  {
    id: 1,
    question: "¿Cuál es el saldo final de la cuenta 10 (Efectivo)?",
    body: "La empresa inicia el día con un saldo de S/ 5,000 en Caja. Durante la mañana realiza las siguientes transacciones:\n1. Cobra una factura de clientes por S/ 2,500 en efectivo.\n2. Paga a un proveedor de mercaderías S/ 1,800 al contado.\n3. Paga el recibo de luz por S/ 300 con efectivo.",
    options: ["S/ 5,700", "S/ 5,400", "S/ 7,200", "S/ 4,900"],
    correct: 1
  },
  {
    id: 2,
    question: "¿Qué cuenta debe cargarse (Debe) en el asiento de compra de mercaderías?",
    body: "La empresa realiza una compra de mercaderías según el PCGE peruano. De acuerdo a la naturaleza de la transacción, el gasto se clasifica y se debita inicialmente en compras.",
    options: ["Cuenta 101 - Caja", "Cuenta 201 - Mercaderías", "Cuenta 601 - Mercaderías", "Cuenta 421 - Facturas por pagar"],
    correct: 2
  },
  {
    id: 3,
    question: "Si Ventas = S/ 10,000, Costo de Ventas = S/ 6,000 y Gastos Operativos = S/ 2,000, ¿cuál es la Utilidad Operativa?",
    body: "Calcula la Utilidad Bruta restando el Costo de Ventas a los Ingresos por Ventas, y luego resta los Gastos Operativos para obtener la Utilidad Operativa.",
    options: ["S/ 4,000", "S/ 8,000", "S/ 2,000", "S/ 6,000"],
    correct: 2
  }
];

let currentChallengeIdx = 0;

function setupLogicaModule() {
  const logicOps = document.querySelectorAll(".btn-op-logic");
  const exprInput = document.getElementById("logic-expr");
  
  if (exprInput) {
    logicOps.forEach(btn => {
      btn.addEventListener("click", () => {
        const op = btn.dataset.op;
        if (op === "~") {
          exprInput.value = "~p";
        } else {
          exprInput.value = `p ${op} q`;
        }
      });
    });
    
    document.getElementById("btn-clear-logic").addEventListener("click", () => {
      exprInput.value = "p → q";
      document.getElementById("logic-table-results").style.display = "none";
    });
    
    document.getElementById("btn-generate-table").addEventListener("click", () => {
      generateTruthTable(exprInput.value);
    });
  }
  
  setupChallenges();
}

function evaluateLogic(expr, p, q) {
  let clean = expr.replace(/\s+/g, "");
  
  if (clean === "p") return p;
  if (clean === "q") return q;
  if (clean === "~p") return !p;
  if (clean === "~q") return !q;
  
  if (clean.includes("∧")) return p && q;
  if (clean.includes("∨")) return p || q;
  if (clean.includes("→")) return !p || q;
  if (clean.includes("↔")) return p === q;
  
  return p;
}

function generateTruthTable(expr) {
  const table = document.getElementById("truth-table-el");
  if (!table) return;
  
  table.innerHTML = "";
  
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>p</th>
      <th>q</th>
      <th>${expr}</th>
    </tr>
  `;
  table.appendChild(thead);
  
  const tbody = document.createElement("tbody");
  const combinations = [
    { p: true, q: true },
    { p: true, q: false },
    { p: false, q: true },
    { p: false, q: false }
  ];
  
  let trueCount = 0;
  let falseCount = 0;
  
  combinations.forEach(combo => {
    const res = evaluateLogic(expr, combo.p, combo.q);
    if (res) trueCount++;
    else falseCount++;
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${combo.p ? "V" : "F"}</td>
      <td>${combo.q ? "V" : "F"}</td>
      <td style="font-weight: 700; color: ${res ? "var(--debe)" : "var(--haber)"}">${res ? "V" : "F"}</td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  
  let classification = "";
  if (trueCount === 4) {
    classification = "Clasificación: Tautología (Siempre Verdadero)";
  } else if (falseCount === 4) {
    classification = "Clasificación: Contradicción (Siempre Falso)";
  } else {
    classification = "Clasificación: Contingencia (Verdadero o Falso)";
  }
  
  document.getElementById("logic-classification-text").textContent = classification;
  document.getElementById("logic-table-results").style.display = "block";
}

function setupChallenges() {
  const nextBtn = document.getElementById("btn-next-challenge");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentChallengeIdx = (currentChallengeIdx + 1) % challenges.length;
      loadChallenge(currentChallengeIdx);
    });
  }
  loadChallenge(0);
}

function loadChallenge(idx) {
  const challenge = challenges[idx];
  const qNumLbl = document.getElementById("challenge-num-lbl");
  if (!challenge || !qNumLbl) return;
  
  qNumLbl.textContent = `Desafío #${challenge.id}`;
  document.getElementById("challenge-question").textContent = challenge.question;
  document.getElementById("challenge-body").innerHTML = challenge.body.replace(/\n/g, "<br>");
  
  const optionsContainer = document.getElementById("challenge-options");
  optionsContainer.innerHTML = "";
  
  const feedback = document.getElementById("challenge-feedback");
  feedback.style.display = "none";
  
  const nextBtn = document.getElementById("btn-next-challenge");
  nextBtn.style.display = "none";
  
  challenge.options.forEach((opt, optIdx) => {
    const btn = document.createElement("button");
    btn.className = "challenge-option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      optionsContainer.querySelectorAll(".challenge-option-btn").forEach(b => b.disabled = true);
      
      if (optIdx === challenge.correct) {
        btn.classList.add("selected-correct");
        feedback.textContent = "¡Excelente! Respuesta correcta.";
        feedback.style.background = "var(--primary-light)";
        feedback.style.color = "var(--primary-hover)";
      } else {
        btn.classList.add("selected-incorrect");
        feedback.textContent = `Incorrecto. La respuesta correcta era: ${challenge.options[challenge.correct]}`;
        feedback.style.background = "var(--haber-light)";
        feedback.style.color = "var(--haber)";
        
        const correctBtn = optionsContainer.children[challenge.correct];
        if (correctBtn) correctBtn.classList.add("selected-correct");
      }
      feedback.style.display = "block";
      nextBtn.style.display = "block";
    });
    optionsContainer.appendChild(btn);
  });
}

// ----- 5. SISTEMAS CONTABLES -----
let voucherRows = [];
let postedVouchers = [];

function setupSistemasModule() {
  const accountInput = document.getElementById("v-cuenta");
  const descInput = document.getElementById("v-desc");
  const debeInput = document.getElementById("v-debe");
  const haberInput = document.getElementById("v-haber");
  const addBtn = document.getElementById("btn-add-voucher-row");
  
  if (!accountInput) return;
  
  accountInput.addEventListener("input", async (e) => {
    const code = e.target.value.trim();
    if (code.length >= 2) {
      const desc = await getAccountDescription(code);
      descInput.value = desc !== "—" ? desc : "Cuenta no encontrada";
    } else {
      descInput.value = "";
    }
  });
  
  debeInput.addEventListener("input", () => {
    if (debeInput.value) haberInput.value = "";
  });
  
  haberInput.addEventListener("input", () => {
    if (haberInput.value) debeInput.value = "";
  });
  
  addBtn.addEventListener("click", () => {
    const code = accountInput.value.trim();
    const desc = descInput.value.trim();
    const debeVal = parseFloat(debeInput.value) || 0;
    const haberVal = parseFloat(haberInput.value) || 0;
    
    if (!code || desc === "Cuenta no encontrada" || desc === "") {
      showToast("Ingresa un código de cuenta válido del PCGE.", "error");
      return;
    }
    
    if (debeVal <= 0 && haberVal <= 0) {
      showToast("Debes ingresar un importe en el Debe o en el Haber.", "error");
      return;
    }
    
    voucherRows.push({ code, desc, debe: debeVal, haber: haberVal });
    
    accountInput.value = "";
    descInput.value = "";
    debeInput.value = "";
    haberInput.value = "";
    
    renderVoucherTable();
  });
  
  document.getElementById("btn-clear-voucher").addEventListener("click", () => {
    voucherRows = [];
    renderVoucherTable();
  });
  
  document.getElementById("btn-post-voucher").addEventListener("click", () => {
    if (voucherRows.length === 0) {
      showToast("El voucher está vacío.", "error");
      return;
    }
    
    let totalDebe = 0;
    let totalHaber = 0;
    voucherRows.forEach(r => {
      totalDebe += r.debe;
      totalHaber += r.haber;
    });
    
    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      showToast(`¡Asiento descuadrado! Debe cuadrar partida doble por S/ ${Math.abs(totalDebe - totalHaber).toFixed(2)}.`, "error");
      return;
    }
    
    const glosa = document.getElementById("v-glosa").value || "Voucher Contable";
    postedVouchers.push({ glosa, entries: [...voucherRows] });
    
    voucherRows = [];
    renderVoucherTable();
    updateBalanceSheet();
    
    showToast("Asiento procesado con éxito.", "success");
  });
  
  document.getElementById("btn-reset-balance").addEventListener("click", () => {
    postedVouchers = [];
    updateBalanceSheet();
    showToast("El Balance de Comprobación ha sido reiniciado.", "info");
  });
  
  renderVoucherTable();
  updateBalanceSheet();
}

function renderVoucherTable() {
  const container = document.getElementById("voucher-rows-container");
  if (!container) return;
  container.innerHTML = "";
  
  let totalDebe = 0;
  let totalHaber = 0;
  
  voucherRows.forEach((row, index) => {
    totalDebe += row.debe;
    totalHaber += row.haber;
    
    const tr = document.createElement("tr");
    tr.className = "voucher-row-el";
    tr.innerHTML = `
      <td style="padding:0.4rem 0.5rem; font-weight:700;">${row.code}</td>
      <td style="padding:0.4rem 0.5rem; color:var(--text-muted); font-size:0.75rem;">${row.desc}</td>
      <td style="padding:0.4rem 0.5rem; text-align:right; color:var(--debe); font-weight:700;">${row.debe > 0 ? 'S/ ' + row.debe.toFixed(2) : '-'}</td>
      <td style="padding:0.4rem 0.5rem; text-align:right; color:var(--haber); font-weight:700;">${row.haber > 0 ? 'S/ ' + row.haber.toFixed(2) : '-'}</td>
      <td style="padding:0.4rem 0.5rem; text-align:center;">
        <button class="btn-remove-row" onclick="removeVoucherRow(${index})">&times;</button>
      </td>
    `;
    container.appendChild(tr);
  });
  
  document.getElementById("v-total-debe").textContent = `S/ ${totalDebe.toFixed(2)}`;
  document.getElementById("v-total-haber").textContent = `S/ ${totalHaber.toFixed(2)}`;
}

window.removeVoucherRow = function(idx) {
  voucherRows.splice(idx, 1);
  renderVoucherTable();
};

function updateBalanceSheet() {
  const container = document.getElementById("balance-sheet-rows");
  if (!container) return;
  
  container.innerHTML = "";
  
  const ledger = {};
  postedVouchers.forEach(v => {
    v.entries.forEach(ent => {
      const code = ent.code;
      if (!ledger[code]) {
        ledger[code] = { desc: ent.desc, debe: 0, haber: 0 };
      }
      ledger[code].debe += ent.debe;
      ledger[code].haber += ent.haber;
    });
  });
  
  const codes = Object.keys(ledger).sort();
  
  let totalDebeSum = 0;
  let totalHaberSum = 0;
  let totalDeudorSum = 0;
  let totalAcreedorSum = 0;
  
  if (codes.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="padding:1rem; text-align:center; color:var(--text-muted); font-style:italic;">No hay transacciones registradas.</td></tr>`;
    document.getElementById("bal-sum-debe").textContent = "S/ 0.00";
    document.getElementById("bal-sum-haber").textContent = "S/ 0.00";
    document.getElementById("bal-sal-deudor").textContent = "S/ 0.00";
    document.getElementById("bal-sal-acreedor").textContent = "S/ 0.00";
    return;
  }
  
  codes.forEach(code => {
    const data = ledger[code];
    const deb = data.debe;
    const hab = data.haber;
    
    let deudor = 0;
    let acreedor = 0;
    
    if (deb >= hab) {
      deudor = deb - hab;
    } else {
      acreedor = hab - deb;
    }
    
    totalDebeSum += deb;
    totalHaberSum += hab;
    totalDeudorSum += deudor;
    totalAcreedorSum += acreedor;
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="padding:0.35rem 0.4rem; border:1px solid var(--border); font-weight:700; text-align:center;">${code}</td>
      <td style="padding:0.35rem 0.4rem; border:1px solid var(--border); font-size:0.7rem; color:var(--text-muted);">${data.desc}</td>
      <td style="padding:0.35rem 0.4rem; border:1px solid var(--border); text-align:right;">S/ ${deb.toFixed(2)}</td>
      <td style="padding:0.35rem 0.4rem; border:1px solid var(--border); text-align:right;">S/ ${hab.toFixed(2)}</td>
      <td style="padding:0.35rem 0.4rem; border:1px solid var(--border); text-align:right; font-weight:700; color:var(--debe);">${deudor > 0 ? 'S/ ' + deudor.toFixed(2) : '-'}</td>
      <td style="padding:0.35rem 0.4rem; border:1px solid var(--border); text-align:right; font-weight:700; color:var(--haber);">${acreedor > 0 ? 'S/ ' + acreedor.toFixed(2) : '-'}</td>
    `;
    container.appendChild(tr);
  });
  
  document.getElementById("bal-sum-debe").textContent = `S/ ${totalDebeSum.toFixed(2)}`;
  document.getElementById("bal-sum-haber").textContent = `S/ ${totalHaberSum.toFixed(2)}`;
  document.getElementById("bal-sal-deudor").textContent = `S/ ${totalDeudorSum.toFixed(2)}`;
  document.getElementById("bal-sal-acreedor").textContent = `S/ ${totalAcreedorSum.toFixed(2)}`;
}

