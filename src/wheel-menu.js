function WheelMenu(container, params) {
    this.container = container;

    var self = this;

    $.each(params, function(key, value) {
    	if (key in WheelMenu.params) {
    		if (typeof value == WheelMenu.params[key]) {
    			self[key] = value;
    		}
    	}
    });
}

WheelMenu.params = {
	test: "string"
}