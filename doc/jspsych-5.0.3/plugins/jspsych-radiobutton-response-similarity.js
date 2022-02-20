/**
 * jspsych-button-response-revised
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["radiobutton-response-similarity"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // default trial parameters
    trial.button_html = trial.button_html || '<button class="jspsych-btn">%choice%</button>';
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    //trial.timing_stim = trial.timing_stim || -1; // if -1, then show indefinitely
    //trial.timing_response = trial.timing_response || -1; // if -1, then wait for response forever
    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

    // slider parameters
    trial.labels = (typeof trial.labels === 'undefined') ? ["Not at all similar", "Identical"] : trial.labels;
    trial.intervals = trial.intervals || 100;
    //trial.show_ticks = (typeof trial.show_ticks === 'undefined') ? false : trial.show_ticks;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);


    // display stimulus
	targetStyle='border: 5px solid green';

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
		  buttons = trial.button_html_similarity;
      } else {
        console.error('Error in button-response plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
		  if ($.inArray(trial.choices[i],trial.similarityChoices) > -1) {
			  buttons.push(trial.button_html_similarity);
		  } else {
			  buttons.push(trial.button_html);
		  }
      }
    }
    display_element.append('<div id="jspsych-button-response-btngroup" class="center-content block-center"></div>')
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      $('#jspsych-button-response-btngroup').append(
        $(str).attr('id', 'jspsych-button-response-button-' + i).data('choice', i).addClass('jspsych-button-response-button').on('click', function(e) {
          // after a valid response, the stimulus will have the CSS class 'responded'
		  // which can be used to provide visual feedback that a response was recorded
		  $("#jspsych-button-response-stimulus").addClass('responded');

		  // disable all the buttons after a response
		  $('.jspsych-button-response-button').off('click').attr('disabled', 'disabled');
	  })
    );
    }

    // add likert scale questions
    display_element.append('<form id="jspsych-survey-likert-form">');
    form_element = $('#jspsych-survey-likert-form');
    // add question
    form_element.append('<label class="jspsych-survey-likert-statement">' + trial.prompt+ '</label>');
    // add options
    var width = 100 / trial.labels.length;
    options_string = '<ul class="jspsych-survey-likert-opts" data-radio-group="Q' + 1 + '">';
    for (var j = 0; j < trial.labels.length; j++) {
      options_string += '<li style="width:' + width + '%"><input type="radio" name="Q' + 1 + '" value="' + j + '"><label class="jspsych-survey-likert-opt-label">' + trial.labels[j] + '</label></li>';
    }
    options_string += '</ul>';
    form_element.append(options_string);


    // start time
    var startTime = (new Date()).getTime();

    //  create submit button
    display_element.append($('<button>',
    {
      'id': 'next',
      'class': 'sim',
      'html': 'Submit',
      'padding': '6px 12px',
      'border-radius': '4px',
      'margin': '0px 8px',
      'text-align' : 'center',
      'line-height': '1.4em',
      'vertical-align': 'middle'
    }));


    $("#next").click(function()
    {
      // disable click after response
      $("#next").off('click').attr('disabled', 'disabled');
      end_trial();
    });



	function end_trial()
  {
        //var endTime = (new Date()).getTime();
		    var endTime = Date.now();
        response_time = endTime - startTime;

        // create object to hold responses
        var response_score = -1;
        $("#jspsych-survey-likert-form .jspsych-survey-likert-opts").each(function(index) {
          var id = $(this).data('radio-group');
          var response = $('input[name="' + id + '"]:checked').val();
          if (typeof response == 'undefined') {
            response = -1;
          }
          response_score = response;
        });

  	    var trial_data = {
  	          "sim_score": response_score,
  	          "rt": response_time,
  	          "stimulus": trial.stimulus,
  				    "similarityChoices": JSON.stringify(trial.similarityChoices)
  	    };

  	    // goto next trial in block
  	    display_element.html('');
  	    jsPsych.finishTrial(trial_data);
	}

  };


  return plugin;
})();
