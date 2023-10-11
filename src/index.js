const express = require("express");
const rotas = require("./route");
const app = express();

app.use(express.json());
app.use(rotas);

app.listen(3000, () => console.log("Servidor ON."))