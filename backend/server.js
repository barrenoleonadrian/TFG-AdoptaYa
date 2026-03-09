const express = require("express");
const cors = require("cors");

const mascotasRoutes = require("./routes/mascotas");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/mascotas", mascotasRoutes);

app.listen(3000, () => {
    console.log("Servidor funcionando en puerto 3000");
});