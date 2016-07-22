module.exports = (function (app,RedisClient, uuid){

var path_module = require('path')
var User = require('../models/user_model');
var option_type = require('../models/type_model');
var Survey = require('../models/survey_model');

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
			

			var newUser = new User({

				nombre : request.body.nombre,
				direccion : request.body.direccion,
				password : request.body.contrasena,
				email : request.body.correo,
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

		app.route('/options/type')

			.get(function (request,response){
				option_type.find('',function (err,docs){

					if(err) throw err;

					response.send(docs);

				})
			})

		app.route('/survey')

			.post(function (request,response){

				var newSurvey = new Survey({

					user_id: request.session.user_id,
					nombre: request.body.nombre,
					descripcion: request.body.descripcion,
					preguntas: request.body.preguntas

				})

				newSurvey.save(function (err, saved){

					if(err){
						throw err;
						response.sendStatus(500);
					}

					response.sendStatus(200);

				})

			})

});
