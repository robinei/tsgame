namespace Game {
    export var LOGTAG_BEHAVIOR: string = "Behavior";

    /**
     * A behavior is a mode of operation for an entity.
     * For a human this can be hunt, eat, sleep, build house, etc.
     * For a bush this can be grow or burn.
     */    
    export interface Behavior {
        entity: Entity;

        /**
         * Returns a list of important outcomes that can be expected
         * if this behaviour is activated with a goal of
         * accomplishing the given set of requirements.
         * Returns an empty list if the behavior does
         * not lead to any of the requirements.
         */
        predict(requirements: Array<Outcome>): Array<Outcome>;
        
        /**
         * Unlike predict, which is hypothetical, this sets 
         * requirements to use for upcoming calls to update.
         * May be called at any time and with the same
         * requirements as previously.
         */
        setRequirements(requirements: Array<Outcome>);
        
        /**
         * Is called when the behavior replaces
         * another for an entity. The behavior
         * may be deactived before any outcomes have happened.
         */
        onActivate(): void;
        
        /**
         * Is called when the behavior is replaced
         * by another for an entity. The behavior
         * may be reactived again later.
         */
        onDeactivate(): void;
        
        /**
         * Engages in this behavior for one turn and
         * can return an event that needs to be evaluated
         * for outcome.
         */
        update(): Event;
    }
    
    
    /**
     * Class for behaviors that picks and uses actions.
     */
    export abstract class ActionBehavior implements Behavior {
        protected currentAction: Action;
        protected requirements: Array<Outcome>;
        
        constructor(public entity: Entity) {
            this.entity = entity;
        }
        
        abstract predict(requirements: Array<Outcome>): Array<Outcome>;
        
        /**
         * Override to reconfigure with new requirements
         */
        abstract reconfigure();
        
        /**
         * Override to pick a new action. Is called if there
         * is no current action or the current action is done.
         */
        abstract pickNewAction();

        
        getAction(): Action {
            return this.currentAction;
        }
        
        setAction(action: Action) {
            if (this.currentAction === action) {
                return;
            }
            if (this.currentAction) {
                this.currentAction.abort();
            }
            this.currentAction = action;
        }
        
        setRequirements(requirements: Array<Outcome>) {
            if (RequirementsEquals(requirements, this.requirements)) {
                return;
            }
            this.requirements = requirements;
            this.reconfigure();
        }
        
        onActivate() {
        }
        
        onDeactivate() {
            this.setAction(null);
        }
        
        update(): Event {
            if (!this.currentAction || this.currentAction.isDone()) {
                this.pickNewAction();
            }
            if (this.currentAction) {
                return this.currentAction.step()
            }
            return null;
        }
        
        toString() : string { return getObjectName(this); }
    }
    
    
}