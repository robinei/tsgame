namespace Game {

    /**
     * Used to prioritze behaviors.
     * Urgency ranges:
     * 0-1 self realization and non-urgent basic needs
     * 1-2 pressing basic needs
     * 2+  life threatening
     */    
    interface Candidate {
        behavior: Behavior;
        urgency: number;
    }
    
    const STICKY_URGENCY_BONUS = 0.8;
    
    export class BehaviorSelector {
        behaviors: Array<Behavior>;
        currentBehavior: Behavior;
        
        constructor(public entity: Entity) {
            this.behaviors = [
                new RandomWalkBehavior(entity),
                new FollowWalkBehavior(entity),
            ];
        }
        
        reducedNeedOutcome(need: Attribute): StatChanged {
            return new StatChanged(need, -need.getValue());
        }
        
        getSortedNeeds(maxCount: number): Array<StatChanged> {
            var attrComp = this.entity.attributes;
            var needs = [
                attrComp.community,
                attrComp.comfort,
                attrComp.nutrition,
            ];
            var outcomes = needs.map((need) => this.reducedNeedOutcome(need));
            outcomes.sort((a: StatChanged, b: StatChanged) => {
                return a.amount - b.amount;
            });
            if (outcomes.length > maxCount) {
                outcomes = outcomes.slice(0, maxCount);
            }
            return outcomes;
        }
        
        calcUrgency(b: Behavior, outcomes: Array<Outcome>): number {
            if (outcomes.length == 0) {
                return 0;
            }
            var totalNeedChange = outcomes.map((o) => {
                if (o instanceof StatChanged) {
                    if (o.attribute instanceof Need) {
                        return o.amount;
                    }
                }
            }).reduce((prev, current) => prev + current);
            return Math.max(0, -totalNeedChange
                + (b === this.currentBehavior ? STICKY_URGENCY_BONUS : 0));
        }
        
        pickCandidate(candidates: Array<Candidate>): Behavior {
            if (candidates.length == 0) {
                return null;
            }
            var sum = candidates.map((c) => c.urgency).reduce((prev, current) => prev + current);
            var value = Math.random() * sum;
            return candidates.reduce(function(prev, current) {
                if (prev.urgency > value) {
                    return prev;  // Selected behavior
                } else {
                    value -= prev.urgency;
                    return current;  // Candidate behavior
                }
            }).behavior;
        }
        
        getBestBehavior(requirements: Array<Outcome>): Behavior {
            var candidates = this.behaviors.map((b) => <any>{
                behavior: b,
                urgency: this.calcUrgency(b, b.predict(requirements))
            });
            var max = Math.max.apply(Math, candidates.map((c) => c.urgency));
            var threshold = Math.floor(max);
            candidates = arrayWhere(candidates, (c) => { return c.urgency >= threshold; });
            return this.pickCandidate(candidates);
        }
        
        chooseBehavior(): Behavior {
            var requirements = this.getSortedNeeds(3);
            this.currentBehavior = this.getBestBehavior(requirements);
            if (this.currentBehavior) {
                this.currentBehavior.setRequirements(requirements);
            }
            return this.currentBehavior;
        }  
        
              
    }
}