const Resource = require('./resource');

class Player {
  constructor(name, character) {
    this.name = name;
    this.uniq_id = Player.makeId();
    character.is_selected = true;
    this.character = character;
    this.extra_lives = 3;
    this.trade_inventory = [
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource)
    ];
  }

  static makeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

}

module.exports = Player;
