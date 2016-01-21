namespace Game {
    export class Behavior {
        urgency(agent: Agent):number {return 1};
        
        update(agent: Agent) {}
    }
    
    export class RandomWalkBehavior extends Behavior {
        
        urgency(agent: Agent):number {
            return agent.stressed;
        }
        
        update(agent: Agent) {
            if (!agent.cell) {
                return;
            }
            if (!agent.canMoveNow()) {
                return;
            }
            for (var tries = 0; tries < 10; ++tries) {
                var direction = Math.floor(Math.random() * 8);
                var cell = agent.cell.getNeighbour(direction);
                if (cell && cell.canBeEntered()) {
                    agent.moveTo(cell);
                    break;
                }
            }
            agent.restless++;
            agent.stressed = Math.max(0, agent.stressed-2);
        }
    }
    
    export class FollowWalkBehavior extends Behavior {
        target: Agent = null;
        path: Array<Point> = null;
        pathIndex: number = 1;
        
        urgency(agent: Agent):number {
            return agent.social;
        }
        
        update(agent: Agent) {
            if (!agent.cell || !agent.canMoveNow()) {
                return;
            }
            this.pickTarget(agent);
            
            var cell = this.findPath(agent.getPosition(), 0);
            if(cell) {
                agent.moveTo(cell);
                this.pathIndex++;
            }
            
            if(agent.getPosition().distanceTo(this.target.getPosition()) <= Distance.Close) {
                this.reset();
            }
        }
        
        pickTarget(agent: Agent) {
            while(this.target == null || this.target === agent) {
                var index = Math.floor(Math.random()*agents.length);
                this.target = agents[index];
            }
        }
        
        findPath(point: Point, attempts: number):MapCell {
            if(this.path == null || this.pathIndex > Distance.Close) {
                this.path = map.calcPath(point, this.target.getPosition(), false);
                this.pathIndex = 1;
            }
            
            var cell = map.getCellForPoint(this.path[this.pathIndex])
            if(!(cell && cell.canBeEntered()) && attempts < 5) {
                cell = null;
                this.findPath(point, attempts+1);
            }
            return cell;
        }
        
        reset() {
            this.target = null;
            this.path = null;
            this.pathIndex = 0;
        }
    }
    
    export class ChopWoodBehavior extends Behavior {
        path: Array<Point>;
        tree: MapCell;
        currentStep = 1;

        reset(){
            this.path = null
            this.tree = null
            this.currentStep = 0
        }

        findPathToTree(agent: Agent){
            this.tree = this.findClosestTree(agent)

             if (this.tree == null){
                 this.walkRandomly(agent)
                 return false
             }

            this.path = map.calcPath(agent.cell.getPosition(), this.tree.getPosition(), false)

            return true
        }

        findClosestTree(agent: Agent){
            var tree
            agent.cell.forNeighbours(30, function(cell: MapCell) {
                if (cell != null && cell.woodValue > 0){
                    tree = cell
                    return false
                }
                return true
             });

             return tree
        }

        urgency(agent: Agent):number {
            return agent.restless;
        }
        
        update(agent: Agent) {
            if (!agent.cell) {
                return;
            }

            if (!agent.canMoveNow()) {
                return;
            }

            if (this.path == null){
                if (!this.findPathToTree(agent))
                    return;
            }

            if (this.currentStep < this.path.length){
                var point = this.path[this.currentStep++]
                agent.moveTo(map.getCell(point.x, point.y))
            } else if (this.tree.woodValue > 0) {
                this.tree.woodValue--;
            } else {
                this.reset()
            }
            agent.restless  = Math.max(0, agent.restless-1);
        }

        walkRandomly(agent: Agent){
            for (var tries = 0; tries < 10; ++tries) {
                var direction = Math.floor(Math.random() * 8);
                var cell = agent.cell.getNeighbour(direction);
                if (cell && cell.canBeEntered()) {
                    agent.moveTo(cell);
                    break;
                }
            }
        }
    }
    

    export class Agent {
        // motionSpeed is added to motionPoints every turn. 1 is max motionSpeed and allows the agent to move each turn
        motionSpeed: number = 1;
        motionPoints: number = 0;
        
        cell: MapCell = null;
        currentBehavior: Behavior = null;
        behaviors: Array<Behavior> = [];
        
        social:number = 0;
        restless:number = 0;
        stressed:number = 0;
        
        
        constructor(cell: MapCell){
            this.motionSpeed = Math.random() * 0.8 + 0.2;
            this.behaviors = [new RandomWalkBehavior(), new FollowWalkBehavior(), new ChopWoodBehavior()];
            this.moveTo(cell);
            this.chooseBehavior();
        }
        
        chooseBehavior() {
            var sum = 0;
            
            for (var i=0; i<this.behaviors.length; i++) {
                sum += this.behaviors[i].urgency(this);
            }
            
            var weights = this.behaviors.map(
                function(behavior):number {
                    return behavior.urgency(this) / sum;
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
            return this.motionPoints >= 1;
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
            this.motionPoints -= 1;
            if (this.motionPoints < 0) {
                this.motionPoints = 0;
            }
            cell.forNeighbours(rangeSight, function(cell: MapCell) {
                cell.seen = true;
                return true;
            });
        }
        
        update() {
            this.motionPoints += this.motionSpeed;
            
            this.evaluateNeeds();
            this.chooseBehavior();
            
            if (this.currentBehavior) {
                this.currentBehavior.update(this);
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
    }
}
