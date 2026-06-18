'use strict';
const pool = require('../config/db');

const calcularTotal = (monto, tasa, meses) =>
  parseFloat((monto + monto * tasa * meses).toFixed(2));

const crear = async ({ prestatario, monto, tasa_interes, meses, fecha_prestamo }) => {
  const total_devolver = calcularTotal(monto, tasa_interes, meses);
  const fecha = fecha_prestamo
    ? String(fecha_prestamo).slice(0, 10)
    : new Date().toLocaleDateString('en-CA');

  const [result] = await pool.execute(
    `INSERT INTO prestamos (prestatario, monto, tasa_interes, meses, total_devolver, saldo_restante, fecha_prestamo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [prestatario, monto, tasa_interes, meses, total_devolver, monto, fecha]
  );
  return { id: result.insertId, total_devolver };
};

const listarTodos = async () => {
  const [rows] = await pool.execute(
    `SELECT id, prestatario, monto, tasa_interes, meses,
            total_devolver, saldo_restante, estado,
            fecha_prestamo, fecha_vencimiento, created_at, updated_at
     FROM prestamos ORDER BY created_at DESC`
     `SELECT id, prestatario, monto, tasa_interes, meses, cuotas_por_mes,
        total_devolver, saldo_restante, estado,
        fecha_prestamo, fecha_vencimiento, created_at, updated_at
 FROM prestamos ORDER BY created_at DESC`
  );
  return rows;
};

const buscarPorId = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, prestatario, monto, tasa_interes, meses,
            total_devolver, saldo_restante, estado,
            fecha_prestamo, fecha_vencimiento, created_at, updated_at
     FROM prestamos WHERE id = ?`,`SELECT id, prestatario, monto, tasa_interes, meses, cuotas_por_mes,
        total_devolver, saldo_restante, estado,
        fecha_prestamo, fecha_vencimiento, created_at, updated_at
 FROM prestamos ORDER BY created_at DESC`
    [id]
  );
  return rows[0] || null;
};

const actualizar = async (id, { tasa_interes, meses, cuotas_por_mes, fecha_prestamo, total_devolver }) => {
  const fecha = fecha_prestamo ? String(fecha_prestamo).slice(0, 10) : null
  const [result] = await pool.execute(
    `UPDATE prestamos
     SET tasa_interes   = ?,
         meses          = ?,
         cuotas_por_mes = ?,
         fecha_prestamo = ?,
         total_devolver = ?
     WHERE id = ?`,
    [tasa_interes, meses, cuotas_por_mes, fecha, total_devolver, id]
  )
  return result.affectedRows
}

const eliminar = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM prestamos WHERE id = ?`, [id]
  );
  return result.affectedRows;
};

// ── Registrar pago simple — solo descuenta el monto pagado ──────────────────
const registrarPago = async (id, monto_pagado, nota = '') => {
  // Insertar pago
  const [pagoResult] = await pool.execute(
    `INSERT INTO pagos (prestamo_id, monto_cuota, interes_cuota, total_cobrado, nota)
     VALUES (?, ?, 0, ?, ?)`,
    [id, monto_pagado, monto_pagado, nota]
  );

  // Descontar del saldo restante
  await pool.execute(
    `UPDATE prestamos
     SET saldo_restante = GREATEST(saldo_restante - ?, 0)
     WHERE id = ?`,
    [monto_pagado, id]
  );

  // Si saldo = 0 marcar como pagado automáticamente
  await pool.execute(
    `UPDATE prestamos SET estado = 'pagado'
     WHERE id = ? AND saldo_restante = 0`,
    [id]
  );

  const [rows] = await pool.execute(
    `SELECT saldo_restante, estado FROM prestamos WHERE id = ?`, [id]
  );

  return {
    pago_id:        pagoResult.insertId,
    monto_pagado,
    saldo_restante: rows[0].saldo_restante,
    estado:         rows[0].estado,
  };
};

const listarPagos = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, monto_cuota, total_cobrado, nota, fecha_pago
     FROM pagos WHERE prestamo_id = ? ORDER BY fecha_pago ASC`,
    [id]
  );
  return rows;
};

module.exports = { calcularTotal, crear, listarTodos, buscarPorId, actualizarEstado, eliminar, registrarPago, listarPagos };