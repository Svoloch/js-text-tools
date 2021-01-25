
var filename = process.argv[2];
var fs;
var clearner;
if(filename){
	clearner = require("./clear_json").clearner;
	fs = require('fs');
	console.log(clearner(fs.readFileSync(filename, 'utf-8')));
}
