		var person_data = {9999: {'mentioned': 0, 'recipient': 193, 'creator': 167}, 1690: {'mentioned': 0, 'recipient': 1, 'creator': 0}, 1691: {'mentioned': 0, 'recipient': 2, 'creator': 0}, 1692: {'mentioned': 5, 'recipient': 0, 'creator': 0}, 1693: {'mentioned': 0, 'recipient': 0, 'creator': 0}, 1694: {'mentioned': 0, 'recipient': 0, 'creator': 0}, 1695: {'mentioned': 0, 'recipient': 0, 'creator': 0}, 1696: {'mentioned': 5, 'recipient': 0, 'creator': 0}, 1697: {'mentioned': 0, 'recipient': 0, 'creator': 0}, 1698: {'mentioned': 0, 'recipient': 0, 'creator': 0}, 1699: {'mentioned': 3, 'recipient': 1, 'creator': 0}, 1700: {'mentioned': 0, 'recipient': 3, 'creator': 2}, 1701: {'mentioned': 0, 'recipient': 4, 'creator': 0}, 1702: {'mentioned': 0, 'recipient': 12, 'creator': 1}, 1703: {'mentioned': 0, 'recipient': 25, 'creator': 3}, 1704: {'mentioned': 0, 'recipient': 37, 'creator': 21}, 1705: {'mentioned': 0, 'recipient': 49, 'creator': 20}, 1706: {'mentioned': 0, 'recipient': 80, 'creator': 33}, 1707: {'mentioned': 0, 'recipient': 81, 'creator': 43}, 1708: {'mentioned': 0, 'recipient': 116, 'creator': 58}, 1709: {'mentioned': 0, 'recipient': 113, 'creator': 54}, 1710: {'mentioned': 0, 'recipient': 91, 'creator': 35}, 1711: {'mentioned': 0, 'recipient': 146, 'creator': 58}, 1712: {'mentioned': 0, 'recipient': 110, 'creator': 79}, 1713: {'mentioned': 0, 'recipient': 110, 'creator': 20}, 1714: {'mentioned': 0, 'recipient': 113, 'creator': 4}, 1715: {'mentioned': 0, 'recipient': 187, 'creator': 27}, 1716: {'mentioned': 0, 'recipient': 196, 'creator': 76}, 1717: {'mentioned': 0, 'recipient': 122, 'creator': 96}, 1718: {'mentioned': 0, 'recipient': 152, 'creator': 65}, 1719: {'mentioned': 0, 'recipient': 151, 'creator': 77}, 1720: {'mentioned': 0, 'recipient': 189, 'creator': 42}, 1721: {'mentioned': 0, 'recipient': 122, 'creator': 16}, 1722: {'mentioned': 0, 'recipient': 152, 'creator': 30}, 1723: {'mentioned': 0, 'recipient': 115, 'creator': 24}, 1724: {'mentioned': 10, 'recipient': 102, 'creator': 49}, 1725: {'mentioned': 0, 'recipient': 115, 'creator': 40}, 1726: {'mentioned': 0, 'recipient': 88, 'creator': 33}, 1727: {'mentioned': 0, 'recipient': 134, 'creator': 61}, 1728: {'mentioned': 0, 'recipient': 75, 'creator': 56}, 1729: {'mentioned': 0, 'recipient': 153, 'creator': 58}, 1730: {'mentioned': 0, 'recipient': 114, 'creator': 29}, 1731: {'mentioned': 0, 'recipient': 126, 'creator': 32}, 1732: {'mentioned': 0, 'recipient': 109, 'creator': 39}, 1733: {'mentioned': 0, 'recipient': 97, 'creator': 32}, 1734: {'mentioned': 0, 'recipient': 92, 'creator': 29}, 1735: {'mentioned': 0, 'recipient': 37, 'creator': 13}};

		var unknownYear = "9999",
			unknownYearText = "?",
			showUnknown = false;
		
		var all_charts = ['creator','recipient','mentioned'],
			all_chart_titles = ['Letters written','Addressee of letters','Mentioned in'];
		
		var have = { creator : false , 
				recipient: false, 
				mentioned: false, 
				unknown : false };	
					
		// Switch old data format to new data format.
		// TODO: do this in Pylons template
		var person_data_keys = Object.keys(person_data);
		var person_data_without_unknown = [], year;
		
		for( var  i=0;i<person_data_keys.length;i++) {
			year = person_data_keys[i]
			if( year != unknownYear ) {
				counts = person_data[year];
				person_data_without_unknown.push( {
					'year' : year, 
					'mentioned' : counts.mentioned,
					'recipient' : counts.recipient,
					'creator' : counts.creator
				} );
			}
		}
		
		var person_data_with_unknown = person_data_without_unknown.slice(); // Shallow clone!
		
		if( unknownYear in person_data ) {
			counts = person_data[unknownYear];
			person_data_with_unknown.push( {
				'year' : unknownYear,
				'mentioned' : counts.mentioned,
				'recipient' : counts.recipient,
				'creator' : counts.creator
			
			}); // Add here to ensure it's at the end of the array.
			
			have.unknown = true;
		}
	
	// Check we have data for each graph
	for( var i=0; i<all_charts.length; i++ ) {
	
		var c = all_charts[i];
		for( var j = 0; j < person_data_with_unknown.length ; j++ ) {
			if( person_data_with_unknown[j][c] != 0 ) {
				have[c] = true;
				break;
			}
		}
	}
	
	// Specify the charts we have
	var charts = [], chart_titles = [];
	for( i=0;i < all_charts.length; i++ ) {
		if( have[all_charts[i]] ) {
			charts.push( all_charts[i] );
			chart_titles.push( all_chart_titles[i] );
		}
	}
	

	var  svg_height_base = 100,
		 svg_chart_gap = 50,
			label_space_bottom = 20,
			label_space_top = 20,
			label_space_left = 35,
			label_space_right = 15,
			label_offset = 6
			;
		
	var svg_width = d3.select( "#chart" ).style( "width" );
	svg_width = svg_width.substring( 0, svg_width.length - 2 );
	
	var chart_width = svg_width - label_space_left - label_space_right;
		
	//
	// Create the Chart
	//
	
	// Get height
	var svg_height = svg_height_base * charts.length + svg_chart_gap * ( charts.length-1 );
		
	var svgChart = d3.select( '#chart' )
				.append("svg")
				.attr("class", "chart single" )
				.attr("width", svg_width )
				.attr("height", svg_height )
				;
	
	var bars_are = "seperate"; // could be : "stacked" , "split"
	
	var axes = [];
	
	function getMax( person_data, includeUnknown ) {
	
		return d3.max( person_data, function( d ) {
			if ( !includeUnknown && d.year == unknownYear ) {
				return 0;
			}
			
			if( bars_are == "stacked" ) {
				return d.creator + d.recipient + d.mentioned;
			}
			
			return d3.max( [d.creator, d.recipient, d.mentioned ] );	
		} );

	}
	
	function getXScaleDomain( showUnknown) {
		var xDomain = [];
		for( var j=0;j<person_data_length;j++) {
			var year = person_data[j].year;
			
			if ( showUnknown || year != unknownYear ) {
				if( year == unknownYear )
					xDomain.push( unknownYearText );
				else
					xDomain.push( year );
			}
		}
		
		return xDomain;
	}
	
	function getXAxisTicks( xScaleDomain, chart_width ) {
		// Work out what years to display given space.
		var xAxisTicksDomain = xScaleDomain;
		var xAxisTicks = [];
		var widthBar = chart_width / xAxisTicksDomain.length;
		var ticks_every = 10;
		
		if( widthBar > 40 )
			ticks_every = 1;
		else if( widthBar > 20 )
			ticks_every = 3;
		else if( widthBar > 10 )
			ticks_every = 5;
		
		for( var j=0;j<xAxisTicksDomain.length;j++) {
			var val = xAxisTicksDomain[j];
			if( j % ticks_every == 0 || val == unknownYearText ) {
				xAxisTicks.push(val);
			}
		}
		
		return xAxisTicks;
	}
	
	function getYAxisTickNumber( max_value, bars_are ) {
		// Vertical lines
		var y_ticks = 3;
		if( max_value < y_ticks ) {
			y_ticks = max_value;
		}
		else if( bars_are != 'seperate' && max_value >= y_ticks * 3) {
			y_ticks *= 3;
		}
		return y_ticks;
	}
	
	function getChart( number ) {
		if( number < charts.length ) {
			return charts[number];
		}
		return "";
	}
	
	if( showUnknown ) {
		person_data = person_data_with_unknown;
	} else {
		person_data = person_data_without_unknown;
	}
	
	var max_value = getMax( person_data, showUnknown );
	
	// Make an empty copy
	var person_data_dummy = [];
	for( var  i=0; i<person_data.length; i++) {
		person_data_dummy.push( {
				'year' : person_data[i].year, 'mentioned' : 0, 'recipient' : 0, 'creator' : 0
		} );
	}
	
	person_data = person_data_dummy;	
	person_data_length = person_data.length;
	
	var beginning = true;
	
	for( var i=0; i<charts.length; i++ ) {
	
		var chart = charts[i];
		if( have[chart] ) {
			
			var chart_height = svg_height_base - label_space_top - label_space_bottom;
			var chart_x = label_space_left,
				chart_y = ( i * (svg_height_base + svg_chart_gap) ) + label_space_top;
				
				
			// Draw title
			svgChart.append("text")
				.classed( "chart-title", 1 )
				.classed( chart, 1 )
				.attr("x",chart_x + 5 )
				.attr("y",chart_y - 5 )
				.text(chart_titles[i])
				;
				
			//
			// Create Y scale
			//
			var yScale = d3.scale.linear();
			
			var stretchLowerYScale = false;
			//stretchLowerYScale = ( (max_value / 4) > 10 );		
			//if( stretchLowerYScale )
			//	yScale.domain( [0,10,max_value] ).range( [chart_height,chart_height - chart_height/4,0] ); // enhance values between 1 and 10 so we can see them easier.
			//else
			yScale.domain( [0,max_value] ).rangeRound( [chart_height,0] );
			
			//
			// Create Xscale
			//
			var xScaleDomain = getXScaleDomain( showUnknown );
			var xScale = d3.scale.ordinal()
				.domain( xScaleDomain )
				.rangeRoundBands([0, chart_width], 0.2 )
				;
				
			var y_ticks = getYAxisTickNumber( max_value, bars_are );
			
			var yTickMarks = yScale.ticks(y_ticks);
			//if( stretchLowerYScale ) {
			//	yTickMarks.push(10);
			//}
			svgChart.append( "svg:g" ).classed("guidelines", 1 ).selectAll( "line.guideline." + chart )
				.data( yTickMarks, function(d,j) { return (d==0) ? 0 : j + "-" + chart; }  )
				.enter().append("line")
					.classed( "guideline", 1 )
					.classed( chart, 1 )
					.attr("x1", chart_x )
					.attr("x2", chart_x + chart_width )
					.attr("y1", function(d) { return chart_y + yScale(d); })
					.attr("y2", function(d) { return chart_y + yScale(d); })
					;
			
			//
			// Axes
			//
			var xAxisTicks = getXAxisTicks( xScale.domain(), chart_width );
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				.tickValues( xAxisTicks )
				;
			
			var yAxis = d3.svg.axis()
				.scale( yScale )
				.orient( "left" )
				.tickFormat( d3.format("f") )
				.ticks( y_ticks )
				.tickSize( 4,2,0 );
				;
				
			if( bars_are != 'seperate' ) {
				yAxis.tickSubdivide( 4 );
			}
			else {
				yAxis.tickSubdivide( 0 )
			}
			
			axes[chart] = {
				x: xAxis,
				y: yAxis
			};
			
			svgChart.append( "svg:g" )
				.classed( "xaxis", 1 ).classed( "axis", 1 ).classed("label", 1 ).classed( chart, 1 )
				.attr( "transform", "translate(" + chart_x + "," + (chart_y + chart_height) + ")" )
				.call( xAxis )
				;
				
			svgChart.append( "svg:g" )
				.classed( "yaxis",1 ).classed( "axis", 1 ).classed( "label", 1 ).classed( chart, 1 )
				.attr( "transform", "translate(" + chart_x + "," + chart_y + ")" )
				.call( yAxis )
				;
			
			}
		}
	
	function updateCharts( duration, delay ) {
		
		person_data = ( showUnknown ) ? person_data_with_unknown : person_data_without_unknown;			
		person_data_length = person_data.length;
		
		max_value = getMax( person_data, showUnknown, chart );
				
		var chart_height = svg_height_base - label_space_top - label_space_bottom;
		var chart_x = label_space_left;
		
		if( bars_are == "stacked" || bars_are == "split" ) {
			chart_height = svg_height - label_space_top - label_space_bottom;
		}
					
		//
		// Update Y scale
		//
		//stretchLowerYScale = ( (max_value / 4) > 10 );
		//if( stretchLowerYScale )
		//	yScale.domain( [0,10,max_value] ).range( [chart_height,chart_height - chart_height/4,0] ); // enhance values between 1 and 10 so we can see them easier.
		//else
		yScale.domain( [0,max_value] ).range( [chart_height,0] );
		
		
		//
		// Update Xscale
		//
		var xScaleDomain = getXScaleDomain( showUnknown );
		xScale.domain( xScaleDomain );
		
		//
		// Axes
		//
		
		// Work out what years to display given space.
		var xAxisTicks = getXAxisTicks( xScale.domain(), chart_width );
		
		var y_ticks = getYAxisTickNumber( max_value, bars_are )
		
		// Update axes.
		for( j = 0; j < charts.length; j++ ) {
			var chart = charts[j];
			var xAxis = axes[chart].x;
			var yAxis = axes[chart].y;
		
			xAxis.scale(xScale)
				.tickValues( xAxisTicks )
				;
			
			yAxis.scale(yScale)
				.ticks(y_ticks)
				;
			
			if( bars_are != 'seperate' ) {
				yAxis.tickSubdivide(4);
			}
			else {
				yAxis.tickSubdivide(0)
			}
			
			svgChart.select( ".xaxis." + chart )
				.transition().duration( duration )
				.call(xAxis)
				;
					
			svgChart.select( ".yaxis." + chart )
				.transition().duration( duration )
				.call(yAxis)
				;
		}
		
		// Vertical lines
		var yTickMarks = yScale.ticks(y_ticks);
		//if( stretchLowerYScale ) {
		//	yTickMarks.push(10);
		//}
	
		var guidelines = svgChart.select( "g.guidelines" ).selectAll( "line.guideline." + getChart( 0 ) )
			.data( yTickMarks , function(d,i) { return (d==0) ? 0 : i + "-" + getChart( 0 ); } );
			
		guidelines.enter().append( "line" )
				.classed("guideline", 1 )
				.classed( getChart( 0 ), 1 )
				.attr("x1", chart_x)
				.attr("x2", chart_x + chart_width )
				.attr("y1", chart_y )
				.attr("y2", chart_y )
				;
				
		guidelines.exit().remove();
		
		guidelines
			.transition().duration( duration )
			.attr( "y1", function(d) { return label_space_top + yScale(d); } )
			.attr( "y2", function(d) { return label_space_top + yScale(d); } )
			;
		
		function fade( item, fade_in ) {
			if( fade_in ) {
				svgChart.selectAll( item ).transition().duration( duration/2 ).delay( 3*duration/2).style( 'opacity','1' );
			} else {
				svgChart.selectAll( item ).transition().duration( 3*duration/2 ).style( 'opacity', '0' );
			}
		}
			
		if( bars_are == "stacked" || bars_are == "split" ) {
			for ( i = 0; i < charts.length-1; i++ ) { // first ones
				fade( ".xaxis." + charts[i], false );
			}
			
			for ( i = 1; i < charts.length; i++ ) { // last ones
				fade( ".yaxis." + charts[i] , false );
				fade( ".guideline." + charts[i], false );
				fade( ".chart-title." + charts[i], false );
			}
			
			var title = "";
			if( charts.length == 3 )
				title = chart_titles[0] + ", " + chart_titles[1] + " and " + chart_titles[2];
			else if ( charts.length == 2 )
				title = chart_titles[0] + " and " + chart_titles[1];
			else if ( charts.length == 1 )
				title = chart_titles[0];
			
			svgChart.select( ".chart-title." + getChart( 0 ) )
				.text( title )
			
		}
		if( bars_are == "seperate" ) {
			
			for ( i = 0; i < charts.length-1; i++ ) {
				fade( ".xaxis." + charts[i], true );
			}
			
			for ( i = 1; i < charts.length; i++ ) {
				fade( ".yaxis." + charts[i] , true );
				fade( ".guideline." + charts[i], true );
				fade( ".chart-title." + charts[i], true );
			}
			
			if( charts.length > 0 ) {
				svgChart.select( ".chart-title." + getChart( 0 ) )
					.text( chart_titles[0] )
			}
		}
		
		for( var i=0; i<charts.length; i++ ) {
		
			var chart = charts[i];
			if( have[chart] ) {
			
				var chart_y = ( i * (svg_height_base + svg_chart_gap) ) + label_space_top;
				if( bars_are == "stacked" || bars_are == "split" ) {
					chart_y = label_space_top;
				}
				
				//
				// Bars
				//
				var bars = svgChart.selectAll("rect." + chart ).data(person_data, function(d) { 
					return d.year + "-" + chart; 
				});
				
				// Create any new bars
				bars.enter().append("rect")
					.classed( "bar" , 1 )
					.classed( chart , 1 )
					.attr("x", chart_x + chart_width + 2 ) // hide off right
					.attr("y", chart_y + chart_height )
					.attr("width", xScale.rangeBand() )
					.attr("height", 0 )
					.classed( "unknown", function (d) { return d.year == unknownYear; } )
					;
				
				// Remove unwanted bars
				bars.exit()
					.transition().duration( duration )
					.attr("x", chart_x + chart_width + 2 ) // hide off right
					.remove()
					;
				
				bars.append("title")
						.text(function(d) {
							var year = (d.year != unknownYear) ? d.year : "Years unknown" ;
							return year + ": " + d[chart] + " " + chart_titles[i];
						})
					;

				if( beginning ) {
					// when first open we don't want things to move in from right.
					bars.attr("x", function( d, i ) { return chart_x + xScale(i); });
				}
				
				// Update all bars
				bars.transition().duration( duration ).delay( delay )
					.attr("x", function( d, i ) {
						var offset = 0;
						if( bars_are == "split" ) {
							if( chart == getChart( 1 ) )
								offset = xScale.rangeBand() / charts.length;
							else if( chart == getChart( 2 ) )
								offset = xScale.rangeBand() * 2 / charts.length ;
						}
								
						return chart_x + xScale(i) + offset;
					} )
					.attr("y", function( d ) {
						var value = d[chart]
						
						if( bars_are == "stacked" ) {
							if( chart == getChart( 0 ) )
								for( j=1;j<charts.length;j++) 
									value += d[charts[j]];
							else if( chart == getChart( 1 ) )
								for( j=2;j<charts.length;j++) 
									value += d[charts[j]];
						}
						
						return chart_y + yScale(value); 
					} )
					.attr("width", function() {
						if( bars_are == "split" )
							return xScale.rangeBand() / charts.length;
						
						return xScale.rangeBand();
					})
					.attr("height", function(d) {
						return chart_height - yScale(d[chart]); 
					} )
					;
				
				}
									
			}
			
			beginning = false;
		}

	
	function hide( selectors, hide ) {
		for( var i=0;i<selectors.length;i++) {
			d3.select(selectors[i]).style("display", (hide) ? "none" : "inline-block" );
		}
	}
	
	function highlight( selectors, highlight ) {
		for( var i=0;i<selectors.length;i++) {
			d3.select(selectors[i]).classed( "highlight", highlight );
		}
	}
	
	function unknownShow( show ) {
		if( show ) {
			highlight( ["#show_unknown"],true );
			highlight( ["#hide_unknown"],false );
			
			showUnknown = true;
			
		} else {
			highlight( ["#hide_unknown"],true );
			highlight( ["#show_unknown"],false );
			
			showUnknown = false;
		}
		
		updateCharts( 1000, function (d,i) {
				return (person_data_length - i - 1) * (1200 / person_data_length);
			} );
	}
	
	function switchBars( bars_should_be ) {
		bars_are = bars_should_be;
		
		if( bars_are == "seperate" ) {
			highlight( ["#bars_seperate"],true );
			highlight( ["#bars_stacked","#bars_split"], false );
		}
		else if( bars_are == "stacked" ) {
			highlight( ["#bars_stacked"],true );
			highlight( ["#bars_seperate","#bars_split"],false );
		}
		else { // ( bars_are == "split" )
			highlight( ["#bars_split"],true );
			highlight( ["#bars_seperate","#bars_stacked"],false );
		}
		
		updateCharts( 1000, function (d,i) {
				return (person_data_length - i - 1) * (1200 / person_data_length);
		} );
	}
		
	if( charts.length > 0 ) {
		var buttons = "";
		
		if( have.unknown ) {
			buttons += '<div class="buttons">';
			buttons += '<button id="hide_unknown" class="highlight" onclick="unknownShow(false);">Hide unknown</button>';
			buttons += '<button id="show_unknown"  onclick="unknownShow(true);">Show unknown</button>';
			buttons += '</div>';
		}
		
		if( charts.length > 1 ) {
			buttons += '<div class="buttons">';
			buttons += '<button class="highlight" id="bars_seperate" onclick="switchBars(\'seperate\');">Seperate charts</button>';
			buttons += '<button id="bars_stacked" onclick="switchBars(\'stacked\');">Stack bars</button>';
			buttons += '<button id="bars_split" onclick="switchBars(\'split\');">Split bars</button>';
			buttons += '</div>';
		}
		
		if( buttons != "" ) {
			d3.select('#chart_buttons').html(buttons);
		}
		
		updateCharts( 500, function (d,i) {
				return i * (1200/person_data_length);
			} ) ;
	}