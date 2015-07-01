# ozbt #

`ozbt` is a [Twitch](http://twitch.tv/) bot that is **open source** and runs on
[`node.js`](https://nodejs.org/).

## 1. Installation ##

0. If you've never used `node.js` before, please head to their website and install
it.

1. First thing you need to do is open the `config/` folder and create two files:
`username` and `oauth`, with no file extensions. Open them in your text editor of
choice and place the username you want your bot to have in `username` and, using
[twitchtools](https://twitchtools.com/chat-token), get an OAuth token and place that
in the file `oauth`. Bear in mind this token should be kept private and away from
other users. You have been warned.

2. Open a commandline and navigate to the folder you've extracted/cloned `ozbt` to
and run the command:

``
    npm install
``

This will install all the dependencies you need for `ozbt`.

3. From the commandline again, run the command:

``
    node app
``

This will cause `node.js` to run `app.js`. If you've misconfigured `ozbt`, you'll find
out here. If you see a series of events like `connecting`, `logon` then `disconnected`, make sure your configuration files are correct.