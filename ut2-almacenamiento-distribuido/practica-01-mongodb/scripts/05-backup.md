# Procedimientos de Copia, Seguridad y Límites Arquitectónicos

Este documento detalla las operaciones de administración, seguridad y gobierno del dato para la solución documental en MongoDB.

---

## 1. Copia de Seguridad y Restauración

### A) Generación de Copia de Seguridad con `mongodump`

Para extraer un volcado consistente en formato BSON comprimido:

```bash
# Realizar backup comprimido de la base de datos ecommerce_db
mongodump \
  --uri="mongodb://admin:secretpassword123@localhost:27017/ecommerce_db?authSource=admin" \
  --gzip \
  --out=/backups/backup_$(date +%Y%m%d_%H%M%S)
```

- `--gzip`: Reduce el espacio en disco hasta un 70%.
- `--out`: Guarda el volcado estructurado por colecciones en formato `.bson.gz` junto con los metadatos de índices en `.metadata.json.gz`.

### B) Procedimiento de Restauración con `mongorestore`

Para restaurar el estado en caso de contingencia o en un entorno de preproducción:

```bash
# Restaurar reemplazando las colecciones existentes (--drop)
mongorestore \
  --uri="mongodb://admin:secretpassword123@localhost:27017/ecommerce_db?authSource=admin" \
  --gzip \
  --drop \
  --dir=/backups/backup_20261004_120000/ecommerce_db
```

- `--drop`: Elimina las colecciones antes de importar para evitar duplicados en documentos con claves únicas.

---

## 2. Usuarios, Roles y Permisos Mínimos (RBAC)

Siguiendo el principio de mínimo privilegio, no se debe utilizar el usuario `admin` en la aplicación:

```javascript
// Conectado como admin en mongosh:
use admin;

// 1. Rol de la Aplicación Web (Acceso exclusivo de lectura y escritura en su BD)
db.createUser({
  user: "ecommerce_app_user",
  pwd: "AppPasswordSegura2026!",
  roles: [
    { role: "readWrite", db: "ecommerce_db" }
  ]
});

// 2. Rol para Operaciones de Backup Automatizadas
db.createUser({
  user: "backup_operator",
  pwd: "BackupOperatorPass2026!",
  roles: [
    { role: "backup", db: "admin" },
    { role: "restore", db: "admin" }
  ]
});
```

---

## 3. Seguridad, Cifrado y Anonimización de Datos

- **Cifrado en reposo:** Debe habilitarse mediante WiredTiger Encryption (o KMS en MongoDB Atlas).
- **Cifrado en tránsito:** Obligatoriedad de TLS/SSL en las cadenas de conexión (`tls=true`).
- **Anonimización para entornos de prueba:**
  - Los campos sensibles de la colección `usuarios` (`email`, `direcciones`) deben anonimizarse mediante scripts antes de pasar volcados a desarrollo.
  - El campo `password` (si se almacenase) nunca debe volcarse o debe sustituirse por un hash dummy.

---

## 4. Cuándo MongoDB NO es la Mejor Opción

1. **Grafos de alta profundidad y relaciones intensivas M:N:** 
   - Si el sistema requiriese trazabilidad de dependencias de red logística o grafos de recomendación social complejos, motores nativos de grafos como **Neo4j** son infinitamente más eficientes que múltiples `$lookup` encadenados.
2. **Transacciones ACID multi-documento a gran escala con bloqueos estrictos:**
   - Para pasarelas contables de conciliación bancaria estricta de doble partida con cientos de cuentas cruzadas simultáneas, un motor RDBMS relacional tradicional (PostgreSQL) ofrece mejor predictibilidad frente a la concurrencia distribuida.

---

## 5. Política de Retención y Archivado de Datos

- **Colección `pedidos`:**
  - Conservación activa en caliente durante 2 años (para consultas de clientes y devoluciones).
  - A partir de 2 años, exportación a un Data Lake en formato Parquet (ej. AWS S3) para analítica histórica de Big Data.
- **Colección `reviews`:**
  - Conservación indefinida mientras el producto esté en catálogo. Si un producto se da de baja definitiva, se archivan en frío.
- **Colección `carritos_abandonados` (si existiera):**
  - Implementación de un índice TTL (`expireAfterSeconds: 604800`) para borrado automático tras 7 días sin actividad.
