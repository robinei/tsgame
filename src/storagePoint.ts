namespace Game {
    export class StoragePoint {
        cell: MapCell;
        storage: Array<InventoryItem>;
        motionPoints: number = 1;
        
        StoragePoint(){
           this.cell = map.getCell(20, 20)
        }
    }
}
