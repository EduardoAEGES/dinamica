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
    if (itemScreen === screenId || (screenId === "op-detail" && itemScreen === "op-list")) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
  
  // Control de cabecera y botón volver
  const backBtn = document.getElementById("back-btn");
  const logoIcon = document.getElementById("logo-icon");
  const logoText = document.getElementById("logo-text");
  
  backBtn.style.display = "none";
  logoIcon.style.display = "flex";
  logoText.textContent = "DINAMICA CONTABLE 2026 1";
}

// Configurar clicks de botones de navegación
function setupNavigation() {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const screen = btn.dataset.screen;
      if (screen === "op-list") {
        selectOperation(6);
        navigateTo("op-detail");
      } else {
        navigateTo(screen);
      }
    });
  });
  
  document.getElementById("back-btn").addEventListener("click", () => {
    selectOperation(6);
    navigateTo("op-detail");
  });
}

// ===== INICIO DE LA APLICACIÓN =====
document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  setupNavigation();
  renderOperationsList();
  setupSearchFilters();
  setupPcgeExplorer();
  
  // Por defecto ir directamente al explorador PCGE (Buscador)
  navigateTo("pcge");
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

