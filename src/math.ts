namespace Game {
    export class Point {
        x: number;
        y: number;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
        
        equals(p: Point): boolean {
            if (!p) {
                return false;
            }
            return this.x === p.x && this.y === p.y;
        }

        distanceTo(p: Point) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        direction(): Direction {
            var dx = sigNum(this.x);
            var dy = sigNum(this.y);
            for (var i = 0; i < 8; ++i) {
                if (dirDX[i] == dx && dirDY[i] == dy) {
                    return i;
                }
            }
            return undefined;
        }
        
        sub(p: Point): Point {
            return new Point(this.x - p.x, this.y - p.y);
        }
        
        add(p: Point): Point {
            return new Point(this.x + p.x, this.y + p.y);
        }

        dirVector(dir: Direction) {
            return [dirDX[dir], dirDY[dir]];
        }
    }

    export class Rect {
        x: number = 0;
        y: number = 0;
        width: number = 0;
        height: number = 0;
        
        x1() : number {
            return this.x + this.width;
        }
        y1() : number {
            return this.y + this.height;
        }
        
        getPosition(): Point {
            return new Point(this.x, this.y);
        }
        
        constructor(x: number, y: number, width: number, height: number) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        
        intersects(r: Rect): boolean {
            return !(r.x > this.x1() || 
                     r.x1() < this.x || 
                     r.y > this.y1() ||
                     r.y1() < this.y);
        }
    }

    export function sigNum(num: number): number {
        if (num < 0) {
            return -1;
        }
        if (num > 0) {
            return 1;
        }
        return 0;
    }

    export type Vector = Point;
    
    export function interpolate(a:number, b:number, t:number) {
        return a * (1-t) + b * t;
    }
}
