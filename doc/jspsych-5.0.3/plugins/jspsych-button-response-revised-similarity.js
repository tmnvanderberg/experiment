/**
 * jspsych-button-response-revised
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["button-response-revised-similarity"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // default trial parameters
    trial.button_html = trial.button_html || '<button class="jspsych-btn">%choice%</button>';
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    trial.timing_stim = trial.timing_stim || -1; // if -1, then show indefinitely
    trial.timing_response = trial.timing_response || -1; // if -1, then wait for response forever
    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

    // slider parameters
    trial.labels = (typeof trial.labels === 'undefined') ? ["Not at all similar", "Identical"] : trial.labels;
    trial.intervals = trial.intervals || 100;
    trial.show_ticks = (typeof trial.show_ticks === 'undefined') ? false : trial.show_ticks;


    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];

    var cond;

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

	//show response slider
	show_response_slider(display_element, trial);

    // start time
    var startTime = (new Date()).getTime();

	//function for showing response slider
	//from jspsych-similarity.js
    function show_response_slider(display_element, trial) {

      //var startTime = (new Date()).getTime();

      // create slider
      display_element.append($('<div>', {
        "id": 'slider',
        "class": 'sim'
      }));

      $("#slider").slider({
        value: Math.ceil(trial.intervals / 2),
        min: 1,
        max: trial.intervals,
        step: 1,
      });

      // show tick marks
      if (trial.show_ticks) {
        for (var j = 1; j < trial.intervals - 1; j++) {
          $('#slider').append('<div class="slidertickmark"></div>');
        }

        $('#slider .slidertickmark').each(function(index) {
          var left = (index + 1) * (100 / (trial.intervals - 1));
          $(this).css({
            'position': 'absolute',
            'left': left + '%',
            'width': '1px',
            'height': '100%',
            'background-color': '#222222'
          });
        });
      }

      // create labels for slider
      display_element.append($('<ul>', {
        "id": "sliderlabels",
        "class": 'sliderlabels',
        "css": {
          "width": "70%",
          "height": "3em",
          "margin": "20px 0px 0px 0px",
          "padding": "2px",
          "display": "block",
          "position": "relative"
        }
      }));

      for (var j = 0; j < trial.labels.length; j++) {
        $("#sliderlabels").append('<li>' + trial.labels[j] + '</li>');
      }

      // position labels to match slider intervals
      var slider_width = $("#slider").width();
      var num_items = trial.labels.length;
      var item_width = slider_width / num_items;
      var spacing_interval = slider_width / (num_items - 1);

      $("#sliderlabels li").each(function(index) {
        $(this).css({
          'display': 'inline-block',
          'width': item_width + 'px',
          'margin': '0px',
          'padding': '0px',
          'text-align': 'center',
          'position': 'absolute',
          'left': (spacing_interval * index) - (item_width / 2)
        });
      });

      // if prompt is set, show prompt
      if (trial.prompt !== "") {
        display_element.append(trial.prompt);
      }

      //  create submit button
      display_element.append($('<button>', {
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


      $("#next").click(function() {
		  // disable click after response
		  $("#next").off('click').attr('disabled', 'disabled');
		  end_trial();
      });
    }

	function end_trial() {
        //var endTime = (new Date()).getTime();
		var endTime = Date.now();
        response_time = endTime - startTime;

	    // kill any remaining setTimeout handlers
	    for (var i = 0; i < setTimeoutHandlers.length; i++) {
			clearTimeout(setTimeoutHandlers[i]);
		};

		var score = $("#slider").slider("value");

	    var trial_data = {
	          "sim_score": score,
	          "rt": response_time,
	          "stimulus": trial.stimulus,
				"similarityChoices": JSON.stringify(trial.similarityChoices)
	    };

	    // goto next trial in block
	    display_element.html('');
	    jsPsych.finishTrial(trial_data);

	}



    // // hide image if timing is set
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
