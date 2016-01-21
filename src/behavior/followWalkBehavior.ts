namespace Game {
    export class FollowWalkBehavior extends Behavior {
        target: Agent = null;
        path: Array<Point> = null;
        pathIndex: number = 1;
        
        urgency(agent: Agent):number {
            return agent.social;
        }
        
        update(agent: Agent) {
            if (!agent.cell || !agent.canMoveNow()) {
                return;
            }
            this.pickTarget(agent);
            
            var cell = this.findPath(agent.getPosition(), 0);
            if(cell) {
                agent.moveTo(cell);
                this.pathIndex++;
            }
            
            if(agent.getPosition().distanceTo(this.target.getPosition()) <= Distance.Close) {
                this.reset();
            }
        }
        
        pickTarget(agent: Agent) {
            while(this.target == null || this.target === agent) {
                var index = Math.floor(Math.random()*agents.length);
                this.target = agents[index];
            }
        }
        
        findPath(point: Point, attempts: number):MapCell {
            if(this.path == null || this.pathIndex > Distance.Close) {
                this.path = map.calcPath(point, this.target.getPosition(), false);
                this.pathIndex = 1;
            }
            
            var cell = map.getCellForPoint(this.path[this.pathIndex])
            if(!(cell && cell.canBeEntered()) && attempts < 5) {
                cell = null;
                this.findPath(point, attempts+1);
            }
            return cell;
        }
        
        reset() {
            this.target = null;
            this.path = null;
            this.pathIndex = 0;
        }
    }
}