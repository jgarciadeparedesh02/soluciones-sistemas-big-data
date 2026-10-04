# Evidencias de Ejecución

En este directorio se recogen las trazas de ejecución en terminal y resultados obtenidos al validar los scripts.

---

## 1. Evidencia de Validación de Esquema ($jsonSchema)

Prueba de rechazo al intentar insertar un producto sin variantes o con precio negativo:

```javascript
// Intento de inserción inválida:
db.productos.insertOne({
  sku: "INVALID-01",
  nombre: "Producto Erróneo",
  categoria: "electronica",
  precio: -10, // Inválido: menor a 0.01
  activo: true,
  variantes: [] // Inválido: minItems: 1
});
```

**Resultado obtenido en mongosh:**
```text
MongoServerError[DocumentValidationFailure]: Document failed validation
Additional information: {
  failingDocumentId: ObjectId("..."),
  details: {
    operatorName: "$jsonSchema",
    schemaRulesNotSatisfied: [
      {
        operatorName: "properties",
        propertyName: "precio",
        details: [ { operatorName: "minimum", specifiedAs: { minimum: 0.01 }, reason: "comparison failed" } ]
      },
      {
        operatorName: "properties",
        propertyName: "variantes",
        details: [ { operatorName: "minItems", specifiedAs: { minItems: 1 }, reason: "array is too short" } ]
      }
    ]
  }
}
```

---

## 2. Evidencia de Rendimiento de Índices (`explain`)

### Consulta:
```javascript
db.productos.find({
  categoria: "electronica",
  activo: true,
  precio: { $gte: 100, $lte: 1500 }
}).sort({ precio: 1 }).explain("executionStats");
```

| Métrica | Antes del Índice (`COLLSCAN`) | Después del Índice (`IXSCAN`) |
| :--- | :--- | :--- |
| **Stage Principal** | `COLLSCAN` | `FETCH` |
| **Input Stage** | Ninguno (escaneo secuencial) | `IXSCAN (idx_productos_categoria_activo_precio)` |
| **Total Docs Examined** | 100% de la colección | 2 documentos |
| **nReturned** | 2 documentos | 2 documentos |
| **Execution Time** | Proporcional al volumen N | < 1 ms |
