namespace Game {
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
        
        vitality:Health;
        sanity:Health;
        vigour:Health;
        enthusiasm:Health;
        
        setHealth() {
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
                (self:Need) => (n:number) => {
                    var stat = self.attributes.strength.getValue() + (1-self.attributes.vigour.getValue())/2;
                    
                    self.value = 1 - self.change(1 - self.value, stat, n); 
                },
                (self:Need) => (n:number) => {
                    var stat = self.attributes.strength.getValue();
                    
                    self.value =  self.change(self.value, n, -stat);
                });
            
            this.comfort = new Need("Comfort", this,
                (self:Need) => (n:number) => {
                    var stat = (1-self.attributes.vitality.getValue() + 1-self.attributes.vigour.getValue())/2;
                    
                    self.value = 1 - self.change(1 - self.value, stat, n); 
                },
                (self:Need) => (n:number) => {
                    var stat = self.attributes.vigour.getValue();
                    
                    self.value = self.change(self.value, stat, -n);                    
                });
            
            this.community = new Need("Community", this,
                (self:Need) => (n:number) => {
                    var stat = (self.attributes.charisma.getValue() + self.attributes.enthusiasm.getValue())/2;
                    
                    self.value = self.change(self.value, stat, n);              
                },
                (self:Need) => (n:number) => {
                    var stat = self.attributes.social.getValue();
                    
                    self.value = self.change(self.value, stat, -n);  
                });
                
            this.curiosity = new Need("Curiosity", this,
                (self:Need) => (n:number) => {
                    var stat = (self.attributes.intelligence.getValue() + self.attributes.enthusiasm.getValue())/2;
                    
                    self.value = self.change(self.value, stat, n);              
                },
                (self:Need) => (n:number) => {
                    var stat = self.attributes.wisdom.getValue();
                    
                    self.value = self.change(self.value, stat, -n);  
                });
        }
    }
}