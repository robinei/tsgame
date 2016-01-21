namespace Game {
    export class ExploreBehavior extends Behavior {
        rangeExplore = 6;
        rangeInterest = 5;
        lastUnseen: MapCell = null;

        setUnseen() {
            var self = this;
            var dir: Direction = Direction.North;
            var curr = this.agent.cell.getPosition();
            this.agent.cell.forNeighbours(this.rangeExplore, function(cell: MapCell) {
                var dir = cell.getPosition().sub(curr).direction();
                if (dir === undefined) {
                    return true;
                }
                if (!cell.seen && self.agent.direction == dir) {
                    self.lastUnseen = cell;
                    return false;
                }
                return true;
            });
        }

        urgency():number {
            return this.agent.observant;
        }

        update() {
            if (!this.agent.cell) {
                return;
            }
            this.setUnseen();
        }
    }
}
