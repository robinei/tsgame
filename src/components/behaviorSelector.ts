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
    
    const STICKY_URGENCY_BONUS: number = 0.7;
    const URGENCY_SIDE_EFFECT_FACTOR: number = 0.2;
    
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
        
        calcStatChangedUrgency(req: StatChanged, outcome: StatChanged) {
            if (req.attribute instanceof Need) {
                return Math.min(-req.amount, -outcome.amount);
            }
            return Math.min(req.amount, outcome.amount);
        }
        
        calcSingleUrgency(req: Outcome, outcomes: Array<Outcome>): number {
            return outcomes.map((o) => {
                if (req.reqEquals(o)) {
                    if (req instanceof StatChanged) {
                        return this.calcStatChangedUrgency(req, <StatChanged>o);
                    } else if (req instanceof ItemAquired) {
                        return 1;
                    }
                }
            }).reduce((prev, current) => prev + current);
        }
        
        calcUrgency(reqs: Array<Outcome>, b: Behavior, outcomes: Array<Outcome>): number {
            if (outcomes.length == 0) {
                return 0;
            }
            
            // First, sum up side effects
            var needSum = outcomes.map((o) => {
                if (o instanceof StatChanged) {
                    if (o.attribute instanceof Need) {
                        return -o.amount;
                    }
                }
            }).reduce((prev, current) => prev + current);

            // Now look for the required outcomes            
            var reqSum = outcomes.map((o) => this.calcSingleUrgency(o, outcomes))
                .reduce((prev, current) => prev + current) / outcomes.length;
                
            var sum = URGENCY_SIDE_EFFECT_FACTOR * needSum
                + (1 - URGENCY_SIDE_EFFECT_FACTOR) * reqSum
                + (b === this.currentBehavior ? STICKY_URGENCY_BONUS : 0);
                
            return Math.max(0, sum);
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
                urgency: this.calcUrgency(requirements, b, b.predict(requirements))
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