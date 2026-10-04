# Soluciones - Sistemas Big Data (FP Informática)

Repositorio centralizado con las soluciones guiadas, código fuente, scripts reproducibles y entornos Docker para las prácticas de la asignatura **Sistemas Big Data**.

---

## Estructura de Unidades y Prácticas

| Unidad | Práctica | Tecnologías | Enlace |
| :--- | :--- | :--- | :--- |
| **UT2: Almacenamiento y Sistemas Distribuidos** | Práctica 01: Modelado Documental con MongoDB | MongoDB, Mongosh, Docker | [Ver Solución](ut2-almacenamiento-distribuido/practica-01-mongodb/) |
| **UT2: Almacenamiento y Sistemas Distribuidos** | Práctica 02: Solución con DynamoDB | AWS DynamoDB, NoSQL | *(Próximamente)* |
| **UT2: Almacenamiento y Sistemas Distribuidos** | Práctica 03: Grafo con Neo4j | Neo4j, Cypher | *(Próximamente)* |

---

## Cómo utilizar este repositorio en clase

Cada práctica incluye:
1. `docker-compose.yml`: Entorno autocontenido y listo para levantar con un único comando (`docker compose up -d`).
2. `scripts/`: Scripts `.js` ordenados numéricamente para ejecutar con el cliente CLI oficial (`mongosh`, etc.).
3. `docs/`: Diagramas de arquitectura, justificación del modelo y evidencias de ejecución.
4. `README.md`: Guía de ejecución paso a paso pensada para docentes y alumnos.
