namespace Game {
    

    
    export class Doodad {
        cell: MapCell = null;
        tileImage: HTMLImageElement = null;
    }
    
    export class Tree extends Doodad {
        constructor(tileset: Tileset) {
            super();
            this.tileImage = tileset.getTileImageByName('tree1.png');
        }
    }
}
