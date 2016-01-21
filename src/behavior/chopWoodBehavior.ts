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

        findPathToTree(agent: Agent){
            this.tree = this.findClosestTree(agent)

             if (this.tree == null){
                 this.walkRandomly(agent)
                 return false
             }

            this.path = map.calcPath(agent.cell.getPosition(), this.tree.getPosition(), false)

            return true
        }

        findClosestTree(agent: Agent){
            var tree
            agent.cell.forNeighbours(30, function(cell: MapCell) {
                if (cell != null && cell.woodValue > 0){
                    tree = cell
                    return false
                }
                return true
             });

             return tree
        }

        urgency(agent: Agent):number {
            return agent.restless;
        }
        
        update(agent: Agent) {
            if (!agent.cell) {
                return;
            }

            if (!agent.canMoveNow()) {
                return;
            }

            if (this.path == null){
                if (!this.findPathToTree(agent))
                    return;
            }

            if (this.currentStep < this.path.length){
                var point = this.path[this.currentStep++]
                agent.moveTo(map.getCell(point.x, point.y))
            } else if (this.tree.woodValue > 0) {
                if (!agent.tryAddInventoryItem(new Wood())){
                    return
                }

                this.tree.woodValue--;
            } else {
                this.reset()
            }
            agent.restless  = Math.max(0, agent.restless-1);
        }

        walkRandomly(agent: Agent){
            for (var tries = 0; tries < 10; ++tries) {
                var direction = Math.floor(Math.random() * 8);
                var cell = agent.cell.getNeighbour(direction);
                if (cell && cell.canBeEntered()) {
                    agent.moveTo(cell);
                    break;
                }
            }
        }
    }
}