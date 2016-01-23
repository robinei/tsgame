namespace Game {
    export var LOGTAG_BEHAVIOR: string = "Behavior";
    
    export class Behavior {
        update() {}
        onActivate() {}
        onDeactivate() {}
        
        // TODO remove these
        reset() {}
        calcUrgency(): number { return 0; }
        
        constructor(public agent: Agent) {
            this.agent = agent;
        }
        
        toString() : string { return getObjectName(this); }
    }
    
    export class Entity {
        cell: MapCell = null;
        displayName: string = "nn";
        private currentBehavior: Behavior = null;
        
        // components (simple entities can leave these as null)
        attributes: AttributeComponent = null;
        behaviorSelector: BehaviorSelector = null;
        consoleLogger: ConsoleLogger = null;
        
        log(tag: string, message: string) {
            if (this.consoleLogger) {
                this.consoleLogger.log(tag, this.displayName + ": " + message);
            }
        }
        
        getBehavior(): Behavior {
            return this.currentBehavior;
        }
        
        setBehavior(behavior: Behavior) {
            if (behavior === this.currentBehavior) {
                return;
            }
            if (this.currentBehavior) {
                this.currentBehavior.onDeactivate();
            }
            this.currentBehavior = behavior;
            this.currentBehavior.onActivate();
            this.log(LOGTAG_BEHAVIOR, "New behavior " + this.currentBehavior.toString());
        }
        
        update() {
            if (this.attributes) {
                this.attributes.update();
            }
            if (this.behaviorSelector) {
                this.setBehavior(this.behaviorSelector.chooseBehavior());
            }
            if (this.currentBehavior) {
                this.currentBehavior.update();
            }
        }
    }
}