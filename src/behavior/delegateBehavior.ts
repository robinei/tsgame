//delegateBehavior(insight, needs.Where(value > needs.max / 2).count) => 
namespace Game {
    export class delegateBehavior extends Behavior {
        calcUrgency():number {
            return this.agent.attributes.insight.getValue() * (this.agent.needs);
        }
        update() {
            
        }
    }
}