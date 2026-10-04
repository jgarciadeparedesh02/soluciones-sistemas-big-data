# Paso 3: Carga de Datos de Prueba

Para que las consultas, los índices y las agregaciones que haremos más adelante tengan sentido y devuelvan resultados reales, cargamos un conjunto de datos coherente en las 4 colecciones.

---

## 1. Insertar Usuarios

Copia y pega en `mongosh`:

```javascript
// Guardamos los IDs en variables para usarlos luego en reviews y pedidos:
const userAdminId = new ObjectId("650000000000000000000001");
const userJuanId = new ObjectId("650000000000000000000002");
const userLauraId = new ObjectId("650000000000000000000003");
const userCarlosId = new ObjectId("650000000000000000000004");

db.usuarios.insertMany([
  {
    _id: userAdminId,
    email: "admin@tiendabigdata.es",
    nombre: "Administrador del Sistema",
    rol: "admin",
    activo: true,
    direcciones: []
  },
  {
    _id: userJuanId,
    email: "juan.garcia@email.com",
    nombre: "Juan García",
    rol: "cliente",
    activo: true,
    direcciones: [
      { calle: "Calle Mayor 12", ciudad: "Madrid", codigo_postal: "28013" }
    ]
  },
  {
    _id: userLauraId,
    email: "laura.martin@email.com",
    nombre: "Laura Martín",
    rol: "cliente",
    activo: true,
    direcciones: [
      { calle: "Avenida Diagonal 450", ciudad: "Barcelona", codigo_postal: "08006" }
    ]
  },
  {
    _id: userCarlosId,
    email: "carlos.lopez@email.com",
    nombre: "Carlos López",
    rol: "cliente",
    activo: false, // Desactivado para probar filtros
    direcciones: [
      { calle: "Calle Sierpes 5", ciudad: "Sevilla", codigo_postal: "41004" }
    ]
  }
]);
```

---

## 2. Insertar Productos Heterogéneos

Fíjate en cómo cada producto tiene especificaciones distintas (el portátil tiene RAM y SSD; la camiseta tiene material y transpirabilidad):

```javascript
const prodLaptopId = new ObjectId("650000000000000000000101");
const prodAuricularesId = new ObjectId("650000000000000000000102");
const prodCamisetaId = new ObjectId("650000000000000000000103");
const prodZapatillasId = new ObjectId("650000000000000000000104");
const prodCafeteraId = new ObjectId("650000000000000000000105");

db.productos.insertMany([
  {
    _id: prodLaptopId,
    sku: "LAP-PRO-16",
    nombre: "Portátil UltraBook Pro 16",
    categoria: "electronica",
    precio: 1299.99,
    activo: true,
    especificaciones: {
      pantalla: "16 pulgadas OLED",
      ram_gb: 32,
      disco_ssd_gb: 1024,
      procesador: "Intel Core Ultra 7"
    },
    variantes: [
      { sku_variante: "LAP-PRO-16-GRIS", color: "Gris Espacial", stock: NumberInt(14) },
      { sku_variante: "LAP-PRO-16-PLATA", color: "Plata", stock: NumberInt(8) }
    ],
    fecha_creacion: new Date("2024-01-15T10:00:00Z")
  },
  {
    _id: prodAuricularesId,
    sku: "AUD-BT-NC",
    nombre: "Auriculares Inalámbricos Noise Cancelling",
    categoria: "electronica",
    precio: 189.50,
    activo: true,
    especificaciones: {
      cancelacion_ruido: true,
      bateria_horas: 30,
      bluetooth: "5.3"
    },
    variantes: [
      { sku_variante: "AUD-BT-NC-NEGRO", color: "Negro Mate", stock: NumberInt(45) },
      { sku_variante: "AUD-BT-NC-BLANCO", color: "Blanco", stock: NumberInt(2) }
    ],
    fecha_creacion: new Date("2024-02-01T12:30:00Z")
  },
  {
    _id: prodCamisetaId,
    sku: "CAM-RUN-01",
    nombre: "Camiseta Técnica Transpirable Running",
    categoria: "ropa",
    precio: 29.95,
    activo: true,
    especificaciones: {
      material: "100% Poliéster reciclado",
      secado_rapido: true
    },
    variantes: [
      { sku_variante: "CAM-RUN-01-AZ-S", color: "Azul", talla: "S", stock: NumberInt(25) },
      { sku_variante: "CAM-RUN-01-AZ-M", color: "Azul", talla: "M", stock: NumberInt(40) },
      { sku_variante: "CAM-RUN-01-AZ-L", color: "Azul", talla: "L", stock: NumberInt(12) },
      { sku_variante: "CAM-RUN-01-RO-M", color: "Rojo", talla: "M", stock: NumberInt(0) }
    ],
    fecha_creacion: new Date("2024-02-15T09:00:00Z")
  },
  {
    _id: prodZapatillasId,
    sku: "ZAP-TRAIL-9",
    nombre: "Zapatillas Trail Running Todo Terreno",
    categoria: "deportes",
    precio: 119.00,
    activo: true,
    especificaciones: {
      suela: "Vibram Megagrip",
      impermeable: true
    },
    variantes: [
      { sku_variante: "ZAP-TRAIL-42", color: "Negro/Amarillo", talla: "42", stock: NumberInt(7) },
      { sku_variante: "ZAP-TRAIL-43", color: "Negro/Amarillo", talla: "43", stock: NumberInt(11) }
    ],
    fecha_creacion: new Date("2024-03-01T16:00:00Z")
  },
  {
    _id: prodCafeteraId,
    sku: "HOG-CAF-EX",
    nombre: "Cafetera Espresso Automática Inox",
    categoria: "hogar",
    precio: 349.00,
    activo: true,
    especificaciones: {
      presion_bar: 19,
      deposito_litros: 1.8,
      molinillo_integrado: true
    },
    variantes: [
      { sku_variante: "HOG-CAF-EX-INOX", color: "Acero Inoxidable", stock: NumberInt(5) }
    ],
    fecha_creacion: new Date("2024-03-10T11:00:00Z")
  }
]);
```

