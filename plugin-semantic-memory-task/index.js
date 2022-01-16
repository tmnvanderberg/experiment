var semanticMemoryTask = (function (jspsych) {
  "use strict";

  const info = {
    name: "semantic-memory-task`",
    parameters: {
      parameter_name: {
        type: jspsych.ParameterType.INT,
        default: undefined,
      },
      parameter_name2: {
        type: jspsych.ParameterType.IMAGE,
        default: undefined,
      },
    },
  };

  /**
   * **PLUGIN-NAME**
   *
   * SHORT PLUGIN DESCRIPTION
   *
   * @author Timon van der Berg
   * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
   */
  class SemanticMemoryTask {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      // data saving
      var trial_data = {
        words: trial.words
      };
      function show_stim() {
        display_element.InnerHTML = "<cp>" + trial.words + "</p>";
      }
      show_stim();
      // end trial
      this.jsPsych.finishTrial(trial_data);
    }
  }
  SemanticMemoryTask.info = info;

  return SemanticMemoryTask;
})(jsPsychModule);
