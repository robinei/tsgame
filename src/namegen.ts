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
    
    class Name {        
        private name: string = "";
        
        constructor(){
            //initialize name with a syllable
        }
        
        addSyllable():Name {
            var syllable = new Syllable();
            
            switch (Math.floor(Math.random()*5)) {
                case 0: syllable.addConsonant().addConsonant().addVowel()
                case 1: syllable.addConsonant().addConsonant().addVowel().addConsonant()
                case 2: syllable.addConsonant().addVowel()
                case 3: syllable.addConsonant().addVowel().addConsonant()
                case 4: syllable.addConsonant().addConsonant().addVowel()
            }
            
            this.name += syllable;
            return this;
        }
    }
    class Syllable {
        characters: string = "";
        private vowels: string = "aeiouyæøå";
        private consonants: string = "bcdfghjklmnpqrstv" 
                
        addVowel(chance: number = 1):Syllable {
            this.characters += Syllable.pickLetter(this.vowels, chance);
            return this;
        }
        
        addConsonant(chance: number = 1):Syllable {
            var source = null;
            var indexOfLastChar = this.characters.length-1;
            if(this.characters.length==0 || this.vowels.indexOf(this.characters[indexOfLastChar]) != -1){
                source = this.consonants;
            }
            else if (this.characters.length==1){
                source = Syllable.consonantSequenceLeading(this.characters);
            }
            else if (this.vowels.indexOf(this.characters[indexOfLastChar-1]) != -1) {
                source = Syllable.consonantSequenceAfterVowel(this.characters[indexOfLastChar]);
            }
            else {
                return this;
            }
            this.characters += Syllable.pickLetter(source, this.consonants.length);
            return this;
        }
        
        private static pickLetter(source: string, chance: number = 1):string {
            if(Math.random() > chance) {
                return '';
            }
            var v = Math.floor(Math.random() * source.length);
            return source[v];
        }
        
        private static consonantSequenceLeading(input:string):string{
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
        
        private static consonantSequenceAfterVowel(input:string):string{
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
    }
}