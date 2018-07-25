
var global_game = null;

class Game {
  
  constructor() {
    this.player_count = 0;
    this.players = [];
    this.resources = [];
    // 8 posts for trading
    this.trading_post = [null,null,null,null,null,null,null,null];
    this.has_started = false;
    this.phase = 0;
    this.day = 1;
    this.vp_goal = 16;
    this.current_vp = 0;
    this.concluded = false;
    global_game = this;
    characters = Character.createCharacters();
  }

  destroy() {
    for (var i=0; i < this.players.length; ++i) {
      if (this.players[i] != null) {
        this.players[i].destroy();
      }
    }
  }

  startGame() {
    this.has_started = true;
    this.player_count = this.players.length;
    this.vp_goal = this.player_count * 3;
    this.players[Math.floor(Math.random()*this.players.length)].is_necromancer = true;
  }

  markPlayerReady(player_id, data) {
    var player = this.getPlayerById(player_id);
    if (player != null) {
      this.playerCancelledTrade(player_id);
      player.is_ready = true;
      player.handleData(data);
      // TODO is this the best way to handle data?
    }
  }

  playerSelectedResource(player_id, data) {
    var player = this.getPlayerById(player_id);
    if (player != null) {
      if (this.phase == 1) {
        player.marketResource(data.resource_id)
      } else if (this.phase == 2) {
        player.tradeResource(data.resource_id)
      }
    }
  }

  playerPoisonedResource(player_id, data) {
    var player = this.getPlayerById(player_id);
    if (player != null) {
      player.poisonResource(data.resource_id, data.poison_id)
    }
  }

  playerSelectedTradeSpot(player_id, data) {
    var player = this.getPlayerById(player_id);
    var spot_id = data.trade_spot_id;
    if (this.phase == 2 && player != null && spot_id != null && !player.is_ready) {
      if (this.trading_post[spot_id] == null) {
        // Add player to trading post
        this.trading_post[spot_id] = player

        // Remove player from old post, if they were at one
        var old_post = player.trade_post_id;
        if (old_post != null) {
          this.trading_post[old_post] = null
        }

        // Update player's post reference
        player.trade_post_id = spot_id;
        player.trade_ready = false;
        this.tradePostStateChanged(old_post);
        this.tradePostStateChanged(spot_id);
      }
    }
  }

  playerCancelledTrade(player_id) {
    var player = this.getPlayerById(player_id);
    if (this.phase == 2 && player != null) {
      var old_post = player.trade_post_id;
      // Remove player from trading post
      this.trading_post[old_post] = null;
      // Update player's post reference
      player.trade_post_id = null;
      player.trade_ready = false;
      this.tradePostStateChanged(old_post);
    }
  }

  tradePostStateChanged(post_id) {
    if (post_id != null) {
      var other_post_id = (post_id % 2 == 0) ? post_id + 1 : post_id - 1;
      var other_player = this.trading_post[other_post_id];
      if (other_player != null) {
        other_player.trade_ready = false;
      }
    }
  }

  playerReadyToTrade(player_id, data) {
    var player = this.getPlayerById(player_id);
    var trade_state = data.trade_ready
    if (this.phase == 2 && player != null) {
      player.trade_ready = trade_state;
      if (player.trade_ready) {
        var post_id = player.trade_post_id;
        var other_post_id = (post_id % 2 == 0) ? post_id + 1 : post_id - 1;
        var other_player = this.trading_post[other_post_id]
        if (other_player != null && other_player.trade_ready) {
          var trade_storage = player.trade_inventory;
          player.trade_inventory = other_player.trade_inventory;
          other_player.trade_inventory = trade_storage;

          player.trade_ready = false;
          other_player.trade_ready = false;
        }
      }
    }
  }

  playerPurchaseItem(player_id, data) {
    var player = this.getPlayerById(player_id);
    var item_name = data.item;
    var resource_ids = data.resources
    var target_player_id = data.target_player_id
    player.purchaseItem(item_name, resource_ids, target_player_id);
  }

  zombieAttack(player_id) {
    var player = this.getPlayerById(player_id);
    if (player != null) {
      player.zombie_attacks ++;
    }
  }

