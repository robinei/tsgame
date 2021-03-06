namespace Game {
    var canvas = <HTMLCanvasElement>document.getElementById('canvas');
    var context = canvas.getContext('2d');
    
    map = new Map(80, 50);
    tileset = new Tileset(onTilesLoaded);
    
    var mapDrawer = new MapDrawer(map, tileset);
    
    storageCell = map.getCell(20, 20)

    function onTilesLoaded() {
        window.onresize = resizeCanvas;
        document.onkeydown = onKeyDown;
        document.onmousemove = onMouseMove;
        canvas.onclick = onClick;
        eventManager = new EventManager();
        generateMap();
        resizeCanvas();
    }

    function onClick(e: MouseEvent) {
        console.log("click");
        var p = mapDrawer.mapCoordForClientCoord(e.clientX, e.clientY);
        mapDrawer.corner.x = p.x - Math.floor(0.5 * canvas.width / TILE_DIM);
        mapDrawer.corner.y = p.y - Math.floor(0.5 * canvas.height / TILE_DIM);
        drawCanvas();
    }

    function onKeyDown(e: KeyboardEvent) {
        if (e.keyCode == 37) { // left
            --mapDrawer.corner.x;
        } else if (e.keyCode == 38) { // up
            --mapDrawer.corner.y;
        } else if (e.keyCode == 39) { // right
            ++mapDrawer.corner.x;
        } else if (e.keyCode == 40) { // down
            ++mapDrawer.corner.y;
        } else if (e.keyCode == 32) { // space
            updateWorld();
        }
        drawCanvas();
    }
    
    function onMouseMove(e: MouseEvent) {
        var cell = mapDrawer.getCellAtClientCoord(e.clientX, e.clientY);
        if (cell == mapDrawer.cursorCell) {
            return;
        }
        mapDrawer.cursorCell = cell;
        drawCanvas();
        
        var visible = false;
        var infoview = document.getElementById("infoview");
        while (infoview.hasChildNodes()) {
            infoview.removeChild(infoview.firstChild);
        }
        if (cell && cell.agent) {
            var agent = cell.agent;
            var behavior = agent.getBehavior();
            infoview.appendChild(document.createTextNode("Id: " + agents.indexOf(agent)));
            infoview.appendChild(document.createElement("br"));
            if (behavior) {
                infoview.appendChild(document.createTextNode("Behavior: " + behavior.toString()));
                visible = true;
            }
            infoview.appendChild(document.createElement("br"));
            infoview.appendChild(document.createTextNode(agent.attributes.vitality.toString()));
            infoview.appendChild(document.createElement("br"));
            infoview.appendChild(document.createTextNode(agent.attributes.vigour.toString()));
            infoview.appendChild(document.createElement("br"));
            infoview.appendChild(document.createTextNode(agent.attributes.sanity.toString()));
            infoview.appendChild(document.createElement("br"));
            infoview.appendChild(document.createTextNode(agent.attributes.enthusiasm.toString()));
            
            infoview.appendChild(document.createElement("br"));
            infoview.appendChild(document.createTextNode(agent.attributes.nutrition.toString()));
            infoview.appendChild(document.createElement("br"));
            infoview.appendChild(document.createTextNode(agent.attributes.community.toString()));
            infoview.appendChild(document.createElement("br"));
            infoview.appendChild(document.createTextNode(agent.attributes.comfort.toString()));
            infoview.appendChild(document.createElement("br"));
            infoview.appendChild(document.createTextNode(agent.attributes.curiosity.toString()));
            infoview.appendChild(document.createElement("br"));
            infoview.appendChild(document.createTextNode("Direction: " + agent.direction));
        }
        infoview.style.visibility = visible ? "visible" : "hidden";
    }
    
    class RandomTemplatePicker {
        
        constructor(public templates: CellTemplate[], weights: number[]) {
            this.templates = [];
            var maxTi = Math.min(templates.length, weights.length);
            for (var ti = 0; ti < maxTi; ++ti) {
                for (var ii = 0; ii < weights[ti]; ++ii) {
                    this.templates.push(templates[ti]);
                }
            }
        }
        
        getRandomTemplate(): CellTemplate {
            var index = Math.floor(Math.random() * this.templates.length);
            return this.templates[index];
        }
    }
    
    export namespace CellTemplates {
        function CT(baseTileName: string, template?: CellTemplate) {
            template = template || {};
            template.baseTile = tileset.getTileIndex(baseTileName);
            return template;
        }
        
        export var Default = <CellTemplate>{};
        export var Wall = CT('wall1.png', { walkable: false, buildPriority: 0 });
        export var Floor = CT('floor1.png', { buildPriority: 1 });
        export var Grass = CT('grass1.png', {});
        export var Tree = CT('grass1.png', { doodadFactory: () => { return new Game.Tree(); }});
        export var Bush = CT('grass1.png', { doodadFactory: () => { return new Game.Bush(); }});
        export var Rock = CT('grass1.png', { doodadFactory: () => { return new Game.Rocks(); }});
    }
    
    function generateMap() {
        var X = CellTemplates.Wall;
        var f = CellTemplates.Floor;
        var g = CellTemplates.Grass;
        var t = CellTemplates.Tree;
        var b = CellTemplates.Bush;
        var r = CellTemplates.Rock;
        
        var randomTemplatePicker = new RandomTemplatePicker(
            [ g, t, b, r ],
            [ 50, 2, 1, 1]);
        
        for (var y = 0; y < map.height; ++y) {
            for (var x = 0; x < map.width; ++x) {
                var template = randomTemplatePicker.getRandomTemplate();
                map.applyCellTemplate(template, x, y);
            }
        }
        
        while (agents.length < 5 ) {
            var cell = map.randomCell();
            if (!cell.canBeEntered()) {
                continue;
            }
            var agent = new Agent(cell);
            agents.push(agent);
        }
        agents[0].consoleLogger.setEnabled(true, LOGTAG_BEHAVIOR);
// Activates zombie-wonkies:
//        agents[0].skin = new WonkeySkin()
//        agents[0].behaviors = [ new KillBehavior(agents[0]) ];
        
        map.getCell(40, 40).forNeighbours(5, function(cell: MapCell) {
            cell.baseTile = t.baseTile;
            return true;
        });
    }

    function updateWorld() {
        for (var i = 0; i < doodads.length; ++i) {
            var event = doodads[i].update();
            eventManager.evaluate(event);
        }
        for (var i = 0; i < agents.length; ++i) {
            var event = agents[i].update();
            eventManager.evaluate(event);
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawCanvas(); 
    }

    function drawCanvas() {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        mapDrawer.draw(canvas, context);
    }
}


