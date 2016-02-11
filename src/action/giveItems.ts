namespace Game {
    
    export class GivenItemsAction extends Action {
        
        constructor(entity: Entity, public target: Entity) {
            super(entity);
            this.displayName = "placed";
        }
    }    
}