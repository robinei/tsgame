namespace Game {
    
    export class RandomWalkBehavior extends Behavior {
        calcUrgency(): number {
            return this.agent.attributes.comfort.getValue();
        }
        
        update() {
            if (!this.agent.cell) {
                return;
            }
            this.agent.attributes.comfort.update(-10);
            
            for (var tries = 0; tries < 10; ++tries) {
                var direction = Math.floor(Math.random() * 8);
                var cell = this.agent.cell.getNeighbour(direction);
                if (cell && cell.canBeEntered()) {
                    this.agent.moveTo(cell);
                    break;
                }
            }
        }
    }
}