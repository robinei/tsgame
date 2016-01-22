namespace Game {
    export class ChopWoodBehavior extends Behavior {
        path: Array<Point>;
        tree: MapCell;
        isEmptying = false;
        treeCell: MapCell;
        currentStep = 1;

        reset(){
            this.path = null
            this.treeCell = null
            this.currentStep = 0
            console.debug("Reset")
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

        urgency():number {
            return this.agent.restless * (this.agent.currentBehavior===this ? 2 : 1);
        }
        
        update() {
            if (!this.agent.cell) {
                return;
            }

            if (!this.agent.canMoveNow()) {
                console.debug("Can't move")
                return;
            }

            console.debug("Empty? " + this.isEmptying)
            if (this.isEmptying){
                this.empty()
                return
            }
            
            if (this.path == null){
                if (!this.findPathToTree())
                    return;
            }

            if (this.currentStep < this.path.length){
                console.debug("Moving")
                var cell = map.getCellForPoint(this.path[this.currentStep]);
                if (cell.canBeEntered()) {
                    this.agent.moveTo(cell);
                    ++this.currentStep;
                }
            } else if (this.treeCell.doodad instanceof Tree) {
                console.debug("Chopping")
                if (!this.agent.tryAddInventoryItem(new Wood())){
                    console.debug("full")
                    this.isEmptying = true;
                    console.debug("Empty? " + this.isEmptying)
                    this.reset()
                    return
                }
                this.treeCell.doodad = null;
            } else {
                this.reset();
                this.isEmptying = true;
                console.debug("Empty? " + this.isEmptying)
                this.reset()
            }
            this.agent.restless  = Math.max(0, this.agent.restless-3);
        }

        empty(){
            console.debug("Emptying")
            console.debug("Storage point " + storageCell)
            
            if (this.path == null){
                this.path = map.calcPath(this.agent.cell.getPosition(), storageCell.getPosition(), false)
            }

            if (this.currentStep < this.path.length) {
                var cell = map.getCellForPoint(this.path[this.currentStep]);
                if (cell.canBeEntered()) {
                    this.agent.moveTo(cell);
                    ++this.currentStep;
                }
            } else {
                var item = this.agent.removeNextOfType(InventoryItemType.Wood)
                if (item != null){
                    storageCell.putItem(item);
                    return;
                }
                
                this.isEmptying = false;
                this.reset()
                    
                console.debug("At storage point : p : " + this.agent.cell.getPosition() + " s : " + storageCell.getPosition())
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
