namespace Game {
    export class MakeCampfireBehavior extends Behavior {

        path: Array<Point>;
        tree: MapCell;
        isEmptying = false;
        treeCell: MapCell;
        currentStep = 1;
        
        campfire: MapCell;

        reset(){
            this.path = null
            this.treeCell = null
            this.currentStep = 0
        }

        findPathToTree(){
            this.treeCell = this.findClosestTree()

            if (this.treeCell == null){
                this.walkRandomly()
                return false
            }

            this.path = map.calcPath(this.agent.cell.getPosition(), this.treeCell.getPosition(), false)

            return true
        }

        findClosestTree(){
            var tree;
            this.agent.cell.forNeighbours(30, function(cell: MapCell) {
                if (cell != null && cell.doodad instanceof Tree) {
                    tree = cell;
                    return false;
                }
                return true;
             });

             return tree;
        }
        
        findClosestCampfire(): Campfire {
            var campfire;
            this.agent.cell.forNeighbours(30, function(cell: MapCell) {
                if (cell != null && cell.doodad instanceof Campfire) {
                    campfire = cell;
                    return false;
                }
                return true;
             });

             return campfire;
        }

        calcUrgency(): number {
            // TODO check if there is a campfire, and if it's close to burning out
            return this.agent.restless * (agents[0] === this.agent ? 4 : 0.1);
        }
        
        update() {
            if (!this.agent.cell) {
                return;
            }

            if (!this.agent.canMoveNow()) {
                return;
            }

            console.debug("Campfire " + this.agent.name);
            this.agent.restless  = Math.max(0, this.agent.restless-3);
        }

        moveTowardsTarget(){
            var point = this.path[this.currentStep]
            var cell = map.getCell(point.x, point.y);

            if (cell.canBeEntered()) {
                this.agent.moveTo(cell);
                ++this.currentStep;
            }
        }

        chopWood(){
             if (this.agent.hasRoomForInventoryItem(new Wood() )){
                if (this.treeCell.doodad.tryHarvest()){
                    this.agent.inventory.push(new Wood());
                } else {
                    this.reset();
                }
            } else {
                this.reset();
                this.isEmptying = true;
                return
            }
        }

        harvestTree(doodad: Doodad){
            doodad.hitPoints--;

            if (doodad.hitPoints <= 0){
                doodad = null;
            }
        }

        empty(){
            if (this.path == null){
                this.path = map.calcPath(this.agent.cell.getPosition(), storageCell.getPosition(), false);
            }

            if (this.currentStep < this.path.length) {
                var cell = map.getCellForPoint(this.path[this.currentStep]);
                if (cell.canBeEntered()) {
                    console.debug("Moving to storage point : " + cell.getPosition() + " s : ")
                    this.agent.moveTo(cell);
                    ++this.currentStep;
                }
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