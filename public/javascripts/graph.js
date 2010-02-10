/**
 * Javascript directed graph visualizer 0.1
 */

var Graph = Class.create(); 
Graph.prototype = {
        initialize: function() {
                this.nodeSet = {};
                this.nodes = [];
                this.edges = [];
        },
       
        addNode: function(data, type) {
                var key = data.id;
                var node = this.nodeSet[key];
                
                if(node == undefined) {
                      // creating element

                      if (type == 'edge' && data.id.length > 50) {
                          var label = '<div class="' + type + '-props" style="display: none;">';
                      } else {
                          var label = data.id + '<div class="' + type + '-props" style="display: none;">';
                      }

                      for (var propKey in data.properties) {
                          label += "<div><em>" + propKey + "</em>: " + data.properties[propKey] + "</div>";
                      }
                      label += "</div>";
                      var element = new Element('div', { 'class' : type }).update(label);
                      element.style.cursor = 'pointer';

                      element = document.getElementById('graph-js-data').appendChild(element);
                      
                      element.onmouseover = function() {
                          var props = $(this.children[0]);
                          var propsHeight = parseInt(props.getHeight()); 
                          var parentTop   = parseInt(this.getStyle('top'));
                          var bodyHeight  = $(document.body).getHeight();
                          
                          if ((bodyHeight - (parentTop + 25)) < propsHeight) {
                              props.setStyle({ 'top' : '-' + (props.getStyle('top') + propsHeight - 12) + 'px' });
                          }

                          $(this.children[0]).show();
                      }

                      element.onmouseout = function() {
                          $(this.children[0]).hide();
                      }


                      // adding node
                      node = new Graph.Node(element, type);
                      this.nodeSet[key] = node;
                      this.nodes.push(node);
                }

                return node;
        },

        // Uniqueness must be ensured by caller
        addEdge: function(source, target) {
                var s = source;
                var t = target;
                var edge = {source: s, target: t};
                this.edges.push(edge);
        }
};

Graph.Node = Class.create();
Graph.Node.prototype = {
        initialize: function(value, type) {
                this.value = value;
                this.type = type;
        }
};

Graph.Renderer = {};
Graph.Renderer.Basic = Class.create();
Graph.Renderer.Basic.prototype = {
        initialize: function(element, graph) {
                this.element = element;
                this.graph = graph;

                this.ctx = element.getContext("2d");
                this.radius = 14;
                this.arrowAngle = Math.PI/14;

                this.factorX = (element.width - 2 * this.radius) / (graph.layoutMaxX - graph.layoutMinX);
                this.factorY = (element.height - 2 * this.radius) / (graph.layoutMaxY - graph.layoutMinY);
        },

        translate: function(point) {
                return [
                  (point[0] - this.graph.layoutMinX) * this.factorX + this.radius,
                  (point[1] - this.graph.layoutMinY) * this.factorY + this.radius
                ];
        },

        rotate: function(point, length, angle) {
                var dx = length * Math.cos(angle);
                var dy = length * Math.sin(angle);
                return [point[0]+dx, point[1]+dy];
        },

        draw: function() {
            for (var i = 0; i < this.graph.nodes.length; i++) {
                        this.drawNode(this.graph.nodes[i]);
                }
            for (var i = 0; i < this.graph.edges.length; i++) {
                        this.drawEdge(this.graph.edges[i]);
                }
        },
       
        drawNode: function(node) {
                var point = this.translate([node.layoutPosX, node.layoutPosY]);

                node.value.style.position  = 'absolute';
                node.value.style.top       = (point[1] - 6) + 'px';
                node.value.style.left      = (point[0] - 4) + 'px';
                
                if (node.type == 'vertex') {
                    var vertexId = parseInt(node.value.innerHTML);
                    if (vertexId) {
                        if (vertexId < 10) {
                            node.value.style.left = (point[0] - 3) + 'px';
                        } else if (vertexId > 10) {
                            node.value.style.left = (point[0] - 7) + 'px';
                        } else if (vertexId > 99) {
                            node.value.style.left = (point[0] - 2) + 'px';
                        } else {
                            node.value.style.left = (point[0] + 3) + 'px';
                        }
                    }
                } 

                this.ctx.strokeStyle = '#fff';
                this.ctx.beginPath();
                
                if (node.type == 'vertex') {
                    this.ctx.fillStyle = '#fff';
                    this.ctx.shadowColor = 'grey';
                    this.ctx.shadowBlur  = 5;
                    this.ctx.arc(point[0], point[1], this.radius, 0, Math.PI*2, true);
                    this.ctx.fill();
                    return;
                } 

                this.ctx.closePath();
                this.ctx.stroke();
        },
      
        drawEdge: function(edge) {
                var source = this.translate([edge.source.layoutPosX, edge.source.layoutPosY]);
                var target = this.translate([edge.target.layoutPosX, edge.target.layoutPosY]);

                var tan = (target[1] - source[1]) / (target[0] - source[0]);
                var theta = Math.atan(tan);
                if(source[0] <= target[0]) {theta = Math.PI+theta}
                source = this.rotate(source, -this.radius, theta);
                target = this.rotate(target, this.radius, theta);

                // draw the edge
                this.ctx.strokeStyle = '#006400';
                this.ctx.fillStyle = '#006400';
                this.ctx.lineWidth = 2.0;
                this.ctx.beginPath();
                this.ctx.moveTo(source[0], source[1]);
                this.ctx.lineTo(target[0], target[1]);
                this.ctx.stroke();

                if (edge.target.type == 'vertex') {
                    this.drawArrowHead(18, this.arrowAngle, theta, source[0], source[1], target[0], target[1]);
                }
        },

        drawArrowHead: function(length, alpha, theta, startx, starty, endx, endy) {
                var top = this.rotate([endx, endy], length, theta + alpha);
                var bottom = this.rotate([endx, endy], length, theta - alpha);
                this.ctx.beginPath();
                this.ctx.moveTo(endx, endy);
                this.ctx.lineTo(top[0], top[1]);
                this.ctx.lineTo(bottom[0], bottom[1]);
                this.ctx.fill();
        }
};

