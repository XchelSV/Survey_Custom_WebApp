app.controller ('newSurveyController',function  ($scope , $http, $cookies) {

	$scope.color = decodeURIComponent($cookies.color);
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

				if($scope.question.length > 65){

					Materialize.toast('Pregunta muy Larga', 4000)

				}
				else{


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

	}

	$scope.delete_question = function (question_number){

		$scope.questions.splice(question_number-1,1);
		for (var i = 0; i < $scope.questions.length; i++) {
			$scope.questions[i].number = i+1;
		};
		question_i--;

	}

	$scope.save_survey = function(){

		if ($scope.titulo == undefined){
			Materialize.toast('Define un Título', 4000)	
		}
		else{

			if (question_i == 0){
				Materialize.toast('Agrega al menos una Pregunta', 4000)
			}

			else{

				if($scope.titulo.length > 45){

					Materialize.toast('Título muy Largo', 4000)

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
		}		

	}

})