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

    export enum Distance {
        Zero = 1,
        Adjacent = 2,
        Close = 4,
        Short = 8,
        Medium = 16,
        Long = 32,
        TooFar = 64
    }
    
    export interface CellTemplate {
        walkable?: boolean;
        baseTile?: number;
        woodValue?: number;
        seen?: boolean;
    }
    
    export class MapCell {
        map: Map;
        x: number;
        y: number;
        agent: Agent = null;
        
        walkable: boolean;
        baseTile: number;
        woodValue: number;
        seen: boolean;
        
        constructor(map: Map, x: number, y: number) {
            this.map = map;
            this.x = x;
            this.y = y;
        }
        
        getPosition(): Point {
            return new Point(this.x, this.y);
        }
        
        getIndex(): number {
            return this.y * this.map.width + this.x;
        }
        
        getNeighbour(direction: Direction): MapCell {
            return this.map.getCell(this.x + dirDX[direction], this.y + dirDY[direction]);
        }
        
        forNeighbours(radius: number, func: (MapCell) => boolean) {
            if (radius > maxAreaRadius) {
                throw "too big radius";
            }
            for (var i = 0; i < areaPositionsByDistance.length; ++i) {
                var pos = areaPositionsByDistance[i];
                if (pos.distance > radius) {
                    break;
                }
                var cell = this.map.getCell(this.x + pos.x, this.y + pos.y);
                if (!cell) {
                    continue;
                }
                if (!func(cell)) {
                    break;
                }
            }
        }
        
        canBeEntered(): boolean {
            return this.walkable && !this.agent;
        }
        
        applyDefaultTemplate() {
            this.walkable = true;
            this.baseTile = -1;
            this.woodValue = 0;
        }
        
        applyTemplate(template: CellTemplate) {
            this.applyDefaultTemplate();
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
        
        private calcNeigh: (node: number, result: Array<number>) => number;
        
        constructor(width: number, height: number) {
            this.width = width;
            this.height = height;
            this.cells = new Array<MapCell>(width*height);
            for (var y = 0; y < height; ++y) {
                for (var x = 0; x < width; ++x) {
                    this.cells[y*width + x] = new MapCell(this, x, y);
                }
            }
            this.calcNeigh = makeNeighbourCalc(width, height);
        }
        
        indexForPoint(p: Point): number {
            return p.y * this.width + p.x;
        }
        
        pointForIndex(index: number): Point {
            return new Point(index % this.width, Math.floor(index / this.width));
        }
        
        getCell(x: number, y: number) {
            if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
                return null;
            }
            return this.cells[y*this.width + x];
        }
        
        getCellForPoint(p: Point){
            if(p) {
                return this.getCell(p.x, p.y);
            }
            return null;
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
        
        private makeDistanceCalc(free: boolean) {
            var map = this;
            return function(a: number, b: number): number {
                var cell1 = map.cells[b];
                
                if (!(free ? cell1.canBeEntered() : cell1.walkable)) {
                    return Number.MAX_VALUE;
                }
                var cell0 = map.cells[a];
                var dx = cell1.x - cell0.x;
                var dy = cell1.y - cell0.y;
                return dx*dx + dy*dy; // don't bother with sqrt since we dont use the distances for other than comparison
            };
        }
        
        calcPath(start: Point, goal: Point, free: boolean): Array<Point> {
            var startIndex = this.indexForPoint(start);
            var goalIndex = this.indexForPoint(goal);
            var pathIndexes = calcPath(this.width * this.height, startIndex, goalIndex, this.makeDistanceCalc(free), this.calcNeigh);
            if (pathIndexes == null) {
                return null;
            }
            var path = new Array<Point>();
            for (var i = 0; i < pathIndexes.length; ++i) {
                path.push(this.pointForIndex(pathIndexes[i]));
            }
            return path;
        }
    }
    
    
    
    
    export var dirDX = [0,1,1,1,0,-1,-1,-1];
    export var dirDY = [-1,-1,0,1,1,1,0,-1];
    
    
    interface AreaPos {
        x: number;
        y: number;
        distance: number;
    }
    
    var areaPositionsByDistance: AreaPos[] = [];
    var maxAreaRadius = 32;
    
    for (var y = -maxAreaRadius; y <= maxAreaRadius; ++y) {
        for (var x = -maxAreaRadius; x <= maxAreaRadius; ++x) {
            var cx = x + 0.5;
            var cy = y + 0.5;
            areaPositionsByDistance.push({
                x: x,
                y: y,
                distance: Math.sqrt(cx*cx + cy*cy)
            });
        }
    }
    areaPositionsByDistance.sort(function(a: AreaPos, b: AreaPos) {
        return a.distance - b.distance;
    });
}
