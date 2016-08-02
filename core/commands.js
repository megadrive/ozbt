
// An example of how to use an alias for another command.

var user = JSON.parse(process.env.user);

var alias = require("./cmd.js");
alias.list(process.env.channel, user);
