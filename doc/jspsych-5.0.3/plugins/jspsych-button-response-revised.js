/**
 * jspsych-button-response-revised
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["button-response-revised"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // default trial parameters
    trial.button_html = trial.button_html || '<button class="jspsych-btn">%choice%</button>';
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    trial.timing_stim = trial.timing_stim || -1; // if -1, then show indefinitely
    trial.timing_response = trial.timing_response || -1; // if -1, then wait for response forever
    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

	//text box option
	trial.text_box = trial.text_box || false;
	trial.questions = trial.questions || [];

    if (typeof trial.rows == 'undefined') {
      trial.rows = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.rows.push(1);
      }
    }
    if (typeof trial.columns == 'undefined') {
      trial.columns = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.columns.push(40);
      }
    }

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

    //show prompt if there is one
    if (trial.prompt !== "") {
      display_element.append(trial.prompt);
    }

    // store response
    var response = {
      rt: -1,
      button: -1
    };

    // start time
    var start_time = 0;

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
	if (trial.text_box) {
		add_textbox();
	} else {
        if (trial.response_ends_trial) {
          end_trial();
        };
	};


    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      for (var i = 0; i < setTimeoutHandlers.length; i++) {
        clearTimeout(setTimeoutHandlers[i]);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button,
		"choice": trial.choices[response.button],
		"isRight": isRight,
		  "text_box_response": "no"
      };

      // clear the display
      display_element.html('');

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

	function add_textbox() {
		startTimeText = Date.now();

		//mark chosen image
		$("#jspsych-button-response-button-" + response.button).attr('style', 'border: 5px solid blue');

	    // add questions
	    for (var i = 0; i < trial.questions.length; i++) {
	      // create div
	      display_element.append($('<div>', {
	        "id": 'jspsych-survey-text-' + i,
	        "class": 'jspsych-survey-text-question'
	      }));

	      // add question text
	      $("#jspsych-survey-text-" + i).append('<p class="jspsych-survey-text">' + trial.questions[i] + '</p>');

	      // add text box
	      $("#jspsych-survey-text-" + i).append('<textarea name="#jspsych-survey-text-response-' + i + '" cols="' + trial.columns[i] + '" rows="' + trial.rows[i] + '"></textarea>');
	    }

	    // add submit button
	    display_element.append($('<button>', {
	      'id': 'jspsych-survey-text-next',
	      'class': 'jspsych-btn jspsych-survey-text'
	    }));
	    $("#jspsych-survey-text-next").html('Submit');

	    $("#jspsych-survey-text-next").click(function() {
	      // measure response time
	      var endTimeText = Date.now();
		  var response_time_text = endTimeText - startTimeText;

	      // create object to hold responses
	      var question_data = {};
	      $("div.jspsych-survey-text-question").each(function(index) {
	        var id = "Q" + index;
	        var val = $(this).children('textarea').val();
	        var obje = {};
	        obje[id] = val;
	        $.extend(question_data, obje);
	      });


        // kill any remaining setTimeout handlers
        for (var i = 0; i < setTimeoutHandlers.length; i++) {
          clearTimeout(setTimeoutHandlers[i]);
        };

  	  //check if response is right
  	  isRight=0;
  	  if (trial.correctAnswer==trial.choices[response.button]) {
  		  isRight=1;
  	  };
		//collect trial data
		var trial_data = {
			"rt": response.rt,
        	"stimulus": trial.stimulus,
        	"button_pressed": response.button,
			"choice": trial.choices[response.button],
			"isRight": isRight,
			"text_box_response": "yes",
			"textbox_rt": response_time_text,
			"textbox_responses": JSON.stringify(question_data)
		};

		// goto next trial in block
		display_element.html('');
		jsPsych.finishTrial(trial_data);


		 });

	};

	    // start timing
	    startTime = Date.now();

		//if text box, add timing parameter
		if (trial.text_box) {
			var startTimeText = 0;
		};

    // start timing
    start_time = Date.now();

    // hide image if timing is set
    if (trial.timing_stim > 0) {
      var t1 = setTimeout(function() {
        $('#jspsych-button-response-stimulus').css('visibility', 'hidden');
      }, trial.timing_stim);
      setTimeoutHandlers.push(t1);
    }

    // end trial if time limit is set
    if (trial.timing_response > 0) {
      var t2 = setTimeout(function() {
        end_trial();
      }, trial.timing_response);
      setTimeoutHandlers.push(t2);
    }

  };



  return plugin;
})();
