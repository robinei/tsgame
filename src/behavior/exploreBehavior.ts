namespace Game {
    export class ExploreBehavior extends Behavior {
        rangeSight = 5;
        rangeExplore = 6;
        rangeInterest = 5;
        lastUnseen: MapCell = null;

        see() {
            this.agent.cell.forNeighbours(this.rangeSight, function(cell: MapCell) {
                cell.seen = true;
                return true;
            });
        }

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
            this.see(); // side-effect
            return this.agent.observant;
        }

        update() {
            if (!this.agent.cell) {
                return;
            }
            this.see();
            this.setUnseen();
        }
    }
}
