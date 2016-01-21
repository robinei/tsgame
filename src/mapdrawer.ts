namespace Game {
    export class MapDrawer {
        map: Map;
        tileset: Tileset;
        corner: Point;
        cursorCell: MapCell;
        
        constructor(map: Map, tileset: Tileset) {
            this.map = map;
            this.tileset = tileset;
        }
        
        getCellAtClientCoord(clientX: number, clientY: number): MapCell {
            var x = Math.floor(clientX / TILE_DIM);
            var y = Math.floor(clientY / TILE_DIM);
            return this.map.getCell(x, y);
        }
        
        draw(context: CanvasRenderingContext2D) {
            if (this.cursorCell) {
                context.fillStyle = "rgba(255, 255, 255, 0.3)";
                context.fillRect(this.cursorCell.x*TILE_DIM, this.cursorCell.y*TILE_DIM, TILE_DIM, TILE_DIM);
            }
            
            var path = this.map.calcPath(agents[0].getPosition(), new Point(31, 21));
            for (var i = 0; i < path.length; ++i) {
                var p = path[i];
                context.fillStyle = "rgba(255, 255, 255, 0.1)";
                context.fillRect(p.x*TILE_DIM, p.y*TILE_DIM, TILE_DIM, TILE_DIM);
            }
            
            for (var y = 0; y < this.map.height; ++y) {
                for (var x = 0; x < this.map.width; ++x) {
                    var cell = this.map.getCell(x, y);
                    if (cell.baseTile >= 0) {
                        context.drawImage(this.tileset.getTileImage(cell.baseTile), x*TILE_DIM, y*TILE_DIM);
                    }
                    if (cell.woodValue > 0) {
                        context.drawImage(this.tileset.getTileImageByName('tree1.png'), x*TILE_DIM, y*TILE_DIM);
                    }
                    if (cell.agent) {
                        context.drawImage(this.tileset.getTileImageByName('guy1.png'), x*TILE_DIM, y*TILE_DIM);
                    }
                }
            }
        }
    }
}
