/**
 * datos-vehiculos.js
 * --------------------------------------------------------------
 * Configuración de la flota: un vehículo = un icono/nombre + un set de
 * datos por defecto (mantenimientos, gastos futuros...) + su propio
 * contenido de masterclass. app.js NO conoce los modelos concretos: solo
 * lee de aquí, así que añadir un tercer vehículo en el futuro es tocar
 * solo este archivo.
 *
 * OJO Peugeot 206 (p206): las tareas de mantenimiento de abajo son
 * GENÉRICAS para un 206 de gasolina de finales de los 90 — están
 * marcadas con "(genérico, revisar con ficha técnica)" porque Jony
 * todavía no ha confirmado la motorización exacta (1.1, 1.4, 1.6...).
 * En cuanto la tenga, lo normal es editar estas tareas directamente
 * desde la propia app (botón "+ Añadir tarea" / editar), no hace falta
 * tocar código para eso.
 */

const VEHICULOS = [
  {
    id: 'z750',
    tipo: 'moto',
    nombre: 'Kawasaki Z750',
    subtitulo: 'Naked · 748cc',
    icono: '🏍️',
    datosDefecto: {
      vehiculo: {
        modelo: 'Kawasaki Z750 Naked',
        kilometrosActuales: 0,
        fechaUltimaRevision: new Date().toISOString().split('T')[0],
        fechaCompra: new Date().toISOString().split('T')[0],
        garantiaAnios: 0,
        combustibleRecomendado: '95 octanos (sin plomo)',
        kmSemanalManual: 100,
        antelacionTallerDias: 21,
        ultimaActualizacion: new Date().toISOString().split('T')[0]
      },
      mantenimientos: [
        {
          id: 'z750_mant_01',
          titulo: 'Cambio de aceite y filtro',
          kmObjetivo: 6000,
          mesesMaximo: 12,
          completado: false,
          costeEstimado: 90,
          taller: 'Mecánico de confianza',
          tareas: ['Aceite motor 10W-40 semisintético/sintético', 'Filtro de aceite', 'Revisión de niveles (freno, refrigerante)']
        },
        {
          id: 'z750_mant_02',
          titulo: 'Revisión de cadena y kit de transmisión',
          kmObjetivo: 12000,
          mesesMaximo: 12,
          completado: false,
          costeEstimado: 150,
          taller: 'Mecánico de confianza',
          tareas: ['Estado de piñón y corona', 'Tensado de cadena', 'Sustituir kit de transmisión si procede']
        },
        {
          id: 'z750_mant_03',
          titulo: 'Ajuste de holgura de válvulas',
          kmObjetivo: 24000,
          mesesMaximo: 36,
          completado: false,
          costeEstimado: 180,
          taller: 'Taller especializado Kawasaki',
          tareas: ['Medición de holguras (shim under bucket)', 'Ajuste con pastillas si es necesario', 'Revisión de bujías']
        },
        {
          id: 'z750_mant_04',
          titulo: 'Líquido de frenos y neumáticos',
          kmObjetivo: 10000,
          mesesMaximo: 24,
          completado: false,
          costeEstimado: 130,
          taller: 'Mecánico de confianza',
          tareas: ['Líquido de frenos DOT4', 'Estado y presión de neumáticos', 'Pastillas de freno delante/detrás']
        }
      ],
      repostajes: [],
      gastosFuturos: [
        { id: 'z750_gasto_seguro', concepto: 'Seguro de la moto', montoEstimado: 180, tipo: 'anual', fechaBase: new Date().toISOString().split('T')[0] },
        { id: 'z750_gasto_neumaticos', concepto: 'Neumáticos (delante + detrás)', montoEstimado: 220, tipo: 'km', kmObjetivo: 12000 }
      ],
      incidencias: []
    }
  },
  {
    id: 'p206',
    tipo: 'coche',
    nombre: 'Peugeot 206',
    subtitulo: '1999 · pendiente de ficha técnica',
    icono: '🚗',
    datosDefecto: {
      vehiculo: {
        modelo: 'Peugeot 206 (1999)',
        kilometrosActuales: 0,
        fechaUltimaRevision: new Date().toISOString().split('T')[0],
        fechaCompra: new Date().toISOString().split('T')[0],
        garantiaAnios: 0,
        combustibleRecomendado: 'Sin plomo 95 (confirmar según motorización)',
        kmSemanalManual: 150,
        antelacionTallerDias: 21,
        ultimaActualizacion: new Date().toISOString().split('T')[0]
      },
      mantenimientos: [
        {
          id: 'p206_mant_01',
          titulo: 'Cambio de aceite y filtro (genérico, revisar con ficha técnica)',
          kmObjetivo: 10000,
          mesesMaximo: 12,
          completado: false,
          costeEstimado: 70,
          taller: 'Mecánico de confianza',
          tareas: ['Aceite motor (viscosidad según manual)', 'Filtro de aceite', 'Filtro de aire']
        },
        {
          id: 'p206_mant_02',
          titulo: 'Correa de distribución (genérico — CRÍTICO, confirmar intervalo exacto)',
          kmObjetivo: 80000,
          mesesMaximo: 60,
          completado: false,
          costeEstimado: 350,
          taller: 'Taller especializado',
          tareas: [
            'Confirmar si el motor es interferencial (rotura de correa = válvulas dobladas)',
            'Sustituir correa + tensores + bomba de agua',
            'Confirmar intervalo real km/años según motorización exacta'
          ]
        },
        {
          id: 'p206_mant_03',
          titulo: 'Frenos, batería y neumáticos',
          kmObjetivo: 20000,
          mesesMaximo: 24,
          completado: false,
          costeEstimado: 200,
          taller: 'Mecánico de confianza',
          tareas: ['Pastillas y discos de freno', 'Estado de la batería', 'Presión y desgaste de neumáticos']
        }
      ],
      repostajes: [],
      gastosFuturos: [
        { id: 'p206_gasto_seguro', concepto: 'Seguro del coche', montoEstimado: 350, tipo: 'anual', fechaBase: new Date().toISOString().split('T')[0] },
        { id: 'p206_gasto_itv', concepto: 'ITV (confirmar periodicidad exacta según antigüedad)', montoEstimado: 40, tipo: 'anual', fechaBase: new Date().toISOString().split('T')[0] }
      ],
      incidencias: [
        { id: 'p206_inc_1', titulo: 'Pendiente de ficha técnica', descripcion: 'Faltan por confirmar: motorización exacta, cilindrada, combustible e intervalo real de correa de distribución. Las tareas de mantenimiento de esta lista son genéricas hasta entonces.', fecha: new Date().toISOString().split('T')[0] }
      ]
    }
  }
];

