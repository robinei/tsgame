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
    
    export class Agent {
        // motionSpeed is added to motionPoints every turn. 1 is max motionSpeed and allows the agent to move each turn
        motionSpeed: number = 1;
        motionPoints: number = 0;
        
        cell: MapCell = null;
        currentBehavior: Behavior = null;
        
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
