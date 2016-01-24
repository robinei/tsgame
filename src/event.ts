namespace Game {
    
    
    /**
     * Events are returned by behaviors when
     * something interesting happens. The event
     * contains the rules of the world, and will
     * evaluate the outcomes of the event.
     * Recent events with outcomes are recorded in
     * an event log.
     */
    export class EventManager {
        events: Array<Event> = [];

        evaluate(event: Event) {
            if (!event) {
                return;
            }
            // These evaluations are at the momement mostly serving as examples,
            // rather than being realistic.  
            if (event.action instanceof MoveToPointAction) {
                var entity = event.initiator;
                if (event.target instanceof Agent) {
                    // Reduce community need if the intiator claims
                    // to have moved toward an agent target.
                    event.outcomes = this.statUpdateOutcome(
                        entity.attributes.community, -10);
                } else {
                    event.outcomes = this.statUpdateOutcome(
                        entity.attributes.comfort, -5);
                }
                this.addEvent(event);
            }
        }
        
        private statUpdateOutcome(attr: Attribute, n: number) {
            var valueDiff = attr.update(n);
            return [new StatChanged(attr, valueDiff)];
        }
        
        private addEvent(event: Event) {
            console.log(event.getLogString());
            this.events.push(event);
        }
    }
    
    /**
     * Returns true if the two arrays are equal when considered
     * as requirements for a behavior. This may for example allow
     * for StatChanged instances to be considered equal if
     * the sign of the change amount is equal.
     */
    export function RequirementsEquals(a: Array<Outcome>, b: Array<Outcome>): boolean {
        // TODO(audun) not quite happy with this way of comparing requirements
        if (toBoolean(a) != toBoolean(b)) {
            return false;
        }
        if (a.length != b.length) {
            return false;
        }
        for (var i = 0; i < a.length; ++i) {
            for (var j = 0; j < b.length; ++j) {
                if (a[i].reqEquals(b[i])) {
                    continue;
                }
            }
            return false;
        }
        return true;
    }
    
    /**
     * medium: an intervening agency, means, or instrument 
     * by which something is conveyed or accomplished
     */
    export interface Medium {
        displayName: string;
    }
    
    export interface ItemHolder {
        displayName: string;
        inventory: Array<InventoryItem>;
    }
    
    export abstract class Outcome {
        abstract getLogString(): string;
        abstract reqEquals(other: Outcome);
    }
    
    export class ItemAquired extends Outcome {
        itemHolder: ItemHolder;
        item: InventoryItem;
        getLogString(): string {
            return this.itemHolder.displayName + " received " + this.item;
        }
        reqEquals(other: Outcome) {
            if (other instanceof ItemAquired) {
                return this.itemHolder === other.itemHolder
                    && this.item.type === other.item.type;
            }
            return false;
        }
    }
    
    export class ItemLost extends Outcome {
        itemHolder: ItemHolder;
        item: InventoryItem;
        getLogString(): string {
            return this.itemHolder.displayName + " lost " + this.item;
        }
        reqEquals(other: Outcome) {
            if (other instanceof ItemLost) {
                return this.itemHolder === other.itemHolder
                    && this.item.type === other.item.type;
            }
            return false;
        }
    }
    
    export class StatChanged extends Outcome {
        constructor(public attribute: Attribute, public amount: number) {
            super();
            this.attribute = attribute;
            this.amount = amount;
        }
        getLogString(): string {
            var changeStatement = this.amount < 0 ? "reduced by" : "increased by"
            return getPossessive(this.attribute.attributes.entity.displayName)
                + " " + this.attribute.getLogName() + " " + changeStatement
                + " " + Math.abs(this.amount).toPrecision(2) + ".";
        }
        reqEquals(other: Outcome) {
            if (other instanceof StatChanged) {
                return this.attribute === other.attribute
                    && sign(this.amount) == sign(other.amount);
            }
            return false;
        }
    }
    
    /*
    export class EntityDestroyed extends Outcome {
        entity: Entity;
    }
    
    export class ItemMoved extends Outcome {
        item: InventoryItem;
        source: ItemHolder;
        destination: ItemHolder;
    }
    
    export class ItemTransformed extends Outcome {        
        before: Array<InventoryItem>;
        after: Array<InventoryItem>;
    }
    */
    
    export class Event {
        outcomes: Array<Outcome>;
        
        constructor(
            public action: Action,
            public cell: MapCell,
            public initiator: Entity,
            public target?: Entity,
            public medium?: Medium)
         {}
         
         getLogString(): string {
             var str = this.initiator.displayName + " "
                + this.action.displayName;
             if (this.target) {
                 str += " " + this.target.displayName;
             }
             if (this.medium) {
                 str += " using " + this.medium.displayName;
             }
             str += ".";
             var outcomeCount = this.outcomes ? this.outcomes.length : 0;
             for (var i = 0; i < outcomeCount; ++i) {
                 str += " " + this.outcomes[i].getLogString();
             }
             return str;
         }
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