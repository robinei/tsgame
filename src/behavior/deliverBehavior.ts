namespace Game {
    export class DeliverBehavior extends Behavior {
        movetoPoint: MoveToPointAction;

        calcUrgency(): number {
            var w = this.agent.getTotalInventoryWeight();
            return (w / this.agent.carryCapacity);
        }
            
        update() {
            if (this.movetoPoint == null){
                this.movetoPoint = new MoveToPointAction(this.agent, 0)
                this.movetoPoint.setTarget(storageCell.getPosition())
            }

            if (!this.movetoPoint.isDone()) {
                this.movetoPoint.step()
            } else {
                while (this.agent.inventory.length) {
                    var item = this.agent.inventory.pop();
                    if (item != null){
                        storageCell.putItem(item);
                    }
                }
            }
        }
    }
}
