'use strict'

//Cargar modulos de node para crear el servidor.
var express = require('express');
var bodyParser = require('body-parser');
let cors = require('cors')

//Ejecutar express (http)
var app = express();

//Cargar ficheros rutas
var article_routes = require('./routes/article');

//Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//CORS
// Configurar cabeceras y cors
app.use(cors())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Añadir prefijos a las rutas. / cargar rutas
app.use('/api', article_routes);

//Ruta o metodo de prueba para el API REST
// app.get('/probando', (req, res) => {
// 	return res.status(200).send({
// 		name: 'Bryan Blanco',
// 		curso: 'Master en JS',
// 		url: 'bryan10.com'
// 	});
// });
//Exportar modulo (fichero actual)
module.exports = app;