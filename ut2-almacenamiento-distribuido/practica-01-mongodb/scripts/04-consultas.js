/**
 * PRÁCTICA 01: MODELADO CON MONGODB - SISTEMAS BIG DATA
 * Script 04: Consultas de Negocio y Pipeline de Agregación Complejo
 * 
 * Uso:
 * mongosh "mongodb://admin:secretpassword123@localhost:27017/ecommerce_db?authSource=admin" scripts/04-consultas.js
 */

const dbName = "ecommerce_db";
const currentDb = db.getSiblingDB(dbName);

print("[+] Ejecutando consultas de negocio y pipelines...\n");

// ============================================================================
// 1. Operaciones CRUD: Inserción, Actualización Parcial y Desactivación Lógica
// ============================================================================
print("1. Inserción de un nuevo producto de prueba:");
const nuevoProd = currentDb.productos.insertOne({
  sku: "HOG-LAMP-01",
  nombre: "Lámpara de Escritorio LED Inteligente",
  categoria: "hogar",
  precio: 45.00,
  activo: true,
  especificaciones: { potencia_w: 12, luz_rgb: true },
  variantes: [
    { sku_variante: "HOG-LAMP-BL", color: "Blanco", stock: NumberInt(20) }
  ],
  fecha_creacion: new Date()
});
print(`   ID insertado: ${nuevoProd.insertedId}`);

print("\n2. Actualización parcial ($set y $inc): Incrementar stock de variante y rebajar precio:");
currentDb.productos.updateOne(
  { sku: "HOG-LAMP-01", "variantes.sku_variante": "HOG-LAMP-BL" },
  {
    $set: { precio: 39.99 },
    $inc: { "variantes.$.stock": NumberInt(5) }
  }
);
print("   Producto actualizado con éxito.");

print("\n3. Desactivación lógica (Soft Delete): Marcar como inactivo en lugar de borrar físicamente:");
currentDb.productos.updateOne(
  { sku: "HOG-LAMP-01" },
  { $set: { activo: false, fecha_baja: new Date() } }
);
print("   Producto desactivado lógicamente (activo: false).");

// ============================================================================
// 2. Filtros Combinados, Ordenación y Paginación Estable
// ============================================================================
print("\n4. Búsqueda en catálogo con filtros, orden y paginación (Página 1, tamaño 2):");
const catalogoPaginado = currentDb.productos.find(
  { activo: true, precio: { $gte: 20, $lte: 1500 } },
  { nombre: 1, categoria: 1, precio: 1, _id: 1 }
)
.sort({ precio: -1, _id: 1 }) // Orden estable (precio desc, _id tie-breaker)
.skip(0)
.limit(2)
.toArray();
printjson(catalogoPaginado);

// ============================================================================
// 3. Consulta de Referencia con $lookup (Productos con sus Reviews)
// ============================================================================
print("\n5. Consulta con $lookup: Detalle de producto con sus valoraciones asociadas:");
const productoConReviews = currentDb.productos.aggregate([
  { $match: { sku: "LAP-PRO-16" } },
  {
    $lookup: {
      from: "reviews",
      localField: "_id",
      foreignField: "producto_id",
      as: "valoraciones"
    }
  },
  {
    $project: {
      nombre: 1,
      precio: 1,
      total_reviews: { $size: "$valoraciones" },
      valoraciones: {
        puntuacion: 1,
        comentario: 1,
        fecha: 1
      }
    }
  }
]).toArray();
printjson(productoConReviews);

// ============================================================================
// 4. Agregación Compleja (5 etapas: $match, $unwind, $group, $facet, $project)
// Cuadro de mandos analítico: 
// - Faceta 1: Stock total y valor del inventario desglosado por categoría
// - Faceta 2: Productos con stock crítico (menos de 5 unidades en alguna variante)
// ============================================================================
print("\n6. Pipeline de Agregación Analítico (Faceted Search & Inventory Analytics):");
const analiticaInventario = currentDb.productos.aggregate([
  // Etapa 1: Filtrar solo productos activos en catálogo
  {
    $match: { activo: true }
  },
  // Etapa 2: Desanidar el array de variantes para operar a nivel de SKU variante
  {
    $unwind: "$variantes"
  },
  // Etapa 3 y 4: Múltiples ramas de análisis en paralelo mediante $facet
  {
    $facet: {
      // Rama A: Métricas por categoría
      resumen_por_categoria: [
        {
          $group: {
            _id: "$categoria",
            unidades_stock: { $sum: "$variantes.stock" },
            valor_inventario_aprox: {
              $sum: { $multiply: ["$variantes.stock", "$precio"] }
            },
            total_variantes: { $sum: 1 }
          }
        },
        {
          $sort: { valor_inventario_aprox: -1 }
        }
      ],
      // Rama B: Alerta de reposición inmediata (stock <= 5)
      alertas_stock_critico: [
        {
          $match: { "variantes.stock": { $lte: 5 } }
        },
        {
          $project: {
            _id: 0,
            nombre_producto: "$nombre",
            sku_variante: "$variantes.sku_variante",
            stock_restante: "$variantes.stock"
          }
        }
      ]
    }
  }
]).toArray();

printjson(analiticaInventario);
print("\n[🎯 Conclusión Pedagógica]: $facet permite obtener en un único viaje de red (single network roundtrip) un dashboard completo combinando agregaciones de negocio y alertas operativas.");
