/**
 * PRÁCTICA 01: MODELADO CON MONGODB - SISTEMAS BIG DATA
 * Script 01: Creación de Colecciones y Esquemas de Validación ($jsonSchema)
 * 
 * Uso:
 * mongosh "mongodb://admin:secretpassword123@localhost:27017/ecommerce_db?authSource=admin" scripts/01-colecciones-validacion.js
 */

const dbName = "ecommerce_db";
const currentDb = db.getSiblingDB(dbName);

print(`[+] Inicializando base de datos: ${dbName}`);

// 1. Limpieza inicial (idempotencia)
currentDb.productos.drop();
currentDb.usuarios.drop();
currentDb.reviews.drop();
currentDb.pedidos.drop();

// ============================================================================
// 2. Colección: PRODUCTOS
// Decisiones:
// - Variantes (tallas/colores) y Especificaciones Técnicas van EMBEBIDAS
// - Se validan tipos, obligatorios, rango de precios y enum de categorías
// ============================================================================
currentDb.createCollection("productos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sku", "nombre", "categoria", "precio", "activo", "variantes"],
      properties: {
        sku: {
          bsonType: "string",
          pattern: "^[A-Z0-9-]{4,15}$",
          description: "SKU alfanumérico único obligatorio (4-15 caracteres)"
        },
        nombre: {
          bsonType: "string",
          description: "Nombre del producto (cadena de texto obligatoria)"
        },
        categoria: {
          enum: ["electronica", "ropa", "hogar", "deportes"],
          description: "Categoría debe ser una de las enumeradas"
        },
        precio: {
          bsonType: ["double", "int", "decimal"],
          minimum: 0.01,
          description: "Precio numérico positivo mayor o igual a 0.01"
        },
        activo: {
          bsonType: "bool",
          description: "Estado lógico de activación (true/false)"
        },
        especificaciones: {
          bsonType: "object",
          description: "Documento embebido con atributos polimórficos variables"
        },
        variantes: {
          bsonType: "array",
          minItems: 1,
          description: "Array embebido de variantes acotadas (talla, color, stock)",
          items: {
            bsonType: "object",
            required: ["sku_variante", "stock"],
            properties: {
              sku_variante: { bsonType: "string" },
              color: { bsonType: "string" },
              talla: { bsonType: "string" },
              stock: {
                bsonType: "int",
                minimum: 0,
                description: "Stock entero no negativo"
              }
            }
          }
        },
        fecha_creacion: {
          bsonType: "date",
          description: "Fecha de alta en catálogo"
        }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});
print("[✔] Colección 'productos' creada con $jsonSchema estricto.");

// ============================================================================
// 3. Colección: USUARIOS
// ============================================================================
currentDb.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "nombre", "activo", "rol"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email con formato válido"
        },
        nombre: { bsonType: "string" },
        rol: {
          enum: ["cliente", "soporte", "admin"],
          description: "Rol asignado al usuario"
        },
        activo: { bsonType: "bool" },
        direcciones: {
          bsonType: "array",
          description: "Direcciones de envío embebidas (1 a pocas)",
          items: {
            bsonType: "object",
            required: ["calle", "ciudad", "codigo_postal"],
            properties: {
              calle: { bsonType: "string" },
              ciudad: { bsonType: "string" },
              codigo_postal: { bsonType: "string" }
            }
          }
        }
      }
    }
  }
});
print("[✔] Colección 'usuarios' creada con $jsonSchema.");

// ============================================================================
// 4. Colección: REVIEWS (Reseñas)
// Decisión: Colección separada con REFERENCIA a producto_id y usuario_id
// Justificación: Evita que el documento del producto crezca sin límite (>16 MB)
// ============================================================================
currentDb.createCollection("reviews", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["producto_id", "usuario_id", "puntuacion", "fecha"],
      properties: {
        producto_id: {
          bsonType: "objectId",
          description: "Referencia obligatoria a producto._id"
        },
        usuario_id: {
          bsonType: "objectId",
          description: "Referencia obligatoria a usuario._id"
        },
        puntuacion: {
          bsonType: "int",
          minimum: 1,
          maximum: 5,
          description: "Puntuación entera entre 1 y 5 estrellas"
        },
        comentario: { bsonType: "string" },
        fecha: { bsonType: "date" }
      }
    }
  }
});
print("[✔] Colección 'reviews' creada con $jsonSchema.");

// ============================================================================
// 5. Colección: PEDIDOS
// Decisión: Referencia a usuario_id y EMBEBIDO de items con snapshot de precio
// Justificación: Consistencia histórica. Si el producto cambia de precio en el
// futuro, el pedido debe conservar el precio original pactado.
// ============================================================================
currentDb.createCollection("pedidos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["usuario_id", "fecha_pedido", "estado", "lineas", "total"],
      properties: {
        usuario_id: { bsonType: "objectId" },
        fecha_pedido: { bsonType: "date" },
        estado: {
          enum: ["pendiente", "pagado", "enviado", "cancelado"],
          description: "Estado del ciclo de vida del pedido"
        },
        total: {
          bsonType: ["double", "int", "decimal"],
          minimum: 0.01
        },
        lineas: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["producto_id", "sku", "nombre", "precio_unitario", "cantidad"],
            properties: {
              producto_id: { bsonType: "objectId" },
              sku: { bsonType: "string" },
              nombre: { bsonType: "string" },
              precio_unitario: { bsonType: ["double", "int", "decimal"] },
              cantidad: { bsonType: "int", minimum: 1 }
            }
          }
        }
      }
    }
  }
});
print("[✔] Colección 'pedidos' creada con $jsonSchema.");

print("[🎉] Todas las colecciones y validadores se han configurado exitosamente.");
