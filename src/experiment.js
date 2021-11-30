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
import {initJsPsych} from 'jspsych';

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
export async function run({assetPaths, input = {}, environment}) {
    const jsPsych = initJsPsych();

    const timeline = [];

    // Preload assets
    timeline.push({
        type: PreloadPlugin,
        images: assetPaths.images,
        audio: assetPaths.audio,
        video: assetPaths.video,
    });

    // Welcome screen
    timeline.push({
        type: HtmlKeyboardResponsePlugin,
        stimulus: '<p>Welcome to pris stimuli experiment!<p/>',
    });

    // Switch to fullscreen
    timeline.push({
        type: FullscreenPlugin,
        fullscreen_mode: true,
    });

    var instructions = {
        type: HtmlKeyboardResponsePlugin,
        stimulus: `
    <p>In this experiment, a circle will appear in the center 
    of the screen.</p><p>If the circle is <strong>blue</strong>, 
    press the letter F on the keyboard as fast as you can.</p>
    <p>If the circle is <strong>orange</strong>, press the letter J 
    as fast as you can.</p>
    <div style='width: 700px;'>
    <div style='float: left;'><img src='img/blue.png'></img>
    <p class='small'><strong>Press the F key</strong></p></div>
    <div style='float: right;'><img src='img/orange.png'></img>
    <p class='small'><strong>Press the J key</strong></p></div>
    </div>
    <p>Press any key to begin.</p>
  `,
        post_trial_gap: 2000
    };
    timeline.push(instructions);

    // generate html that displays the stimuli images
    // input relative paths of images
    function generateStimulusHTML(img1, img2, img3, img4, img5) {
        return '<img src="media/img/1A.jpg"><img src="media/img/1B.jpg">'
    }

    var blue_trial = {
        type: ImageKeyboardResponsePlugin,
        stimulus: generateStimulusHTML('', ''),
        choices: ['f', 'j']
    };

    var orange_trial = {
        type: ImageKeyboardResponsePlugin,
        stimulus: 'media/images/orange.png',
        choices: ['f', 'j']
    };

    timeline.push(blue_trial, orange_trial);

    await jsPsych.run(timeline);

    // Return the jsPsych instance so jsPsych Builder can access the experiment
    // results (remove this if you handle results yourself, be it here or in
    // `on_finish()`)
    return jsPsych;
}
