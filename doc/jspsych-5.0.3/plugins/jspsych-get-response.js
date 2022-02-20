/*
 * Example plugin template
 */

jsPsych.plugins['get-response'] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // set the HTML of the display target to replaced_text.
    display_element.html(trial.question + '</p>');

    // add respose (text) area
    display_element.append($('<textarea>', {
      'id': 'jspsych-get-response-text',
      'class': 'jspsych-get-response-text'
    }));
    $("#jspsych-get-response-text").html('');

    display_element.append('</p>');

    // add submit button
    display_element.append($('<button>', {
      'id': 'jspsych-get-response-next',
      'class': 'jspsych-btn jspsych-get-response'
    }));
    $("#jspsych-get-response-next").html('Submit');
    $("#jspsych-get-response-next").click(function() {

    // get response
    var val = $("#jspsych-get-response-text").val();

    // data saving
    var trial_data = {
      response: val
    };

    display_element.html('');

    // end trial
    jsPsych.finishTrial(trial_data);
    });

  };

  return plugin;
})();
