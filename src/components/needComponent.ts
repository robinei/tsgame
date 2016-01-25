namespace Game {
    export interface StatComponent {
        
    }
    
    export interface Stat {
        getValue():number;
    }
    
    export class Need implements Stat {
        displayName: string;
        value: number = 0.0;
        increase: (n: number) => void;
        decrease: (n: number) => void;
        update: (n:number) => void;
        updateBonus: () => number;
        component:NeedComponent
         
        constructor(name:string, c:NeedComponent, ...args: ((c: NeedComponent) => number)[] ) {
            this.component = c;
            this.displayName = name;
            this.updateBonus = () => avg.apply(null, args.map((v)=>v(this.component)));
            
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
    
    export class NeedComponent {
        attributes:AttributeComponent;
        health:HealthComponent;
        skills:SkillComponent;
        
        //Basic needs:
        food:Need;
        water:Need;
        sleep:Need;
        
        //Secondary needs:
        shelter:Need;
        clothing:Need;
        comfort:Need;
        
        //Tertiary needs:        
        community:Need;
        success:Need;
        control:Need;
        
        setNeeds() {
            this.food = new Need("Food", this, (c:NeedComponent) => c.attributes.strength.getValue(), (c:NeedComponent) => 1-c.health.vigour.getValue());
            
            this.comfort = new Need("Comfort", this, (c:NeedComponent) => 1-c.health.vitality.getValue(), (c:NeedComponent) => 1-c.health.vigour.getValue());
            
            this.community = new Need("Community", this, (c:NeedComponent) => c.attributes.charisma.getValue(), (c:NeedComponent) => c.health.enthusiasm.getValue());
                
            this.curiosity = new Need("Curiosity", this, (c:NeedComponent) => c.attributes.intelligence.getValue(), (c:NeedComponent) => c.health.enthusiasm.getValue());
        }
        
        addNeed(name: string, ...args: string[]) {
            var dependencies = args.map(
                (value: string) => {
                    var path = value.split('.');
                    var componentName: string = path[0];
                    var statName: string = path[1];
                    var methodName: string = path[2];
                    
                    return (c: NeedComponent):number => {
                        var component: StatComponent = c[componentName];
                        var stat: Stat = component[statName];
                        var method: (() => number) = stat[methodName];
                        return method();
                    };
                }
            );
            
            var need:Need = new (Need.bind.apply(null, [].concat([name, this]).concat(dependencies)));
            this[name.toLowerCase()] = need;
        }
        
        asArray(): Array<Need> {
            return [this.food, this.water, this.shelter];
        }
        
        toString():string[] {
            return this.asArray().map((value: Need) => value.toString());
        }
    }
}