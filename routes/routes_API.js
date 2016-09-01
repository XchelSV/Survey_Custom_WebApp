module.exports = (function (app,RedisClient, uuid){

var path_module = require('path')
var User = require('../models/user_model');
var option_type = require('../models/type_model');
var Survey = require('../models/survey_model');
var Answer = require('../models/answer_model');

/*var newType = new option_type({

	nombre: 'Si/No',
	opciones: ['Sí','No']

})

newType.save(function(err){
	if (err) throw err;
})

var newType2 = new option_type({

	nombre: 'Bueno/Regular/Malo',
	opciones: ['Bueno','Regular','Malo']

})

newType2.save(function(err){
	if (err) throw err;
})*/


	app.route('/user/new')

		.post(function (request,response){

			var data = request.body.img64;

			function decodeBase64Image(dataString) {

			  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
			  image_array = {};

			  if (matches.length !== 3) {
			    return new Error('Invalid input string');
			  }

			  image_array.type = matches[1];
			  image_array.data = new Buffer(matches[2], 'base64');

			  return image_array;
			}


			var imageBuffer = decodeBase64Image(data);
			console.log(imageBuffer);
			var type;

			if (imageBuffer.type == 'image/jpeg') {
				type = '.jpg'
			}
			else{
				type = '.png'
			}
			

			User.findOne({nombre:request.body.nombre},function (err,user){

				if(user == undefined){

					var newUser = new User({

						nombre : request.body.nombre,
						direccion : request.body.direccion,
						password : request.body.contrasena,
						email : request.body.correo,
						color: request.body.color,
						image_path : type

					})

					newUser.save(function (err, user){

						var fs = require('fs');
						fs.writeFile('./public/images/userLogo/'+user._id+type, imageBuffer.data, function(err) { 

							if (err){
								User.remove({_id:user._id});
								response.sendStatus(500);
								throw err;	
							}
							else{
								response.sendStatus(200);
							}

						});
					})

				}
				else{
					response.sendStatus(401);
				}


			})

			


		})

	app.route('/loginApp')

		.post(function (request,response){

			User.findOne({nombre: request.body.name}, function (err , user){
				if (err) throw err;
				console.log(user);

				if(user != undefined){
					user.comparePassword(request.body.pass, function (err , pass){
						if (err) throw err;

							if(pass){


								request.session._id = uuid.v4();
								request.session.user_id = user._id;
								RedisClient.set(request.session._id , user._id, function (err, value){
									console.log('Token de Session: '+value);
								});
								RedisClient.expire(request.session._id,3600);


								response.cookie('nombre',user.nombre);
								response.cookie('direccion',user.direccion);
								response.cookie('correo',user.email);
								response.cookie('color',user.color);

								response.sendStatus(200);
							}
							else{
								
								response.sendStatus(401);

							}
					})
				}else
				{

					response.sendStatus(401);
					
				}

			})

		})

		app.route('/logout')

			.get(function (request,response){

				RedisClient.del(request.session._id, function (err,reply){
				
					request.session.destroy(function (err){

						response.clearCookie('correo');
						response.clearCookie('direccion');
						response.clearCookie('nombre');
						
						response.redirect('/');

					})


				})

			})

		app.route('/options/type')

			.get(function (request,response){

				if (request.session._id){

					option_type.find('',function (err,docs){

						if(err) throw err;

						response.send(docs);

					})

				}
						else{
								request.session.destroy(function (err){
								response.redirect('/');
							})
						}
				
			})

			.post(function (request,response){

				if (request.session._id){

					var newOption = new option_type({
						nombre: request.body.name,
						opciones: request.body.option_values
					})

					newOption.save(function (err,saved){

						if(err){
							throw err;
							response.sendStatus(500);
						}

						response.sendStatus(200);

					})

				}
						else{
								request.session.destroy(function (err){
								response.redirect('/');
							})
						}

				


			})

		
		

		var col_size;
		RedisClient.exists('col_size', function(err, reply) {
		    if (reply === 1) {
		        RedisClient.get("col_size", function (err,reply){
		        	col_size = reply;
		        })
		    } else {
				RedisClient.set("col_size", 12);
				col_size = 12;

		    }
		});

		app.route('/survey')

			.post(function (request,response){


				if (request.session._id){

					var col;
					if (col_size > 6){
						if(col_size == 7){
							col = Math.floor(Math.random() * (4 - 3 + 1) + 3)
							col_size = 	col_size - col;
							RedisClient.set("col_size", col_size);
						}
						else{
							col = Math.floor(Math.random() * (5 - 3 + 1) + 3)
							col_size = 	col_size - col;
							RedisClient.set("col_size", col_size);
						}
					}else{

						col = col_size;
						col_size = 12;
						RedisClient.set("col_size", col_size);

					}
					console.log(col_size);
					


					var date = new Date();
					var newSurvey = new Survey({

						user_id: request.session.user_id,
						nombre: request.body.nombre,
						date: date,
						descripcion: request.body.descripcion,
						preguntas: request.body.preguntas,
						tamano_col: 'm'+ String(col)

					})

					newSurvey.save(function (err, saved){

						if(err){
							throw err;
							response.sendStatus(500);
						}

						response.sendStatus(200);

					})

				}
						else{
								request.session.destroy(function (err){
								response.redirect('/');
							})
						}

				

			})

		app.route('/survey/:survey_id/answers')

			.get(function (request,response){

				if (request.session._id){

					var survey_id = request.params.survey_id;
					Answer.find({survey_id:survey_id},function (err, answers){

						if (err){throw err; response.sendStatus(500);}
						else{

							response.send(answers);

						}

					})

				}
						else{
								request.session.destroy(function (err){
								response.redirect('/');
							})
						}

			})

			.post(function (request,response){

				if (request.session._id){

					var survey_id = request.params.survey_id;
					var date = new Date();
					console.log(request.body.answers);

					Survey.findById(survey_id, function (err, doc){
						if(err){
							throw err;
							response.sendStatus(500);
						}

						if (doc != undefined) {

							Answer.find({survey_id: survey_id, email: request.body.email},function (err,ans){

								if(err){
									throw err;
									response.sendStatus(500);
								}

								console.log(ans);
								if(ans[0] == undefined){

									var newAnswer = new Answer({

										survey_id: survey_id,
										date: date,
										answers: request.body.answers,
										email: request.body.email,
										gender: request.body.gender

									})

									newAnswer.save(function (err,saved){

										if(err){
											throw err;
											response.sendStatus(500);
										}

										response.sendStatus(200);
									})

								}
								else{

									response.sendStatus(401);	

								}

							})

							

						}
						else{
							response.sendStatus(500);
						}
					})


				}
						else{
								request.session.destroy(function (err){
								response.redirect('/');
							})
						}

				

			})



});
