cat > /home/claude/prestamos-api/controllers/prestamo.controller.js << 'EOF'
'use strict';
const Prestamo = require('../models/prestamo.model');
const ESTADOS_VALIDOS = ['pendiente', 'pagado', 'vencido'];

const crearPrestamo = async (req, res) => {
  try {
    const { prestatario, monto, tasa_interes, meses, fecha_prestamo } = req.body;
    if (!prestatario?.trim()) return res.status(400).json({ error: '"prestatario" es obligatorio.' });
    if (!monto || Number(monto) <= 0) return res.status(400).json({ error: '"monto" debe ser mayor a 0.' });
    if (tasa_interes === undefined || Number(tasa_interes) < 0) return res.status(400).json({ error: '"tasa_interes" debe ser >= 0.' });
    if (!meses || Number(meses) <= 0) return res.status(400).json({ error: '"meses" debe ser mayor a 0.' });
    const { prestatario, monto, tasa_interes, meses, cuotas_por_mes, fecha_prestamo } = req.body
// ...
const { id, total_devolver } = await Prestamo.crear({
  prestatario: prestatario.trim(), monto: Number(monto),
  tasa_interes: Number(tasa_interes), meses: Number(meses),
  cuotas_por_mes: Number(cuotas_por_mes) || 1,
  fecha_prestamo: fecha,
})
    const fecha = fecha_prestamo ? String(fecha_prestamo).slice(0, 10) : new Date().toLocaleDateString('en-CA');
    const { id, total_devolver } = await Prestamo.crear({
      prestatario: prestatario.trim(), monto: Number(monto),
      tasa_interes: Number(tasa_interes), meses: Number(meses), fecha_prestamo: fecha,
    });
    const crear = async ({ prestatario, monto, tasa_interes, meses, fecha_prestamo, cuotas_por_mes = 1 }) => {
  const total_devolver = calcularTotal(monto, tasa_interes, meses)
  const fecha = fecha_prestamo ? String(fecha_prestamo).slice(0, 10) : new Date().toLocaleDateString('en-CA')
  const { tasa_interes, meses, cuotas_por_mes, fecha_prestamo, total_devolver } = req.body
// ...
const afectados = await Prestamo.actualizar(id, {
  tasa_interes: Number(tasa_interes),
  meses: Number(meses),
  cuotas_por_mes: Number(cuotas_por_mes) || 1,
  fecha_prestamo: String(fecha_prestamo).slice(0, 10),
  total_devolver: Number(total_devolver),
})
  const [result] = await pool.execute(
    `INSERT INTO prestamos (prestatario, monto, tasa_interes, meses, cuotas_por_mes, total_devolver, saldo_restante, fecha_prestamo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [prestatario, monto, tasa_interes, meses, cuotas_por_mes, total_devolver, monto, fecha]
  )
  return { id: result.insertId, total_devolver }
}
    return res.status(201).json({ mensaje: 'Préstamo registrado.', data: { id, total_devolver } });
  } catch (err) { console.error('[crearPrestamo]', err); return res.status(500).json({ error: 'Error interno del servidor.' }); }
};

const listarPrestamos = async (_req, res) => {
  try {
    const prestamos = await Prestamo.listarTodos();
    return res.status(200).json({ total: prestamos.length, data: prestamos });
  } catch (err) { console.error('[listarPrestamos]', err); return res.status(500).json({ error: 'Error interno del servidor.' }); }
};

const obtenerPrestamo = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });
    const prestamo = await Prestamo.buscarPorId(id);
    if (!prestamo) return res.status(404).json({ error: `Préstamo ${id} no encontrado.` });
    return res.status(200).json({ data: prestamo });
  } catch (err) { console.error('[obtenerPrestamo]', err); return res.status(500).json({ error: 'Error interno del servidor.' }); }
};

const actualizarPrestamo = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });
    const { tasa_interes, meses, fecha_prestamo, total_devolver } = req.body;
    if (tasa_interes === undefined || Number(tasa_interes) < 0) return res.status(400).json({ error: '"tasa_interes" debe ser >= 0.' });
    if (!meses || Number(meses) <= 0) return res.status(400).json({ error: '"meses" debe ser mayor a 0.' });
    if (!fecha_prestamo) return res.status(400).json({ error: '"fecha_prestamo" es obligatorio.' });
    if (!total_devolver || Number(total_devolver) <= 0) return res.status(400).json({ error: '"total_devolver" debe ser mayor a 0.' });
    const afectados = await Prestamo.actualizar(id, {
      tasa_interes: Number(tasa_interes), meses: Number(meses),
      fecha_prestamo: String(fecha_prestamo).slice(0, 10), total_devolver: Number(total_devolver),
    });
    if (!afectados) return res.status(404).json({ error: `Préstamo ${id} no encontrado.` });
    return res.status(200).json({ mensaje: 'Préstamo actualizado correctamente.' });
  } catch (err) { console.error('[actualizarPrestamo]', err); return res.status(500).json({ error: 'Error interno del servidor.' }); }
};

const actualizarEstado = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });
    const { estado } = req.body;
    if (!ESTADOS_VALIDOS.includes(estado)) return res.status(400).json({ error: `Estado debe ser: ${ESTADOS_VALIDOS.join(', ')}.` });
    const afectados = await Prestamo.actualizarEstado(id, estado);
    if (!afectados) return res.status(404).json({ error: `Préstamo ${id} no encontrado.` });
    return res.status(200).json({ mensaje: `Estado actualizado a "${estado}".` });
  } catch (err) { console.error('[actualizarEstado]', err); return res.status(500).json({ error: 'Error interno del servidor.' }); }
};

const eliminarPrestamo = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });
    const afectados = await Prestamo.eliminar(id);
    if (!afectados) return res.status(404).json({ error: `Préstamo ${id} no encontrado.` });
    return res.status(200).json({ mensaje: `Préstamo ${id} eliminado.` });
  } catch (err) { console.error('[eliminarPrestamo]', err); return res.status(500).json({ error: 'Error interno del servidor.' }); }
};

const registrarPago = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });
    const { monto_cuota, nota } = req.body;
    if (!monto_cuota || Number(monto_cuota) <= 0) return res.status(400).json({ error: '"monto_cuota" debe ser mayor a 0.' });
    const prestamo = await Prestamo.buscarPorId(id);
    if (!prestamo) return res.status(404).json({ error: `Préstamo ${id} no encontrado.` });
    if (prestamo.estado === 'pagado') return res.status(400).json({ error: 'Este préstamo ya está pagado.' });
    const resultado = await Prestamo.registrarPago(id, Number(monto_cuota), nota || '');
    return res.status(201).json({ mensaje: 'Pago registrado.', data: resultado });
  } catch (err) { console.error('[registrarPago]', err); return res.status(500).json({ error: 'Error interno del servidor.' }); }
};

const listarPagos = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });
    const pagos = await Prestamo.listarPagos(id);
    return res.status(200).json({ data: pagos });
  } catch (err) { console.error('[listarPagos]', err); return res.status(500).json({ error: 'Error interno del servidor.' }); }
};

module.exports = { crearPrestamo, listarPrestamos, obtenerPrestamo, actualizarPrestamo, actualizarEstado, eliminarPrestamo, registrarPago, listarPagos };
