namespace Game {
    
    /**
     * medium: an intervening agency, means, or instrument 
     * by which something is conveyed or accomplished
     */
    export interface Medium {
    }
    
    export interface ItemHolder {
        inventory: Array<InventoryItem>;
    }
    
    export interface Outcome {
    }
    
    export interface ItemAquired extends Outcome {
        itemHolder: ItemHolder;
        item: InventoryItem;
    }
    
    export interface ItemLost extends Outcome {
        itemHolder: ItemHolder;
        item: InventoryItem;
    }
    
    export interface Damage extends Outcome {
        victim: Entity;
        amount: number;
    }
    
    export interface EntityDestroyed extends Outcome {
        entity: Entity;
    }
    
    export interface ItemMoved extends Outcome {
        item: InventoryItem;
        source: ItemHolder;
        destination: ItemHolder;
    }
    
    export interface ItemTransformed extends Outcome {        
        before: Array<InventoryItem>;
        after: Array<InventoryItem>;
    }
    
    export interface Event {
        cell: MapCell;
        initiator: Entity;
        target?: Entity;
        medium?: Medium;
        outcomes: Array<Outcome>;
        getLogString(): string;
    }
    
    /* Example events
    Chop wood: Human initiator, Tree target, Outcome: ItemAquired with Wood item
    Drop wood: Human initiator, Cell target, Outcome: ItemMoved with Actor source, Cell destination
    Gather flint: Human initiator, Rocks target, Outcome: ItemCreate with Flint item
    Light fire: Human initiator, Cell (with Wood inventory) target, Flint medium, Outcome: DoodadCreated (?)
    Campfire burns actor: Doodad initiator, Cell target, Fire medium, Outcome: Damage with Actor victim
    Gather stone: Human initiator, Rocks target, Outcome: ItemCreate with Stone item
    Throw stone at bird: Human initiator, Bird target, Stone medium,
        Outcome: Damage with Bird victim, EntityDestroyed with Bird entity, ItemAquired with Raw Bird Meat item
    Drop raw bird meat: Human initiator, Cell (with Campfire) target, Outcome: ItemMoved
    Campfire roasts bird: Campfire initiator, Cell target, Fire medium,
        Outcome: ItemTransformed with Raw Bird Meat before and Roast Bird Meat after 
    */
}