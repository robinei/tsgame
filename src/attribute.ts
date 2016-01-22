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
                this.value = this.change(this.value, 0, -n);
            }
            
            this.decrease = (n: number) => {
                this.value = this.change(this.value, 0, n);
            }
        }
        
        getValue(): number {
            return this.value;
        }
        
        change(value:number, bonus:number, n:number):number {
            return Math.max(0, Math.min(1, value + 0.01 * (1 + bonus) * n));
        }  
        
        toString():string {
            return this.displayName + ': ' + this.getValue();
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