namespace Game {
    export class KillBehavior extends Behavior {
        target: Agent = null;
        moveAction: MoveToPointAction = null;
                
        toString(): string {
            return super.toString() + (this.target? "(Target: " + this.target.displayName + ")" : "")
        }
        
        calcUrgency(): number {
            return 1;
        }

        update() {
            this.moveAction = new MoveToPointAction(this.agent, Distance.Adjacent);
            if(!this.pickTarget()) {
                return;
            }
            this.moveAction.setTarget(this.target.getPosition());
            if (!this.moveAction.step()) {
                this.target.skin = new WonkeySkin();
                this.target.behaviors = [new KillBehavior(this.target)];
                this.target = null;
            }
        }
        
        pickTarget(): boolean {
            if(agents.length <= 1) {
                return false;
            }
            
            while(this.target == null || this.target === this.agent) {
                var index = Math.floor(Math.random()*agents.length);
                this.target = agents[index];
            }
            return true;
        }
    }
}
