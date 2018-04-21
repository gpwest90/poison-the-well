Make sure to have node installed and NPM (node package manager).

You may need to install new node packages with npm:
`npm install`

In the root directory, start the server with:
`node app.js`

This will start a server running on port 3000. You can navigate to this by going to "localhost:3000"

This will take you the join game screen, where you can select a character and enter the game. This will generate a cached key in your web browser that will remember who you are.
If you wish to join multiple times, either use a different web broweser or open a new browser in private (incognito) mode.

The routes are as follow:

.../            Join the game
.../players     List of players waiting to play
.../game        The gameboard, where the actual game will take place
.../debug       A JSON output of all game data for quick reference
