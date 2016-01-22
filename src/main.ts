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
            var behavior = agent.currentBehavior;
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
    
    function generateMap() {
        function CT(baseTileName: string, template?: CellTemplate) {
            template = template || {};
            template.baseTile = tileset.getTileIndex(baseTileName);
            return template;
        }
        var X = CT('wall1.png', {walkable: false});
        var f = CT('floor1.png');
        var o = <CellTemplate>{};
        var g = CT('grass1.png', { seen: false });
        var t = CT('grass1.png', { doodadFactory: () => { return new Tree(); }});
        var b = CT('grass1.png', { doodadFactory: () => { return new Bush(); }});
        var r = CT('grass1.png', { doodadFactory: () => { return new Rocks(); }});
        var randomTemplatePicker = new RandomTemplatePicker(
            [ g, t, b, r ],
            [ 50, 2, 1, 1]);
        
        for (var y = 0; y < map.height; ++y) {
            for (var x = 0; x < map.width; ++x) {
                var template = randomTemplatePicker.getRandomTemplate();
                map.applyCellTemplate(template, x, y);
            }
        }
        
        var houseTemplate = new MapTemplate(10, 10, [
            X,X,X,X,X,X,X,X,X,X,
            X,f,f,f,f,f,f,f,f,X,
            X,f,f,f,f,f,f,f,f,X,
            X,f,f,f,f,f,f,f,f,X,
            X,f,f,f,f,f,f,f,f,X,
            X,f,f,f,f,f,f,f,f,X,
            X,X,X,X,f,f,X,X,X,X,
            g,g,g,t,f,f,t,g,g,g,
            g,g,g,t,f,f,t,g,g,g,
            g,g,g,t,f,f,t,g,g,g,
        ]);
        map.applyTemplate(houseTemplate, 30, 20);
        
        while (agents.length < 20 ) {
            var cell = map.randomCell();
            if (!cell.canBeEntered()) {
                continue;
            }
            var agent = new Agent(cell);
            agent.motionSpeed = Math.random() * 0.8 + 0.2;
            agents.push(agent);
        }
// Activates zombie-wonkies:
//        agents[0].skin = new WonkeySkin()
//        agents[0].behaviors = [ new KillBehavior(agents[0]) ];
        
        map.getCell(40, 40).forNeighbours(5, function(cell: MapCell) {
            cell.baseTile = t.baseTile;
            return true;
        });
    }

    function updateWorld() {
        for (var i = 0; i < agents.length; ++i) {
            agents[i].update();
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


