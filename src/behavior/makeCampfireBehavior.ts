namespace Game {
        
    /*
    export class GetStoredItemsBehavior extends Behavior {
        
        cellWithItem: MapCell;
        
        constructor(agent: Agent, public itemType: InventoryItemType, public itemCount: number) {
            super(agent);
            this.itemType = itemType;
            this.itemCount = itemCount;
        }
        
        findCellWithItems(): MapCell {
            var foundCell;
            this.agent.cell.forNeighbours(30, function(cell: MapCell) {
                if (HasItemOfType(cell, this.itemType)) {
                    foundCell = cell;
                    return false;
                }
                return true;
             });

             return foundCell;
        }
        
        calcUrgency(): number {
            if (GetItemOfTypeCount(this.agent, this.itemType) >= this.itemCount) {
                return 0;
            }
            if (!this.updateCellWithItem()) {
                return 0;
            }
            return 0.99;
        }
        
        updateCellWithItem(): boolean {
            this.cellWithItem = this.findCellWithItems();
            return toBoolean(this.cellWithItem);
        }
        
        update() {
            if (!this.agent.cell) {
                return;
            }

            var desiredItemCount = this.itemCount - GetItemOfTypeCount(this.agent, this.itemType);
            var availableItemCount = GetItemOfTypeCount(this.agent.cell, this.itemType);
            var takeItemCount = Math.min(desiredItemCount, availableItemCount);
            if (takeItemCount > 0) {
                //console.debug("Taking items");
                for (; takeItemCount > 0; --takeItemCount) {
                    var item = RemoveItemOfType(this.agent.cell, this.itemType);
                    this.agent.cell.putItem(item);
                    //console.debug("Picking up item " + item);
                }
                return;
            }
            
            if (!this.updateCellWithItem()) {
                //console.log("No cell with wood");
                return;
            }
            
            var path = map.calcPath(this.agent.cell.getPosition(), this.cellWithItem.getPosition(), false);
            if (path.length > 1) {
                var cell = map.getCellForPoint(path[1]);
                if (cell.canBeEntered()) {
                    //console.debug("Moving to storage point : " + cell.getPosition() + " s : ")
                    this.agent.moveTo(cell);
                }
            } else {
                //console.debug("Strange path in campfire behavior");
            }
        }        
    }
    */
    
    export class MakeCampfireBehavior extends ActionBehavior {        
        campfire: Campfire;
        delegateBehavior: ActionBehavior;
    
        findClosestCampfire(): Campfire {
            var campfire;
            this.entity.cell.forNeighbours(30, function(cell: MapCell) {
                if (cell != null && cell.doodad instanceof Campfire) {
                    campfire = cell.doodad;
                    return false;
                }
                return true;
             });

             return campfire;
        }
        
        updateCampfire(): boolean {
            this.campfire = this.findClosestCampfire();
            if (this.campfire) {
                this.entity.log(LOGTAG_BEHAVIOR, "found campfire");
            }
            return toBoolean(this.campfire);
        }
        
        hasWood(): boolean {
            return this.entity.inventory.hasItemOfType(InventoryItemType.Wood);
        }
        
        predict(requirements: Array<Outcome>): Array<Outcome> {
            return arrayWhere(requirements,
                (r: Outcome) => {
                    if (r instanceof StatChanged) {
                        // TODO(audun) see random walk predict 
                        return r.attribute.displayName == "Nutrition"
                            && r.amount < 0;
                    } 
                    return false;
                });
        }
        
        reconfigure() {
            // Behavior is the same no matter what the requirements are
        }
        
        isSuitableCampfirePlace(cell: MapCell): boolean {
            if (!cell.canBeEntered() && this.entity.cell !== cell) {
                return false;
            }
            var retval = true;
            cell.forNeighbours(Distance.Adjacent, cell => {
                if (cell.doodad) {
                    retval = false;
                    return false;
                } 
                return true;
            });
            return retval;
        }
        
        isAdjacentToCellWithUnlitCampfire(): boolean {
            var retval = false;
            this.entity.cell.forNeighbours(Distance.Adjacent, (cell) => {
                if (cell.doodad instanceof Campfire) {
                    retval = true;
                    return false;
                }
                return true;
            });
            return retval;
        }
        
        pickNewAction() {
            // Event sequence from nothing
            // HarvestBehavior
            // - MoveToPoint
            // - Strike Tree
            // - TakeItems Cell Wood
            // MakeCampfireBehavior
            // - MoveToPoint
            // - GiveItems Cell Wood
            // - Ignite Campfire
            
            this.updateCampfire();
            
            if (this.isAdjacentToCellWithUnlitCampfire()) {
                this.setAction(new IgniteAction(this.entity, this.entity.cell.doodad));
                return;
            }
            
            map.cells.
            if 
            
            
            if (!this.hasWood()) {
                // TODO
                return;
            }
            if (!this.isSuitableCampfirePlace(this.entity.cell)
                // TODO
                return;
            }
            
            this.setAction(new )
            var nearbyEnterableCells = new Array<MapCell>();
            this.entity.cell.forNeighbours(Distance.Medium, function(cell: MapCell) {
                if (cell.canBeEntered()) {
                    nearbyEnterableCells.push(cell);
                }
                return true;
            });
            if (nearbyEnterableCells.length == 0) {
                return;
            }
            var index = Math.floor(Math.random() * nearbyEnterableCells.length);
            var agent = <Agent> this.entity;
            var action = new MoveToPointAction(agent, Distance.Zero);
            action.setTarget(nearbyEnterableCells[index].getPosition());
            action.displayName = "went for a walk";
            var self = this;
            action.onReachedTarget = (action: Action) => {
                var entity = action.entity;
                return new Event(action, entity.cell, entity);
            };
            this.setAction(action);
        }
    }
    /*        
        campfire: Campfire;
        getStoredWoodBehavior: Behavior;
        harvestWoodBehavior: Behavior;
        delegateBehavior: Behavior;

        constructor(agent: Agent) {
            super(agent);
            this.getStoredWoodBehavior = new GetStoredItemsBehavior(
                agent, InventoryItemType.Wood, 2);
            this.harvestWoodBehavior = new HarvestBehavior(agent);
        }
        
        reset() {
            this.campfire = null;
            this.getStoredWoodBehavior.reset();
            this.harvestWoodBehavior.reset();
        }
        
        calcUrgency(): number {
            // TODO use sub-behaviours to get the max urgency
            if (agents[0] !== this.agent) {
                return 0;
            }
            if (this.updateCampfire()) {
                //console.debug("Found campfire");
                if (this.campfire.isLit()) {
                    return 0;
                } else {
                    return 9;
                }
            } else {
                //console.debug("No campfire");
            }
            this.delegateBehavior =  null;
            var urgency = this.getStoredWoodBehavior.calcUrgency();
            if (urgency > 0) {
                this.delegateBehavior = this.getStoredWoodBehavior;
                return 8 + Math.min(1.0, urgency + 0.1);
            }
            urgency = this.harvestWoodBehavior.calcUrgency();
            if (urgency > 0) {
                this.delegateBehavior = this.harvestWoodBehavior;
                return 8 + Math.min(1.0, urgency + 0.1);
            }
            return 9;
        }
        
        update() {
            this.agent.log(LOGTAG_BEHAVIOR, "making campfire");
            if (this.delegateBehavior) {
                //console.debug("campfire delegate to " + typeof(this.delegateBehavior));
                this.delegateBehavior.update();
                return;
            }
            
            if (toBoolean(this.campfire) && !this.campfire.isLit()) {
                this.agent.log(LOGTAG_BEHAVIOR, "lighting campfire");
                if (this.campfire.cell === this.agent.cell) {
                    this.campfire.lightFire();
                    return;
                }
                var moveAction = new MoveToPointAction(this.agent, Distance.Zero);
                moveAction.setTarget(this.campfire.cell.getPosition());
                moveAction.step();
                return;
            }
            
            if (this.agent.cell.doodad) {
                for (var tries = 0; tries < 10; ++tries) {
                    var direction = Math.floor(Math.random() * 8);
                    var cell = this.agent.cell.getNeighbour(direction);
                    if (cell && cell.canBeEntered()) {
                        this.agent.moveTo(cell);
                        break;
                    }
                }
                return;
            }
            
            if (this.hasWood()) {
                //console.log("making campfire");
                this.agent.removeNextOfType(InventoryItemType.Wood);
                this.agent.cell.doodad = new Campfire(this.agent.cell);
            }
            
            
        }

    }
    */
}