// --- Masterclass: contenido educativo, uno por vehículo ---
const MASTERCLASS = {
  z750: {
    nota: 'Guías generales de mantenimiento para una naked de 4 cilindros. Confirmar siempre con el manual del propietario.',
    temas: [
      {
        id: 'z750_cadena',
        titulo: 'Tensado y lubricación de la cadena',
        sub: 'La tarea de mantenimiento más frecuente de una naked',
        pasos: [
          'Coloca la moto en el caballete central o de rueda trasera, con la cadena en el punto de menos tensión (girando la rueda a mano).',
          'Comprueba la holgura vertical en el punto medio de la cadena: normalmente entre 25-35 mm, confirmar valor exacto en el manual.',
          'Si hay que tensar, afloja la tuerca del eje trasero y ajusta los tensores de ambos lados por igual, comprobando la alineación con las marcas de la basculante.',
          'Lubrica con la rueda girando, aplicando en la parte interior de la cadena para que la grasa se reparta con el movimiento.'
        ],
        nota: 'Una cadena floja desgasta piñón y corona antes de tiempo; una demasiado tensa fuerza el cojinete de salida de caja de cambios.'
      },
      {
        id: 'z750_valvulas',
        titulo: 'Por qué importa la holgura de válvulas',
        sub: 'Revisión programada, no algo que se note "hasta que falla"',
        pasos: [
          'Las válvulas se dilatan con el calor del motor; la holgura en frío compensa esa dilatación.',
          'Con el tiempo, el desgaste cambia esa holgura — demasiado ajustada puede quemar la válvula; demasiado floja da ruido y pérdida de rendimiento.',
          'Es una tarea de taller especializado (requiere desmontar tapa de válvulas y medir con galgas), no de mantenimiento casero habitual.'
        ],
        nota: 'Si notas más ruido metálico del habitual en el motor en frío, es buena señal de que toca revisarlo antes del kilometraje programado.'
      },
      {
        id: 'z750_neumaticos',
        titulo: 'Presión de neumáticos: por qué revisarla en frío',
        sub: 'El dato que más gente olvida y más rendimiento/seguridad cambia',
        pasos: [
          'Revisa la presión con los neumáticos fríos (moto parada al menos un par de horas o antes de rodar), el aire caliente da una lectura falsa más alta.',
          'Usa los valores de la pegatina del basculante o manual, no un valor genérico — delantera y trasera suelen llevar presiones distintas.',
          'Revisa también el desgaste: si el dibujo central está más gastado que los laterales, vas con exceso de presión; si es al revés, con defecto.'
        ],
        nota: 'Confirma los valores exactos de presión con la pegatina de la propia moto — varían según el neumático montado.'
      }
    ]
  },
  p206: {
    nota: 'Contenido genérico para un utilitario de gasolina de finales de los 90 — hay puntos marcados como "confirmar" que dependen de la motorización exacta del coche.',
    temas: [
      {
        id: 'p206_correa',
        titulo: 'Correa de distribución: el gasto que no se puede saltar',
        sub: 'El punto más crítico de un coche de esta edad',
        pasos: [
          'Confirma si el motor es "interferencial" (los pistones y las válvulas comparten espacio) — si lo es, una rotura de correa dobla válvulas y puede destrozar el motor.',
          'Revisa la documentación del coche (facturas de taller anteriores) para saber cuándo se cambió la correa por última vez, si se sabe.',
          'Si no hay constancia de cuándo se cambió, trátala como si estuviera al límite: es mucho más barato cambiarla "antes de tiempo" que arriesgarse.',
          'Al cambiarla, sustituye también tensores y, si aplica, la bomba de agua — es el mismo desmontaje, así que hacerlo por separado más adelante cuesta el doble en mano de obra.'
        ],
        nota: 'Esta tarea en el planificador está marcada como "genérico, confirmar intervalo exacto" hasta tener la ficha técnica del motor concreto.'
      },
      {
        id: 'p206_aceite',
        titulo: 'Aceite y filtro: la base de todo lo demás',
        sub: 'Mantenimiento simple, pero el que más protege el motor',
        pasos: [
          'Usa la viscosidad recomendada por el fabricante para el motor exacto (varía entre gasolina/diésel y por año), no un valor genérico.',
          'Cambia también el filtro de aceite en cada cambio, nunca solo el aceite.',
          'Revisa el nivel con el coche en llano y el motor frío (o apagado al menos 10 minutos), usando la varilla.'
        ],
        nota: 'Un coche que se usa poco (pocos km/año) también necesita cambios de aceite por tiempo, no solo por kilometraje — el aceite se degrada igualmente.'
      },
      {
        id: 'p206_itv',
        titulo: 'Qué revisa la ITV y cómo llegar preparado',
        sub: 'Evitar un "desfavorable" por algo evitable',
        pasos: [
          'Luces: todas las posiciones, cruce, carretera, intermitentes y freno funcionando y bien alineadas.',
          'Neumáticos: profundidad de dibujo mínima legal y sin daños visibles en el flanco.',
          'Frenos y emisiones: revisar antes de ir si el coche tiene algún síntoma (humo, ruido, vibración al frenar).',
          'Documentación: permiso de circulación y ficha técnica (o su equivalente electrónico) al día.'
        ],
        nota: 'La periodicidad exacta de la ITV depende de la antigüedad del vehículo — confirmar la que corresponde a este 206 en concreto.'
      }
    ]
  }
};
