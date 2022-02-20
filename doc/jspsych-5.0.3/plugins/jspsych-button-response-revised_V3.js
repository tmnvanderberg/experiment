/**
 * jspsych-button-response-revised
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["button-response-revised_V3"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // default trial parameters
    trial.button_html = trial.button_html || '<button class="jspsych-btn">%choice%</button>';
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

    //Wager Radio Options
  	trial.confidence_radios = trial.confidence_radios || false;
    trial.labels = (typeof trial.labels === 'undefined') ? ["Not at all similar", "Identical"] : trial.labels;
    trial.intervals = trial.intervals || 100;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];

    // display stimulus
	  //edit style of target
	  var targetStyle='border: 5px solid transparent'

    if (!trial.is_html) {
      display_element.append($('<img>', {
		src: trial.stimulus,
        id: 'jspsych-button-response-stimulus',
        class: 'block-center',
		style: targetStyle
      }));
    } else {
      display_element.append($('<div>', {
        html: trial.stimulus,
        id: 'jspsych-button-response-stimulus',
		class: 'block-center',
		style: targetStyle
      }));
    }

    //display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
		  buttons = trial.button_html;
      } else {
        console.error('Error in button-response plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
		  buttons.push(trial.button_html);
      }
    }
    display_element.append('<div id="jspsych-button-response-btngroup" class="center-content block-center"></div>')
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      $('#jspsych-button-response-btngroup').append(
        $(str).attr('id', 'jspsych-button-response-button-' + i).data('choice', i).addClass('jspsych-button-response-button').on('click', function(e) {
          var choice = $('#' + this.id).data('choice');
		  after_response(choice);
        })
      );
    }

    // Add line break so there is a space between stimulus and confidence radio buttons
    display_element.append('<br><br>');

    // store response
    var response = {
      rt: -1,
    //  submit_rt: -1;
      button: -1
    };

    // start time
    var start_time = 0;
    // start timing
    start_time = Date.now();

    //if wager radios, add timing parameter
    if (trial.confidence_radios) {
      var start_confidence_time = 0;
    };

    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = Date.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      $("#jspsych-button-response-stimulus").addClass('responded');

      // disable all the buttons after a response
      $('.jspsych-button-response-button').off('click').attr('disabled', 'disabled');

      //text box option
      if (trial.confidence_radios){
      	add_wagerradios();
      }
      else{
          if (trial.response_ends_trial)
          {
            end_trial();
          };
      };
    };


    function add_wagerradios() {

        //mark chosen image
        $("#jspsych-button-response-button-" + response.button).attr('style', 'border: 5px solid blue');

        // add likert scale questions
        display_element.append('<form id="jspsych-survey-likert-form">');
        form_element = $('#jspsych-survey-likert-form');
        // add question
        //form_element.append('<label class="jspsych-survey-likert-statement">' + trial.prompt+ '</label>');
        // add options
        var width = 100 / trial.labels.length;
        options_string = '<ul class="jspsych-survey-likert-opts" data-radio-group="Q' + 1 + '">';
        for (var j = 0; j < trial.labels.length; j++) {
          options_string += '<li style="width:' + width + '%"><input type="radio" name="Q' + 1 + '" value="' + j + '"><label class="jspsych-survey-likert-opt-label">' + "<br>"+trial.labels[j] + '</label></li>';
        }
        options_string += '</ul>';
        form_element.append(options_string);

        // get start time fort wager RT
        start_confidence_time = Date.now();

      //  display_element.append("<h1>CURRENT TOKENS = " + trial.numtokens + "</h1>");

        // add submit button
  	    display_element.append($('<button>', {
  	      'id': 'jspsych-survey-text-next',
  	      'class': 'jspsych-btn jspsych-survey-text'
  	    }));
  	    $("#jspsych-survey-text-next").html('<h1>SUBMIT</h1>');

      //$("#jspsych-survey-likert-form").click(function() {
  	    $("#jspsych-survey-text-next").click(function() {

  	      // measure response time
  	      var end_confidence_time= Date.now();
  		    var response_confidence_time = end_confidence_time - start_confidence_time;


          // kill any remaining setTimeout handlers
          for (var i = 0; i < setTimeoutHandlers.length; i++) {
            clearTimeout(setTimeoutHandlers[i]);
          };

    	  //check if response is right
    	  isRight=0;
    	  if (trial.correctAnswer==trial.choices[response.button]) {
    		  isRight=1;
    	  };

        /// create varaible for wager yes = true or no = false (default)
        // set wager amount to default = 3
        var confidence_response = -1;
        $("#jspsych-survey-likert-form .jspsych-survey-likert-opts").each(function(index) {
          var id = $(this).data('radio-group');
          var response = $('input[name="' + id + '"]:checked').val();
          if (typeof response == 'undefined') {
            response = -1;
          }

          if (response > -1){
              confidence_response = Number(response)+1;
            }
        });

  		//collect trial data
  		var trial_data = {
  			"rt": response.rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button,
  			"choice": trial.choices[response.button],
  			"isRight": isRight,
        "confidencert": response_confidence_time,
  			"confidence_response": confidence_response,
  		};

/*
      var start_delaytime = (new Date()).getTime();
      var current_delaytime = 0;
      while (current_delaytime < 500){
        current_delaytime = (new Date()).getTime() - start_delaytime;
      }
      */

  		// goto next trial in block
  		display_element.html('');
  		jsPsych.finishTrial(trial_data);

  		 });
    // });
    }


    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      for (var i = 0; i < setTimeoutHandlers.length; i++) {
        clearTimeout(setTimeoutHandlers[i]);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        //"submit_rt": response.submit_rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button,
    		"choice": trial.choices[response.button],
    		"isRight": isRight,
          };

      // clear the display
      display_element.html('');

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };


  };

  return plugin;
})();
