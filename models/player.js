const Resource = require('./resource');

class Player {
  constructor(name, character) {
    this.name = name;
    this.uniq_id = Player.makeId();
    character.is_selected = true;
    this.character = character;
    this.extra_lives = 3;
    this.food_goal = [];
    this.victory_goal = [];
    this.home_inventory = [
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource)
    ]
    this.market_inventory = [
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource)
    ];

    this.image = "<img src='images/characters/"+character.name+".png'>";
  }

  setGoals(resources) {
    // Food goal changes each round
    var item1 = resources[Math.floor(Math.random()*resources.length)];
    var item2 = resources[Math.floor(Math.random()*resources.length)];
    var item3 = resources[Math.floor(Math.random()*resources.length)];
    var item4 = resources[Math.floor(Math.random()*resources.length)];
    this.food_goal = [item1, item2, item3, item4];

    // Victory goal only changes after being 'bought'
    if (this.victory_goal.length == 0) {
      var item1 = resources[Math.floor(Math.random()*resources.length)];
      var item2 = resources[Math.floor(Math.random()*resources.length)];
      var item3 = resources[Math.floor(Math.random()*resources.length)];
      var item4 = resources[Math.floor(Math.random()*resources.length)];
      this.victory_goal = [item1, item2, item3, item4];
    }
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
