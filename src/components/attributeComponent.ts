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
    
    export class AttributeComponent {
        strength:Attribute;
        dexterity:Attribute;
        constitution:Attribute;
        intelligence:Attribute;
        wisdom:Attribute;
        charisma:Attribute;
        
        setAttributes(str:number, dex:number, con:number, int:number, wis:number, cha:number) {
            this.strength = new Attribute("Strength", str);
            this.dexterity = new Attribute("Dexterity", dex);
            this.constitution = new Attribute("Constitution", con);
            this.intelligence = new Attribute("Intelligence", int);
            this.wisdom = new Attribute("Wisdom", wis);
            this.charisma = new Attribute("Charisma", cha);
        }        
    }
}