////////////////////////////////////////////////////////////////////
// Copyright (c) 2010 Humble Software Development
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
////////////////////////////////////////////////////////////////////

/**
 * HumbleFinance Flotr Financial Charts
 * 
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 * @author Carl Sutherland
 * @version 1.1.0
 */
var HumbleFinance = {

    /**
     * ID of element to attach chart
     * 
     * @member String
     */
    id: null,
    /**
     * Graphs used to display data 
     * 
     * @member Object
     */
    graphs: {price: null, volume: null, summary: null},
    /**
     * Div containers for graphs
     * 
     * @member Object
     */
    containers: {price: null, volume: null, summary: null, flags: null},
    /**
     * Div handles for interaction with graphs
     * 
     * @member Object
     */
    handles: {left: null, right: null, scroll: null}, 
    /**
     * Bounds on data
     * 
     * @member Object
     */
    bounds: {xmin: null, xmax: null, ymin: null, ymax: null},
    /**
     * Array of data displayed in first graph.
     * 
     * @member Array
     */
    priceData: [],
    /**
     * Array of data displayed in second graph
     * 
     * @member Array
     */
    volumeData: [],
    /**
     * Array of data to serve as a visual summary of the above graphs
     * 
     * @member Array
     */
    summaryData: [],
    /**
     * An array of data to be used to display flags.
     * 
     * @member Array
     */
    flagData: [],
    /**
     * Formatter for x axis ticks
     * 
     * @member function
     */
    xTickFormatter: Flotr.defaultTickFormatter,
    /**
     * Formatter for y axis ticks
     * 
     * @member function
     */
    yTickFormatter: Flotr.defaultTickFormatter,
    /**
     * Formatter for mouse tracking
     * 
     * @member function
     */
    trackFormatter: Flotr.defaultTrackFormatter,
    
    
    /**
     * Initialization function
     * 
     * @param String id
     * @param Array priceData
     * @param Array volumeData
     * @param Array summaryData
     */
    init: function(id, priceData, volumeData, summaryData) {
        
        // Set members
        this.id = id;
        this.priceData = priceData;
        this.volumeData = volumeData;
        this.summaryData = summaryData;
        
        // Set bounds to scale automatically in the y direction
        this.bounds.xmin = 0;
        this.bounds.xmax = this.priceData.length - 1;
        this.bounds.ymin = null;
        this.bounds.ymax = null;
        
        // Set up DOM
        this.buildDOM();
        this.attachEventObservers();
        
        // Initialize graphs, setting selection on summary
        var area = {
            x1: this.bounds.xmin, 
            y1: this.bounds.ymin, 
            x2: Math.min(this.bounds.xmax, 100), 
            y2: this.bounds.ymax
        };
        this.graphs.summary = this.summaryGraph(this.summaryData, this.bounds);
        this.graphs.summary.setSelection(area);
    },
    
    /**
     * Build DOM elements and insert into container.
     */
    buildDOM: function () {
        
        var container = $(this.id);

        // Build DOM element
        this.containers.price = new Element('div', {id: 'priceGraph', style: 'width: 100%; height: 240px;'});
        this.containers.volume = new Element('div', {id: 'volumeGraph', style: 'width: 100%; height: 80px;'});
        this.containers.summary = new Element('div', {id: 'summaryGraph', style: 'width: 100%; height: 60px;'});
        this.containers.flags = new Element('div', {id: 'flagContainer'/*, style: 'width: 0px; height: 0px;'*/});
        this.handles.left = new Element('div', {id: 'leftHandle', 'class': 'handle zoomHandle', style: 'display: none;'});
        this.handles.right = new Element('div', {id: 'rightHandle', 'class': 'handle zoomHandle', style: 'display: none;'});
        this.handles.scroll = new Element('div', {id: 'scrollHandle', 'class': 'handle scrollHandle', style: 'display: none;'});
        
        this.handles.left.onselectstart = function () { return false; };
        this.handles.right.onselectstart = function () { return false; };
        this.handles.scroll.onselectstart = function () { return false; };
        
        // Insert into container
        container.insert(this.containers.price);
        container.insert(this.containers.volume);
        container.insert(this.containers.summary);
        container.insert(this.containers.flags);
        container.insert(this.handles.left);
        container.insert(this.handles.right);
        container.insert(this.handles.scroll);
    },
    
    /**
     * Attach event observers
     */
    attachEventObservers: function() {
        
        // Attach summary click event to clear selection
        Event.observe(this.containers.summary, 'flotr:click', this.reset.bind(this));
        
        // Attach observers for hit tracking on price and volume points
        Event.observe(this.containers.volume, 'flotr:hit', this.volumeHitObserver.bind(this));
        Event.observe(this.containers.volume, 'flotr:clearhit', this.clearHit.bind(this));
        Event.observe(this.containers.price, 'flotr:hit', this.priceHitObserver.bind(this));
        Event.observe(this.containers.price, 'flotr:clearhit', this.clearHit.bind(this));
        
        // Handle observers
        Event.observe(this.containers.summary, 'flotr:select', this.positionScrollHandle.bind(this));
        Event.observe(this.containers.summary, 'flotr:select', this.positionZoomHandles.bind(this));
        Event.observe(this.handles.left, 'mousedown', this.zoomObserver.bind(this));
        Event.observe(this.handles.right, 'mousedown', this.zoomObserver.bind(this));
        Event.observe(this.handles.scroll, 'mousedown', this.scrollObserver.bind(this));
        
        // On manual selection, hide zoom and scroll handles
        Event.observe(this.containers.summary, 'mousedown', this.hideSelection.bind(this));
        
        // Attach summary selection event to redraw price and volume charts
        Event.observe(this.containers.summary, 'flotr:select', this.selectObserver.bind(this));
    },
    
    /**
     * Summary Graph Selection Observer
     * 
     * @param e MouseEvent
     */
    selectObserver: function (e) {
            
        var area = e.memo[0];
        xmin = Math.floor(area.x1);
        xmax = Math.ceil(area.x2);
        
        var newBounds = {'xmin': xmin, 'xmax': xmax, 'ymin': null, 'ymax': null};
        
        this.graphs.price = this.priceGraph(this.priceData.slice(xmin, xmax+1), newBounds);
        this.graphs.volume = this.volumeGraph(this.volumeData.slice(xmin, xmax+1), newBounds);
        
        this.drawFlags();
    },
    
    /**
     * Reset to null selection
     */
    reset: function () {
        this.graphs.price = this.priceGraph(this.priceData, this.bounds);
        this.graphs.volume = this.volumeGraph(this.volumeData, this.bounds);
        this.handles.left.hide();
        this.handles.right.hide();
        this.handles.scroll.hide();
        
        this.drawFlags();
    },
    
    /**
     * Hide selection and handles
     */
    hideSelection: function () {

        // Hide handles
        this.handles.left.hide();
        this.handles.right.hide();
        this.handles.scroll.hide();
        
        // Clear selection
        this.graphs.summary.clearSelection();
    },
    
    /**
     * Set the position of the scroll handle
     * 
     * @param e MouseEvent
     */
    positionScrollHandle: function (e) {

        var x1 = e.memo[0].x1;
        var x2 = e.memo[0].x2;
        var xaxis = e.memo[1].axes.x;
        var plotOffset = e.memo[1].plotOffset;
        var graphOffset = this.containers.summary.positionedOffset();
        var graphHeight = this.containers.summary.getHeight();
        var height = this.handles.scroll.getHeight();
        
        // Set width
        var width = Math.floor(xaxis.d2p(x2) - xaxis.d2p(x1)) + 8;
        width = (width < 10) ? 18 : width;
        
        // Set positions
        var xPosLeft = Math.floor(graphOffset[0] + plotOffset.left + xaxis.d2p(x1) + (xaxis.d2p(x2) - xaxis.d2p(x1) - width)/2);
        var yPos = Math.ceil(graphOffset[1] + graphHeight - 2);
        
        this.handles.scroll.setStyle({position: 'absolute', left: xPosLeft+'px', top: yPos+'px', width: width+'px'});
        this.handles.scroll.show();
    },
    
    /**
     * Begin scrolling observer
     * 
     * @param e MouseEvent
     */
    scrollObserver: function (e) {
        
        var x = e.clientX;
        var offset = this.handles.scroll.cumulativeOffset();
        var prevSelection = this.graphs.summary.prevSelection;
        
        /**
         * Perform scroll on handle move, observer
         * 
         * @param e MouseEvent
         */
        var handleObserver = function (e) {
            
            Event.stopObserving(document, 'mousemove', handleObserver);
            
            var deltaX = e.clientX - x;
            var xAxis = this.graphs.summary.axes.x;
            
            var x1 = xAxis.p2d(Math.min(prevSelection.first.x, prevSelection.second.x) + deltaX);
            var x2 = xAxis.p2d(Math.max(prevSelection.first.x, prevSelection.second.x) + deltaX);
            
            // Check and handle boundary conditions
            if (x1 < this.bounds.xmin) {
                x2 = this.bounds.xmin + (x2 - x1);
                x1 = this.bounds.xmin;
            }
            if (x2 > this.bounds.xmax) {
                x1 = this.bounds.xmax - (x2 - x1);
                x2 = this.bounds.xmax;
            }
            
            // Set selection area object
            var area = {
                x1: x1,
                y1: prevSelection.first.y,
                x2: x2,
                y2: prevSelection.second.y
            };
            
            // If selection varies from previous, set new selection
            if (area.x1 != prevSelection.first.x) {
                this.graphs.summary.setSelection(area);
            }
            
            Event.observe(document, 'mousemove', handleObserver);
        }.bind(this);
        
        /**
         * End scroll observer to detach event listeners
         * 
         * @param e MouseEvent
         */
        function handleEndObserver (e) {
            Event.stopObserving(document, 'mousemove', handleObserver);
            Event.stopObserving(document, 'mouseup', handleEndObserver);
        };
        
        // Attach scroll handle observers
        Event.observe(document, 'mousemove', handleObserver);
        Event.observe(document, 'mouseup', handleEndObserver);
    },
    
    /**
     * Begin zooming observer
     * 
     * @param e MouseEvent
     */
    zoomObserver: function (e) {

        var zoomHandle = e.element();
        var x = e.clientX;
        var offset = zoomHandle.cumulativeOffset();
        var prevSelection = this.graphs.summary.prevSelection;
        
        /**
         * Perform zoom on handle move, observer
         * 
         * @param e MouseEvent
         */
        var handleObserver = function (e) {
            
            Event.stopObserving(document, 'mousemove', handleObserver);
            
            var deltaX = e.clientX - x;
            var xAxis = this.graphs.summary.axes.x;
            
            // Set initial new x bounds
            var x1, x2;
            if (Element.identify(zoomHandle) == 'rightHandle') {
                x1 = xAxis.p2d(Math.min(prevSelection.first.x, prevSelection.second.x));
                x2 = xAxis.p2d(Math.max(prevSelection.first.x, prevSelection.second.x) + deltaX);
            } else if (Element.identify(zoomHandle) == 'leftHandle') {
                x1 = xAxis.p2d(Math.min(prevSelection.first.x, prevSelection.second.x) + deltaX);
                x2 = xAxis.p2d(Math.max(prevSelection.first.x, prevSelection.second.x));
            }
            
            // Check and handle boundary conditions
            if (x1 < this.bounds.xmin) {
                x1 = this.bounds.xmin;
            }
            if (x2 > this.bounds.xmax) {
                x2 = this.bounds.xmax;
            }
            if (x1 > this.bounds.xmax) {
                x1 = this.bounds.xmax;
            }
            if (x2 < this.bounds.xmin) {
                x2 = this.bounds.xmin;
            }
            
            // Set selection area object
            var area = {
                x1: x1,
                y1: prevSelection.first.y, 
                x2: x2, 
                y2: prevSelection.second.y
            };
            
            // If selection varies from previous, set new selection
            if (area.x1 != prevSelection.first.x || area.x2 != prevSelection.second.x) {
                this.graphs.summary.setSelection(area);
            }
            
            Event.observe(document, 'mousemove', handleObserver);
        }.bind(this);

        /**
         * End zoom observer to detach event listeners
         * 
         * @param e MouseEvent
         */
        function handleEndObserver (e) {
            Event.stopObserving(document, 'mousemove', handleObserver);
            Event.stopObserving(document, 'mouseup', handleEndObserver);
        };
        
        // Attach handler slide event listeners
        Event.observe(document, 'mousemove', handleObserver);
        Event.observe(document, 'mouseup', handleEndObserver);
    },
    
    /**
     * Perform a manual zoom.
     * 
     * Zoom backwards from the right zoom handle.  If no selection or handles
     * are present, zoom backwards from the right hand side.
     * 
     * @param integer x
     */
    zoom: function (x) {
        
        var prevSelection = this.graphs.summary.prevSelection;
        var xAxis = this.graphs.summary.axes.x;
        var x1, x2, y1, y2;
        
        // Check for previous selection
        if (!prevSelection) {
            x1 = Math.max(this.bounds.xmax - Number(x), this.bounds.xmin);
            x2 = this.bounds.xmax;
            y1 = 0;
            y2 = 0;
        } else {
            x2 = xAxis.p2d(Math.max(prevSelection.first.x, prevSelection.second.x));
            x1 = Math.max(x2 - Number(x), this.bounds.xmin);
            y1 = prevSelection.first.y;
            y2 = prevSelection.second.y;
        }
        
        var area = {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        };
        
        this.graphs.summary.setSelection(area);
    },
    
    /**
     * Set the position of the zoom handles
     * 
     * @param e MouseEvent
     */
    positionZoomHandles: function (e) {
        
        var x1 = e.memo[0].x1;
        var x2 = e.memo[0].x2;
        var xaxis = e.memo[1].axes.x;
        var plotOffset = e.memo[1].plotOffset;
        var height = this.containers.summary.getHeight();
        var offset = this.containers.summary.positionedOffset();
        this.handles.left.show();
        var dimensions = this.handles.left.getDimensions();
        
        // Set positions
        var xPosOne = Math.floor(offset[0]+plotOffset.left+xaxis.d2p(x1)-dimensions.width/2+1);
        var xPosTwo = Math.ceil(offset[0]+plotOffset.left+xaxis.d2p(x2)-dimensions.width/2);
        var xPosLeft = Math.min(xPosOne, xPosTwo);
        var xPosRight = Math.max(xPosOne, xPosTwo);
        var yPos = Math.floor(offset[1]+height/2 - dimensions.height/2);
        
        this.handles.left.setStyle({position: 'absolute', left: xPosLeft+'px', top: yPos+'px'});
        this.handles.right.setStyle({position: 'absolute', left: xPosRight+'px', top: yPos+'px'});
        this.handles.left.show();
        this.handles.right.show();
    },

    /**
     * Clear point hits for price and volume graphs.
     * 
     * @param e MouseEvent
     */
    clearHit: function(e) {
        this.graphs.price.clearHit();//.mouseTrack.hide();
        this.graphs.volume.clearHit();
    },
    
    /**
     * Observer for volume hit to set price hit
     * 
     * @param e MouseEvent
     */
    volumeHitObserver: function (e) {
        
        // Hide mouse track on volume graph
        this.graphs.volume.mouseTrack.hide();
        
        // Display hit on price graph
        var point = this.priceData[e.memo[0].x];
        Event.stopObserving(this.containers.volume, 'flotr:hit');
        this.doHit(this.graphs.price, point, this.containers.volume);
        Event.observe(this.containers.volume, 'flotr:hit', this.volumeHitObserver.bind(this));
    },
    
    /**
     * Observer for price hit to set volume hit
     * 
     * @param e MouseEvent
     */
    priceHitObserver: function (e) {
        
        // Display hit on volume graph
        var point = this.volumeData[e.memo[0].x];
        Event.stopObserving(this.containers.price, 'flotr:hit');
        this.doHit(this.graphs.volume, point, this.containers.price);
        Event.observe(this.containers.price, 'flotr:hit', this.priceHitObserver.bind(this));
        
        // Hide mouse track on volume graph
        this.graphs.volume.mouseTrack.hide();
    },
    
    /**
     * Calculate hit location from one graph and perform hit on another
     * 
     * @param Flotr.Graph graph  Destination graph.
     * @param Array point  The coordinates of the hit as [x, y].
     * @param Element container  The container of the source graph.
     */
    doHit: function (graph, point, container) {
        
        var offset = container.cumulativeOffset();
        
        var xaxis = graph.axes.x;
        var yaxis = graph.axes.y;
        
        var relX = xaxis.d2p(point[0]);
        var relY = yaxis.d2p(point[1]);
        
        var absX = offset[0]+relX;
        var absY = offset[1]+relY;
        
        var mouse = {'relX': relX, 'relY': relY, 'absX': absX, 'absY': absY}; 
        
        graph.hit(mouse);
    },
    
    /**
     * Add flags to the graph.
     * 
     * @param Array  An array of flags.
     */
    setFlags: function (flags) {
        this.flagData = flags;
        this.drawFlags();
    },
    
    /**
     * Draw flags on top of the graph.
     */
    drawFlags: function () {
        
        var xAxis = this.graphs.price.axes.x;
        var yAxis = this.graphs.price.axes.y;
        var min = xAxis.datamin;
        var max = xAxis.datamax;
        
        this.containers.flags.update('');
        
        for (var i = 0; i < this.flagData.length; i++) {
            
            var x = this.flagData[i][0];
            
            if (x < min) {
                continue;
            } else if (x >= min && x <= xmax) {
                // Draw the flag
                var point = this.priceData[x];
                var flagContent = this.flagData[i][1];
                var xPos = xAxis.d2p(point[0]);
                var yPos = yAxis.d2p(point[1]);
                var offset = this.containers.price.cumulativeOffset();
                
                var left = Math.floor(xPos + this.graphs.price.plotOffset.left);
                var top = Math.floor(yPos - 40 + this.graphs.price.plotOffset.top);
                
                flag = new Element('div', {'class': 'flag', 'style': 'position: absolute; top: '+top+'px; left: '+left+'px; z-index: 10;'});
                flag.update(flagContent);
                flagpole = new Element('div', {'class': 'flagpole', 'style': 'position: absolute; top: '+top+'px; left: '+left+'px; z-index: 10; height: 40px;'});
                this.containers.flags.insert(flag);
                this.containers.flags.insert(flagpole);
                
            } else if (x >= xmax) {
                break;
            }
        }
    },
    
    /**
     * Draw the price graph
     * 
     * @param Array data
     * @param Array bounds
     * @return Flotr.Graph
     */
    priceGraph: function (data, bounds) {
        
        var xmin = bounds.xmin;
        var xmax = bounds.xmax;
        var ymin = bounds.ymin;
        var ymax = bounds.ymax;
        
        var p = Flotr.draw(
            $('priceGraph'),
            [data],
            {
                lines: {show: true, fill: true, fillOpacity: .1, lineWidth: 1},
                yaxis: {min: ymin, max: ymax, tickFormatter: this.yTickFormatter, noTicks: 3, autoscaleMargin: .5,  tickDecimals: 0},
                xaxis: {min: xmin, max: xmax, showLabels: false},
                grid: {outlineWidth: 0, labelMargin: 0},
                mouse: {track: true, sensibility: 1, trackDecimals: 4, trackFormatter: this.trackFormatter, position: 'ne'},
                shadowSize: false,
                HtmlText: true
            }
        );
        
        return p;
    },

    /**
     * Draw the volume graph
     * 
     * @param Array data
     * @param Array bounds
     * @return Flotr.Graph
     */
    volumeGraph: function (data, bounds) {
        
        var xmin = bounds.xmin;
        var xmax = bounds.xmax;
        var ymin = bounds.ymin;
        var ymax = bounds.ymax;

        var v = Flotr.draw(
            $('volumeGraph'),
            [data],
            {
                bars: {show: true, 'barWidth': .5, 'fill': true, 'lineWidth': 2, 'fillOpacity': 1},
                yaxis: {min: ymin, max: ymax, autoscaleMargin: .5, showLabels: false, tickDecimals: 0},
                xaxis: {min: xmin, max: xmax, showLabels: false, labelsAngle: 60},
                grid: {verticalLines: false, horizontalLines: false, outlineWidth: 0, labelMargin: 0},
                mouse: {track: true, sensibility: .3, position: 'ne', trackDecimals: 0},
                shadowSize: false,
                HtmlText: true
            }
        );
        
        return v;
    },

    /**
     * Draw the summary graph
     * 
     * @param Array data
     * @param Array bounds
     * @return Flotr.Graph
     */
    summaryGraph: function (data, bounds) {
        
        var xmin = bounds.xmin;
        var xmax = bounds.xmax;
        var ymin = bounds.ymin;
        var ymax = bounds.ymax;
        
        var p = Flotr.draw(
            $('summaryGraph'),
            [data],
            {
                lines: {show: true, fill: true, fillOpacity: .1, lineWidth: 1},
                yaxis: {min: ymin, max: ymax, autoscaleMargin: .5, showLabels: false, tickDecimals: 1},
                xaxis: {min: xmin, max: xmax, noTicks: 5, tickFormatter: this.xTickFormatter, labelsAngle: 60},
                grid: {verticalLines: false, horizontalLines: false, labelMargin: 0, outlineWidth: 0},
                selection: {mode: 'x'},
                shadowSize: false,
                HtmlText: true
            }
        );
        
        return p;
    }
}