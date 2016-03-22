(function($, window) {
    var o = null;

    function WheelMenu(container, params) {
        this.container = container;

        var self = this;

        $.each(WheelMenu.params, function(key, value) {
            if(key in params) {
                if (typeof params[key] == value) {
                    self[key] = value;
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
        this.container.removeAttr('id class style');
        this.container.attr('id', 'wheelMenu');

        this.container.css({
            height: this.radius * 2.0,
            width: this.radius * 2.0,
            background: this.background
        });

        this.containerPosition = [this.container.offset().left, this.container.offset().top]

        this.containerMiddlePoint = [
                (this.containerPosition[0] + this.container.width()) / 2.0,
                (this.containerPosition[1] + this.container.height()) / 2.0
            ]

        this.events();
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
                }

                mx = mmx;
                my = mmy;
            });
        });     
        this.container.mouseup(function(){
            $(this).unbind("mousemove");
        });
    }

    WheelMenu.prototype.calculateSizes = function () {
        
    }

    WheelMenu.prototype.generateElements = function() {
        
    }

    $.fn.wheelMenu = function(params) {
        o = new WheelMenu(this, params);
    };
}(jQuery, window));