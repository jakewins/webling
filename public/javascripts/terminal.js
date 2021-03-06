/*
TryMongo
Original version from: Kyle Banker (http://www.kylebanker.com)
Rerewritten to fit gremlin needs by: Pavel A. Yaskevich
Date: September 1, 2009

(c) Creative Commons 2010
http://creativecommons.org/licenses/by-sa/2.5/
*/

// Readline class to handle line input.
var ReadLine = function(options) {
  this.options      = options || {};
  this.htmlForInput = this.options.htmlForInput;
  this.inputHandler = function(h, v, callback) {

    callback = callback || function() {};
 
    if(/^tutorial/.test(v) || /^next/.test(v) || /^prev/.test(v)) {
      h.insertResponse(h.tutorial.handle(v));
      h.newPromptLine();

      // saving help history
      h.history.push(v);

      // Tell the caller that the execution is complete
      callback();

      return null;
    }
    
    if(/visualize/.test(v)) {
      var vertex = ".";
      var parts = $.trim(v).split(' ');

      if(parts.length == 2) {
        vertex = parts[1];
        vertex = vertex.replace(/'/g, '"');
      }
      
      $.facebox("<iframe src='graph.html?vertex=" + vertex + "' width='1150' height='600'></iframe>");
      $("#facebox")[0].style.top = '20px';

      h.history.push(v);
      h.newPromptLine();

      // Tell the caller that the execution is complete
      callback();

      return null;
    }
   
    $.post('/exec', { code : v }, function(value) {
      if(/gr-statement/.test(value) == false) {
        h.insertResponse(value.replace(/\n/g, "<br />"));
      }

      // Save to the command history...
      if((lineValue = $.trim(v)) !== "") {
        h.history.push(lineValue);
        h.historyPtr = h.history.length;
      }

      h.scopeHistory = [];
      h.newPromptLine(h.depth);

      // Tell the caller that the execution is complete
      callback();
    });
  };
  this.terminal     = $(this.options.terminalId || "#terminal");
  this.lineClass    = this.options.lineClass || '.readLine';
  this.history      = [];
  this.historyPtr   = 0;
  this.depth        = 0;
  this.scopeHistory = [];
  this.tutorial = new Tutorial();
  this.initialize();
};


ReadLine.prototype = {
  initialize: function() {
    this.addInputLine();
  },
  
  newPromptLine: function() {
    this.activeLine.value = '';
    this.activeLine.attr({disabled: true});
    this.activeLine.next('.spinner').remove();
    this.activeLine.removeClass('active');
    this.addInputLine(this.depth);
  },

  // Enter a new input line with proper behavior.
  addInputLine: function(depth) {
    stackLevel = depth || 0;
    this.terminal.append(this.htmlForInput(stackLevel));
    var ctx = this;
    ctx.activeLine = $(this.lineClass + '.active');

    // Bind key events for entering and navigting history.
    ctx.activeLine.bind("keydown", function(ev) {
      switch (ev.keyCode) {
        case EnterKeyCode:
          ctx.processInput(this.value); 
          break;
        case UpArrowKeyCode: 
          ctx.getCommand('previous');
          break;
        case DownArrowKeyCode: 
          ctx.getCommand('next');
          break;
      }
    });

    $(document).bind("keydown", function(ev) {
      ctx.activeLine.focus();
    });

    this.activeLine.focus();
  },

  // Returns the 'next' or 'previous' command in this history.
  getCommand: function(direction) {
    if(this.history.length === 0) {
      return;
    }
    this.adjustHistoryPointer(direction);
    this.activeLine[0].value = this.history[this.historyPtr];
    $(this.activeLine[0]).focus();
    //this.activeLine[0].value = this.activeLine[0].value;
  },

  // Moves the history pointer to the 'next' or 'previous' position. 
  adjustHistoryPointer: function(direction) {
    if(direction == 'previous') {
      if(this.historyPtr - 1 >= 0) {
        this.historyPtr -= 1;
      }
    } else {
      if(this.historyPtr + 1 < this.history.length) {
        this.historyPtr += 1;
      }
    }
  },

  // Return the handler's response.
  processInput: function(value, callback) {

    callback = callback || function() {};

    if($.trim(value) == '') {
      this.newPromptLine();
      return null;
    }
    
    if($.trim(value) == 'end' && this.depth > 0) {
      this.depth--;
    }

    var reserved = false;
    for(i = 0; i < ReservedWords.length; i++) {
        if(value.match(ReservedWords[i])) {
            reserved = true;
            this.depth++;
        }
    }

    this.scopeHistory.push(value);
    this.inputHandler(this, value, callback);
  },

  insertResponse: function(response) {
    if(response !== "") {
      this.activeLine.parent().append("<p class='response'>" + response + "</p>");
    }
  },

  // Simply return the entered string if the user hasn't specified a smarter handler.
  mockHandler: function(inputString) {
    return function() {
      this._process = function() { return inputString; };
    };
  }
};

$htmlFormat = function(obj) {
  return tojson(obj, ' ', ' ', true);
}

var DefaultInputHtml = function(stack) {
    var linePrompt = "";
    for(var i=0; i <= stack; i++) {
      linePrompt += "<span class='prompt'> ></span>";
    }
    return "<div class='line'>" +
           linePrompt +
           "<input type='text' class='readLine active' />" +
           "<img class='spinner' src='/images/spinner.gif' style='display:none;' /></div>";
}

var EnterKeyCode      = 13;
var UpArrowKeyCode    = 38;
var DownArrowKeyCode  = 40;
var ReservedWords     = ['repeat', 'while', 'if', 'foreach', 'func ', 'path'];

$(document).ready(function() {
    var terminal = new ReadLine({htmlForInput: DefaultInputHtml});

    var controls = new Webling.Controls($, $('#controls'), terminal, Webling.shortcuts);

    // Add next/previous buttons to UI and uncomment these to enable that functionality.
    $("#tutorial-button").click( controls.createCallback( [ 'tutorial' ] ));
    //$("#previous-button").click( controls.createCallback( [ 'previous' ] ));

});
