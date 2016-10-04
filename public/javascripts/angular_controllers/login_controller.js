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
						Materialize.toast('Usuario/Contraseña Erróneo', 4000)
					};

				});

			}
		}

	}

})