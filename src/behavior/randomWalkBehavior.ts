namespace Game {
    
    /**
     * This behavior currently promises to reduce need for comfort.
     */
    export class RandomWalkBehavior extends ActionBehavior {
        
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
                        return r.attribute.displayName == "Comfort"
                            && r.amount < 0;
                    } 
                    return false;
                });
        }
        
        reconfigure() {
            // Behavior is the same no matter what the requirements are
        }
        
        pickNewAction() {
            var nearbyEnterableCells = new Array<MapCell>();
            this.entity.cell.forNeighbours(Distance.Medium, function(cell: MapCell) {
                if (cell.canBeEntered()) {
                    nearbyEnterableCells.push(cell);
                }
                return true;
            });
            if (nearbyEnterableCells.length == 0) {
                return;
            }
            var index = Math.floor(Math.random() * nearbyEnterableCells.length);
            var agent = <Agent> this.entity;
            var action = new MoveToPointAction(agent, Distance.Zero);
            action.setTarget(nearbyEnterableCells[index].getPosition());
            action.displayName = "went for a walk";
            var self = this;
            action.onReachedTarget = (action: Action) => {
                var entity = action.entity;
                var change = entity.attributes.comfort.update(-5);
                var outcomes = [new StatChanged(entity.attributes.comfort, change)];
                eventManager.addEvent(new Event(action, entity.cell, entity, outcomes));
                return outcomes;
            };
            this.setAction(action);
        }
    }
}