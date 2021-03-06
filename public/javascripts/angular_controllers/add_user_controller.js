app.controller ('addUserController',function  ($scope , $http, $cookies) {

	$scope.color = "teal lighten-2";

	$('#image-cropper').cropit({ imageBackground: true });
	// Exporting cropped image
    $scope.cut_img = function() {
        
        $scope.imageData = $('#image-cropper').cropit('export');
        $('#image-cropper').cropit('disable');
        Materialize.toast('Imagen Cortada', 4000)

    }

    $scope.color_class = function(color_name){


    	$scope.color = color_name;
    	$('#modal1').closeModal();
    	console.log($scope.color);
    	

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

		    	if($scope.confirmar_contrasena == null){
	    			
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

					    		if($scope.contrasena == $scope.confirmar_contrasena){
					    		
						    		var data = {nombre: $scope.nombre, contrasena: $scope.contrasena, direccion: $scope.direccion, correo: $scope.correo, img64: $scope.imageData, color:$scope.color};
									$http.post('/user/new', data ).then(function success (response){

										window.location = "/index";

									}, function error (response) {

										if (response.status === 500) {
											Materialize.toast('Error al guardar Imagen', 4000)
										};

										if (response.status === 401) {
											Materialize.toast('El nombre/correo ya Existe', 4000)
										};

									});
								}
								else{

									Materialize.toast('Contraseñas no coinciden', 4000);

								}

					    	}
					    }

				    	}
			    	}

		    	}

	    	}	
    	}

    }

    $('.modal-trigger').leanModal({
      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
      
      
    }
  );

})