export function isEquivalent(a, b) {
    if (!a || !b) return false;

    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function CheckWord(Word: string, BlackList: string[]) {
    let word = Word.toLowerCase();
    if (word.charAt(word.length - 1) === 's') {
        word = word.substring(0, word.length - 1);        
    }
    for (const WordForbidden of BlackList) {
        if (word === WordForbidden) return true;
    }
    return false;
}