---

## 3. Insertar Reseñas y Pedidos

```javascript
// 3. Reseñas vinculadas a productos y usuarios
db.reviews.insertMany([
  {
    producto_id: prodLaptopId,
    usuario_id: userJuanId,
    puntuacion: NumberInt(5),
    comentario: "Excelente rendimiento para compilar y Docker, la pantalla OLED es increíble.",
    fecha: new Date("2024-02-10T18:20:00Z")
  },
  {
    producto_id: prodLaptopId,
    usuario_id: userLauraId,
    puntuacion: NumberInt(4),
    comentario: "Muy rápido pero la batería dura un poco menos de lo anunciado.",
    fecha: new Date("2024-02-14T20:00:00Z")
  },
  {
    producto_id: prodAuricularesId,
    usuario_id: userJuanId,
    puntuacion: NumberInt(5),
    comentario: "La cancelación de ruido aísla perfectamente en la oficina.",
    fecha: new Date("2024-03-05T08:45:00Z")
  },
  {
    producto_id: prodCamisetaId,
    usuario_id: userCarlosId,
    puntuacion: NumberInt(3),
    comentario: "Es cómoda pero la talla M queda algo ajustada.",
    fecha: new Date("2024-03-12T14:15:00Z")
  }
]);

// 4. Pedidos con snapshot de precios congelados
db.pedidos.insertMany([
  {
    usuario_id: userJuanId,
    fecha_pedido: new Date("2024-02-05T11:30:00Z"),
    estado: "enviado",
    total: 1489.49,
    lineas: [
      {
        producto_id: prodLaptopId,
        sku: "LAP-PRO-16-GRIS",
        nombre: "Portátil UltraBook Pro 16",
        precio_unitario: 1299.99,
        cantidad: NumberInt(1)
      },
      {
        producto_id: prodAuricularesId,
        sku: "AUD-BT-NC-NEGRO",
        nombre: "Auriculares Inalámbricos Noise Cancelling",
        precio_unitario: 189.50,
        cantidad: NumberInt(1)
      }
    ]
  },
  {
    usuario_id: userLauraId,
    fecha_pedido: new Date("2024-03-15T17:00:00Z"),
    estado: "pagado",
    total: 59.90,
    lineas: [
      {
        producto_id: prodCamisetaId,
        sku: "CAM-RUN-01-AZ-M",
        nombre: "Camiseta Técnica Transpirable Running",
        precio_unitario: 29.95,
        cantidad: NumberInt(2)
      }
    ]
  }
]);
```

> **Verificación rápida:** Puedes comprobar cuántos documentos hay en cada colección ejecutando:
> ```javascript
> db.productos.countDocuments();
> db.usuarios.countDocuments();
> db.reviews.countDocuments();
> db.pedidos.countDocuments();
> ```
