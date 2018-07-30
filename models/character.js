class Character {

  constructor(name, resource, id) {
    this.uniq_id = id;
    this.name = name;
    this.resource = resource;
    this.is_selected = false;
    this.file_path = '/images/characters/'+this.name.toLowerCase() +'.png'
  }

  static createCharacters() {
    var characters = [
      new Character("Farmer", "Grain", 0),
      new Character("Baker", "Bread", 1),
      new Character("Miner", "Iron", 2),
      new Character("Tailor", "Clothing", 3),
      new Character("Cobbler", "Shoes", 4),
      new Character("Smith", "Armor", 5),
      new Character("Alchemist", "Herbs", 6),
      new Character("Lumberjack", "Wood", 7)
    ]
    return characters;
  }

}

module.exports = Character;
