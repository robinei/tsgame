namespace Game {
    export interface Behavior {
        update(agent: Agent);
    }
    
    export class RandomWalkBehavior implements Behavior {
        update(agent: Agent) {
            if (!agent.cell) {
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
        }
        
        update() {
            if (this.currentBehavior) {
                this.currentBehavior.update(this);
            }
        }
    }
}
