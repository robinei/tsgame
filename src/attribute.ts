namespace Game {
    export class Attribute {
        displayName: string;
        value: number = 0.5;
        increase: (n: number) => void;
        decrease: (n: number) => void;
                
        constructor(name:string, val?:number) {
            this.displayName = name;
            this.value = val;
            
            this.increase = (n: number)  => {
                var potential = 1-this.value;             
                this.value = 1 - potential * this.scale(potential, n);
            }
            
            this.decrease = (n: number) => {            
                this.value *= this.scale(this.value, n);
            }
        }
        
        getValue(): number {
            return this.value;
        }
                
        scale(value: number, n: number, b?:number, r?:number):number {
            var base = b || 0.75;
            var range = r || 0.2;
            var multiplier = base + range * (1-value);
            return Math.pow(multiplier, n); 
        }
    }
    
    export class Health extends Attribute {
        attributes:AttributeComponent;
        constructor(name:string, a:AttributeComponent, baseCalc: (a: AttributeComponent) => number) {
            super(name, baseCalc(a));
        }
    }
    
    export class Skill extends Attribute {
        attributes:AttributeComponent;
        attrCalc: (a: AttributeComponent) => number;
        constructor(name:string, v:number, a:AttributeComponent, c: (a: AttributeComponent) => number) {
            super(name, v);
            this.attributes = a;
            this.attrCalc = c;
        }
        getValue() {
            return interpolate(this.attrCalc(this.attributes), this.value, this.value);
        }
    }
    
    export class Need extends Attribute {
        attributes:AttributeComponent;
        constructor(name:string, a:AttributeComponent,
            inc?: (self:Need) => (n: number) => void,
            dec?: (self:Need) => (n: number) => void) {
            super(name, 0);
            this.attributes = a;
            if (inc) {
                this.increase = (inc(this));
            }
            if (dec) {
                this.decrease = (dec(this));
            }
        }
        getValue() {
            return this.value;
        }
    }
}