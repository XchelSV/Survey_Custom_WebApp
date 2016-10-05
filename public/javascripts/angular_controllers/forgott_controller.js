app.controller ('forgottPassController',function  ($scope , $http, $cookies) {


	$scope.send = function (){
		
		var mail = {email: $scope.email};

		$http.post('/restart/pass',mail).then(function success (response){

			window.location = "/passwd/confirmation";
					

		}, function error (response) {
						
			if (response.status === 500) {
				Materialize.toast('Error al envíar solicitud', 4000)
			};

			if (response.status === 401) {
				Materialize.toast('El Correo no Existe', 4000)
			};

		});
	}	

})