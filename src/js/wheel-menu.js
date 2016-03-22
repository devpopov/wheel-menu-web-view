(function($, window) {
    var o = null;

    function WheelMenu(container, params) {
        this.container = container;

        this.maxRadians = 2.0 * Math.PI;
        this.selectedSegment = 0;

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
        segmentCss: ""
    }

    WheelMenu.params = {
        position: "string",
        radius: "number",
        background: "string",
        data: "object",
        segmentCss: "string"
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

        this.container.children("div").each(function() {
            $(this).height(self.segmentSelectedSize[0]);
            $(this).width(self.segmentSelectedSize[1]);

            $(this).css({
                'left': nextPosition[0],
                'top': nextPosition[1]
            });

            radians += circleInc;

            nextPosition[0] = startPosition[0] + (Math.cos(radians) * self.radius);
            nextPosition[1] = startPosition[1] + (Math.sin(radians) * self.radius);
        });
    }

    WheelMenu.prototype.events = function() {
        var self = this;

        this.container.mousedown( function(e_up) {
            var mx = e_up.pageX;
            var my = e_up.pageY;

            $(this).mousemove(function(e_move) {
                var mmx = e_move.pageX;
                var mmy = e_move.pageY;

                if((mmx > mx && mmy == my && mmy < self.containerMiddlePoint[1]) ||
                    (mmx > mx && mmy > my && mmy < self.containerMiddlePoint[1] && mmx > self.containerMiddlePoint[0]) ||
                    (mmx == mx && mmy > my && mmx > self.containerMiddlePoint[0]) ||
                    (mmx < mx && mmy > my && mmy > self.containerMiddlePoint[1] && mmx > self.containerMiddlePoint[0]) ||
                    (mmx < mx && mmy == my && mmy > self.containerMiddlePoint[1]) ||
                    (mmx < mx && mmy < my && mmy > self.containerMiddlePoint[1] && mmx < self.containerMiddlePoint[0]) ||
                    (mmx == mx && mmy < my && mmx < self.containerMiddlePoint[0]) ||
                    (mmx > mx && mmy < my && mmy < self.containerMiddlePoint[1] && mmx < self.containerMiddlePoint[0]))
                {
                    console.log("clockwise");

                    var circleInc = 10 / 360;

                    self.currentRadians += circleInc;

                    self.refresh();
                }
                else if ((mmx < mx && mmy == my && mmy < self.containerMiddlePoint[1]) ||
                    (mmx < mx && mmy > my && mmy < self.containerMiddlePoint[1] && mmx > self.containerMiddlePoint[0]) ||
                    (mmx == mx && mmy < my && mmx > self.containerMiddlePoint[0]) ||
                    (mmx > mx && mmy < my && mmy > self.containerMiddlePoint[1] && mmx > self.containerMiddlePoint[0]) ||
                    (mmx > mx && mmy == my && mmy > self.containerMiddlePoint[1]) ||
                    (mmx > mx && mmy > my && mmy > self.containerMiddlePoint[1] && mmx < self.containerMiddlePoint[0]) ||
                    (mmx == mx && mmy > my && mmx < self.containerMiddlePoint[0]) ||
                    (mmx < mx && mmy > my && mmy < self.containerMiddlePoint[1] && mmx < self.containerMiddlePoint[0])) {
                    console.log("counterclockwise");

                    var circleInc = 10 / 360;

                    self.currentRadians -= circleInc;

                    self.refresh();
                }

                mx = mmx;
                my = mmy;
            });
        });     
        this.container.mouseup(function(){
            $(this).unbind("mousemove");
        });
    }

    WheelMenu.prototype.generateElements = function() {
        
    }

    $.fn.wheelMenu = function(params) {
        o = new WheelMenu(this, params);
    };
}(jQuery, window));