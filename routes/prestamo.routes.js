'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/prestamo.controller');

const router = Router();

// POST   /api/prestamos            → Crear préstamo
router.post('/',            ctrl.crearPrestamo);

// GET    /api/prestamos            → Listar todos
router.get('/',             ctrl.listarPrestamos);

// GET    /api/prestamos/:id        → Detalle por ID
router.get('/:id',          ctrl.obtenerPrestamo);

// PATCH  /api/prestamos/:id/estado → Actualizar estado
router.patch('/:id/estado', ctrl.actualizarEstado);

// DELETE /api/prestamos/:id        → Eliminar
router.delete('/:id',       ctrl.eliminarPrestamo);

module.exports = router;
