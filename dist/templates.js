(function() {
window["Uberbox"] = window["Uberbox"] || {};
window["Uberbox"]["Templates"] = window["Uberbox"]["Templates"] || {};

window["Uberbox"]["Templates"]["carousel-item"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
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
var __t, __p = '', __e = _.escape;
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
var __t, __p = '', __e = _.escape;
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
var __t, __p = '', __e = _.escape;
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
var __t, __p = '', __e = _.escape;
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
var __t, __p = '', __e = _.escape;
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
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="uberbox-lightbox-item-content-wrapper">\n\t\t<div class="uberbox-item-object"></div>\n\t\t';
 if (obj.model.showDescription()) { ;
__p += '\n\t\t\t<div class="uberbox-item-description">\n\t\t\t\t';
 if (obj.model.get('title')) { ;
__p += '<h2>' +
((__t = ( obj.model.get('title') )) == null ? '' : __t) +
'</h2>';
 } ;
__p += '\n\t\t\t\t' +
((__t = ( obj.model.get('description') )) == null ? '' : __t) +
'\n\t\t\t</div>\n\t\t';
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
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="uberbox-lightbox-actions">\n\t<a href="#" data-action="close"><i class="uberbox-icon-close"></i></a>\n\t';
 if (Uberbox.Utils.supportsFullScreen()) { ;
__p += '\n\t\t<a href="#" data-action="fullscreen">\n\t\t\t<i class="uberbox-icon-fullscreen"></i>\n\t\t\t<span class="uberbox-tooltip">' +
((__t = ( obj.model.get('fullscreen_tooltip' ))) == null ? '' : __t) +
'</span>\n\t\t</a>\n\t\t<a href="#" data-action="exit-fullscreen" class="uberbox-disabled" >\n\t\t\t<i class="uberbox-icon-exit-fullscreen"></i>\n\t\t\t<span class="uberbox-tooltip">' +
((__t = ( obj.model.get('exit_fullscreen_tooltip' ))) == null ? '' : __t) +
'</span>\n\t\t</a>\n\t';
 } ;
__p += '\n\t';
 if (obj.model.get('download_url')) { ;
__p += '\n\t\t<a data-action="download" download href="' +
((__t = ( obj.model.get('download_url') )) == null ? '' : __t) +
'" target="_blank">\n\t\t\t<i class="uberbox-icon-download"></i>\n\t\t\t<span class="uberbox-tooltip">' +
((__t = ( obj.model.get('download_tooltip') )) == null ? '' : __t) +
'</span>\n\t\t</a>\n\t';
 } ;
__p += '\n\t';
 if (services = obj.model.get('share')) { ;
__p += '\n\t\t<div href="#" data-action="share">\n\t\t\t<i class="uberbox-icon-share"></i>\n\t\t\t<span class="uberbox-tooltip">' +
((__t = ( obj.model.get('share_tooltip') )) == null ? '' : __t) +
'</span>\n\t\t\t<div class="uberbox-share-menu">\n\t\t\t\t';
 var index ;
__p += '\n\t\t\t\t';
 for (index = 0; index < services.length; index ++) {
					service = services[index];
					;
__p += '\n\t\t\t\t\t<a target="_blank" class="uberbox-share-link" href="' +
((__t = ( service.getShareLinkUrl(obj.model) )) == null ? '' : __t) +
'" >\n\t\t\t\t\t\t\t';
 if (service.get('image')) { ;
__p += '\n\t\t\t\t\t\t\t\t<img src="' +
((__t = ( service.get('image') )) == null ? '' : __t) +
'" alt="">\n\t\t\t\t\t\t\t';
 } else { ;
__p += '\n\t\t\t\t\t\t\t\t<i class="uberbox-icon-' +
((__t = ( service.get('slug') )) == null ? '' : __t) +
'"></i>\n\t\t\t\t\t\t\t';
 } ;
__p += '\n\n\t\t\t\t\t\t\t';
 if (service.get('name')) { ;
__p += '\n\t\t\t\t\t\t\t\t' +
((__t = ( service.get('name') )) == null ? '' : __t) +
'\n\t\t\t\t\t\t\t';
 } ;
__p += '\n\t\t\t\t\t</a>\n\t\t\t\t';
 } ;
__p += '\n\t\t\t</div>\n\t\t</div>\n\t';
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
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="uberbox-toolbar-wrapper"></div>\n<div class="uberbox-lightbox-wrapper"></div>\n<div class="uberbox-carousel-wrapper"></div>';

}
return __p
}})();