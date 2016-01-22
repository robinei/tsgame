namespace Game {
    export class ExploreBehavior extends Behavior {
        targetCell: MapCell = null;
        
        calcUrgency(): number {
            var self = this;
            self.targetCell = null;
            self.agent.cell.forNeighboursUnbiased(10, function(cell: MapCell) {
                if (cell.seen) {
                    return true;
                }
                self.targetCell = cell;
                self.agent.attributes.curiosity.increase(0.2);
                return false;
            });
            if (self.targetCell === null) {
                self.agent.attributes.curiosity.decrease(5);
                return 0;
            }
            return self.agent.attributes.curiosity.getValue() + (self.agent.currentBehavior===self ? 0.5 : 0);
        }

        update() {
            if (!this.agent.cell || !this.agent.canMoveNow() || !this.targetCell) {
                return;
            }
            
            var moveAction = new MoveToPointAction(this.agent);
            moveAction.setTarget(this.targetCell.getPosition());
            moveAction.step();
        }
    }
}
