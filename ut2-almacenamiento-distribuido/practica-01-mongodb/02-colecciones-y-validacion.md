# Paso 2: Creación de Colecciones y Validación ($jsonSchema)

Aunque MongoDB es una base de datos flexible, en un entorno profesional de Big Data no podemos permitir que entre "basura" o datos corruptos (por ejemplo, productos sin nombre o precios negativos).

Para resolver esto, usamos **`$jsonSchema`**: una regla que le dice a MongoDB qué formato y tipos deben tener los documentos que se guarden.

---

## 1. Comandos para Crear las Colecciones

Copia y pega estos bloques de código directamente en tu terminal de `mongosh` con la base de datos `ecommerce_db` seleccionada:

### Colección 1: `productos`
Obligamos a que cada producto tenga SKU, nombre, categoría válida, precio positivo y al menos una variante de stock.

```javascript
db.createCollection("productos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sku", "nombre", "categoria", "precio", "activo", "variantes"],
      properties: {
        sku: {
          bsonType: "string",
          pattern: "^[A-Z0-9-]{4,15}$",
          description: "Debe ser un código alfanumérico en mayúsculas de entre 4 y 15 caracteres"
        },
        nombre: {
          bsonType: "string",
          description: "Nombre obligatorio del producto"
        },
        categoria: {
          enum: ["electronica", "ropa", "hogar", "deportes"],
          description: "Solo permitimos estas cuatro categorías"
        },
        precio: {
          bsonType: ["double", "int", "decimal"],
          minimum: 0.01,
          description: "El precio no puede ser cero ni negativo"
        },
        activo: {
          bsonType: "bool",
          description: "Indica si el producto está a la venta o no"
        },
        especificaciones: {
          bsonType: "object",
          description: "Objeto libre con características técnicas según el producto"
        },
        variantes: {
          bsonType: "array",
          minItems: 1,
          description: "Debe tener como mínimo una variante",
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
                description: "El stock no puede ser negativo"
              }
            }
          }
        }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});
```

---

### Colección 2: `usuarios`
Validamos que el email tenga formato correcto y el rol sea válido.

```javascript
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "nombre", "activo", "rol"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Formato de correo electrónico válido"
        },
        nombre: { bsonType: "string" },
        rol: {
          enum: ["cliente", "soporte", "admin"],
          description: "Roles permitidos en la plataforma"
        },
        activo: { bsonType: "bool" },
        direcciones: {
          bsonType: "array",
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
```

---

### Colección 3: `reviews` (Reseñas)
Validamos que la puntuación sea un número entero del 1 al 5 y que guarde el ID del producto y del usuario.

```javascript
db.createCollection("reviews", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["producto_id", "usuario_id", "puntuacion", "fecha"],
      properties: {
        producto_id: { bsonType: "objectId" },
        usuario_id: { bsonType: "objectId" },
        puntuacion: {
          bsonType: "int",
          minimum: 1,
          maximum: 5,
          description: "Puntuación de 1 a 5 estrellas"
        },
        comentario: { bsonType: "string" },
        fecha: { bsonType: "date" }
      }
    }
  }
});
```

---

### Colección 4: `pedidos`
Validamos que el estado del pedido sea coherente y que guarde las líneas de compra.

```javascript
db.createCollection("pedidos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["usuario_id", "fecha_pedido", "estado", "lineas", "total"],
      properties: {
        usuario_id: { bsonType: "objectId" },
        fecha_pedido: { bsonType: "date" },
        estado: {
          enum: ["pendiente", "pagado", "enviado", "cancelado"]
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
```

---

## 2. Demostración Práctica: ¿Cómo sabemos que la validación funciona?

Para comprobarlo en clase ante los alumnos, ejecutamos una inserción errónea a propósito (precio negativo y sin variantes):

```javascript
db.productos.insertOne({
  sku: "ERR-001",
  nombre: "Producto con errores",
  categoria: "electronica",
  precio: -25.00,
  activo: true,
  variantes: []
});
```

### ¿Qué responde MongoDB?
MongoDB **rechaza la operación** y muestra este error:
```text
MongoServerError[DocumentValidationFailure]: Document failed validation
Details: properties.precio (minimum 0.01 comparison failed), properties.variantes (minItems 1 failed)
```

> **Explicación para los alumnos:** Demuestra que NoSQL no es sinónimo de desorden. Hemos blindado la base de datos a nivel de motor.
