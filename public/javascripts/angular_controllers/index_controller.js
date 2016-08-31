app.controller ('indexController',function  ($scope , $http, $cookies) {

	$scope.color = $cookies.color;

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
	
	
	$scope.makeQR = function (survey_id){
		
		document.getElementById("qrcode").innerHTML = "";

		var qrcode = new QRCode(document.getElementById("qrcode"),{
		    text: "http://xchelsv.com:8080/survey/"+survey_id,
		    width: 250,
		    height: 250,
		    colorDark : "#000000",
		    colorLight : "#ffffff",
		    correctLevel : QRCode.CorrectLevel.H
		});

		$('#qr_modal').openModal();

	};


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

})