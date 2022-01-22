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

// You can import stylesheets (.scss or .css).
import '../styles/main.scss';

import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import ImageKeyboardResponsePlugin from '@jspsych/plugin-image-keyboard-response';
import PreloadPlugin from '@jspsych/plugin-preload';
import { initJsPsych } from 'jspsych';
import SemanticMemoryTask from 'semantic-memory-task';

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

    const intro = {
        timeline: [{
            type: SemanticMemoryTask,
            stimulus: '<p>HtmlKeyboardResponsePlugin / Welcome to pris stimuli experiment!<p/>',
        }]
    };

    const items = require("../items/first.json")

    const five_images_procedure = {
        timeline: [{
            type: HtmlKeyboardResponsePlugin,
            // stimulus: '<img src="media/images/1A.jpg">',
            stimulus: function () {
                var html = `<img src="media/images/${jsPsych.timelineVariable('target')}.jpg">`;
                let cues = jsPsych.timelineVariable('cues');
                for (let i = 0; i != cues.length; ++i) {
                    html += `<img src="media/images/${cues[i]}.jpg">`;
                }
                return html;
            },
            choices: ['J', 'K']
        }],
        timeline_variables: items // [{target: '1A', cues: ['1B', '1C', '1D', '2A']}]
    };

    var preload = {
        type: PreloadPlugin,
        images: assetPaths.images,
        auto_preload: true,
        error_message:
            'The experiment failed to load. Please contact the researcher.'
    };

    await jsPsych.run([preload, intro, five_images_procedure]);

    // Return the jsPsych instance so jsPsych Builder can access the
    // experiment results (remove this if you handle results
    // yourself, be it here or in `on_finish()`)
    return jsPsych;
}
