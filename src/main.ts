namespace Game {
    var canvas = <HTMLCanvasElement>document.getElementById('canvas');
    var context = canvas.getContext('2d');
    
    map = new Map(80, 50);
    tileset = new Tileset(onTilesLoaded);
    
    var mapDrawer = new MapDrawer(map, tileset);

    function onTilesLoaded() {
        window.onresize = resizeCanvas;
        document.onkeydown = onKeyDown;
        document.onmousemove = onMouseMove;
        generateMap();
        resizeCanvas();
    }

    function onKeyDown() {
        updateWorld();
        drawCanvas(); 
    }
    
    function onMouseMove(e: MouseEvent) {
        console.log(e);
        var cell = mapDrawer.getCellAtClientCoord(e.clientX, e.clientY);
        if (cell == mapDrawer.cursorCell) {
            return;
        }
        mapDrawer.cursorCell = cell;
        drawCanvas();
    }

    function generateMap() {
        function CT(baseTileName: string, template?: CellTemplate) {
            template = template || {};
            template.baseTile = tileset.getTileIndex(baseTileName);
            return template;
        }
        var X = CT('wall1.png', {walkable: false});
        var g = CT('grass1.png');
        var t = CT('grass1.png', {woodValue: 10});
        var f = CT('floor1.png');
        var o = <CellTemplate>{};
        
        for (var y = 0; y < map.height; ++y) {
            for (var x = 0; x < map.width; ++x) {
                var template: CellTemplate;
                if (Math.random() < 0.1) {
                    template = t;
                } else {
                    template = g;
                }
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
        
        while (agents.length < 15) {
            var cell = map.randomCell();
            if (!cell.canBeEntered()) {
                continue;
            }
            var agent = new Agent();
            agent.moveTo(cell);
            agent.motionSpeed = Math.random() * 0.8 + 0.2;
            agent.currentBehavior = Math.random() > 0.5 ? new RandomWalkBehavior() : new FollowWalkBehavior();
            agents.push(agent);
        }
        
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
        mapDrawer.draw(context);
    }
}


