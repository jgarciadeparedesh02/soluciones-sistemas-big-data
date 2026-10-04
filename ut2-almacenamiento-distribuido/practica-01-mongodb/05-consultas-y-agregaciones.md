# Paso 5: Consultas de Negocio y Agregaciones Complejas

En este paso resolvemos las preguntas que la empresa necesita responder en su operativa diaria y creamos un cuadro de mandos analítico con el **Framework de Agregación**.

---

## 1. Operaciones Básicas del Día a Día (CRUD)

### A) Inserción de un nuevo producto
```javascript
db.productos.insertOne({
  sku: "HOG-LAMP-01",
  nombre: "Lámpara de Escritorio LED Táctil",
  categoria: "hogar",
  precio: 45.00,
  activo: true,
  especificaciones: { potencia_w: 12, luz_calida: true },
  variantes: [
    { sku_variante: "HOG-LAMP-BL", color: "Blanco", stock: NumberInt(20) }
  ],
  fecha_creacion: new Date()
});
```

### B) Actualización Parcial (`$set` y `$inc`)
Si el producto baja de precio y recibimos 5 unidades más de stock, no reemplazamos todo el documento; modificamos solo los campos necesarios:

```javascript
db.productos.updateOne(
  { sku: "HOG-LAMP-01", "variantes.sku_variante": "HOG-LAMP-BL" },
  {
    $set: { precio: 39.99 },
    $inc: { "variantes.$.stock": NumberInt(5) } // Incrementa el stock en 5
  }
);
```

### C) Borrado Lógico o *Soft Delete* (¿Por qué nunca borrar físicamente?)
En sistemas Big Data y tiendas online, **nunca debemos hacer un `deleteOne` físico**, porque si borramos el producto, romperíamos el historial de pedidos antiguos de los clientes. En su lugar, lo desactivamos:

```javascript
db.productos.updateOne(
  { sku: "HOG-LAMP-01" },
  { $set: { activo: false, fecha_baja: new Date() } }
);
```

---

## 2. Paginación Estable en el Catálogo

Para mostrar los productos en la web de 2 en 2, ordenados de más caro a más barato:

```javascript
// Página 1 (primeros 2 productos activos):
db.productos.find(
  { activo: true },
  { nombre: 1, categoria: 1, precio: 1 }
)
.sort({ precio: -1, _id: 1 }) // _id sirve de desempate para que el orden nunca baile
.skip(0)
.limit(2);
```

---

## 3. Consultar Relaciones con `$lookup` (Equivalente al JOIN de SQL)

Queremos mostrar la ficha del portátil junto con todas las opiniones que han dejado los usuarios:

```javascript
db.productos.aggregate([
  // 1. Buscamos el portátil
  { $match: { sku: "LAP-PRO-16" } },
  
  // 2. Buscamos en la colección 'reviews' todas las que tengan su _id
  {
    $lookup: {
      from: "reviews",
      localField: "_id",
      foreignField: "producto_id",
      as: "opiniones"
    }
  },
  
  // 3. Proyectamos solo la información que nos interesa
  {
    $project: {
      nombre: 1,
      precio: 1,
      total_opiniones: { $size: "$opiniones" },
      opiniones: {
        puntuacion: 1,
        comentario: 1
      }
    }
  }
]);
```

---

## 4. Agregación Compleja: El Cuadro de Mandos con `$facet`

### La Analogía de la Cadena de Montaje
El Framework de Agregación de MongoDB funciona como una **tubería (*pipeline*)**:
Los datos entran por un extremo y van pasando por distintas estaciones de trabajo:
1. `$match`: Es el filtro de entrada (solo dejamos pasar productos activos).
2. `$unwind`: Si una caja contiene 3 camisetas de distintas tallas, `$unwind` abre la caja y crea 3 elementos separados para poder contar el stock de cada variante una a una.
3. `$facet`: Divide la cinta transportadora en dos líneas independientes para calcular dos cosas distintas al mismo tiempo en un único viaje de red:
   - **Línea A:** Dinero total en stock por cada categoría.
   - **Línea B:** Alerta urgente de productos que tienen menos de 5 unidades en stock.

### Código de la Agregación (Copia y pega en `mongosh`):

```javascript
db.productos.aggregate([
  // Etapa 1: Filtrar solo productos activos
  { $match: { activo: true } },
  
  // Etapa 2: Desanidar el array de variantes
  { $unwind: "$variantes" },
  
  // Etapa 3 y 4: Análisis multidimensional en paralelo
  {
    $facet: {
      // Rama A: Negocio e Inventario
      resumen_por_categoria: [
        {
          $group: {
            _id: "$categoria",
            unidades_totales: { $sum: "$variantes.stock" },
            valor_inventario: {
              $sum: { $multiply: ["$variantes.stock", "$precio"] }
            }
          }
        },
        { $sort: { valor_inventario: -1 } }
      ],
      
      // Rama B: Alerta de reposición inmediata
      alerta_rotura_stock: [
        { $match: { "variantes.stock": { $lte: 5 } } },
        {
          $project: {
            _id: 0,
            producto: "$nombre",
            sku_variante: "$variantes.sku_variante",
            stock_restante: "$variantes.stock"
          }
        }
      ]
    }
  }
]);
```

### ¿Qué ventaja tiene esto frente a SQL?
En un sistema relacional tendríamos que ejecutar dos consultas `GROUP BY` distintas contra la base de datos. Con `$facet` en MongoDB, el clúster procesa ambas ramas en una sola pasada y nos devuelve el resultado empaquetado en un solo JSON.
