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
        this.selectedSegment = 0;
		
		this.currentSpeed = 0.0;
		this.needToRotate = false;
		this.rotateLastPoint = [0,0];
		this.rotateLastDir = -1;

        this.visibleSegments = 5;
        this.segmentsFromStartIndex = 2;
        this.currentIndex = 0;
        this.lastIndex = 0;
        this.isFirstRefresh = true;

        this.shiftsCount = 8;

        this.needInc = false;

        this.zeroSegment = 0;

        this.visibleSegmentsArray = [];

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
        radius: 250,
        background: "green",
        data: [],
        segmentCss: "",
		placeholderAngle: Math.PI - Math.PI/9.0
    }

    WheelMenu.params = {
        position: "string",
        radius: "number",
        background: "string",
        data: "object",
        segmentCss: "string",
		placeholderAngle: "number"
    }

    WheelMenu.prototype.init = function() {
        var self = this;

        this.container.removeAttr('id class style');
        this.container.attr('id', 'wheel-menu');

        this.container.css({
            height: this.radius * 2.0,
            width: this.radius * 2.0,
            background: this.background
        });

        this.container.append("<div id=\"wheel-menu-transparent\"></div>");

        $('#wheel-menu-transparent').height(this.container.height());
        $('#wheel-menu-transparent').width(this.container.width() / 3);


        this.data.map(function(value) {
            self.container.append("<div class=\"" + self.segmentCss + " visible\" id=\"" + value['id'] + "\">" + value['text'] + "</div>");
        });

        this.calculateMetrics();

        this.currentPos = [
                this.containerMiddlePoint[0],
                this.containerMiddlePoint[1]
            ];

        this.insideRadius = this.radius - this.radius * 0.15;

        this.currentRadians = 0;

        this.calculateInvisibleSegments();

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

    WheelMenu.prototype.setSegmentsVisible = function() {
        var segments = this.container.children("." + this.segmentCss);
        for(var iterator = 0; iterator < segments.length; iterator ++) {
            $(segments[iterator]).removeClass('invisible');
            $(segments[iterator]).addClass('visible');

            $(segments[iterator]).show();
        }
    }

    WheelMenu.prototype.calculateInvisibleSegments = function() {
        this.visibleSegmentsArray = [];

        var segments = this.container.children("." + this.segmentCss);

        var hided = segments.length - this.visibleSegments;
        var ending = this.segmentsFromStartIndex + hided + 1;
        var invertedEnding = ending;

        if(ending >= segments.length)
        {
            invertedEnding = this.segmentsFromStartIndex - hided - 1;
        }

        var zeroPosition = -1;

        if(segments.length > this.visibleSegments) {
            for(var iterator = 0; iterator < segments.length; iterator ++) {
                if(ending >= segments.length)
                {   
                    if(iterator < this.segmentsFromStartIndex - this.visibleSegments + 1 || iterator > this.segmentsFromStartIndex)
                    {
                        $(segments[iterator]).removeClass("visible");
                        $(segments[iterator]).addClass("invisible");

                        $(segments[iterator]).hide();

                        if(segments[iterator] == this.zeroSegment)
                            zeroPosition = iterator;
                    }
                    else {
                        this.visibleSegmentsArray.push(segments[iterator]);
                    }
                }
                else if(iterator > this.segmentsFromStartIndex && iterator < ending) {
                    $(segments[iterator]).removeClass("visible");
                    $(segments[iterator]).addClass("invisible");

                    $(segments[iterator]).hide();

                    if(segments[iterator] == this.zeroSegment)
                        zeroPosition = iterator;
                }
                else {
                    this.visibleSegmentsArray.push(segments[iterator]);
                }
            }

            if(zeroPosition != -1)
            {
                for(var iterator = zeroPosition + 1; iterator < segments.length; iterator ++) {
                    if($(segments[iterator]).hasClass('visible')) {
                        this.zeroSegment = segments[iterator];
                        break;
                    }

                    if(iterator == segments.length - 1) {
                        iterator = 0;
                    }
                }
            }
        }

        zeroPosition = this.visibleSegmentsArray.indexOf(this.zeroSegment);

        for(var iterator = 0; iterator < zeroPosition; iterator ++) {
            var element = this.visibleSegmentsArray.shift();
            this.visibleSegmentsArray.push(element);
        }

        //if($(this.visibleSegmentsArray[this.visibleSegmentsArray.length - 1]).attr('id') == segments.length - 1 && this.shiftsCount >= 4) {
        //    this.shiftsCount = 5;
        //    this.needInc = false;
        //}

        //if(this.shiftsCount == 0) {
        //        this.shiftsCount = 5;
        //    }

        //if(this.shiftsCount != -1)
        //{
        //    for (iterator = 0; iterator < this.visibleSegments - this.shiftsCount; iterator ++) {
        //        var element = this.visibleSegmentsArray.shift();
        //        this.visibleSegmentsArray.push(element);
       //     }
            
        //    this.shiftsCount --;

        //}
        //if(ending >= segments.length) {
            //this.shiftsCount = 
            /*for(var iterator = 0; iterator < segments.length - this.segmentsFromStartIndex - 1; iterator ++)
            {
                var element = this.visibleSegmentsArray.shift();
                this.visibleSegmentsArray.push(element);
            }*/
        //}
    }

    WheelMenu.prototype.refresh = function() {

        

        var segments = this.container.children("." + this.segmentCss);
        
        if(!this.isFirstRefresh) {
            if(this.lastIndex != this.currentIndex) {
                if(this.rotateLastDir == 1) {
                    this.segmentsFromStartIndex --;

                    if(this.segmentsFromStartIndex == -1) {
                        this.segmentsFromStartIndex = segments.length - 1;
                    }

                    this.setSegmentsVisible();
                    this.calculateInvisibleSegments();
                    
                }

                if(this.rotateLastDir == -1) {
                    this.segmentsFromStartIndex ++;

                    if(this.segmentsFromStartIndex == 5) {
                        this.segmentsFromStartIndex = 0;
                    }

                    this.setSegmentsVisible();
                    this.calculateInvisibleSegments();
                }
            }
            this.currentIndex = this.lastIndex;
        }

        segments = this.visibleSegmentsArray;

        var self = this;
        var circleInc = (2 * Math.PI) / 8;//this.data.length;

        var wasLimit = false;

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

        //this.container.children("." + this.segmentCss).each(function() {
        for (var iterator = 0; iterator < segments.length; iterator ++) {
            if (iterator == 0) {
                //console.log($(segments[iterator]).attr('id'));
                this.zeroSegment = segments[iterator];
            }

            //if($(segments[iterator]).hasClass('visible')) {
                if(radians > self.maxRadians) {
                    radians = radians - self.maxRadians;
                    //wasLimit = true;
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

                    

                    this.lastIndex = $(segments[iterator]).attr('id');

                    //if(!wasLimit)
                    //{
                    //    this.lastIndex = iterator;
                    //}
                    //else
                    //    wasLimit = false;
                }
            
                nextPosition[0] = startPosition[0] + (Math.cos(radians) * self.insideRadius);
                nextPosition[1] = startPosition[1] + (Math.sin(radians) * self.insideRadius);
                scale = ((startPosition[1] + (Math.sin(self.placeholderAngle) * self.insideRadius)) - (startPosition[1] + (Math.sin(radians) * self.insideRadius))) / (self.radius*2.0);
                scale = 1.2 - Math.abs(scale);
            //}
        }

        if(this.isFirstRefresh) {
            this.currentIndex = this.lastIndex;
            this.isFirstRefresh = false;
        }
        //});
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