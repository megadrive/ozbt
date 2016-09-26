"use strict";

/**
 * This is simply a list of the modules you would like to have running. You don't
 * have to have the .js however, if your file is in a directory, include that.
 * ex: {["filters/helloworld", "baneveryone"]}
 *
 * All logic in included in their respective .js files.
 *
 * If changed, the bot must be restarted.
 */

module.exports = [
  "banhtml",
  "banlinks",
  "banselfpromo",
  //"banshortlinks", // @NOTE: Not completed.
  "commands",
  //"giveaways", // @NOTE: Unworking, probably won't continue.
  "greetings",
  "kappa",
  "repeatcommands", // @NOTE: Still needs a frontend.
  "subgoals" // @NOTE: Still needs a frontend.
];
