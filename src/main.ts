/// <reference path="Map.ts"/>
/// <reference path="Tileset.ts"/>
/// <reference path="Globals.ts"/>


namespace Game {
    var canvas = <HTMLCanvasElement>document.getElementById('canvas');
    var context = canvas.getContext('2d');
    
    map = new Map(100, 100);
    tileset = new Tileset(onTilesLoaded);

    function onTilesLoaded() {
        window.onresize = resizeCanvas;
        document.onkeydown = onKeyDown;
        generateMap();
        resizeCanvas();
    }

    function onKeyDown() {
        generateMap();
        drawCanvas(); 
    }

    function generateMap() {
        var X = <CellTemplate>{baseTile: tileset.getTileIndex('wall1.png'), walkable: false};
        var g = <CellTemplate>{baseTile: tileset.getTileIndex('grass1.png')};
        var t = <CellTemplate>{baseTile: tileset.getTileIndex('tree1.png'), woodValue: 10};
        var f = <CellTemplate>{baseTile: tileset.getTileIndex('floor1.png')};
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
                if (cell.baseTile < 0) {
                    continue;
                }
                context.drawImage(tileset.getTileImage(cell.baseTile), x*TILE_DIM, y*TILE_DIM);
            }
        }
    }
}


