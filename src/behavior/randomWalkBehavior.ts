namespace Game {
    export class RandomWalkBehavior extends Behavior {
        urgency(agent: Agent):number {
            return agent.stressed;
        }
        
        update(agent: Agent) {
            if (!agent.cell) {
                return;
            }
            if (!agent.canMoveNow()) {
                return;
            }
            for (var tries = 0; tries < 10; ++tries) {
                var direction = Math.floor(Math.random() * 8);
                var cell = agent.cell.getNeighbour(direction);
                if (cell && cell.canBeEntered()) {
                    agent.moveTo(cell);
                    break;
                }
            }
            agent.restless++;
            agent.stressed = Math.max(0, agent.stressed-2);
        }
    }
}