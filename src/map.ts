namespace Game {
    export enum Direction {
        North,
        NorthEast,
        East,
        SouthEast,
        South,
        SouthWest,
        West,
        NorthWest
    }
    
    export interface CellTemplate {
        walkable?: boolean;
        baseTile?: number;
        woodValue?: number;
    }
    
    var dirDX = [0,1,1,1,0,-1,-1,-1];
    var dirDY = [-1,-1,0,1,1,1,0,-1];
    
    export class MapCell {
        map: Map;
        x: number;
        y: number;
        agent: Agent = null;
        
        walkable: boolean = true;
        baseTile: number = -1;
        woodValue: number = 0;
        
        constructor(map: Map, x: number, y: number) {
            this.map = map;
            this.x = x;
            this.y = y;
        }
        
        getPosition(): Point {
            return new Point(this.x, this.y);
        }
        
        getNeighbour(direction: Direction): MapCell {
            return map.getCell(this.x + dirDX[direction], this.y + dirDY[direction]);
        }
        
        canBeEntered(): boolean {
            return this.walkable && !this.agent;
        }
        
        applyTemplate(template: CellTemplate) {
            if (template.baseTile !== undefined) { this.baseTile = template.baseTile; }
            if (template.walkable !== undefined) { this.walkable = template.walkable; }
            if (template.woodValue !== undefined) { this.woodValue = template.woodValue; }
        }
    }
    
    
    export class MapTemplate {
        width: number;
        height: number;
        cellsTemplates: CellTemplate[];
        
        constructor(width: number, height: number, cellTemplates: CellTemplate[]) {
            if (width*height != cellTemplates.length) {
                throw "bad template size";
            }
            this.width = width;
            this.height = height;
            this.cellsTemplates = cellTemplates;
        }
    }
    
    export class Map {
        width: number;
        height: number;
        cells: MapCell[];
        
        constructor(width: number, height: number) {
            this.width = width;
            this.height = height;
            this.cells = new Array<MapCell>(width*height);
            for (var y = 0; y < height; ++y) {
                for (var x = 0; x < width; ++x) {
                    this.cells[y*width + x] = new MapCell(this, x, y);
                }
            }
        }
        
        getCell(x: number, y: number) {
            if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
                return null;
            }
            return this.cells[y*this.width + x];
        }
        
        randomCell(): MapCell {
            var x = Math.floor(Math.random() * this.width);
            var y = Math.floor(Math.random() * this.height);
            return this.getCell(x, y);
        }
        
        applyTemplate(template: MapTemplate, x: number, y: number) {
            for (var i = 0; i < template.width*template.height; ++i) {
                var cx = i % template.width;
                var cy = Math.floor(i / template.width);
                this.applyCellTemplate(template.cellsTemplates[i], x + cx, y + cy);
            }
        }
        
        applyCellTemplate(template: CellTemplate, x: number, y: number) {
            var cell = this.getCell(x, y);
            if (cell !== null) {
                cell.applyTemplate(template);
            }
        }
    }
}
