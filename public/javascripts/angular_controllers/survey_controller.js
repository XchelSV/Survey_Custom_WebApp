app.controller ('surveyController',function  ($scope , $http, $cookies) {
 	
 	$scope.answer = [];
 	$scope.color = $cookies.color;
 	$('#gender').material_select();
 	
	$scope.send_answers = function (){

		var respuestas = [];
		var flag = true;
		for (var i = 1; i <= question_number; i++) {
			if($scope.answer[i] == null){
				flag = false;
				break;
			}
		};

		if($scope.gender == null || $scope.email == null){
			flag = false;
		}

	 	//console.log($scope.answer);


	 	if(flag){

	 		var encuesta = {answers: $scope.answer, email: $scope.email, gender: $('#gender').val()}

			$http.post('/survey/'+survey_id+'/answers',encuesta).then(function success (response){

				window.location = "/index";	
						

				}, function error (response) {
						
						if (response.status === 500) {
								Materialize.toast('Error al Envíar Respuestas', 4000)
						};

						if (response.status === 401) {
								Materialize.toast('Encuesta ya contestada', 4000)
						};

			});
		}
		else{
			Materialize.toast('Completa todos los Campos', 4000)	
		}

	}

})