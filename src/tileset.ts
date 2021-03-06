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
                'bush1_without_berries.png',
                'bush1_with_berries.png',
                'rocks1.png',
                'floor1.png',
                'guy1.png',
                'guy2f.png',
                'guy2r.png',
                'guy2b.png',
                'guy2l.png',
                'wonkey.png',
                'turtllama.png',
                'bird.png',
                'campfire_off.png',
                'campfire_on0.png',
                'campfire_on1.png',
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
        
        getTileImageByName(name: string): HTMLImageElement {
            return this.images[this.indexes[name]];
        }
    }
}
