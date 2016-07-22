module.exports = (function (app){

	app.route('/index')

	.get(function (request, response){

		if (request.session._id){
				var Survey = require('../models/survey_model');
				Survey.find({user_id:request.session.user_id}, function (err,doc){

					response.render('index',{surveys:doc});
						
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
				response.render('new_survey',{id: request.session.user_id, nombre: request.cookies.nombre, direccion: request.cookies.direccion, correo: request.cookies.correo});
			}
		else{
				request.session.destroy(function (err){
				response.redirect('/');
			})
		}

	})

	app.route('/newUser')

	.get(function (request, response){

		response.render('new_user');

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

});
