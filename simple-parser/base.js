var ParseBuffer = function(...a){
    a.constructor = ParseBuffer;
    a.__proto__ = ParseBuffer.prototype;
    return a;
}
ParseBuffer.prototype = Object.create(Array.prototype);

var Parsed = function(parsed, rest, result){
    var res = [parsed, rest, result];
    res.constructor = Parsed;
    res.__proto__ = Parsed.prototype;
    return res;
}
Parsed.prototype = Object.create(Array.prototype);

var empty = function*(){
    return new Parsed([], new ParseBuffer(), []);
};

var nothing = function*(){
    throw new ParseBuffer(yield null);
};

var cond = (pred)=> function*(){
    var char = yield null;
    if(pred(char))
        return new Parsed([char], new ParseBuffer(), [char]);
    else throw new ParseBuffer(char);
};

var seq2 = (expr0, expr1)=> function*(){
    var acc = [], parsed0, parsed1, rest0, rest1, result0, result1;
    [parsed0, rest0, result0] = yield* expr0();
    acc.push(...parsed0);
    try{
        if(!rest0.length){
            [parsed1, rest1, result1] = yield* expr1();
            return new Parsed([...parsed0, ...parsed1], rest1, [...result0, ...result1]);
        }else{
            var gen = expr1();
            var ret = gen.next();
            while(rest0.length){
                if(ret.done){
                    acc.push(...ret.value[0]);
                    break;
                }
                var char = rest0.shift();
                ret = gen.next(char);
            }
            if(ret.done)
                [parsed1, rest1, result1] = [[], new ParseBuffer(), ret.value[2]];
            else {
                while(!ret.done)
                    ret = gen.next(yield null);
                [parsed1, rest1, result1] = ret.value;
            }
            return new Parsed([...acc, ...parsed1], rest1, [...result0, ...result1]);
        }
    }catch(ex){
        if(ex instanceof ParseBuffer)
            throw new ParseBuffer(...acc, ...ex, ...rest0);
        else throw ex;
    }
};

var fork2 = (expr0, expr1)=> function*(){
    try{
        return yield* expr0();
    }catch(ex0){
        if(!(ex0 instanceof ParseBuffer))
            throw ex0;
        try{
            var gen = expr1();
            if(ex0.length){
                var ret = gen.next();
                while(ex0.length){
                    if(ret.done){
                        return new Parsed(ret.value[0], ex0, ret.value[2]);
                    }
                    ret = gen.next(ex0.shift());
                }
                while(!ret.done)
                    ret = gen.next(yield null);
                return new Parsed(ret.value[0], ex0, ret.value[2]);
            }
            return yield* gen;
        }catch(ex1){
            if(ex1 instanceof ParseBuffer)
                throw new ParseBuffer(...ex1, ...ex0);
            else throw ex1;
        }
    }
};

var calc = (expr, fn)=> function*(){
    var [parsed, rest, result] = yield* expr();
    return new Parsed(parsed, rest, [fn(...result)]);
};

(()=>{
    var exports_ = {
        ParseBuffer,
        Parsed,
        empty,
        nothing,
        cond,
        seq2,
        fork2,
        calc
    };
    if(module){
        module.exports = exports_;
    }else{
        var GLOBAL = new Function('return this')();
        Object.keys(exports_).forEach(
            (key)=> GLOBAL[key] = exports_[key]
        );
    }
})();
