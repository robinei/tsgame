namespace Game {
    
    export function HasItemOfType(itemHolder: ItemHolder, itemType: InventoryItemType): boolean {
        if (itemHolder == null || itemHolder.inventory == null) {
            return false;
        }
        var inventory = itemHolder.inventory;
        for (var i = 0; i < inventory.length; ++i) {
            if (inventory[i].type === itemType) {
                return true;
            }
        }
        return false;
    }
    
    export function GetItemOfTypeCount(itemHolder: ItemHolder, itemType: InventoryItemType): number {
        if (itemHolder == null || itemHolder.inventory == null) {
            return 0;
        }
        var inventory = itemHolder.inventory;
        var count = 0;
        for (var i = 0; i < inventory.length; ++i) {
            if (inventory[i].type === itemType) {
                count++;
            }
        }
        return count;
    }
    
    export function RemoveItemOfType(itemHolder: ItemHolder, itemType: InventoryItemType): InventoryItem {
        if (itemHolder == null || itemHolder.inventory == null) {
            return null;
        }
        var inventory = itemHolder.inventory;
        for (var i = 0; i < inventory.length; ++i) {
            if (inventory[i].type === itemType) {
                return inventory.splice(i, 1)[0];
            }
        }
        return null;
    }
    
    export class GetStoredItemsBehavior extends Behavior {
        
        cellWithItem: MapCell;
        
        constructor(agent: Agent, public itemType: InventoryItemType, public itemCount: number) {
            super(agent);
            this.itemType = itemType;
            this.itemCount = itemCount;
        }
        
        findCellWithItems(): MapCell {
            var foundCell;
            this.agent.cell.forNeighbours(30, function(cell: MapCell) {
                if (HasItemOfType(cell, this.itemType)) {
                    foundCell = cell;
                    return false;
                }
                return true;
             });

             return foundCell;
        }
        
        calcUrgency(): number {
            if (GetItemOfTypeCount(this.agent, this.itemType) >= this.itemCount) {
                return 0;
            }
            if (!this.updateCellWithItem()) {
                return 0;
            }
            return 0.99;
        }
        
        updateCellWithItem(): boolean {
            this.cellWithItem = this.findCellWithItems();
            return toBoolean(this.cellWithItem);
        }
        
        update() {
            if (!this.agent.cell) {
                return;
            }

            var desiredItemCount = this.itemCount - GetItemOfTypeCount(this.agent, this.itemType);
            var availableItemCount = GetItemOfTypeCount(this.agent.cell, this.itemType);
            var takeItemCount = Math.min(desiredItemCount, availableItemCount);
            if (takeItemCount > 0) {
                console.debug("Taking items");
                for (; takeItemCount > 0; --takeItemCount) {
                    var item = RemoveItemOfType(this.agent.cell, this.itemType);
                    this.agent.cell.putItem(item);
                    console.debug("Picking up item " + item);
                }
                return;
            }
            
            if (!this.agent.canMoveNow()) {
                return;
            }
            
            if (!this.updateCellWithItem()) {
                console.log("No cell with wood");
                return;
            }
            
            var path = map.calcPath(this.agent.cell.getPosition(), this.cellWithItem.getPosition(), false);
            if (path.length > 1) {
                var cell = map.getCellForPoint(path[1]);
                if (cell.canBeEntered()) {
                    console.debug("Moving to storage point : " + cell.getPosition() + " s : ")
                    this.agent.moveTo(cell);
                }
            } else {
                console.debug("Strange path in campfire behavior");
            }
        }        
    }
    
    export class MakeCampfireBehavior extends Behavior {
        
        campfire: MapCell;
        getStoredWoodBehavior: Behavior;

        constructor(agent: Agent) {
            super(agent);
            this.getStoredWoodBehavior = new GetStoredItemsBehavior(
                agent, InventoryItemType.Wood, 2);
        }
        
        reset() {
            this.campfire = null;
            this.getStoredWoodBehavior.reset();            
        }

        findClosestCampfire(): MapCell {
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
        
        updateCampfire(): boolean {
            this.campfire = this.findClosestCampfire();
            return toBoolean(this.campfire);
        }
        
        hasWood(): boolean {
            return HasItemOfType(this.agent, InventoryItemType.Wood);
        }

        calcUrgency(): number {
            // TODO use sub-behaviours to get the max urgency
            if (agents[0] !== this.agent) {
                return 0;
            }
            if (this.updateCampfire()) {
                console.debug("Found campfire");
            } else {
                console.debug("No campfire");
            }
            return 3;
        }
        
        update() {
            if (!this.agent.cell) {
                return;
            }
            
            this.getStoredWoodBehavior.update();
        }

    }
    
}