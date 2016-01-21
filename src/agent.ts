namespace Game {
    export class Action {
        // return true as long as we want to continue to be run
        step() : boolean {
            return true;
        }
    }
    
    export class Behavior {
        agent: Agent;
        urgency(): number { return 1 };
        update() {}
    }

    enum InventoryItemType {
        Material,
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
        type = InventoryItemType.Material
    }

    export class Agent {
        // motionSpeed is added to motionPoints every turn. 1 is max motionSpeed and allows the agent to move each turn
        motionSpeed: number = 1;
        motionPoints: number = 1;
        carryCapacity: number = 20;

        inventory = new Array<InventoryItem>();

        cell: MapCell = null;
        currentBehavior: Behavior = null;
        behaviors: Array<Behavior> = [];
        
        social:number = 0;
        restless:number = 0;
        stressed:number = 0;
        
        
        constructor(cell: MapCell){
            this.motionSpeed = Math.random() * 0.8 + 0.2;
            this.behaviors = [new RandomWalkBehavior(), new FollowWalkBehavior(), new ChopWoodBehavior()];
            for (var i = 0; i < this.behaviors.length; ++i) {
                this.behaviors[i].agent = this;
            }
            this.moveTo(cell);
            this.chooseBehavior();
        }
        
        chooseBehavior() {
            var sum = 0;
            
            for (var i=0; i<this.behaviors.length; i++) {
                sum += this.behaviors[i].urgency();
            }
            
            var weights = this.behaviors.map(
                function(behavior):number {
                    return behavior.urgency() / sum;
                });
            var value = Math.random();
            var index = -1;
            while(value >= 0 && index < weights.length){
                index++;
                value -= weights[index];
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
            if (this.motionPoints >= 1){
                this.motionPoints = 0
                return true
            }

            return false              
        }
        
        moveTo(cell: MapCell) {
            if (cell.agent) {
                if (cell.agent === this) {
                    return;
                }
                throw "cell already has agent";
            }
            this.removeFromMap();
            this.cell = cell;
            cell.agent = this;
            if (this.motionPoints < 0) {
                this.motionPoints = 0;
            }
            cell.forNeighbours(rangeSight, function(cell: MapCell) {
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
            this.social ++;                 
            this.social = Math.max(0, this.social - (this.countPeople(this.cell, Distance.Close)/2));
            this.stressed += this.countPeople(this.cell, Distance.Adjacent);
        }
        
        countPeople(cell: MapCell, range: Distance):number {
            var personCount = 0;
            cell.forNeighbours(range,
                (cell: MapCell) => {
                    if(cell.agent) {
                        personCount++;
                        return true;
                    }
                    return false;
                }) ;
            return personCount;
	}

        getTotalInventoryWeight()
        {
            var weight = 0
            this.inventory.forEach(element => {
                weight += element.weight
            });
            
            return weight
        }
        
        tryAddInventoryItem(item: InventoryItem){
            if ( this.getTotalInventoryWeight() + item.weight > this.carryCapacity){
                return false
            }
            
            this.inventory.push(item)
            return true
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
