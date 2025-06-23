const express = require("express");
const { Pool } = require("pg");
const app = express();
const port = process.env.PORT || 3000;

// Configuración de la conexión a PostgreSQL (puede apuntar a un balanceador de carga o al maestro)
const pool = new Pool({
  user: "postgres",
  host: "192.168.2.133", // Cambiar a la IP del servidor maestro o balanceador de carga
  database: "encuestas_db",
  password: "0000", // Cambiar por la contraseña real
  port: 5432,
});

app.use(express.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
// CRUD para Usuarios
// Crear usuario
app.post("/api/usuarios", async (req, res) => {
  const { nombre, email } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING *",
      [nombre, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// Leer todos los usuarios
app.get("/api/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Actualizar usuario
app.put("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, email } = req.body;
  try {
    const result = await pool.query(
      "UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3 RETURNING *",
      [nombre, email, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// Eliminar usuario
app.delete("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// CRUD para Encuestas
// Crear encuesta
app.post("/api/encuestas", async (req, res) => {
  const { usuario_id, pregunta, opciones } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO encuestas (usuario_id, pregunta, opciones) VALUES ($1, $2, $3) RETURNING *",
      [usuario_id, pregunta, opciones]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: "Error al crear encuesta" });
  }
});

// Leer todas las encuestas
app.get("/api/encuestas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM encuestas");
    res.json(result.rows);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: "Error al obtener encuestas" });
  }
});

// Votar en una encuesta
app.post("/api/encuestas/:id/votar", async (req, res) => {
  const { id } = req.params;
  const { opcion } = req.body;
  try {
    const result = await pool.query(
      "UPDATE encuestas SET opciones = jsonb_set(opciones, $1, (opciones->>$1)::int + 1) WHERE id = $2 RETURNING *",
      [`{${opcion}}`, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Encuesta no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: "Error al votar" });
  }
});

// Leer resultados de una encuesta
app.get("/api/encuestas/:id/resultados", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT opciones FROM encuestas WHERE id = $1",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Encuesta no encontrada" });
    }
    res.json(result.rows[0].opciones);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: "Error al obtener resultados" });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
