namespace Game {
    
    export class Requirement {
        
    }
    
    
    export class BehaviorSelector {
        entity: Entity;

        tempBehavior: Behavior;
        
        constructor(entity: Entity) {
            this.entity = entity;
            this.tempBehavior = new RandomWalkBehavior(<Agent> entity);
        }
        
        chooseBehavior(): Behavior {
            /*
            var candidates = this.behaviors.map(
                (b) => <any>{
                    behavior: b,
                    urgency: b.calcUrgency() + (b === this.currentBehavior ? 0.5 : 0)
                });
            var max = Math.max.apply(Math, candidates.map((c) => c.urgency));
            this.urgencyThreshold += (max * 0.80 - this.urgencyThreshold) * 0.10
            if (this.currentBehavior && this.behaviors.indexOf(this.currentBehavior) !== -1) {
                var currentBehaviorUrgency = candidates[this.behaviors.indexOf(this.currentBehavior)].urgency;
                var treshold = this.urgencyThreshold;
                if (currentBehaviorUrgency >= treshold) {
                    candidates = candidates.filter((c) => c.urgency >= treshold);
                }
            }

            var sum = candidates.map((c) => c.urgency).reduce((prev, current) => prev + current);
            var value = Math.random() * sum;
            this.setBehavior(
                candidates.reduce(function(prev, current) {
                    if (prev.urgency > value) {
                        return prev;  // Selected behavior
                    } else {
                        value -= prev.urgency;
                        return current;  // Candidate behavior
                    }
                }).behavior);
                */
            return this.tempBehavior;
        }        
        
        getBehaviorsForOutcome(outcome: Outcome) {
            
        }
    }
}