Graph.Layout = {};
Graph.Layout.Spring = Class.create();
Graph.Layout.Spring.prototype = {
        initialize: function(graph) {
                this.graph = graph;
                this.iterations = 500;
                this.maxRepulsiveForceDistance = 6;
                this.k = 2;
                this.c = 0.01;
                this.maxVertexMovement = 0.5;
        },
       
        layout: function() {
                this.layoutPrepare();
            for (var i = 0; i < this.iterations; i++) {
                        this.layoutIteration();
                }
                this.layoutCalcBounds();
        },
       
        layoutPrepare: function() {
            for (var i = 0; i < this.graph.nodes.length; i++) {
                    var node = this.graph.nodes[i];
                        node.layoutPosX = 0;
                        node.layoutPosY = 0;
                        node.layoutForceX = 0;
                        node.layoutForceY = 0;
                }               
        },
       
        layoutCalcBounds: function() {
            var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;

            for (var i = 0; i < this.graph.nodes.length; i++) {
                var x = this.graph.nodes[i].layoutPosX;
                var y = this.graph.nodes[i].layoutPosY;
                                       
                if(x > maxx) maxx = x;
                if(x < minx) minx = x;
                if(y > maxy) maxy = y;
                if(y < miny) miny = y;
            }
            
            this.graph.layoutMinX = minx - 0.2;
            this.graph.layoutMaxX = maxx + 0.5;
            this.graph.layoutMinY = miny - 0.2;
            this.graph.layoutMaxY = maxy + 0.4;
        },
       
        layoutIteration: function() {
                // Forces on nodes due to node-node repulsions
            for (var i = 0; i < this.graph.nodes.length; i++) {
                    var node1 = this.graph.nodes[i];
                    for (var j = i + 1; j < this.graph.nodes.length; j++) {
                            var node2 = this.graph.nodes[j];
                                this.layoutRepulsive(node1, node2);
                        }
                }
                // Forces on nodes due to edge attractions
            for (var i = 0; i < this.graph.edges.length; i++) {
                    var edge = this.graph.edges[i];
                        this.layoutAttractive(edge);             
                }
               
                // Move by the given force
            for (var i = 0; i < this.graph.nodes.length; i++) {
                    var node = this.graph.nodes[i];
                        var xmove = this.c * node.layoutForceX;
                        var ymove = this.c * node.layoutForceY;

                        var max = this.maxVertexMovement;
                        if(xmove > max) xmove = max;
                        if(xmove < -max) xmove = -max;
                        if(ymove > max) ymove = max;
                        if(ymove < -max) ymove = -max;
                       
                        node.layoutPosX += xmove;
                        node.layoutPosY += ymove;
                        node.layoutForceX = 0;
                        node.layoutForceY = 0;
                }
        },

        layoutRepulsive: function(node1, node2) {
                var dx = node2.layoutPosX - node1.layoutPosX;
                var dy = node2.layoutPosY - node1.layoutPosY;
                var d2 = dx * dx + dy * dy;
                if(d2 < 0.01) {
                        dx = 0.1 * Math.random() + 0.1;
                        dy = 0.1 * Math.random() + 0.1;
                        var d2 = dx * dx + dy * dy;
                }
                var d = Math.sqrt(d2);
                if(d < this.maxRepulsiveForceDistance) {
                        var repulsiveForce = this.k * this.k / d;
                        node2.layoutForceX += repulsiveForce * dx / d;
                        node2.layoutForceY += repulsiveForce * dy / d;
                        node1.layoutForceX -= repulsiveForce * dx / d;
                        node1.layoutForceY -= repulsiveForce * dy / d;
                }
        },

        layoutAttractive: function(edge) {
                var node1 = edge.source;
                var node2 = edge.target;
               
                var dx = node2.layoutPosX - node1.layoutPosX;
                var dy = node2.layoutPosY - node1.layoutPosY;
                var d2 = dx * dx + dy * dy;
                if(d2 < 0.01) {
                        dx = 0.1 * Math.random() + 0.1;
                        dy = 0.1 * Math.random() + 0.1;
                        var d2 = dx * dx + dy * dy;
                }
                var d = Math.sqrt(d2);
                if(d > this.maxRepulsiveForceDistance) {
                        d = this.maxRepulsiveForceDistance;
                        d2 = d * d;
                }
                var attractiveForce = (d2 - this.k * this.k) / this.k;
                if(edge.weight == undefined || edge.weight < 1) edge.weight = 1;
                attractiveForce *= Math.log(edge.weight) * 0.5 + 1;
               
                node2.layoutForceX -= attractiveForce * dx / d;
                node2.layoutForceY -= attractiveForce * dy / d;
                node1.layoutForceX += attractiveForce * dx / d;
                node1.layoutForceY += attractiveForce * dy / d;
        }
};

