import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = {
  name: "semantic-memory-task",
  parameters: {
    /**
     * The HTML string to be displayed.
     */
    stimulus: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /**
     * Array containing the key(s) the subject is allowed to press to respond to the stimulus.
     */
    choices: {
      type: ParameterType.KEYS,
      pretty_name: "Choices",
      default: "ALL_KEYS",
    },
    /**
     * Any content here will be displayed below the stimulus.
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /**
     * How long to show the stimulus.
     */
    stimulus_duration: {
      type: ParameterType.INT,
      pretty_name: "Stimulus duration",
      default: null,
    },
    /**
     * How long to show trial before it ends.
     */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
    /**
     * If true, trial will end when subject makes a response.
     */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
  },
};

// type Info = typeof info;

/**
 * **html-keyboard-response**
 *
 * jsPsych plugin for displaying a stimulus and getting a keyboard response
 *
 * @author Timon
 *
 */
export default class SemanticMemoryTaskPlugin {
  static info = info;

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial = (display_element, trial) => {
    let input_html = `<div class="input">
        <form class="form" name="textform">
          <label class="formlabel" for="fname">Please write one word that describes how the image you chose relates to the top image:</label>
          <input class="forminput" type="text" id="fname" name="fname"><br><br>
          <input class="button" type="submit" value="Submit">
        </form> 
      </div>`;
    var new_html =
      '<div id="semantic-memory" class="semantic-memory">' +
      trial.stimulus +
      input_html +
      "</div>";

    // add prompt
    if (trial.prompt !== null) {
      new_html += trial.prompt;
    }

    // draw
    display_element.innerHTML = new_html;

    // store response
    var response = {
      rt: null,
      key: null,
    };

    // function to end trial when it is time
    const end_trial = () => {
      // kill any remaining setTimeout handlers
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key,
      };

      // clear the display
      display_element.innerHTML = "";

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = (info) => {
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector("#semantic-memory").className +=
        " responded";

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != "NO_KEYS") {
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector("#semantic-memory").style.visibility =
          "hidden";
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }
  };

  simulate(trial, simulation_mode, simulation_options, load_callback) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }

  create_simulation_data = (trial, simulation_options) => {
    const default_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      response: this.jsPsych.pluginAPI.getValidKey(trial.choices),
    };

    const data = this.jsPsych.pluginAPI.mergeSimulationData(
      default_data,
      simulation_options
    );

    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);

    return data;
  };

  simulate_data_only = (trial, simulation_options) => {
    const data = this.create_simulation_data(trial, simulation_options);

    this.jsPsych.finishTrial(data);
  };

  simulate_visual = (trial, simulation_options, load_callback) => {
    const data = this.create_simulation_data(trial, simulation_options);

    const display_element = this.jsPsych.getDisplayElement();

    this.trial(display_element, trial);
    load_callback();

    if (data.rt !== null) {
      this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
    }
  };
}
