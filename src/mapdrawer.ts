namespace Game {
    export class MapDrawer {
        map: Map;
        tileset: Tileset;
        corner: Point = new Point(0, 0);
        cursorCell: MapCell;
        
        constructor(map: Map, tileset: Tileset) {
            this.map = map;
            this.tileset = tileset;
        }

        
        getCellAtClientCoord(clientX: number, clientY: number): MapCell {
            var p = this.mapCoordForClientCoord(clientX, clientY);
            return this.map.getCell(p.x + this.corner.x, p.y + this.corner.y);
        }
        
        mapCoordForClientCoord(clientX: number, clientY: number): Point {
            var x = Math.floor(clientX / TILE_DIM);
            var y = Math.floor(clientY / TILE_DIM);
            return new Point(x, y);
        }
        
        clientCoordForMapCoord(x: number, y: number): Point {
            return new Point((x - this.corner.x) * TILE_DIM, (y - this.corner.y) * TILE_DIM);
        }
        
        draw(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
            if (this.cursorCell) {
                var pos = this.clientCoordForMapCoord(this.cursorCell.x, this.cursorCell.y);
                context.fillStyle = "rgba(255, 255, 255, 0.3)";
                context.fillRect(pos.x, pos.y, TILE_DIM, TILE_DIM);
            }
            
            var path = this.map.calcPath(agents[0].getPosition(), new Point(31, 21), false);
            for (var i = 0; i < path.length; ++i) {
                var pos = this.clientCoordForMapCoord(path[i].x, path[i].y);
                context.fillStyle = "rgba(255, 255, 255, 0.1)";
                context.fillRect(pos.x, pos.y, TILE_DIM, TILE_DIM);
            }
            
            var originCell = this.getCellAtClientCoord(0, 0);
            
            
            for (var y = 0; ; ++y) {
                var clientY = y * TILE_DIM;
                if (clientY > canvas.height) {
                    break;
                }
                
                for (var x = 0; ; ++x) {
                    var clientX = x * TILE_DIM;
                    if (clientX > canvas.width) {
                        break;
                    }
                    
                    var cell = this.map.getCell(x + this.corner.x, y + this.corner.y);
                    if (!cell) {
                        continue;
                    }
                    if (cell.baseTile >= 0) {
                        context.drawImage(this.tileset.getTileImage(cell.baseTile), clientX, clientY);
                    }
                    if (cell.doodad != null) {
                        context.drawImage(cell.doodad.tileImage, clientX, clientY);
                    }
                    if (cell.agent) {
                        var source = cell.agent.getImageSource();
                        context.drawImage(this.tileset.getTileImageByName(source), clientX, clientY);
                        context.fillStyle = "rgba(240, 240, 240, 1.0)"
                        context.font="9px Arial";                        
                        var agentName = cell.agent.displayName;
                        var strWidth = context.measureText(agentName).width;
                        context.fillText(agentName, 
                            clientX + 0.5 * (TILE_DIM - strWidth),
                            clientY - TILE_DIM / 8);
                    }
                    if (!cell.seen) {
                        context.fillStyle = "rgba(0, 0, 0, 0.7)";
                        context.fillRect(clientX, clientY, TILE_DIM, TILE_DIM);
                    }
                }
            }
        }
    }
}
