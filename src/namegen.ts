namespace Game {
    
    var nameStartLetters = 'bdfghklmprstv';
    var nameStartCombos = ['st', 'tr'];
    var nameMiddleLetters = 'bdklmnprstv';
    var nameMiddleCombos = ['gn', 'sk', 'rk', 'rt'];
    var nameVowels = 'aeiou';
    var nameVowelStartCombo = ['au', 'ei', 'øy'];
    
    export function getRandomString(length: number): string {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
    
    function capitalizeFirstLetter(orgString): string {
        return orgString.charAt(0).toUpperCase() + orgString.slice(1);
    }
    
    function getRandomFrom(letters: string, combos: string[]) {
        var index = Math.floor(Math.random() * (letters.length + combos.length));
        if (index < letters.length) {
            return letters[index];
        }
        return combos[index - letters.length];
    }
    
    export function getRandomName(): string {
        var name = '';
        var forceMiddle = false;
        if (Math.random() < 0.7) {
            name = getRandomFrom(nameStartLetters, nameStartCombos);
        } else {
            forceMiddle = true;
        }
        name += getRandomFrom(nameVowels, nameVowelStartCombo);
        if (forceMiddle || Math.random() < 0.7) {
            name += getRandomFrom(nameMiddleLetters, nameMiddleCombos)
                + getRandomFrom(nameVowels, []);
            if (Math.random() < 0.5) {
                name += getRandomFrom(nameMiddleLetters, []);
            }
        }
        return capitalizeFirstLetter(name);
    }
    
    export function getPossessive(noun: string) {
        if (!noun || noun.length == 0) {
            return '';
        }
        if (noun[noun.length - 1] == 's') {
            return noun + "'";
        }
        return noun + "'s";
    }
    
    class advancedNameGen {
        consonantSequenceLeading(input:string):string{
            switch(input){
                case 'b': return 'hjlrw';
                case 'c': return 'hlr';
                case 'd': return 'hjrvw';
                case 'f': return 'hjlnr';
                case 'g': return 'hjlnr';
                case 'h': return 'jlrv';
                case 'j': return '';
                case 'k': return 'jlnrv';
                case 'l': return 'jlw';
                case 'm': return '';
                case 'n': return '';
                case 'p': return 'fhjlnrsz';
                case 'q': return 'wl';
                case 'r': return 'j';
                case 's': return 'chjklmnpqtvwz';
                case 't': return 'hjrsvw';
                case 'v': return 'r';
                case 'w': return 'hr';
                case 'x': return 'c';
                case 'z': return 'h';
                default: return '';
            }
        } 
        consonantSequenceAfterVowel(input:string):string{
            switch(input){
                case 'b': return 'bdhjlr';
                case 'c': return 'chlkr';
                case 'd': return 'dhjrw';
                case 'f': return 'fhjlnr';
                case 'g': return 'hjglnr';
                case 'h': return 'jlrv';
                case 'j': return '';
                case 'k': return 'jklnrv';
                case 'l': return 'bcdfghjlkmnpqstvw';
                case 'm': return 'm';
                case 'n': return 'n';
                case 'p': return 'fhjlnrsz';
                case 'q': return '';
                case 'r': return 'bcdfghjkmnprstvwx';
                case 's': return 'chjklmnpqtvwz';
                case 't': return 'hjrsvw';
                case 'v': return 'r';
                case 'w': return 'hr';
                case 'x': return 'c';
                case 'z': return '';
                default: return '';
            }
        }
        
        vowelSequence(input:string):string{
            switch(input){
                case 'a': return '';
                case 'e': return '';
                case 'i': return '';
                case 'o': return '';
                case 'u': return '';
                case 'y': return '';
                
                case 'æ': return '';
                case 'ø': return '';
                case 'å': return '';
                
                case 'ä': return '';
                case 'ë': return '';
                case 'ï': return '';
                case 'ö': return '';
                case 'ü': return '';
                
                case 'à': return '';
                case 'è': return '';
                case 'ì': return '';
                case 'ò': return '';
                case 'ù': return '';
                default: return '';
            }
        } 
    }
}