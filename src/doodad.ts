namespace Game {
    
    export enum ResourceType{
        Berry,
        Wood,
        Rock
    }

    export class Doodad implements Entity {
        cell: MapCell = null;
        tileImage: HTMLImageElement = null;
        hitPoints = 10

        tryHarvest() {
            this.hitPoints--;

            if (this.hitPoints < 0) {
                this.cell.doodad = null
                return false;
            }

            return true;
        }
    }
    
    export class Resource extends Doodad {
        resourceType: ResourceType;
    }
    
    export class Tree extends Resource {
        constructor() {
            super();
            this.resourceType = ResourceType.Wood;
            this.tileImage = tileset.getTileImageByName('tree1.png');
        }
    }
    
    export class Bush extends Resource {
        constructor() {
            super();
            this.resourceType = ResourceType.Berry;
            this.tileImage = tileset.getTileImageByName('bush1_with_berries.png');
        }
    }
    
    export class Rocks extends Resource {
        constructor() {
            super();
            this.resourceType = ResourceType.Rock;
            this.tileImage = tileset.getTileImageByName('rocks1.png');
        }
    }
    
    export class Campfire extends Doodad {

        fuelCount: number;
        private lit: boolean;
        
        constructor(cell: MapCell) {
            super();
            this.tileImage = tileset.getTileImageByName('campfire_off.png');
            this.fuelCount = 10;
            this.cell = cell;
        }
        
        isLit(): boolean {
            return this.lit;
        }
        
        lightFire() {
            this.tileImage = tileset.getTileImageByName('campfire_on0.png');
            this.lit = true;
        }
    }
}
