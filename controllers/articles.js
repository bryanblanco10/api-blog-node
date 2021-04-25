'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');
var Article = require('../models/article');

var controller = {
	//Metodos de prueba
	datosCurso: (req, res) => {
		return res.status(200).send({
			name: 'Bryan Blanco',
			curso: 'Master en JS',
			url: 'bryan10.com'
		});
	},

	test: (req, res) => {
		return res.status(200).send({
			message: 'Soy la accion test de mi controlador de articulos'
		});
	},

	//Metodo para guardar articulo
	save: (req, res) => {

		//Recoger parametros por post
		var params = req.body;
		//Validar datos con (validator)
		try{
			var validar_title = !validator.isEmpty(params.title);
			var validar_content = !validator.isEmpty(params.content);
		}catch(err){
			return res.status(200).send({
				status: 'error',
				message: 'Faltan datos por enviar'
			});
		}
		if (validar_title && validar_content) {
			//Crear el objeto a guardar.
			var article = new Article();
			//Asignar valores
			article.title = params.title;
			article.content = params.content;
			article.image = null;
			//Guardar articulo
			article.save((err, articleStored) => {
				if (err || !articleStored) {
					return res.status(404).send({
						status: 'error',
						message: 'El articulo no se ha guardado'
					});
				}
				//Devolver una respuesta
				return res.status(200).send({
						status: 'success',
						article: articleStored
					});
			});
		}else{
			return res.status(200).send({
				status: 'error',
				message: 'Los datos no son validos'
			});
		}
	},

	//Metodo para listar todos los articulos
	getArticles: (req, res) => {
		var query = Article.find({});

		//Consultar ultimos articulos
		var last = req.params.last;

		if(last || last != undefined){
			query.limit(5);
		}
		//find
		query.sort('-_id').exec((err, articles) => {
			if (err) {
				return res.status(500).send({
					status: 'error',
					message: 'Error al traer los articulos'
				});
			}
			if (!articles) {
				return res.status(404).send({
					status: 'error',
					message: 'No hay articulos para mostrar'
				});
			}
			return res.status(200).send({
				status: 'success',
				articles
			});
		});
	},

	//Metodo para obtener un solo articulo
	getArticle: (req, res) => {
		//Recoger el id de la url
		var articleId = req.params.id;
		//Comprobar que existe
		if (!articleId || articleId == null) {
			return res.status(404).send({
				status: 'error',
				message: 'No existe el articulo'
			});
		}
		//Buscar el articulo
		Article.findById(articleId, (err, article) => {

			if (err || !article) {
				return res.status(404).send({
					status: 'error',
					message: 'No existe el articulo'
				});
			}
			//Devolverlo en json
			return res.status(200).send({
				status: 'success',
				article
			});
		});
	},

	//Metodo para actulizar un articulo
	update: (req, res) => {
		//Recoger el id de la url
		var articleId = req.params.id;

		//Recoger los datos que llegan por put
		var params = req.body;

		//Validar los datos
		try{
			var validar_title = !validator.isEmpty(params.title);
			var validar_content = !validator.isEmpty(params.content);
		}catch(err){
			return res.status(200).send({
				status: 'error',
				message: 'Faltan datos por enviar'
			});
		}
		if (validar_title && validar_content) {
			//find and update
			Article.findOneAndUpdate({_id: articleId}, params, {new: true}, (err, articleUpdated) => {
				if (err) {
					return res.status(500).send({
						status: 'error',
						message: 'Error al actulizar'
					});
				}
				if (!articleUpdated) {
					return res.status(404).send({
						status: 'error',
						message: 'No existe el articulo'
					});
				}

				return res.status(200).send({
					status: 'error',
					article: articleUpdated
				});
			});
		}else{
			//Devolver respuesta
			return res.status(200).send({
				status: 'error',
				message: 'La validacion no es correcta'
			});
		}
	},

	//Metodod para eliminar un articulo
	delete: (req, res) => {
		//Recoger el id de la url
		var articleId = req.params.id;

		//find and delete
		Article.findOneAndDelete({_id: articleId}, (err, articleRemoved) => {
			if (err) {
				return res.status(500).send({
					status: 'error',
					message: 'Error al borrar'
				});
			}
			if (!articleRemoved) {
				return res.status(404).send({
					status: 'error',
					message: 'El articulo que intenta borrar no existe'
				});
			}

			return res.status(200).send({
				status: 'success',
				article: articleRemoved
			});
		});
	},

	//Metodo para guardar la imagen de un articulo
	upload: (req, res) => {
		//Configurar el modulo de connect multiparty en router/article.js (hecho)

		//Recoger el fichero de la peticion.
		var file_name = 'Imagen no subida...';

		if (!req.files) {
			return res.status(404).send({
				status: 'Error',
				message: file_name
			});
		}
		//Conseguir nombre y la extension del archivo.
		var file_path = req.files.file0.path;
		var file_split = file_path.split('\\');

		//ADVERTENCIA para Linux o Mac
		// var file_split = file_path.split('/');

		//Nombre del archivo
		var file_name = file_split[2];

		//Extension del fichero
		var extension_split = file_name.split('\.');
		var file_ext = extension_split[1];

		//Comprobar la extension, solo imagenes, si no es valida borrar el archivo.
		if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
			//Borrar el archivo subido
			fs.unlink(file_path, (err) =>{
				return res.status(200).send({
					status: 'Error',
					message: 'La extension de la imagen no es valida'
				});
			});
		}else{
			//Si todo es valido, obtener el id de la url
			var articleId = req.params.id;

			//Buscar el articulo, asignarle el nombre de la imagen y actualizarlo.
			Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new: true}, (err, articleUpdated) => {
				if (err || !articleUpdated) {
					return res.status(404).send({
						status: 'error',
						message: 'Error al guardar la imagen del articulo'
					});
				}
				return res.status(200).send({
					status: 'success',
					article: articleUpdated
				});
			});
		}
	},

	//Metodo para obtener la imagen y poder mostrarla en el frontend
	getImage: (req, res) => {
		const file = req.params.image;
		let path_file
		if(file == 'null'){
			const defa = 'default.png'
			console.log('entre')
			path_file = './upload/articles/' + defa;
		}else{
			path_file = './upload/articles/' + file;
		}

		fs.exists(path_file, (exists) => {
			if (exists) {
				return res.sendFile(path.resolve(path_file));
			}else{
				return res.status(404).send({
					status: 'Error',
					message: 'La imagen no existe'
				});
			}
		});
	},

	//Metodo para buscar articulos
	search: (req, res) => {
		//Sacar el String a buscar
		var searchString = req.params.search;

		//Find or
		Article.find({'$or': [
			//Si el searchString esta "i" incluido dentro del titulo o content,saca los articulos
			{"title": {"$regex": searchString, "$options": "i"}},
			{"content": {"$regex": searchString, "$options": "i"}}
		]})
		.sort([['date', 'descending']])
		.exec((err, articles) => {
			if (err) {
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}
			if (!articles || articles.length <= 0) {
				return res.status(404).send({
					status: 'error',
					message: 'No hay articulos que coincidan con tu busqueda'
				});
			}
			return res.status(200).send({
				status: 'success',
				articles
			});
		})
	}

	//end del controllador
};
module.exports = controller;