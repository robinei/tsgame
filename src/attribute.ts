namespace Game {
    export class Attribute {
        displayName: string;
        value: number = 0.5;
        increase: (n: number) => void;
        decrease: (n: number) => void;
        update: (n:number) => void;
        updateBonus: () => number;
                
        constructor(name: string, val?: number, updateBonus?: ()=> number) {
            this.displayName = name;
            this.value = val;
            this.updateBonus = updateBonus || (() => 0);
            
            this.update = (n: number)  => {
                this.value = this.change(this.value, this.updateBonus(), n);
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
        constructor(name:string, a:AttributeComponent, updateBonus?: (self: Need) => () => number) {
            this.attributes = a;
            super(name, 0, updateBonus ? updateBonus(this) : null);
        }
        getValue() {
            return this.value;
        }
    }
}