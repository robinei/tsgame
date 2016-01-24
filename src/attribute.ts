namespace Game {
    export class Attribute {
        displayName: string;
        value: number = 0.5;
        increase: (n: number) => void;
        decrease: (n: number) => void;
        /** Returns the actual change in value */
        update: (n:number) => number;
        updateBonus: () => number;
        attributes: AttributeComponent;
                
        constructor(a: AttributeComponent, name: string, val?: number, updateBonus?: ()=> number) {
            this.attributes = a;
            this.displayName = name;
            this.value = val;
            this.updateBonus = updateBonus || (() => 0);
            
            this.update = (n: number)  => {
                var newVal = this.change(this.value, this.updateBonus(), n);
                var diff = newVal - this.value;
                this.attributes.entity.log(LOGTAG_ATTRIBUTE,
                    this.displayName + " " + this.value.toPrecision(3) + " -> " + newVal.toPrecision(3));
                this.value = newVal;
                return diff;
            }
        }
        
        getValue(): number {
            return this.value;
        }
        
        change(value:number, bonus:number, n:number):number {
            return Math.max(0, Math.min(1, value + 0.01 * (1 + bonus) * n));
        }  
        
        toString():string {
            return this.displayName + ': ' + this.getValue().toPrecision(3);
        }
        
        getLogName(): string {
            return this.displayName.toLowerCase();
        }
    }
    
    export class Health extends Attribute {
        constructor(name:string, a:AttributeComponent, baseCalc: (a: AttributeComponent) => number) {
            super(a, name, baseCalc(a));
        }
    }
    
    export class Skill extends Attribute {
        attrCalc: (a: AttributeComponent) => number;
        constructor(name:string, v:number, a:AttributeComponent, c: (a: AttributeComponent) => number) {
            super(a, name, v);
            this.attrCalc = c;
        }
        getValue() {
            return interpolate(this.attrCalc(this.attributes), this.value, this.value);
        }
    }
    
    export class Need extends Attribute {
        constructor(name:string, a:AttributeComponent, updateBonus?: (self: Need) => () => number) {
            super(a, name, 0, updateBonus ? updateBonus(this) : null);
        }
        getValue() {
            return this.value;
        }
        getLogName(): string {
            return super.getLogName() + " need";
        }
    }
}