  checkNextPhase(force=false) {
    var messages = [];
    if (this.allPlayersReady() || force) {
      this.resetPlayerReady();

      // Selecting resources to farm
      if (this.phase == 0) {
        for (var i = 0; i < this.players.length; i++){
          this.players[i].farmResources();
          this.players[i].setGoals(this.resources);
        }
        this.phase = 1;

      // Taking resources to market
      } else if (this.phase == 1) {

        this.phase = 2;

      // Trading resources at market
      } else if (this.phase == 2) {
        // Remove all players from trade posts
        for (var i=0; i < this.trading_post.length; ++i) {
          if (this.trading_post[i] != null) {
            this.trading_post[i].trade_post_id = null;
            this.trading_post[i] = null;
          }
        }

        // Move all market and trading resources to home inventory

        for (var i=0; i < this.players.length; ++i) {
          this.players[i].moveAllResourcesToHome();
        }
        this.phase = 3;

      // Buying food and victory points
      } else if (this.phase == 3) {

        messages = this.getDaysResults();
        this.day ++;
        this.phase = 0;
      }
    }
    return messages;
  }

  resetPlayerReady() {
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].is_ready = false;
    }
  }

  allPlayersReady() {
    for (var i = 0; i < this.players.length; i++) {
      if (!this.players[i].is_ready) {
        return false;
      }
    }
    return true;
  }

  getPlayerById(uniq_id) {
    return getById(this.players, uniq_id);
  }

  getDaysResults() {
    var messages = [{title: "End of Day "+ this.day, body: ''}];
    var vp_half = this.vp_goal / 2;
    var vp_now = this.current_vp;
    var vp_message = null;
    var damage_message = "";
    var total_extra_lives = 0;
    var necromancer_names = null;

    for (var i = 0; i < this.players.length; ++i) {
      // Tally up gained VP
      this.current_vp += this.players[i].victory_points_gained;
      this.players[i].victory_points_gained = 0;

      // Check who got poisoned 
      var message_so_far = "";
      if (!this.players[i].is_fed) {
        var message_so_far = " starved"
      }
      this.players[i].resetHunger();

      if (this.players[i].poison_used > 0) {
        if (message_so_far != "") {
          message_so_far += " and";
        }
        message_so_far += " was poisoned " + this.players[i].poison_used + " time";
        this.players[i].clearPoison();
      }

      if (this.players[i].zombie_attacks > 0) {
        if (message_so_far != "") {
          message_so_far += " and";
        }
        message_so_far += " was attacked by zombies " + this.players[i].zombie_attacks + " time";
        this.players[i].clearZombie();
      }

      if (message_so_far != ""){
        message_so_far = this.players[i].name + message_so_far + ".<br>";
        damage_message += message_so_far;
      }

      // Tally up total lives remaining
      if (!this.players[i].is_necromancer) {
        total_extra_lives += this.players[i].extra_lives;
      } else {
        necromancer_names = necromancer_names == null ? this.players[i].name : (necromancer_names +" and "+ this.players[i].name);
      }
    }

    // Report VP first
    if (vp_now < vp_half && this.current_vp >= vp_half) {
      messages.push({title: "Victory is Near!", body: "We have delivered half of the shipments to the king."})
    }

    // Report damages
    if (damage_message == "") {
      messages.push({title: "Status Report:", body: "No one was harmed today!"})
    } else {
      messages.push({title: "Status Report:", body: damage_message})
    }

    // Check if game win conditions are met
    if (total_extra_lives == 0) {
      // Necromancer wins
      messages.push({title: "Necromancer Wins!", victory: 'necromancer', body: "The war still rages on and the village lays in ruin. <b>"+necromancer_names+"</b> laid waste to everyone."})
      this.concluded = true;
    } else if (this.current_vp >= this.vp_goal) {
      // Village wins
      messages.push({title: "Village Victory!", victory: 'village', body: "The war has been won! The king is home and we have ousted <b>"+necromancer_names+"</b> for assulting the village."})
      this.concluded = true;
    }
    return messages;
  }

  connectNewPlayer(name, character_id) {
    var character = this.getCharacterById(character_id);
    if (character && character.is_selected == false) {
      var player = new Player(name, character);
      this.players[this.player_count] = player;
      this.resources[this.player_count] = character.resource;
      this.player_count ++;
      return player;
    }
    return null;
  }

  numPlayers() {
    return this.player_count;
  }

  playerList() {
    return this.players;
  }

  resourceList() {
    return this.resources;
  }

  // playerNames() {
  //   return this.players.map(p => p.name);
  // }

  getCharacterById(uniq_id) {
    return getById(characters, uniq_id);
  }

  listOfAvailableCharacters() {
    return characters;
  }

  static getActiveGame() {
    return global_game;
  }

}

var getById = function(array, uniq_id) {
  var pos = array.map(p => p.uniq_id).indexOf(uniq_id);
  return pos == -1 ? null : array[pos];
}

module.exports = Game;

const Player = require('./player');
const Character = require('./character');

var characters;
