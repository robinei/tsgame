namespace Game {
    /**
     * This behavior promises to reduce need for community.
     */
    export class FollowWalkBehavior extends ActionBehavior {
        target: Agent = null;
        
        toString(): string {
            return super.toString() + (this.target? "(Target: " + this.target.displayName + ")" : "")
        }
        
        predict(requirements: Array<Outcome>): Array<Outcome> {
            return arrayWhere(requirements,
                (r: Outcome) => {
                    if (r instanceof StatChanged) {
                        // TODO(audun) Our goal here is to check if the required outcome
                        // is a decrease in the comfort need for our own entity. 
                        // For now we check the display name of the attribute, which is
                        // not a robust check. We also skip checking which entity the
                        // attribute belongs to, since for now, we are only concerned with
                        // our own needs. This may however change. 
                        return r.attribute.displayName == "Community"
                            && r.amount < 0;
                    } 
                    return false;
                });
        }
        
        reconfigure() {
            // Behavior is the same no matter what the requirements are
        }
        
        pickNewAction() {
            if(agents.length <= 1) {
                return false;
            }

            this.target = null;
            while(this.target == null || this.target === this.entity) {
                var index = Math.floor(Math.random()*agents.length);
                this.target = agents[index];
            }
            var action = new MoveToPointAction(<Agent> this.entity);
            action.setTarget(this.target.getPosition());
            action.displayName = "followed";
            var self = this;
            action.onReachedTarget = (action: Action) => {
                var entity = action.entity;
                return new Event(action, entity.cell, entity, self.target);
            };
            this.setAction(action);
        }
    }
    
}