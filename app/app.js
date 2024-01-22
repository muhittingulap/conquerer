const express = require("express");
const cors = require("cors");
const { Sequelize } = require('sequelize');

const { json, urlencoded } = require("body-parser");
require('dotenv').config({ path: './src/config/.env' });

const { elasticSearchConnection } = require("./src/libs/elasticClient");

// sequelize postgreSQL bağlantısını yaptım.
const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: process.env.POSTGRES_HOST,
  dialect: 'postgres',
  logging: false
});

// App oluşturuluyor
const app = express();
const router = require("./src/routes/index");
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true, limit: '50mb' }));

app.use("/", router);

app.all("*", function (req, res) {
  res.json({ message: 'Conquerer API System Endpoints' });
});

const PORT = process.env.NODE_PORT;
app.listen(PORT, async () => {
  console.log(`Successfully API System Started `);

  try {
    await elasticSearchConnection();
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});
