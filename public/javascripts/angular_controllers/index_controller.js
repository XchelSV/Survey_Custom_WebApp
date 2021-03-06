app.controller ('indexController',function  ($scope , $http, $cookies) {

	$scope.color = decodeURIComponent($cookies.color);
	$scope.user_name = decodeURIComponent($cookies.nombre);
	$scope.user_email = decodeURIComponent($cookies.correo);


	$('.modal-trigger').leanModal({

      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
      starting_top: '4%', // Starting top style attribute
      ending_top: '10%', // Ending top style attribute
      complete: function() { 
	      	
      	} // Callback for Modal close

    });


    $('.button-collapse').sideNav({
	      menuWidth: 300, // Default is 240
	      edge: 'left', // Choose the horizontal origin
	      closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
		    }
	);

    $scope.delete_modal = function (survey_id){

    	$('#delete_modal').openModal();
    	$scope.survey_id_4_delete = survey_id;

    }
    $scope.close_delete_modal = function (){

    	$('#delete_modal').closeModal();

    }

    $scope.delete_survey = function (){

    	$http.delete('/survey/'+$scope.survey_id_4_delete).then(function success (response){
			
			window.location = "/index";

		}, function error (response) {

			if (response.status === 500) {
				Materialize.toast('Error al Eliminar Encuesta', 4000)
			};

		});

    }

	$scope.show_filters = function(){
		$scope.show_filter_date = false;
		$scope.show_filter_gender = false;

		for (var i = 0; i < $scope.valid_filters.length; i++) {
			if($scope.valid_filters[i] == "1" ){
				$scope.show_filter_date = true;
			}

			if($scope.valid_filters[i] == "2" ){
				$scope.show_filter_gender = true;
			}
		};

		$scope.apply_filters();

	}
	
	
	var qr_url;
	$scope.makeQR = function (survey_id){
		
		document.getElementById("qrcode").innerHTML = "";

		var qrcode = new QRCode(document.getElementById("qrcode"),{
		    text: document.location.origin+"/survey/"+survey_id,
		    width: 250,
		    height: 250,
		    colorDark : "#000000",
		    colorLight : "#ffffff",
		    correctLevel : QRCode.CorrectLevel.H
		});

		qr_survey_id = survey_id;
		$('#qr_modal').openModal();
		

	};

	$scope.copy_link = function (){
		window.prompt("Copia el link: ", document.location.origin+"/survey/"+qr_survey_id);
	}

	$scope.pdf_export = function (){

		window.open(document.location.origin+"/survey/"+qr_survey_id+"/qr",'_blank');

		/*var printContents = document.getElementById('qr_modal').innerHTML;
     	var originalContents = document.body.innerHTML;

     	document.body.innerHTML = printContents;

     	window.print();

     	document.body.innerHTML = originalContents;*/

     	/*return xepOnline.Formatter.Format('qrcode',{render:'download', 
            cssStyle:[{fontSize:'30px'},{fontWeight:'bold'}]});*/

	}


	var answers_counter = [];
	$scope.obtain_graphs_data = function (survey_id){

		$scope.question_number_id = ''; 
	    $scope.question_name = ''; 
	    $scope.survey = {}; 
	    if(myChart !== null) {
		    myChart.destroy(); 
		    myChart = null;
	    }; 
	    answers_counter = []; 
	    $scope.div_survey_details = true;

	    $scope.valid_filters = [];
	    $scope.show_filter_date = false;
	    $scope.show_filter_gender = false;
	    $scope.date_filter_value = undefined;
	    $scope.gender_filter_value = undefined;

		for (var i = 0; i < surveys.length; i++) {
			if (surveys[i]._id == survey_id){
				$scope.survey = surveys[i];

				if($scope.survey.nombre.length > 30){
					$scope.survey.nombre_slice = $scope.survey.nombre.slice(0,17)+'...'
				}
				else{
					$scope.survey.nombre_slice = $scope.survey.nombre	
				}

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
	                'rgba(97, 96, 106, 0.5)',
	                'rgba(212, 180, 57, 0.5)',
	                'rgba(87, 67, 112, 0.5)',
	                'rgba(242, 219, 91, 0.5)',
	                'rgba(128, 114, 149, 0.5)'
                ],
                borderColor: [
	                'rgba(97, 96, 106, 1)',
	                'rgba(212, 180, 57, 1)',
	                'rgba(87, 67, 112, 1)',
	                'rgba(242, 219, 91, 1)',
	                'rgba(128, 114, 149, 1)'
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

	var filtered_answers = [];
	$scope.apply_filters = function (){

		//Reset Values & Show Details Survey Div
		$scope.question_number_id = ''; 
	    $scope.question_name = ''; 
	    if(myChart !== null) {
		    myChart.destroy(); 
		    myChart = null;
	    }; 
	    answers_counter = []; 
	    $scope.div_survey_details = true;

	    //Temporal Array
		filtered_answers = [];

		var flag = true;
		//Filling Temporal Array with Filter Params
		if($scope.show_filter_date == true && $scope.date_filter_value != undefined){
			for (var i = 0; i < $scope.survey_answers.length; i++) {
				if( $scope.survey_answers[i].date >= $scope.date_filter_value){
					filtered_answers.push($scope.survey_answers[i]);
					flag = false;
				}
			};

		}


		if($scope.show_filter_gender == true && $scope.gender_filter_value != undefined){
			if(flag){

				for (var i = 0; i < $scope.survey_answers.length; i++) {
					if( $scope.survey_answers[i].gender == $scope.gender_filter_value){
						filtered_answers.push($scope.survey_answers[i]);
						flag = false;

					}
				};
			}
			else{
				for (var i = 0; i < filtered_answers.length; i++) {
					if( filtered_answers[i].gender != $scope.gender_filter_value){
						filtered_answers.splice(i,1);
						i--;
					}
				};	
			}

		}


		if(($scope.show_filter_date == true && $scope.date_filter_value != undefined) || ($scope.show_filter_gender == true && $scope.gender_filter_value != undefined)){

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
						for (var i = 0; i < filtered_answers.length; i++) {

							for (var k = 1; k < filtered_answers[i].answers.length; k++) {

								for (var j = 0; j < answers_counter[k-1].answers.length; j++) {

									if (answers_counter[k-1].answers[j].name_type == filtered_answers[i].answers[k]) {
										answers_counter[k-1].answers[j].counter++;
										break;
									};

								}
							}

						}
		}
		else{
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
		}
		

	}

	$scope.exportXLS = function () {

		$http.get('/survey/'+$scope.survey._id+'/xls').then(function success (response){

			Materialize.toast('Descargando', 4000);
			window.open(document.location.origin+"/survey/"+$scope.survey._id+"/export/xls",'_blank');

		}, function error (response) {

			if (response.status === 500) {
				Materialize.toast('Error al Exportar la Encuesta', 4000)
			};

		});

		
	}

})