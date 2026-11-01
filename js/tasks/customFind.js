(function () {
    "use strict";

    const find = (arr, fn) => {
        for (let i = 0; i < arr.length; i++) if (fn(arr[i], i, arr)) return arr[i];
        return undefined;
    };

    const arr = [{ id: 1, name: "A" }, { id: 2, name: "B" }];
    console.assert(
        JSON.stringify(find(arr, (x) => x.id === 2)) === JSON.stringify({ id: 2, name: "B" }),
        "find: found");
    console.assert(find(arr, (x) => x.id === 99) === undefined, "find: not found");
    console.assert(find([], () => true) === undefined, "find: empty");

    console.log("customFind OK");
})();