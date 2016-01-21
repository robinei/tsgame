namespace Game {
    export class FollowWalkBehavior extends Behavior {
        target: Agent = null;
        moveAction: MoveToPointAction = null;
                
        urgency(): number {
            if(agents.length <= 1){
                return 0;
            }
            return this.agent.social * (this.agent.currentBehavior===this ? 2 : 1);
        }
        
        update() {
            if (!this.agent.cell || !this.agent.canMoveNow()) {
                return;
            }
            if(!this.pickTarget()) {
                return;
            }
            this.doMove();
            this.agent.restless++;
        }
        
        pickTarget():boolean {
            if(agents.length <= 1) {
                return false;
            }
            
            while(this.target == null || this.target === this.agent) {
                var index = Math.floor(Math.random()*agents.length);
                this.target = agents[index];
            }
            return true;
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