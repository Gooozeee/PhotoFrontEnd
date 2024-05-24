export function splitArray<T>(array: T[], numberOfParts: number): T[][] {
    const lengthOfArray = array.length;
    const partSize = Math.floor(lengthOfArray / numberOfParts);
    const remainder = lengthOfArray % numberOfParts;
    
    const parts: T[][] = [];
    let startIndex = 0;
    
    for (let i = 0; i < numberOfParts; i++) {
        const endIndex = startIndex + partSize + (i < remainder ? 1 : 0);
        parts.push(array.slice(startIndex, endIndex));
        startIndex = endIndex;
    }
    
    return parts;
}
