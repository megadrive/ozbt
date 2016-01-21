# Commands #

Anything a standard user can use, a mod can use and whatever a mod can use a broadcaster can use. The command delimeter shown (!) is the default. Keep in mind that streamers can turn off commands by using `!turn command [on|off]` on a per-channel basis. Not only that but by using `!set_access command [everybody|subscriber|moderator|broadcaster]` on a per-channel basis too. So these are DEFAULTS ONLY.

## Users ##

`!join`
> Only works in `#ozbt`. Used to get ozbt to join your channel.

`!part`
> Only works in your channel. Gets ozbt to leave your channel.

`!points`
> Displays the points the user has after playing the various games.

`!rps [rock|paper|scissors]`
> Play Rock, Paper, Scissors against ozbt! If you lose, you're timed out for 30 seconds if ozbt is modded, so play wisely!

`!uptime`
> Displays the uptime of the stream.

## Mods ##

`!turn [trigger] [on|off]`
> Turns any command except itself on or off.
>> `!turn rps off`

`!custom_add [trigger] [message]`
> Create a custom command for the channel that fires when `!trigger` is used. Please @NOTE user-levels are not implemented yet, so anyone can use them currently.

`!custom_remove [trigger]`
> Remove a trigger. `trigger` does not include the delimeter (`!` by default)

`!custom_list`
> Lists all custom commands in a channel.

`!domain [add|remove] [domain] [consequence] [timeoutTime]`
> Adds or removes a domain that will timeout or ban a user for using it. `timeoutTime` is only needed if the `consequence` is a timeout.

> Examples:
>> `!domain add bit.ly ban` will ban anyone using the `bit.ly` domain.

>> `!domain add adf.ly timeout 1` will purge (1s timeout) anyone who posts an `adf.ly` link.

>> `!domain remove bit.ly` will remove `bit.ly` from the punishable domains list.

`!punishable_domains`
> Displays all punishable domains and their consequences, but not how long a timeout is for so people don't abuse it. Could remove consequence output in future depending on feedback.

`!turn [trigger] [on|off]`
> Turn a command on and off. Works for core commands (listed here) and custom commands.

`!strawpoll [pollTitle],[item1],[item2],...`
> This creates a Strawpoll.me poll with the items. It will output the url. The syntax is a bit awful so here are some examples:

> Examples:
>> `!strawpoll How great is ozbt?,Amazing!,Buggy!` will create a strawpoll with the title "How great is ozbt?" with two items: "Amazing!" and "Buggy!".

>> `!strawpoll [id]` will return the results of a Strawpoll. The poll does not have to have been made by ozbt. If the strawpoll's id from the previous example is 4312341, then `!strawpoll 4312341` will return the results from that poll.

> The syntax may or may not change. Feedback is definitely welcome for this.

`!wr [gameAbbreviation] [categoryAbbreviation]`
> Beginnings of a command that checks [http://speedrun.com/](Speedrun.com) for the World Record of a game.

> Examples:

> `!wr gtasa any`
>> Outputs the Grand Theft Auto: San Andreas Any% world record to chat.

`!set_access [command] [everybody|subscriber|moderator|broadcaster]`
> Sets the access for a command. Fairly self explanitory.

`!banlinks [on|off]`
> Bans all links.

`!ban_shortened_links [on|off]`
> Bans shortened links as per the file [banned_phrases.json](banned_phrases.json).

`!subgoal [list|create|update|remove] [numberOfSubsNeeded] [subgoalTitle]
> Using `!subgoal` without any parameters acts as if you used `!subgoal list`.

> Examples:

> !subgoal create 10 This is my test subscription.
>> Creates a new sub goal.

> !subgoal list
>> Lists subgoals, with the "cid" you need for updating, and removing any.

> !subgoal remove 1
>> Removes a sub goal with the cid of 1. This will only work if it's associated with your channel.

> !subgoal update 0 20 CRAZY NEW SUBGOAL
>> Updates a sub goal with the cid of 0 to 20 subs with a new title. Its worth mentioning that currently a title is required, even if it's exactly the same.

## Broadcaster ##

`!ozbt`
> See if ozbt is in your channel. Should probably move it into mods.

`!greeting [sub|resub|host] [message]`
> Set a greeting, works with new subs, resubs and hosting! This command supports variables, shown in the examples below.

> Examples:

> New sub, supports ${nick}
>> `!greeting sub Hey ${nick}! Thanks for subbing dude.`

> Resub
>> `!greeting resub What da fok, ${nick}! That's ${months} month${s} you've subscribed!`

> Hosting
>> `!greeting host Now being hosted by ${username} for ${viewers} viewers!`

# Writing your own command #

@TODO This section
