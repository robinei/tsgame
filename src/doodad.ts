namespace Game {
    

    
    export class Doodad implements Entity {
        cell: MapCell = null;
        tileImage: HTMLImageElement = null;
        hitPoints = 10

        tryHarvest() {
            this.hitPoints--;

            if (this.hitPoints < 0) {
                this.cell.doodad = null
                return false;
            }

            return true;
        }
    }
    
    export class Tree extends Doodad {
        constructor() {
            super();
            this.tileImage = tileset.getTileImageByName('tree1.png');
        }
    }
    
    export class Bush extends Doodad {
        constructor() {
            super();
            this.tileImage = tileset.getTileImageByName('bush1_with_berries.png');
        }
    }
    
    export class Rocks extends Doodad {
        constructor() {
            super();
            this.tileImage = tileset.getTileImageByName('rocks1.png');
        }
    }
    
    export class Campfire extends Doodad {

        fuelCount: number;
        
        constructor() {
            super();
            this.tileImage = tileset.getTileImageByName('campfire_off.png');
            this.fuelCount = 10;
        }
    }
}
