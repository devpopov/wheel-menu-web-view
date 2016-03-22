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
        this.container.attr('id', 'wheelMenu');

        this.container.css({
            height: this.radius * 2.0,
            width: this.radius * 2.0,
            background: this.background
        });

        this.data.map(function(value) {
            self.container.append("<div class=\"" + self.segmentCss + "\" id=\"" + value['id'] + "\">" + value['text'] + "</div>");
        });

        this.calculateMetrics();

        this.currentPos = [
                this.containerMiddlePoint[0],
                this.containerMiddlePoint[1]
            ];

        this.currentRadians = 0;

        this.refresh();

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

        var radians = this.currentRadians;
        var circleInc = (2 * Math.PI) / this.data.length;
		
        var startPosition = [
                this.currentPos[0],
                this.currentPos[1]
            ];

        var nextPosition = [
                startPosition[0] + (Math.cos(radians) * self.radius),
                startPosition[1] + (Math.sin(radians) * self.radius)
            ];
		
		var scale = ((startPosition[1] + (Math.sin(self.placeholderAngle) * self.radius)) - (startPosition[1] + (Math.sin(radians) * self.radius))) / (self.radius*2.0);
		scale = 1.2 - Math.abs(scale); 
		console.log(scale);
		//scale = 1;
			

        this.container.children("div").each(function() {
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
			
            nextPosition[0] = startPosition[0] + (Math.cos(radians) * self.radius);
            nextPosition[1] = startPosition[1] + (Math.sin(radians) * self.radius);
			scale = ((startPosition[1] + (Math.sin(self.placeholderAngle) * self.radius)) - (startPosition[1] + (Math.sin(radians) * self.radius))) / (self.radius*2.0);
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
		

        self.container.children("div").mousedown( function(e_up) {
            var mx = e_up.pageX;
            var my = e_up.pageY;
			self.rotateLastPoint[0] = e_up.pageX;
			self.rotateLastPoint[1] = e_up.pageY;
			self.needToRotate = true;
        });     
		
		$(document).mousemove(function(e_move) {
			if(!self.needToRotate) {
				return;
			}
			var mmx = e_move.pageX;
			var mmy = e_move.pageY;
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
		
        $(document).mouseup(function(){
            self.needToRotate = false;
        });
    }

    WheelMenu.prototype.generateElements = function() {
        
    }

    $.fn.wheelMenu = function(params) {
        o = new WheelMenu(this, params);
    };
}(jQuery, window));