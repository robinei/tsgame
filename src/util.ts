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
}