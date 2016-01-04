(function() {
window["Uberbox"] = window["Uberbox"] || {};
window["Uberbox"]["Templates"] = window["Uberbox"]["Templates"] || {};

window["Uberbox"]["Templates"]["carousel-item"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<img src="' +
((__t = ( thumbnail )) == null ? '' : __t) +
'">';

}
return __p
}})();
(function() {
window["Uberbox"] = window["Uberbox"] || {};
window["Uberbox"]["Templates"] = window["Uberbox"]["Templates"] || {};

window["Uberbox"]["Templates"]["content-html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p +=
((__t = ( obj.model.get('html') )) == null ? '' : __t);

}
return __p
}})();
(function() {
window["Uberbox"] = window["Uberbox"] || {};
window["Uberbox"]["Templates"] = window["Uberbox"]["Templates"] || {};

window["Uberbox"]["Templates"]["content-iframe"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<iframe src="' +
((__t = ( obj.url )) == null ? '' : __t) +
'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';

}
return __p
}})();
(function() {
window["Uberbox"] = window["Uberbox"] || {};
window["Uberbox"]["Templates"] = window["Uberbox"]["Templates"] || {};

window["Uberbox"]["Templates"]["content-image"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<img src="' +
((__t = ( obj.model.get('url') )) == null ? '' : __t) +
'"/>';

}
return __p
}})();
(function() {
window["Uberbox"] = window["Uberbox"] || {};
window["Uberbox"]["Templates"] = window["Uberbox"]["Templates"] || {};

window["Uberbox"]["Templates"]["content-unknown"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '';

}
return __p
}})();
(function() {
window["Uberbox"] = window["Uberbox"] || {};
window["Uberbox"]["Templates"] = window["Uberbox"]["Templates"] || {};

window["Uberbox"]["Templates"]["lightbox-content"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class="uberbox-prev"><i></i></div>\n<div class="uberbox-next"><i></i></div>\n';

}
return __p
}})();
(function() {
window["Uberbox"] = window["Uberbox"] || {};
window["Uberbox"]["Templates"] = window["Uberbox"]["Templates"] || {};

window["Uberbox"]["Templates"]["lightbox-item"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="uberbox-lightbox-item-content-wrapper">\n		<div class="uberbox-item-object"></div>\n		';
 if (obj.model.showDescription()) { ;
__p += '\n			<div class="uberbox-item-description">\n				';
 if (obj.model.get('title')) { ;
__p += '<h2>' +
((__t = ( obj.model.get('title') )) == null ? '' : __t) +
'</h2>';
 } ;
__p += '\n				' +
((__t = ( obj.model.get('description') )) == null ? '' : __t) +
'\n			</div>\n		';
 } ;
__p += '\n</div>';

}
return __p
}})();
(function() {
window["Uberbox"] = window["Uberbox"] || {};
window["Uberbox"]["Templates"] = window["Uberbox"]["Templates"] || {};

window["Uberbox"]["Templates"]["toolbar"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="uberbox-lightbox-actions">\n	<a href="#" data-action="close"><i class="uberbox-icon-close"></i></a>\n	';
 if (Uberbox.Utils.supportsFullScreen()) { ;
__p += '\n		<a href="#" data-action="fullscreen">\n			<i class="uberbox-icon-fullscreen"></i>\n			<span class="uberbox-tooltip">' +
((__t = ( obj.model.get('fullscreen_tooltip' ))) == null ? '' : __t) +
'</span>\n		</a>\n		<a href="#" data-action="exit-fullscreen" class="uberbox-disabled" >\n			<i class="uberbox-icon-exit-fullscreen"></i>\n			<span class="uberbox-tooltip">' +
((__t = ( obj.model.get('exit_fullscreen_tooltip' ))) == null ? '' : __t) +
'</span>\n		</a>\n	';
 } ;
__p += '\n	';
 if (obj.model.get('download_url')) { ;
__p += '\n		<a data-action="download" download href="' +
((__t = ( obj.model.get('download_url') )) == null ? '' : __t) +
'" target="_blank">\n			<i class="uberbox-icon-download"></i>\n			<span class="uberbox-tooltip">' +
((__t = ( obj.model.get('download_tooltip') )) == null ? '' : __t) +
'</span>\n		</a>\n	';
 } ;
__p += '\n	';
 if (services = obj.model.get('share')) { ;
__p += '\n		<div href="#" data-action="share">\n			<i class="uberbox-icon-share"></i>\n			<span class="uberbox-tooltip">' +
((__t = ( obj.model.get('share_tooltip') )) == null ? '' : __t) +
'</span>\n			<div class="uberbox-share-menu">\n				';
 var index ;
__p += '\n				';
 for (index = 0; index < services.length; index ++) {
					service = services[index];
					;
__p += '\n					<a target="_blank" class="uberbox-share-link" href="' +
((__t = ( service.getShareLinkUrl(obj.model) )) == null ? '' : __t) +
'" >\n							';
 if (service.get('image')) { ;
__p += '\n								<img src="' +
((__t = ( service.get('image') )) == null ? '' : __t) +
'" alt="">\n							';
 } else { ;
__p += '\n								<i class="uberbox-icon-' +
((__t = ( service.get('slug') )) == null ? '' : __t) +
'"></i>\n							';
 } ;
__p += '\n\n							';
 if (service.get('name')) { ;
__p += '\n								' +
((__t = ( service.get('name') )) == null ? '' : __t) +
'\n							';
 } ;
__p += '\n					</a>\n				';
 } ;
__p += '\n			</div>\n		</div>\n	';
 } ;
__p += '\n</div>\n';

}
return __p
}})();
(function() {
window["Uberbox"] = window["Uberbox"] || {};
window["Uberbox"]["Templates"] = window["Uberbox"]["Templates"] || {};

window["Uberbox"]["Templates"]["uberbox"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class="uberbox-toolbar-wrapper"></div>\n<div class="uberbox-lightbox-wrapper"></div>\n<div class="uberbox-carousel-wrapper"></div>';

}
return __p
}})();