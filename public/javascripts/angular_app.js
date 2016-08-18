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

app.controller ('indexController',function  ($scope , $http, $cookies) {

	$('.modal-trigger').leanModal({
      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
      starting_top: '4%', // Starting top style attribute
      ending_top: '10%', // Ending top style attribute
      complete: function() { $scope.question_number_id = ''; $scope.question_name = ''; $scope.survey = {}; if(myChart !== null) {myChart.destroy(); myChart = null;}; answers_counter = [];$scope.div_survey_details = true;} // Callback for Modal close

    });

	var answers_counter = [];
	$scope.obtain_graphs_data = function (survey_id){

		for (var i = 0; i < surveys.length; i++) {
			if (surveys[i]._id == survey_id){
				$scope.survey = surveys[i];
				$scope.date = moment($scope.survey.date).format('DD MMMM YYYY');
				//$scope.date = moment($scope.survey.date).fromNow();

				$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
				    $('select').material_select();
				});

				$http.get('/survey/'+survey_id+'/answers').then(function success (response){

					$scope.survey_answers = response.data;
					if ($scope.survey_answers.length !== 0) {
						$scope.last_answer_date = moment($scope.survey_answers[$scope.survey_answers.length - 1].date).fromNow();
					}
					else{
						$scope.last_answer_date = 'N/A';
					};
					//console.log(JSON.stringify($scope.survey_answers));

					//Construct Counter Structure JSON
					for (var i = 0; i < $scope.survey.preguntas.length; i++) {
						
						answers_counter.push({
								question_id: $scope.survey.preguntas[i]._id,
								answers: []
						})

						for (var j = 0; j < $scope.survey.preguntas[i].options_type.length; j++) {
							answers_counter[i].answers.push({
								name_type: $scope.survey.preguntas[i].options_type[j],
								counter: 0
							})
							//console.log($scope.survey.preguntas[i].options_type[j]);
						};

					};

					//Filling Counter JSON
					//if($scope.survey_answers != undefined){
						for (var i = 0; i < $scope.survey_answers.length; i++) {

							for (var k = 1; k < $scope.survey_answers[i].answers.length; k++) {

								for (var j = 0; j < answers_counter[k-1].answers.length; j++) {

									if (answers_counter[k-1].answers[j].name_type == $scope.survey_answers[i].answers[k]) {
										answers_counter[k-1].answers[j].counter++;
										break;
									};

								}
							}

						}
					//}

					
					//console.log(answers_counter);


				}, function error (response) {

					if (response.status === 500) {
						Materialize.toast('Error al Solicitar Respuestas', 4000)
					};

				});
				break;
			}
		};

	}


	var myChart = null;
	$scope.div_survey_details = true;
	$scope.show_graphs_by_question = function (){

		if (myChart !== null){
			myChart.destroy();
			myChart = null;
		}

		$scope.div_survey_details = false;

		for (var i = 0; i < $scope.survey.preguntas.length; i++) {
			if($scope.survey.preguntas[i]._id == $scope.question_number_id){
				$scope.question_name = $scope.survey.preguntas[i].question;

				var answers = [];
				//Fill anwers (Data to Chart) by question selected
				for (var j = 0; j < answers_counter.length; j++) {
					if (answers_counter[j].question_id == $scope.question_number_id) {
						for (var k = 0; k < answers_counter[j].answers.length; k++) {
							answers.push(answers_counter[j].answers[k].counter);
						};
					};
				};

				//console.log(answers);

				var ctx = document.getElementById("myChart");

                myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                labels: $scope.survey.preguntas[i].options_type,
                datasets: [{
                label: '# Respuestas',
                data: answers,
                backgroundColor: [
	                'rgba(255, 99, 132, 0.2)',
	                'rgba(54, 162, 235, 0.2)',
	                'rgba(255, 206, 86, 0.2)',
	                'rgba(75, 192, 192, 0.2)',
	                'rgba(153, 102, 255, 0.2)',
	                'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
	                'rgba(255,99,132,1)',
	                'rgba(54, 162, 235, 1)',
	                'rgba(255, 206, 86, 1)',
	                'rgba(75, 192, 192, 1)',
	                'rgba(153, 102, 255, 1)',
	                'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
                }]
                },
                options: {
			        scales: {
			            yAxes: [{
			                ticks: {
			                    beginAtZero:true
			                }
			            }]
			        }
			    }
                });
				
				break;
			}// if
		};// for

	}

})


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

})


app.controller ('surveyController',function  ($scope , $http, $cookies) {
 	
 	$scope.answer = [];
 	
	$scope.send_answers = function (){

		var respuestas = [];
		var flag = true;
		for (var i = 1; i <= question_number; i++) {
			if($scope.answer[i] == null){
				flag = false;
				break;
			}
		};

		console.log(flag);
	 	console.log($scope.answer);


	 	if(flag){

	 		var encuesta = {answers: $scope.answer}

			$http.post('/survey/'+survey_id+'/answers',encuesta).then(function success (response){

				window.location = "/index";	
						

				}, function error (response) {
						
						if (response.status === 500) {
								Materialize.toast('Error al Envíar Respuestas', 4000)
						};

			});
		}
		else{
			Materialize.toast('Completa todos los Campos', 4000)	
		}

	}

})