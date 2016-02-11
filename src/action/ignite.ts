namespace Game {
    
    export class IgniteAction extends Action {
        
        constructor(entity: Entity, public target: Entity) {
            super(entity);
            this.displayName = "ignited";
        }
    }    
}