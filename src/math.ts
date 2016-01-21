namespace Game {
    export class Point {
        x: number;
        y: number;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
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
}
