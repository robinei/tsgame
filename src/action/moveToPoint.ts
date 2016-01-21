namespace Game {
    export class MoveToPointAction extends Action {
        agent: Agent;
        target: Point;
        path: Array<Point> = null;
        pathIndex: number = 1;
        wantedDistance: Distance;
        
        constructor(agent: Agent, target: Point, wantedDistance?: Distance) {
            super();
            this.wantedDistance = valueOrDefault(wantedDistance, Distance.Close);
            this.agent = agent;
            this.target = target;
        }
        
        isDone(): boolean {
            return this.agent.getPosition().distanceTo(this.target) <= this.wantedDistance;
        }
        
        step() {
            if (this.isDone()) {
                return false;
            }
            var cell = this.findPath(this.agent.getPosition());
            if(cell) {
                if (!cell.canBeEntered()) {
                    // TODO(robin): choose alternative path
                    return true;
                }
                this.agent.moveTo(cell);
                this.pathIndex++;
            }
            return !this.isDone();
        }
        
        findPath(point: Point): MapCell {
            if(this.path == null || this.pathIndex > Distance.Close) {
                this.path = map.calcPath(point, this.target, false);
                this.pathIndex = 1;
            }
            if (this.path == null) {
                return null;
            }
            return map.getCellForPoint(this.path[this.pathIndex])
        }
    }
}
