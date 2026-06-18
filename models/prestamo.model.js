'use strict';
const pool = require('../config/db');

const calcularTotal = (monto, tasa, meses) =>
  parseFloat((monto + monto * tasa * meses).toFixed(2));

const crear = async ({ prestatario, monto, tasa_interes, meses, cuotas_por_mes = 1, fecha_prestamo }) => {
  const total_devolver = calcularTotal(monto, tasa_interes, meses);
  const fecha = fecha_prestamo
    ? String(fecha_prestamo).slice(0, 10)
    : new Date().toLocaleDateString('en-CA');

  const [result] = await pool.execute(
    `INSERT INTO prestamos (prestatario, monto, tasa_interes, meses, cuotas_por_mes, total_devolver, saldo_restante, fecha_prestamo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [prestatario, monto, tasa_interes, meses, cuotas_por_mes, total_devolver, total_devolver, fecha]
  );
  return { id: result.insertId, total_devolver };
};

const listarTodos = async () => {
  const [rows] = await pool.execute(
    `SELECT id, prestatario, monto, tasa_interes, meses, cuotas_por_mes,
            total_devolver, saldo_restante, estado,
            fecha_prestamo, fecha_vencimiento, created_at, updated_at
     FROM prestamos ORDER BY created_at DESC`
  );
  return rows;
};

const buscarPorId = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, prestatario, monto, tasa_interes, meses, cuotas_por_mes,
            total_devolver, saldo_restante, estado,
            fecha_prestamo, fecha_vencimiento, created_at, updated_at
     FROM prestamos WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

const actualizar = async (id, { tasa_interes, meses, cuotas_por_mes, fecha_prestamo, total_devolver }) => {
  const fecha = fecha_prestamo ? String(fecha_prestamo).slice(0, 10) : null;
  const [result] = await pool.execute(
    `UPDATE prestamos
     SET tasa_interes   = ?,
         meses          = ?,
         cuotas_por_mes = ?,
         fecha_prestamo = ?,
         total_devolver = ?,
         saldo_restante = ?
     WHERE id = ?`,
    [tasa_interes, meses, cuotas_por_mes, fecha, total_devolver, total_devolver, id]
  );
  return result.affectedRows;
};

const actualizarEstado = async (id, estado) => {
  const [result] = await pool.execute(
    `UPDATE prestamos SET estado = ? WHERE id = ?`,
    [estado, id]
  );
  return result.affectedRows;
};

const eliminar = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM prestamos WHERE id = ?`, [id]
  );
  return result.affectedRows;
};

const registrarPago = async (id, monto_pagado, nota = '') => {
  const [pagoResult] = await pool.execute(
    `INSERT INTO pagos (prestamo_id, monto_cuota, interes_cuota, total_cobrado, nota)
     VALUES (?, ?, 0, ?, ?)`,
    [id, monto_pagado, monto_pagado, nota]
  );

  await pool.execute(
    `UPDATE prestamos
     SET saldo_restante = GREATEST(saldo_restante - ?, 0)
     WHERE id = ?`,
    [monto_pagado, id]
  );

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

const eliminarPago = async (pagoId, prestamo_id) => {
  const [pagos] = await pool.execute(
    `SELECT total_cobrado FROM pagos WHERE id = ? AND prestamo_id = ?`,
    [pagoId, prestamo_id]
  );
  if (!pagos[0]) return null;

  const monto = parseFloat(pagos[0].total_cobrado);

  await pool.execute(`DELETE FROM pagos WHERE id = ?`, [pagoId]);

  await pool.execute(
    `UPDATE prestamos SET saldo_restante = saldo_restante + ?, estado = 'pendiente' WHERE id = ?`,
    [monto, prestamo_id]
  );

  const [rows] = await pool.execute(
    `SELECT saldo_restante, estado FROM prestamos WHERE id = ?`, [prestamo_id]
  );
  return rows[0];
};

const listarPagos = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, monto_cuota, total_cobrado, nota, fecha_pago
     FROM pagos WHERE prestamo_id = ? ORDER BY fecha_pago ASC`,
    [id]
  );
  return rows;
};

module.exports = { calcularTotal, crear, listarTodos, buscarPorId, actualizar, actualizarEstado, eliminar, registrarPago, eliminarPago, listarPagos };