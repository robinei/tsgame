namespace Game {
    export class Point {
        x: number;
        y: number;
        
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
        
        distanceTo(p: Point){
            var dx = this.x - p.x;
            var dy = this.y - p.y;
            return Math.sqrt(dx*dx + dy*dy);
        }
    }
}
