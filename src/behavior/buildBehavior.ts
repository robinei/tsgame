namespace Game {
    export class Building {
        rect: Rect;
        template: MapTemplate;
        isDone: boolean = false;
        isStarted: boolean = false;
        
        constructor(pos: Point, template: MapTemplate) {
            this.rect = new Rect(pos.x, pos.y, template.width, template.height);
            this.template = template;
        }
    }
    
    export class BuildBehavior extends Behavior {
        standardHouseTemplate: MapTemplate;
        building: Building;
        
        constructor(agent: Agent) {
            super(agent);
            
            var X = CellTemplates.Wall;
            var f = CellTemplates.Floor;
            var g = CellTemplates.Grass;
            var t = CellTemplates.Tree;
            var b = CellTemplates.Bush;
            var r = CellTemplates.Rock;
            
            this.standardHouseTemplate = new MapTemplate(10, 7, [
                X,X,X,X,X,X,X,X,X,X,
                X,f,f,f,f,f,f,f,f,X,
                X,f,f,f,f,f,f,f,f,X,
                X,f,f,f,f,f,f,f,f,X,
                X,f,f,f,f,f,f,f,f,X,
                X,f,f,f,f,f,f,f,f,X,
                X,X,X,X,f,f,X,X,X,X,
            ]);
        }
        
        calcUrgency(): number {
            if (buildings.length > 5) {
                return 0;
            }
            
            // if we are already building something which still can be completed, then stick to it
            if (this.building && this.building.isStarted && this.verifyBuilding(this.building)) {
                return 1000;
            }
            
            return this.agent.attributes.enthusiasm.getValue();
        }
        
        findBuildTargetPosition(template: MapTemplate): Point {
            for (var tries = 0; tries < 10; ++tries) {
                var pos = this.tryFindBuildTargetPosition(template);
                if (pos) {
                    return pos;
                }
            }
            return null;
        }
        
        tryFindBuildTargetPosition(template: MapTemplate): Point {
            var x = Math.floor(Math.random() * map.width);
            var y = Math.floor(Math.random() * map.height);
            var target = new Point(x, y);
            if (this.verifyBuildTarget(target, template)) {
                return target;
            }
            return null;
        }
        
        verifyBuilding(building: Building): boolean {
            return this.verifyBuildTarget(this.building.rect.getPosition(), this.building.template);
        }
        
        verifyBuildTarget(target: Point, template: MapTemplate): boolean {
            var w = template.width;
            var h = template.height;
            var rect = new Rect(target.x, target.y, w, h);
            for (var i = 0; i < buildings.length; ++i) {
                var building = buildings[i];
                if (building.rect.intersects(rect)) {
                    this.agent.log(LOGTAG_BEHAVIOR, "building in the way!");
                    return false;
                }
            }
            
            for (var y = 0; y < h; ++y) {
                for (var x = 0; x < w; ++x) {
                    var cell = map.getCell(rect.x + x, rect.y + y);
                    if (!cell) {
                        //console.log("outside map!");
                        return false;
                    }
                    var cellTemplate = template.getCellTemplate(x, y);
                    if (cell.compatibleWithTemplate(cellTemplate)) {
                        continue; // it's already how we want it
                    }
                    if (!cell.walkable) {
                        //console.log("not walkable!");
                        return false; // we can't apply the cell template if we cant enter it
                    }
                }
            }
            
            return true;
        }
        
        update() {
            // if the assigned building can't be completed, then remove it from list
            if (this.building && !this.verifyBuilding(this.building)) {
                this.building = null;
                removeFromArray(buildings, this.building);
            }
            
            // try to find in-progress building if we have no assigned building yet
            if (!this.building) {
                for (var i = 0; i < buildings.length; ++i) {
                    var building = buildings[i];
                    if (!building.isDone) {
                        this.building = building;
                        break;
                    }
                }
            }
            
            // try to create building if none is assigned yet
            if (!this.building) {
                var template = this.standardHouseTemplate;
                var pos = this.findBuildTargetPosition(template);
                if (pos) {
                    this.agent.log(LOGTAG_BEHAVIOR, "found target rect: " + pos.x + ", " + pos.y);
                    this.building = new Building(pos, template);
                    buildings.push(this.building);
                }
            }
            
            if (!this.building) {
                this.agent.log(LOGTAG_BEHAVIOR, "no building!");
                return;
            }
            
            var next = this.getNextCellToBuildOn();
            if (!next.cell) {
                //console.log("no build cell found");
                if (next.skipped === 0) {
                    this.agent.log(LOGTAG_BEHAVIOR, "DONE building");
                    this.building.isDone = true;
                    this.building = null;
                }
                return;
            }
            
            this.agent.log(LOGTAG_BEHAVIOR, "move");
            var moveAction = new MoveToPointAction(this.agent, Distance.Zero);
            moveAction.setTarget(next.cell.getPosition());
            moveAction.step();
            //console.log("pos x: " + this.agent.cell.x);
            //console.log("target x: " + next.cell.x);
            
            if (this.agent.cell === next.cell) {
                //console.log("at build cell!");
                next.cell.applyTemplate(next.cellTemplate);
                this.building.isStarted = true;
                this.agent.attributes.enthusiasm.update(5);
            } else {
                //console.log("not at target");
            }
        }
        
        getNextCellToBuildOn(): {cell: MapCell, cellTemplate: CellTemplate, skipped: number} {
            var rect = this.building.rect;
            var w = this.building.template.width;
            var h = this.building.template.height;
            var skipped = 0;
            for (var y = 0; y < h; ++y) {
                for (var x = 0; x < w; ++x) {
                    var cell = map.getCell(rect.x + x, rect.y + y);
                    var cellTemplate = this.building.template.getCellTemplate(x, y);
                    if (cell.compatibleWithTemplate(cellTemplate)) {
                        continue; // it's already how we want it
                    }
                    if (!cell.canBeEntered() && cell.agent !== this.agent) {
                        ++skipped;
                        continue; // we can't apply the cell template if we can't enter it
                    }
                    return { cell: cell, cellTemplate: cellTemplate, skipped: skipped };
                }
            }
            return { cell: null, cellTemplate: null, skipped: skipped };
        }
        
        reset() {
            this.building = null;
        }
    }
}
