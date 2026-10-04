# Práctica 01: Diseña una Base de Datos Documental con MongoDB

Solución completa explicada paso a paso para la práctica de modelado documental de la **Unidad 2 (Sistemas Big Data)**, conectándonos directamente a un clúster de **MongoDB Atlas** en la nube.

---

## 1. Conexión Rápida al Clúster

Para trabajar en esta práctica no necesitas instalar servidores locales ni utilizar Docker. Conéctate directamente con la consola oficial **`mongosh`**:

```bash
mongosh "mongodb+srv://cluster0.kkqxxz5.mongodb.net/" --apiVersion 1 --username jgarciadeparedesh02_db_user
```

Una vez dentro de la terminal, selecciona la base de datos de trabajo:

```javascript
use ecommerce_db;
```

---

## 2. Guía de la Solución Paso a Paso

La solución está redactada en un lenguaje claro y accesible para alumnos de Formación Profesional, organizada en 6 pasos temáticos:

1. [**Paso 1: Conexión al Clúster y Diseño del Modelo**](01-conexion-y-modelo.md)
   - Explicación del caso de negocio de comercio electrónico.
   - La regla de oro en MongoDB: ¿cuándo incrustar (*embedding*) y cuándo referenciar (*referencing*)?
   - Diagrama visual de las colecciones.

2. [**Paso 2: Creación de Colecciones y Validación ($jsonSchema)**](02-colecciones-y-validacion.md)
   - Esquemas estrictos para `productos`, `usuarios`, `reviews` y `pedidos`.
   - Prueba práctica de rechazo provocada para evidenciar cómo MongoDB bloquea datos corruptos.

3. [**Paso 3: Carga de Datos de Prueba**](03-datos-de-prueba.md)
   - Bloques listos para copiar y pegar con datos sintéticos realistas y atributos polimórficos.

4. [**Paso 4: Índices y Optimización del Rendimiento**](04-indices-y-rendimiento.md)
   - Analogía sencilla de qué es un índice.
   - Demostración en vivo de la diferencia entre `COLLSCAN` (lento) y `IXSCAN` (rápido) con `explain("executionStats")`.
   - Regla ESR (*Equality, Sort, Range*) e índice de texto.

5. [**Paso 5: Consultas de Negocio y Agregaciones Complejas**](05-consultas-y-agregaciones.md)
   - Operaciones CRUD, borrado lógico (*soft delete*) y paginación estable.
   - Relaciones con `$lookup`.
   - Cuadro de mandos analítico multidimensional con `$facet` explicado como una cadena de montaje.

6. [**Paso 6: Copias de Seguridad, Seguridad y Buenas Prácticas**](06-seguridad-y-backups.md)
   - Procedimiento de backup y restore con `mongodump` y `mongorestore` sobre Atlas.
   - Principio de menor privilegio (RBAC) y límites arquitectónicos de MongoDB.
