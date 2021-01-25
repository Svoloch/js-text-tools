
var $L = console.log.bind(console);
var $J = x=>$L(JSON.stringify(x));
var $$ = require('readline-sync').question;

if(false){
    [$L, $J, $$] = [()=>void 0, ()=>void 0, ()=>void 0 ];
}

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

var cond = (pred)=>function*(){
    var char = yield null;
    if(pred(char))
        return new Parsed([char], new ParseBuffer(), [char]);
    else throw new ParseBuffer(char);
};

var seq2 = (expr0, expr1)=>function*(){
    var acc = [], parsed0, parsed1, rest0, rest1, result0, result1;
    [parsed0, rest0, result0] = yield* expr0();
    acc.push(...parsed0);
    try{
        if(!rest0.length){
            [parsed1, rest1, result1] = yield* expr1();
            return new Parsed([...parsed0, ...parsed1], rest1, [...result0, ...result1]);
        }else{
            var gen = expr1();
            var x = gen.next();
            while(rest0.length){
                if(x.done){
                    acc.push(...x.value[0]);
                    break;
                }
                var char = rest0.shift();
                x = gen.next(char);
            }
            if(x.done)
                [parsed1, rest1, result1] = new Parsed([], new ParseBuffer(), x.value[2]);
            else {
                while(!x.done)
                    x = gen.next(yield null);
                [parsed1, rest1, result1] = x.value;
            }
            return new Parsed([...acc, ...parsed1], rest1, [...result0, ...result1]);
        }
    }catch(ex){
        if(ex instanceof ParseBuffer)
            throw new ParseBuffer(...acc, ...ex, ...rest0);
        else throw ex;
    }
};

var fork2 = (expr0, expr1)=>function*(){
    var data, parsed, rest, result, gen;
    try{
        gen = expr0();
        data = yield* gen;
        [parsed, rest, result] = data;
        return [parsed, rest, result];
    }catch(ex0){
        if(!(ex0 instanceof ParseBuffer))
            throw ex0;
        try{
            gen = expr1();
            if(ex0.length){
                var x = gen.next();
                while(ex0.length){
                    if(x.done){
                        return new Parsed(x.value[0], ex0, x.value[2]);
                    }
                    var char = ex0.shift();
                    x = gen.next(char);
                }
                while(!x.done){
                    char = yield null;
                    x = gen.next(char);
                }
                return new Parsed(x.value[0], ex0, x.value[2]);
            }
            data = yield* gen;
            [parsed, rest, result] = data;
            return Parsed(parsed, rest, result);
        }catch(ex1){
            if(ex1 instanceof ParseBuffer)
                throw new ParseBuffer(...ex1, ...ex0);
            else throw ex1;
        }
    }
};

var calc = (expr, fn)=>function*(){
    var [parsed, rest, result] = yield* expr();
    return new Parsed(parsed, rest, [fn(...result)]);
};

(()=>{
    var exports_ = {ParseBuffer, Parsed, empty, nothing, cond, seq2, fork2, calc};
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
