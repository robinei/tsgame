namespace Game {
    var canvas = <HTMLCanvasElement>document.getElementById('canvas');
    var context = canvas.getContext('2d');
    
    map = new Map(80, 50);
    tileset = new Tileset(onTilesLoaded);

    function onTilesLoaded() {
        window.onresize = resizeCanvas;
        document.onkeydown = onKeyDown;
        generateMap();
        resizeCanvas();
    }

    function onKeyDown() {
        updateWorld();
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
            agent.currentBehavior = new RandomWalkBehavior();
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
        
        for (var y = 0; y < map.height; ++y) {
            for (var x = 0; x < map.width; ++x) {
                var cell = map.getCell(x, y);
                if (cell.baseTile >= 0) {
                    context.drawImage(tileset.getTileImage(cell.baseTile), x*TILE_DIM, y*TILE_DIM);
                }
                if (cell.woodValue > 0) {
                    context.drawImage(tileset.getTileImageByName('tree1.png'), x*TILE_DIM, y*TILE_DIM);
                }
                if (cell.agent) {
                    context.drawImage(tileset.getTileImageByName('guy1.png'), x*TILE_DIM, y*TILE_DIM);
                }
            }
        }
        
        var path = map.calcPath(agents[0].getPosition(), new Point(31, 21));
        for (var i = 0; i < path.length; ++i) {
            var p = path[i];
            context.fillStyle = "rgba(255, 255, 255, 0.1)";
            context.fillRect(p.x*TILE_DIM, p.y*TILE_DIM, TILE_DIM, TILE_DIM);
        }
    }
}


