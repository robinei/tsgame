namespace Game {
    
    export enum InventoryItemType {
        Wood,
        Food,
        Weapon,
        Tool
    }

    export interface InventoryItem {
        weight: number;
        type: InventoryItemType;
    }

    export class Wood implements InventoryItem{
        weight = 1
        type = InventoryItemType.Wood
        toString(): string {
            return "wood";
        }
    }
        
    export class Inventory {
        items: Array<InventoryItem> = new Array<InventoryItem>();
        
        constructor(public entity: Entity) {          
        }
        
        getTotalInventoryWeight()
        {
            var weight = 0
            this.items.forEach(element => {
                weight += element.weight
            });
            
            return weight
        }
        
        itemCountOfType(itemType: InventoryItemType): number {
            var count;
            for (var i = 0; i < this.items.length; ++i){
                if (this.items[i].type == itemType){
                    count++;
                }
            }
            return count;
        }
        
        hasItemOfType(itemType: InventoryItemType): boolean {
            for (var i = 0; i < this.items.length; ++i){
                if (this.items[i].type == itemType){
                    return true;
                }
            }
            return false;
        }
        
        removeNextOfType(itemType: InventoryItemType): InventoryItem {
            var foundItem = null;
            for (var i = 0; i < this.items.length; ++i){
                if (this.items[i].type == itemType){
                    foundItem = this.items[i];
                    this.items.splice(i, 1);
                }
            }
            return foundItem;
        }
        
        tryAddInventoryItem(item: InventoryItem){
            if (!this.hasRoomForInventoryItem(item))
                return false
            
            this.items.push(item)
            return true
        }

        hasRoomForInventoryItem(item: InventoryItem){
            // TODO use attributes for capacity?
            return ( this.getTotalInventoryWeight() + item.weight <= 10);
        }
    }

}