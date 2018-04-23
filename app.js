const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const server = require('http').createServer(app);  
const io = require('socket.io')(server);

const Game = require('./models/game');

var game = new Game();

// Test Data
game.connectNewPlayer("Page", 0);
game.connectNewPlayer("Richard", 1);
game.connectNewPlayer("Evan", 2);
game.connectNewPlayer("Sam", 3);
game.connectNewPlayer("John", 4);
game.connectNewPlayer("Elliot", 5);
//----

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/node_modules'));  
app.use(express.static(__dirname + '/assets'));

// Socket connection
io.on('connection', function(client) {
  console.log('Client connected...');

  client.on('join', function(player_id) {
      console.log("Finding player: "+ player_id);
      var player = game.getPlayerById(player_id);
      console.log(player);
      if (player == null) {
        client.emit('not-found');
        client.disconnect();
      } else {
        client.emit('reconnect');
      }
  });
  client.on('disconnect', function () {
    console.log('Client disconnected');
  });

  client.on('get-match-data', function(player_id) {
    client.emit('match-data', {
      game: game, 
      player: game.getPlayerById(player_id)
    });
  });
});



// Set default renderings
app.set('view engine', 'html');
app.engine('html', exphbs({
  defaultLayout: 'main',
  extname: '.html',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, '/views/partials/')
}))
app.set('views', path.join(__dirname, 'views'))

// Start Server
server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})


// 
// ### Routes
// 
// Home
app.get('/', (req, res) => {
  res.render('home', {
    errors: req.query.errors,
    characters: game.listOfAvailableCharacters(),
    player_count: game.numPlayers(),
    root_url: 'localhost:'+port
  })
})

// Players
app.post('/player', (req, res) => {
  var player = game.connectNewPlayer(req.body.name, parseInt(req.body.character_id));
  if (player == null) {
    var errors = "Character was already selected";
    if (req.body.character_id == null) {
      errors = "Please select a character";
    }
    res.redirect('/?errors='+errors);
  } else {
    io.sockets.emit('new-player',{player: player});
    res.render('players/new', {
      player: player
    })
  }
})

app.get('/players', (req, res) => {
  res.render('players/index', {
    players: game.players
  })
})

// Game

app.get('/game', (req, res) => {
  debugger
  if (game.has_started == false) {
    res.render('games/show', {
      game: game
    });
  } else {
    res.redirect('/?errors=' + "No game has started yet");
  }
})

app.get('/debug', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ game: game }, null, 3));
})



// JSON example:
// res.setHeader('Content-Type', 'application/json');
// res.send(JSON.stringify({player: player}));
