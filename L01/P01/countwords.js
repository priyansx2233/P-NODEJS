export function countwords(text,limit){
   if (typeof text !== "string") {
    throw new TypeError("text must be a string");
}
    if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
    throw new RangeError("limit must be a positive integer");   
    }
    if(text.length==0 || text.trim().length==0){
        return [];
    }
    const x = text.toLowerCase();
    const words = x.match(
    /[\p{L}\p{N}_]+(?:['’][\p{L}\p{N}_]+)*/gu
);
    if(!words){
        return [];
    }
    const frequency = new Map();
    for(const word of words){
        frequency.set(word,(frequency.get(word)||0)+1);
    }
    const result = Array.from(frequency.entries());
    result.sort((a, b) => {
    if (b[1] !== a[1]) {
        return b[1] - a[1];
    }

    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
});
    return limit === undefined ? result : result.slice(0, limit);
}