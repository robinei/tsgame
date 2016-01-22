namespace Game {
    export class FollowWalkBehavior extends Behavior {
        target: Agent = null;
        moveAction: MoveToPointAction = null;
                
        toString(): string {
            return super.toString() + (this.target? "(Target: " + this.target.name + ")" : "")
        }

        calcUrgency(): number {
            if(agents.length <= 1){
                return 0;
            }
            return this.agent.attributes.community.getValue() + (this.agent.currentBehavior===this ? 0.5 : 0);
        }
        
        update() {
            if (!this.agent.cell || !this.agent.canMoveNow()) {
                return;
            }
            if (!this.moveAction) {
                this.moveAction = new MoveToPointAction(this.agent);
            }
            if(!this.pickTarget()) {
                return;
            }
            this.doMove();
            this.agent.attributes.enthusiasm.decrease(1);
            this.agent.attributes.comfort.increase(1);
        }
        
        pickTarget(): boolean {
            if(agents.length <= 1) {
                return false;
            }
            
            while(this.target == null || this.target === this.agent) {
                var index = Math.floor(Math.random()*agents.length);
                this.target = agents[index];
            }
            this.moveAction.setTarget(this.target.getPosition());
            return true;
        }
        
        doMove() {
            if (!this.moveAction.step()) {
                this.reset();
            }
        }
        
        reset() {
            this.target = null;
            if (this.moveAction !== null) {
                this.moveAction.setTarget(null);
            }
        }
    }
}