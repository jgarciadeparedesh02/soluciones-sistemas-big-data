# Práctica 01: Diseña una Base de Datos Documental con MongoDB

Solución completa y entorno reproducible para la práctica de modelado documental de la **Unidad 2 (Sistemas Big Data)**.

---

## 1. Escenario Elegido: Catálogo de Comercio Electrónico Variable

Se modela una tienda digital con:
- **Productos con variantes y especificaciones polimórficas** (electrónica, ropa, hogar, deportes).
- **Usuarios y direcciones de entrega.**
- **Reseñas referenciadas.**
- **Pedidos con snapshot de precios** para consistencia histórica.

---

## 2. Puesta en Marcha con Docker (Recomendado)

El entorno incluye MongoDB 7.0 y Mongo Express (interfaz gráfica web).

```bash
# 1. Levantar el contenedor
docker compose up -d

# 2. Verificar que el servicio está activo
docker compose ps
```

- **MongoDB:** `localhost:27017`
- **Mongo Express (UI Web):** [http://localhost:8081](http://localhost:8081)
- **Credenciales Root:** `admin` / `secretpassword123`
- **Base de datos:** `ecommerce_db`

---

## 3. Orden de Ejecución de Scripts

Para reproducir la práctica completa desde cero, ejecuta los scripts en este orden estricto utilizando `mongosh`:

```bash
# Conexión local estándar:
URI="mongodb://admin:secretpassword123@localhost:27017/ecommerce_db?authSource=admin"

# Paso 1: Crear colecciones y aplicar $jsonSchema de validación
mongosh "$URI" scripts/01-colecciones-validacion.js

# Paso 2: Cargar el dataset de prueba sintético
mongosh "$URI" scripts/02-datos.js

# Paso 3: Crear índices y analizar planes explain("executionStats")
mongosh "$URI" scripts/03-indices.js

# Paso 4: Ejecutar consultas de negocio y el pipeline de agregación complejo ($facet)
mongosh "$URI" scripts/04-consultas.js
```

---

## 4. Estructura de Entregables

```text
practica-01-mongodb/
├── README.md                      # Esta guía de reproducción
├── docker-compose.yml             # Despliegue automatizado de MongoDB 7.0 + UI Web
├── scripts/
│   ├── 01-colecciones-validacion.js # Creación de colecciones con $jsonSchema estricto
│   ├── 02-datos.js                # Inserción de catálogo de prueba y relaciones
│   ├── 03-indices.js              # Índices compuestos, de texto y explain executionStats
│   ├── 04-consultas.js            # CRUD, paginación estable y pipeline con $facet
│   └── 05-backup.md               # Procedimientos mongodump/restore y RBAC
├── docs/
│   ├── modelo.md                  # Diagrama conceptual y justificación de embedding/ref
│   └── evidencias/                # Trazas de validación e impacto de índices
└── datos/
    └── README.md                  # Origen y consideraciones del dataset sintético
```
