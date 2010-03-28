var Tutorial = function() {
    this.prev = this.index;
    this.next = this._p1;
}

Tutorial.prototype = {
  index: function() {
      this.next = this._p1;
      return P('Use `tutorial &lt;chapter&gt; &lt;section&gt;`') + 
          P('Available sections are:') +
          DIV(LIST(['1. What is Gremlin?', 
                     '2. What can I do with Gremlin?' +
                        LIST([
                          'a. Defining variables.',
                          'b. Using ”$_” and ”$_g” and ”.” special variables.',
                          'c. Using Gremlin build-in functions and data structures (maps, lists).',
                          'd. Gremlin Loops (foreach, while).',
                          'e. Defining custom functions/paths.',
                          'f. Basic graph traversals (including load graph data from files).',
                          'g. Using different backends (Neo4j, TinkerGraph, Sail).',
                          'h. Spreading Activation algorithm.'
                        ]), 
                     '3. Acknowledgements'
                    ]));
  },
  
  _p1: function() {
    this.prev = this.index;
    this.next = this._p2;
    return P("Chapter 1 - What is Gremlin?") + BR() +  
           P('&nbsp;&nbsp;Gremlin is a domain specific programming language for ' + LINK("http://en.wikipedia.org/wiki/Graph_%28mathematics%29", "graphs") + '. Graphs are data structures where there exists vertices (i.e. dots, nodes) and edges (i.e. lines, arcs). Gremlin was designed to work with a type of graph called a property graph. Property graphs are defined, in detail, in the ' + LINK("http://wiki.github.com/tinkerpop/gremlin/defining-a-property-graph", "Defining a Property Graph") + ' section of ' + LINK("http://wiki.github.com/tinkerpop/gremlin/", "complete documentation") + '. Gremlin makes extensive use of ' + LINK("http://www.w3.org/TR/xpath", "XPath 1.0") + ' to define abstract path descriptions (path expressions) through a graph. It is important to learn and understand XPath as this will make it easier to understand Gremlin.'); 
  },
  
  _p2: function(sectionId) {
    
    this._annotation = function() {
      this.prev = this._p1;
      this.next = this._a;
      return P("Chapter 2 - What can I do with Gremlin?") + BR() +
             P("&nbsp;&nbsp;Before diving into the specifics of Gremlin, its good to know what you are getting yourself into. Moreover, its important to know if Gremlin can be of use to you. Below is a list of a few key benefits of Gremlin:") + BR() +
             DIV(LIST(
                 [
                     '1. Gremlin is useful for manually working with your graph;',
                     '2. Gremlin allows you to query a graph;',
                     '3. Gremlin can express complex graph traversals succinctly;',
                     '4. Gremlin is useful for exploring and learning about graphs;',
                     '5. Gremlin allows you to explore the Semantic Web/Web of Data;',
                     '6. Gremlin allows for universal path-based computations.'
                 ]));
    }

    this._a = function() {
      this.prev = this._annotation;
      this.next = this._b;
 
      return P("Chapter 2a - Defining variables.") + BR() +
             P("&nbsp;&nbsp;Gremlin gives you possibility to work with variables.") + BR() +
             P("&nbsp;&nbsp;Variables in Gremlin must be proceeded by a $ character.") + 
             P("&nbsp;&nbsp;The assignment operator is ':=' and it is used to assign a value to a variable or an element to a list or map:") + BR() + 
                PLIST("$foo := 'bar'") + PLIST("$i := 1 + 5"); 
    }
    
    this._b = function() {
      this.prev = this._a;
      this.next = this._c;

      return P("Chapter 2b - Using ”$_” and ”$_g” and ”.” special variables.") + BR() +
             P("&nbsp;There are three special variables in Gremlin ”$_” and ”$_g” and ”.”:") + BR() +
             PLIST("• ”$_”  is a reserved variable that denotes the root list. In this way, the root list can be redefined.") +
             PLIST("• ”$_g” denotes the graph object. It allows the user to assign a working graph that will be referenced by graph functions when no graph argument is provided.") +
             PLIST("• ”.” denotes reference to the root list.");
    }

    this._c = function() {
      this.prev = this._b;
      this.next = this._d;

      return P("Chapter 2c - Using Gremlin build-in functions and data structures (maps, lists).") + BR() +
             P("&nbsp;Gremlin provides build-in functions and data structures which will be very useful while working with graphs.") + BR() +
             P("To execute a function you should call it using special format - ”&lt;prefix&gt;:&lt;function_name&gt;(&lt;arg&gt;, ...)”:") + BR() +
             PLIST("g:print('hello world!') - will execute build-in print function.") + BR() +
             P("or without arguments:") + BR() +
             PLIST("g:print() - will print empty string.") + BR() +
             P("There are functions which could be referenced without &lt;prefix&gt; - global functions - like: null(), false(), true()") + BR() +
             PLIST("$foo := false() - value returned by false() will be assigned to $foo variable.") + BR() +

             P("&nbsp;Gremlin has own implementation of Map and List data structures (will be familiar to Java developers):") + BR() +
             PLIST("g:map(&lt;key&gt;, &lt;value&gt;, ...) - function used to construct map objects:") +
             PLIST("g:map('foo', 'bar') - will return {'foo'='bar'} map.") + BR() +
             P("the same goes for List:") + BR() + 
             PLIST("g:list(&lt;value&gt;,...) - function used to construct list objecs:") +
             PLIST("g:list(1,2,3,4) - will return [1.0, 2.0, 3.0, 4.0].") + BR() +
             P("result of map or list function could be assigned to a variable:") + BR() +
             PLIST("$foo := g:map('foo', 'bar')") + 
             PLIST("$foo := g:list('foo', 'bar')") + BR() + 
             P("to get value from map use g:get(element, string) function:") + BR() +
             PLIST("g:get(g:map('foo', 'bar'), 'foo') - returns 'bar'") + BR() + 
             P("g:get(list, number) function used to get values from list:") + BR() +
             PLIST("g:get(g:list(3, 4), 1) - returns '3.0'") + BR() +
             P("to assign new elements to map use g:assign(map,object,object) function:") + BR() +
             PLIST("$foo := g:map('foo', 'bar')") +
             PLIST("g:assign($foo, 'foo2', 'bar2') - returns 'bar2'") +
             PLIST("g:print($foo) - returns {foo2=bar2, foo=bar}") + BR() +
             P("Gremlin Function Library Reference could be found " + LINK("http://wiki.github.com/tinkerpop/gremlin/gremlin-function-library", "here"));
    }

    this._d = function() {
      this.prev = this._c;
      this.next = this._p3;

      return P("Chapter 2d.");
    }

    var section = this['_' + sectionId];
    return ((section) ? section() : this._annotation());
  },

  _p3: function() {
    this.next = this._p1;
    return P("Chapter 3");
  },

  handle: function(req) {
    if($.trim(req) == 'prev') return this.prev();
    if($.trim(req) == 'next') return this.next();

    // format is help <paragraph> <section>
    var currentReqParts = req.split(" ");
    var chapter = this['_p' + currentReqParts[1]];
    return ((chapter) ? chapter(currentReqParts[2]) : this.index());
  }
};
