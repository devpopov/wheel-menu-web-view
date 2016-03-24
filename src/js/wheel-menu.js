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
            self.container.append("<div class=\"" + self.segmentCss + "\" id=\"" + value['id'] + "\">" + value['text'] + "</div>");
        });

        this.calculateMetrics();

        this.currentPos = [
                this.containerMiddlePoint[0],
                this.containerMiddlePoint[1]
            ];

        this.insideRadius = this.radius - this.radius * 0.15;

        this.currentRadians = 0;

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

        this.container.children("." + this.segmentCss).each(function() {
            if(radians > self.maxRadians) {
                radians = radians - self.maxRadians;
            }

            $(this).height(self.segmentSelectedSize[0]);
            $(this).width(self.segmentSelectedSize[1]);

            $(this).css({
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
            }
			
            nextPosition[0] = startPosition[0] + (Math.cos(radians) * self.insideRadius);
            nextPosition[1] = startPosition[1] + (Math.sin(radians) * self.insideRadius);
			scale = ((startPosition[1] + (Math.sin(self.placeholderAngle) * self.insideRadius)) - (startPosition[1] + (Math.sin(radians) * self.insideRadius))) / (self.radius*2.0);
			scale = 1.2 - Math.abs(scale); 
        });
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