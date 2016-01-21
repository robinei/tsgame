namespace Game {
    export class MoveToPointAction extends Action {
        agent: Agent;
        wantedDistance: Distance;
        
        target: Point = null;
        path: Array<Point> = null;
        pathIndex: number = 1;
        
        constructor(agent: Agent, wantedDistance?: Distance) {
            super();
            this.agent = agent;
            this.wantedDistance = valueOrDefault(wantedDistance, Distance.Close);
        }
        
        setTarget(target: Point) {
            if (target && target.equals(this.target)) {
                return;
            }
            this.target = target;
            this.path = null;
            this.pathIndex = 1;
        }
        
        isDone(): boolean {
            return !this.target || this.agent.getPosition().distanceTo(this.target) <= this.wantedDistance;
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
            if (this.path == null || this.pathIndex >= this.path.length) {
                return null;
            }
            return map.getCellForPoint(this.path[this.pathIndex])
        }
    }
}
