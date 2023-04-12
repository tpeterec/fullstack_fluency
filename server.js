// setup dependencies
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
// intialize env
dotenv.config();
//intialize express
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("client"));
// intialize pg
const { Pool } = require("pg");
const port = process.env.PORT || 3000;
const connectionSTring = process.env.STRING;
const pool = new Pool({ connectionString: connectionSTring });

// API Routes
// Get all tasks
app.get("/api/todo", (req, res) => {
  pool
    .query("SELECT * FROM todolist")
    .then((result) => {
      console.log(result.rows);
      res.send(result.rows);
    })
    .catch((e) => console.error(e.stack));
});

// Get a select task
app.get("/api/todo/:id", (req, res) => {
  pool
    .query(`SELECT * FROM todolist where id = $1`, [req.params.id])
    .then((result) => {
      if (result.rows.length == 0) {
        res.status(404).send("task not found");
      } else {
        res.send(result.rows);
      }
    });
});

// Create a task
app.post("/api/todo", (req, res) => {
  pool
    .query(
      `INSERT INTO todolist (task, location, description) VALUES ($1, $2, $3) RETURNING *`,
      [req.body.task, req.body.location, req.body.description]
    )
    .then((result) => {
      res.send(result.rows);
    });
});

// Updates a task
app.patch("/api/todo/:id", (req, res) => {
  let data = req.body;
  const query = `UPDATE todolist SET task = COALESCE($1, task), location = COALESCE($2, location), description = COALESCE($3, description) WHERE id = $4 RETURNING *`;
  const values = [
    data.task || null,
    data.location || null,
    data.description || null,
    req.params.id || null,
  ]; // if value exists, add value to array, if not set set null
  pool.query(query, values).then((result) => {
    if (result.rows.length === 0) {
      res.send(
        "Task not found. Insert correct task information of an existing task"
      );
    } else {
      res.send(result.rows[0]);
    }
  });
});

// Deletes a task
app.delete("/api/todo/:id", (req, res) => {
  pool
    .query(`DELETE FROM todolist WHERE id = $1 RETURNING *`, [req.params.id])
    .then((result) => {
      if (result.rows.length == 0) {
        res
          .status(404)
          .send(
            "Task not found. Insert correct task information of an existing task"
          );
      } else {
        res.send(result.rows);
      }
    });
});

// Listen on port
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
