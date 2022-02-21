import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import jQuery from "jquery";

window.$ = window.jQuery = jQuery;

const info = {
  name: "semantic-memory-task",
  parameters: {
    /**
     * Stimulus returns object { target: string, cues Array<string>, imagePrefix: string }
     */
    stimulus: {
      type: ParameterType.OBJECT,
      pretty_name: "Stimulus",
      default: undefined,
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

/**
 * **semantic-memory-task**
 * jsPsych plugin for semantic memory task.
 *
 * @author Timon van der Berg
 *
 */
export default class SemanticMemoryTaskPlugin {
  static info = info;

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  // html for the form where user enter input
  formHTML = () => {
    return `<div class="semanticForm">
                <label class="formLabel" for="fname">
                  Please write one word that describes how the image you chose relates to the top image.
                </label>
                <input class="formText" type="text" id="semanticTextID" name="fname">
                <input class="formButton" type="button" id="semanticButtonID" value="Submit"> 
            </div>`;
  };

  // stimulus = {target, cues, imagePrefix}
  stimulusHTML = (stimulus) => {
    let html = `<div class="stimuli">
                  <img 
                    class="target"
                    src="${stimulus.imagePrefix + stimulus.target}.jpg"
                  >
                <div class="cues">`;
    for (let i = 0; i != stimulus.cues.length; ++i) {
      html += `<img 
                class="cue" 
                id="stim-${stimulus.cues[i]}"
                src="${stimulus.imagePrefix + stimulus.cues[i]}.jpg">`;
    }
    html += `</div>
            <div class="question">
              Which of the four images goes best with the top image?
            </div>`;
    return html;
  };

  // the trial
  trial = (display_element, trial) => {
    let new_html =
      '<div id="semantic-memory" class="semantic-memory">' +
      this.stimulusHTML(trial.stimulus) +
      this.formHTML() +
      "</div>";

    // draw
    display_element.innerHTML = new_html;

    // define struct to store response
    let response = {
      text: null,
      selectedCue: null,
    };

    // handle using clicking submit
    $("#semanticButtonID").on("click", () => {
      response.text = $("#semanticTextID").val();
      if (response.selectedCue === null || response.text === "") {
        alert("Please select an image AND enter a word before submitting!.");
        return;
      }
      console.log(
        `[semantic-memory-task] Response: ${JSON.stringify(response)}`
      );
      after_response();
    });

    // change selection helper
    const select = (toSelectCue) => {
      if (response.selectedCue === toSelectCue) {
        return;
      }
      response.selectedCue = toSelectCue;
      for (let cue of trial.stimulus.cues) {
        let cueID = `#stim-${cue}`;
        if (cue === toSelectCue) {
          $(cueID).addClass("selectedCue");
        } else {
          $(cueID).removeClass("selectedCue");
        }
      }
    };

    // handle user selecting a cue
    for (let cue of trial.stimulus.cues) {
      let cueID = `#stim-${cue}`;
      $(cueID).on("click", () => {
        console.log(`[semantic-memory-task] SelectedCue: ${cue}`);
        select(cue);
      });
    }

    // function to end trial when it is time
    const end_trial = () => {
      // kill any remaining setTimeout handlers
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      let trial_data = {
        stimulus: trial.stimulus,
        response: response,
      };

      // clear the display
      display_element.innerHTML = "";

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // handle subject responses.
    let after_response = (info) => {
      display_element.querySelector("#semantic-memory").className +=
        " responded";
      if (trial.response_ends_trial) {
        end_trial();
      }
    };

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
      response: {
        text: "_default_response_text_",
        selectedCue: "_default_selected_cue_",
      },
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
