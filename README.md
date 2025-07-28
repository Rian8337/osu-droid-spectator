# osu!droid Spectator Client

> Notice: This client is in beta stage.

A web-based spectator client for osu!droid using a [custom game client](https://github.com/Rian8337/osu-droid/tree/tournament-client).

Code for previewing beatmap mostly taken from [osu-preview](https://github.com/jmir1/osu-preview). Beatmaps are downloaded from [Sayobot](https://osu.sayobot.cn/).

## Using the client

The client can be accessed [here](https://droidpp.osudroid.moe/spectator).

Please see the [wiki](https://github.com/Rian8337/osu-droid-spectator/wiki) for information about operating the client.

## Building from source

You may also build the client from source. To do so, you need [Node.js](https://nodejs.org) version 18 or later. The latest LTS release is recommended.

Install all dependencies with `npm i` and run `npm run build-production`. After that, open `index.html` in your browser of choice.

For development builds, run `npm run build-development`. This will skip minification.
