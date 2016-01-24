namespace Game {
    export class MoveToPointAction extends Action {
        agent: Agent;
        wantedDistance: Distance;
        
        target: Point = null;
        path: Array<Point> = null;
        pathIndex: number = 1;
        
        onReachedTarget: (action: Action) => Array<Outcome>;
        
        constructor(agent: Agent, wantedDistance?: Distance) {
            super(agent);
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
        
        step(): Array<Outcome> {
            if (this.isDone()) {
                return [];
            }
            var cell = this.getNextCell();
            if (cell) {
                if (!cell.canBeEntered()) {
                    // TODO(robin): choose alternative path
                    return [];
                }
                this.agent.moveTo(cell);
            }
            if (this.isDone() && this.onReachedTarget) {
                return this.onReachedTarget(this);
            }
            return [];
        }
        
        getNextCell(): MapCell {
            var from = this.agent.getPosition();
            var path = map.calcPath(from, this.target, false);
            var cell = null;
            if (path && path.length > 1) {
                cell = map.getCellForPoint(path[1]);
            }
            if (!cell.canBeEntered()) {
                var path = map.calcPath(from, this.target, true);
                if (path && path.length > 1) {
                    cell = map.getCellForPoint(path[1]);
                }
            }
            return cell;
            
            /*if (this.path == null || this.pathIndex > 4) {
                var from = this.agent.getPosition();
                this.path = map.calcPath(from, this.target, false);
                this.pathIndex = 1;
            }
            if (this.path == null || this.pathIndex >= this.path.length) {
                return null;
            }
            return map.getCellForPoint(this.path[this.pathIndex++])*/
        }
    }
}
