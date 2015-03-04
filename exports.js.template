(function(root, factory) {

	// Start with AMD.
	if (typeof define === 'function' && define.amd) {
		define(['underscore', 'jquery', 'backbone', 'backbone.marionette'], function(_, $, backbone, marionette) {
			// Export global even in AMD case in case this script is loaded with
			// others that may still expect a global Backbone.
			root.Uberbox = factory(root, _, $, backbone, marionette);
		});

		// Next for Node.js or CommonJS. jQuery may not be needed as a module.
	} else if (typeof exports !== 'undefined') {
		var _ = require('underscore');
		var backbone = require('backbone');
		var marionette = require('marionette');
		var jquery = require('jquery');
		factory(root, _, jquery, backbone, marionette);

		// Finally, as a browser global.
	} else {
		root.Uberbox = factory(root, root._, (root.uberboxjQuery || root.jQuery || root.Zepto || root.ender || root.$), Backbone, Marionette);
	}

}(this, function(root, _, jQuery, Backbone, Marionette) {
	<%= contents %>
	return Uberbox;
}));
