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
  "3xxx": "PROPIEDAD, PLANTA Y EQUIPO (Por definir)",
  "33411": "Vehículos motorizados - Costo",
  "39": "DEPRECIACIÓN, AMORTIZACIÓN Y AGOTAMIENTO ACUMULADOS",
  "39525": "Vehículos motorizados - Depreciación acumulada",
  "40": "TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SISTEMA DE PENSIONES Y DE SALUD POR PAGAR",
  "40xx": "TRIBUTOS POR PAGAR (Por definir)",
  "40111": "IGV - Cuenta propia",
  "4031": "ESSALUD",
  "4032": "ONP",
  "41": "REMUNERACIONES Y PARTICIPACIONES POR PAGAR",
  "4111": "Sueldos y salarios por pagar",
  "417": "Administradoras de fondos de pensiones (AFP)",
  "42": "CUENTAS POR PAGAR COMERCIALES – TERCEROS",
  "4212": "Emitidas",
  "46": "CUENTAS POR PAGAR DIVERSAS – TERCEROS",
  "465x": "CUENTAS POR PAGAR DIVERSAS (Por definir)",
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
  "951": "Gastos de Ventas",
  "6111": "Materias primas",
  "6131": "Materiales auxiliares",
  "6141": "Envases y embalajes",
  "24111": "Materias primas para prod. manufacturados",
  "251": "Materiales auxiliares",
  "261": "Envases",
  "61xx": "Variación de inventarios (Por definir)",
  "79xx": "Cargas imputables a costos y gastos",
  "43": "CUENTAS POR PAGAR COMERCIALES – RELACIONADAS",
  "431": "Facturas, boletas y otros comprobantes por pagar",
  "4312": "Emitidas",
  "60xx": "Compras (Por definir)",
  "42xx": "Cuentas por pagar comerciales - Terceros (Por definir)",
  "43xx": "Cuentas por pagar comerciales - Relacionadas (Por definir)",
  "2xxx": "Activo realizable (Por definir)"
};

