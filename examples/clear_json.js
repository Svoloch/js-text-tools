(function (exports) {
  var lexer;
  if (typeof exports.lexer === "function") //in browser
    lexer = exports.lexer;
  else if (typeof require === "function") try {
    lexer = require("../lexer").lexer; //not instaled
  } catch (e) {
    try {
      lexer = require("lexer"); //instaled by npm
    } catch (e) {}
  }
  if (typeof lexer !== "function") //not work without lexer
    throw new Error("WTF?!");

  function pass() {};

  function remember(state) {
    state.output.push(state.text);
  }
  var CONFIG = {
    "": [
      [/\'/,
        function (state) {
          state.output.push('\"');
          state.push("string1");
        }
      ],
      [/\"/,
        function (state) {
          state.output.push('\"');
          state.push("string2");
        }
      ],
      [/\/\/[^\n]*(\n|$)/,
        function (state) {
          state.output.push("\n");
        }
      ],
      [/\/\*/,
        function (state) {
          state.push("comment");
        }
      ],
      [/.|\n/, remember]
    ],
    string1: [
      [/\\\'/, remember],
      [/\\\n/, pass],
      [/\n/,
        function (state) {
          state.output.push("\\n");
        }
      ],
      [/\t/,
        function (state) {
          state, output.push("\\t");
        }
      ],
      [/\'/,
        function (state) {
          state.output.push('\"');
          state.pop();
        }
      ],
      [/.|\n/, remember]
    ],
    string2: [
      [/\\\"/, remember],
      [/\\\n/, pass],
      [/\n/,
        function (state) {
          state.output.push("\\n");
        }
      ],
      [/\t/,
        function (state) {
          state.output.push("\\t");
        }
      ],
      [/\"/,
        function (state) {
          state.output.push('\"');
          state.pop();
        }
      ],
      [/.|\n/, remember]
    ],
    comment: [
      [/\*\//,
        function (state) {
          state.pop();
        }
      ],
      [/.|\n/, pass]
    ]
  };
  var OPTIONS = {
    before: function (state) {
      state.output = [];
    },
    after: function (state) {
      return state.output.join("");
    },
    error: function (state) {
      //console.log(state);
    }
  };
  var clearner = lexer(CONFIG, OPTIONS);
  exports.clearner = clearner;
})(typeof exports !== "undefined" ? exports : typeof window !== "undefined" ? window : this);
