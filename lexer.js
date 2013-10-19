///LGPL
///@author Segriy Shatunov
///@version 0.0.1.1
(function(exports){
	exports.lexer = function(config, options){
		var NotFound = {};
		var Reject = {};
		function Return(val){this.value = val;}
		options = options || {start:"", forparser:false};///@TODO: rename forparser option
		var data=(function(config){
			var data={};
			for(var state in config)
				data[state]=(function(src){
					var a = [], i;
					for( i = 0 ; i < src.length ; i++ ){
						var re = src[i][0];
						var fn = src[i][1];
						if(re instanceof RegExp)
							re = new RegExp("^(" + re.source + ")",'m' + re.ignoreCase?"i":"");
						else
							re = new RegExp("^("+re+")",'m' + re.ignoreCase?"i":"");
						if(!(fn instanceof Function))
							fn = new Function("","with(arguments[0]){\n"+fn+"\n};");
						a.push([re, fn]);}
					return a;})(config[state]);
			return data;})(config);
		function init(txt){
			var text = txt;
			var stack = [options.start || ""];
			var firstcall = true;
			var control = {
				begin: function(state){
					if(state in config)
						stack[0] = state;
					else throw new Error("wrong state");
				},
				push: function(state){
					if(state in config)
						stack.unshift(state);
					else throw new Error("wrong state");
				},
				pop: function(){return stack.shift();},
				top: function(){return stack[0];},
				ret: function(val){throw new Return(val);},
				read: function(num){
					var res = text.substring(0, num);
					text = text.substring(num);
					return res;},
				unput: function(txt){text = txt + text;},
				reject: function(){throw Reject;},
			};
			function lex(){
				if(firstcall && ("before" in options))
					if(options.before instanceof Function)
						options.before.call(this, control);
					else (new Function("", options.before)).call(this, control);
				firstcall = false;
				while(text.length > 0){//if(confirm(text))throw text;
					try{
						(function (self){
							var current = data[stack[0]];
							for(var i=0, l=current.length ; i < l ; i++)
								if((function(re, fn){
									var match = re.exec(text);
									var token = match && match[1];
									if(token){
										control.text = token;
										text = text.substring(token.length);
										try{
											fn.call(self, control);
										}catch(e){
											if(e instanceof Return){
												e.token = token;
												throw e;
											}else if(e !== Reject)throw e;}}
								return token;
									})(current[i][0], current[i][1]))return;
							throw NotFound;})(this);
					}catch(e){
						if(e === NotFound){
							if("error" in options)
								if(options.error instanceof Function)
									return options.error.call(this, control);
								else return (new Function("", options.error)).call(this, control);}
						else if(e instanceof Return){
							return e.value;}
					throw e;}}
				if("after" in options)
					if(options.after instanceof Function)
						return options.after.call(this, control);
					else return (new Function("", options.after)).call(this, control);}
		return lex;}
	return options.forparser ? init : function(txt){return init(txt).call(this);};}///@TODO: rename forparser option
})(typeof exports!=="undefined"?exports:typeof window!=="undefined"?window:this);