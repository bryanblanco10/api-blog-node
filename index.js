'use strict' //Mejores practicas, hacer el codigo estricto y mas moderno.

var mongoose = require('mongoose'); //Cargando modulo de mogoose
var app = require('./app');
var port = 3900;

mongoose.set('useFindAndModify', false); //Para que desactive la forma de trabajar antigua.
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_blog', {useNewUrlParser: true})
	.then(()=> {
		console.log('La coneccion es correcta');

		//Crear servidor para que escuche petiones HTTP
		app.listen(port, () => {
			console.log('Servidor corriendo en http://localhost:' + port);
		});
	});

