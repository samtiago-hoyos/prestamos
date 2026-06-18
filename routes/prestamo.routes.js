'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/prestamo.controller');

const router = Router();

router.post('/',                ctrl.crearPrestamo);
router.get('/',                 ctrl.listarPrestamos);
router.get('/:id',              ctrl.obtenerPrestamo);
router.patch('/:id/estado',     ctrl.actualizarEstado);
router.delete('/:id',           ctrl.eliminarPrestamo);
router.post('/:id/pagos',       ctrl.registrarPago);
router.get('/:id/pagos',        ctrl.listarPagos);

module.exports = router;