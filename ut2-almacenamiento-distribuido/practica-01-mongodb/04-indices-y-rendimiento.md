# Paso 4: Índices y Optimización del Rendimiento

Uno de los conceptos más importantes en Big Data es el **rendimiento**. Si una colección tiene 10 millones de documentos y no usamos índices, una simple búsqueda obligará a la máquina a leer los 10 millones de discos, tardando segundos o minutos.

---

## 1. La Analogía del Libro: ¿Qué es un Índice?

- **Sin índice (`COLLSCAN` - Escaneo de Colección):** Es como buscar la palabra "MongoDB" en una enciclopedia de 1.000 páginas leyendo cada línea desde la página 1 hasta la 1.000.
- **Con índice (`IXSCAN` - Escaneo de Índice):** Vas al índice alfabético al final del libro, miras la página exacta y vas directo a ella en un segundo.

---

## 2. Experimento en Vivo: Ver el problema antes de crear el índice

Ejecuta esta consulta con `.explain("executionStats")` en tu terminal de `mongosh`:

```javascript
db.productos.find({
  activo: true,
  categoria: "electronica",
  precio: { $gte: 100, $lte: 1500 }
}).sort({ precio: 1 }).explain("executionStats");
```

### Fíjate en los resultados:
- En `executionStages.stage` verás **`COLLSCAN`**.
- En `totalDocsExamined` verás que ha tenido que leer **todos los documentos de la colección** para poder devolver solo los que coincidían.

---

## 3. Creación de los Índices

Para optimizar nuestra tienda, creamos tres tipos de índices muy útiles:

### A) Índice Compuesto con la regla ESR (Equality, Sort, Range)
Cuando hacemos consultas que combinan filtros exactos, ordenación y rangos, los campos del índice deben colocarse en este orden:
1. **E**quality (Igualdad): `categoria` y `activo` (buscamos coincidencias exactas).
2. **S**ort (Orden): `precio` (para que el motor ya los tenga ordenados sin tener que ordenar en memoria RAM).
3. **R**ange (Rango): el propio `precio` con `$gte` / `$lte`.

```javascript
db.productos.createIndex(
  { categoria: 1, activo: 1, precio: 1 },
  { name: "idx_productos_categoria_activo_precio" }
);
```

### B) Índice de Texto (Búsqueda Libre de Productos)
Permite a los usuarios buscar productos por palabras clave (ej: "auriculares", "portátil", "running"):

```javascript
db.productos.createIndex(
  { nombre: "text" },
  { name: "idx_productos_texto_nombre", default_language: "spanish" }
);
```

### C) Índice en la Colección `reviews` (Clave Foránea)
Acelera mostrar las reseñas más recientes de un producto concreto:

```javascript
db.reviews.createIndex(
  { producto_id: 1, fecha: -1 },
  { name: "idx_reviews_producto_fecha" }
);
```

---

## 4. Comprobación del Efecto "Wow": Repetir la Consulta con explain

Vuelve a ejecutar la consulta anterior:

```javascript
db.productos.find({
  activo: true,
  categoria: "electronica",
  precio: { $gte: 100, $lte: 1500 }
}).sort({ precio: 1 }).explain("executionStats");
```

### ¿Qué ha cambiado?
- Ahora la etapa es **`IXSCAN`** (Index Scan) seguida de `FETCH`.
- `totalDocsExamined` pasa a ser exactamente igual a los documentos devueltos (2).
- El tiempo de ejecución cae a **0 milisegundos**.

| Métrica | Antes (Sin Índice) | Después (Con Índice) |
| :--- | :--- | :--- |
| **Estrategia (Stage)** | `COLLSCAN` (Lee todo) | `IXSCAN` (Va directo) |
| **Documentos leídos** | Toda la colección | Solo los que cumplen el filtro |
| **Uso de CPU / Disco** | Muy alto | Mínimo |
