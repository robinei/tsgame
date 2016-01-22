namespace Game {
    export class Action {
        // return true as long as we want to continue to be run
        step() : boolean {
            return true;
        }
    }
    
    export class Behavior {
        calcUrgency(): number { return 1 }
        update() {}
        reset() {}
        toString() : string { return getObjectName(this); }
        
        constructor(public agent: Agent) {
            this.agent = agent;
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

    export class Agent implements Entity {
        // motionSpeed is added to motionPoints every turn. 1 is max motionSpeed and allows the agent to move each turn
        motionSpeed: number = 1;
        motionPoints: number = 1;
        baseSightRange: number = 5;
        direction: Direction = Direction.North;
        carryCapacity: number = 20;

        inventory = new Array<InventoryItem>();

        cell: MapCell = null;
        currentBehavior: Behavior = null;
        behaviors: Array<Behavior> = [];
        urgencyThreshold: number = 10;
        
        attributes:AttributeComponent = new AttributeComponent();
        social:number = 0;
        restless:number = 0;
        stressed:number = 0;
        observant:number = 0;
        
        name: string = "";
        skin: Skin = new RegularGuy()
        
        constructor(cell: MapCell) {                        
            this.attributes.setAttributes(0.5, 0.5, 0.5, 0.5, 0.5, 0.5);
            this.attributes.setSkills(0.5, 0.5, 0.5);
            this.attributes.setHealth();
            this.attributes.setNeeds();
            
            this.motionSpeed = Math.random() * 0.5 + this.attributes.dexterity.getValue() * 0.3 + 0.2;
            
            this.behaviors = [
                new ExploreBehavior(this),
                new RandomWalkBehavior(this),
                new FollowWalkBehavior(this),
                new HarvestBehavior(this),
                new MakeCampfireBehavior(this),
                new DeliverBehavior(this)
            ];
            
            this.name = getRandomName();
            this.moveTo(cell);
            this.chooseBehavior();
            
        }
        
        getImageSource() : string {
            return this.skin.imageSource(this.direction)
        }

        getSightRange() : number {
            return this.baseSightRange;
        }
        
        setBehavior(behavior: Behavior) {
            if (this.currentBehavior !== behavior) {
                this.currentBehavior && this.currentBehavior.reset();
                this.currentBehavior = behavior;
            }
        }
        
        chooseBehavior() {
            var candidates = this.behaviors.map(
                (b) => <any>{
                    behavior: b,
                    urgency: b.calcUrgency()
                });
            var max = Math.max.apply(Math, candidates.map((c) => c.urgency));
            this.urgencyThreshold += (max * 0.80 - this.urgencyThreshold) * 0.10
            if (this.currentBehavior) {
                var currentBehaviorUrgency = candidates[this.behaviors.indexOf(this.currentBehavior)].urgency;
                var treshold = this.urgencyThreshold;
                if (currentBehaviorUrgency >= treshold) {
                    candidates = candidates.filter((c) => c.urgency >= treshold);
                }
            }

            var sum = candidates.map((c) => c.urgency).reduce((prev, current) => prev + current);
            var value = Math.random() * sum;
            this.setBehavior(
                candidates.reduce(function(prev, current) {
                    if (prev.urgency > value) {
                        return prev;  // Selected behavior
                    } else {
                        value -= prev.urgency;
                        return current;  // Candidate behavior
                    }
                }).behavior);
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

        canMoveNow(): boolean {
            return this.motionPoints >= 1;
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
            
            // don't reduce motionPoints to 0 when moving, but allow it to retain some until next turn
            // so that the motion will in average reflect the actual motionSpeed over time
            this.motionPoints -= 1;
            if (this.motionPoints < 0) {
                this.motionPoints = 0;
            }
            
            // see all cells around the new position
            cell.forNeighbours(this.getSightRange(), function(cell: MapCell) {
                cell.seen = true;
                return true;
            });
        }
        
        update() {
            this.motionPoints += this.motionSpeed * this.calcStaminaRegain();
            
            this.evaluateNeeds();
            this.chooseBehavior();
            
            if (this.currentBehavior) {
                this.currentBehavior.update();
            }
            
            if (this.motionPoints > 1) {
                this.motionPoints = 1;
            }
        }
        
        evaluateNeeds(){    
            this.social++;
            this.attributes.community.increase(2);
            this.attributes.nutrition.increase(2);
            this.attributes.comfort.increase(1);
            if(this.anyPeople(this.cell, Distance.Close)) {
                this.social = Math.max(0, this.social - 3);
                this.attributes.community.decrease(4);
            }
            if(this.anyPeople(this.cell, Distance.Adjacent)) {
                this.stressed += 1;
                this.attributes.comfort.increase(1);
            }
        }
        
        anyPeople(cell: MapCell, range: Distance):boolean {
            var foundPerson = false;
            cell.forNeighbours(range,
                ((self: Agent)=>
                    (cell: MapCell) => {
                        if(cell.agent && cell.agent != self) {
                            foundPerson = true;
                            return false;
                        }
                        return true;
                    })
                (this));
            return foundPerson;
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
