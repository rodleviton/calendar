/* jslint bitwise: true */
export default chartRing => {

  var d3 = require('d3');

  chartRing.$inject = ['$timeout', '$log', '$window'];

  chartRing.directive('chartRing', ($timeout, $log, $window) => {

    // Usage:
    // <chart-ring></chart-ring>

    var directive = {
      restrict: 'AE',
      replace: true,
      scope: {
        config: '='
      },
      link: link
    };

    return directive;

    function link(scope, element, attrs) {

      // CONSTANTS
      var COLOR_BACKGROUND = '#29272c';
      var COLOR_FOREGROUND = '#333136';
      var DAYS_OF_WEEK = 7;
      var MAX_DAYS = 31;
      var DISPLAY_SEGMENTS = 39; // Total segments to display on screen
      var TOTAL_SEGMENTS = 48; // Total number of segments for each chart ring
      var DURATION = 1000;
      var DELAY = 1000;
      var BASE_UNIT = ($window.innerHeight > 1000) ? ($window.innerHeight - 100) : 1000;
      var t = 2 * Math.PI;

      // VARS
      var dataset = [];
      var offset = 22;
      var arc;
      var pie;
      var width = BASE_UNIT;
      var height = BASE_UNIT;
      var innerRadius = ((BASE_UNIT / 2) - 20);
      var outerRadius = (BASE_UNIT / 2);

      // Temporary vars
      var currentDayIndex = 0;
      var currentMonth = '';

      function setup() {
        // Chart
        configureDataset();
        // createBackgroundChartRing();
        // addBackgroundChartSegments();
        //createChartRing();
        // addChartSegments();

        // Text
        // addMonthLabel();
        // addDayLabel();

        // // Animations
        // animateIn(chartRing);
        // animateOut(backgroundChartRing);
      }

      ///////////////////////////////////////////////////////////
      // CONFIGURATION
      ///////////////////////////////////////////////////////////

      /**
       * Configure calendar dataset
       */
      function configureDataset() {
        angular.forEach(scope.config, function (month, index) {
          currentMonth = month.name;
          dataset[index] = []; // Add empty array at current month index
          configureSegments(month, index);
        });
      }

      function configureSegments(month, index) {

        for (var i = 0; i <= TOTAL_SEGMENTS; i++) {

          // Shade offset segments same color as chartRing
          if (i < month.startIndex) {

            dataset[index].push({
              count: (100 / 40),
              color: COLOR_FOREGROUND
            });

            // Apply color to days of month segments
          } else if (i < (month.days + month.startIndex)) {

            var segmentColor;

            // Determine if current segments are Saturday or Sunday
            // and shade accordingly
            if ((currentDayIndex === (DAYS_OF_WEEK - 2)) || (currentDayIndex === (DAYS_OF_WEEK - 1))) {
              segmentColor = shadeColor(month.color, -0.5);
            } else {
              segmentColor = month.color;
            }

            // Days of week iterator
            if (currentDayIndex === (DAYS_OF_WEEK - 1)) {
              currentDayIndex = 0;
            } else {
              currentDayIndex++;
            }

            dataset[index].push({
              count: (100 / 40),
              color: segmentColor
            });

          } else if (i <= DISPLAY_SEGMENTS) {

            dataset[index].push({
              count: (100 / 40),
              color: COLOR_FOREGROUND
            });

            // Do not configure any fill color for
            // segments beyond days in month
          } else {

            dataset[index].push({
              count: (100 / 40),
              color: 'none'
            });
          }
        }

        // Create the chart ring
        createChartRing(month, index);
      }

      ///////////////////////////////////////////////////////////
      // CREATE CHART
      ///////////////////////////////////////////////////////////

      function createChartRing(month, index) {
        // Calculate new values based on index
        width -= offset;
        height -= offset;
        innerRadius -= offset;
        outerRadius -= offset;

        arc = d3.svg.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius);

        pie = d3.layout.pie()
          .padAngle(0.005)
          .value(function (d) {
            return d.count;
          }).sort(null);

        var ring = d3.select(element[0]).append('svg')
          .attr('width', width)
          .attr('height', height)
          .style('margin-top', ((offset / 2) * (index + 1)) + 'px')
          .style('margin-left', ((offset / 2) * (index + 1)) + 'px')
          .attr('class', 'calendar-chart-ring')
          // .on('mouseover', function () {
          //   d3.select(this).selectAll('path').transition()
          //     .duration(50)
          //     .attr('fill', function (d, i) {
          //       var fillColor = 'none';
          //
          //       if (i <= DISPLAY_SEGMENTS) {
          //         fillColor = shadeColor(d.data.color, -0.5);
          //       }
          //
          //       return fillColor;
          //     });
          // })
          // .on('mouseout', function () {
          //   d3.select(this).selectAll('path').transition()
          //     .duration(50)
          //     .attr('fill', function (d, i) {
          //       var fillColor = 'none';
          //
          //       if (i <= DISPLAY_SEGMENTS) {
          //         fillColor = d.data.color;
          //       }
          //
          //       return fillColor;
          //     });
          // })
          .append('g')
          .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        // Add chart segments to newly created ring
        addChartSegments(ring, month, index);
      }

      function addChartSegments(ring, month, index) {
        var g = ring.selectAll('path')
          .data(pie(dataset[index]))
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('class', 'chartRing')
          .on('mouseover', function() {
            $log.debug('H');
          })
          .attr('fill', function (d) {
            return d.data.color;
          });

        // Add labels to rings and segments
        addMonthLabel(ring, month, index);
        addDayLabel(ring, month, index);
      }

      ///////////////////////////////////////////////////////////
      // TEXT PATHS
      ///////////////////////////////////////////////////////////
      function addMonthLabel(ring, month, index) {

        // Append label group
        ring.append('g')
          .attr('class', 'month-label');

        // Configure label
        ring.select('.month-label').selectAll('text')
          .data([currentMonth])
          .enter()
          .append('text')
          .attr('dx', '-20')
          .style('text-anchor', 'end')
          .attr('dy', (outerRadius * -1) + 13) // vertical-align
          .attr('fill', month.color)
          .text(currentMonth);
      }

      // Append the label
      function addDayLabel(ring, month, index) {

        // Select all <g> elements with class slice (there aren't any yet)
        var segements = ring.selectAll('g.slice')
          // Associate the generated pie data (an array of arcs, each having startAngle,
          // endAngle and value properties)
          .data(pie(dataset[index]))
          // This will create <g> elements for every 'extra' data element that should be associated
          // with a selection. The result is creating a <g> for every object in the data array
          .enter()
          // Create a group to hold each slice (we will have a <path> and a <text>
          // element associated with each slice)
          .append('svg:g')
          .attr('class', 'segment-label'); //allow us to style things in the slices (like text)

        segements.append('svg:text')
          .attr('transform', function (d) { //set the label's origin to the center of the arc
            //we have to make sure to set these before calling arc.centroid
            d.outerRadius = outerRadius + 50; // Set Outer Coordinate
            d.innerRadius = outerRadius + 45; // Set Inner Coordinate
            return 'translate(' + arc.centroid(d) + ')';
          })
          .attr('text-anchor', 'middle') //center the text on it's origin
          .style('fill', '#fff')
          .attr('dy', 3) //Move the text down
          .text(function (d, i) {
            var text = '';

            if (i < month.startIndex) {
              text = '';
            } else if (i < (month.days + month.startIndex)) {
              text = ((i + 1) - (month.startIndex));
            } else if (i <= TOTAL_SEGMENTS) {
              text = '';
            }

            return text;
          });
      }

      ///////////////////////////////////////////////////////////
      // ANIMATIONS
      ///////////////////////////////////////////////////////////

      /**
       * Animate chart ring into view
       */
      function animateIn(element) {
        element
          .style('opacity', 0)
          .transition()
          .duration(DURATION)
          .delay(DELAY + (scope.index * 100))
          .style('opacity', 1);
      }

      /**
       * Animate chart ring out of view
       */
      function animateOut(element) {
        element
          .style('opacity', 1)
          .transition()
          .duration(DURATION)
          .delay(DELAY + (scope.index * 100))
          .style('opacity', 0);
      }

      /**
       * Helper method to darken or lighten color
       * @param  {string} color [HEX color code]
       * @param  {int} percent [percentage to lighten or darken base color]
       * @return {string} [Calculated HEX color code]
       */
      function shadeColor(color, percent) {
        var f = parseInt(color.slice(1), 16);
        var t = percent < 0 ? 0 : 255;
        var p = percent < 0 ? percent * -1 : percent;
        var R = f >> 16;
        var G = f >> 8 & 0x00FF;
        var B = f & 0x0000FF;
        return '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 +
            (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B))
          .toString(16).slice(1);
      }

      // Computes the angle of an arc, converting from radians to degrees.
      function angle(d) {
        var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
        return a > 90 ? a - 180 : a;
      }

      // Initialise chart ring
      setup();
    }
  });
};
