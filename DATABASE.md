# Database and Tables #

`ozbt` uses a `node.js` module called [`locallydb`][locallydb], which is a locally-saved plain-text [NoSQL][nosql] database. In a more conventional database, you would have the database itself, then tables to emcompass each individual use-case. The `locallydb` equivilant is the database file itself, then Collections. The syntax to save into the app's database, for instance, is:
>     var locallydb = require('locallydb'); // include the module
>     var db = new locallydb('db/_app'); // open the _app database
>     var testCollection = db.collection('test'); // open a collection called 'test'

So if you were creating a command that recorded words said in chat, you could open (and if not existing, create) a collection called `words`.

## Notes ##

There are some things I should mention currently. I'm fooling around with the idea of allowing users to just create their own databases for their commands, perhaps in a sub-directory in `commands/`. At this stage you are free to do whatever you like. Just be aware that modifying the app central database at `db/_app` can break the bot's functionality like joining channels on connect, the current points system and the punishable domains behaviour.

[locallydb]: http://wamalaka.com/locallydb/
[nosql]: http://wikipedia.org/wiki/NoSQL