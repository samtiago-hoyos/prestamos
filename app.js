'use strict';

require('dotenv').config();

const express = require('express');
const prestamoRoutes = require('./routes/prestamo.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/prestamos', prestamoRoutes);

// Ruta raíz informativa
app.get('/', (_req, res) => {
  res.json({
    api:     'Sistema de Préstamos Personales',
    version: '1.0.0',
    endpoints: {
      'POST   /api/prestamos':             'Crear préstamo',
      'GET    /api/prestamos':             'Listar todos',
      'GET    /api/prestamos/:id':         'Detalle por ID',
      'PATCH  /api/prestamos/:id/estado':  'Actualizar estado',
      'DELETE /api/prestamos/:id':         'Eliminar préstamo',
    },
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// ── Error handler global ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Error global]', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

// ── Arranque ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
