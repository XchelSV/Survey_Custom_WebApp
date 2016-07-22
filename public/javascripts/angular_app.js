var app = angular.module('DS_Survey',['ngRoute', 'ngCookies'])
.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
});
	

app.controller ('addUserController',function  ($scope , $http, $cookies) {


	$('#image-cropper').cropit({ imageBackground: true });
	// Exporting cropped image
    $scope.cut_img = function() {
        
        $scope.imageData = $('#image-cropper').cropit('export');
        $('#image-cropper').cropit('disable');
        Materialize.toast('Imagen Cortada', 4000)

    }

    $scope.reenable = function(){
		$('#image-cropper').cropit('reenable');    	
    }

    $scope.send = function(){

    	if($scope.nombre == null){
    		$scope.name_null = 'animated shake';
    	}else{

    		if($scope.direccion == null){
    			$scope.dir_null = 'animated shake';
	    	}else{
	    		
	    		if($scope.contrasena == null){
	    			$scope.pass_null = 'animated shake';
		    	}else{
		    		
		    		if($scope.correo == null){

		    			$scope.mail_null = 'animated shake';

			    	}else{
			    		if($scope.img == null){
			    			$scope.img_null = 'animated shake';
				    	}else{
				    		
				    		if($scope.imageData == null){
				    			$scope.imgdata_null = 'animated shake';
				    			Materialize.toast('Corta la Imagen', 4000);
					    	}else{
					    		
					    		var data = {nombre: $scope.nombre, contrasena: $scope.contrasena, direccion: $scope.direccion, correo: $scope.correo, img64: $scope.imageData};
								$http.post('/user/new', data ).then(function success (response){

									window.location = "/index";

								}, function error (response) {

									if (response.status === 500) {
										Materialize.toast('Error al guardar Imagen', 4000)
									};

								});

					    	}

				    	}
			    	}

		    	}

	    	}	
    	}

    }

})

app.controller ('loginController',function  ($scope , $http, $cookies) {

	$scope.nombre;
	$scope.contrasena;
	$scope.sesion;

	$scope.name_null;
	$scope.pass_null;

	$scope.login = function(){

		if($scope.nombre == null){

			$scope.name_null = 'animated shake';

		}
		else{

			if($scope.contrasena == null){

				$scope.pass_null = 'animated shake';

			}
			else{

				var data = {name: $scope.nombre, pass: $scope.contrasena, sesion: $scope.sesion};
				$http.post('/loginApp', data ).then(function success (response){

					window.location = "/index";

				}, function error (response) {

					if (response.status === 401) {
						Materialize.toast('Usuario/Contraseña Incorrecta', 4000)
					};

				});

			}
		}

	}

})

app.controller ('newSurveyController',function  ($scope , $http, $cookies) {

	$(document).ready(function() {
	    $('select').material_select();
	});

	$http.get('/options/type').then(function success (response){

				$scope.types = response.data;

				$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
				    $('select').material_select();
				});
				

		}, function error (response) {

	});

	$scope.titulo;
	$scope.questions=[];
	var question_i = 0;

	$scope.add_question = function(){

		if($scope.question == undefined){
			$scope.question_null = 'animated shake'
			Materialize.toast('Escribe una Pregunta', 4000)
		}else{
			if($scope.type_id == undefined){
				$scope.type_null = 'animated shake'
				Materialize.toast('Selecciona un Tipo', 4000)
			}else{
				
				question_i++;
				for (var i = 0; i < $scope.types.length; i++) {
					if($scope.types[i]._id == $scope.type_id){
						$scope.options_type = $scope.types[i].opciones;
					}
				};

				$scope.questions.push({number:question_i,question:$scope.question,type:$scope.type_id, options_type: $scope.options_type})
				$scope.question = undefined;
				$scope.type_id = undefined;
				

			}	
		}		

	}

	$scope.save_survey = function(){

		if ($scope.titulo == undefined){
			Materialize.toast('Define un Título', 4000)	
		}
		else{


			var encuesta = {nombre: $scope.titulo,descripcion:$scope.descripcion ,preguntas: $scope.questions};
			$http.post('/survey',encuesta).then(function success (response){

					window.location = "/index";
					

			}, function error (response) {
					
					if (response.status === 500) {
							Materialize.toast('Error al Guardar Encuesta', 4000)
					};

			});
		}		

	}

})