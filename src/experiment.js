/**
 * @title RatingTaskSM
 * @description Select bottom image that best goes with top image
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

// prefix for the stimulus images
const _IMG_PREFIX_ = "media/images/first/";

import "../styles/main.scss";

import { initJsPsych } from "jspsych";

import SemanticMemoryTaskPlugin from "./plugin";
import PreloadPlugin from "@jspsych/plugin-preload";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import jsPsychFullscreen from "@jspsych/plugin-fullscreen";

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

  console.log("Environment is:", environment);

  let enter_fullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: true,
  };

  let welcomeText = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `Willkommen!
                  <div style='width: 700px;'>
                  </div>
                  <p>Dr??cken Sie dann die Taste "a", um die Anweisungen anzuschauen.</p>
                  `,
    choices: "a",
  };

  let subject = {
    type: jsPsychSurveyText,
    questions: [
      {
        prompt:
          "Bitte schalten Sie Musik, Handys und andere Ger??te, die Sie ablenken k??nnten, aus. <p>Geben Sie unten Ihre Versuchspersonennummer ein: </p>",
        required: true,
      },
    ],
    button_label: "Weiter",
    on_finish: function (data) {
      let response = JSON.parse(JSON.stringify(data.response));
      let code = response.Q0;
      jsPsych.data.addProperties({ subject_ID: code });
    },
  };

  let instructions = {
    type: jsPsychInstructions,
    pages: [
      '<p><strong> Anweisungen</strong></p><p>Bitte w??hlen Sie das Bild aus der unteren Vierergruppe aus, das am besten zu dem oberen Bild passt. <p> Danach geben Sie bitte ein Wort ein, das am besten beschreibt, wie das von Ihnen gew??hlte Bild mit dem oberen Bild zusammenh??ngt.</p><p>Klicken Sie auf "Weiter", wenn Sie bereit sind, zu beginnen.</p>',
    ],
    button_label_next: "Weiter",
    button_label_previous: "Zur??ck",
    show_clickable_nav: true,
  };

  const items = require("../items/first.json");
  const semanticMemoryExperiment = {
    timeline: [
      {
        type: SemanticMemoryTaskPlugin,
        stimulus: {
          target: jsPsych.timelineVariable("target"),
          cues: jsPsych.timelineVariable("cues"),
          imagePrefix: _IMG_PREFIX_,
        },
      },
    ],
    timeline_variables: items,
  };
  var timestamp = new Date().toISOString().replace(/z|t/gi, " ").trim();
  jsPsych.data.addProperties({ date: timestamp });

  let preload = {
    type: PreloadPlugin,
    images: assetPaths.images,
    auto_preload: true,
    error_message:
      "The experiment failed to load. Please contact the researcher.",
  };

  await jsPsych.run([
    preload,
    enter_fullscreen,
    subject,
    welcomeText,
    instructions,
    semanticMemoryExperiment,
  ]);

  switch (environment) {
    case "development":
    case "production": {
      jsPsych.data.get().localSave("csv", `WPV_subject${subject}_${timestamp}.csv`);
      break;
    }
    case "jatos": {
      break;
    }
  }

  return jsPsych;
}
