app.controller ('newAnswerTypeController',function  ($scope , $http, $cookies) {

	$scope.color = $cookies.color;

	$scope.option_number = [];
	$scope.select_option_number = function (){

		$scope.option_number = [];
		if($scope.number <= 12 && $scope.number > 0){
			
			for (var i = 0; i < $scope.number; i++) {
				$scope.option_number.push(i);
			};
		}
		else{
			Materialize.toast('Número Excedido/Incorrecto', 2000)
		}

	}

	$scope.save_options = function (){

		var flag = false;
		var name = '';
		var values = [];
		if($scope.number != undefined && $scope.option_number != ''){

			for (var i = 0; i < $scope.number; i++) {

				if($('#option'+i).val() == ''){
					flag = true;
					break;
				}

				name = name+'/'+$('#option'+i).val();
				values.push($('#option'+i).val());
			};

			if(flag){
				Materialize.toast('Completa todos los campos', 2000)
			}
			else{

				var option = { name: name, option_values: values}
				$http.post('/options/type',option).then(function success (response){

					window.location = "/index";
					

				}, function error (response) {
						
						if (response.status === 500) {
								Materialize.toast('Error al Guardar Encuesta', 4000)
						};

				});

			}

		}
		else{
			Materialize.toast('Ingresa un número de respuestas', 2000)
		}

	}

})