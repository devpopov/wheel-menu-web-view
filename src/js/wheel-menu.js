function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

(function($, window) {
    var o = null;

    function WheelMenu(container, params) {
        this.container = container;

        this.maxRadians = 2.0 * Math.PI;
		
		this.currentSpeed = 0.0;
		this.needToRotate = false;
		this.rotateLastPoint = [0,0];
		this.rotateLastDir = 0;

        this.visibleSegments = 5;

        this.dataPosition = 2;
        this.elementNearBorder = 0;

        this.rotates = -1;

        this.visibleCounter = 2;

        this.visibleSegmentsArray = [];

        this.shiftsCounter = 0;

        var self = this;

        $.each(WheelMenu.params, function(key, value) {
            if(key in params) {
                if (typeof params[key] == value) {
                    self[key] = params[key];
                }
            }
            else {
                self[key] = WheelMenu.defaults[key];
            }
        });

        this.init();
    }

    WheelMenu.defaults = {
        position: "left",
        radius: 20,
        data: [],
        segmentCss: "",
		placeholderAngle: Math.PI - Math.PI/9.0
    }

    WheelMenu.params = {
        position: "string",
        radius: "number",
        data: "object",
        segmentCss: "string",
		placeholderAngle: "number"
    }

    WheelMenu.prototype.init = function() {
        var self = this;

        this.container.removeAttr('id class style');
        this.container.attr('id', 'wheel-menu');

        this.radius = (this.radius * $(window).width()) / 100;
        console.log(this.radius);

        this.container.css({
            height: this.radius * 2.0,
            width: this.radius * 2.0,
            'margin-left': -this.radius
        });

        this.container.append("<div id=\"wheel-menu-transparent\"></div>");

        $('#wheel-menu-transparent').css({
            height: '100%',
            width: this.container.width() / 3.0,
            'margin-left': this.radius
        });

        for (var iterator = 0; iterator < this.visibleSegments; iterator ++) {
            self.container.append("<div class=\"" + self.segmentCss + "\"></div>");
        }

        this.calculateMetrics();

        this.currentPos = [
                this.containerMiddlePoint[0],
                this.containerMiddlePoint[1]
            ];

        this.insideRadius = this.radius - this.radius * 0.15;

        this.currentRadians = toRadians(270);

        this.refresh();

        if (this.container.children("." + this.segmentCss).length != 1)
            this.events();
    }

    WheelMenu.prototype.calculateMetrics = function () {
        this.containerPosition = [this.container.offset().left, this.container.offset().top]

        this.containerMiddlePoint = [
            this.containerPosition[0] + this.container.width() / 2.0,
            this.containerPosition[1] + this.container.height() / 2.0
        ];

        this.segmentSelectedSize = [this.container.height() * 0.06, this.container.width() * 0.3];
    }

    WheelMenu.prototype.refresh = function() {
        var self = this;

        var segments = this.container.children("." + this.segmentCss);

        var circleInc = (2 * Math.PI) / 8;//this.data.length;

        if(this.currentRadians < 0) {
            this.currentRadians = toRadians(355) - this.currentRadians;
        }

        if(this.currentRadians > self.maxRadians) {
            this.currentRadians = this.currentRadians - self.maxRadians;
        }

        if(this.currentRadians > toRadians(90) && this.currentRadians < toRadians(270) - circleInc) {
            if(self.rotateLastDir == 1)
            {
                this.currentRadians = (this.currentRadians - toRadians(90)) + toRadians(270) - circleInc;
            }
            else if(self.rotateLastDir == -1)
            {
                this.currentRadians = toRadians(90) - (this.currentRadians - (toRadians(270) - circleInc));
            }
        }

        var radians = this.currentRadians;
		
        var startPosition = [
                this.currentPos[0],
                this.currentPos[1]
            ];

        var nextPosition = [
                startPosition[0] + (Math.cos(radians) * self.insideRadius),
                startPosition[1] + (Math.sin(radians) * self.insideRadius)
            ];
		
		var scale = ((startPosition[1] + (Math.sin(self.placeholderAngle) * self.insideRadius)) - (startPosition[1] + (Math.sin(radians) * self.insideRadius))) / (self.radius*2.0);
		scale = 1.2 - Math.abs(scale);

        var notFirstTime = false;

        for (var iterator = 0; iterator < segments.length; iterator ++) {
            if(radians > self.maxRadians) {
                radians = radians - self.maxRadians;
            }

            $(segments[iterator]).height(self.segmentSelectedSize[0]);
            $(segments[iterator]).width(self.segmentSelectedSize[1]);

            $(segments[iterator]).css({
                'left': nextPosition[0],
                'top': nextPosition[1],
    			'-webkit-transform' : 'scale(' + scale + ')',
    			'-moz-transform'    : 'scale(' + scale + ')',
    			'-ms-transform'     : 'scale(' + scale + ')',
    			'-o-transform'      : 'scale(' + scale + ')',
    			'transform'         : 'scale(' + scale + ')'
            });

            radians += circleInc;

            if(radians > toRadians(90) && radians < toRadians(270) - circleInc) {
                radians = (radians - toRadians(90)) + toRadians(270) - circleInc;

                console.log(this.elementNearBorder);

                if (this.elementNearBorder != iterator && !notFirstTime) {
                    this.elementNearBorder = iterator;
                    notFirstTime = true;

                    var spliced = this.data.slice();
                    var shiftedSegments = segments.slice().toArray();

                    if(this.rotateLastDir == 1) {
                        this.data = spliced.splice(0, spliced.length - 1);
                        spliced = spliced.concat(this.data)
                        this.data = spliced.slice();
                        this.shiftsCounter ++;
                    }

                    if(this.rotateLastDir == -1) {
                        var element = spliced.shift();
                        spliced.push(element);
                        this.data = spliced.slice();
                        this.shiftsCounter --;
                    }

                    if (this.shiftsCounter > 0) {
                        for(var i = 0; i < this.shiftsCounter; i ++) {
                            var element = shiftedSegments.splice(shiftedSegments.length-1, 1);
                            shiftedSegments.unshift(element[0]);
                        }
                    }
                    else if(this.shiftsCounter < 0) {
                        for(var i = 0; i > this.shiftsCounter; i--) {
                            var element = shiftedSegments.shift();
                            shiftedSegments.push(element);
                        }
                    }

                    // get first 5 elements
                    spliced = spliced.splice(0, this.visibleSegments);

                    shiftedSegments.map(function(segment, index) {
                        $(segment).html(spliced[index].text);
                    });
                }
            }
            
            nextPosition[0] = startPosition[0] + (Math.cos(radians) * self.insideRadius);
            nextPosition[1] = startPosition[1] + (Math.sin(radians) * self.insideRadius);
            scale = ((startPosition[1] + (Math.sin(self.placeholderAngle) * self.insideRadius)) - (startPosition[1] + (Math.sin(radians) * self.insideRadius))) / (self.radius*2.0);
            scale = 1.2 - Math.abs(scale);
        }
    }
	
	
	

    WheelMenu.prototype.events = function() {
        var self = this;
		
		function applyAcceleration() {
			if( !self.needToRotate && self.currentSpeed > 0.0) {
				self.currentSpeed -= 0.001;
				var circleInc = self.rotateLastDir * (8.5 / 360.0);
				self.currentRadians += (circleInc * self.currentSpeed * 100);
				self.refresh();
			}
			setTimeout(applyAcceleration, 25);
		}
		applyAcceleration();
		

        self.container.children("div").bind("mousedown touchstart", function(e_up) {
            var mx = e_up.pageX;
            var my = e_up.pageY;
			self.rotateLastPoint[0] = e_up.pageX;
			self.rotateLastPoint[1] = e_up.pageY;
			self.needToRotate = true;
        });     
		
		$(document).bind("mousemove touchmove", function(e_move) {
			if(!self.needToRotate) {
				return;
			}

            var mmx = 0;
            var mmy = 0;

            if(e_move.type == "mousemove")
            {
                mmx = e_move.pageX;
                mmy = e_move.pageY;
            }
            else {
                var target = e_move.originalEvent.targetTouches[0];
                mmx = target.pageX;
                mmy = target.pageY;
            }

			var mx = self.rotateLastPoint[0];
            var my = self.rotateLastPoint[1];
			var rotateNewDir = 0;
			if(mmy - my > 0.0) {
				rotateNewDir = 1;
				
			} else {
				rotateNewDir = -1;
			}

			if((mmx > mx && mmy == my && mmy < self.containerMiddlePoint[1]) ||
				(mmx > mx && mmy > my && mmy < self.containerMiddlePoint[1] && mmx > self.containerMiddlePoint[0]) ||
				(mmx == mx && mmy > my && mmx > self.containerMiddlePoint[0]) ||
				(mmx < mx && mmy > my && mmy > self.containerMiddlePoint[1] && mmx > self.containerMiddlePoint[0]) ||
				(mmx < mx && mmy == my && mmy > self.containerMiddlePoint[1]) ||
				(mmx < mx && mmy < my && mmy > self.containerMiddlePoint[1] && mmx < self.containerMiddlePoint[0]) ||
				(mmx == mx && mmy < my && mmx < self.containerMiddlePoint[0]) ||
				(mmx > mx && mmy < my && mmy < self.containerMiddlePoint[1] && mmx < self.containerMiddlePoint[0]))
			{

				

			}
			else if ((mmx < mx && mmy == my && mmy < self.containerMiddlePoint[1]) ||
				(mmx < mx && mmy > my && mmy < self.containerMiddlePoint[1] && mmx > self.containerMiddlePoint[0]) ||
				(mmx == mx && mmy < my && mmx > self.containerMiddlePoint[0]) ||
				(mmx > mx && mmy < my && mmy > self.containerMiddlePoint[1] && mmx > self.containerMiddlePoint[0]) ||
				(mmx > mx && mmy == my && mmy > self.containerMiddlePoint[1]) ||
				(mmx > mx && mmy > my && mmy > self.containerMiddlePoint[1] && mmx < self.containerMiddlePoint[0]) ||
				(mmx == mx && mmy > my && mmx < self.containerMiddlePoint[0]) ||
				(mmx < mx && mmy > my && mmy < self.containerMiddlePoint[1] && mmx < self.containerMiddlePoint[0])) {

			

	
			}
			
			if(rotateNewDir == self.rotateLastDir) {
				var circleInc = self.rotateLastDir * (8.5 / 360.0);
				self.currentSpeed = Math.abs(circleInc);
				self.currentRadians += circleInc;
				self.refresh();
				self.rotateLastPoint[0] = mmx;
				self.rotateLastPoint[1] = mmy;
			}

			self.rotateLastDir = rotateNewDir;

		});
		
        $(document).bind("mouseup touchend", function(){
            self.needToRotate = false;
        });
    }

    WheelMenu.prototype.generateElements = function() {
        
    }

    $.fn.wheelMenu = function(params) {
        o = new WheelMenu(this, params);
    };
}(jQuery, window));