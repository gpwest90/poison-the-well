const Player = require('./player');
const Character = require('./character');

var characters = Character.createCharacters();

class Game {
  
  constructor() {
    this.player_count = 0;
    this.players = [];
    this.resources = [];
    this.has_started = false;
    this.phase = 0;
  }

  prepNewRound() {
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].setGoals(this.resources);
    }
  }

  markPlayerReady(player_id, data) {
    var player = this.getPlayerById(player_id);
    if (player == null) {
      player.handleData('false');
      return
    }
    player.is_ready = true;
    player.handleData(data);
  }

  checkNextPhase() {
    if (this.allPlayersReady()) {
      this.resetPlayerReady();
      if (this.phase == 0) {
        for (var i = 0; i < this.players.length; i++){
          this.players[i].farmResources();
        }
        this.phase = 1;
      } else if (this.phase == 1) {

        this.phase = 2;
      } else if (this.phase == 2) {
        
        this.phase = 3;
      } else if (this.phase == 3) {
        
        this.phase = 4;
      } else if (this.phase == 4) {
        
        this.phase = 0;
      }
    }
  }

  resetPlayerReady() {
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].is_ready = false;
    }
  }

  allPlayersReady() {
    // DEBUG
    return true;
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

}

var getById = function(array, uniq_id) {
  var pos = array.map(p => p.uniq_id).indexOf(uniq_id);
  return pos == -1 ? null : array[pos];
}

module.exports = Game;
