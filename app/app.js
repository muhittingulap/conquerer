const express = require("express");
const cors = require("cors");

const { json, urlencoded } = require("body-parser");
require('dotenv').config({ path: './src/config/.env' });

const router = require("./src/routes/index");

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true, limit: '50mb' }));

app.use("/", router);

app.all("*", function (req,res) {
  res.json({ message: 'Conquerer API System Endpoints' });
});

const PORT = process.env.NODE_PORT;
app.listen(PORT, () => {
  console.log(`Successfully API System Started `);
});
