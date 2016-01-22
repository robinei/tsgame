namespace Game {
    export function getObjectName(object): string { 
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(object.constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    }
    
    export function toBoolean(parameter: any) {
        if(parameter) {
            return true;
        }
        return false;
    }
    
    export function valueOrDefault<T>(val: T, def: T): T {
       if (val === undefined) {
           return def;
       }
       return val;
    }
    
    // only removes one value
    export function removeFromArray<T>(array: Array<T>, value: T): boolean {
        var i = array.indexOf(value);
        if (i < 0) {
            return false;
        }
        array.splice(i, 1);
        return true;
    }
    
    // Fisher-Yates
    export function shuffleArray<T>(array: Array<T>): void {
        var currentIndex = array.length;
        var temporaryValue: T;
        var randomIndex: number;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    }
}
