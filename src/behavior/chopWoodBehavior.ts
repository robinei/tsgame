namespace Game {
    export class ChopWoodBehavior extends Behavior {
        path: Array<Point>;
        tree: MapCell;
        currentStep = 1;

        reset(){
            this.path = null
            this.tree = null
            this.currentStep = 0
        }

        findPathToTree(){
            this.tree = this.findClosestTree()

            if (this.tree == null){
                this.walkRandomly()
                return false
            }

            this.path = map.calcPath(this.agent.cell.getPosition(), this.tree.getPosition(), false)

            return true
        }

        findClosestTree(){
            var tree
            this.agent.cell.forNeighbours(30, function(cell: MapCell) {
                if (cell != null && cell.woodValue > 0){
                    tree = cell
                    return false
                }
                return true
             });

             return tree
        }

        urgency():number {
            return this.agent.restless;
        }
        
        update() {
            if (!this.agent.cell) {
                return;
            }

            if (!this.agent.canMoveNow()) {
                return;
            }

            if (this.path == null){
                if (!this.findPathToTree())
                    return;
            }

            if (this.currentStep < this.path.length){
                var point = this.path[this.currentStep++]
                var cell = map.getCell(point.x, point.y);
                if (cell.canBeEntered()) {
                    this.agent.moveTo(cell);
                }
            } else if (this.tree.woodValue > 0) {
                if (!this.agent.tryAddInventoryItem(new Wood())){
                    return
                }

                this.tree.woodValue--;
            } else {
                this.reset()
            }
            this.agent.restless  = Math.max(0, this.agent.restless-1);
        }

        walkRandomly(){
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