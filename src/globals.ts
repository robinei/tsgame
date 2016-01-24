namespace Game {
    export const TILE_DIM: number = 16;
    
    export var map: Map;
    export var tileset: Tileset;
    export var agents: Array<Agent> = [];
    export var storageCell: MapCell;
    export var doodads: Array<Doodad> = [];
    export var buildings: Array<Building> = [];
    export var eventManager: EventManager;
}
