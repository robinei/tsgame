namespace Game {
    
    export class Entity {
        cell: MapCell = null;
        displayName: string = "nn";
        
        // components (simple entities can leave these as null)
        attributeComponent: AttributeComponent = null;
        behaviorSelector: BehaviorSelector = null;
        consoleLogger: ConsoleLogger = null;
        
        log(tag: string, message: string) {
            if (this.consoleLogger) {
                this.consoleLogger.log(tag, this.displayName + ": " + message);
            }
        }
    }
}