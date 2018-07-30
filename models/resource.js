var resource_id = 1;

class Resource {

  constructor(name) {
    this.uniq_id = resource_id++;
    this.name = name;
    this.is_poisoned = false;
    this.image =  "<img class='consumable "+this.name+
                  " resource-"+this.uniq_id+
                  "' data-resource-type='"+this.name+
                  "' data-resource-id='"+this.uniq_id+
                  "'src='images/resources/"+this.name.toLowerCase()+".png'>";
  }

  becamePoisoned() {
    this.is_poisoned = true;
    this.image =  "<img class='consumable is-poisoned "+this.name+
                  " resource-"+this.uniq_id+
                  "' data-resource-type='"+this.name+
                  "' data-resource-id='"+this.uniq_id+
                  "'src='images/resources/"+this.name.toLowerCase()+".png'>";
  }

  destroy() {
    this.name = null;
    this.uniq_id = null;
    this.is_poisoned = null;
    this.image = null;
  }


  static generateRandomResource() {
    var types = ["Grain", "Bread", "Iron", "Clothing", "Shoes", "Armor", "Herbs", "Wood"];
    return new Resource(types[Math.floor(Math.random()*types.length)]);
  }

}

module.exports = Resource;