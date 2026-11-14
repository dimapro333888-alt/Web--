(function () {
    // БЕЗ "use strict"

    console.group("strict-off.js (sloppy mode)");

    const check = (label, fn) => {
        try { console.log(label, ">", fn()); }
        catch (e) { console.log(label, ">", `${e.name}: ${e.message}`); }
    };

    check("undeclared variable", () => { undeclared = 1; return undeclared; });
    check("this in function",    function () { return String(this); });
    check("frozen object",       () => {
        const frozen = Object.freeze({ a: 1 });
        frozen.a = 2;
        return frozen.a;
    });
    check("with statement",      () => new Function('with (Math) return PI;')());
    check("octal literal 010",   () => new Function("return 010;")());
    check("duplicate parameters",() => new Function("a", "a", "return a;")(1, 2));

    console.groupEnd();
})();