'use strict';

const pool = require('../config/db');

/**
 * Calcula el total a devolver con interés simple.
 * total = monto + (monto * tasa * meses)
 */
const calcularTotal = (monto, tasa, meses) =>
  parseFloat((monto + monto * tasa * meses).toFixed(2));

// ── Crear un préstamo ─────────────────────────────────────────────────────────
const crear = async ({ prestatario, monto, tasa_interes, meses }) => {
  const total_devolver = calcularTotal(monto, tasa_interes, meses);
const fecha_prestamo = new Date().toISOString().split('T')[0]

  const [result] = await pool.execute(
    `INSERT INTO prestamos (prestatario, monto, tasa_interes, meses, total_devolver, fecha_prestamo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [prestatario, monto, tasa_interes, meses, total_devolver, fecha_prestamo]
  );

  return { id: result.insertId, total_devolver };
};

// ── Listar todos ──────────────────────────────────────────────────────────────
const listarTodos = async () => {
  const [rows] = await pool.execute(
    `SELECT id, prestatario, monto, tasa_interes, meses,
            total_devolver, estado, created_at, updated_at
     FROM prestamos
     ORDER BY created_at DESC`
  );
  return rows;
};

// ── Buscar por ID ─────────────────────────────────────────────────────────────
const buscarPorId = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, prestatario, monto, tasa_interes, meses,
            total_devolver, estado, created_at, updated_at
     FROM prestamos
     WHERE id = ?`,
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

module.exports = { calcularTotal, crear, listarTodos, buscarPorId, actualizarEstado, eliminar };
