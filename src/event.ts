namespace Game {
    
    export interface Entity {
        cell: MapCell;
    }
    
    /**
     * medium: an intervening agency, means, or instrument 
     * by which something is conveyed or accomplished
     */
    export interface Medium {
    }
    
    export interface ItemHolder {
        inventory: Array<InventoryItem>;
    }
    
    export interface Effect {
    }
    
    export interface ItemCreated extends Effect {
        item: InventoryItem;
    }
    
    export interface Damage extends Effect {
        victim: Entity;
        amount: number;
    }
    
    export interface EntityDestroyed extends Effect {
        entity: Entity;
    }
    
    export interface ItemMoved extends Effect {
        item: InventoryItem;
        source: ItemHolder;
        destination: ItemHolder;
    }
    
    export interface ItemTransformed extends Effect {        
        before: Array<InventoryItem>;
        after: Array<InventoryItem>;
    }
    
    export interface Event {
        cell: MapCell;
        initiator: Entity;
        target?: Entity;
        medium?: Medium;
        effects: Array<Effect>;
        getLogString(): string;
    }
    
    /* Example events
    Chop wood: Human initiator, Tree target, effect: ItemCreated with Wood item
    Drop wood: Human initiator, Cell target, effect: ItemMoved with Actor source, Cell destination
    Gather flint: Human initiator, Rocks target, effect: ItemCreate with Flint item
    Light fire: Human initiator, Cell (with Wood inventory) target, Flint medium, effect: DoodadCreated (?)
    Campfire burns actor: Doodad initiator, Cell target, Fire medium, effect: Damage with Actor victim
    Gather stone: Human initiator, Rocks target, effect: ItemCreate with Stone item
    Throw stone at bird: Human initiator, Bird target, Stone medium,
        effect: Damage with Bird victim, EntityDestroyed with Bird entity, ItemCreated with Raw Bird Meat item
    Drop raw bird meat: Human initiator, Cell (with Campfire) target, effect: ItemMoved
    Campfire roasts bird: Campfire initiator, Cell target, Fire medium,
        effect: ItemTransformed with Raw Bird Meat before and Roast Bird Meat after 
    */
}