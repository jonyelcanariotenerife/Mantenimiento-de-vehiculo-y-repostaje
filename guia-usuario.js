/**
 * guia-usuario.js
 * --------------------------------------------------------------
 * Contenido de la Guía de Usuario (botón "?" flotante). Separado de
 * app.js por lo mismo que datos-vehiculos.js: es contenido editable sin
 * tocar lógica, y así queda claro qué tocar si en el futuro cambia algo
 * de cómo funciona la app.
 */

const GUIA_TABS = [
  { id: 'vehiculos', label: 'Vehículos', icon: '🚙' },
  { id: 'mantenimiento', label: 'Mantenimiento', icon: '🔧' },
  { id: 'consumo', label: 'Consumo', icon: '⛽' },
  { id: 'bitacora', label: 'Bitácora', icon: '📓' },
  { id: 'ahorro', label: 'Ahorro', icon: '💰' },
  { id: 'masterclass', label: 'Masterclass', icon: '🎓' },
  { id: 'backup', label: 'Backup', icon: '📁' }
];

const GUIA_CONTENIDO = {
  vehiculos: `
    <h4 class="text-white font-black text-base">Cambiar de vehículo</h4>
    <p>Arriba del todo tienes las pestañas de tus vehículos (🏍️ Kawasaki Z750 / 🚗 Peugeot 206). Toca una para cambiar.</p>
    <p><span class="text-white font-bold">Datos totalmente separados:</span> cada vehículo guarda su propio kilometraje, mantenimientos, repostajes, bitácora y fondo de ahorro. Cambiar de pestaña nunca mezcla datos de uno con el otro — es como tener dos apps independientes dentro de la misma.</p>
    <p>El odómetro y la fecha de última revisión de la cabecera son siempre del vehículo que tengas activo en ese momento.</p>
  `,
  mantenimiento: `
    <h4 class="text-white font-black text-base">Planificador de mantenimiento</h4>
    <p>Cada tarea tiene un <span class="text-white font-bold">km objetivo</span> y un <span class="text-white font-bold">límite en meses</span>. La app avisa por lo que llegue antes.</p>
    <p><span class="text-white font-bold">Colores del estado:</span> verde con "Faltan X km" mientras queda margen; rojo "¡Toca ya!" en cuanto el odómetro alcanza o supera el objetivo; gris apagado cuando marcas la tarea como completada con el checkbox.</p>
    <p><span class="text-white font-bold">Añadir una tarea:</span> botón "+ Añadir tarea" — título, km objetivo, meses máximo, coste estimado y taller son opcionales salvo el título y el km. Las "Tareas" (una por línea) son el detalle de lo que incluye la revisión.</p>
    <p>El gráfico de arriba muestra el % de progreso de tu odómetro hacia cada objetivo — mismo código de color que las tarjetas.</p>
  `,
  consumo: `
    <h4 class="text-white font-black text-base">Repostajes y consumo real</h4>
    <p>Botón "⛽ Registrar repostaje": litros, precio total, kilómetros del odómetro en ese momento, y si fue un <span class="text-white font-bold">llenado completo</span> o parcial.</p>
    <p><span class="text-white font-bold">Por qué importa "llenado completo":</span> el consumo en L/100km solo se calcula entre dos llenados completos consecutivos — un repostaje parcial (por ejemplo, echar 10€ sin llenar el depósito) no sirve para ese cálculo, aunque sí cuenta para el gasto total en euros.</p>
    <p><span class="text-white font-bold">Las 3 estadísticas:</span> "Gasto total" suma todos los repostajes; "€/km" divide ese gasto entre los km recorridos entre el primer y el último repostaje; "€/mes" lo reparte entre los meses transcurridos desde el primer repostaje registrado.</p>
  `,
  bitacora: `
    <h4 class="text-white font-black text-base">Bitácora de taller e incidencias</h4>
    <p>Son notas libres — cualquier cosa que quieras dejar anotada sobre el vehículo: qué se hizo en una visita al taller, un ruido raro que notaste, una pieza que cambiaste tú mismo...</p>
    <p>Botón "+ Nota": un título corto y, si quieres, una descripción más larga. Se guarda con la fecha de hoy.</p>
    <p>Cada nota tiene su propio botón "Eliminar" para borrarla cuando ya no la necesites.</p>
  `,
  ahorro: `
    <h4 class="text-white font-black text-base">Fondo de ahorro / previsión de gastos</h4>
    <p>Esta sección junta dos cosas en una sola lista: las tareas de mantenimiento con coste estimado (automáticamente) y los gastos futuros que añadas a mano.</p>
    <p><span class="text-white font-bold">Gasto "único por kilometraje":</span> para algo que pasará una vez al llegar a cierto km (neumáticos, pastillas...). <span class="text-white font-bold">Gasto "anual":</span> para lo que se repite cada año (seguro, ITV...).</p>
    <p><span class="text-white font-bold">Cuota mensual:</span> la app reparte el monto entre los meses que calcula que faltan para esa fecha/kilometraje, usando tu ritmo real de uso (a partir de tus repostajes) o tu estimación manual de km/semana si aún no tienes suficientes repostajes. El total de abajo del todo es lo que te conviene apartar cada mes entre todos los conceptos.</p>
  `,
  masterclass: `
    <h4 class="text-white font-black text-base">Masterclass de mantenimiento</h4>
    <p>Guías paso a paso específicas de <span class="text-white font-bold">cada vehículo</span> — cambian según la pestaña que tengas activa arriba. Toca cualquier tema de la lista para abrir la guía completa.</p>
    <p><span class="text-white font-bold">Kawasaki Z750:</span> tensado y lubricación de cadena, por qué importa la holgura de válvulas, presión de neumáticos.</p>
    <p><span class="text-white font-bold">Peugeot 206:</span> correa de distribución, aceite y filtro, qué revisa la ITV. ⚠️ Este contenido está marcado como genérico hasta confirmar la ficha técnica exacta del motor — los pasos generales siguen siendo válidos, pero los intervalos concretos hay que confirmarlos.</p>
  `,
  backup: `
    <h4 class="text-white font-black text-base">Copia de seguridad</h4>
    <p><span class="text-white font-bold">Todo es local:</span> los datos viven en este dispositivo (no hay servidor ni nube). Si desinstalas la app o borras sus datos, se pierde lo que no hayas exportado.</p>
    <p><span class="text-white font-bold">Exportar:</span> botón "Exportar" de la cabecera — descarga un JSON con todos los datos del vehículo que tengas activo en ese momento (mantenimientos, repostajes, bitácora, gastos futuros).</p>
    <p><span class="text-white font-bold">Restaurar:</span> icono 📁 junto al de exportar — selecciona un JSON exportado antes y sustituye los datos del vehículo activo por los del archivo.</p>
    <p>Como el backup es por vehículo, si quieres respaldar tanto la moto como el coche tienes que exportar uno, cambiar de pestaña y exportar el otro.</p>
  `
};
