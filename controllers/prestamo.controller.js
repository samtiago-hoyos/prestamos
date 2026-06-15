'use strict';

const Prestamo = require('../models/prestamo.model');

const ESTADOS_VALIDOS = ['pendiente', 'pagado', 'vencido'];

// ── POST /prestamos ───────────────────────────────────────────────────────────
const crearPrestamo = async (req, res) => {
  try {
    const { prestatario, monto, tasa_interes, meses } = req.body;

    // Validaciones
    if (!prestatario || typeof prestatario !== 'string' || !prestatario.trim()) {
      return res.status(400).json({ error: 'El campo "prestatario" es obligatorio.' });
    }
    if (!monto || isNaN(monto) || Number(monto) <= 0) {
      return res.status(400).json({ error: '"monto" debe ser un número mayor a 0.' });
    }
    if (tasa_interes === undefined || isNaN(tasa_interes) || Number(tasa_interes) < 0) {
      return res.status(400).json({ error: '"tasa_interes" debe ser un número >= 0 (ej: 0.05 para 5%).' });
    }
    if (!meses || isNaN(meses) || !Number.isInteger(Number(meses)) || Number(meses) <= 0) {
      return res.status(400).json({ error: '"meses" debe ser un entero mayor a 0.' });
    }

    const { id, total_devolver } = await Prestamo.crear({
      prestatario: prestatario.trim(),
      monto:       Number(monto),
      tasa_interes: Number(tasa_interes),
      meses:       Number(meses),
    });

    return res.status(201).json({
      mensaje: 'Préstamo registrado correctamente.',
      data: { id, total_devolver },
    });
  } catch (err) {
    console.error('[crearPrestamo]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── GET /prestamos ────────────────────────────────────────────────────────────
const listarPrestamos = async (_req, res) => {
  try {
    const prestamos = await Prestamo.listarTodos();
    return res.status(200).json({ total: prestamos.length, data: prestamos });
  } catch (err) {
    console.error('[listarPrestamos]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── GET /prestamos/:id ────────────────────────────────────────────────────────
const obtenerPrestamo = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

    const prestamo = await Prestamo.buscarPorId(id);
    if (!prestamo) return res.status(404).json({ error: `Préstamo con ID ${id} no encontrado.` });

    return res.status(200).json({ data: prestamo });
  } catch (err) {
    console.error('[obtenerPrestamo]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── PATCH /prestamos/:id/estado ───────────────────────────────────────────────
const actualizarEstado = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

    const { estado } = req.body;
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        error: `"estado" debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}.`,
      });
    }

    const afectados = await Prestamo.actualizarEstado(id, estado);
    if (afectados === 0) return res.status(404).json({ error: `Préstamo con ID ${id} no encontrado.` });

    return res.status(200).json({ mensaje: `Estado actualizado a "${estado}".` });
  } catch (err) {
    console.error('[actualizarEstado]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── DELETE /prestamos/:id ─────────────────────────────────────────────────────
const eliminarPrestamo = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

    const afectados = await Prestamo.eliminar(id);
    if (afectados === 0) return res.status(404).json({ error: `Préstamo con ID ${id} no encontrado.` });

    return res.status(200).json({ mensaje: `Préstamo con ID ${id} eliminado correctamente.` });
  } catch (err) {
    console.error('[eliminarPrestamo]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { crearPrestamo, listarPrestamos, obtenerPrestamo, actualizarEstado, eliminarPrestamo };
