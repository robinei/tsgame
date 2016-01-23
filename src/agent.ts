namespace Game {
    export class Action {
        entity: Entity;
        
        constructor(entity: Entity) {
            this.entity = entity;
        }

                
        isDone(): boolean {
            return false;
        }
        // return true as long as we want to continue to be run
        step() : boolean {
            return true;
        }
        // callbacks
        abort() {
            
        }
    }
    
    export enum InventoryItemType {
        Wood,
        Food,
        Weapon,
        Tool
    }

    export interface InventoryItem {
        weight: number;
        type: InventoryItemType;
    }

    export class Wood implements InventoryItem{
        weight = 1
        type = InventoryItemType.Wood
    }

    export interface Skin {
        imageSource: (Direction) => string;
    }
    
    export class RegularGuy implements Skin {
        imageSource(direction: Direction) : string {
            switch (direction) {
                case Direction.North:
                case Direction.NorthEast:
                    return 'guy2b.png';
                case Direction.East:
                case Direction.SouthEast:
                    return 'guy2l.png';
                case Direction.South:
                case Direction.SouthWest:
                    return 'guy2f.png';
                case Direction.West:
                case Direction.NorthWest:
                    return 'guy2r.png';
            }
        }
    }
    
    export class WonkeySkin implements Skin {
        imageSource(direction: Direction) : string {
            return 'wonkey.png'
        }
    }

    export class Agent extends Entity {
        baseSightRange: number = 5;
        direction: Direction = Direction.North;
        carryCapacity: number = 20;
        
        inventory = new Array<InventoryItem>();

        behaviors: Array<Behavior> = [];
        urgencyThreshold: number = 10;
        
        skin: Skin = new RegularGuy()
        
        consoleLogger: ConsoleLogger = new ConsoleLogger(this);
        
        constructor(cell: MapCell) {
            super();
            this.attributes = new AttributeComponent(this);
            this.attributes.setAttributes(0.5, 0.5, 0.5, 0.5, 0.5, 0.5);
            this.attributes.setSkills(0.5, 0.5, 0.5);
            this.attributes.setHealth();
            this.attributes.setNeeds();
            
            this.behaviors = [
                new ExploreBehavior(this),
                new RandomWalkBehavior(this),
                new FollowWalkBehavior(this),
                new HarvestBehavior(this),
                new MakeCampfireBehavior(this),
                new DeliverBehavior(this),
                new BuildBehavior(this),
            ];
            this.behaviorSelector = new BehaviorSelector(this);
            
            this.displayName = getRandomName();
            this.moveTo(cell);
        }
        
        getImageSource() : string {
            return this.skin.imageSource(this.direction)
        }

        getSightRange() : number {
            return this.baseSightRange;
        }
                        
        getPosition(): Point {
            return this.cell.getPosition();
        }

        removeFromMap() {
            if (this.cell) {
                if (this.cell.agent !== this) {
                    throw "map consistency problem";
                }
                this.cell.agent = null;
                this.cell = null;
            }
        }

        moveTo(cell: MapCell) {
            if (cell.agent) {
                if (cell.agent === this) {
                    return;
                }
                throw "cell already has agent";
            }
            if (this.cell) {
                var dist = cell.getPosition().distanceTo(this.cell.getPosition());
                if (dist > 1.5) {
                    throw "moved more than one cell";
                }
                this.direction = cell.getPosition().sub(this.getPosition()).direction();
            }
            this.removeFromMap();
            this.cell = cell;
            cell.agent = this;
                        
            // see all cells around the new position
            cell.forNeighbours(this.getSightRange(), function(cell: MapCell) {
                cell.seen = true;
                return true;
            });
        }
                
        getTotalInventoryWeight()
        {
            var weight = 0
            this.inventory.forEach(element => {
                weight += element.weight
            });
            
            return weight
        }
        
        removeNextOfType(itemType: InventoryItemType): InventoryItem {
            var foundItem;
            
            for (var i = 0; i < this.inventory.length; ++i){
                if (this.inventory[i].type == itemType){
                    foundItem = this.inventory[i];
                    this.inventory.splice(i, 1);
                }
            }
            
            return foundItem;
        }
        
        tryAddInventoryItem(item: InventoryItem){
            if (!this.hasRoomForInventoryItem(item))
                return false
            
            this.inventory.push(item)
            return true
        }

        hasRoomForInventoryItem(item: InventoryItem){
            return ( this.getTotalInventoryWeight() + item.weight <= this.carryCapacity);
        }
            
        
        calcStaminaRegain(){
            var totalWeight = this.getTotalInventoryWeight()
            
            var factor = ( this.carryCapacity - totalWeight) / this.carryCapacity
            
            if (factor > 1)
                factor = 1
                
            if (factor < 0.15 )
                factor = 0.15
            
            return factor
        }
    }
}
