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
        background: "blue",
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
    }

    WheelMenu.prototype.calculateSizes = function () {
        
    }

    WheelMenu.prototype.generateElements = function() {
        
    }

    $.fn.wheelMenu = function(params) {
        o = new WheelMenu(this, params);
    };
}(jQuery, window));