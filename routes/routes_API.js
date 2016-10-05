module.exports = (function (app,RedisClient, uuid, transporter){

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

				User.findOne({email: request.body.correo},function (err,mail_exist){

					if(user == undefined && mail_exist == undefined){

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

									var mailOptions = {
									    from: '"Administrador Digitalsoft" <contacto@digitalsoft.mx', // sender address
									    to: request.body.correo, // list of receivers
									    subject: 'Confirmación de Registro ✔', // Subject line
									    /*text: 'Gracias por haber completado tu Registro.
									    A partir de ahora puedes hacer eso del sistema con tu cuenta:
									    Usuario: '+request.body.nombre+
									    'Contraseña: '+request.body.contrasena, // plaintext body*/
									    html: '<b>Gracias por haber completado tu Registro</b><p>A partir de ahora puedes hacer uso del sistema con tu cuenta:</p><p>Usuario: <b>'+request.body.nombre+'</b> y Contraseña: <b>'+request.body.contrasena+'</b></p><p> Cualquier duda que tengas con gusto la atenderemos <br></p>  <p><i>Administrador del Sistema</i><br> <b>contact@digitalsoft.mx</b></p>' // html body
									};

									transporter.sendMail(mailOptions, function(error, info){
									    if(error){
									    	response.sendStatus(500);
									        throw error;
									    }
									    console.log('Message sent: ' + info.response);
									    response.sendStatus(200);
									});
								}

							});
						})

					}
					else{
						response.sendStatus(401);
					}

				})

			})

			


		})
		
		.put(function (request,response){


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


			if (request.body.img64){

				var data = request.body.img64;

				var imageBuffer = decodeBase64Image(data);
				console.log(imageBuffer);
				var type;

				if (imageBuffer.type == 'image/jpeg') {
					type = '.jpg'
				}
				else{
					type = '.png'
				}
				


						User.findById(request.session.user_id,function (err, user){

							user.nombre = request.body.nombre;
							user.direccion = request.body.direccion;
							user.email = request.body.correo;
							user.password = request.body.contrasena;
							user.color = request.body.color;


							var fs = require('fs');
							fs.writeFile('./public/images/userLogo/'+user._id+type, imageBuffer.data, function(err) { 

								if (err){
									response.sendStatus(500);
									throw err;	
								}
								else{
									user.save();

									response.clearCookie('correo');
									response.clearCookie('direccion');
									response.clearCookie('nombre');
									response.clearCookie('color');

									response.cookie('nombre', encodeURIComponent(user.nombre));
									response.cookie('direccion',encodeURIComponent(user.direccion));
									response.cookie('correo',encodeURIComponent(user.email));
									response.cookie('color',encodeURIComponent(user.color));

									response.sendStatus(200);
								}

							});
						})

			}
			else{


						User.findById(request.session.user_id,function (err, user){

							user.nombre = request.body.nombre;
							user.direccion = request.body.direccion;
							user.email = request.body.correo;
							user.password = request.body.contrasena;
							user.color = request.body.color;


								if (err){
									response.sendStatus(500);
									throw err;	
								}
								else{
									user.save();

									response.clearCookie('correo');
									response.clearCookie('direccion');
									response.clearCookie('nombre');
									response.clearCookie('color');

									response.cookie('nombre', encodeURIComponent(user.nombre));
									response.cookie('direccion',encodeURIComponent(user.direccion));
									response.cookie('correo',encodeURIComponent(user.email));
									response.cookie('color',encodeURIComponent(user.color));

									response.sendStatus(200);
								}

						})

			}

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


								response.cookie('nombre', encodeURIComponent(user.nombre));
								response.cookie('direccion',encodeURIComponent(user.direccion));
								response.cookie('correo',encodeURIComponent(user.email));
								response.cookie('color',encodeURIComponent(user.color));

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

					option_type.find({user_id: request.session.user_id},function (err,docs){

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
						user_id: request.session.user_id,
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

		

		app.route('/survey')

			.post(function (request,response){


				if (request.session._id){
					


					var date = new Date();
					var newSurvey = new Survey({

						user_id: request.session.user_id,
						nombre: request.body.nombre,
						date: date,
						descripcion: request.body.descripcion,
						preguntas: request.body.preguntas,

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
		
		app.route('/survey/:survey_id')

			.delete(function (request, response){

				var survey_id = request.params.survey_id;
				Survey.remove({_id: survey_id}, function (err, deleted){

					if(err){
						response.sendStatus(500);
					}
					else{
						response.sendStatus(200);
					}

				})

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
										gender: request.body.gender,
										age: request.body.age,
										birthday: request.body.birthday

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

				

			})



});
