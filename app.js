const express = require('express')
const app = express()
const port = 3005
const path = require('path')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const server = require('http').createServer(app);  
const io = require('socket.io')(server);

const Game = require('./models/game');

var game = new Game();

// Test Data
// game.connectNewPlayer("Page West", 0);
// game.connectNewPlayer("Richard Dyer", 1);
// game.connectNewPlayer("Evan Martinez", 2);
// game.connectNewPlayer("Sam Blevins Dyer", 3);
// game.connectNewPlayer("John a pizza pie Daidone", 4);
// game.connectNewPlayer("Elliot Always Selling Haag", 5);
// game.startGame();
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
    client.emit('match-data', { game: game });
  });

  client.on('player-ready', function(player_id, data) {
    game.markPlayerReady(player_id, data);
    messages = game.checkNextPhase(data.next_phase);
    io.sockets.emit('match-data', { game: game, messages: messages });
    if (game.concluded) {
      game.destroy();
      game = new Game();
    }
  });

  client.on('resource-selected', function(player_id, data) {
    game.playerSelectedResource(player_id, data);
    if (game.phase == 2) {
      io.sockets.emit('match-data', { game: game });
    } else {
      client.emit('match-data', { game: game });
    }
  });

  client.on('resource-poisoned', function(player_id, data) {
    game.playerPoisonedResource(player_id, data);
    client.emit('match-data', { game: game });
  });

  client.on('trade-spot-selected', function(player_id, data) {
    game.playerSelectedTradeSpot(player_id, data);
    // TODO Only emit if change was made
    io.sockets.emit('match-data', { game: game });
  });

  client.on('trade-cancelled', function(player_id) {
    game.playerCancelledTrade(player_id);
    // TODO Only emit if change was made
    io.sockets.emit('match-data', { game: game });
  });

  client.on('trade-ready', function(player_id, data) {
    game.playerReadyToTrade(player_id, data);
    // TODO Only emit if change was made
    io.sockets.emit('match-data', { game: game });
  });

  client.on('player-purchase', function(player_id, data) {
    game.playerPurchaseItem(player_id, data);
    client.emit('match-data', { game: game });
  });

  client.on('start-game', function() {
    game.startGame();
    io.sockets.emit('game-started');
  })
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
    game_has_started: game.has_started,
    root_url: 'localhost:'+port
  })
})

// Players
app.post('/player', (req, res) => {
  if (game.has_started) {
    return res.redirect('/?errors='+"The game started without you :(");
  }

  if (req.body.name == '') {
    return res.redirect('/?errors='+"You must name your character");
  }

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
      player: player,
      root_url: 'localhost:'+port
    })
  }
})

app.get('/players', (req, res) => {
  if (game.has_started) {
    return res.redirect('/game');
  }

  res.render('players/index', {
    players: game.players,
    root_url: 'localhost:'+port
  })
})

// Game

app.get('/game', (req, res) => {
  if (game.has_started) {
    res.render('games/show', {
      game: game,
      vp_needed: game.vp_goal,
      root_url: 'localhost:'+port
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
