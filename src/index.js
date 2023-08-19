const express = require('express')
const rotas = express()
const app = require('./servidor');

rotas.use(express.json())
rotas.use(app)

rotas.listen(3000);

