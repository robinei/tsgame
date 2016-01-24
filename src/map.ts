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
        Zero = 0,
        Adjacent = 1,
        Close = 2,
        Short = 4,
        Medium = 8,
        Long = 16,
        TooFar = 32
    }
    
    export interface DoodadFactory {
        (): Doodad;
    }
    
    export interface CellTemplate {
        // these properties will be applied to cells
        walkable?: boolean;
        baseTile?: number;
        seen?: boolean;
        doodadFactory?: DoodadFactory;
        
        // template-specific properties (don't try to apply to a cell)
        buildPriority?: number;
    }
    
    export class MapCell implements ItemHolder {
        map: Map;
        x: number;
        y: number;
        agent: Agent = null;
        doodad: Doodad = null;
        displayName: string;
        
        walkable: boolean;
        baseTile: number;
        seen: boolean = false;
        
        inventory = new Array<InventoryItem>();
        
        constructor(map: Map, x: number, y: number) {
            this.map = map;
            this.x = x;
            this.y = y;
            this.displayName = "(" + this.x + ", " + this.y + ")";
        }
        
        putItem(item: InventoryItem){
            this.inventory.push(item)
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
                    return;
                }
                var cell = this.map.getCell(this.x + pos.x, this.y + pos.y);
                if (!cell) {
                    continue;
                }
                if (!func(cell)) {
                    return;
                }
            }
        }
        
        forNeighboursUnbiased(radius: number, func: (MapCell) => boolean) {
            if (radius > maxAreaRadius) {
                throw "too big radius";
            }
            for (var i = 0; i < areaPositionBuckets.length; ++i) {
                var bucket = areaPositionBuckets[i];
                shuffleArray(bucket);
                for (var j = 0; j < bucket.length; ++j) {
                    var pos = bucket[j];
                    if (pos.distance > radius) {
                        return;
                    }
                    var cell = this.map.getCell(this.x + pos.x, this.y + pos.y);
                    if (!cell) {
                        continue;
                    }
                    if (!func(cell)) {
                        return;
                    }
                }
            }
        }
        
        canBeEntered(): boolean {
            return this.walkable && !this.agent;
        }
        
        applyTemplate(template: CellTemplate) {
            this.baseTile = valueOrDefault(template.baseTile, -1);
            this.walkable = valueOrDefault(template.walkable, true);
            if (template.doodadFactory !== undefined) {
                this.doodad = template.doodadFactory();
                this.doodad.cell = this;
            } else if (this.doodad) {
                removeFromArray(doodads, this.doodad);
                this.doodad.cell = null;
                this.doodad = null;
            }
        }
        
        compatibleWithTemplate(template: CellTemplate): boolean {
            if (valueOrDefault(template.baseTile, -1) !== this.baseTile) { return false; }
            if (valueOrDefault(template.walkable, true) !== this.walkable) { return false; }
            if (template.doodadFactory && !this.doodad) { return false; } // TODO: ke?
            return true;
        }
    }
    
    
    export class MapTemplate {
        width: number;
        height: number;
        cellsTemplates: CellTemplate[];
        
        getCellTemplate(x: number, y: number) {
            return this.cellsTemplates[y*this.width + x];
        }
        
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
    var areaPositionBuckets: AreaPos[][] = [];
    
    {
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
        
        var currDistance = -1;
        var currBucket: AreaPos[] = null;
        for (var i = 0; i < areaPositionsByDistance.length; ++i) {
            var pos = areaPositionsByDistance[i];
            var d = Math.floor(pos.distance);
            if (d != currDistance) {
                if (currBucket !== null) {
                    areaPositionBuckets.push(currBucket);
                }
                currBucket = [];
                currDistance = d;
            }
            currBucket.push(pos);
        }
        if (currBucket !== null && currBucket.length > 0) {
            areaPositionBuckets.push(currBucket);
        }
    }
}
