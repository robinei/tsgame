namespace Game {
    export function findResource(startCell: MapCell, targetResource: ResourceType, maxDistance: number) {
        var resourceCell = null;
        
        startCell.forNeighbours(maxDistance, function (cell: MapCell): boolean {
            if (cell.doodad === null) {
                return true;
            }
            var resource = <Resource> cell.doodad;
            if ( resource === null || resource.resourceType !== targetResource) {
                return true;
            }
            
            resourceCell = cell
            return false;
        });
        
        return resourceCell;
    }

    /*    
    export class HarvestBehavior extends Behavior {
        resource: MapCell;
        resourceCell: MapCell;
        targetResource = ResourceType.Wood
        movetoPoint: MoveToPointAction;

        reset(){
            this.movetoPoint = null;
            this.resourceCell = null
        }

        findPathToResource() {
            this.findClosestResource();

            if (this.resourceCell == null){
                this.walkRandomly()
                return false
            }
            
            this.movetoPoint = new MoveToPointAction(this.agent, 0)
            this.movetoPoint.setTarget(this.resourceCell.getPosition())

            return true
        }

        findClosestResource(){
            this.resourceCell = findResource(this.agent.cell, this.targetResource, 30);
        }

        calcUrgency(): number {
            if (this.agent.getTotalInventoryWeight() >= this.agent.carryCapacity){
                return 0
            }

            return this.agent.attributes.enthusiasm.getValue();
        }
        
        update() {
            if (this.agent.getTotalInventoryWeight() >= this.agent.carryCapacity) {
                return;
            }
            
            if (this.movetoPoint == null || this.movetoPoint.path == null) {
                if (!this.findPathToResource()){
                    return;
                }
            }

            if (!this.movetoPoint.isDone()) {
                this.movetoPoint.step()
            } else if (this.resourceCell.doodad instanceof Tree) {
                this.harvestResource();
            } else {
                this.agent.log(LOGTAG_BEHAVIOR, "Resource type wrong");
                this.reset();
            }
            this.agent.attributes.enthusiasm.update(3);
        }

        harvestResource(){
             if (this.agent.hasRoomForInventoryItem(new Wood() )){
                if (this.resourceCell.doodad.tryHarvest()){
                    this.agent.inventory.push(new Wood());
                } else {
                    this.reset();
                }
            } else {
                this.agent.log(LOGTAG_BEHAVIOR, "Inventory full...");
            }
        }

        walkRandomly(){
            this.agent.attributes.enthusiasm.update(1);
            for (var tries = 0; tries < 10; ++tries) {
                var direction = Math.floor(Math.random() * 8);
                var cell = this.agent.cell.getNeighbour(direction);
                if (cell && cell.canBeEntered()) {
                    this.agent.moveTo(cell);
                    break;
                }
            }
        }
    }
    */
}
