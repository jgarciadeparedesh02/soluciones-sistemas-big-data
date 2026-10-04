# Paso 6: Copias de Seguridad, Seguridad y Buenas Prácticas

Una base de datos de producción no está completa sin una política clara de seguridad, copias de respaldo y gobierno del dato.

---

## 1. Copia de Seguridad y Restauración con Atlas

Al trabajar con un clúster en la nube, podemos generar volcados comprimidos directamente desde nuestra máquina local usando las herramientas oficiales de MongoDB Database Tools.

### A) Hacer una copia con `mongodump`

Abre una nueva terminal en tu ordenador (fuera de `mongosh`):

```bash
mongodump --uri="mongodb+srv://cluster0.kkqxxz5.mongodb.net/ecommerce_db" --username jgarciadeparedesh02_db_user --gzip --out=./backup_mongo
```

- **`--gzip`:** Comprime los datos para que el archivo ocupe hasta un 70% menos de espacio.
- **`--out`:** Carpeta local donde se guardarán los archivos `.bson.gz`.

### B) Restaurar una copia con `mongorestore`

Si ocurre un desastre o queremos recuperar el estado anterior:

```bash
mongorestore --uri="mongodb+srv://cluster0.kkqxxz5.mongodb.net/ecommerce_db" --username jgarciadeparedesh02_db_user --gzip --drop --dir=./backup_mongo/ecommerce_db
```

- **`--drop`:** Borra las colecciones actuales antes de restaurar para evitar que se dupliquen documentos con el mismo `_id`.

---

## 2. Seguridad y Usuarios (Principio de Menor Privilegio)

Nunca debemos conectar la aplicación web (la tienda) usando el usuario administrador `jgarciadeparedesh02_db_user`. Si alguien hackea la tienda online, tendría acceso a borrar todo el clúster.

En MongoDB Atlas creamos dos perfiles claramente diferenciados:

1. **Usuario de Aplicación (`ecommerce_app_user`):**
   - Rol: `readWrite` únicamente sobre la base de datos `ecommerce_db`.
   - No puede crear usuarios ni borrar bases de datos enteras.
2. **Usuario Administrador:**
   - Rol: `atlasAdmin` o `readWriteAnyDatabase`. Protegido con autenticación en dos pasos (2FA) y acceso limitado por lista blanca de IPs.

---

## 3. Privacidad y Anonimización de Datos

Si queremos llevarnos una copia de la base de datos a un entorno de pruebas o desarrollo para que los alumnos practiquen:
- Debemos **anonimizar** los datos personales (cumplimiento RGPD).
- Los correos reales se transforman en `usuario_anonimo_1@test.local`.
- Las direcciones postales reales se eliminan o se sustituyen por datos ficticios.

---

## 4. ¿Cuándo MongoDB NO es la mejor opción?

Es fundamental saber cuándo una tecnología documental no encaja bien:

1. **Relaciones en Grafo Profundas:**
   - Si tuviésemos una red social compleja donde queremos saber *"los amigos de los amigos de mis amigos que compraron X producto"*, MongoDB requeriría demasiados `$lookup` encadenados. En este caso, **Neo4j** es mucho más rápido y natural.
2. **Contabilidad Bancaria Estricta de Doble Partida:**
   - Si requerimos transacciones bancarias ultraestrictas que mueven dinero entre múltiples tablas con bloqueos pesados y esquemas rígidos, un motor relacional como **PostgreSQL** sigue siendo el estándar de la industria.
