module.exports = (function (app, RedisClient, uuid){

	app.route('/index')

	.get(function (request, response){

		if (request.session._id){
				var Survey = require('../models/survey_model');
				Survey.find({user_id:request.session.user_id}, function (err,doc){

					response.render('index',{surveys:doc, user_id:request.session.user_id});
						
				})
				
			}
		else{
				request.session.destroy(function (err){
				response.redirect('/');
			})
		}

	})

	app.route('/survey/new')

	.get(function (request, response){

		if (request.session._id){
				response.render('new_survey',{id: request.session.user_id, nombre: decodeURIComponent(request.cookies.nombre), direccion: decodeURIComponent(request.cookies.direccion), correo: decodeURIComponent(request.cookies.correo), color: decodeURIComponent(request.cookies.color)});
			}
		else{
				request.session.destroy(function (err){
				response.redirect('/');
			})
		}

	})

	app.route('/survey/:_id/qr')

		.get(function (request, response){

			var survey_id = request.params._id;
			response.render('qr_survey',{survey_id: survey_id, user_id:request.session.user_id, nombre: decodeURIComponent(request.cookies.nombre), direccion: decodeURIComponent(request.cookies.direccion), correo: decodeURIComponent(request.cookies.correo), color: decodeURIComponent(request.cookies.color)})

		})

	app.route('/newUser')

	.get(function (request, response){

		response.render('new_user');

	})

	app.route('/update/user')

	.get(function (request, response){

		if (request.session._id){

			response.render('edit_user',{user_id: request.session.user_id});

		}
		else{
				request.session.destroy(function (err){
				response.render('login');
			})
		}

	})

	app.route('/')

	.get(function (request, response){

		if (request.session._id){
				response.redirect('/index');
			}
		else{
				request.session.destroy(function (err){
				response.render('login');
			})
		}

	})

	app.route('/answer/type/new')

	.get(function (request, response){

		if (request.session._id){
				response.render('new_answer_type',{id: request.session.user_id, nombre: decodeURIComponent(request.cookies.nombre), direccion: decodeURIComponent(request.cookies.direccion), correo: decodeURIComponent(request.cookies.correo), color: decodeURIComponent(request.cookies.color) });
			}
		else{
				request.session.destroy(function (err){
				response.redirect('/');
			})
		}

	})

	app.route('/survey/:_id')

	.get(function (request,response){

		var Survey = require('../models/survey_model');
		var  User = require('../models/user_model');
		var survey_id = request.params._id;

		

		Survey.findById(survey_id, function (err,sur){

			if(sur){

					User.findById(sur.user_id, function (err,usr){

						response.render('survey',{nombre:usr.nombre, direccion:usr.direccion, correo: usr.email,color:usr.color ,survey: sur});
						
					})

			}
			else{
				response.render('catch', {title:'404 Not Found', subtitle: 'No existe la encuesta, Asegurate de Ingresar de manera correcta tu URL'}) //sendStatus(404); //Dont Exist Survey, or Wrong id
			}

		})

	})

	app.route('/coming/soon')
		.get(function (request, response){

			response.render('catch', {title:'Estamos trabajando en nuestro Sitio', subtitle: 'Stay tuned for something amazing!'})

		})

	app.route('/answer/confirmation')
		.get(function (request, response){

			response.render('catch', {title:'¡Muchas Gracias!', subtitle: 'Pronto podrás recibir beneficios al participar de nuestras encuestas'})

		})

	app.route('/survey/qr/:_id')

	.get(function (request,response){

		var Survey = require('../models/survey_model');
		var  User = require('../models/user_model');
		var survey_id = request.params._id;

		

		Survey.findById(survey_id, function (err,sur){

			if(sur){

				if(request.cookie(survey_id)){

					RedisClient.exists(request.cookie(survey_id), function (err, reply){

						if(reply===1){
							


						} else {
							response.send(401); //Survey answered 
						}
					});
					
				}
				else{

					var uuid = uuid.v4();
					response.cookie(survey_id, uuid);

					RedisClient.set(uuid , sur._id, function (err, value){
						console.log('Token de Respuesta: '+value);
					});
					RedisClient.expire(uuid,3600);

					User.findById(sur.user_id, function (err,usr){

						response.render('survey',{nombre:usr.nombre, direccion:usr.direccion, correo: usr.email,color:usr.color ,survey: sur});
						
					})

				}
			}
			else{
				response.sendStatus(404); //Dont Exist Survey, or Wrong id
			}

		})

	})

});
