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
}