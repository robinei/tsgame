namespace Game {
    export class DeliverBehavior extends Behavior {
        movetoPoint: MoveToPointAction;
        doneEmptying = false;

        calcUrgency(): number {
            if (this.doneEmptying) {
                return 0;
            } else {
                var w = this.agent.getTotalInventoryWeight();
                return (w / this.agent.carryCapacity);
            }
        }
            
        update() {
            if (this.movetoPoint == null){
                this.movetoPoint = new MoveToPointAction(this.agent, 0)
                this.movetoPoint.setTarget(storageCell.getPosition())
            }

            if (!this.movetoPoint.isDone()) {
                this.movetoPoint.step()
            } else {
                var item = this.agent.removeNextOfType(InventoryItemType.Wood);
                if (item != null){
                    storageCell.putItem(item);
                    return;
                } else {
                    this.doneEmptying = true;
                }
            }
        }
    }
}
