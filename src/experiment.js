/**
 * @title pris stimuli experiment
 * @description pictures of bears
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

// You can import stylesheets (.scss or .css).
import "../styles/main.scss";

import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import ImageKeyboardResponsePlugin from "@jspsych/plugin-image-keyboard-response";
import PreloadPlugin from "@jspsych/plugin-preload";
import { initJsPsych } from "jspsych";
import SemanticMemoryTaskPlugin from "./plugin";
// import SemanticMemoryTask from 'semantic-memory-task';

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

  const items = require("../items/first.json");
  const intro = {
    timeline: [
      {
        type: SemanticMemoryTaskPlugin,
        stimulus: function () {
          let target = jsPsych.timelineVariable("target");
          let cues = jsPsych.timelineVariable("cues");

          let html = `<div class="stimuli">`;

          html = `<img class="target" src="${
            _IMG_PREFIX_ + target
          }.jpg">`;
          


          html += `<div class="cues">`;
          for (let i = 0; i != cues.length; ++i) {
            html += `<img class="cue" src="${_IMG_PREFIX_ + cues[i]}.jpg">`;
          }
          html += `</div>`;

          html += `<div class="question">`
          html += "Which of the four images goes best with the top image?"
          html += `</div>`

          // html += `<div class="input">` 
          // html += `
          // <form class="form" action="/action_page.php">
          // <label class="formlabel" for="fname">Please write one word that describes how the image you chose relates to the top image:</label>
          // <input class="forminput" type="text" id="fname" name="fname"><br><br>
          // <input class="button" type="submit" value="Submit">
          // </form> 
          // `
          // html += `</div>`

          html += `</div>`;

          return html;
        },
        choices: ["J", "K"],
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
  return jsPsych;
}
