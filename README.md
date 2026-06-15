# 💰 Préstamos API — Node.js + Express + MySQL

API REST para gestión de préstamos personales con cálculo automático de interés simple.

---

## 📁 Estructura del proyecto

```
prestamos-api/
├── app.js                        # Entrada principal
├── package.json
├── .env                          # Variables de entorno (no subir a Git)
├── .gitignore
├── database.sql                  # Script de base de datos
├── config/
│   └── db.js                     # Pool de conexiones MySQL
├── models/
│   └── prestamo.model.js         # Queries SQL + cálculo de interés
├── controllers/
│   └── prestamo.controller.js    # Lógica de negocio y validaciones
└── routes/
    └── prestamo.routes.js        # Definición de endpoints
```

---

## 🚀 Instalación y puesta en marcha

### 1. Clonar e instalar dependencias
```bash
npm install
```

### 2. Configurar la base de datos
Edita `.env` con tus credenciales MySQL y ejecuta el script:
```bash
mysql -u root -p < database.sql
```

### 3. Configurar `.env`
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=prestamos_db
```

### 4. Arrancar el servidor
```bash
# Producción
npm start

# Desarrollo (recarga automática)
npm run dev
```

---

## 📐 Fórmula de interés simple

```
total_devolver = monto + (monto × tasa_interes × meses)
```

La `tasa_interes` se expresa en decimal mensual:
- `0.05` → 5% mensual
- `0.015` → 1.5% mensual

---

## 🛣️ Endpoints

| Método   | Ruta                          | Descripción             |
|----------|-------------------------------|-------------------------|
| `POST`   | `/api/prestamos`              | Crear préstamo          |
| `GET`    | `/api/prestamos`              | Listar todos            |
| `GET`    | `/api/prestamos/:id`          | Detalle por ID          |
| `PATCH`  | `/api/prestamos/:id/estado`   | Actualizar estado       |
| `DELETE` | `/api/prestamos/:id`          | Eliminar préstamo       |

---

## 📬 Ejemplos con cURL

### ✅ Crear préstamo
```bash
curl -X POST http://localhost:3000/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{
    "prestatario": "Carlos Ramírez",
    "monto": 5000000,
    "tasa_interes": 0.015,
    "meses": 12
  }'
```
**Respuesta 201:**
```json
{
  "mensaje": "Préstamo registrado correctamente.",
  "data": { "id": 1, "total_devolver": 5900000 }
}
```

---

### 📋 Listar todos los préstamos
```bash
curl http://localhost:3000/api/prestamos
```
**Respuesta 200:**
```json
{
  "total": 2,
  "data": [
    {
      "id": 1,
      "prestatario": "Carlos Ramírez",
      "monto": "5000000.00",
      "tasa_interes": "0.0150",
      "meses": 12,
      "total_devolver": "5900000.00",
      "estado": "pendiente",
      "created_at": "2024-06-14T10:00:00.000Z",
      "updated_at": "2024-06-14T10:00:00.000Z"
    }
  ]
}
```

---

### 🔍 Detalle por ID
```bash
curl http://localhost:3000/api/prestamos/1
```

---

### 🔄 Actualizar estado
```bash
curl -X PATCH http://localhost:3000/api/prestamos/1/estado \
  -H "Content-Type: application/json" \
  -d '{ "estado": "pagado" }'
```
Estados válidos: `pendiente` | `pagado` | `vencido`

**Respuesta 200:**
```json
{ "mensaje": "Estado actualizado a \"pagado\"." }
```

---

### 🗑️ Eliminar préstamo
```bash
curl -X DELETE http://localhost:3000/api/prestamos/1
```
**Respuesta 200:**
```json
{ "mensaje": "Préstamo con ID 1 eliminado correctamente." }
```

---

## ⚠️ Códigos HTTP utilizados

| Código | Significado                        |
|--------|------------------------------------|
| `200`  | OK — consulta o acción exitosa     |
| `201`  | Created — recurso creado           |
| `400`  | Bad Request — datos inválidos      |
| `404`  | Not Found — préstamo no existe     |
| `500`  | Internal Server Error              |
