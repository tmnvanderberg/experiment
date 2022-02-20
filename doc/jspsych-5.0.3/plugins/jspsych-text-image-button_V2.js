/* jspsych-text.js
 * Josh de Leeuw
 *
 * This plugin displays text (including HTML formatted strings) during the experiment.
 * Use it to show instructions, provide performance feedback, etc...
 *
 * documentation: docs.jspsych.org
 *
 *
 */

jsPsych.plugins["text-image-button_V2"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    //trial.cont_key = trial.cont_key || [];

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // set the HTML of the display target to replaced_text.
    display_element.html(trial.text);

      //  create submit button
      display_element.append($('<button>',
      {
        'id': 'next',
        'class': 'sim',
        'html': '<h1>NEXT<h1>',
        'padding': '6px 12px',
        'border-radius': '4px',
        'margin': '0px 8px',
        'text-align' : 'center',
        'line-height': '3.8em',
        'vertical-align': 'middle'
      }));


      $("#next").click(function()
      {
        // disable click after response
        $("#next").off('click').attr('disabled', 'disabled');
        after_response();
      });

      // add stimulus image(s)
      var targetStyle='border: 5px solid transparent'
      display_element.append($('<img>', {
      src: trial.stimulus,
          id: 'jspsych-instruct-stimulus',
          class: 'block-center',
      style: targetStyle
        }));

      // get initial time
      var start_time = (new Date()).getTime();

      // end trial function
      var after_response = function(info) {

      var rt = (new Date()).getTime() - start_time;

      display_element.html(''); // clear the display

      var trialdata = {
        "rt": rt
      }

      jsPsych.finishTrial(trialdata);

    };

  };

  return plugin;
})();
