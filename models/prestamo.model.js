'use strict';

const pool = require('../config/db');

const calcularTotal = (monto, tasa, meses) =>
  parseFloat((monto + monto * tasa * meses).toFixed(2));

// ── Crear préstamo ────────────────────────────────────────────────────────────
const crear = async ({ prestatario, monto, tasa_interes, meses, fecha_prestamo }) => {
  const total_devolver = calcularTotal(monto, tasa_interes, meses);
  const fecha = fecha_prestamo || new Date().toLocaleDateString('en-CA');

  const [result] = await pool.execute(
    `INSERT INTO prestamos (prestatario, monto, tasa_interes, meses, total_devolver, fecha_prestamo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [prestatario, monto, tasa_interes, meses, total_devolver, fecha]
  );
  return { id: result.insertId, total_devolver };
};

// ── Listar todos ──────────────────────────────────────────────────────────────
const listarTodos = async () => {
  const [rows] = await pool.execute(
    `SELECT id, prestatario, monto, tasa_interes, meses,
            total_devolver, saldo_restante, estado,
            fecha_prestamo, fecha_vencimiento, created_at, updated_at
     FROM prestamos ORDER BY created_at DESC`
  );
  return rows;
};

// ── Buscar por ID ─────────────────────────────────────────────────────────────
const buscarPorId = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, prestatario, monto, tasa_interes, meses,
            total_devolver, saldo_restante, estado,
            fecha_prestamo, fecha_vencimiento, created_at, updated_at
     FROM prestamos WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// ── Actualizar estado ─────────────────────────────────────────────────────────
const actualizarEstado = async (id, estado) => {
  const [result] = await pool.execute(
    `UPDATE prestamos SET estado = ? WHERE id = ?`,
    [estado, id]
  );
  return result.affectedRows;
};

// ── Eliminar ──────────────────────────────────────────────────────────────────
const eliminar = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM prestamos WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
};

// ── Registrar pago parcial ────────────────────────────────────────────────────
// Interés se cobra sobre la cuota: total_cobrado = cuota + (cuota * tasa)
const registrarPago = async (id, monto_cuota, tasa_interes) => {
  const interes_cuota  = parseFloat((monto_cuota * tasa_interes).toFixed(2));
  const total_cobrado  = parseFloat((monto_cuota + interes_cuota).toFixed(2));

  // Insertar pago
  const [pagoResult] = await pool.execute(
    `INSERT INTO pagos (prestamo_id, monto_cuota, interes_cuota, total_cobrado)
     VALUES (?, ?, ?, ?)`,
    [id, monto_cuota, interes_cuota, total_cobrado]
  );

  // Actualizar saldo restante
  await pool.execute(
    `UPDATE prestamos
     SET saldo_restante = GREATEST(saldo_restante - ?, 0)
     WHERE id = ?`,
    [monto_cuota, id]
  );

  // Si saldo llega a 0 marcar como pagado
  await pool.execute(
    `UPDATE prestamos SET estado = 'pagado'
     WHERE id = ? AND saldo_restante = 0`,
    [id]
  );

  // Devolver saldo actualizado
  const [rows] = await pool.execute(
    `SELECT saldo_restante, estado FROM prestamos WHERE id = ?`, [id]
  );

  return {
    pago_id:        pagoResult.insertId,
    monto_cuota,
    interes_cuota,
    total_cobrado,
    saldo_restante: rows[0].saldo_restante,
    estado:         rows[0].estado,
  };
};

// ── Listar pagos de un préstamo ───────────────────────────────────────────────
const listarPagos = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, monto_cuota, interes_cuota, total_cobrado, fecha_pago
     FROM pagos WHERE prestamo_id = ? ORDER BY fecha_pago ASC`,
    [id]
  );
  return rows;
};

module.exports = {
  calcularTotal, crear, listarTodos, buscarPorId,
  actualizarEstado, eliminar, registrarPago, listarPagos,
};