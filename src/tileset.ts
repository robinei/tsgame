
namespace Game {
    export class Tileset {
        private images: HTMLImageElement[];
        private indexes: { [key: string]: number };
        
        constructor(onloaded: () => void) {
            this.images = [];
            this.indexes = {};
            
            var tiles = [
                'grass1.png',
                'wall1.png',
                'tree1.png',
                'floor1.png',
            ];
            
            for (var i = 0; i < tiles.length; ++i) {
                var tile = new Image();
                tile.onload = onload;
                tile.src = '../data/tiles/' + tiles[i];
                this.images.push(tile);
                this.indexes[tiles[i]] = i;
            }
            
            var loadedCount = 0;
            function onload() {
                if (++loadedCount == tiles.length) {
                    onloaded();
                }
            }
        }
        
        getTileIndex(name: string): number {
            return this.indexes[name];
        }
        
        getTileImage(index: number): HTMLImageElement {
            return this.images[index];
        }
    }
}
