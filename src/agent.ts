namespace Game {
    export class Action {
        // return true as long as we want to continue to be run
        step() : boolean {
            return true;
        }
    }
    
    export class Behavior {
        agent: Agent;
        calcUrgency(): number { return 1 }
        update() {}
        reset() {}
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
        
        social:number = 0;
        restless:number = 0;
        stressed:number = 0;
        observant:number = 0;
        
        name: string = "";
        
        constructor(cell: MapCell) {
            this.motionSpeed = Math.random() * 0.8 + 0.2;
            this.behaviors = [
                new ExploreBehavior(),
                new RandomWalkBehavior(),
                new FollowWalkBehavior(),
                new ChopWoodBehavior(),
                new MakeCampfireBehavior()
            ];
            for (var i = 0; i < this.behaviors.length; ++i) {
                this.behaviors[i].agent = this;
            }
            this.moveTo(cell);
            this.chooseBehavior();
            this.name = getRandomName();
        }
        
        getSightRange() : number {
            return this.baseSightRange;
        }
        
        chooseBehavior() {
            var sum = 0;
            
            var urgencies = [];
            for (var i=0; i < this.behaviors.length; i++) {
                var urgency = this.behaviors[i].calcUrgency();
                urgencies.push(urgency);
                sum += urgency;
            }
            var value = Math.random();
            var index = -1;
            while(value >= 0 && index < this.behaviors.length){
                index++;
                value -= urgencies[index] / sum;
            }
            if (this.currentBehavior && this.currentBehavior !== this.behaviors[index]) {
                this.currentBehavior.reset();
            }
            this.currentBehavior = this.behaviors[index];
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
            if(this.anyPeople(this.cell, Distance.Close)) {
                this.social = Math.max(0, this.social - 3);
            }
            if(this.anyPeople(this.cell, Distance.Adjacent)) {
                this.stressed += 1;
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
