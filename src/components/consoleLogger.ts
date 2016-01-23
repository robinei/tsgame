namespace Game {
        
    export class ConsoleLogger {
        enabledTags: Array<string> = [];
        entity: Entity;
        
        constructor(entity: Entity) {
            this.entity = entity;
        }

        log(tag: string, message: string) {
            if (this.isEnabled(tag)) {
                console.info(message);
            }
        }

        isEnabled(tag: string): boolean {
            return this.enabledTags.indexOf(tag) >= 0;
        }
        
        setEnabled(enable: boolean, ...tags: string[]) {
            for (var i = 0; i < tags.length; ++i) {
                this.doSetEnabled(enable, tags[i]);
            }
        }
                
        private doSetEnabled(enable: boolean, tag: string) {
            if (enable) {
                if (this.isEnabled(tag)) {
                    return;
                }
                this.enabledTags.push(tag);
            } else {
                removeFromArray(this.enabledTags, tag);
            }
        }
    }
}