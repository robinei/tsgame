namespace Game {
    
    export class RandomWalkBehavior extends Behavior {
        calcUrgency(): number {
            return this.agent.attributes.comfort.getValue() + (this.agent.currentBehavior===this ? 0.5 : 0);
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
            this.agent.attributes.enthusiasm.decrease(1);
        }
    }
}