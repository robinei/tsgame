namespace Game {
    export const TILE_DIM: number = 16;
    
    export var map: Map;
    export var tileset: Tileset;
    export var agents: Array<Agent> = [];
    export var rangeSight = 5;
    export var storageCell: MapCell;
    export var agentCount = 1;
}
