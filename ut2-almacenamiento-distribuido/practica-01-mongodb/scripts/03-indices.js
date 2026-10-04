/**
 * PRÁCTICA 01: MODELADO CON MONGODB - SISTEMAS BIG DATA
 * Script 03: Implementación y Demostración de Índices con explain()
 * 
 * Uso:
 * mongosh "mongodb://admin:secretpassword123@localhost:27017/ecommerce_db?authSource=admin" scripts/03-indices.js
 */

const dbName = "ecommerce_db";
const currentDb = db.getSiblingDB(dbName);

print("[+] Configuración y prueba de índices...");

// ============================================================================
// 1. Demostración PREVIA al índice (COLLSCAN)
// Consulta de negocio: Filtrar productos activos de 'electronica' ordenados por precio ascendente
// ============================================================================
print("\n--- [EVIDENCIA 1] Plan de ejecución ANTES de crear el índice compuesto ---");
const explainAntes = currentDb.productos.find({
  activo: true,
  categoria: "electronica",
  precio: { $gte: 100, $lte: 1500 }
}).sort({ precio: 1 }).explain("executionStats");

print(`Etapa de ejecución (stage): ${explainAntes.executionStats.executionStages.stage}`);
print(`Documentos examinados (docsExamined): ${explainAntes.executionStats.totalDocsExamined}`);
print(`Documentos devueltos (nReturned): ${explainAntes.executionStats.nReturned}`);

// ============================================================================
// 2. Creación de Índices Justificados
// ============================================================================

// ÍNDICE 1: Compuesto (Regla ESR: Equality -> Sort -> Range)
// Acelera la búsqueda en catálogo filtrando por categoría/activo y ordenando por precio
currentDb.productos.createIndex(
  { categoria: 1, activo: 1, precio: 1 },
  { name: "idx_productos_categoria_activo_precio" }
);
print("[✔] Índice compuesto creado: idx_productos_categoria_activo_precio");

// ÍNDICE 2: Textual (Full-Text Search)
// Permite buscar por palabras clave en nombre y especificaciones
currentDb.productos.createIndex(
  { nombre: "text" },
  { name: "idx_productos_texto_nombre", default_language: "spanish" }
);
print("[✔] Índice de texto creado: idx_productos_texto_nombre");

// ÍNDICE 3: Clave foránea en reviews (producto_id + fecha desc)
// Acelera listar las reviews más recientes de un producto concreto
currentDb.reviews.createIndex(
  { producto_id: 1, fecha: -1 },
  { name: "idx_reviews_producto_fecha" }
);
print("[✔] Índice foráneo compuesto creado: idx_reviews_producto_fecha");

// ÍNDICE 4: Clave única en usuarios (email)
currentDb.usuarios.createIndex(
  { email: 1 },
  { unique: true, name: "idx_usuarios_email_unique" }
);
print("[✔] Índice único creado: idx_usuarios_email_unique");

// ============================================================================
// 3. Demostración POSTERIOR al índice (IXSCAN)
// ============================================================================
print("\n--- [EVIDENCIA 2] Plan de ejecución DESPUÉS de crear el índice compuesto ---");
const explainDespues = currentDb.productos.find({
  categoria: "electronica",
  activo: true,
  precio: { $gte: 100, $lte: 1500 }
}).sort({ precio: 1 }).explain("executionStats");

const stagePrincipal = explainDespues.executionStats.executionStages.stage;
const stageHijo = explainDespues.executionStats.executionStages.inputStage 
  ? explainDespues.executionStats.executionStages.inputStage.stage 
  : "N/A";

print(`Etapa principal: ${stagePrincipal}`);
print(`Etapa de escaneo de índice (inputStage): ${stageHijo}`);
print(`Documentos examinados (docsExamined): ${explainDespues.executionStats.totalDocsExamined}`);
print(`Claves de índice examinadas (totalKeysExamined): ${explainDespues.executionStats.totalKeysExamined}`);
print(`Documentos devueltos (nReturned): ${explainDespues.executionStats.nReturned}`);
print("\n[🎯 Conclusión Pedagógica]: Se pasa de un escaneo completo de colección (COLLSCAN) a un escaneo de índice selectivo (IXSCAN), optimizando el tiempo y reduciendo I/O a disco.");
