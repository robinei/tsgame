namespace Game {
    export var LOGTAG_ATTRIBUTE: string = "Attribute";
    
    export class AttributeComponent {
        strength:Attribute;
        dexterity:Attribute;
        constitution:Attribute;
        intelligence:Attribute;
        wisdom:Attribute;
        charisma:Attribute;
        
        entity: Entity;
        
        constructor(entity: Entity) {
            this.entity = entity;
        }
        
        update() {
            this.energy.update(50);
            this.enthusiasm.update(-0.5);
            this.community.update(1);
            this.nutrition.update(1);
            this.comfort.update(1);
            if (this.anyPeople(Distance.Close)) {
                this.community.update(-10);
            }
            if (this.anyPeople(Distance.Adjacent)) {
                this.comfort.update(1);
            }
        }
                
        anyPeople(range: Distance): boolean {
            var foundPerson = false;
            this.entity.cell.forNeighbours(range,
                ((self: Agent) =>
                    (cell: MapCell) => {
                        if(cell.agent && cell.agent !== self) {
                            foundPerson = true;
                            return false;
                        }
                        return true;
                    })
                (<Agent> this.entity));
            return foundPerson;
	    }
        
        setAttributes(str:number, dex:number, con:number, int:number, wis:number, cha:number) {
            this.strength = new Attribute(this, "Strength", str);
            this.dexterity = new Attribute(this, "Dexterity", dex);
            this.constitution = new Attribute(this, "Constitution", con);
            this.intelligence = new Attribute(this, "Intelligence", int);
            this.wisdom = new Attribute(this, "Wisdom", wis);
            this.charisma = new Attribute(this, "Charisma", cha);
        }
        
        // Energy regenerates quickly and is used to perform most actions,
        // such as moving, striking, shooting, etc. 
        energy:Health;
        vitality:Health;
        sanity:Health;
        vigour:Health;
        enthusiasm:Health;
        
        setHealth() {
            this.energy = new Health("Energy", this,
                (a) => 0.5 + 0.5 * a.dexterity.getValue());
            this.vitality = new Health("Vitality", this,
                (a) => 0.5 + 0.5 * a.constitution.getValue())
            this.sanity = new Health("Sanity", this,
                (a) => 0.5 + 0.3 * a.wisdom.getValue() + 0.2 * a.intelligence.getValue())
                
            this.vigour = new Health("Vigour", this,
                (a) => 0.4 + 0.2 * a.strength.getValue() + 0.2 * a.dexterity.getValue() + 0.2 * a.constitution.getValue())
            this.enthusiasm = new Health("Enthusiasm", this,
                (a) => 0.4 + 0.2 * a.intelligence.getValue() + 0.2 * a.wisdom.getValue() + 0.2 * a.charisma.getValue())
        }
        
        axe:Skill;
        throwing:Skill;
        social:Skill;
        
        setSkills(axe:number, throwing:number, social:number) {
            this.axe = new Skill("Axe", axe, this,
                (a) => 0.8 * a.strength.getValue() + 0.2 * a.dexterity.getValue())
                
            this.throwing = new Skill("Throwing", throwing, this,
                (a) => 0.2 * a.strength.getValue() + 0.8 * a.dexterity.getValue())
                
            this.social = new Skill("Social", social, this,
                (a) => 0.8 * a.charisma.getValue() + 0.2 * a.wisdom.getValue())
        }
        
        nutrition:Need;
        comfort:Need;
        community:Need;
        curiosity:Need;
        
        setNeeds() {
            this.nutrition = new Need("Nutrition", this,
                (self:Need) => () => {
                    return self.attributes.strength.getValue() + (1-self.attributes.vigour.getValue())/2;
                });
            
            this.comfort = new Need("Comfort", this,
                (self:Need) => () => {
                    return (1-self.attributes.vitality.getValue() + 1-self.attributes.vigour.getValue())/2; 
                });
            
            this.community = new Need("Community", this,
                (self:Need) => () => {
                    return (self.attributes.charisma.getValue() + self.attributes.enthusiasm.getValue())/2;              
                });
                
            this.curiosity = new Need("Curiosity", this,
                (self:Need) => () => {
                    return (self.attributes.intelligence.getValue() + self.attributes.enthusiasm.getValue())/2;
                });
        }
    }
}