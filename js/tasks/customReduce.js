(function () {
    "use strict";

    const reduce = (arr, fn, initial) => {
        let acc = initial;
        for (let i = 0; i < arr.length; i++) acc = fn(acc, arr[i], i, arr);
        return acc;
    };

    const reduceNoInit = (arr, fn) => {
        if (arr.length === 0) throw new TypeError("Reduce of empty array with no initial value");
        let acc = arr[0];
        for (let i = 1; i < arr.length; i++) acc = fn(acc, arr[i], i, arr);
        return acc;
    };

    const arr = [1, 2, 3, 4];
    const sum = (a, b) => a + b;

    console.assert(reduce(arr, sum, 0)   === 10,  "reduce: initial 0");
    console.assert(reduce(arr, sum, 100) === 110, "reduce: initial 100");
    console.assert(reduce([], sum, 42)   === 42,  "reduce: empty with initial");
    console.assert(reduceNoInit(arr, sum) === 10, "reduce: no initial");
    console.assert(JSON.stringify(arr) === JSON.stringify([1,2,3,4]), "reduce: input mutated");

    console.log("customReduce OK");
})();