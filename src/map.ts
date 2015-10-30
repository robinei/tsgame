
namespace Game {
    export interface CellTemplate {
        walkable?: boolean;
        baseTile?: number;
        woodValue?: number;
    }
    
    export class MapCell {
        walkable: boolean;
        baseTile: number;
        woodValue: number;
        
        applyTemplate(template: CellTemplate) {
            function opt<T>(val: T, def: T) {
                return val === undefined ? def : val;
            }
            this.baseTile = opt(template.baseTile, -1);
            this.walkable = opt(template.walkable, true);
            this.woodValue = opt(template.woodValue, 0);
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
            for (var i = 0; i < width*height; ++i) {
                this.cells[i] = new MapCell();
            }
        }
        
        getCell(x: number, y: number) {
            return this.cells[y*this.width + x];
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
