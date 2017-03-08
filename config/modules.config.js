"use strict";

/**
 * This is simply a list of the modules you would like to have running. You don't
 * have to have the .js however, if your file is in a directory, include that.
 * ex: ["filters/helloworld", "baneveryone"]
 *
 * All logic in included in their respective .js files.
 *
 * If changed, the bot must be restarted.
 */

module.exports = [
  //"banhtml",
  //"banlinks", // @NOTE: Rewrite
  //"banselfpromo", // @NOTE: Rewrite
  //"banshortlinks", // @NOTE: Rewrite
  "commands",
  //"giveaways", // @NOTE: Unworking, probably won't continue.
  //"greetings",
  //"kappa",
  "repeatcommands", // @NOTE: Needs a rewrite
  //"subgoals" // @NOTE: Still needs a frontend.
];
