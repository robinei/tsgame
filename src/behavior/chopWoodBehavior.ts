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
    
    export class HarvestBehavior extends Behavior {
        resource: MapCell;
        isEmptying = false;
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
            return this.agent.restless * (this.agent.currentBehavior===this ? 2 : 1);
        }
        
        update() {
            if (!this.agent.cell || !this.agent.canMoveNow()) {
                return;
            }

            if (this.isEmptying){
                this.empty()
                return
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
                 console.error("Resource type wrong")
                this.reset();
            }
            this.agent.restless = Math.max(0, this.agent.restless-3);
        }

        harvestResource(){
             if (this.agent.hasRoomForInventoryItem(new Wood() )){
                if (this.resourceCell.doodad.tryHarvest()){
                    console.debug("Harvesting")
                    this.agent.inventory.push(new Wood());
                } else {
                    console.debug("Resource empty")
                    this.reset();
                }
            } else {
                console.debug("No room in inventory")
                this.reset();
                this.isEmptying = true;
            }
        }

        empty(){
            if (this.movetoPoint == null){
                this.movetoPoint = new MoveToPointAction(this.agent, 0)
                this.movetoPoint.setTarget(storageCell.getPosition())
            }

            if (!this.movetoPoint.isDone()) {
                console.debug("Returning to storage")
                this.movetoPoint.step()
            } else {
                console.debug("At storage point, emptying")
                var item = this.agent.removeNextOfType(InventoryItemType.Wood);
                if (item != null){
                    storageCell.putItem(item);
                    return;
                }
                
                this.isEmptying = false;
                this.reset();
            }
        }

        walkRandomly(){
            this.agent.restless  = Math.max(0, this.agent.restless-1);
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
}
