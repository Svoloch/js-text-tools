
if(typeof require === 'function'){
    var {ParseBuffer, Parsed, empty, nothing, cond, seq2, fork2, calc} = require('./base');
}

var Parser = function(expr){
    var res = function(){
        return expr();
    };
    res.constructor = Parser;
    res.__proto__ = Parser.prototype;
    return res;
}
Parser.prototype = Object.create(Function.prototype);
Parser.prototype.seq = function(expr){
    return new Parser(seq2(this, expr));
};
Parser.prototype.fork = function(expr){
    return new Parser(fork2(this, expr));
};
Parser.prototype.calc = function(fn){
    return calc(this,fn);
};
Parser.prototype.maybe = function(){
    return maybe(this);
};
Parser.prototype.many = function(expr){
    return many(this);
};
Parser.combinator = function(comb){
    return (comb=>
        (...a)=>
            new this(comb(...a))
    )(comb);
};

cond = Parser.combinator(cond);
calc = Parser.combinator(calc);

empty = new Parser(empty);

var seq =(...exps)=> new Parser( 
    exps.map(x=>
        (typeof x ==='string' || x instanceof String)
            ?str(x)
            :x
    ).reduce(
        (a,b)=>seq2(a,b), empty
    )
);

var fork = (...exps)=> new Parser( 
    exps.map(x=>
        (typeof x ==='string' || x instanceof String)
            ?str(x)
            :x
    ).reduce(
        (a,b)=>fork2(a,b), nothing
    )
);

var char = Parser.combinator(
    ch=>cond(x=>ch===x)
);

var inSet = set=>{
    if(typeof set === 'string')
        set = new Set(set.split(''));
    return cond(x=>set.has(x));
}

var outSet = set=>{
    if(typeof set === 'string')
        set = new Set(set.split(''));
    return cond(x=>!set.has(x));
}

var str = s=>
    seq(...s.split('').map(c=>char(c)));

var maybe = Parser.combinator(
    expr=>fork2(expr, empty)
);

var many = Parser.combinator(expr=>{
    var many_ = ()=>fork2(
        seq2(expr, ()=>many_()),
        empty
    )();
    return many_;
});

(()=>{
    var exports_ = {
        Parser,
        ParseBuffer,
        empty,
        nothing,
        cond,
        calc,
        seq,
        fork,
        char,
        str,
        maybe,
        many,
        inSet,
        outSet
    };
    if(module){
        module.exports = exports_;
    }else{
        var GLOBAL = new Function('return this')();
        Object.keys(exports_).forEach(
            (key)=>
                GLOBAL[key] = exports_[key]
        );
    }
})();
