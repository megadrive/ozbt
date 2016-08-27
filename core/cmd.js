
var util = require("../util.js");
var db = require("../dbHelpers.js");
var consts = require("../consts.js");
var user = JSON.parse(process.env.user);

// Get arguments.
var args = process.env.message.split(" ");

var intent = args[1];
var cmd = args[2];
var string = args.splice(3).join(" ");

// Add a new custom command
// @TODO: This can be changed to not use db.find(). Use the cb to figure out output.
var add = () => {
    // Check for existance. If it exists already, output an error pointing to !cmd edit.
    db.find(db.db(), "customcommand", {
        "Channel": process.env.channel,
        "Command": cmd
    }, (rows) => {
        if( rows.length > 0 ){
            // We have a command already, output a warning
            util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " already exists, did you mean to use !cmd edit?");
        }
        else {
            // remove / if at the beginning of the string to prevent abuse.
            var rslashes = /^\/+/;
            string = string.replace(rslashes, "");

            db.insert(db.db(), "customcommand", {
                "Command": cmd,
                "OutputText": string,
                "Channel": process.env.channel
            }, (rows) => {
              if( rows.inserted.length === 1 ){
                  util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " was created.");
              }
              else {
                  console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
              }
            });
        }
    });
};

var edit = () => {
  var rslashes = /^\/+/;
  string = string.replace(rslashes, "");

  var select = {
    "Command": cmd,
    "Channel": process.env.channel
  };
  var update = {
    "OutputText": string
  };
  db.update(db.db(), "customcommand", select, update, function(rows){
    if( rows.length === 1 ){
        util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " was updated.");
    }
    else {
        console.error("There was an error when running " + process.env.message + " in " + process.env.channel);
    }
  });
};

var del = () => {
  db.delete(db.db(), "customcommand", {"Command": cmd, "Channel": process.env.channel}, (err, arr) => {
    if(err)
      throw new Error(err);

    if( arr.length === 1 ){
        util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " was deleted.");
    }
    else {
        util.say(process.env.channel, util.getDisplayName(user) + " -> command " + cmd + " doesn't exist. Did you mean to use !cmd add?");
    }
  });
};

// @NOTE: This function will be a mess. Fix it asap.
var list = (channel, userObj) => {
  // @TODO: Move this to the webpage api.
  util.whisper(user.username, "Commands are currently down. Sorry!");
  return;

    var userlevel = 99;
    if( util.checkPermissionCore(channel, userObj, consts.access.broadcaster) )
        userlevel = consts.access.broadcaster;
    if( util.checkPermissionCore(channel, userObj, consts.access.moderator) )
        userlevel = consts.access.moderator;
    if( util.checkPermissionCore(channel, userObj, consts.access.subscriber) )
        userlevel = consts.access.subscriber;
    if(userlevel === 99)
        userlevel = consts.access.everybody;

    // some custom sql
    var sql =   "SELECT * FROM `customcommand` C \
                    INNER JOIN `commandpermission` P \
                ON C.`Command` = P.`Command` AND C.`Channel` = '" + channel + "'\
                WHERE P.`PermissionLevel` >= " + userlevel;

    var query = db.join(db.db(), "customcommand", "custompermission", "permission", {
      "Channel": channel
    });

    console.log(query); return;

    db.db().query(sql, (err, rows, fields) => {
        if(!err){
            var available_commands = [];

            for(var i = 0; i < rows.length; i++){
                if(rows[i].Command != null && rows[i].PermissionLevel != null){
                    if(util.checkPermissionCore(channel, user, rows[i].PermissionLevel)){
                        available_commands.push(rows[i].Command);
                    }
                }
            }

            util.whisper(user.username, "Commands available to you in chat for " + channel + ": " + available_commands.join(" "));
        }
    });
};

if( util.checkPermissionCore(process.env.channel, user, consts.access.moderator) ){
    switch(intent){
        case "add":
            add();
            break;
        case "edit":
            edit();
            break;
        case "delete":
            del();
            break;
        case "list":
            list(process.env.channel, user);
            break;
    }
}

// This is here so that we can create alias commands. !commands will be an alias for list
module.exports = {
    "list": list
};
