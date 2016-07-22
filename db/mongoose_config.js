var connectToMongoose = function (mongoose) {
    
		var connect = function () {
			var options = { server: { socketOptions: { keepAlive: 1 } } };
			mongoose.connect( 'mongodb://localhost/EncuestasDigitalSoftDB', options);
		};
		connect();
		
		mongoose.connection.on('connected', function () {
			console.log('Conectado bd');
		});

		mongoose.connection.on('error', function (err) {
		  console.log(err);
		});

		mongoose.connection.on('disconnected', function () {
			console.log('Desconectado de db, intentando conectar de nuevo...');
		  	connect();
		});	
	};

	module.exports = connectToMongoose;