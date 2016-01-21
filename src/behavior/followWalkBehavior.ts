namespace Game {
    export class FollowWalkBehavior extends Behavior {
        target: Agent = null;
        moveAction: MoveToPointAction = null;
        
        urgency(): number {
            return this.agent.social * (this.agent.currentBehavior===this ? 2 : 1);
        }
        
        update() {
            if (!this.agent.cell || !this.agent.canMoveNow()) {
                return;
            }
            if (!this.moveAction) {
                this.moveAction = new MoveToPointAction(this.agent);
            }
            this.pickTarget();
            this.doMove();
            this.agent.restless++;
        }
        
        pickTarget() {
            while(this.target == null || this.target === this.agent) {
                var index = Math.floor(Math.random()*agents.length);
                this.target = agents[index];
                this.moveAction.setTarget(this.target.getPosition());
            }
        }
        
        doMove() {
            if (!this.moveAction.step()) {
                this.reset();
            }
        }
        
        reset() {
            this.target = null;
            this.moveAction.setTarget(null);
        }
    }
}