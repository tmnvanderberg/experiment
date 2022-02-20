/**
 * @title Semantic Memory Experiment
 * @description <todo>
 * @version 0.1.0
 *
 * The following lines specify which media directories will be packaged and
 * preloaded by jsPsych. Modify them to arbitrary paths (or comma-separated
 * lists of paths) within the `media` directory, or just delete them.
 * @imageDir images
 * @audioDir audio
 * @videoDir video
 * @miscDir misc
 */

const _IMG_PREFIX_ = "media/images/first/";

import "../styles/main.scss";

import { initJsPsych } from "jspsych";
import SemanticMemoryTaskPlugin from "./plugin";
import PreloadPlugin from "@jspsych/plugin-preload";

import jquery from "jquery";

/**
 * This method will be executed by jsPsych Builder and is expected to run the
 * jsPsych experiment
 *
 * @param {object} options Options provided by jsPsych Builder
 * @param {any} [options.input] A custom object that can be specified via the
 *     JATOS web interface ("JSON study input").
 * @param {"development"|"production"|"jatos"} options.environment The context
 *     in which the experiment is run: `development` for `jspsych run`,
 *     `production` for `jspsych build`, and "jatos" if served by JATOS
 * @param {{images: string[]; audio: string[]; video: string[];, misc:
 *     string[];}} options.assetPaths An object with lists of file paths for the
 *     respective `@...Dir` pragmas
 */
export async function run({ assetPaths, input = {}, environment }) {
  const jsPsych = initJsPsych();

  const items = require("../items/example.json");
  const intro = {
    timeline: [
      {
        type: SemanticMemoryTaskPlugin,
        stimulus: () => {
          return {
            target: jsPsych.timelineVariable("target"),
            cues: jsPsych.timelineVariable("cues"),
            imagePrefix: _IMG_PREFIX_,
          };
        },
      },
    ],
    timeline_variables: items,
  };

  var preload = {
    type: PreloadPlugin,
    images: assetPaths.images,
    auto_preload: true,
    error_message:
      "The experiment failed to load. Please contact the researcher.",
  };

  await jsPsych.run([preload, intro]);

  // Return the jsPsych instance so jsPsych Builder can access the
  // experiment results (remove this if you handle results
  // yourself, be it here or in `on_finish()`)

  const data = jsPsych.data.get();
  const semantic_memory_trials = data.trials.filter((trial) => {
    return trial.trial_type === "semantic-memory-task";
  });
  console.log("[semantic-memory-experiment] trials:\n", semantic_memory_trials);

  const stringifiedTrials = JSON.stringify(semantic_memory_trials);

  jquery.post("http://127.0.0.1:3005/", stringifiedTrials, () => {
    console.log("[semantic-memory-experiment] successfully submitted results.");
  });

  return jsPsych;
}
