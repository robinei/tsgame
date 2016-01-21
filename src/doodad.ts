namespace Game {
    

    
    export class Doodad {
        cell: MapCell = null;
        tileImage: HTMLImageElement = null;
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
}
