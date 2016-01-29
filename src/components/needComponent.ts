namespace Game {
    export interface StatComponent {
        
    }
    
    export interface Stat {
        getValue():number;
    }
    
    export class Need implements Stat {
        displayName: string;
        value: number = 0.0;
        update: (n:number) => void;
         
        constructor(name:string) {
            this.displayName = name;
            
            this.update = (n: number)  => {
                this.value = Need.change(this.value, n);
            }
        }
        
        getValue(): number {
            return this.value;
        }
        
        private static change(value:number, n:number):number {
            return Math.max(0, Math.min(1, value + 0.01 * n));
        }  
        
        toString():string {
            return this.displayName + ': ' + this.getValue();
        }
    }
    
    export class NeedComponent extends Object{
        //Basic needs:
        food:Need = new Need("Food");
        water:Need = new Need("Food");
        sleep:Need = new Need("Food");
        
        //Secondary needs:
        shelter:Need = new Need("Food");
        clothing:Need = new Need("Food");
        comfort:Need = new Need("Food");
        
        //Tertiary needs:
        community:Need = new Need("Food");
        success:Need = new Need("Food");
        control:Need = new Need("Food");
                
        asArray(): Array<Need> {
            var self = this;
            
            var list = []
            for (var property in this) {
                if (property instanceof Need){
                    list.push(property);
                } 
            }
            
            return this.names.map((value:string) => {
                var n:Need = self[value];
                return n;
            });
        }
        
        getNHighest(n:number): Array<Need> {
            return this.asArray().sort((n) => n.getValue()).slice(0, n);
        }
    }
}