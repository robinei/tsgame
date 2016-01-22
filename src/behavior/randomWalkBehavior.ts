namespace Game {
    
    export class RandomWalkBehavior extends Behavior {
        calcUrgency(): number {
            return this.agent.stressed * (this.agent.currentBehavior===this ? 2 : 1);
        }
        
        update() {
            if (!this.agent.cell) {
                return;
            }
            if (!this.agent.canMoveNow()) {
                return;
            }
            for (var tries = 0; tries < 10; ++tries) {
                var direction = Math.floor(Math.random() * 8);
                var cell = this.agent.cell.getNeighbour(direction);
                if (cell && cell.canBeEntered()) {
                    this.agent.moveTo(cell);
                    break;
                }
            }
            this.agent.restless++;
            this.agent.stressed = Math.max(0, this.agent.stressed-2);
        }
    }
}