// Función para obtener descripciones dinámicas desde Supabase
async function getAccountDescription(code) {
  if (code.length === 1) {
    return getElementoName(code);
  }
  if (accountCache[code]) {
    return accountCache[code];
  }
  
  let desc = defaultDescriptions[code] || defaultDescriptions[code.toUpperCase()] || defaultDescriptions[code.toLowerCase()] || "—";
  
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
    id: 1,
    name: "Asiento de Apertura",
    description: "Registro inicial de los activos, pasivos y patrimonio con los que la empresa inicia sus operaciones.",
    blocks: [
      {
        title: "1. Asiento de Apertura",
        entries: [
          { code: "1XXX", type: "debe", value: "XXXX" },
          { code: "2XXX", type: "debe", value: "XXXX" },
          { code: "3XXX", type: "debe", value: "XXXX" },
          { code: "4XXX", type: "haber", value: "XXXX" },
          { code: "5XXX", type: "haber", value: "XXXX" }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Compra de Activo Realizable (almacenable)",
    description: "Adquisición de mercaderías, materias primas o suministros que ingresan al almacén.",
    blocks: [
      {
        title: "2.1. Asiento de Naturaleza",
        entries: [
          { code: "60XX", type: "debe", value: "Valor venta" },
          { code: "40111", type: "debe", value: "IGV" },
          { code: "4212/4312", type: "haber", value: "Importe Total" }
        ]
      },
      {
        title: "2.2. Asiento de Destino",
        entries: [
          { code: "2XXX", type: "debe", value: "Valor venta" },
          { code: "61XX", type: "haber", value: "Valor venta" }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Venta del giro del negocio",
    description: "Registro de la venta de bienes o mercaderías propias de la actividad comercial de la empresa.",
    blocks: [
      {
        title: "3. Venta del giro del negocio",
        entries: [
          { code: "1212/1312", type: "debe", value: "Importe Total" },
          { code: "40111", type: "haber", value: "IGV" },
          { code: "70XX", type: "haber", value: "Valor venta" }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Pago / Cobro",
    description: "Registro de los pagos realizados a proveedores o cobros recibidos de clientes.",
    blocks: [
      {
        title: "4.1. Pago",
        entries: [
          { code: "4XXX", type: "debe", value: "Importe Total" },
          { code: "10XX", type: "haber", value: "Importe Total" }
        ]
      },
      {
        title: "4.2. Cobro",
        entries: [
          { code: "10XX", type: "debe", value: "Importe Total" },
          { code: "1XXX", type: "haber", value: "Importe Total" }
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Anticipo de clientes",
    description: "Registro del dinero recibido de un cliente de manera anticipada antes de emitir la factura de venta.",
    blocks: [
      {
        title: "5. Anticipo de clientes",
        entries: [
          { code: "1212/1312", type: "debe", value: "Importe Total" },
          { code: "40111", type: "haber", value: "IGV" },
          { code: "122/132", type: "haber", value: "Valor venta" }
        ]
      }
    ]
  },
  {
    id: 6,
    name: "Anticipo a proveedores",
    description: "Registro de los adelantos de dinero entregados a proveedores antes del despacho del bien o servicio.",
    blocks: [
      {
        title: "6. Anticipo a proveedores",
        entries: [
          { code: "422/432", type: "debe", value: "Valor venta" },
          { code: "40111", type: "debe", value: "IGV" },
          { code: "4212/4312", type: "haber", value: "Importe Total" }
        ]
      }
    ]
  },
  {
    id: 7,
    name: "Compra de activo inmovilizado",
    description: "Adquisición de bienes de propiedad, planta y equipo (PPE) destinados al uso de la empresa.",
    blocks: [
      {
        title: "7. Compra de activo inmovilizado",
        entries: [
          { code: "3XXX", type: "debe", value: "Valor venta" },
          { code: "40111", type: "debe", value: "IGV" },
          { code: "465X/477X", type: "haber", value: "Importe Total" }
        ]
      }
    ]
  },
  {
    id: 8,
    name: "Préstamos / Adelanto a trabajadores",
    description: "Registro del préstamo o adelanto de remuneraciones otorgado al personal de la empresa.",
    blocks: [
      {
        title: "8. Préstamos / Adelanto a trabajadores",
        entries: [
          { code: "14XX", type: "debe", value: "XXXX" },
          { code: "10XX", type: "haber", value: "XXXX" }
        ]
      }
    ]
  },
  {
    id: 9,
    name: "Movimiento de dinero",
    description: "Transferencia de fondos entre cuentas de efectivo y equivalentes de efectivo (caja a bancos o viceversa).",
    blocks: [
      {
        title: "9. Movimiento de dinero",
        entries: [
          { code: "10XX", type: "debe", value: "XXXX" },
          { code: "10XX", type: "haber", value: "XXXX" }
        ]
      }
    ]
  },
  {
    id: 10,
    name: "Préstamos a empresas / entregas a rendir",
    description: "Registro de préstamos otorgados a entidades relacionadas o entregas de dinero para gastos a rendir cuenta.",
    blocks: [
      {
        title: "10. Préstamos a empresas / entregas a rendir",
        entries: [
          { code: "16XX/17XX", type: "debe", value: "XXXX" },
          { code: "10XX", type: "haber", value: "XXXX" }
        ]
      }
    ]
  },
  {
    id: 11,
    name: "Pago de ITAN / Pago a cuenta del IR",
    description: "Registro del pago del Impuesto Temporal a los Activos Netos (ITAN) o pagos mensuales a cuenta del Impuesto a la Renta.",
    blocks: [
      {
        title: "11. Pago de ITAN / Pago a cuenta del IR",
        entries: [
          { code: "167X", type: "debe", value: "XXXX" },
          { code: "10XX", type: "haber", value: "XXXX" }
        ]
      }
    ]
  },
  {
    id: 12,
    name: "Incremento de Capital",
    description: "Registro contable del aumento de capital social de la empresa, cubriendo el acuerdo, el cobro de aportes y la regularización en registros públicos.",
    blocks: [
      {
        title: "12.1. Por el acuerdo",
        entries: [
          { code: "1421", type: "debe", value: "XXXX" },
          { code: "522X", type: "haber", value: "XXXX" }
        ]
      },
      {
        title: "12.2. Por el cobro",
        entries: [
          { code: "1XX, 2XX, 3XX", type: "debe", value: "XXXX" },
          { code: "1421", type: "haber", value: "XXXX" }
        ]
      },
      {
        title: "12.3. Por la regularización",
        entries: [
          { code: "522X", type: "debe", value: "XXXX" },
          { code: "501X", type: "haber", value: "XXXX" }
        ]
      }
    ]
  },
  {
    id: 13,
    name: "Reserva Legal",
    description: "Detracción obligatoria de las utilidades del ejercicio para constituir la reserva legal conforme a la Ley General de Sociedades.",
    blocks: [
      {
        title: "13. Reserva Legal",
        entries: [
          { code: "5911", type: "debe", value: "XXXX" },
          { code: "58X", type: "haber", value: "XXXX" }
        ]
      }
    ]
  },
  {
    id: 14,
    name: "Consumo de suministros",
    description: "Registro de la salida y consumo de materiales auxiliares, suministros o repuestos del almacén.",
    blocks: [
      {
        title: "14. Consumo de suministros (Naturaleza)",
        entries: [
          { code: "61XX", type: "debe", value: "XXXX" },
          { code: "2XXX", type: "haber", value: "XXXX" }
        ]
      },
      {
        title: "14. Consumo de suministros (Destino)",
        entries: [
          { code: "9XX", type: "debe", value: "XXXX" },
          { code: "791", type: "haber", value: "XXXX" }
        ]
      }
    ]
  },
  {
    id: 15,
    name: "Servicios prestados por Terceros / Otros Gastos",
    description: "Registro de gastos por servicios de terceros (luz, agua, alquileres) u otros gastos de gestión, con su destino correspondiente.",
    blocks: [
      {
        title: "15.1. Asiento de Naturaleza",
        entries: [
          { code: "63XX/65XX", type: "debe", value: "Valor venta" },
          { code: "40111", type: "debe", value: "IGV" },
          { code: "4212/4312", type: "haber", value: "Importe Total" }
        ]
      },
      {
        title: "15.2. Asiento de Destino",
        entries: [
          { code: "9XX", type: "debe", value: "Valor venta" },
          { code: "791", type: "haber", value: "Valor venta" }
        ]
      }
    ]
  },
  {
    id: 16,
    name: "Gastos del personal",
    description: "Registro de la planilla de sueldos y salarios, descuentos de ley, aportes del empleador y beneficios sociales con sus destinos.",
    blocks: [
      {
        title: "16.1. Ingresos y descuentos (Planilla)",
        entries: [
          { code: "6211", type: "debe", value: "Rem Bruta" },
          { code: "4031", type: "haber", value: "ONP" },
          { code: "4111", type: "haber", value: "Rem Neta" },
          { code: "417", type: "haber", value: "AFP" }
        ]
      },
      {
        title: "16.1. Ingresos y descuentos (Destino)",
        entries: [
          { code: "9XX", type: "debe", value: "Rem Bruta" },
          { code: "791", type: "haber", value: "Rem Bruta" }
        ]
      },
      {
        title: "16.2. Aportes del Empleador (Aportes)",
        entries: [
          { code: "627X", type: "debe", value: "Aporte" },
          { code: "403X/4212", type: "haber", value: "Aporte" }
        ]
      },
      {
        title: "16.2. Aportes del Empleador (Destino)",
        entries: [
          { code: "9XX", type: "debe", value: "Aporte" },
          { code: "791", type: "haber", value: "Aporte" }
        ]
      },
      {
        title: "16.3. Beneficios Sociales (Beneficios)",
        entries: [
          { code: "62XX", type: "debe", value: "Rem Bruta" },
          { code: "41XX", type: "haber", value: "Aporte" }
        ]
      },
      {
        title: "16.3. Beneficios Sociales (Destino)",
        entries: [
          { code: "9XX", type: "debe", value: "Rem Bruta" },
          { code: "791", type: "haber", value: "Valor venta" }
        ]
      }
    ]
  },
  {
    id: 17,
    name: "Gastos Tributarios",
    description: "Registro contable de los gastos por tributos (como el Impuesto General a las Ventas no computable, arbitrios, entre otros).",
    blocks: [
      {
        title: "17. Gastos Tributarios (Naturaleza)",
        entries: [
          { code: "64XX", type: "debe", value: "XXXX" },
          { code: "40XX", type: "haber", value: "XXXX" }
        ]
      },
      {
        title: "17. Gastos Tributarios (Destino)",
        entries: [
          { code: "9XX", type: "debe", value: "XXXX" },
          { code: "791", type: "haber", value: "XXXX" }
        ]
      }
    ]
  },
  {
    id: 18,
    name: "Costo de Ventas",
    description: "Registro de la salida de existencias de mercaderías del almacén por el costo de venta correspondiente.",
    blocks: [
      {
        title: "18. Costo de Ventas",
        entries: [
          { code: "69XX", type: "debe", value: "XXXX" },
          { code: "2XXX", type: "haber", value: "Tributo" }
        ]
      }
    ]
  },
  {
    id: 19,
    name: "Gastos pagados por anticipado",
    description: "Registro de seguros, alquileres o servicios contratados por anticipado y su devengo periódico.",
    blocks: [
      {
        title: "19.1. Contrato",
        entries: [
          { code: "18XX", type: "debe", value: "Valor venta" },
          { code: "40111", type: "debe", value: "IGV" },
          { code: "4212/4312", type: "haber", value: "Importe Total" }
        ]
      },
      {
        title: "19.2. Devengado (Gasto)",
        entries: [
          { code: "65X/63X", type: "debe", value: "Valor venta/n" },
          { code: "18XX", type: "haber", value: "Valor venta/n" }
        ]
      },
      {
        title: "19.2. Devengado (Destino)",
        entries: [
          { code: "9XX", type: "debe", value: "Valor venta/n" },
          { code: "791", type: "haber", value: "Valor venta/n" }
        ]
      }
    ]
  },
  {
    id: 20,
    name: "Estimación de Cobranza Dudosa",
    description: "Provisión por cuentas de cobranza dudosa, su destino, y su posterior castigo o recuperación.",
    blocks: [
      {
        title: "20.1. Estimación (Provisión)",
        entries: [
          { code: "687X", type: "debe", value: "XXXX" },
          { code: "19XX", type: "haber", value: "XXXX" }
        ]
      },
      {
        title: "20.1. Estimación (Destino)",
        entries: [
          { code: "9XX", type: "debe", value: "XXXX" },
          { code: "781", type: "haber", value: "XXXX" }
        ]
      },
      {
        title: "20.2. Castigo",
        entries: [
          { code: "19XX", type: "debe", value: "XXXX" },
          { code: "1XXX", type: "haber", value: "XXXX" }
        ]
      },
      {
        title: "20.2. Recuperación (en caso no se castigue)",
        entries: [
          { code: "19XX", type: "debe", value: "XXXX" },
          { code: "755X", type: "haber", value: "XXXX" }
        ]
      }
    ]
  },
  {
    id: 21,
    name: "Desvalorización de Inventarios",
    description: "Reconocimiento contable de la pérdida de valor de las mercaderías o materias primas en stock.",
    blocks: [
      {
        title: "21. Desvalorización de Inventarios",
        entries: [
          { code: "695X", type: "debe", value: "XXXX" },
          { code: "29XX", type: "haber", value: "XXXX" }
        ]
      }
    ]
  },
  {
    id: 22,
    name: "Depreciación / Amortización",
    description: "Cálculo de la pérdida de valor de activos inmovilizados y su correspondiente distribución de costos.",
    blocks: [
      {
        title: "22. Depreciación / Amortización (Provisión)",
        entries: [
          { code: "68XX", type: "debe", value: "XXXX" },
          { code: "39XX", type: "haber", value: "XXXX" }
        ]
      },
      {
        title: "22. Depreciación / Amortización (Destino)",
        entries: [
          { code: "9XX", type: "debe", value: "XXXX" },
          { code: "781", type: "haber", value: "XXXX" }
        ]
      }
    ]
  },
  {
    id: 23,
    name: "Venta de activos inmovilizados",
    description: "Reclasificación, enajenación y retiro contable de bienes de propiedad, planta y equipo.",
    blocks: [
      {
        title: "24.1. Reclasificación de activo inmovilizado",
        entries: [
          { code: "27XX", type: "debe", value: "Valor en Libros" },
          { code: "39XX", type: "debe", value: "Depre Acumulada" },
          { code: "33XX", type: "haber", value: "Costo Adquisición" }
        ]
      },
      {
        title: "24.2. Venta del activo",
        entries: [
          { code: "165X/175X", type: "debe", value: "Importe Total" },
          { code: "40111", type: "haber", value: "IGV" },
          { code: "756X", type: "haber", value: "Valor venta" }
        ]
      },
      {
        title: "24.3. Costo de enajenación (Gasto)",
        entries: [
          { code: "655X", type: "debe", value: "Valor en Libros" },
          { code: "27XX", type: "haber", value: "Valor en Libros" }
        ]
      },
      {
        title: "24.3. Costo de enajenación (Destino)",
        entries: [
          { code: "9XX", type: "debe", value: "Valor en Libros" },
          { code: "791", type: "haber", value: "Valor en Libros" }
        ]
      }
    ]
  }
];

// ===== LÓGICA DE NAVEGACIÓN Y ENRUTADOR =====
let activeOpId = null;
let navigationHistory = ["hub"];
let sessionLedgerBlocks = null;

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
      headerTitle = "DINÁMICA - EEFF";
      break;
    case "op-detail":
      headerTitle = "ASIENTO CONTABLE";
      break;
    case "costos":
      headerTitle = "CONTABILIDAD GERENCIAL";
      break;
    case "auditoria":
      headerTitle = "CONTROL INTERNO";
      break;
    case "logica":
      headerTitle = "PENSAMIENTO LÓGICO";
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
  if (screenId === "logica") {
    showLogicaPanel("panel-logica-hub");
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

// Cambiar de panel interno dentro de la pantalla de Lógica
function showLogicaPanel(panelId) {
  const container = document.getElementById("screen-logica");
  if (!container) return;
  
  container.querySelectorAll(".sub-panel").forEach(panel => {
    panel.classList.remove("active");
  });
  
  const target = document.getElementById(panelId);
  if (target) {
    target.classList.add("active");
  }
  
  if (typeof resetQuizzes === "function") {
    resetQuizzes();
  }
}

// Configurar clicks de botones de navegación
function setupNavigation() {
  // Botones del Hub de Cursos
  document.querySelectorAll(".pwa-card").forEach(card => {
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

    // Si estamos en la pantalla de lógica y no estamos en el hub de lógica, volver al hub de lógica
    const screenLogica = document.getElementById("screen-logica");
    if (screenLogica && screenLogica.classList.contains("active")) {
      const hubPanelLogica = document.getElementById("panel-logica-hub");
      if (hubPanelLogica && !hubPanelLogica.classList.contains("active")) {
        showLogicaPanel("panel-logica-hub");
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

// ===== DETECCIÓN DE DISPOSITIVO =====
function detectDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobile = /android|iphone|ipad|ipod|windows phone|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  
  if (isMobile) {
    document.body.classList.add("is-mobile-device");
    document.body.classList.remove("is-pc-device");
  } else {
    document.body.classList.add("is-pc-device");
    document.body.classList.remove("is-mobile-device");
  }
}

// ===== INICIO DE LA APLICACIÓN =====
document.addEventListener("DOMContentLoaded", () => {
  detectDevice();
  setupTheme();
  setupNavigation();
  setupSubTabs();
  
  // Inicializaciones de dinámica
  renderOperationsList();
  setupSearchFilters();
  setupPcgeExplorer();
  
  // Inicialización de nuevos módulos de cursos
  setupCostosModule();
  setupAuditoriaModule();
  setupLogicaModule();
  
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
// Renderizar menú principal con las 16 operaciones contables
function renderOperationsList() {
  const menuContainer = document.getElementById("operations-menu");
  menuContainer.innerHTML = "";
  
  const operationIcons = {
    1: "📂",
    2: "📦",
    3: "💰",
    4: "💸",
    5: "📥",
    6: "📤",
    7: "🏗️",
    8: "🧑‍💼",
    9: "🔄",
    10: "🏢",
    11: "🏛️",
    12: "📈",
    13: "🔒",
    14: "📝",
    15: "🛠️",
    16: "👥",
    17: "⚖️",
    18: "🏷️",
    19: "📅",
    20: "⚠️",
    21: "📉",
    22: "⏳",
    23: "🔨"
  };
  
  operations.forEach(op => {
    const btn = document.createElement("button");
    btn.className = "op-menu-item certus-pill-btn";
    btn.onclick = () => {
      selectOperation(op.id);
      navigateTo("op-detail");
    };
    
    const icon = operationIcons[op.id] || "💼";
    
    btn.innerHTML = `
      <div class="op-menu-left-pill">
        <span class="op-menu-num">${op.id}</span>
        <span class="op-menu-icon">${icon}</span>
      </div>
      <div class="op-menu-right-pill">
        <span class="op-menu-name">${op.name}</span>
        <span class="op-menu-arrow">→</span>
      </div>
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
  
  sessionLedgerBlocks = null; // Reiniciar estado temporal del asiento al cambiar de operación
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
    
  } else if (op.inputTemplate === "aumento_capital") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-total">Monto Total Acordado (S/)</label>
        <input type="number" id="input-total" class="calc-input" value="${op.defaultValues.total}" min="0">
      </div>
      <div class="input-group">
        <label for="input-efectivo">Aporte en Efectivo (S/)</label>
        <input type="number" id="input-efectivo" class="calc-input" value="${op.defaultValues.efectivo}" min="0">
      </div>
      <div class="input-group">
        <label for="input-bienes">Aporte en Bienes/Mercaderías (S/)</label>
        <input type="number" id="input-bienes" class="calc-input" value="${op.defaultValues.bienes}" min="0">
      </div>
    `;
    inputsContainer.querySelectorAll("input").forEach(el => {
      el.addEventListener("input", () => updateLedger(op));
    });

  } else if (op.inputTemplate === "reserva") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-tipo">Tipo de Reserva</label>
        <select id="input-tipo" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="legal" ${op.defaultValues.tipo === 'legal' ? 'selected' : ''}>Reserva Legal (10% Ley de Sociedades)</option>
          <option value="facultativa" ${op.defaultValues.tipo === 'facultativa' ? 'selected' : ''}>Reserva Facultativa (Acuerdo Socios)</option>
          <option value="estatutaria" ${op.defaultValues.tipo === 'estatutaria' ? 'selected' : ''}>Reserva Estatutaria (Estatuto)</option>
        </select>
      </div>
      <div class="input-group" id="group-utilidad">
        <label for="input-utilidad">Utilidad Neta del Ejercicio (S/)</label>
        <input type="number" id="input-utilidad" class="calc-input" value="${op.defaultValues.utilidad}" min="0">
      </div>
      <div class="input-group" id="group-porcentaje" style="display: none;">
        <label for="input-porcentaje">Porcentaje de Reserva (%)</label>
        <input type="number" id="input-porcentaje" class="calc-input" value="${op.defaultValues.porcentaje}" min="0">
      </div>
      <div class="input-group" id="group-montoFijo" style="display: none;">
        <label for="input-montoFijo">Monto de Reserva (S/)</label>
        <input type="number" id="input-montoFijo" class="calc-input" value="${op.defaultValues.montoFijo}" min="0">
      </div>
    `;
    
    const tipoSelect = document.getElementById("input-tipo");
    const groupUtilidad = document.getElementById("group-utilidad");
    const groupPorcentaje = document.getElementById("group-porcentaje");
    const groupMontoFijo = document.getElementById("group-montoFijo");
    
    const toggleGroups = () => {
      const val = tipoSelect.value;
      if (val === "legal") {
        groupUtilidad.style.display = "block";
        groupPorcentaje.style.display = "none";
        groupMontoFijo.style.display = "none";
      } else if (val === "estatutaria") {
        groupUtilidad.style.display = "block";
        groupPorcentaje.style.display = "block";
        groupMontoFijo.style.display = "none";
      } else if (val === "facultativa") {
        groupUtilidad.style.display = "none";
        groupPorcentaje.style.display = "none";
        groupMontoFijo.style.display = "block";
      }
    };
    
    tipoSelect.addEventListener("change", toggleGroups);
    toggleGroups();
    
    inputsContainer.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => updateLedger(op));
    });

  } else if (op.inputTemplate === "consumo_realizables") {
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="input-tipo">Tipo de Activo Realizable</label>
        <select id="input-tipo" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="materias_primas" ${op.defaultValues.tipo === 'materias_primas' ? 'selected' : ''}>Materias Primas (C-6111 / A-24111)</option>
          <option value="envases" ${op.defaultValues.tipo === 'envases' ? 'selected' : ''}>Envases y Embalajes (C-6141 / A-261)</option>
          <option value="materiales" ${op.defaultValues.tipo === 'materiales' ? 'selected' : ''}>Materiales Auxiliares (C-6131 / A-251)</option>
        </select>
      </div>
      <div class="input-group">
        <label for="input-valor">Valor del Consumo / Envío (S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0">
      </div>
    `;
    
    const tipoSelect = document.getElementById("input-tipo");
    const valorInp = document.getElementById("input-valor");
    
    tipoSelect.addEventListener("change", () => {
      const val = tipoSelect.value;
      if (val === "materias_primas") {
        valorInp.value = 15000;
      } else if (val === "envases") {
        valorInp.value = 9200;
      } else if (val === "materiales") {
        valorInp.value = 6800;
      }
      updateLedger(op);
    });
    
    inputsContainer.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => updateLedger(op));
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
      <div class="input-group">
        <label for="input-igv-cond">Condición de IGV</label>
        <select id="input-igv-cond" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="gravada_credito" ${op.defaultValues.igvCond === 'gravada_credito' ? 'selected' : ''}>Gravada con IGV (Con Crédito Fiscal - C-40111)</option>
          <option value="gravada_sin_credito" ${op.defaultValues.igvCond === 'gravada_sin_credito' ? 'selected' : ''}>Gravada con IGV (Sin Crédito Fiscal / C-1673)</option>
          <option value="no_gravada" ${op.defaultValues.igvCond === 'no_gravada' ? 'selected' : ''}>No Gravada con IGV</option>
        </select>
      </div>
      <div class="input-group">
        <label for="input-por-pagar">Cuenta por Pagar</label>
        <select id="input-por-pagar" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="terceros" ${op.defaultValues.porPagar === 'terceros' ? 'selected' : ''}>Comerciales Terceros (C-4212)</option>
          <option value="relacionadas" ${op.defaultValues.porPagar === 'relacionadas' ? 'selected' : ''}>Comerciales Relacionadas (C-4312)</option>
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
        <label for="input-valor">Valor del Servicio / Gasto (Neto S/)</label>
        <input type="number" id="input-valor" class="calc-input" value="${op.defaultValues.valor}" min="0" step="0.01">
      </div>
      <div class="input-group">
        <label for="input-tipo-gasto">Tipo de Gasto</label>
        <select id="input-tipo-gasto" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="servicios" ${op.defaultValues.tipoGasto === 'servicios' ? 'selected' : ''}>Servicios de Terceros (C-63)</option>
          <option value="otros" ${op.defaultValues.tipoGasto === 'otros' ? 'selected' : ''}>Otros Gastos de Gestión (C-65)</option>
        </select>
      </div>
      <div class="input-group">
        <label for="input-igv-cond">Condición de IGV</label>
        <select id="input-igv-cond" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="gravada_credito" ${op.defaultValues.igvCond === 'gravada_credito' ? 'selected' : ''}>Gravada con IGV (Con Crédito Fiscal - C-40111)</option>
          <option value="gravada_sin_credito" ${op.defaultValues.igvCond === 'gravada_sin_credito' ? 'selected' : ''}>Gravada con IGV (Sin Crédito Fiscal / C-1673)</option>
          <option value="no_gravada" ${op.defaultValues.igvCond === 'no_gravada' ? 'selected' : ''}>No Gravada con IGV</option>
        </select>
      </div>
      <div class="input-group">
        <label for="input-por-pagar">Cuenta por Pagar</label>
        <select id="input-por-pagar" class="calc-input" style="font-size: 0.95rem; font-weight: normal; padding: 0.5rem 0.75rem; background: var(--bg-input);">
          <option value="terceros" ${op.defaultValues.porPagar === 'terceros' ? 'selected' : ''}>Comerciales Terceros (C-4212)</option>
          <option value="relacionadas" ${op.defaultValues.porPagar === 'relacionadas' ? 'selected' : ''}>Comerciales Relacionadas (C-4312)</option>
        </select>
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
  } else if (op.inputTemplate === "aumento_capital") {
    return {
      total: Number(document.getElementById("input-total").value) || 0,
      efectivo: Number(document.getElementById("input-efectivo").value) || 0,
      bienes: Number(document.getElementById("input-bienes").value) || 0
    };
  } else if (op.inputTemplate === "reserva") {
    return {
      tipo: document.getElementById("input-tipo").value,
      utilidad: Number(document.getElementById("input-utilidad").value) || 0,
      porcentaje: Number(document.getElementById("input-porcentaje").value) || 0,
      montoFijo: Number(document.getElementById("input-montoFijo").value) || 0
    };
  } else if (op.inputTemplate === "compra_almacenada") {
    return {
      valor: Number(document.getElementById("input-valor").value) || 0,
      tipo: document.getElementById("input-tipo").value,
      igvCond: document.getElementById("input-igv-cond").value,
      porPagar: document.getElementById("input-por-pagar").value
    };
  } else if (op.inputTemplate === "consumo_realizables") {
    return {
      tipo: document.getElementById("input-tipo").value,
      valor: Number(document.getElementById("input-valor").value) || 0
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
      tipoGasto: document.getElementById("input-tipo-gasto").value,
      igvCond: document.getElementById("input-igv-cond").value,
      porPagar: document.getElementById("input-por-pagar").value,
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
  document.getElementById("op-description").textContent = op.description || "";
  
  sessionLedgerBlocks = op.blocks.map(b => ({
    title: b.title,
    entries: b.entries.map(e => ({
      code: e.code,
      type: e.type,
      value: e.value,
      helper: e.helper || "",
      isCustom: false,
      codeEdited: false,
      valueEdited: false
    }))
  }));
  
  const ledgerView = document.getElementById("ledger-view");
  ledgerView.innerHTML = "";
  
  let blockIdx = 0;
  for (const block of sessionLedgerBlocks) {
    await renderLedgerBlock(block, ledgerView, blockIdx, op);
    blockIdx++;
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
    
  } else if (op.inputTemplate === "aumento_capital") {
    const total = inputs.total || 0;
    const integrado = (inputs.efectivo || 0) + (inputs.bienes || 0);
    const pendiente = Math.max(0, total - integrado);
    
    label1.textContent = "Acordado";
    sumVal1.textContent = formatter.format(total);
    label2.textContent = "Integrado";
    sumVal2.textContent = formatter.format(integrado);
    label3.textContent = "Pendiente";
    sumVal3.textContent = formatter.format(pendiente);
    sumVal3.style.color = pendiente > 0 ? "var(--haber)" : "var(--primary)";

  } else if (op.inputTemplate === "reserva") {
    const tipo = inputs.tipo;
    let base = 0;
    let calcVal = 0;
    
    if (tipo === "legal") {
      base = inputs.utilidad || 0;
      calcVal = base * 0.10;
    } else if (tipo === "estatutaria") {
      base = inputs.utilidad || 0;
      calcVal = base * ((inputs.porcentaje || 0) / 100);
    } else if (tipo === "facultativa") {
      base = inputs.montoFijo || 0;
      calcVal = base;
    }
    
    label1.textContent = "Utilidad/Base";
    sumVal1.textContent = formatter.format(base);
    label2.textContent = "Detracción";
    sumVal2.textContent = tipo === "legal" ? "10%" : (tipo === "estatutaria" ? `${inputs.porcentaje}%` : "Monto Fijo");
    label3.textContent = "Total Reserva";
    sumVal3.textContent = formatter.format(calcVal);
    sumVal3.style.color = "var(--primary)";

  } else if (op.inputTemplate === "compra_almacenada" || op.inputTemplate === "gastos_servicios") {
    const valor = inputs.valor || 0;
    let igv = 0;
    if (inputs.igvCond === "gravada_credito" || inputs.igvCond === "gravada_sin_credito") {
      igv = valor * 0.18;
    }
    const total = valor + igv;
    
    label1.textContent = "Neto";
    sumVal1.textContent = formatter.format(valor);
    label2.textContent = inputs.igvCond === "no_gravada" ? "IGV (0%)" : "IGV (18%)";
    sumVal2.textContent = formatter.format(igv);
    label3.textContent = "Total";
    sumVal3.textContent = formatter.format(total);
    sumVal3.style.color = "var(--primary)";
    
  } else if (op.inputTemplate === "compra_inmediata" || op.inputTemplate === "compra_ppe") {
    
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
  
  // Si tiene menos caracteres que la plantilla, rellenar con 'x'/'X'
  if (digits.length < templateLength) {
    const isUpper = /[X]/.test(template);
    const charToRepeat = isUpper ? 'X' : 'x';
    return digits + charToRepeat.repeat(templateLength - digits.length);
  }
  
  // Si es igual o mayor longitud, dejar el número tal como está
  return digits;
}

// Función para actualizar la descripción en tiempo real
async function updateRealtimeDescription(code, descSpan) {
  if (!descSpan) return;
  const cleanCode = code.replace(/X/gi, '').trim();
  
  if (cleanCode.length === 0) {
    descSpan.textContent = "—";
    return;
  }
  
  if (cleanCode.length === 1) {
    descSpan.textContent = getElementoName(cleanCode);
    return;
  }
  
  if (accountCache[cleanCode]) {
    descSpan.textContent = accountCache[cleanCode];
    return;
  }
  
  let desc = defaultDescriptions[cleanCode] || defaultDescriptions[cleanCode.toUpperCase()] || defaultDescriptions[cleanCode.toLowerCase()] || "—";
  descSpan.textContent = desc;
  
  if (cleanCode.length >= 2) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/pcge_catalogo?codigo=eq.${cleanCode}&select=descripcion`,
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
          descSpan.textContent = data[0].descripcion;
          accountCache[cleanCode] = data[0].descripcion;
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }
}

// Pintar un bloque de asiento en formato de tabla clásica contable
async function renderLedgerBlock(block, container, blockIdx = 0, op = null) {
  const blockDiv = document.createElement("div");
  blockDiv.className = "ledger-block";
  
  blockDiv.innerHTML = `
    <h4 class="ledger-block-title">${block.title}</h4>
    <div class="ledger-table-wrapper">
      <table class="ledger-table">
        <thead>
          <tr>
            <th style="width: 34%;">CÓDIGO</th>
            <th style="width: 33%;">DEBE</th>
            <th style="width: 33%;">HABER</th>
          </tr>
        </thead>
        <tbody class="ledger-rows-container"></tbody>
      </table>
    </div>
  `;
  
  const rowsContainer = blockDiv.querySelector(".ledger-rows-container");
  
  for (let entryIdx = 0; entryIdx < block.entries.length; entryIdx++) {
    const entry = block.entries[entryIdx];
    const code = entry.code || "";
    const type = entry.type || "debe";
    const displayAmount = entry.value || "XXXX";
    
    // Determinar clase de color según el valor de la plantilla y el tipo
    let cellClass = "val-xxxx";
    const opId = op ? Number(op.id) : 0;
    
    if (displayAmount === "Valor venta" || displayAmount === "Valor venta/n") {
      cellClass = "val-venta";
    } else if (displayAmount === "IGV") {
      cellClass = "val-igv";
    } else if (displayAmount === "Importe Total") {
      cellClass = "val-total";
    } else if (displayAmount === "Rem Bruta" || displayAmount === "Aporte" || displayAmount === "Valor en Libros" || displayAmount === "Depre Acumulada") {
      cellClass = type === "debe" ? "val-xxxx-debe" : "val-xxxx-haber";
    } else if (displayAmount === "AFP") {
      cellClass = "val-xxxx-debe";
    } else if (displayAmount === "ONP" || displayAmount === "Rem Neta" || displayAmount === "IR 5ta categoría" || displayAmount === "Costo Adquisición" || displayAmount === "Tributo") {
      cellClass = "val-xxxx-haber";
    } else if (displayAmount === "XXXX") {
      if (opId === 8 || opId === 9 || opId === 10 || opId === 11 || opId === 13) {
        cellClass = "val-xxxx-debe";
      } else if (opId === 12 || opId === 14) {
        cellClass = "val-xxxx-haber";
      } else {
        cellClass = type === "debe" ? "val-xxxx-debe" : "val-xxxx-haber";
      }
    }
    
    const tr = document.createElement("tr");
    
    if (type === "debe") {
      tr.innerHTML = `
        <td class="code-cell">${code}</td>
        <td class="value-cell ${cellClass}">${displayAmount}</td>
        <td class="value-cell empty-cell"></td>
      `;
    } else {
      tr.innerHTML = `
        <td class="code-cell">${code}</td>
        <td class="value-cell empty-cell"></td>
        <td class="value-cell ${cellClass}">${displayAmount}</td>
      `;
    }
    
    rowsContainer.appendChild(tr);
  }
  
  container.appendChild(blockDiv);
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
  
  if (!acc.nivel) {
    acc.nivel = acc.codigo.length;
  }
  
  document.getElementById("pcge-detail-container").innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 0.85rem; padding-top: 0.25rem;">
      <div class="pcge-detail-badge">${acc.codigo}</div>
      
      <div class="pcge-detail-info">
        <label>Nombre de la Cuenta</label>
        <span style="line-height: 1.3; font-weight: 600;">${acc.descripcion || "—"}</span>
      </div>
      
      <div class="pcge-detail-info">
        <label>Descripción</label>
        <div id="pcge-comentario-view" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; width: 100%;">
          <span id="pcge-detail-comentario" style="line-height: 1.35; flex: 1; font-style: ${acc.comentario ? 'normal' : 'italic'}; color: ${acc.comentario ? 'var(--text-color)' : 'var(--text-muted)'};">${acc.comentario || "Sin descripción. Haz clic en el lápiz para agregar una."}</span>
          <button id="btn-edit-comentario" style="background: none; border: none; cursor: pointer; color: var(--primary); padding: 0.25rem; font-size: 0.95rem; display: flex; align-items: center; justify-content: center;" title="Editar descripción">✏️</button>
        </div>
        <!-- Editor de Comentario -->
        <div id="pcge-comentario-edit" style="display: none; flex-direction: column; gap: 0.5rem; width: 100%; margin-top: 0.25rem;">
          <textarea id="input-edit-comentario" rows="3" style="width: 100%; font-size: 0.85rem; padding: 0.4rem 0.5rem; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-input); color: var(--text-color); font-family: inherit; resize: vertical;" placeholder="Escribe aquí la descripción o dinámica de la cuenta...">${acc.comentario || ''}</textarea>
          <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
            <button id="btn-cancel-edit-comentario" style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted); cursor: pointer; font-weight: 500;">Cancelar</button>
            <button id="btn-save-edit-comentario" style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: none; background: var(--primary); color: white; cursor: pointer; font-weight: 500;">Guardar</button>
          </div>
        </div>
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
  
  // Vincular eventos de edición del comentario
  const btnEdit = document.getElementById("btn-edit-comentario");
  const btnCancel = document.getElementById("btn-cancel-edit-comentario");
  const btnSave = document.getElementById("btn-save-edit-comentario");
  const commentView = document.getElementById("pcge-comentario-view");
  const commentEdit = document.getElementById("pcge-comentario-edit");
  const inputEdit = document.getElementById("input-edit-comentario");
  
  if (btnEdit && btnCancel && btnSave && commentView && commentEdit && inputEdit) {
    btnEdit.addEventListener("click", () => {
      commentView.style.display = "none";
      commentEdit.style.display = "flex";
      inputEdit.focus();
      inputEdit.select();
    });
    
    btnCancel.addEventListener("click", () => {
      commentEdit.style.display = "none";
      commentView.style.display = "flex";
      inputEdit.value = acc.comentario || "";
    });
    
    btnSave.addEventListener("click", async () => {
      const newComment = inputEdit.value.trim();
      
      if (newComment === (acc.comentario || "")) {
        commentEdit.style.display = "none";
        commentView.style.display = "flex";
        return;
      }
      
      try {
        btnSave.disabled = true;
        btnSave.textContent = "Guardando...";
        
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/pcge_catalogo?codigo=eq.${acc.codigo}`,
          {
            method: "PATCH",
            headers: {
              "apikey": SUPABASE_KEY,
              "Authorization": `Bearer ${SUPABASE_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ comentario: newComment || null })
          }
        );
        
        if (response.ok) {
          acc.comentario = newComment;
          
          const labelEl = document.getElementById("pcge-detail-comentario");
          if (newComment) {
            labelEl.textContent = newComment;
            labelEl.style.fontStyle = "normal";
            labelEl.style.color = "var(--text-color)";
          } else {
            labelEl.textContent = "Sin descripción. Haz clic en el lápiz para agregar una.";
            labelEl.style.fontStyle = "italic";
            labelEl.style.color = "var(--text-muted)";
          }
          
          showToast("Descripción guardada con éxito", "success");
          
          commentEdit.style.display = "none";
          commentView.style.display = "flex";
        } else {
          showToast("Error al guardar en base de datos", "error");
          btnSave.disabled = false;
          btnSave.textContent = "Guardar";
        }
      } catch (err) {
        console.error("Error al actualizar comentario:", err);
        showToast("Error de conexión", "error");
        btnSave.disabled = false;
        btnSave.textContent = "Guardar";
      }
    });
  }
  
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

// MODULO ELIMINADO: TRIBUTACION

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
  // 1. Navegación interna del Hub de Lógica
  document.querySelectorAll(".logica-hub-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const panelId = btn.dataset.logicaPanel;
      showLogicaPanel(panelId);
    });
  });

  document.querySelectorAll(".btn-back-to-logica-hub").forEach(btn => {
    btn.addEventListener("click", () => {
      showLogicaPanel("panel-logica-hub");
    });
  });

  // 2. Operaciones del Generador de Tablas de Verdad (Semana 3)
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

  // 3. Inicializar Quizzes de las Semanas
  initWeekQuizzes();

  // 4. Inicializar Consulta de Calificaciones
  initGradeLookupModule();

  // 5. Desafíos Lógicos (Semana 8)
  setupChallenges();
}

// Resetea los quizzes a su estado inicial
function resetQuizzes() {
  document.querySelectorAll(".quiz-card").forEach(quiz => {
    const feedback = quiz.querySelector(".quiz-feedback");
    if (feedback) {
      feedback.style.display = "none";
      feedback.textContent = "";
      feedback.className = "quiz-feedback";
    }
    quiz.querySelectorAll(".quiz-option-btn").forEach(btn => {
      btn.disabled = false;
      btn.classList.remove("correct", "incorrect");
    });
  });
}

// Inicializa la interactividad de los quizzes semanales
function initWeekQuizzes() {
  document.querySelectorAll(".quiz-card").forEach(quiz => {
    const feedback = quiz.querySelector(".quiz-feedback");
    if (!feedback) return;
    
    quiz.querySelectorAll(".quiz-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        // Deshabilitar todas las opciones de este quiz
        quiz.querySelectorAll(".quiz-option-btn").forEach(b => b.disabled = true);
        
        const isCorrect = btn.dataset.correct === "true";
        if (isCorrect) {
          btn.classList.add("correct");
          feedback.textContent = "¡Excelente! Respuesta correcta. 🎯";
          feedback.className = "quiz-feedback correct";
          feedback.style.background = "var(--primary-light)";
          feedback.style.color = "var(--primary-hover)";
        } else {
          btn.classList.add("incorrect");
          feedback.textContent = "Respuesta incorrecta. ¡Sigue repasando la teoría!";
          feedback.className = "quiz-feedback incorrect";
          feedback.style.background = "var(--haber-light)";
          feedback.style.color = "var(--haber)";
          
          // Resaltar la respuesta correcta
          quiz.querySelectorAll(".quiz-option-btn").forEach(b => {
            if (b.dataset.correct === "true") {
              b.classList.add("correct");
            }
          });
        }
        feedback.style.display = "block";
      });
    });
  });
}

// Base de datos de calificaciones de Pensamiento Lógico (transcrita de los registros de Excel)
const studentGradesData = [
  { dni: "71336870", name: "POLLETHE LUCIA", lastname: "ARENAS KALINOWSKI", team: "1", aa1: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:3, r2_2:2, r3_2:10, r4_2:5, exposicion:20, promedio:20 }, aa2: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:2, r2_2:2, r3_2:8, r4_2:5, exposicion:17, promedio:18.5 } },
  { dni: "79543944", name: "ESTEBAN JOSUE", lastname: "COPAJA AQUINO", team: "2", aa1: { r1_1:0, r2_1:0, r3_1:0, r4_1:0, r5_1:1, informe:1, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:1 }, aa2: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:2, informe:18, r1_2:1, r2_2:2, r3_2:7, r4_2:4, exposicion:14, promedio:16 } },
  { dni: "75971521", name: "GIAN FRANCO", lastname: "GOMEZ MAYTA", team: "??", aa1: { r1_1:0, r2_1:0, r3_1:0, r4_1:0, r5_1:1, informe:1, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:1 }, aa2: { r1_1:0, r2_1:0, r3_1:0, r4_1:0, r5_1:1, informe:1, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:1 } },
  { dni: "60967749", name: "NOEMI IDALIA", lastname: "GOMEZ PUMA", team: "??", aa1: { r1_1:0, r2_1:0, r3_1:0, r4_1:0, r5_1:1, informe:1, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:1 }, aa2: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:1, r2_2:2, r3_2:6, r4_2:3, exposicion:12, promedio:16 } },
  { dni: "72613030", name: "MARIA JULIA", lastname: "HUISACAYNA COLQUE", team: "1", aa1: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:3, r2_2:2, r3_2:10, r4_2:5, exposicion:20, promedio:20 }, aa2: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:1, r2_2:2, r3_2:6, r4_2:3, exposicion:12, promedio:16 } },
  { dni: "61598208", name: "JIMMY NANDOR", lastname: "JUSTO QUISPE", team: "1", aa1: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:3, r2_2:2, r3_2:10, r4_2:5, exposicion:20, promedio:20 }, aa2: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:2, r2_2:2, r3_2:8, r4_2:5, exposicion:17, promedio:18.5 } },
  { dni: "76075806", name: "ELY ROCÍO", lastname: "MARTINEZ CCORPUNA", team: "2", aa1: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:1, r2_2:2, r3_2:7, r4_2:4, exposicion:14, promedio:17 }, aa2: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:3, informe:19, r1_2:1, r2_2:2, r3_2:7, r4_2:4, exposicion:14, promedio:16.5 } },
  { dni: "72086042", name: "KATTY DAYANA", lastname: "MIRANDA SUAQUITA", team: "1", aa1: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:3, r2_2:2, r3_2:10, r4_2:5, exposicion:20, promedio:20 }, aa2: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:2, r2_2:2, r3_2:8, r4_2:5, exposicion:17, promedio:18.5 } },
  { dni: "60732185", name: "JORGE DAVID", lastname: "MOLINA ALVARADO", team: "2", aa1: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:1, r2_2:2, r3_2:7, r4_2:4, exposicion:14, promedio:17 }, aa2: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:3, informe:19, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:10 } },
  { dni: "62351533", name: "SEBASTIAN ERNESTO", lastname: "ORCONI GUTIERREZ", team: "??", aa1: { r1_1:0, r2_1:0, r3_1:0, r4_1:0, r5_1:1, informe:1, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:1 }, aa2: { r1_1:0, r2_1:0, r3_1:0, r4_1:0, r5_1:1, informe:1, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:1 } },
  { dni: "60058856", name: "FRANCO LARRY", lastname: "QUISPE LINARES", team: "??", aa1: { r1_1:0, r2_1:0, r3_1:0, r4_1:0, r5_1:1, informe:1, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:1 }, aa2: { r1_1:0, r2_1:0, r3_1:0, r4_1:0, r5_1:1, informe:1, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:1 } },
  { dni: "61366491", name: "NAHOMI SELENE", lastname: "ROMAN QUISPE", team: "2", aa1: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:1, r2_2:2, r3_2:7, r4_2:4, exposicion:14, promedio:17 }, aa2: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:3, informe:19, r1_2:1, r2_2:2, r3_2:7, r4_2:4, exposicion:14, promedio:16.5 } },
  { dni: "61236333", name: "ROCIO XIMENA", lastname: "SALDIVAR TORRES", team: "2", aa1: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:1, r2_2:2, r3_2:7, r4_2:4, exposicion:14, promedio:17 }, aa2: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:3, informe:19, r1_2:1, r2_2:2, r3_2:7, r4_2:4, exposicion:14, promedio:16.5 } },
  { dni: "61324266", name: "FABRICIO ANDERSON", lastname: "SALLUCA SUERO", team: "??", aa1: { r1_1:0, r2_1:0, r3_1:0, r4_1:0, r5_1:1, informe:1, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:1 }, aa2: { r1_1:0, r2_1:0, r3_1:0, r4_1:0, r5_1:1, informe:1, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:1 } },
  { dni: "61413843", name: "MIJAHIL FRANCESCO", lastname: "VEGA HUAMAN", team: "2", aa1: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:4, informe:20, r1_2:1, r2_2:2, r3_2:7, r4_2:4, exposicion:14, promedio:17 }, aa2: { r1_1:4, r2_1:4, r3_1:4, r4_1:4, r5_1:2, informe:18, r1_2:1, r2_2:2, r3_2:7, r4_2:4, exposicion:14, promedio:16 } },
  { dni: "60044657", name: "CINTYA MEILY", lastname: "YRUPAYLLA QUISPE", team: "??", aa1: { r1_1:0, r2_1:0, r3_1:0, r4_1:0, r5_1:1, informe:1, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:1 }, aa2: { r1_1:0, r2_1:0, r3_1:0, r4_1:0, r5_1:1, informe:1, r1_2:0, r2_2:0, r3_2:0, r4_2:1, exposicion:1, promedio:1 } }
];

// Inicializa el Módulo de Consulta de Calificaciones por DNI
function initGradeLookupModule() {
  const btnSearch = document.getElementById("btn-search-dni");
  const dniInput = document.getElementById("dni-lookup");
  const resultsCard = document.getElementById("grade-results-card");
  const singleView = document.getElementById("single-student-view");
  const masterView = document.getElementById("master-students-view");
  const btnBackToMaster = document.getElementById("btn-back-to-master-list");
  const masterSearchInput = document.getElementById("master-search-input");
  
  if (btnSearch && dniInput && resultsCard) {
    btnSearch.addEventListener("click", () => {
      performLookup();
    });
    
    dniInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        performLookup();
      }
    });

    btnBackToMaster.addEventListener("click", () => {
      singleView.style.display = "none";
      masterView.style.display = "flex";
      btnBackToMaster.style.display = "none";
    });

    masterSearchInput.addEventListener("input", () => {
      filterMasterList(masterSearchInput.value.trim());
    });
  }

  function performLookup() {
    const dni = dniInput.value.trim();
    if (!dni) {
      showToast("Por favor, ingresa un DNI.", "error");
      return;
    }

    if (dni === "46069339") {
      // MODO MÁSTER: Mostrar lista de todos los estudiantes
      showToast("Acceso de Administrador Máster concedido.");
      resultsCard.style.display = "flex";
      singleView.style.display = "none";
      masterView.style.display = "flex";
      btnBackToMaster.style.display = "none";
      
      renderMasterList();
    } else {
      // MODO ESTUDIANTE INDIVIDUAL
      const student = studentGradesData.find(s => s.dni === dni);
      if (!student) {
        showToast("DNI no registrado. Intenta nuevamente.", "error");
        resultsCard.style.display = "none";
        return;
      }
      
      resultsCard.style.display = "flex";
      masterView.style.display = "none";
      singleView.style.display = "flex";
      btnBackToMaster.style.display = "none"; // Ocultar porque no viene del máster
      
      populateStudentDetails(student);
      showToast("Calificaciones cargadas correctamente.");
    }
  }

  function populateStudentDetails(student) {
    document.getElementById("student-fullname").textContent = `${student.name} ${student.lastname}`;
    document.getElementById("student-dni").textContent = student.dni;
    document.getElementById("student-team").textContent = student.team;
    
    const promAA1 = student.aa1.promedio;
    const promAA2 = student.aa2.promedio;
    
    // CF es "Por calificar"
    const finalEl = document.getElementById("final-course-average");
    finalEl.textContent = "Por calificar";
    finalEl.style.color = "var(--text-muted)";
    finalEl.style.fontSize = "0.95rem";
    finalEl.style.fontWeight = "700";
    
    // AA1
    const aa1Badge = document.getElementById("promedio-aa1-badge");
    aa1Badge.textContent = `Prm: ${promAA1}`;
    if (promAA1 >= 13) {
      aa1Badge.style.background = "var(--debe-light)";
      aa1Badge.style.color = "var(--debe)";
    } else {
      aa1Badge.style.background = "var(--haber-light)";
      aa1Badge.style.color = "var(--haber)";
    }
    
    document.getElementById("informe-aa1-val").textContent = student.aa1.informe;
    document.getElementById("r11-val").textContent = student.aa1.r1_1 || "0";
    document.getElementById("r21-val").textContent = student.aa1.r2_1 || "0";
    document.getElementById("r31-val").textContent = student.aa1.r3_1 || "0";
    document.getElementById("r41-val").textContent = student.aa1.r4_1 || "0";
    document.getElementById("r51-val").textContent = student.aa1.r5_1 || "0";
    document.getElementById("exposicion-aa1-val").textContent = student.aa1.exposicion;
    document.getElementById("r12_1-val").textContent = student.aa1.r1_2 || "0";
    document.getElementById("r22_1-val").textContent = student.aa1.r2_2 || "0";
    document.getElementById("r32_1-val").textContent = student.aa1.r3_2 || "0";
    document.getElementById("r42_1-val").textContent = student.aa1.r4_2 || "0";
    
    // AA2
    const aa2Badge = document.getElementById("promedio-aa2-badge");
    aa2Badge.textContent = `Prm: ${promAA2}`;
    if (promAA2 >= 13) {
      aa2Badge.style.background = "var(--debe-light)";
      aa2Badge.style.color = "var(--debe)";
    } else {
      aa2Badge.style.background = "var(--haber-light)";
      aa2Badge.style.color = "var(--haber)";
    }
    
    document.getElementById("informe-aa2-val").textContent = student.aa2.informe;
    document.getElementById("r11_2-val").textContent = student.aa2.r1_1 || "0";
    document.getElementById("r21_2-val").textContent = student.aa2.r2_1 || "0";
    document.getElementById("r31_2-val").textContent = student.aa2.r3_1 || "0";
    document.getElementById("r41_2-val").textContent = student.aa2.r4_1 || "0";
    document.getElementById("r52_2-val").textContent = student.aa2.r5_1 || "0";
    
    document.getElementById("exposicion-aa2-val").textContent = student.aa2.exposicion;
    document.getElementById("r12_2-val").textContent = student.aa2.r1_2 || "0";
    document.getElementById("r22_2-val").textContent = student.aa2.r2_2 || "0";
    document.getElementById("r32_2-val").textContent = student.aa2.r3_2 || "0";
    document.getElementById("r42_2-val").textContent = student.aa2.r4_2 || "0";
    
    // AA3 (Por calificar)
    const aa3Badge = document.getElementById("promedio-aa3-badge");
    aa3Badge.textContent = "Pnd.";
    aa3Badge.style.background = "var(--border)";
    aa3Badge.style.color = "var(--text-muted)";
    document.getElementById("promedio-aa3-val").textContent = "Por calificar";
    document.getElementById("promedio-aa3-val").style.color = "var(--text-muted)";
    
    // E4 (Por calificar)
    const e4Badge = document.getElementById("promedio-e4-badge");
    e4Badge.textContent = "Pnd.";
    e4Badge.style.background = "var(--border)";
    e4Badge.style.color = "var(--text-muted)";
    
    document.getElementById("promedio-e4-val").textContent = "Por calificar";
    document.getElementById("promedio-e4-val").style.color = "var(--text-muted)";
    document.getElementById("aa4-val").textContent = "Por calificar";
    document.getElementById("pa-val").textContent = "Por calificar";
  }

  function renderMasterList() {
    const listBody = document.getElementById("master-students-list-body");
    if (!listBody) return;
    
    listBody.innerHTML = "";
    
    studentGradesData.forEach(student => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--border)";
      tr.dataset.studentName = `${student.name} ${student.lastname}`.toLowerCase();
      tr.dataset.studentDni = student.dni;
      
      tr.innerHTML = `
        <td style="padding: 0.5rem 0.4rem; font-weight: 700; color: var(--text-main);">${student.name} ${student.lastname}</td>
        <td style="padding: 0.5rem 0.4rem; text-align: center; color: var(--text-muted);">${student.dni}</td>
        <td style="padding: 0.5rem 0.4rem; text-align: center; font-weight: 700;">${student.aa1.promedio}</td>
        <td style="padding: 0.5rem 0.4rem; text-align: center; font-weight: 700;">${student.aa2.promedio}</td>
        <td style="padding: 0.5rem 0.4rem; text-align: center; font-weight: 600; color: var(--text-muted); font-size: 0.65rem;">Por calificar</td>
        <td style="padding: 0.5rem 0.4rem; text-align: center;">
          <button class="btn-primary btn-inspect-student" data-dni="${student.dni}" style="font-size: 0.65rem; padding: 0.15rem 0.45rem;">Ver</button>
        </td>
      `;
      
      tr.querySelector(".btn-inspect-student").addEventListener("click", () => {
        const targetStudent = studentGradesData.find(s => s.dni === student.dni);
        if (targetStudent) {
          masterView.style.display = "none";
          singleView.style.display = "flex";
          btnBackToMaster.style.display = "block";
          populateStudentDetails(targetStudent);
        }
      });
      
      listBody.appendChild(tr);
    });
  }

  function filterMasterList(query) {
    const listBody = document.getElementById("master-students-list-body");
    if (!listBody) return;
    
    const rows = listBody.querySelectorAll("tr");
    const q = query.toLowerCase();
    
    rows.forEach(row => {
      const name = row.dataset.studentName;
      const dni = row.dataset.studentDni;
      if (name.includes(q) || dni.includes(q)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

// MODULO ELIMINADO: SISTEMAS CONTABLES
