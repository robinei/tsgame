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
                return false;
            });
            if (self.targetCell === null) {
                return 0;
            }
            return self.agent.observant * (self.agent.currentBehavior===self ? 2 : 1);
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
