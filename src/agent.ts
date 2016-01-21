namespace Game {
    export interface Behavior {
        update(agent: Agent);
    }
    
    export class RandomWalkBehavior implements Behavior {
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
        }
    }
    
    export class FollowWalkBehavior implements Behavior {
        target: Agent = null;
        path: Array<Point> = null;
        pathIndex: number = 1;
        update(agent: Agent) {
            if (!agent.cell || !agent.canMoveNow()) {
                return;
            }
            while(this.target == null || this.target === agent) {
                var index = Math.floor(Math.random()*agents.length);
                this.target = agents[index];
            }
            if(this.path == null || this.pathIndex > Distance.Close) {
                this.path = map.calcPath(agent.getPosition(), this.target.getPosition());
                this.pathIndex = 1;
            }
            var cell = map.getCellForPoint(this.path[this.pathIndex])
            if(cell && cell.canBeEntered()) {
                agent.moveTo(cell);
                this.pathIndex++;
            }
            if(agent.getPosition().distanceTo(this.target.getPosition()) <= Distance.Close) {
                this.reset();
            }
        }
        
        reset() {
            this.target = null;
            this.path = null;
            this.pathIndex = 0;
        }
    }
    
    export class ChopWoodBehavior implements Behavior {
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

            this.path = map.calcPath(agent.cell.getPosition(), this.tree.getPosition())

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
        behaviors: Array<Behavior> = null;
        priorities: Array<number> = null;
        
        constructor(cell: MapCell){
            this.motionSpeed = Math.random() * 0.8 + 0.2;
            this.behaviors = [new RandomWalkBehavior(), new FollowWalkBehavior()];
            this.priorities = [0.5, 0.5];
            
            this.moveTo(cell);
            this.chooseBehavior();
        }
        
        chooseBehavior() {
            var sum = this.priorities.reduce(function(previousValue, currentValue):number{return previousValue+currentValue});
            var weights = this.priorities.map(function(value):number{return value / sum});
            var value = Math.random();
            var index = 0;
            while(value >= 0 && index < weights.length){
                value -= weights[index];
                index++;
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
            if (this.currentBehavior) {
                this.currentBehavior.update(this);
            }
            if (this.motionPoints > 1) {
                this.motionPoints = 1;
            }
        }
        
        
    }
}
