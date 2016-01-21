namespace Game {
    export class FollowWalkBehavior extends Behavior {
        target: Agent = null;
        moveAction: MoveToPointAction = null;
        
        urgency(): number {
            return this.agent.social;
        }
        
        update() {
            if (!this.agent.cell || !this.agent.canMoveNow()) {
                return;
            }
            this.pickTarget();
            this.doMove();
        }
        
        pickTarget() {
            while(this.target == null || this.target === this.agent) {
                var index = Math.floor(Math.random()*agents.length);
                this.target = agents[index];
            }
        }
        
        doMove() {
            if (!this.moveAction) {
                this.moveAction = new MoveToPointAction(this.agent, this.target.getPosition());
            }
            if (!this.moveAction.step()) {
                this.reset();
            }
        }
        
        reset() {
            this.target = null;
            this.moveAction = null;
        }
    }
}