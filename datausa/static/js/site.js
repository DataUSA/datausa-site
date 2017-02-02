/**
 * A class to parse color values
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
 * @license Use it if you like it
 */

(function ( global ) {

	function RGBColor(color_string)
	{
		this.ok = false;

		// strip any leading #
		if (color_string.charAt(0) == '#') { // remove # if any
			color_string = color_string.substr(1,6);
		}

		color_string = color_string.replace(/ /g,'');
		color_string = color_string.toLowerCase();

		// before getting into regexps, try simple matches
		// and overwrite the input
		var simple_colors = {
			aliceblue: 'f0f8ff',
			antiquewhite: 'faebd7',
			aqua: '00ffff',
			aquamarine: '7fffd4',
			azure: 'f0ffff',
			beige: 'f5f5dc',
			bisque: 'ffe4c4',
			black: '000000',
			blanchedalmond: 'ffebcd',
			blue: '0000ff',
			blueviolet: '8a2be2',
			brown: 'a52a2a',
			burlywood: 'deb887',
			cadetblue: '5f9ea0',
			chartreuse: '7fff00',
			chocolate: 'd2691e',
			coral: 'ff7f50',
			cornflowerblue: '6495ed',
			cornsilk: 'fff8dc',
			crimson: 'dc143c',
			cyan: '00ffff',
			darkblue: '00008b',
			darkcyan: '008b8b',
			darkgoldenrod: 'b8860b',
			darkgray: 'a9a9a9',
			darkgreen: '006400',
			darkkhaki: 'bdb76b',
			darkmagenta: '8b008b',
			darkolivegreen: '556b2f',
			darkorange: 'ff8c00',
			darkorchid: '9932cc',
			darkred: '8b0000',
			darksalmon: 'e9967a',
			darkseagreen: '8fbc8f',
			darkslateblue: '483d8b',
			darkslategray: '2f4f4f',
			darkturquoise: '00ced1',
			darkviolet: '9400d3',
			deeppink: 'ff1493',
			deepskyblue: '00bfff',
			dimgray: '696969',
			dodgerblue: '1e90ff',
			feldspar: 'd19275',
			firebrick: 'b22222',
			floralwhite: 'fffaf0',
			forestgreen: '228b22',
			fuchsia: 'ff00ff',
			gainsboro: 'dcdcdc',
			ghostwhite: 'f8f8ff',
			gold: 'ffd700',
			goldenrod: 'daa520',
			gray: '808080',
			green: '008000',
			greenyellow: 'adff2f',
			honeydew: 'f0fff0',
			hotpink: 'ff69b4',
			indianred : 'cd5c5c',
			indigo : '4b0082',
			ivory: 'fffff0',
			khaki: 'f0e68c',
			lavender: 'e6e6fa',
			lavenderblush: 'fff0f5',
			lawngreen: '7cfc00',
			lemonchiffon: 'fffacd',
			lightblue: 'add8e6',
			lightcoral: 'f08080',
			lightcyan: 'e0ffff',
			lightgoldenrodyellow: 'fafad2',
			lightgrey: 'd3d3d3',
			lightgreen: '90ee90',
			lightpink: 'ffb6c1',
			lightsalmon: 'ffa07a',
			lightseagreen: '20b2aa',
			lightskyblue: '87cefa',
			lightslateblue: '8470ff',
			lightslategray: '778899',
			lightsteelblue: 'b0c4de',
			lightyellow: 'ffffe0',
			lime: '00ff00',
			limegreen: '32cd32',
			linen: 'faf0e6',
			magenta: 'ff00ff',
			maroon: '800000',
			mediumaquamarine: '66cdaa',
			mediumblue: '0000cd',
			mediumorchid: 'ba55d3',
			mediumpurple: '9370d8',
			mediumseagreen: '3cb371',
			mediumslateblue: '7b68ee',
			mediumspringgreen: '00fa9a',
			mediumturquoise: '48d1cc',
			mediumvioletred: 'c71585',
			midnightblue: '191970',
			mintcream: 'f5fffa',
			mistyrose: 'ffe4e1',
			moccasin: 'ffe4b5',
			navajowhite: 'ffdead',
			navy: '000080',
			oldlace: 'fdf5e6',
			olive: '808000',
			olivedrab: '6b8e23',
			orange: 'ffa500',
			orangered: 'ff4500',
			orchid: 'da70d6',
			palegoldenrod: 'eee8aa',
			palegreen: '98fb98',
			paleturquoise: 'afeeee',
			palevioletred: 'd87093',
			papayawhip: 'ffefd5',
			peachpuff: 'ffdab9',
			peru: 'cd853f',
			pink: 'ffc0cb',
			plum: 'dda0dd',
			powderblue: 'b0e0e6',
			purple: '800080',
			red: 'ff0000',
			rosybrown: 'bc8f8f',
			royalblue: '4169e1',
			saddlebrown: '8b4513',
			salmon: 'fa8072',
			sandybrown: 'f4a460',
			seagreen: '2e8b57',
			seashell: 'fff5ee',
			sienna: 'a0522d',
			silver: 'c0c0c0',
			skyblue: '87ceeb',
			slateblue: '6a5acd',
			slategray: '708090',
			snow: 'fffafa',
			springgreen: '00ff7f',
			steelblue: '4682b4',
			tan: 'd2b48c',
			teal: '008080',
			thistle: 'd8bfd8',
			tomato: 'ff6347',
			turquoise: '40e0d0',
			violet: 'ee82ee',
			violetred: 'd02090',
			wheat: 'f5deb3',
			white: 'ffffff',
			whitesmoke: 'f5f5f5',
			yellow: 'ffff00',
			yellowgreen: '9acd32'
		};
		for (var key in simple_colors) {
			if (color_string == key) {
				color_string = simple_colors[key];
			}
		}
		// emd of simple type-in colors

		// array of color definition objects
		var color_defs = [
			{
				re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
				example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
				process: function (bits){
					return [
						parseInt(bits[1]),
						parseInt(bits[2]),
						parseInt(bits[3])
					];
				}
			},
			{
				re: /^(\w{2})(\w{2})(\w{2})$/,
				example: ['#00ff00', '336699'],
				process: function (bits){
					return [
						parseInt(bits[1], 16),
						parseInt(bits[2], 16),
						parseInt(bits[3], 16)
					];
				}
			},
			{
				re: /^(\w{1})(\w{1})(\w{1})$/,
				example: ['#fb0', 'f0f'],
				process: function (bits){
					return [
						parseInt(bits[1] + bits[1], 16),
						parseInt(bits[2] + bits[2], 16),
						parseInt(bits[3] + bits[3], 16)
					];
				}
			}
		];

		// search through the definitions to find a match
		for (var i = 0; i < color_defs.length; i++) {
			var re = color_defs[i].re;
			var processor = color_defs[i].process;
			var bits = re.exec(color_string);
			if (bits) {
				channels = processor(bits);
				this.r = channels[0];
				this.g = channels[1];
				this.b = channels[2];
				this.ok = true;
			}

		}

		// validate/cleanup values
		this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
		this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
		this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);

		// some getters
		this.toRGB = function () {
			return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
		}
		this.toHex = function () {
			var r = this.r.toString(16);
			var g = this.g.toString(16);
			var b = this.b.toString(16);
			if (r.length == 1) r = '0' + r;
			if (g.length == 1) g = '0' + g;
			if (b.length == 1) b = '0' + b;
			return '#' + r + g + b;
		}

		// help
		this.getHelpXML = function () {

			var examples = new Array();
			// add regexps
			for (var i = 0; i < color_defs.length; i++) {
				var example = color_defs[i].example;
				for (var j = 0; j < example.length; j++) {
					examples[examples.length] = example[j];
				}
			}
			// add type-in colors
			for (var sc in simple_colors) {
				examples[examples.length] = sc;
			}

			var xml = document.createElement('ul');
			xml.setAttribute('id', 'rgbcolor-examples');
			for (var i = 0; i < examples.length; i++) {
				try {
					var list_item = document.createElement('li');
					var list_color = new RGBColor(examples[i]);
					var example_div = document.createElement('div');
					example_div.style.cssText =
							'margin: 3px; '
							+ 'border: 1px solid black; '
							+ 'background:' + list_color.toHex() + '; '
							+ 'color:' + list_color.toHex()
					;
					example_div.appendChild(document.createTextNode('test'));
					var list_item_value = document.createTextNode(
						' ' + examples[i] + ' -> ' + list_color.toRGB() + ' -> ' + list_color.toHex()
					);
					list_item.appendChild(example_div);
					list_item.appendChild(list_item_value);
					xml.appendChild(list_item);

				} catch(e){}
			}
			return xml;

		}

	}

    // export as AMD...
    if ( typeof define !== 'undefined' && define.amd ) {
        define( function () { return RGBColor; });
    }

    // ...or as browserify
    else if ( typeof module !== 'undefined' && module.exports ) {
        module.exports = RGBColor;
    }

    global.RGBColor = RGBColor;

}( typeof window !== 'undefined' ? window : this ));

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||function(view){"use strict";if(typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var doc=view.document,get_URL=function(){return view.URL||view.webkitURL||view},save_link=doc.createElementNS("http://www.w3.org/1999/xhtml","a"),can_use_save_link="download"in save_link,click=function(node){var event=new MouseEvent("click");node.dispatchEvent(event)},is_safari=/Version\/[\d\.]+.*Safari/.test(navigator.userAgent),webkit_req_fs=view.webkitRequestFileSystem,req_fs=view.requestFileSystem||webkit_req_fs||view.mozRequestFileSystem,throw_outside=function(ex){(view.setImmediate||view.setTimeout)(function(){throw ex},0)},force_saveable_type="application/octet-stream",fs_min_size=0,arbitrary_revoke_timeout=500,revoke=function(file){var revoker=function(){if(typeof file==="string"){get_URL().revokeObjectURL(file)}else{file.remove()}};if(view.chrome){revoker()}else{setTimeout(revoker,arbitrary_revoke_timeout)}},dispatch=function(filesaver,event_types,event){event_types=[].concat(event_types);var i=event_types.length;while(i--){var listener=filesaver["on"+event_types[i]];if(typeof listener==="function"){try{listener.call(filesaver,event||filesaver)}catch(ex){throw_outside(ex)}}}},auto_bom=function(blob){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)){return new Blob(["\ufeff",blob],{type:blob.type})}return blob},FileSaver=function(blob,name,no_auto_bom){if(!no_auto_bom){blob=auto_bom(blob)}var filesaver=this,type=blob.type,blob_changed=false,object_url,target_view,dispatch_all=function(){dispatch(filesaver,"writestart progress write writeend".split(" "))},fs_error=function(){if(target_view&&is_safari&&typeof FileReader!=="undefined"){var reader=new FileReader;reader.onloadend=function(){var base64Data=reader.result;target_view.location.href="data:attachment/file"+base64Data.slice(base64Data.search(/[,;]/));filesaver.readyState=filesaver.DONE;dispatch_all()};reader.readAsDataURL(blob);filesaver.readyState=filesaver.INIT;return}if(blob_changed||!object_url){object_url=get_URL().createObjectURL(blob)}if(target_view){target_view.location.href=object_url}else{var new_tab=view.open(object_url,"_blank");if(new_tab==undefined&&is_safari){view.location.href=object_url}}filesaver.readyState=filesaver.DONE;dispatch_all();revoke(object_url)},abortable=function(func){return function(){if(filesaver.readyState!==filesaver.DONE){return func.apply(this,arguments)}}},create_if_not_found={create:true,exclusive:false},slice;filesaver.readyState=filesaver.INIT;if(!name){name="download"}if(can_use_save_link){object_url=get_URL().createObjectURL(blob);setTimeout(function(){save_link.href=object_url;save_link.download=name;click(save_link);dispatch_all();revoke(object_url);filesaver.readyState=filesaver.DONE});return}if(view.chrome&&type&&type!==force_saveable_type){slice=blob.slice||blob.webkitSlice;blob=slice.call(blob,0,blob.size,force_saveable_type);blob_changed=true}if(webkit_req_fs&&name!=="download"){name+=".download"}if(type===force_saveable_type||webkit_req_fs){target_view=view}if(!req_fs){fs_error();return}fs_min_size+=blob.size;req_fs(view.TEMPORARY,fs_min_size,abortable(function(fs){fs.root.getDirectory("saved",create_if_not_found,abortable(function(dir){var save=function(){dir.getFile(name,create_if_not_found,abortable(function(file){file.createWriter(abortable(function(writer){writer.onwriteend=function(event){target_view.location.href=file.toURL();filesaver.readyState=filesaver.DONE;dispatch(filesaver,"writeend",event);revoke(file)};writer.onerror=function(){var error=writer.error;if(error.code!==error.ABORT_ERR){fs_error()}};"writestart progress write abort".split(" ").forEach(function(event){writer["on"+event]=filesaver["on"+event]});writer.write(blob);filesaver.abort=function(){writer.abort();filesaver.readyState=filesaver.DONE};filesaver.readyState=filesaver.WRITING}),fs_error)}),fs_error)};dir.getFile(name,{create:false},abortable(function(file){file.remove();save()}),abortable(function(ex){if(ex.code===ex.NOT_FOUND_ERR){save()}else{fs_error()}}))}),fs_error)}),fs_error)},FS_proto=FileSaver.prototype,saveAs=function(blob,name,no_auto_bom){return new FileSaver(blob,name,no_auto_bom)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(blob,name,no_auto_bom){if(!no_auto_bom){blob=auto_bom(blob)}return navigator.msSaveOrOpenBlob(blob,name||"download")}}FS_proto.abort=function(){var filesaver=this;filesaver.readyState=filesaver.DONE;dispatch(filesaver,"abort")};FS_proto.readyState=FS_proto.INIT=0;FS_proto.WRITING=1;FS_proto.DONE=2;FS_proto.error=FS_proto.onwritestart=FS_proto.onprogress=FS_proto.onwrite=FS_proto.onabort=FS_proto.onerror=FS_proto.onwriteend=null;return saveAs}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!=null){define([],function(){return saveAs})}

/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version: 	0.5
Author:		Mario Klingemann
Contact: 	mario@quasimondo.com
Website:	http://www.quasimondo.com/StackBlurForCanvas
Twitter:	@quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr:
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

(function ( global ) {

	var mul_table = [
			512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,
			454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,
			482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,
			437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,
			497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,
			320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,
			446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,
			329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,
			505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,
			399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,
			324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,
			268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,
			451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,
			385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,
			332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,
			289,287,285,282,280,278,275,273,271,269,267,265,263,261,259];


	var shg_table = [
			 9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
			17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
			19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
			20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
			21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
			21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
			22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
			22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
			23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
			23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
			23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
			23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
			24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
			24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
			24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
			24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];

	function premultiplyAlpha(imageData)
	{
		var pixels = imageData.data;
		var size = imageData.width * imageData.height * 4;

		for (var i=0; i<size; i+=4)
		{
			var a = pixels[i+3] / 255;
			pixels[i  ] *= a;
			pixels[i+1] *= a;
			pixels[i+2] *= a;
		}
	}

	function unpremultiplyAlpha(imageData)
	{
		var pixels = imageData.data;
		var size = imageData.width * imageData.height * 4;

		for (var i=0; i<size; i+=4)
		{
			var a = pixels[i+3];
			if (a != 0)
			{
				a = 255 / a;
				pixels[i  ] *= a;
				pixels[i+1] *= a;
				pixels[i+2] *= a;
			}
		}
	}

	function stackBlurImage( imageID, canvasID, radius, blurAlphaChannel )
	{

		var img = document.getElementById( imageID );
		var w = img.naturalWidth;
		var h = img.naturalHeight;

		var canvas = document.getElementById( canvasID );

		canvas.style.width  = w + "px";
		canvas.style.height = h + "px";
		canvas.width = w;
		canvas.height = h;

		var context = canvas.getContext("2d");
		context.clearRect( 0, 0, w, h );
		context.drawImage( img, 0, 0 );

		if ( isNaN(radius) || radius < 1 ) return;

		if ( blurAlphaChannel )
			stackBlurCanvasRGBA( canvasID, 0, 0, w, h, radius );
		else
			stackBlurCanvasRGB( canvasID, 0, 0, w, h, radius );
	}


	function stackBlurCanvasRGBA( id, top_x, top_y, width, height, radius )
	{
		if ( isNaN(radius) || radius < 1 ) return;
		radius |= 0;

		var canvas  = document.getElementById( id );
		var context = canvas.getContext("2d");
		var imageData;

		try {
		  try {
			imageData = context.getImageData( top_x, top_y, width, height );
		  } catch(e) {

			// NOTE: this part is supposedly only needed if you want to work with local files
			// so it might be okay to remove the whole try/catch block and just use
			// imageData = context.getImageData( top_x, top_y, width, height );
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
				imageData = context.getImageData( top_x, top_y, width, height );
			} catch(e) {
				alert("Cannot access local image");
				throw new Error("unable to access local image data: " + e);
				return;
			}
		  }
		} catch(e) {
		  alert("Cannot access image");
		  throw new Error("unable to access image data: " + e);
		}

		premultiplyAlpha(imageData);

		var pixels = imageData.data;

		var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum,
		r_out_sum, g_out_sum, b_out_sum, a_out_sum,
		r_in_sum, g_in_sum, b_in_sum, a_in_sum,
		pr, pg, pb, pa, rbs;

		var div = radius + radius + 1;
		var w4 = width << 2;
		var widthMinus1  = width - 1;
		var heightMinus1 = height - 1;
		var radiusPlus1  = radius + 1;
		var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;

		var stackStart = new BlurStack();
		var stack = stackStart;
		for ( i = 1; i < div; i++ )
		{
			stack = stack.next = new BlurStack();
			if ( i == radiusPlus1 ) var stackEnd = stack;
		}
		stack.next = stackStart;
		var stackIn = null;
		var stackOut = null;

		yw = yi = 0;

		var mul_sum = mul_table[radius];
		var shg_sum = shg_table[radius];

		for ( y = 0; y < height; y++ )
		{
			r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

			r_out_sum = radiusPlus1 * ( pr = pixels[yi] );
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1] );
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2] );
			a_out_sum = radiusPlus1 * ( pa = pixels[yi+3] );

			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;
			a_sum += sumFactor * pa;

			stack = stackStart;

			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack.a = pa;
				stack = stack.next;
			}

			for( i = 1; i < radiusPlus1; i++ )
			{
				p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
				r_sum += ( stack.r = ( pr = pixels[p])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[p+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[p+2])) * rbs;
				a_sum += ( stack.a = ( pa = pixels[p+3])) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;
				a_in_sum += pa;

				stack = stack.next;
			}

			stackIn = stackStart;
			stackOut = stackEnd;
			for ( x = 0; x < width; x++ )
			{
				pixels[yi]   = (r_sum * mul_sum) >> shg_sum;
				pixels[yi+1] = (g_sum * mul_sum) >> shg_sum;
				pixels[yi+2] = (b_sum * mul_sum) >> shg_sum;
				pixels[yi+3] = (a_sum * mul_sum) >> shg_sum;

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;
				a_sum -= a_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;
				a_out_sum -= stackIn.a;

				p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;

				r_in_sum += ( stackIn.r = pixels[p]);
				g_in_sum += ( stackIn.g = pixels[p+1]);
				b_in_sum += ( stackIn.b = pixels[p+2]);
				a_in_sum += ( stackIn.a = pixels[p+3]);

				r_sum += r_in_sum;
				g_sum += g_in_sum;
				b_sum += b_in_sum;
				a_sum += a_in_sum;

				stackIn = stackIn.next;

				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );
				a_out_sum += ( pa = stackOut.a );

				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;
				a_in_sum -= pa;

				stackOut = stackOut.next;

				yi += 4;
			}
			yw += width;
		}


		for ( x = 0; x < width; x++ )
		{
			g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

			yi = x << 2;
			r_out_sum = radiusPlus1 * ( pr = pixels[yi]);
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1]);
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2]);
			a_out_sum = radiusPlus1 * ( pa = pixels[yi+3]);

			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;
			a_sum += sumFactor * pa;

			stack = stackStart;

			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack.a = pa;
				stack = stack.next;
			}

			yp = width;

			for( i = 1; i <= radius; i++ )
			{
				yi = ( yp + x ) << 2;

				r_sum += ( stack.r = ( pr = pixels[yi])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[yi+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[yi+2])) * rbs;
				a_sum += ( stack.a = ( pa = pixels[yi+3])) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;
				a_in_sum += pa;

				stack = stack.next;

				if( i < heightMinus1 )
				{
					yp += width;
				}
			}

			yi = x;
			stackIn = stackStart;
			stackOut = stackEnd;
			for ( y = 0; y < height; y++ )
			{
				p = yi << 2;
				pixels[p]   = (r_sum * mul_sum) >> shg_sum;
				pixels[p+1] = (g_sum * mul_sum) >> shg_sum;
				pixels[p+2] = (b_sum * mul_sum) >> shg_sum;
				pixels[p+3] = (a_sum * mul_sum) >> shg_sum;

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;
				a_sum -= a_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;
				a_out_sum -= stackIn.a;

				p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;

				r_sum += ( r_in_sum += ( stackIn.r = pixels[p]));
				g_sum += ( g_in_sum += ( stackIn.g = pixels[p+1]));
				b_sum += ( b_in_sum += ( stackIn.b = pixels[p+2]));
				a_sum += ( a_in_sum += ( stackIn.a = pixels[p+3]));

				stackIn = stackIn.next;

				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );
				a_out_sum += ( pa = stackOut.a );

				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;
				a_in_sum -= pa;

				stackOut = stackOut.next;

				yi += width;
			}
		}

		unpremultiplyAlpha(imageData);

		context.putImageData( imageData, top_x, top_y );
	}


	function stackBlurCanvasRGB( id, top_x, top_y, width, height, radius )
	{
		if ( isNaN(radius) || radius < 1 ) return;
		radius |= 0;

		var canvas  = document.getElementById( id );
		var context = canvas.getContext("2d");
		var imageData;

		try {
		  try {
			imageData = context.getImageData( top_x, top_y, width, height );
		  } catch(e) {

			// NOTE: this part is supposedly only needed if you want to work with local files
			// so it might be okay to remove the whole try/catch block and just use
			// imageData = context.getImageData( top_x, top_y, width, height );
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
				imageData = context.getImageData( top_x, top_y, width, height );
			} catch(e) {
				alert("Cannot access local image");
				throw new Error("unable to access local image data: " + e);
				return;
			}
		  }
		} catch(e) {
		  alert("Cannot access image");
		  throw new Error("unable to access image data: " + e);
		}

		var pixels = imageData.data;

		var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum,
		r_out_sum, g_out_sum, b_out_sum,
		r_in_sum, g_in_sum, b_in_sum,
		pr, pg, pb, rbs;

		var div = radius + radius + 1;
		var w4 = width << 2;
		var widthMinus1  = width - 1;
		var heightMinus1 = height - 1;
		var radiusPlus1  = radius + 1;
		var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;

		var stackStart = new BlurStack();
		var stack = stackStart;
		for ( i = 1; i < div; i++ )
		{
			stack = stack.next = new BlurStack();
			if ( i == radiusPlus1 ) var stackEnd = stack;
		}
		stack.next = stackStart;
		var stackIn = null;
		var stackOut = null;

		yw = yi = 0;

		var mul_sum = mul_table[radius];
		var shg_sum = shg_table[radius];

		for ( y = 0; y < height; y++ )
		{
			r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;

			r_out_sum = radiusPlus1 * ( pr = pixels[yi] );
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1] );
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2] );

			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;

			stack = stackStart;

			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}

			for( i = 1; i < radiusPlus1; i++ )
			{
				p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
				r_sum += ( stack.r = ( pr = pixels[p])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[p+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[p+2])) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;

				stack = stack.next;
			}


			stackIn = stackStart;
			stackOut = stackEnd;
			for ( x = 0; x < width; x++ )
			{
				pixels[yi]   = (r_sum * mul_sum) >> shg_sum;
				pixels[yi+1] = (g_sum * mul_sum) >> shg_sum;
				pixels[yi+2] = (b_sum * mul_sum) >> shg_sum;

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;

				p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;

				r_in_sum += ( stackIn.r = pixels[p]);
				g_in_sum += ( stackIn.g = pixels[p+1]);
				b_in_sum += ( stackIn.b = pixels[p+2]);

				r_sum += r_in_sum;
				g_sum += g_in_sum;
				b_sum += b_in_sum;

				stackIn = stackIn.next;

				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );

				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;

				stackOut = stackOut.next;

				yi += 4;
			}
			yw += width;
		}


		for ( x = 0; x < width; x++ )
		{
			g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;

			yi = x << 2;
			r_out_sum = radiusPlus1 * ( pr = pixels[yi]);
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1]);
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2]);

			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;

			stack = stackStart;

			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}

			yp = width;

			for( i = 1; i <= radius; i++ )
			{
				yi = ( yp + x ) << 2;

				r_sum += ( stack.r = ( pr = pixels[yi])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[yi+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[yi+2])) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;

				stack = stack.next;

				if( i < heightMinus1 )
				{
					yp += width;
				}
			}

			yi = x;
			stackIn = stackStart;
			stackOut = stackEnd;
			for ( y = 0; y < height; y++ )
			{
				p = yi << 2;
				pixels[p]   = (r_sum * mul_sum) >> shg_sum;
				pixels[p+1] = (g_sum * mul_sum) >> shg_sum;
				pixels[p+2] = (b_sum * mul_sum) >> shg_sum;

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;

				p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;

				r_sum += ( r_in_sum += ( stackIn.r = pixels[p]));
				g_sum += ( g_in_sum += ( stackIn.g = pixels[p+1]));
				b_sum += ( b_in_sum += ( stackIn.b = pixels[p+2]));

				stackIn = stackIn.next;

				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );

				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;

				stackOut = stackOut.next;

				yi += width;
			}
		}

		context.putImageData( imageData, top_x, top_y );

	}

	function BlurStack()
	{
		this.r = 0;
		this.g = 0;
		this.b = 0;
		this.a = 0;
		this.next = null;
	}

	var stackBlur = {
		image: stackBlurImage,
		canvasRGBA: stackBlurCanvasRGBA,
		canvasRGB: stackBlurCanvasRGB
	};

	// export as AMD...
	if ( typeof define !== 'undefined' && define.amd ) {
	    define( function () { return stackBlur; });
	}

	// ...or as browserify
	else if ( typeof module !== 'undefined' && module.exports ) {
	    module.exports = stackBlur;
	}

	global.stackBlur = stackBlur;

}( typeof window !== 'undefined' ? window : this ));

/* canvas-toBlob.js
 * A canvas.toBlob() implementation.
 * 2013-12-27
 * 
 * By Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr
 * License: MIT
 *   See https://github.com/eligrey/canvas-toBlob.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js */

(function(view) {
"use strict";
var
	  Uint8Array = view.Uint8Array
	, HTMLCanvasElement = view.HTMLCanvasElement
	, canvas_proto = HTMLCanvasElement && HTMLCanvasElement.prototype
	, is_base64_regex = /\s*;\s*base64\s*(?:;|$)/i
	, to_data_url = "toDataURL"
	, base64_ranks
	, decode_base64 = function(base64) {
		var
			  len = base64.length
			, buffer = new Uint8Array(len / 4 * 3 | 0)
			, i = 0
			, outptr = 0
			, last = [0, 0]
			, state = 0
			, save = 0
			, rank
			, code
			, undef
		;
		while (len--) {
			code = base64.charCodeAt(i++);
			rank = base64_ranks[code-43];
			if (rank !== 255 && rank !== undef) {
				last[1] = last[0];
				last[0] = code;
				save = (save << 6) | rank;
				state++;
				if (state === 4) {
					buffer[outptr++] = save >>> 16;
					if (last[1] !== 61 /* padding character */) {
						buffer[outptr++] = save >>> 8;
					}
					if (last[0] !== 61 /* padding character */) {
						buffer[outptr++] = save;
					}
					state = 0;
				}
			}
		}
		// 2/3 chance there's going to be some null bytes at the end, but that
		// doesn't really matter with most image formats.
		// If it somehow matters for you, truncate the buffer up outptr.
		return buffer;
	}
;
if (Uint8Array) {
	base64_ranks = new Uint8Array([
		  62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1
		, -1, -1,  0, -1, -1, -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9
		, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
		, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35
		, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
	]);
}
if (HTMLCanvasElement && !canvas_proto.toBlob) {
	canvas_proto.toBlob = function(callback, type /*, ...args*/) {
		  if (!type) {
			type = "image/png";
		} if (this.mozGetAsFile) {
			callback(this.mozGetAsFile("canvas", type));
			return;
		} if (this.msToBlob && /^\s*image\/png\s*(?:$|;)/i.test(type)) {
			callback(this.msToBlob());
			return;
		}

		var
			  args = Array.prototype.slice.call(arguments, 1)
			, dataURI = this[to_data_url].apply(this, args)
			, header_end = dataURI.indexOf(",")
			, data = dataURI.substring(header_end + 1)
			, is_base64 = is_base64_regex.test(dataURI.substring(0, header_end))
			, blob
		;
		if (Blob.fake) {
			// no reason to decode a data: URI that's just going to become a data URI again
			blob = new Blob
			if (is_base64) {
				blob.encoding = "base64";
			} else {
				blob.encoding = "URI";
			}
			blob.data = data;
			blob.size = data.length;
		} else if (Uint8Array) {
			if (is_base64) {
				blob = new Blob([decode_base64(data)], {type: type});
			} else {
				blob = new Blob([decodeURIComponent(data)], {type: type});
			}
		}
		callback(blob);
	};

	if (canvas_proto.toDataURLHD) {
		canvas_proto.toBlobHD = function() {
			to_data_url = "toDataURLHD";
			var blob = this.toBlob();
			to_data_url = "toDataURL";
			return blob;
		}
	} else {
		canvas_proto.toBlobHD = canvas_proto.toBlob;
	}
}
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content || this));

/*
 * canvg.js - Javascript SVG parser and renderer on Canvas
 * MIT Licensed
 * Gabe Lerner (gabelerner@gmail.com)
 * http://code.google.com/p/canvg/
 *
 * Requires: rgbcolor.js - http://www.phpied.com/rgb-color-parser-in-javascript/
 */
 (function ( global, factory ) {

	'use strict';

	// export as AMD...
	if ( typeof define !== 'undefined' && define.amd ) {
		define('canvgModule', [ 'rgbcolor', 'stackblur' ], factory );
	}

	// ...or as browserify
	else if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = factory( require( 'rgbcolor' ), require( 'stackblur' ) );
	}

	global.canvg = factory( global.RGBColor, global.stackBlur );

}( typeof window !== 'undefined' ? window : this, function ( RGBColor, stackBlur ) {

	// canvg(target, s)
	// empty parameters: replace all 'svg' elements on page with 'canvas' elements
	// target: canvas element or the id of a canvas element
	// s: svg string, url to svg file, or xml document
	// opts: optional hash of options
	//		 ignoreMouse: true => ignore mouse events
	//		 ignoreAnimation: true => ignore animations
	//		 ignoreDimensions: true => does not try to resize canvas
	//		 ignoreClear: true => does not clear canvas
	//		 offsetX: int => draws at a x offset
	//		 offsetY: int => draws at a y offset
	//		 scaleWidth: int => scales horizontally to width
	//		 scaleHeight: int => scales vertically to height
	//		 renderCallback: function => will call the function after the first render is completed
	//		 forceRedraw: function => will call the function on every frame, if it returns true, will redraw
	var canvg = function (target, s, opts) {
		// no parameters
		if (target == null && s == null && opts == null) {
			var svgTags = document.querySelectorAll('svg');
			for (var i=0; i<svgTags.length; i++) {
				var svgTag = svgTags[i];
				var c = document.createElement('canvas');
				c.width = svgTag.clientWidth;
				c.height = svgTag.clientHeight;
				svgTag.parentNode.insertBefore(c, svgTag);
				svgTag.parentNode.removeChild(svgTag);
				var div = document.createElement('div');
				div.appendChild(svgTag);
				canvg(c, div.innerHTML);
			}
			return;
		}

		if (typeof target == 'string') {
			target = document.getElementById(target);
		}

		// store class on canvas
		if (target.svg != null) target.svg.stop();
		var svg = build(opts || {});
		// on i.e. 8 for flash canvas, we can't assign the property so check for it
		if (!(target.childNodes.length == 1 && target.childNodes[0].nodeName == 'OBJECT')) target.svg = svg;

		var ctx = target.getContext('2d');
		if (typeof s.documentElement != 'undefined') {
			// load from xml doc
			svg.loadXmlDoc(ctx, s);
		}
		else if (s.substr(0,1) == '<') {
			// load from xml string
			svg.loadXml(ctx, s);
		}
		else {
			// load from url
			svg.load(ctx, s);
		}
	}

	// see https://developer.mozilla.org/en-US/docs/Web/API/Element.matches
	var matchesSelector;
	if (typeof Element.prototype.matches != 'undefined') {
		matchesSelector = function(node, selector) {
			return node.matches(selector);
		};
	} else if (typeof Element.prototype.webkitMatchesSelector != 'undefined') {
		matchesSelector = function(node, selector) {
			return node.webkitMatchesSelector(selector);
		};
	} else if (typeof Element.prototype.mozMatchesSelector != 'undefined') {
		matchesSelector = function(node, selector) {
			return node.mozMatchesSelector(selector);
		};
	} else if (typeof Element.prototype.msMatchesSelector != 'undefined') {
		matchesSelector = function(node, selector) {
			return node.msMatchesSelector(selector);
		};
	} else if (typeof Element.prototype.oMatchesSelector != 'undefined') {
		matchesSelector = function(node, selector) {
			return node.oMatchesSelector(selector);
		};
	} else {
		// requires Sizzle: https://github.com/jquery/sizzle/wiki/Sizzle-Documentation
		// or jQuery: http://jquery.com/download/
		// or Zepto: http://zeptojs.com/#
		// without it, this is a ReferenceError

		if (typeof jQuery === 'function' || typeof Zepto === 'function') {
			matchesSelector = function (node, selector) {
				return $(node).is(selector);
			};
		}

		if (typeof matchesSelector === 'undefined') {
			matchesSelector = Sizzle.matchesSelector;
		}
	}

	// slightly modified version of https://github.com/keeganstreet/specificity/blob/master/specificity.js
	var attributeRegex = /(\[[^\]]+\])/g;
	var idRegex = /(#[^\s\+>~\.\[:]+)/g;
	var classRegex = /(\.[^\s\+>~\.\[:]+)/g;
	var pseudoElementRegex = /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi;
	var pseudoClassWithBracketsRegex = /(:[\w-]+\([^\)]*\))/gi;
	var pseudoClassRegex = /(:[^\s\+>~\.\[:]+)/g;
	var elementRegex = /([^\s\+>~\.\[:]+)/g;
	function getSelectorSpecificity(selector) {
		var typeCount = [0, 0, 0];
		var findMatch = function(regex, type) {
			var matches = selector.match(regex);
			if (matches == null) {
				return;
			}
			typeCount[type] += matches.length;
			selector = selector.replace(regex, ' ');
		};

		selector = selector.replace(/:not\(([^\)]*)\)/g, '     $1 ');
		selector = selector.replace(/{[^]*/gm, ' ');
		findMatch(attributeRegex, 1);
		findMatch(idRegex, 0);
		findMatch(classRegex, 1);
		findMatch(pseudoElementRegex, 2);
		findMatch(pseudoClassWithBracketsRegex, 1);
		findMatch(pseudoClassRegex, 1);
		selector = selector.replace(/[\*\s\+>~]/g, ' ');
		selector = selector.replace(/[#\.]/g, ' ');
		findMatch(elementRegex, 2);
		return typeCount.join('');
	}

	function build(opts) {
		var svg = { opts: opts };

		svg.FRAMERATE = 30;
		svg.MAX_VIRTUAL_PIXELS = 30000;

		svg.log = function(msg) {};
		if (svg.opts['log'] == true && typeof console != 'undefined') {
			svg.log = function(msg) { console.log(msg); };
		};

		// globals
		svg.init = function(ctx) {
			var uniqueId = 0;
			svg.UniqueId = function () { uniqueId++; return 'canvg' + uniqueId;	};
			svg.Definitions = {};
			svg.Styles = {};
			svg.StylesSpecificity = {};
			svg.Animations = [];
			svg.Images = [];
			svg.ctx = ctx;
			svg.ViewPort = new (function () {
				this.viewPorts = [];
				this.Clear = function() { this.viewPorts = []; }
				this.SetCurrent = function(width, height) { this.viewPorts.push({ width: width, height: height }); }
				this.RemoveCurrent = function() { this.viewPorts.pop(); }
				this.Current = function() { return this.viewPorts[this.viewPorts.length - 1]; }
				this.width = function() { return this.Current().width; }
				this.height = function() { return this.Current().height; }
				this.ComputeSize = function(d) {
					if (d != null && typeof d == 'number') return d;
					if (d == 'x') return this.width();
					if (d == 'y') return this.height();
					return Math.sqrt(Math.pow(this.width(), 2) + Math.pow(this.height(), 2)) / Math.sqrt(2);
				}
			});
		}
		svg.init();

		// images loaded
		svg.ImagesLoaded = function() {
			for (var i=0; i<svg.Images.length; i++) {
				if (!svg.Images[i].loaded) return false;
			}
			return true;
		}

		// trim
		svg.trim = function(s) { return s.replace(/^\s+|\s+$/g, ''); }

		// compress spaces
		svg.compressSpaces = function(s) { return s.replace(/[\s\r\t\n]+/gm,' '); }

		// ajax
		svg.ajax = function(url) {
			var AJAX;
			if(window.XMLHttpRequest){AJAX=new XMLHttpRequest();}
			else{AJAX=new ActiveXObject('Microsoft.XMLHTTP');}
			if(AJAX){
			   AJAX.open('GET',url,false);
			   AJAX.send(null);
			   return AJAX.responseText;
			}
			return null;
		}

		// parse xml
		svg.parseXml = function(xml) {
			if (typeof Windows != 'undefined' && typeof Windows.Data != 'undefined' && typeof Windows.Data.Xml != 'undefined') {
				var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
				var settings = new Windows.Data.Xml.Dom.XmlLoadSettings();
				settings.prohibitDtd = false;
				xmlDoc.loadXml(xml, settings);
				return xmlDoc;
			}
			else if (window.DOMParser)
			{
				var parser = new DOMParser();
				return parser.parseFromString(xml, 'text/xml');
			}
			else
			{
				xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
				var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
				xmlDoc.async = 'false';
				xmlDoc.loadXML(xml);
				return xmlDoc;
			}
		}

		svg.Property = function(name, value) {
			this.name = name;
			this.value = value;
		}
			svg.Property.prototype.getValue = function() {
				return this.value;
			}

			svg.Property.prototype.hasValue = function() {
				return (this.value != null && this.value !== '');
			}

			// return the numerical value of the property
			svg.Property.prototype.numValue = function() {
				if (!this.hasValue()) return 0;

				var n = parseFloat(this.value);
				if ((this.value + '').match(/%$/)) {
					n = n / 100.0;
				}
				return n;
			}

			svg.Property.prototype.valueOrDefault = function(def) {
				if (this.hasValue()) return this.value;
				return def;
			}

			svg.Property.prototype.numValueOrDefault = function(def) {
				if (this.hasValue()) return this.numValue();
				return def;
			}

			// color extensions
				// augment the current color value with the opacity
				svg.Property.prototype.addOpacity = function(opacityProp) {
					var newValue = this.value;
					if (opacityProp.value != null && opacityProp.value != '' && typeof this.value == 'string') { // can only add opacity to colors, not patterns
						var color = new RGBColor(this.value);
						if (color.ok) {
							newValue = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + opacityProp.numValue() + ')';
						}
					}
					return new svg.Property(this.name, newValue);
				}

			// definition extensions
				// get the definition from the definitions table
				svg.Property.prototype.getDefinition = function() {
					var name = this.value.match(/#([^\)'"]+)/);
					if (name) { name = name[1]; }
					if (!name) { name = this.value; }
					return svg.Definitions[name];
				}

				svg.Property.prototype.isUrlDefinition = function() {
					return this.value.indexOf('url(') == 0
				}

				svg.Property.prototype.getFillStyleDefinition = function(e, opacityProp) {
					var def = this.getDefinition();

					// gradient
					if (def != null && def.createGradient) {
						return def.createGradient(svg.ctx, e, opacityProp);
					}

					// pattern
					if (def != null && def.createPattern) {
						if (def.getHrefAttribute().hasValue()) {
							var pt = def.attribute('patternTransform');
							def = def.getHrefAttribute().getDefinition();
							if (pt.hasValue()) { def.attribute('patternTransform', true).value = pt.value; }
						}
						return def.createPattern(svg.ctx, e);
					}

					return null;
				}

			// length extensions
				svg.Property.prototype.getDPI = function(viewPort) {
					return 96.0; // TODO: compute?
				}

				svg.Property.prototype.getEM = function(viewPort) {
					var em = 12;

					var fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
					if (fontSize.hasValue()) em = fontSize.toPixels(viewPort);

					return em;
				}

				svg.Property.prototype.getUnits = function() {
					var s = this.value+'';
					return s.replace(/[0-9\.\-]/g,'');
				}

				// get the length as pixels
				svg.Property.prototype.toPixels = function(viewPort, processPercent) {
					if (!this.hasValue()) return 0;
					var s = this.value+'';
					if (s.match(/em$/)) return this.numValue() * this.getEM(viewPort);
					if (s.match(/ex$/)) return this.numValue() * this.getEM(viewPort) / 2.0;
					if (s.match(/px$/)) return this.numValue();
					if (s.match(/pt$/)) return this.numValue() * this.getDPI(viewPort) * (1.0 / 72.0);
					if (s.match(/pc$/)) return this.numValue() * 15;
					if (s.match(/cm$/)) return this.numValue() * this.getDPI(viewPort) / 2.54;
					if (s.match(/mm$/)) return this.numValue() * this.getDPI(viewPort) / 25.4;
					if (s.match(/in$/)) return this.numValue() * this.getDPI(viewPort);
					if (s.match(/%$/)) return this.numValue() * svg.ViewPort.ComputeSize(viewPort);
					var n = this.numValue();
					if (processPercent && n < 1.0) return n * svg.ViewPort.ComputeSize(viewPort);
					return n;
				}

			// time extensions
				// get the time as milliseconds
				svg.Property.prototype.toMilliseconds = function() {
					if (!this.hasValue()) return 0;
					var s = this.value+'';
					if (s.match(/s$/)) return this.numValue() * 1000;
					if (s.match(/ms$/)) return this.numValue();
					return this.numValue();
				}

			// angle extensions
				// get the angle as radians
				svg.Property.prototype.toRadians = function() {
					if (!this.hasValue()) return 0;
					var s = this.value+'';
					if (s.match(/deg$/)) return this.numValue() * (Math.PI / 180.0);
					if (s.match(/grad$/)) return this.numValue() * (Math.PI / 200.0);
					if (s.match(/rad$/)) return this.numValue();
					return this.numValue() * (Math.PI / 180.0);
				}

			// text extensions
				// get the text baseline
				var textBaselineMapping = {
					'baseline': 'alphabetic',
					'before-edge': 'top',
					'text-before-edge': 'top',
					'middle': 'middle',
					'central': 'middle',
					'after-edge': 'bottom',
					'text-after-edge': 'bottom',
					'ideographic': 'ideographic',
					'alphabetic': 'alphabetic',
					'hanging': 'hanging',
					'mathematical': 'alphabetic'
				};
				svg.Property.prototype.toTextBaseline = function () {
					if (!this.hasValue()) return null;
					return textBaselineMapping[this.value];
				}

		// fonts
		svg.Font = new (function() {
			this.Styles = 'normal|italic|oblique|inherit';
			this.Variants = 'normal|small-caps|inherit';
			this.Weights = 'normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit';

			this.CreateFont = function(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit) {
				var f = inherit != null ? this.Parse(inherit) : this.CreateFont('', '', '', '', '', svg.ctx.font);
				return {
					fontFamily: fontFamily || f.fontFamily,
					fontSize: fontSize || f.fontSize,
					fontStyle: fontStyle || f.fontStyle,
					fontWeight: fontWeight || f.fontWeight,
					fontVariant: fontVariant || f.fontVariant,
					toString: function () { return [this.fontStyle, this.fontVariant, this.fontWeight, this.fontSize, this.fontFamily].join(' ') }
				}
			}

			var that = this;
			this.Parse = function(s) {
				var f = {};
				var d = svg.trim(svg.compressSpaces(s || '')).split(' ');
				var set = { fontSize: false, fontStyle: false, fontWeight: false, fontVariant: false }
				var ff = '';
				for (var i=0; i<d.length; i++) {
					if (!set.fontStyle && that.Styles.indexOf(d[i]) != -1) { if (d[i] != 'inherit') f.fontStyle = d[i]; set.fontStyle = true; }
					else if (!set.fontVariant && that.Variants.indexOf(d[i]) != -1) { if (d[i] != 'inherit') f.fontVariant = d[i]; set.fontStyle = set.fontVariant = true;	}
					else if (!set.fontWeight && that.Weights.indexOf(d[i]) != -1) {	if (d[i] != 'inherit') f.fontWeight = d[i]; set.fontStyle = set.fontVariant = set.fontWeight = true; }
					else if (!set.fontSize) { if (d[i] != 'inherit') f.fontSize = d[i].split('/')[0]; set.fontStyle = set.fontVariant = set.fontWeight = set.fontSize = true; }
					else { if (d[i] != 'inherit') ff += d[i]; }
				} if (ff != '') f.fontFamily = ff;
				return f;
			}
		});

		// points and paths
		svg.ToNumberArray = function(s) {
			var a = svg.trim(svg.compressSpaces((s || '').replace(/,/g, ' '))).split(' ');
			for (var i=0; i<a.length; i++) {
				a[i] = parseFloat(a[i]);
			}
			return a;
		}
		svg.Point = function(x, y) {
			this.x = x;
			this.y = y;
		}
			svg.Point.prototype.angleTo = function(p) {
				return Math.atan2(p.y - this.y, p.x - this.x);
			}

			svg.Point.prototype.applyTransform = function(v) {
				var xp = this.x * v[0] + this.y * v[2] + v[4];
				var yp = this.x * v[1] + this.y * v[3] + v[5];
				this.x = xp;
				this.y = yp;
			}

		svg.CreatePoint = function(s) {
			var a = svg.ToNumberArray(s);
			return new svg.Point(a[0], a[1]);
		}
		svg.CreatePath = function(s) {
			var a = svg.ToNumberArray(s);
			var path = [];
			for (var i=0; i<a.length; i+=2) {
				path.push(new svg.Point(a[i], a[i+1]));
			}
			return path;
		}

		// bounding box
		svg.BoundingBox = function(x1, y1, x2, y2) { // pass in initial points if you want
			this.x1 = Number.NaN;
			this.y1 = Number.NaN;
			this.x2 = Number.NaN;
			this.y2 = Number.NaN;

			this.x = function() { return this.x1; }
			this.y = function() { return this.y1; }
			this.width = function() { return this.x2 - this.x1; }
			this.height = function() { return this.y2 - this.y1; }

			this.addPoint = function(x, y) {
				if (x != null) {
					if (isNaN(this.x1) || isNaN(this.x2)) {
						this.x1 = x;
						this.x2 = x;
					}
					if (x < this.x1) this.x1 = x;
					if (x > this.x2) this.x2 = x;
				}

				if (y != null) {
					if (isNaN(this.y1) || isNaN(this.y2)) {
						this.y1 = y;
						this.y2 = y;
					}
					if (y < this.y1) this.y1 = y;
					if (y > this.y2) this.y2 = y;
				}
			}
			this.addX = function(x) { this.addPoint(x, null); }
			this.addY = function(y) { this.addPoint(null, y); }

			this.addBoundingBox = function(bb) {
				this.addPoint(bb.x1, bb.y1);
				this.addPoint(bb.x2, bb.y2);
			}

			this.addQuadraticCurve = function(p0x, p0y, p1x, p1y, p2x, p2y) {
				var cp1x = p0x + 2/3 * (p1x - p0x); // CP1 = QP0 + 2/3 *(QP1-QP0)
				var cp1y = p0y + 2/3 * (p1y - p0y); // CP1 = QP0 + 2/3 *(QP1-QP0)
				var cp2x = cp1x + 1/3 * (p2x - p0x); // CP2 = CP1 + 1/3 *(QP2-QP0)
				var cp2y = cp1y + 1/3 * (p2y - p0y); // CP2 = CP1 + 1/3 *(QP2-QP0)
				this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y,	cp2y, p2x, p2y);
			}

			this.addBezierCurve = function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
				// from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
				var p0 = [p0x, p0y], p1 = [p1x, p1y], p2 = [p2x, p2y], p3 = [p3x, p3y];
				this.addPoint(p0[0], p0[1]);
				this.addPoint(p3[0], p3[1]);

				for (i=0; i<=1; i++) {
					var f = function(t) {
						return Math.pow(1-t, 3) * p0[i]
						+ 3 * Math.pow(1-t, 2) * t * p1[i]
						+ 3 * (1-t) * Math.pow(t, 2) * p2[i]
						+ Math.pow(t, 3) * p3[i];
					}

					var b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
					var a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
					var c = 3 * p1[i] - 3 * p0[i];

					if (a == 0) {
						if (b == 0) continue;
						var t = -c / b;
						if (0 < t && t < 1) {
							if (i == 0) this.addX(f(t));
							if (i == 1) this.addY(f(t));
						}
						continue;
					}

					var b2ac = Math.pow(b, 2) - 4 * c * a;
					if (b2ac < 0) continue;
					var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
					if (0 < t1 && t1 < 1) {
						if (i == 0) this.addX(f(t1));
						if (i == 1) this.addY(f(t1));
					}
					var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
					if (0 < t2 && t2 < 1) {
						if (i == 0) this.addX(f(t2));
						if (i == 1) this.addY(f(t2));
					}
				}
			}

			this.isPointInBox = function(x, y) {
				return (this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2);
			}

			this.addPoint(x1, y1);
			this.addPoint(x2, y2);
		}

		// transforms
		svg.Transform = function(v) {
			var that = this;
			this.Type = {}

			// translate
			this.Type.translate = function(s) {
				this.p = svg.CreatePoint(s);
				this.apply = function(ctx) {
					ctx.translate(this.p.x || 0.0, this.p.y || 0.0);
				}
				this.unapply = function(ctx) {
					ctx.translate(-1.0 * this.p.x || 0.0, -1.0 * this.p.y || 0.0);
				}
				this.applyToPoint = function(p) {
					p.applyTransform([1, 0, 0, 1, this.p.x || 0.0, this.p.y || 0.0]);
				}
			}

			// rotate
			this.Type.rotate = function(s) {
				var a = svg.ToNumberArray(s);
				this.angle = new svg.Property('angle', a[0]);
				this.cx = a[1] || 0;
				this.cy = a[2] || 0;
				this.apply = function(ctx) {
					ctx.translate(this.cx, this.cy);
					ctx.rotate(this.angle.toRadians());
					ctx.translate(-this.cx, -this.cy);
				}
				this.unapply = function(ctx) {
					ctx.translate(this.cx, this.cy);
					ctx.rotate(-1.0 * this.angle.toRadians());
					ctx.translate(-this.cx, -this.cy);
				}
				this.applyToPoint = function(p) {
					var a = this.angle.toRadians();
					p.applyTransform([1, 0, 0, 1, this.p.x || 0.0, this.p.y || 0.0]);
					p.applyTransform([Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]);
					p.applyTransform([1, 0, 0, 1, -this.p.x || 0.0, -this.p.y || 0.0]);
				}
			}

			this.Type.scale = function(s) {
				this.p = svg.CreatePoint(s);
				this.apply = function(ctx) {
					ctx.scale(this.p.x || 1.0, this.p.y || this.p.x || 1.0);
				}
				this.unapply = function(ctx) {
					ctx.scale(1.0 / this.p.x || 1.0, 1.0 / this.p.y || this.p.x || 1.0);
				}
				this.applyToPoint = function(p) {
					p.applyTransform([this.p.x || 0.0, 0, 0, this.p.y || 0.0, 0, 0]);
				}
			}

			this.Type.matrix = function(s) {
				this.m = svg.ToNumberArray(s);
				this.apply = function(ctx) {
					ctx.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
				}
				this.unapply = function(ctx) {
					var a = this.m[0];
					var b = this.m[2];
					var c = this.m[4];
					var d = this.m[1];
					var e = this.m[3];
					var f = this.m[5];
					var g = 0.0;
					var h = 0.0;
					var i = 1.0;
					var det = 1 / (a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g));
					ctx.transform(
						det*(e*i-f*h),
						det*(f*g-d*i),
						det*(c*h-b*i),
						det*(a*i-c*g),
						det*(b*f-c*e),
						det*(c*d-a*f)
					);
				}
				this.applyToPoint = function(p) {
					p.applyTransform(this.m);
				}
			}

			this.Type.SkewBase = function(s) {
				this.base = that.Type.matrix;
				this.base(s);
				this.angle = new svg.Property('angle', s);
			}
			this.Type.SkewBase.prototype = new this.Type.matrix;

			this.Type.skewX = function(s) {
				this.base = that.Type.SkewBase;
				this.base(s);
				this.m = [1, 0, Math.tan(this.angle.toRadians()), 1, 0, 0];
			}
			this.Type.skewX.prototype = new this.Type.SkewBase;

			this.Type.skewY = function(s) {
				this.base = that.Type.SkewBase;
				this.base(s);
				this.m = [1, Math.tan(this.angle.toRadians()), 0, 1, 0, 0];
			}
			this.Type.skewY.prototype = new this.Type.SkewBase;

			this.transforms = [];

			this.apply = function(ctx) {
				for (var i=0; i<this.transforms.length; i++) {
					this.transforms[i].apply(ctx);
				}
			}

			this.unapply = function(ctx) {
				for (var i=this.transforms.length-1; i>=0; i--) {
					this.transforms[i].unapply(ctx);
				}
			}

			this.applyToPoint = function(p) {
				for (var i=0; i<this.transforms.length; i++) {
					this.transforms[i].applyToPoint(p);
				}
			}

			var data = svg.trim(svg.compressSpaces(v)).replace(/\)([a-zA-Z])/g, ') $1').replace(/\)(\s?,\s?)/g,') ').split(/\s(?=[a-z])/);
			for (var i=0; i<data.length; i++) {
				var type = svg.trim(data[i].split('(')[0]);
				var s = data[i].split('(')[1].replace(')','');
				var transformType = this.Type[type];
				if (typeof transformType != 'undefined') {
					var transform = new transformType(s);
					transform.type = type;
					this.transforms.push(transform);
				}
			}
		}

		// aspect ratio
		svg.AspectRatio = function(ctx, aspectRatio, width, desiredWidth, height, desiredHeight, minX, minY, refX, refY) {
			// aspect ratio - http://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
			aspectRatio = svg.compressSpaces(aspectRatio);
			aspectRatio = aspectRatio.replace(/^defer\s/,''); // ignore defer
			var align = aspectRatio.split(' ')[0] || 'xMidYMid';
			var meetOrSlice = aspectRatio.split(' ')[1] || 'meet';

			// calculate scale
			var scaleX = width / desiredWidth;
			var scaleY = height / desiredHeight;
			var scaleMin = Math.min(scaleX, scaleY);
			var scaleMax = Math.max(scaleX, scaleY);
			if (meetOrSlice == 'meet') { desiredWidth *= scaleMin; desiredHeight *= scaleMin; }
			if (meetOrSlice == 'slice') { desiredWidth *= scaleMax; desiredHeight *= scaleMax; }

			refX = new svg.Property('refX', refX);
			refY = new svg.Property('refY', refY);
			if (refX.hasValue() && refY.hasValue()) {
				ctx.translate(-scaleMin * refX.toPixels('x'), -scaleMin * refY.toPixels('y'));
			}
			else {
				// align
				if (align.match(/^xMid/) && ((meetOrSlice == 'meet' && scaleMin == scaleY) || (meetOrSlice == 'slice' && scaleMax == scaleY))) ctx.translate(width / 2.0 - desiredWidth / 2.0, 0);
				if (align.match(/YMid$/) && ((meetOrSlice == 'meet' && scaleMin == scaleX) || (meetOrSlice == 'slice' && scaleMax == scaleX))) ctx.translate(0, height / 2.0 - desiredHeight / 2.0);
				if (align.match(/^xMax/) && ((meetOrSlice == 'meet' && scaleMin == scaleY) || (meetOrSlice == 'slice' && scaleMax == scaleY))) ctx.translate(width - desiredWidth, 0);
				if (align.match(/YMax$/) && ((meetOrSlice == 'meet' && scaleMin == scaleX) || (meetOrSlice == 'slice' && scaleMax == scaleX))) ctx.translate(0, height - desiredHeight);
			}

			// scale
			if (align == 'none') ctx.scale(scaleX, scaleY);
			else if (meetOrSlice == 'meet') ctx.scale(scaleMin, scaleMin);
			else if (meetOrSlice == 'slice') ctx.scale(scaleMax, scaleMax);

			// translate
			ctx.translate(minX == null ? 0 : -minX, minY == null ? 0 : -minY);
		}

		// elements
		svg.Element = {}

		svg.EmptyProperty = new svg.Property('EMPTY', '');

		svg.Element.ElementBase = function(node) {
			this.attributes = {};
			this.styles = {};
			this.stylesSpecificity = {};
			this.children = [];

			// get or create attribute
			this.attribute = function(name, createIfNotExists) {
				var a = this.attributes[name];
				if (a != null) return a;

				if (createIfNotExists == true) { a = new svg.Property(name, ''); this.attributes[name] = a; }
				return a || svg.EmptyProperty;
			}

			this.getHrefAttribute = function() {
				for (var a in this.attributes) {
					if (a == 'href' || a.match(/:href$/)) {
						return this.attributes[a];
					}
				}
				return svg.EmptyProperty;
			}

			// get or create style, crawls up node tree
			this.style = function(name, createIfNotExists, skipAncestors) {
				var s = this.styles[name];
				if (s != null) return s;

				var a = this.attribute(name);
				if (a != null && a.hasValue()) {
					this.styles[name] = a; // move up to me to cache
					return a;
				}

				if (skipAncestors != true) {
					var p = this.parent;
					if (p != null) {
						var ps = p.style(name);
						if (ps != null && ps.hasValue()) {
							return ps;
						}
					}
				}

				if (createIfNotExists == true) { s = new svg.Property(name, ''); this.styles[name] = s; }
				return s || svg.EmptyProperty;
			}

			// base render
			this.render = function(ctx) {
				// don't render display=none
				if (this.style('display').value == 'none') return;

				// don't render visibility=hidden
				if (this.style('visibility').value == 'hidden') return;

				ctx.save();
				if (this.style('mask').hasValue()) { // mask
					var mask = this.style('mask').getDefinition();
					if (mask != null) mask.apply(ctx, this);
				}
				else if (this.style('filter').hasValue()) { // filter
					var filter = this.style('filter').getDefinition();
					if (filter != null) filter.apply(ctx, this);
				}
				else {
					this.setContext(ctx);
					this.renderChildren(ctx);
					this.clearContext(ctx);
				}
				ctx.restore();
			}

			// base set context
			this.setContext = function(ctx) {
				// OVERRIDE ME!
			}

			// base clear context
			this.clearContext = function(ctx) {
				// OVERRIDE ME!
			}

			// base render children
			this.renderChildren = function(ctx) {
				for (var i=0; i<this.children.length; i++) {
					this.children[i].render(ctx);
				}
			}

			this.addChild = function(childNode, create) {
				var child = childNode;
				if (create) child = svg.CreateElement(childNode);
				child.parent = this;
				if (child.type != 'title') { this.children.push(child);	}
			}

			this.addStylesFromStyleDefinition = function () {
				// add styles
				for (var selector in svg.Styles) {
					if (selector[0] != '@' && matchesSelector(node, selector)) {
						var styles = svg.Styles[selector];
						var specificity = svg.StylesSpecificity[selector];
						if (styles != null) {
							for (var name in styles) {
								var existingSpecificity = this.stylesSpecificity[name];
								if (typeof existingSpecificity == 'undefined') {
									existingSpecificity = '000';
								}
								if (specificity > existingSpecificity) {
									this.styles[name] = styles[name];
									this.stylesSpecificity[name] = specificity;
								}
							}
						}
					}
				}
			};

			if (node != null && node.nodeType == 1) { //ELEMENT_NODE
				// add attributes
				for (var i=0; i<node.attributes.length; i++) {
					var attribute = node.attributes[i];
					this.attributes[attribute.nodeName] = new svg.Property(attribute.nodeName, attribute.value);
				}

				this.addStylesFromStyleDefinition();

				// add inline styles
				if (this.attribute('style').hasValue()) {
					var styles = this.attribute('style').value.split(';');
					for (var i=0; i<styles.length; i++) {
						if (svg.trim(styles[i]) != '') {
							var style = styles[i].split(':');
							var name = svg.trim(style[0]);
							var value = svg.trim(style[1]);
							this.styles[name] = new svg.Property(name, value);
						}
					}
				}

				// add id
				if (this.attribute('id').hasValue()) {
					if (svg.Definitions[this.attribute('id').value] == null) {
						svg.Definitions[this.attribute('id').value] = this;
					}
				}

				// add children
				for (var i=0; i<node.childNodes.length; i++) {
					var childNode = node.childNodes[i];
					if (childNode.nodeType == 1) this.addChild(childNode, true); //ELEMENT_NODE
					if (this.captureTextNodes && (childNode.nodeType == 3 || childNode.nodeType == 4)) {
						var text = childNode.value || childNode.text || childNode.textContent || '';
						if (svg.compressSpaces(text) != '') {
							this.addChild(new svg.Element.tspan(childNode), false); // TEXT_NODE
						}
					}
				}
			}
		}

		svg.Element.RenderedElementBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.setContext = function(ctx) {
				// fill
				if (this.style('fill').isUrlDefinition()) {
					var fs = this.style('fill').getFillStyleDefinition(this, this.style('fill-opacity'));
					if (fs != null) ctx.fillStyle = fs;
				}
				else if (this.style('fill').hasValue()) {
					var fillStyle = this.style('fill');
					if (fillStyle.value == 'currentColor') fillStyle.value = this.style('color').value;
					if (fillStyle.value != 'inherit') ctx.fillStyle = (fillStyle.value == 'none' ? 'rgba(0,0,0,0)' : fillStyle.value);
				}
				if (this.style('fill-opacity').hasValue()) {
					var fillStyle = new svg.Property('fill', ctx.fillStyle);
					fillStyle = fillStyle.addOpacity(this.style('fill-opacity'));
					ctx.fillStyle = fillStyle.value;
				}

				// stroke
				if (this.style('stroke').isUrlDefinition()) {
					var fs = this.style('stroke').getFillStyleDefinition(this, this.style('stroke-opacity'));
					if (fs != null) ctx.strokeStyle = fs;
				}
				else if (this.style('stroke').hasValue()) {
					var strokeStyle = this.style('stroke');
					if (strokeStyle.value == 'currentColor') strokeStyle.value = this.style('color').value;
					if (strokeStyle.value != 'inherit') ctx.strokeStyle = (strokeStyle.value == 'none' ? 'rgba(0,0,0,0)' : strokeStyle.value);
				}
				if (this.style('stroke-opacity').hasValue()) {
					var strokeStyle = new svg.Property('stroke', ctx.strokeStyle);
					strokeStyle = strokeStyle.addOpacity(this.style('stroke-opacity'));
					ctx.strokeStyle = strokeStyle.value;
				}
				if (this.style('stroke-width').hasValue()) {
					var newLineWidth = this.style('stroke-width').toPixels();
					ctx.lineWidth = newLineWidth == 0 ? 0.001 : newLineWidth; // browsers don't respect 0
			    }
				if (this.style('stroke-linecap').hasValue()) ctx.lineCap = this.style('stroke-linecap').value;
				if (this.style('stroke-linejoin').hasValue()) ctx.lineJoin = this.style('stroke-linejoin').value;
				if (this.style('stroke-miterlimit').hasValue()) ctx.miterLimit = this.style('stroke-miterlimit').value;
				if (this.style('stroke-dasharray').hasValue() && this.style('stroke-dasharray').value != 'none') {
					var gaps = svg.ToNumberArray(this.style('stroke-dasharray').value);
					if (typeof ctx.setLineDash != 'undefined') { ctx.setLineDash(gaps); }
					else if (typeof ctx.webkitLineDash != 'undefined') { ctx.webkitLineDash = gaps; }
					else if (typeof ctx.mozDash != 'undefined' && !(gaps.length==1 && gaps[0]==0)) { ctx.mozDash = gaps; }

					var offset = this.style('stroke-dashoffset').numValueOrDefault(1);
					if (typeof ctx.lineDashOffset != 'undefined') { ctx.lineDashOffset = offset; }
					else if (typeof ctx.webkitLineDashOffset != 'undefined') { ctx.webkitLineDashOffset = offset; }
					else if (typeof ctx.mozDashOffset != 'undefined') { ctx.mozDashOffset = offset; }
				}

				// font
				if (typeof ctx.font != 'undefined') {
					ctx.font = svg.Font.CreateFont(
						this.style('font-style').value,
						this.style('font-variant').value,
						this.style('font-weight').value,
						this.style('font-size').hasValue() ? this.style('font-size').toPixels() + 'px' : '',
						this.style('font-family').value).toString();
				}

				// transform
				if (this.style('transform', false, true).hasValue()) {
					var transform = new svg.Transform(this.style('transform', false, true).value);
					transform.apply(ctx);
				}

				// clip
				if (this.style('clip-path', false, true).hasValue()) {
					var clip = this.style('clip-path', false, true).getDefinition();
					if (clip != null) clip.apply(ctx);
				}

				// opacity
				if (this.style('opacity').hasValue()) {
					ctx.globalAlpha = this.style('opacity').numValue();
				}
			}
		}
		svg.Element.RenderedElementBase.prototype = new svg.Element.ElementBase;

		svg.Element.PathElementBase = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.path = function(ctx) {
				if (ctx != null) ctx.beginPath();
				return new svg.BoundingBox();
			}

			this.renderChildren = function(ctx) {
				this.path(ctx);
				svg.Mouse.checkPath(this, ctx);
				if (ctx.fillStyle != '') {
					if (this.style('fill-rule').valueOrDefault('inherit') != 'inherit') { ctx.fill(this.style('fill-rule').value); }
					else { ctx.fill(); }
				}
				if (ctx.strokeStyle != '') ctx.stroke();

				var markers = this.getMarkers();
				if (markers != null) {
					if (this.style('marker-start').isUrlDefinition()) {
						var marker = this.style('marker-start').getDefinition();
						marker.render(ctx, markers[0][0], markers[0][1]);
					}
					if (this.style('marker-mid').isUrlDefinition()) {
						var marker = this.style('marker-mid').getDefinition();
						for (var i=1;i<markers.length-1;i++) {
							marker.render(ctx, markers[i][0], markers[i][1]);
						}
					}
					if (this.style('marker-end').isUrlDefinition()) {
						var marker = this.style('marker-end').getDefinition();
						marker.render(ctx, markers[markers.length-1][0], markers[markers.length-1][1]);
					}
				}
			}

			this.getBoundingBox = function() {
				return this.path();
			}

			this.getMarkers = function() {
				return null;
			}
		}
		svg.Element.PathElementBase.prototype = new svg.Element.RenderedElementBase;

		// svg element
		svg.Element.svg = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.baseClearContext = this.clearContext;
			this.clearContext = function(ctx) {
				this.baseClearContext(ctx);
				svg.ViewPort.RemoveCurrent();
			}

			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				// initial values and defaults
				ctx.strokeStyle = 'rgba(0,0,0,0)';
				ctx.lineCap = 'butt';
				ctx.lineJoin = 'miter';
				ctx.miterLimit = 4;
				if (typeof ctx.font != 'undefined' && typeof window.getComputedStyle != 'undefined') {
					ctx.font = window.getComputedStyle(ctx.canvas).getPropertyValue('font');
				}

				this.baseSetContext(ctx);

				// create new view port
				if (!this.attribute('x').hasValue()) this.attribute('x', true).value = 0;
				if (!this.attribute('y').hasValue()) this.attribute('y', true).value = 0;
				ctx.translate(this.attribute('x').toPixels('x'), this.attribute('y').toPixels('y'));

				var width = svg.ViewPort.width();
				var height = svg.ViewPort.height();

				if (!this.attribute('width').hasValue()) this.attribute('width', true).value = '100%';
				if (!this.attribute('height').hasValue()) this.attribute('height', true).value = '100%';
				if (typeof this.root == 'undefined') {
					width = this.attribute('width').toPixels('x');
					height = this.attribute('height').toPixels('y');

					var x = 0;
					var y = 0;
					if (this.attribute('refX').hasValue() && this.attribute('refY').hasValue()) {
						x = -this.attribute('refX').toPixels('x');
						y = -this.attribute('refY').toPixels('y');
					}

					if (this.attribute('overflow').valueOrDefault('hidden') != 'visible') {
						ctx.beginPath();
						ctx.moveTo(x, y);
						ctx.lineTo(width, y);
						ctx.lineTo(width, height);
						ctx.lineTo(x, height);
						ctx.closePath();
						ctx.clip();
					}
				}
				svg.ViewPort.SetCurrent(width, height);

				// viewbox
				if (this.attribute('viewBox').hasValue()) {
					var viewBox = svg.ToNumberArray(this.attribute('viewBox').value);
					var minX = viewBox[0];
					var minY = viewBox[1];
					width = viewBox[2];
					height = viewBox[3];

					svg.AspectRatio(ctx,
									this.attribute('preserveAspectRatio').value,
									svg.ViewPort.width(),
									width,
									svg.ViewPort.height(),
									height,
									minX,
									minY,
									this.attribute('refX').value,
									this.attribute('refY').value);

					svg.ViewPort.RemoveCurrent();
					svg.ViewPort.SetCurrent(viewBox[2], viewBox[3]);
				}
			}
		}
		svg.Element.svg.prototype = new svg.Element.RenderedElementBase;

		// rect element
		svg.Element.rect = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.path = function(ctx) {
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');
				var rx = this.attribute('rx').toPixels('x');
				var ry = this.attribute('ry').toPixels('y');
				if (this.attribute('rx').hasValue() && !this.attribute('ry').hasValue()) ry = rx;
				if (this.attribute('ry').hasValue() && !this.attribute('rx').hasValue()) rx = ry;
				rx = Math.min(rx, width / 2.0);
				ry = Math.min(ry, height / 2.0);
				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(x + rx, y);
					ctx.lineTo(x + width - rx, y);
					ctx.quadraticCurveTo(x + width, y, x + width, y + ry)
					ctx.lineTo(x + width, y + height - ry);
					ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height)
					ctx.lineTo(x + rx, y + height);
					ctx.quadraticCurveTo(x, y + height, x, y + height - ry)
					ctx.lineTo(x, y + ry);
					ctx.quadraticCurveTo(x, y, x + rx, y)
					ctx.closePath();
				}

				return new svg.BoundingBox(x, y, x + width, y + height);
			}
		}
		svg.Element.rect.prototype = new svg.Element.PathElementBase;

		// circle element
		svg.Element.circle = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.path = function(ctx) {
				var cx = this.attribute('cx').toPixels('x');
				var cy = this.attribute('cy').toPixels('y');
				var r = this.attribute('r').toPixels();

				if (ctx != null) {
					ctx.beginPath();
					ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
					ctx.closePath();
				}

				return new svg.BoundingBox(cx - r, cy - r, cx + r, cy + r);
			}
		}
		svg.Element.circle.prototype = new svg.Element.PathElementBase;

		// ellipse element
		svg.Element.ellipse = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.path = function(ctx) {
				var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
				var rx = this.attribute('rx').toPixels('x');
				var ry = this.attribute('ry').toPixels('y');
				var cx = this.attribute('cx').toPixels('x');
				var cy = this.attribute('cy').toPixels('y');

				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(cx, cy - ry);
					ctx.bezierCurveTo(cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
					ctx.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
					ctx.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
					ctx.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);
					ctx.closePath();
				}

				return new svg.BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);
			}
		}
		svg.Element.ellipse.prototype = new svg.Element.PathElementBase;

		// line element
		svg.Element.line = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.getPoints = function() {
				return [
					new svg.Point(this.attribute('x1').toPixels('x'), this.attribute('y1').toPixels('y')),
					new svg.Point(this.attribute('x2').toPixels('x'), this.attribute('y2').toPixels('y'))];
			}

			this.path = function(ctx) {
				var points = this.getPoints();

				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(points[0].x, points[0].y);
					ctx.lineTo(points[1].x, points[1].y);
				}

				return new svg.BoundingBox(points[0].x, points[0].y, points[1].x, points[1].y);
			}

			this.getMarkers = function() {
				var points = this.getPoints();
				var a = points[0].angleTo(points[1]);
				return [[points[0], a], [points[1], a]];
			}
		}
		svg.Element.line.prototype = new svg.Element.PathElementBase;

		// polyline element
		svg.Element.polyline = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.points = svg.CreatePath(this.attribute('points').value);
			this.path = function(ctx) {
				var bb = new svg.BoundingBox(this.points[0].x, this.points[0].y);
				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(this.points[0].x, this.points[0].y);
				}
				for (var i=1; i<this.points.length; i++) {
					bb.addPoint(this.points[i].x, this.points[i].y);
					if (ctx != null) ctx.lineTo(this.points[i].x, this.points[i].y);
				}
				return bb;
			}

			this.getMarkers = function() {
				var markers = [];
				for (var i=0; i<this.points.length - 1; i++) {
					markers.push([this.points[i], this.points[i].angleTo(this.points[i+1])]);
				}
				if (markers.length > 0) {
					markers.push([this.points[this.points.length-1], markers[markers.length-1][1]]);
				}
				return markers;
			}
		}
		svg.Element.polyline.prototype = new svg.Element.PathElementBase;

		// polygon element
		svg.Element.polygon = function(node) {
			this.base = svg.Element.polyline;
			this.base(node);

			this.basePath = this.path;
			this.path = function(ctx) {
				var bb = this.basePath(ctx);
				if (ctx != null) {
					ctx.lineTo(this.points[0].x, this.points[0].y);
					ctx.closePath();
				}
				return bb;
			}
		}
		svg.Element.polygon.prototype = new svg.Element.polyline;

		// path element
		svg.Element.path = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			var d = this.attribute('d').value;
			// TODO: convert to real lexer based on http://www.w3.org/TR/SVG11/paths.html#PathDataBNF
			d = d.replace(/,/gm,' '); // get rid of all commas
			// As the end of a match can also be the start of the next match, we need to run this replace twice.
			for(var i=0; i<2; i++)
				d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm,'$1 $2'); // suffix commands with spaces
			d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // prefix commands with spaces
			d = d.replace(/([0-9])([+\-])/gm,'$1 $2'); // separate digits on +- signs
			// Again, we need to run this twice to find all occurances
			for(var i=0; i<2; i++)
				d = d.replace(/(\.[0-9]*)(\.)/gm,'$1 $2'); // separate digits when they start with a comma
			d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm,'$1 $3 $4 '); // shorthand elliptical arc path syntax
			d = svg.compressSpaces(d); // compress multiple spaces
			d = svg.trim(d);
			this.PathParser = new (function(d) {
				this.tokens = d.split(' ');

				this.reset = function() {
					this.i = -1;
					this.command = '';
					this.previousCommand = '';
					this.start = new svg.Point(0, 0);
					this.control = new svg.Point(0, 0);
					this.current = new svg.Point(0, 0);
					this.points = [];
					this.angles = [];
				}

				this.isEnd = function() {
					return this.i >= this.tokens.length - 1;
				}

				this.isCommandOrEnd = function() {
					if (this.isEnd()) return true;
					return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;
				}

				this.isRelativeCommand = function() {
					switch(this.command)
					{
						case 'm':
						case 'l':
						case 'h':
						case 'v':
						case 'c':
						case 's':
						case 'q':
						case 't':
						case 'a':
						case 'z':
							return true;
							break;
					}
					return false;
				}

				this.getToken = function() {
					this.i++;
					return this.tokens[this.i];
				}

				this.getScalar = function() {
					return parseFloat(this.getToken());
				}

				this.nextCommand = function() {
					this.previousCommand = this.command;
					this.command = this.getToken();
				}

				this.getPoint = function() {
					var p = new svg.Point(this.getScalar(), this.getScalar());
					return this.makeAbsolute(p);
				}

				this.getAsControlPoint = function() {
					var p = this.getPoint();
					this.control = p;
					return p;
				}

				this.getAsCurrentPoint = function() {
					var p = this.getPoint();
					this.current = p;
					return p;
				}

				this.getReflectedControlPoint = function() {
					if (this.previousCommand.toLowerCase() != 'c' &&
					    this.previousCommand.toLowerCase() != 's' &&
						this.previousCommand.toLowerCase() != 'q' &&
						this.previousCommand.toLowerCase() != 't' ){
						return this.current;
					}

					// reflect point
					var p = new svg.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
					return p;
				}

				this.makeAbsolute = function(p) {
					if (this.isRelativeCommand()) {
						p.x += this.current.x;
						p.y += this.current.y;
					}
					return p;
				}

				this.addMarker = function(p, from, priorTo) {
					// if the last angle isn't filled in because we didn't have this point yet ...
					if (priorTo != null && this.angles.length > 0 && this.angles[this.angles.length-1] == null) {
						this.angles[this.angles.length-1] = this.points[this.points.length-1].angleTo(priorTo);
					}
					this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
				}

				this.addMarkerAngle = function(p, a) {
					this.points.push(p);
					this.angles.push(a);
				}

				this.getMarkerPoints = function() { return this.points; }
				this.getMarkerAngles = function() {
					for (var i=0; i<this.angles.length; i++) {
						if (this.angles[i] == null) {
							for (var j=i+1; j<this.angles.length; j++) {
								if (this.angles[j] != null) {
									this.angles[i] = this.angles[j];
									break;
								}
							}
						}
					}
					return this.angles;
				}
			})(d);

			this.path = function(ctx) {
				var pp = this.PathParser;
				pp.reset();

				var bb = new svg.BoundingBox();
				if (ctx != null) ctx.beginPath();
				while (!pp.isEnd()) {
					pp.nextCommand();
					switch (pp.command) {
					case 'M':
					case 'm':
						var p = pp.getAsCurrentPoint();
						pp.addMarker(p);
						bb.addPoint(p.x, p.y);
						if (ctx != null) ctx.moveTo(p.x, p.y);
						pp.start = pp.current;
						while (!pp.isCommandOrEnd()) {
							var p = pp.getAsCurrentPoint();
							pp.addMarker(p, pp.start);
							bb.addPoint(p.x, p.y);
							if (ctx != null) ctx.lineTo(p.x, p.y);
						}
						break;
					case 'L':
					case 'l':
						while (!pp.isCommandOrEnd()) {
							var c = pp.current;
							var p = pp.getAsCurrentPoint();
							pp.addMarker(p, c);
							bb.addPoint(p.x, p.y);
							if (ctx != null) ctx.lineTo(p.x, p.y);
						}
						break;
					case 'H':
					case 'h':
						while (!pp.isCommandOrEnd()) {
							var newP = new svg.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
							pp.addMarker(newP, pp.current);
							pp.current = newP;
							bb.addPoint(pp.current.x, pp.current.y);
							if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
						}
						break;
					case 'V':
					case 'v':
						while (!pp.isCommandOrEnd()) {
							var newP = new svg.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
							pp.addMarker(newP, pp.current);
							pp.current = newP;
							bb.addPoint(pp.current.x, pp.current.y);
							if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
						}
						break;
					case 'C':
					case 'c':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var p1 = pp.getPoint();
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, p1);
							bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'S':
					case 's':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var p1 = pp.getReflectedControlPoint();
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, p1);
							bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'Q':
					case 'q':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, cntrl);
							bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'T':
					case 't':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var cntrl = pp.getReflectedControlPoint();
							pp.control = cntrl;
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, cntrl);
							bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'A':
					case 'a':
						while (!pp.isCommandOrEnd()) {
						    var curr = pp.current;
							var rx = pp.getScalar();
							var ry = pp.getScalar();
							var xAxisRotation = pp.getScalar() * (Math.PI / 180.0);
							var largeArcFlag = pp.getScalar();
							var sweepFlag = pp.getScalar();
							var cp = pp.getAsCurrentPoint();

							// Conversion from endpoint to center parameterization
							// http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
							// x1', y1'
							var currp = new svg.Point(
								Math.cos(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2.0,
								-Math.sin(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2.0
							);
							// adjust radii
							var l = Math.pow(currp.x,2)/Math.pow(rx,2)+Math.pow(currp.y,2)/Math.pow(ry,2);
							if (l > 1) {
								rx *= Math.sqrt(l);
								ry *= Math.sqrt(l);
							}
							// cx', cy'
							var s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt(
								((Math.pow(rx,2)*Math.pow(ry,2))-(Math.pow(rx,2)*Math.pow(currp.y,2))-(Math.pow(ry,2)*Math.pow(currp.x,2))) /
								(Math.pow(rx,2)*Math.pow(currp.y,2)+Math.pow(ry,2)*Math.pow(currp.x,2))
							);
							if (isNaN(s)) s = 0;
							var cpp = new svg.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);
							// cx, cy
							var centp = new svg.Point(
								(curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y,
								(curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y
							);
							// vector magnitude
							var m = function(v) { return Math.sqrt(Math.pow(v[0],2) + Math.pow(v[1],2)); }
							// ratio between two vectors
							var r = function(u, v) { return (u[0]*v[0]+u[1]*v[1]) / (m(u)*m(v)) }
							// angle between two vectors
							var a = function(u, v) { return (u[0]*v[1] < u[1]*v[0] ? -1 : 1) * Math.acos(r(u,v)); }
							// initial angle
							var a1 = a([1,0], [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry]);
							// angle delta
							var u = [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry];
							var v = [(-currp.x-cpp.x)/rx,(-currp.y-cpp.y)/ry];
							var ad = a(u, v);
							if (r(u,v) <= -1) ad = Math.PI;
							if (r(u,v) >= 1) ad = 0;

							// for markers
							var dir = 1 - sweepFlag ? 1.0 : -1.0;
							var ah = a1 + dir * (ad / 2.0);
							var halfWay = new svg.Point(
								centp.x + rx * Math.cos(ah),
								centp.y + ry * Math.sin(ah)
							);
							pp.addMarkerAngle(halfWay, ah - dir * Math.PI / 2);
							pp.addMarkerAngle(cp, ah - dir * Math.PI);

							bb.addPoint(cp.x, cp.y); // TODO: this is too naive, make it better
							if (ctx != null) {
								var r = rx > ry ? rx : ry;
								var sx = rx > ry ? 1 : rx / ry;
								var sy = rx > ry ? ry / rx : 1;

								ctx.translate(centp.x, centp.y);
								ctx.rotate(xAxisRotation);
								ctx.scale(sx, sy);
								ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);
								ctx.scale(1/sx, 1/sy);
								ctx.rotate(-xAxisRotation);
								ctx.translate(-centp.x, -centp.y);
							}
						}
						break;
					case 'Z':
					case 'z':
						if (ctx != null) ctx.closePath();
						pp.current = pp.start;
					}
				}

				return bb;
			}

			this.getMarkers = function() {
				var points = this.PathParser.getMarkerPoints();
				var angles = this.PathParser.getMarkerAngles();

				var markers = [];
				for (var i=0; i<points.length; i++) {
					markers.push([points[i], angles[i]]);
				}
				return markers;
			}
		}
		svg.Element.path.prototype = new svg.Element.PathElementBase;

		// pattern element
		svg.Element.pattern = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.createPattern = function(ctx, element) {
				var width = this.attribute('width').toPixels('x', true);
				var height = this.attribute('height').toPixels('y', true);

				// render me using a temporary svg element
				var tempSvg = new svg.Element.svg();
				tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
				tempSvg.attributes['width'] = new svg.Property('width', width + 'px');
				tempSvg.attributes['height'] = new svg.Property('height', height + 'px');
				tempSvg.attributes['transform'] = new svg.Property('transform', this.attribute('patternTransform').value);
				tempSvg.children = this.children;

				var c = document.createElement('canvas');
				c.width = width;
				c.height = height;
				var cctx = c.getContext('2d');
				if (this.attribute('x').hasValue() && this.attribute('y').hasValue()) {
					cctx.translate(this.attribute('x').toPixels('x', true), this.attribute('y').toPixels('y', true));
				}
				// render 3x3 grid so when we transform there's no white space on edges
				for (var x=-1; x<=1; x++) {
					for (var y=-1; y<=1; y++) {
						cctx.save();
						tempSvg.attributes['x'] = new svg.Property('x', x * c.width);
						tempSvg.attributes['y'] = new svg.Property('y', y * c.height);
						tempSvg.render(cctx);
						cctx.restore();
					}
				}
				var pattern = ctx.createPattern(c, 'repeat');
				return pattern;
			}
		}
		svg.Element.pattern.prototype = new svg.Element.ElementBase;

		// marker element
		svg.Element.marker = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.baseRender = this.render;
			this.render = function(ctx, point, angle) {
				ctx.translate(point.x, point.y);
				if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(angle);
				if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(ctx.lineWidth, ctx.lineWidth);
				ctx.save();

				// render me using a temporary svg element
				var tempSvg = new svg.Element.svg();
				tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
				tempSvg.attributes['refX'] = new svg.Property('refX', this.attribute('refX').value);
				tempSvg.attributes['refY'] = new svg.Property('refY', this.attribute('refY').value);
				tempSvg.attributes['width'] = new svg.Property('width', this.attribute('markerWidth').value);
				tempSvg.attributes['height'] = new svg.Property('height', this.attribute('markerHeight').value);
				tempSvg.attributes['fill'] = new svg.Property('fill', this.attribute('fill').valueOrDefault('black'));
				tempSvg.attributes['stroke'] = new svg.Property('stroke', this.attribute('stroke').valueOrDefault('none'));
				tempSvg.children = this.children;
				tempSvg.render(ctx);

				ctx.restore();
				if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(1/ctx.lineWidth, 1/ctx.lineWidth);
				if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(-angle);
				ctx.translate(-point.x, -point.y);
			}
		}
		svg.Element.marker.prototype = new svg.Element.ElementBase;

		// definitions element
		svg.Element.defs = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.render = function(ctx) {
				// NOOP
			}
		}
		svg.Element.defs.prototype = new svg.Element.ElementBase;

		// base for gradients
		svg.Element.GradientBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.stops = [];
			for (var i=0; i<this.children.length; i++) {
				var child = this.children[i];
				if (child.type == 'stop') this.stops.push(child);
			}

			this.getGradient = function() {
				// OVERRIDE ME!
			}

			this.gradientUnits = function () {
				return this.attribute('gradientUnits').valueOrDefault('objectBoundingBox');
			}

			this.attributesToInherit = ['gradientUnits'];

			this.inheritStopContainer = function (stopsContainer) {
				for (var i=0; i<this.attributesToInherit.length; i++) {
					var attributeToInherit = this.attributesToInherit[i];
					if (!this.attribute(attributeToInherit).hasValue() && stopsContainer.attribute(attributeToInherit).hasValue()) {
						this.attribute(attributeToInherit, true).value = stopsContainer.attribute(attributeToInherit).value;
					}
				}
			}

			this.createGradient = function(ctx, element, parentOpacityProp) {
				var stopsContainer = this;
				if (this.getHrefAttribute().hasValue()) {
					stopsContainer = this.getHrefAttribute().getDefinition();
					this.inheritStopContainer(stopsContainer);
				}

				var addParentOpacity = function (color) {
					if (parentOpacityProp.hasValue()) {
						var p = new svg.Property('color', color);
						return p.addOpacity(parentOpacityProp).value;
					}
					return color;
				};

				var g = this.getGradient(ctx, element);
				if (g == null) return addParentOpacity(stopsContainer.stops[stopsContainer.stops.length - 1].color);
				for (var i=0; i<stopsContainer.stops.length; i++) {
					g.addColorStop(stopsContainer.stops[i].offset, addParentOpacity(stopsContainer.stops[i].color));
				}

				if (this.attribute('gradientTransform').hasValue()) {
					// render as transformed pattern on temporary canvas
					var rootView = svg.ViewPort.viewPorts[0];

					var rect = new svg.Element.rect();
					rect.attributes['x'] = new svg.Property('x', -svg.MAX_VIRTUAL_PIXELS/3.0);
					rect.attributes['y'] = new svg.Property('y', -svg.MAX_VIRTUAL_PIXELS/3.0);
					rect.attributes['width'] = new svg.Property('width', svg.MAX_VIRTUAL_PIXELS);
					rect.attributes['height'] = new svg.Property('height', svg.MAX_VIRTUAL_PIXELS);

					var group = new svg.Element.g();
					group.attributes['transform'] = new svg.Property('transform', this.attribute('gradientTransform').value);
					group.children = [ rect ];

					var tempSvg = new svg.Element.svg();
					tempSvg.attributes['x'] = new svg.Property('x', 0);
					tempSvg.attributes['y'] = new svg.Property('y', 0);
					tempSvg.attributes['width'] = new svg.Property('width', rootView.width);
					tempSvg.attributes['height'] = new svg.Property('height', rootView.height);
					tempSvg.children = [ group ];

					var c = document.createElement('canvas');
					c.width = rootView.width;
					c.height = rootView.height;
					var tempCtx = c.getContext('2d');
					tempCtx.fillStyle = g;
					tempSvg.render(tempCtx);
					return tempCtx.createPattern(c, 'no-repeat');
				}

				return g;
			}
		}
		svg.Element.GradientBase.prototype = new svg.Element.ElementBase;

		// linear gradient element
		svg.Element.linearGradient = function(node) {
			this.base = svg.Element.GradientBase;
			this.base(node);

			this.attributesToInherit.push('x1');
			this.attributesToInherit.push('y1');
			this.attributesToInherit.push('x2');
			this.attributesToInherit.push('y2');

			this.getGradient = function(ctx, element) {
				var bb = this.gradientUnits() == 'objectBoundingBox' ? element.getBoundingBox() : null;

				if (!this.attribute('x1').hasValue()
				 && !this.attribute('y1').hasValue()
				 && !this.attribute('x2').hasValue()
				 && !this.attribute('y2').hasValue()) {
					this.attribute('x1', true).value = 0;
					this.attribute('y1', true).value = 0;
					this.attribute('x2', true).value = 1;
					this.attribute('y2', true).value = 0;
				 }

				var x1 = (this.gradientUnits() == 'objectBoundingBox'
					? bb.x() + bb.width() * this.attribute('x1').numValue()
					: this.attribute('x1').toPixels('x'));
				var y1 = (this.gradientUnits() == 'objectBoundingBox'
					? bb.y() + bb.height() * this.attribute('y1').numValue()
					: this.attribute('y1').toPixels('y'));
				var x2 = (this.gradientUnits() == 'objectBoundingBox'
					? bb.x() + bb.width() * this.attribute('x2').numValue()
					: this.attribute('x2').toPixels('x'));
				var y2 = (this.gradientUnits() == 'objectBoundingBox'
					? bb.y() + bb.height() * this.attribute('y2').numValue()
					: this.attribute('y2').toPixels('y'));

				if (x1 == x2 && y1 == y2) return null;
				return ctx.createLinearGradient(x1, y1, x2, y2);
			}
		}
		svg.Element.linearGradient.prototype = new svg.Element.GradientBase;

		// radial gradient element
		svg.Element.radialGradient = function(node) {
			this.base = svg.Element.GradientBase;
			this.base(node);

			this.attributesToInherit.push('cx');
			this.attributesToInherit.push('cy');
			this.attributesToInherit.push('r');
			this.attributesToInherit.push('fx');
			this.attributesToInherit.push('fy');

			this.getGradient = function(ctx, element) {
				var bb = element.getBoundingBox();

				if (!this.attribute('cx').hasValue()) this.attribute('cx', true).value = '50%';
				if (!this.attribute('cy').hasValue()) this.attribute('cy', true).value = '50%';
				if (!this.attribute('r').hasValue()) this.attribute('r', true).value = '50%';

				var cx = (this.gradientUnits() == 'objectBoundingBox'
					? bb.x() + bb.width() * this.attribute('cx').numValue()
					: this.attribute('cx').toPixels('x'));
				var cy = (this.gradientUnits() == 'objectBoundingBox'
					? bb.y() + bb.height() * this.attribute('cy').numValue()
					: this.attribute('cy').toPixels('y'));

				var fx = cx;
				var fy = cy;
				if (this.attribute('fx').hasValue()) {
					fx = (this.gradientUnits() == 'objectBoundingBox'
					? bb.x() + bb.width() * this.attribute('fx').numValue()
					: this.attribute('fx').toPixels('x'));
				}
				if (this.attribute('fy').hasValue()) {
					fy = (this.gradientUnits() == 'objectBoundingBox'
					? bb.y() + bb.height() * this.attribute('fy').numValue()
					: this.attribute('fy').toPixels('y'));
				}

				var r = (this.gradientUnits() == 'objectBoundingBox'
					? (bb.width() + bb.height()) / 2.0 * this.attribute('r').numValue()
					: this.attribute('r').toPixels());

				return ctx.createRadialGradient(fx, fy, 0, cx, cy, r);
			}
		}
		svg.Element.radialGradient.prototype = new svg.Element.GradientBase;

		// gradient stop element
		svg.Element.stop = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.offset = this.attribute('offset').numValue();
			if (this.offset < 0) this.offset = 0;
			if (this.offset > 1) this.offset = 1;

			var stopColor = this.style('stop-color', true);
			if (stopColor.value === '') stopColor.value = '#000';
			if (this.style('stop-opacity').hasValue()) stopColor = stopColor.addOpacity(this.style('stop-opacity'));
			this.color = stopColor.value;
		}
		svg.Element.stop.prototype = new svg.Element.ElementBase;

		// animation base element
		svg.Element.AnimateBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			svg.Animations.push(this);

			this.duration = 0.0;
			this.begin = this.attribute('begin').toMilliseconds();
			this.maxDuration = this.begin + this.attribute('dur').toMilliseconds();

			this.getProperty = function() {
				var attributeType = this.attribute('attributeType').value;
				var attributeName = this.attribute('attributeName').value;

				if (attributeType == 'CSS') {
					return this.parent.style(attributeName, true);
				}
				return this.parent.attribute(attributeName, true);
			};

			this.initialValue = null;
			this.initialUnits = '';
			this.removed = false;

			this.calcValue = function() {
				// OVERRIDE ME!
				return '';
			}

			this.update = function(delta) {
				// set initial value
				if (this.initialValue == null) {
					this.initialValue = this.getProperty().value;
					this.initialUnits = this.getProperty().getUnits();
				}

				// if we're past the end time
				if (this.duration > this.maxDuration) {
					// loop for indefinitely repeating animations
					if (this.attribute('repeatCount').value == 'indefinite'
					 || this.attribute('repeatDur').value == 'indefinite') {
						this.duration = 0.0
					}
					else if (this.attribute('fill').valueOrDefault('remove') == 'freeze' && !this.frozen) {
						this.frozen = true;
						this.parent.animationFrozen = true;
						this.parent.animationFrozenValue = this.getProperty().value;
					}
					else if (this.attribute('fill').valueOrDefault('remove') == 'remove' && !this.removed) {
						this.removed = true;
						this.getProperty().value = this.parent.animationFrozen ? this.parent.animationFrozenValue : this.initialValue;
						return true;
					}
					return false;
				}
				this.duration = this.duration + delta;

				// if we're past the begin time
				var updated = false;
				if (this.begin < this.duration) {
					var newValue = this.calcValue(); // tween

					if (this.attribute('type').hasValue()) {
						// for transform, etc.
						var type = this.attribute('type').value;
						newValue = type + '(' + newValue + ')';
					}

					this.getProperty().value = newValue;
					updated = true;
				}

				return updated;
			}

			this.from = this.attribute('from');
			this.to = this.attribute('to');
			this.values = this.attribute('values');
			if (this.values.hasValue()) this.values.value = this.values.value.split(';');

			// fraction of duration we've covered
			this.progress = function() {
				var ret = { progress: (this.duration - this.begin) / (this.maxDuration - this.begin) };
				if (this.values.hasValue()) {
					var p = ret.progress * (this.values.value.length - 1);
					var lb = Math.floor(p), ub = Math.ceil(p);
					ret.from = new svg.Property('from', parseFloat(this.values.value[lb]));
					ret.to = new svg.Property('to', parseFloat(this.values.value[ub]));
					ret.progress = (p - lb) / (ub - lb);
				}
				else {
					ret.from = this.from;
					ret.to = this.to;
				}
				return ret;
			}
		}
		svg.Element.AnimateBase.prototype = new svg.Element.ElementBase;

		// animate element
		svg.Element.animate = function(node) {
			this.base = svg.Element.AnimateBase;
			this.base(node);

			this.calcValue = function() {
				var p = this.progress();

				// tween value linearly
				var newValue = p.from.numValue() + (p.to.numValue() - p.from.numValue()) * p.progress;
				return newValue + this.initialUnits;
			};
		}
		svg.Element.animate.prototype = new svg.Element.AnimateBase;

		// animate color element
		svg.Element.animateColor = function(node) {
			this.base = svg.Element.AnimateBase;
			this.base(node);

			this.calcValue = function() {
				var p = this.progress();
				var from = new RGBColor(p.from.value);
				var to = new RGBColor(p.to.value);

				if (from.ok && to.ok) {
					// tween color linearly
					var r = from.r + (to.r - from.r) * p.progress;
					var g = from.g + (to.g - from.g) * p.progress;
					var b = from.b + (to.b - from.b) * p.progress;
					return 'rgb('+parseInt(r,10)+','+parseInt(g,10)+','+parseInt(b,10)+')';
				}
				return this.attribute('from').value;
			};
		}
		svg.Element.animateColor.prototype = new svg.Element.AnimateBase;

		// animate transform element
		svg.Element.animateTransform = function(node) {
			this.base = svg.Element.AnimateBase;
			this.base(node);

			this.calcValue = function() {
				var p = this.progress();

				// tween value linearly
				var from = svg.ToNumberArray(p.from.value);
				var to = svg.ToNumberArray(p.to.value);
				var newValue = '';
				for (var i=0; i<from.length; i++) {
					newValue += from[i] + (to[i] - from[i]) * p.progress + ' ';
				}
				return newValue;
			};
		}
		svg.Element.animateTransform.prototype = new svg.Element.animate;

		// font element
		svg.Element.font = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.horizAdvX = this.attribute('horiz-adv-x').numValue();

			this.isRTL = false;
			this.isArabic = false;
			this.fontFace = null;
			this.missingGlyph = null;
			this.glyphs = [];
			for (var i=0; i<this.children.length; i++) {
				var child = this.children[i];
				if (child.type == 'font-face') {
					this.fontFace = child;
					if (child.style('font-family').hasValue()) {
						svg.Definitions[child.style('font-family').value] = this;
					}
				}
				else if (child.type == 'missing-glyph') this.missingGlyph = child;
				else if (child.type == 'glyph') {
					if (child.arabicForm != '') {
						this.isRTL = true;
						this.isArabic = true;
						if (typeof this.glyphs[child.unicode] == 'undefined') this.glyphs[child.unicode] = [];
						this.glyphs[child.unicode][child.arabicForm] = child;
					}
					else {
						this.glyphs[child.unicode] = child;
					}
				}
			}
		}
		svg.Element.font.prototype = new svg.Element.ElementBase;

		// font-face element
		svg.Element.fontface = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.ascent = this.attribute('ascent').value;
			this.descent = this.attribute('descent').value;
			this.unitsPerEm = this.attribute('units-per-em').numValue();
		}
		svg.Element.fontface.prototype = new svg.Element.ElementBase;

		// missing-glyph element
		svg.Element.missingglyph = function(node) {
			this.base = svg.Element.path;
			this.base(node);

			this.horizAdvX = 0;
		}
		svg.Element.missingglyph.prototype = new svg.Element.path;

		// glyph element
		svg.Element.glyph = function(node) {
			this.base = svg.Element.path;
			this.base(node);

			this.horizAdvX = this.attribute('horiz-adv-x').numValue();
			this.unicode = this.attribute('unicode').value;
			this.arabicForm = this.attribute('arabic-form').value;
		}
		svg.Element.glyph.prototype = new svg.Element.path;

		// text element
		svg.Element.text = function(node) {
			this.captureTextNodes = true;
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);

				var textBaseline = this.style('dominant-baseline').toTextBaseline();
				if (textBaseline == null) textBaseline = this.style('alignment-baseline').toTextBaseline();
				if (textBaseline != null) ctx.textBaseline = textBaseline;
			}

			this.getBoundingBox = function () {
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
				return new svg.BoundingBox(x, y - fontSize, x + Math.floor(fontSize * 2.0 / 3.0) * this.children[0].getText().length, y);
			}

			this.renderChildren = function(ctx) {
				this.x = this.attribute('x').toPixels('x');
				this.y = this.attribute('y').toPixels('y');
				if (this.attribute('dx').hasValue()) this.x += this.attribute('dx').toPixels('x');
				if (this.attribute('dy').hasValue()) this.y += this.attribute('dy').toPixels('y');
				this.x += this.getAnchorDelta(ctx, this, 0);
				for (var i=0; i<this.children.length; i++) {
					this.renderChild(ctx, this, this, i);
				}
			}

			this.getAnchorDelta = function (ctx, parent, startI) {
				var textAnchor = this.style('text-anchor').valueOrDefault('start');
				if (textAnchor != 'start') {
					var width = 0;
					for (var i=startI; i<parent.children.length; i++) {
						var child = parent.children[i];
						if (i > startI && child.attribute('x').hasValue()) break; // new group
						width += child.measureTextRecursive(ctx);
					}
					return -1 * (textAnchor == 'end' ? width : width / 2.0);
				}
				return 0;
			}

			this.renderChild = function(ctx, textParent, parent, i) {
				var child = parent.children[i];
				if (child.attribute('x').hasValue()) {
					child.x = child.attribute('x').toPixels('x') + textParent.getAnchorDelta(ctx, parent, i);
					if (child.attribute('dx').hasValue()) child.x += child.attribute('dx').toPixels('x');
				}
				else {
					if (child.attribute('dx').hasValue()) textParent.x += child.attribute('dx').toPixels('x');
					child.x = textParent.x;
				}
				textParent.x = child.x + child.measureText(ctx);

				if (child.attribute('y').hasValue()) {
					child.y = child.attribute('y').toPixels('y');
					if (child.attribute('dy').hasValue()) child.y += child.attribute('dy').toPixels('y');
				}
				else {
					if (child.attribute('dy').hasValue()) textParent.y += child.attribute('dy').toPixels('y');
					child.y = textParent.y;
				}
				textParent.y = child.y;

				child.render(ctx);

				for (var i=0; i<child.children.length; i++) {
					textParent.renderChild(ctx, textParent, child, i);
				}
			}
		}
		svg.Element.text.prototype = new svg.Element.RenderedElementBase;

		// text base
		svg.Element.TextElementBase = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.getGlyph = function(font, text, i) {
				var c = text[i];
				var glyph = null;
				if (font.isArabic) {
					var arabicForm = 'isolated';
					if ((i==0 || text[i-1]==' ') && i<text.length-2 && text[i+1]!=' ') arabicForm = 'terminal';
					if (i>0 && text[i-1]!=' ' && i<text.length-2 && text[i+1]!=' ') arabicForm = 'medial';
					if (i>0 && text[i-1]!=' ' && (i == text.length-1 || text[i+1]==' ')) arabicForm = 'initial';
					if (typeof font.glyphs[c] != 'undefined') {
						glyph = font.glyphs[c][arabicForm];
						if (glyph == null && font.glyphs[c].type == 'glyph') glyph = font.glyphs[c];
					}
				}
				else {
					glyph = font.glyphs[c];
				}
				if (glyph == null) glyph = font.missingGlyph;
				return glyph;
			}

			this.renderChildren = function(ctx) {
				var customFont = this.parent.style('font-family').getDefinition();
				if (customFont != null) {
					var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
					var fontStyle = this.parent.style('font-style').valueOrDefault(svg.Font.Parse(svg.ctx.font).fontStyle);
					var text = this.getText();
					if (customFont.isRTL) text = text.split("").reverse().join("");

					var dx = svg.ToNumberArray(this.parent.attribute('dx').value);
					for (var i=0; i<text.length; i++) {
						var glyph = this.getGlyph(customFont, text, i);
						var scale = fontSize / customFont.fontFace.unitsPerEm;
						ctx.translate(this.x, this.y);
						ctx.scale(scale, -scale);
						var lw = ctx.lineWidth;
						ctx.lineWidth = ctx.lineWidth * customFont.fontFace.unitsPerEm / fontSize;
						if (fontStyle == 'italic') ctx.transform(1, 0, .4, 1, 0, 0);
						glyph.render(ctx);
						if (fontStyle == 'italic') ctx.transform(1, 0, -.4, 1, 0, 0);
						ctx.lineWidth = lw;
						ctx.scale(1/scale, -1/scale);
						ctx.translate(-this.x, -this.y);

						this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / customFont.fontFace.unitsPerEm;
						if (typeof dx[i] != 'undefined' && !isNaN(dx[i])) {
							this.x += dx[i];
						}
					}
					return;
				}

				if (ctx.fillStyle != '') ctx.fillText(svg.compressSpaces(this.getText()), this.x, this.y);
				if (ctx.strokeStyle != '') ctx.strokeText(svg.compressSpaces(this.getText()), this.x, this.y);
			}

			this.getText = function() {
				// OVERRIDE ME
			}

			this.measureTextRecursive = function(ctx) {
				var width = this.measureText(ctx);
				for (var i=0; i<this.children.length; i++) {
					width += this.children[i].measureTextRecursive(ctx);
				}
				return width;
			}

			this.measureText = function(ctx) {
				var customFont = this.parent.style('font-family').getDefinition();
				if (customFont != null) {
					var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
					var measure = 0;
					var text = this.getText();
					if (customFont.isRTL) text = text.split("").reverse().join("");
					var dx = svg.ToNumberArray(this.parent.attribute('dx').value);
					for (var i=0; i<text.length; i++) {
						var glyph = this.getGlyph(customFont, text, i);
						measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm;
						if (typeof dx[i] != 'undefined' && !isNaN(dx[i])) {
							measure += dx[i];
						}
					}
					return measure;
				}

				var textToMeasure = svg.compressSpaces(this.getText());
				if (!ctx.measureText) return textToMeasure.length * 10;

				ctx.save();
				this.setContext(ctx);
				var width = ctx.measureText(textToMeasure).width;
				ctx.restore();
				return width;
			}
		}
		svg.Element.TextElementBase.prototype = new svg.Element.RenderedElementBase;

		// tspan
		svg.Element.tspan = function(node) {
			this.captureTextNodes = true;
			this.base = svg.Element.TextElementBase;
			this.base(node);

			this.text = svg.compressSpaces(node.value || node.text || node.textContent || '');
			this.getText = function() {
				// if this node has children, then they own the text
				if (this.children.length > 0) { return ''; }
				return this.text;
			}
		}
		svg.Element.tspan.prototype = new svg.Element.TextElementBase;

		// tref
		svg.Element.tref = function(node) {
			this.base = svg.Element.TextElementBase;
			this.base(node);

			this.getText = function() {
				var element = this.getHrefAttribute().getDefinition();
				if (element != null) return element.children[0].getText();
			}
		}
		svg.Element.tref.prototype = new svg.Element.TextElementBase;

		// a element
		svg.Element.a = function(node) {
			this.base = svg.Element.TextElementBase;
			this.base(node);

			this.hasText = node.childNodes.length > 0;
			for (var i=0; i<node.childNodes.length; i++) {
				if (node.childNodes[i].nodeType != 3) this.hasText = false;
			}

			// this might contain text
			this.text = this.hasText ? node.childNodes[0].value : '';
			this.getText = function() {
				return this.text;
			}

			this.baseRenderChildren = this.renderChildren;
			this.renderChildren = function(ctx) {
				if (this.hasText) {
					// render as text element
					this.baseRenderChildren(ctx);
					var fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
					svg.Mouse.checkBoundingBox(this, new svg.BoundingBox(this.x, this.y - fontSize.toPixels('y'), this.x + this.measureText(ctx), this.y));
				}
				else if (this.children.length > 0) {
					// render as temporary group
					var g = new svg.Element.g();
					g.children = this.children;
					g.parent = this;
					g.render(ctx);
				}
			}

			this.onclick = function() {
				window.open(this.getHrefAttribute().value);
			}

			this.onmousemove = function() {
				svg.ctx.canvas.style.cursor = 'pointer';
			}
		}
		svg.Element.a.prototype = new svg.Element.TextElementBase;

		// image element
		svg.Element.image = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			var href = this.getHrefAttribute().value;
			if (href == '') { return; }
			var isSvg = href.match(/\.svg$/)

			svg.Images.push(this);
			this.loaded = false;
			if (!isSvg) {
				this.img = document.createElement('img');
				if (svg.opts['useCORS'] == true) { this.img.crossOrigin = 'Anonymous'; }
				var self = this;
				this.img.onload = function() { self.loaded = true; }
				this.img.onerror = function() { svg.log('ERROR: image "' + href + '" not found'); self.loaded = true; }
				this.img.src = href;
			}
			else {
				this.img = svg.ajax(href);
				this.loaded = true;
			}

			this.renderChildren = function(ctx) {
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');

				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');
				if (width == 0 || height == 0) return;

				ctx.save();
				if (isSvg) {
					ctx.drawSvg(this.img, x, y, width, height);
				}
				else {
					ctx.translate(x, y);
					svg.AspectRatio(ctx,
									this.attribute('preserveAspectRatio').value,
									width,
									this.img.width,
									height,
									this.img.height,
									0,
									0);
					ctx.drawImage(this.img, 0, 0);
				}
				ctx.restore();
			}

			this.getBoundingBox = function() {
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');
				return new svg.BoundingBox(x, y, x + width, y + height);
			}
		}
		svg.Element.image.prototype = new svg.Element.RenderedElementBase;

		// group element
		svg.Element.g = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.getBoundingBox = function() {
				var bb = new svg.BoundingBox();
				for (var i=0; i<this.children.length; i++) {
					bb.addBoundingBox(this.children[i].getBoundingBox());
				}
				return bb;
			};
		}
		svg.Element.g.prototype = new svg.Element.RenderedElementBase;

		// symbol element
		svg.Element.symbol = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.render = function(ctx) {
				// NO RENDER
			};
		}
		svg.Element.symbol.prototype = new svg.Element.RenderedElementBase;

		// style element
		svg.Element.style = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			// text, or spaces then CDATA
			var css = ''
			for (var i=0; i<node.childNodes.length; i++) {
			  css += node.childNodes[i].data;
			}
			css = css.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, ''); // remove comments
			css = svg.compressSpaces(css); // replace whitespace
			var cssDefs = css.split('}');
			for (var i=0; i<cssDefs.length; i++) {
				if (svg.trim(cssDefs[i]) != '') {
					var cssDef = cssDefs[i].split('{');
					var cssClasses = cssDef[0].split(',');
					var cssProps = cssDef[1].split(';');
					for (var j=0; j<cssClasses.length; j++) {
						var cssClass = svg.trim(cssClasses[j]);
						if (cssClass != '') {
							var props = svg.Styles[cssClass] || {};
							for (var k=0; k<cssProps.length; k++) {
								var prop = cssProps[k].indexOf(':');
								var name = cssProps[k].substr(0, prop);
								var value = cssProps[k].substr(prop + 1, cssProps[k].length - prop);
								if (name != null && value != null) {
									props[svg.trim(name)] = new svg.Property(svg.trim(name), svg.trim(value));
								}
							}
							svg.Styles[cssClass] = props;
							svg.StylesSpecificity[cssClass] = getSelectorSpecificity(cssClass);
							if (cssClass == '@font-face') {
								var fontFamily = props['font-family'].value.replace(/"/g,'');
								var srcs = props['src'].value.split(',');
								for (var s=0; s<srcs.length; s++) {
									if (srcs[s].indexOf('format("svg")') > 0) {
										var urlStart = srcs[s].indexOf('url');
										var urlEnd = srcs[s].indexOf(')', urlStart);
										var url = srcs[s].substr(urlStart + 5, urlEnd - urlStart - 6);
										var doc = svg.parseXml(svg.ajax(url));
										var fonts = doc.getElementsByTagName('font');
										for (var f=0; f<fonts.length; f++) {
											var font = svg.CreateElement(fonts[f]);
											svg.Definitions[fontFamily] = font;
										}
									}
								}
							}
						}
					}
				}
			}
		}
		svg.Element.style.prototype = new svg.Element.ElementBase;

		// use element
		svg.Element.use = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);
				if (this.attribute('x').hasValue()) ctx.translate(this.attribute('x').toPixels('x'), 0);
				if (this.attribute('y').hasValue()) ctx.translate(0, this.attribute('y').toPixels('y'));
			}

			var element = this.getHrefAttribute().getDefinition();

			this.path = function(ctx) {
				if (element != null) element.path(ctx);
			}

			this.getBoundingBox = function() {
				if (element != null) return element.getBoundingBox();
			}

			this.renderChildren = function(ctx) {
				if (element != null) {
					var tempSvg = element;
					if (element.type == 'symbol') {
						// render me using a temporary svg element in symbol cases (http://www.w3.org/TR/SVG/struct.html#UseElement)
						tempSvg = new svg.Element.svg();
						tempSvg.type = 'svg';
						tempSvg.attributes['viewBox'] = new svg.Property('viewBox', element.attribute('viewBox').value);
						tempSvg.attributes['preserveAspectRatio'] = new svg.Property('preserveAspectRatio', element.attribute('preserveAspectRatio').value);
						tempSvg.attributes['overflow'] = new svg.Property('overflow', element.attribute('overflow').value);
						tempSvg.children = element.children;
					}
					if (tempSvg.type == 'svg') {
						// if symbol or svg, inherit width/height from me
						if (this.attribute('width').hasValue()) tempSvg.attributes['width'] = new svg.Property('width', this.attribute('width').value);
						if (this.attribute('height').hasValue()) tempSvg.attributes['height'] = new svg.Property('height', this.attribute('height').value);
					}
					var oldParent = tempSvg.parent;
					tempSvg.parent = null;
					tempSvg.render(ctx);
					tempSvg.parent = oldParent;
				}
			}
		}
		svg.Element.use.prototype = new svg.Element.RenderedElementBase;

		// mask element
		svg.Element.mask = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.apply = function(ctx, element) {
				// render as temp svg
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');

				if (width == 0 && height == 0) {
					var bb = new svg.BoundingBox();
					for (var i=0; i<this.children.length; i++) {
						bb.addBoundingBox(this.children[i].getBoundingBox());
					}
					var x = Math.floor(bb.x1);
					var y = Math.floor(bb.y1);
					var width = Math.floor(bb.width());
					var	height = Math.floor(bb.height());
				}

				// temporarily remove mask to avoid recursion
				var mask = element.attribute('mask').value;
				element.attribute('mask').value = '';

					var cMask = document.createElement('canvas');
					cMask.width = x + width;
					cMask.height = y + height;
					var maskCtx = cMask.getContext('2d');
					this.renderChildren(maskCtx);

					var c = document.createElement('canvas');
					c.width = x + width;
					c.height = y + height;
					var tempCtx = c.getContext('2d');
					element.render(tempCtx);
					tempCtx.globalCompositeOperation = 'destination-in';
					tempCtx.fillStyle = maskCtx.createPattern(cMask, 'no-repeat');
					tempCtx.fillRect(0, 0, x + width, y + height);

					ctx.fillStyle = tempCtx.createPattern(c, 'no-repeat');
					ctx.fillRect(0, 0, x + width, y + height);

				// reassign mask
				element.attribute('mask').value = mask;
			}

			this.render = function(ctx) {
				// NO RENDER
			}
		}
		svg.Element.mask.prototype = new svg.Element.ElementBase;

		// clip element
		svg.Element.clipPath = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.apply = function(ctx) {
				var oldBeginPath = CanvasRenderingContext2D.prototype.beginPath;
				CanvasRenderingContext2D.prototype.beginPath = function () { };

				var oldClosePath = CanvasRenderingContext2D.prototype.closePath;
				CanvasRenderingContext2D.prototype.closePath = function () { };

				oldBeginPath.call(ctx);
				for (var i=0; i<this.children.length; i++) {
					var child = this.children[i];
					if (typeof child.path != 'undefined') {
						var transform = null;
						if (child.style('transform', false, true).hasValue()) {
							transform = new svg.Transform(child.style('transform', false, true).value);
							transform.apply(ctx);
						}
						child.path(ctx);
						CanvasRenderingContext2D.prototype.closePath = oldClosePath;
						if (transform) { transform.unapply(ctx); }
					}
				}
				oldClosePath.call(ctx);
				ctx.clip();

				CanvasRenderingContext2D.prototype.beginPath = oldBeginPath;
				CanvasRenderingContext2D.prototype.closePath = oldClosePath;
			}

			this.render = function(ctx) {
				// NO RENDER
			}
		}
		svg.Element.clipPath.prototype = new svg.Element.ElementBase;

		// filters
		svg.Element.filter = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.apply = function(ctx, element) {
				// render as temp svg
				var bb = element.getBoundingBox();
				var x = Math.floor(bb.x1);
				var y = Math.floor(bb.y1);
				var width = Math.floor(bb.width());
				var	height = Math.floor(bb.height());

				// temporarily remove filter to avoid recursion
				var filter = element.style('filter').value;
				element.style('filter').value = '';

				var px = 0, py = 0;
				for (var i=0; i<this.children.length; i++) {
					var efd = this.children[i].extraFilterDistance || 0;
					px = Math.max(px, efd);
					py = Math.max(py, efd);
				}

				var c = document.createElement('canvas');
				c.width = width + 2*px;
				c.height = height + 2*py;
				var tempCtx = c.getContext('2d');
				tempCtx.translate(-x + px, -y + py);
				element.render(tempCtx);

				// apply filters
				for (var i=0; i<this.children.length; i++) {
					if (typeof this.children[i].apply == 'function') {
						this.children[i].apply(tempCtx, 0, 0, width + 2*px, height + 2*py);
					}
				}

				// render on me
				ctx.drawImage(c, 0, 0, width + 2*px, height + 2*py, x - px, y - py, width + 2*px, height + 2*py);

				// reassign filter
				element.style('filter', true).value = filter;
			}

			this.render = function(ctx) {
				// NO RENDER
			}
		}
		svg.Element.filter.prototype = new svg.Element.ElementBase;

		svg.Element.feMorphology = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.apply = function(ctx, x, y, width, height) {
				// TODO: implement
			}
		}
		svg.Element.feMorphology.prototype = new svg.Element.ElementBase;

		svg.Element.feComposite = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.apply = function(ctx, x, y, width, height) {
				// TODO: implement
			}
		}
		svg.Element.feComposite.prototype = new svg.Element.ElementBase;

		svg.Element.feColorMatrix = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			var matrix = svg.ToNumberArray(this.attribute('values').value);
			switch (this.attribute('type').valueOrDefault('matrix')) { // http://www.w3.org/TR/SVG/filters.html#feColorMatrixElement
				case 'saturate':
					var s = matrix[0];
					matrix = [0.213+0.787*s,0.715-0.715*s,0.072-0.072*s,0,0,
							  0.213-0.213*s,0.715+0.285*s,0.072-0.072*s,0,0,
							  0.213-0.213*s,0.715-0.715*s,0.072+0.928*s,0,0,
							  0,0,0,1,0,
							  0,0,0,0,1];
					break;
				case 'hueRotate':
					var a = matrix[0] * Math.PI / 180.0;
					var c = function (m1,m2,m3) { return m1 + Math.cos(a)*m2 + Math.sin(a)*m3; };
					matrix = [c(0.213,0.787,-0.213),c(0.715,-0.715,-0.715),c(0.072,-0.072,0.928),0,0,
							  c(0.213,-0.213,0.143),c(0.715,0.285,0.140),c(0.072,-0.072,-0.283),0,0,
							  c(0.213,-0.213,-0.787),c(0.715,-0.715,0.715),c(0.072,0.928,0.072),0,0,
							  0,0,0,1,0,
							  0,0,0,0,1];
					break;
				case 'luminanceToAlpha':
					matrix = [0,0,0,0,0,
							  0,0,0,0,0,
							  0,0,0,0,0,
							  0.2125,0.7154,0.0721,0,0,
							  0,0,0,0,1];
					break;
			}

			function imGet(img, x, y, width, height, rgba) {
				return img[y*width*4 + x*4 + rgba];
			}

			function imSet(img, x, y, width, height, rgba, val) {
				img[y*width*4 + x*4 + rgba] = val;
			}

			function m(i, v) {
				var mi = matrix[i];
				return mi * (mi < 0 ? v - 255 : v);
			}

			this.apply = function(ctx, x, y, width, height) {
				// assuming x==0 && y==0 for now
				var srcData = ctx.getImageData(0, 0, width, height);
				for (var y = 0; y < height; y++) {
					for (var x = 0; x < width; x++) {
						var r = imGet(srcData.data, x, y, width, height, 0);
						var g = imGet(srcData.data, x, y, width, height, 1);
						var b = imGet(srcData.data, x, y, width, height, 2);
						var a = imGet(srcData.data, x, y, width, height, 3);
						imSet(srcData.data, x, y, width, height, 0, m(0,r)+m(1,g)+m(2,b)+m(3,a)+m(4,1));
						imSet(srcData.data, x, y, width, height, 1, m(5,r)+m(6,g)+m(7,b)+m(8,a)+m(9,1));
						imSet(srcData.data, x, y, width, height, 2, m(10,r)+m(11,g)+m(12,b)+m(13,a)+m(14,1));
						imSet(srcData.data, x, y, width, height, 3, m(15,r)+m(16,g)+m(17,b)+m(18,a)+m(19,1));
					}
				}
				ctx.clearRect(0, 0, width, height);
				ctx.putImageData(srcData, 0, 0);
			}
		}
		svg.Element.feColorMatrix.prototype = new svg.Element.ElementBase;

		svg.Element.feGaussianBlur = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.blurRadius = Math.floor(this.attribute('stdDeviation').numValue());
			this.extraFilterDistance = this.blurRadius;

			this.apply = function(ctx, x, y, width, height) {
				if (typeof stackBlur.canvasRGBA == 'undefined') {
					svg.log('ERROR: StackBlur.js must be included for blur to work');
					return;
				}

				// StackBlur requires canvas be on document
				ctx.canvas.id = svg.UniqueId();
				ctx.canvas.style.display = 'none';
				document.body.appendChild(ctx.canvas);
				stackBlur.canvasRGBA(ctx.canvas.id, x, y, width, height, this.blurRadius);
				document.body.removeChild(ctx.canvas);
			}
		}
		svg.Element.feGaussianBlur.prototype = new svg.Element.ElementBase;

		// title element, do nothing
		svg.Element.title = function(node) {
		}
		svg.Element.title.prototype = new svg.Element.ElementBase;

		// desc element, do nothing
		svg.Element.desc = function(node) {
		}
		svg.Element.desc.prototype = new svg.Element.ElementBase;

		svg.Element.MISSING = function(node) {
			svg.log('ERROR: Element \'' + node.nodeName + '\' not yet implemented.');
		}
		svg.Element.MISSING.prototype = new svg.Element.ElementBase;

		// element factory
		svg.CreateElement = function(node) {
			var className = node.nodeName.replace(/^[^:]+:/,''); // remove namespace
			className = className.replace(/\-/g,''); // remove dashes
			var e = null;
			if (typeof svg.Element[className] != 'undefined') {
				e = new svg.Element[className](node);
			}
			else {
				e = new svg.Element.MISSING(node);
			}

			e.type = node.nodeName;
			return e;
		}

		// load from url
		svg.load = function(ctx, url) {
			svg.loadXml(ctx, svg.ajax(url));
		}

		// load from xml
		svg.loadXml = function(ctx, xml) {
			svg.loadXmlDoc(ctx, svg.parseXml(xml));
		}

		svg.loadXmlDoc = function(ctx, dom) {
			svg.init(ctx);

			var mapXY = function(p) {
				var e = ctx.canvas;
				while (e) {
					p.x -= e.offsetLeft;
					p.y -= e.offsetTop;
					e = e.offsetParent;
				}
				if (window.pageXOffset) p.x += window.pageXOffset;
				if (window.pageYOffset) p.y += window.pageYOffset;
				return p;
			}

			// bind mouse
			if (svg.opts['ignoreMouse'] != true) {
				ctx.canvas.onclick = function(e) {
					var p = mapXY(new svg.Point(e != null ? e.clientX : event.clientX, e != null ? e.clientY : event.clientY));
					svg.Mouse.onclick(p.x, p.y);
				};
				ctx.canvas.onmousemove = function(e) {
					var p = mapXY(new svg.Point(e != null ? e.clientX : event.clientX, e != null ? e.clientY : event.clientY));
					svg.Mouse.onmousemove(p.x, p.y);
				};
			}

			var e = svg.CreateElement(dom.documentElement);
			e.root = true;
			e.addStylesFromStyleDefinition();

			// render loop
			var isFirstRender = true;
			var draw = function() {
				svg.ViewPort.Clear();
				if (ctx.canvas.parentNode) svg.ViewPort.SetCurrent(ctx.canvas.parentNode.clientWidth, ctx.canvas.parentNode.clientHeight);

				if (svg.opts['ignoreDimensions'] != true) {
					// set canvas size
					if (e.style('width').hasValue()) {
						ctx.canvas.width = e.style('width').toPixels('x');
						ctx.canvas.style.width = ctx.canvas.width + 'px';
					}
					if (e.style('height').hasValue()) {
						ctx.canvas.height = e.style('height').toPixels('y');
						ctx.canvas.style.height = ctx.canvas.height + 'px';
					}
				}
				var cWidth = ctx.canvas.clientWidth || ctx.canvas.width;
				var cHeight = ctx.canvas.clientHeight || ctx.canvas.height;
				if (svg.opts['ignoreDimensions'] == true && e.style('width').hasValue() && e.style('height').hasValue()) {
					cWidth = e.style('width').toPixels('x');
					cHeight = e.style('height').toPixels('y');
				}
				svg.ViewPort.SetCurrent(cWidth, cHeight);

				if (svg.opts['offsetX'] != null) e.attribute('x', true).value = svg.opts['offsetX'];
				if (svg.opts['offsetY'] != null) e.attribute('y', true).value = svg.opts['offsetY'];
				if (svg.opts['scaleWidth'] != null || svg.opts['scaleHeight'] != null) {
					var xRatio = null, yRatio = null, viewBox = svg.ToNumberArray(e.attribute('viewBox').value);

					if (svg.opts['scaleWidth'] != null) {
						if (e.attribute('width').hasValue()) xRatio = e.attribute('width').toPixels('x') / svg.opts['scaleWidth'];
						else if (!isNaN(viewBox[2])) xRatio = viewBox[2] / svg.opts['scaleWidth'];
					}

					if (svg.opts['scaleHeight'] != null) {
						if (e.attribute('height').hasValue()) yRatio = e.attribute('height').toPixels('y') / svg.opts['scaleHeight'];
						else if (!isNaN(viewBox[3])) yRatio = viewBox[3] / svg.opts['scaleHeight'];
					}

					if (xRatio == null) { xRatio = yRatio; }
					if (yRatio == null) { yRatio = xRatio; }

					e.attribute('width', true).value = svg.opts['scaleWidth'];
					e.attribute('height', true).value = svg.opts['scaleHeight'];
					e.style('transform', true, true).value += ' scale('+(1.0/xRatio)+','+(1.0/yRatio)+')';
				}

				// clear and render
				if (svg.opts['ignoreClear'] != true) {
					ctx.clearRect(0, 0, cWidth, cHeight);
				}
				e.render(ctx);
				if (isFirstRender) {
					isFirstRender = false;
					if (typeof svg.opts['renderCallback'] == 'function') svg.opts['renderCallback'](dom);
				}
			}

			var waitingForImages = true;
			if (svg.ImagesLoaded()) {
				waitingForImages = false;
				draw();
			}
			svg.intervalID = setInterval(function() {
				var needUpdate = false;

				if (waitingForImages && svg.ImagesLoaded()) {
					waitingForImages = false;
					needUpdate = true;
				}

				// need update from mouse events?
				if (svg.opts['ignoreMouse'] != true) {
					needUpdate = needUpdate | svg.Mouse.hasEvents();
				}

				// need update from animations?
				if (svg.opts['ignoreAnimation'] != true) {
					for (var i=0; i<svg.Animations.length; i++) {
						needUpdate = needUpdate | svg.Animations[i].update(1000 / svg.FRAMERATE);
					}
				}

				// need update from redraw?
				if (typeof svg.opts['forceRedraw'] == 'function') {
					if (svg.opts['forceRedraw']() == true) needUpdate = true;
				}

				// render if needed
				if (needUpdate) {
					draw();
					svg.Mouse.runEvents(); // run and clear our events
				}
			}, 1000 / svg.FRAMERATE);
		}

		svg.stop = function() {
			if (svg.intervalID) {
				clearInterval(svg.intervalID);
			}
		}

		svg.Mouse = new (function() {
			this.events = [];
			this.hasEvents = function() { return this.events.length != 0; }

			this.onclick = function(x, y) {
				this.events.push({ type: 'onclick', x: x, y: y,
					run: function(e) { if (e.onclick) e.onclick(); }
				});
			}

			this.onmousemove = function(x, y) {
				this.events.push({ type: 'onmousemove', x: x, y: y,
					run: function(e) { if (e.onmousemove) e.onmousemove(); }
				});
			}

			this.eventElements = [];

			this.checkPath = function(element, ctx) {
				for (var i=0; i<this.events.length; i++) {
					var e = this.events[i];
					if (ctx.isPointInPath && ctx.isPointInPath(e.x, e.y)) this.eventElements[i] = element;
				}
			}

			this.checkBoundingBox = function(element, bb) {
				for (var i=0; i<this.events.length; i++) {
					var e = this.events[i];
					if (bb.isPointInBox(e.x, e.y)) this.eventElements[i] = element;
				}
			}

			this.runEvents = function() {
				svg.ctx.canvas.style.cursor = '';

				for (var i=0; i<this.events.length; i++) {
					var e = this.events[i];
					var element = this.eventElements[i];
					while (element) {
						e.run(element);
						element = element.parent;
					}
				}

				// done running, clear
				this.events = [];
				this.eventElements = [];
			}
		});

		return svg;
	};

	if (typeof CanvasRenderingContext2D  != 'undefined') {
		CanvasRenderingContext2D.prototype.drawSvg = function(s, dx, dy, dw, dh, opts) {
			var cOpts = {
				ignoreMouse: true,
				ignoreAnimation: true,
				ignoreDimensions: true,
				ignoreClear: true,
				offsetX: dx,
				offsetY: dy,
				scaleWidth: dw,
				scaleHeight: dh
			}

			for(var prop in opts) {
				if(opts.hasOwnProperty(prop)){
					cOpts[prop] = opts[prop];
				}
			}
			canvg(this.canvas, s, cOpts);
		}
	}

	return canvg;

}));

/**  
 * jsPDF - PDF Document creation from JavaScript
 * Version 1.1.239-git Built on 2015-08-26T20:20
 *                           CommitID 6b73dc2e73
 *
 * Copyright (c) 2010-2014 James Hall <james@parall.ax>, https://github.com/MrRio/jsPDF
 *               2010 Aaron Spike, https://github.com/acspike
 *               2012 Willow Systems Corporation, willow-systems.com
 *               2012 Pablo Hess, https://github.com/pablohess
 *               2012 Florian Jenett, https://github.com/fjenett
 *               2013 Warren Weckesser, https://github.com/warrenweckesser
 *               2013 Youssef Beddad, https://github.com/lifof
 *               2013 Lee Driscoll, https://github.com/lsdriscoll
 *               2013 Stefan Slonevskiy, https://github.com/stefslon
 *               2013 Jeremy Morel, https://github.com/jmorel
 *               2013 Christoph Hartmann, https://github.com/chris-rock
 *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
 *               2014 James Makes, https://github.com/dollaruw
 *               2014 Diego Casorran, https://github.com/diegocr
 *               2014 Steven Spungin, https://github.com/Flamenco
 *               2014 Kenneth Glassey, https://github.com/Gavvers
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Contributor(s):
 *    siefkenj, ahwolf, rickygu, Midnith, saintclair, eaparango,
 *    kim3er, mfo, alnorth, Flamenco
 */
/**
 * jsPDF addHTML PlugIn
 * Copyright (c) 2014 Diego Casorran
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
/**  
 * jsPDF addImage plugin
 * Copyright (c) 2012 Jason Siefken, https://github.com/siefkenj/
 *               2013 Chris Dowling, https://github.com/gingerchris
 *               2013 Trinh Ho, https://github.com/ineedfat
 *               2013 Edwin Alejandro Perez, https://github.com/eaparango
 *               2013 Norah Smith, https://github.com/burnburnrocket
 *               2014 Diego Casorran, https://github.com/diegocr
 *               2014 James Robb, https://github.com/jamesbrobb
 *
 */
/**
 * jsPDF Annotations PlugIn
 * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
/**
 * jsPDF Autoprint Plugin
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
/**
 * jsPDF Canvas PlugIn
 * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
/** ====================================================================
 * jsPDF Cell plugin
 * Copyright (c) 2013 Youssef Beddad, youssef.beddad@gmail.com
 *               2013 Eduardo Menezes de Morais, eduardo.morais@usp.br
 *               2013 Lee Driscoll, https://github.com/lsdriscoll
 *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
 *               2014 James Hall, james@parall.ax
 *               2014 Diego Casorran, https://github.com/diegocr
 *
 * ====================================================================
 */
/**
 * jsPDF Context2D PlugIn
 * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
/**  
 * jsPDF fromHTML plugin. BETA stage. API subject to change. Needs browser
 * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
 *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
 *               2014 Diego Casorran, https://github.com/diegocr
 *               2014 Daniel Husar, https://github.com/danielhusar
 *               2014 Wolfgang Gassler, https://github.com/woolfg
 *               2014 Steven Spungin, https://github.com/flamenco
 *
 * ====================================================================
 */
/** ==================================================================== 
 * jsPDF JavaScript plugin
 * Copyright (c) 2013 Youssef Beddad, youssef.beddad@gmail.com
 * 
 * ====================================================================
 */
/**
 * jsPDF Outline PlugIn
 * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
/** 
 *  ==================================================================== 
 * jsPDF PNG PlugIn
 * Copyright (c) 2014 James Robb, https://github.com/jamesbrobb
 * 
 * ====================================================================
 */
/**  
 * jsPDF split_text_to_size plugin - MIT license.
 * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
 *               2014 Diego Casorran, https://github.com/diegocr
 */
/**   
jsPDF standard_fonts_metrics plugin
Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
MIT license.
*/
/**  
jsPDF SVG plugin
Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
*/
/** ==================================================================== 
 * jsPDF total_pages plugin
 * Copyright (c) 2013 Eduardo Menezes de Morais, eduardo.morais@usp.br
 * 
 * ====================================================================
 */
/* Blob.js
 * A Blob implementation.
 * 2014-07-24
 *
 * By Eli Grey, http://eligrey.com
 * By Devin Samarin, https://github.com/dsamarin
 * License: X11/MIT
 *   See https://github.com/eligrey/Blob.js/blob/master/LICENSE.md
 */
/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.1.20150716
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */
/*
 * Copyright (c) 2012 chick307 <chick307@gmail.com>
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
/**
 * CssColors
 * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
/*
 Deflate.js - https://github.com/gildas-lormeau/zip.js
 Copyright (c) 2013 Gildas Lormeau. All rights reserved.
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.
 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.
 THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/*
  html2canvas 0.5.0-alpha <http://html2canvas.hertzen.com>
  Copyright (c) 2014 Niklas von Hertzen
  Released under MIT License
*/
/*
 Copyright (c) 2013 Yehuda Katz, Tom Dale, and contributors
 */
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
/**
 * html2pdf.js
 * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
/*
# PNG.js
# Copyright (c) 2011 Devon Govett
# MIT LICENSE
# 
*/
/*
 * Extracted from pdf.js
 * https://github.com/andreasgal/pdf.js
 *
 * Copyright (c) 2011 Mozilla Foundation
 *
 * Contributors: Andreas Gal <gal@mozilla.com>
 *               Chris G Jones <cjones@mozilla.com>
 *               Shaon Barman <shaon.barman@gmail.com>
 *               Vivien Nicolas <21@vingtetun.org>
 *               Justin D'Arcangelo <justindarc@gmail.com>
 *               Yury Delendik
 *
 */
/**
 * JavaScript Polyfill functions for jsPDF
 * Collected from public resources by
 * https://github.com/diegocr
 */
/**
 * config.js
 * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
 * Copyright (c) 2015 James Hall (Parallax Agency Ltd) james@parall.ax
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.1.15 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
!function(exports,global){function renderDocument(t,e,n,r){return createWindowClone(t,t,n,r,e).then(function(i){log("Document cloned");var o="["+html2canvasNodeAttribute+"='true']";t.querySelector(o).removeAttribute(html2canvasNodeAttribute);var s=i.contentWindow,a=s.document.querySelector(o),c="function"==typeof e.onclone?Promise.resolve(e.onclone(s.document)):Promise.resolve(!0);return c.then(function(){return renderWindow(a,i,e,n,r)})})}function renderWindow(t,e,n,r,i){var o=e.contentWindow,s=new Support(o.document),a=new ImageLoader(n,s),c=getBounds(t),u="view"===n.type?r:documentWidth(o.document),l="view"===n.type?i:documentHeight(o.document),h=new CanvasRenderer(u,l,a,n,document),d=new NodeParser(t,h,s,a,n);return d.ready.then(function(){log("Finished rendering");var r;return r="view"===n.type?crop(h.canvas,{width:h.canvas.width,height:h.canvas.height,top:0,left:0,x:0,y:0}):t===o.document.body||t===o.document.documentElement||null!=n.canvas?h.canvas:crop(h.canvas,{width:null!=n.width?n.width:c.width,height:null!=n.height?n.height:c.height,top:c.top,left:c.left,x:o.pageXOffset,y:o.pageYOffset}),cleanupContainer(e,n),r})}function cleanupContainer(t,e){e.removeContainer&&(t.parentNode.removeChild(t),log("Cleaned up container"))}function crop(t,e){var n=document.createElement("canvas"),r=Math.min(t.width-1,Math.max(0,e.left)),i=Math.min(t.width,Math.max(1,e.left+e.width)),o=Math.min(t.height-1,Math.max(0,e.top)),s=Math.min(t.height,Math.max(1,e.top+e.height));return n.width=e.width,n.height=e.height,log("Cropping canvas at:","left:",e.left,"top:",e.top,"width:",i-r,"height:",s-o),log("Resulting crop with width",e.width,"and height",e.height," with x",r,"and y",o),n.getContext("2d").drawImage(t,r,o,i-r,s-o,e.x,e.y,i-r,s-o),n}function documentWidth(t){return Math.max(Math.max(t.body.scrollWidth,t.documentElement.scrollWidth),Math.max(t.body.offsetWidth,t.documentElement.offsetWidth),Math.max(t.body.clientWidth,t.documentElement.clientWidth))}function documentHeight(t){return Math.max(Math.max(t.body.scrollHeight,t.documentElement.scrollHeight),Math.max(t.body.offsetHeight,t.documentElement.offsetHeight),Math.max(t.body.clientHeight,t.documentElement.clientHeight))}function smallImage(){return"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}function createWindowClone(t,e,n,r,i){labelCanvasElements(t);var o=t.documentElement.cloneNode(!0),s=e.createElement("iframe");return s.className="html2canvas-container",s.style.visibility="hidden",s.style.position="fixed",s.style.left="-10000px",s.style.top="0px",s.style.border="0",s.width=n,s.height=r,s.scrolling="no",e.body.appendChild(s),new Promise(function(e){var n=s.contentWindow.document;s.contentWindow.onload=s.onload=function(){var o=setInterval(function(){n.body.childNodes.length>0&&(cloneCanvasContents(t,n),clearInterval(o),"view"===i.type&&s.contentWindow.scrollTo(r,a),e(s))},50)};var r=t.defaultView.pageXOffset,a=t.defaultView.pageYOffset;n.open(),n.write("<!DOCTYPE html><html></html>"),restoreOwnerScroll(t,r,a),n.replaceChild(i.javascriptEnabled===!0?n.adoptNode(o):removeScriptNodes(n.adoptNode(o)),n.documentElement),n.close()})}function restoreOwnerScroll(t,e,n){(e!==t.defaultView.pageXOffset||n!==t.defaultView.pageYOffset)&&t.defaultView.scrollTo(e,n)}function loadUrlDocument(t,e,n,r,i,o){return new Proxy(t,e,window.document).then(documentFromHTML(t)).then(function(t){return createWindowClone(t,n,r,i,o)})}function documentFromHTML(t){return function(e){var n,r=new DOMParser;try{n=r.parseFromString(e,"text/html")}catch(i){log("DOMParser not supported, falling back to createHTMLDocument"),n=document.implementation.createHTMLDocument("");try{n.open(),n.write(e),n.close()}catch(o){log("createHTMLDocument write not supported, falling back to document.body.innerHTML"),n.body.innerHTML=e}}var s=n.querySelector("base");if(!s||!s.href.host){var a=n.createElement("base");a.href=t,n.head.insertBefore(a,n.head.firstChild)}return n}}function labelCanvasElements(t){[].slice.call(t.querySelectorAll("canvas"),0).forEach(function(t){t.setAttribute(html2canvasCanvasCloneAttribute,"canvas-"+html2canvasCanvasCloneIndex++)})}function cloneCanvasContents(t,e){[].slice.call(t.querySelectorAll("["+html2canvasCanvasCloneAttribute+"]"),0).forEach(function(t){try{var n=e.querySelector("["+html2canvasCanvasCloneAttribute+'="'+t.getAttribute(html2canvasCanvasCloneAttribute)+'"]');n&&(n.width=t.width,n.height=t.height,n.getContext("2d").putImageData(t.getContext("2d").getImageData(0,0,t.width,t.height),0,0))}catch(r){log("Unable to copy canvas content from",t,r)}t.removeAttribute(html2canvasCanvasCloneAttribute)})}function removeScriptNodes(t){return[].slice.call(t.childNodes,0).filter(isElementNode).forEach(function(e){"SCRIPT"===e.tagName?t.removeChild(e):removeScriptNodes(e)}),t}function isElementNode(t){return t.nodeType===Node.ELEMENT_NODE}function absoluteUrl(t){var e=document.createElement("a");return e.href=t,e.href=e.href,e}function DummyImageContainer(t){if(this.src=t,log("DummyImageContainer for",t),!this.promise||!this.image){log("Initiating DummyImageContainer"),DummyImageContainer.prototype.image=new Image;var e=this.image;DummyImageContainer.prototype.promise=new Promise(function(t,n){e.onload=t,e.onerror=n,e.src=smallImage(),e.complete===!0&&t(e)})}}function Font(t,e){var n,r,i=document.createElement("div"),o=document.createElement("img"),s=document.createElement("span"),a="Hidden Text";i.style.visibility="hidden",i.style.fontFamily=t,i.style.fontSize=e,i.style.margin=0,i.style.padding=0,document.body.appendChild(i),o.src=smallImage(),o.width=1,o.height=1,o.style.margin=0,o.style.padding=0,o.style.verticalAlign="baseline",s.style.fontFamily=t,s.style.fontSize=e,s.style.margin=0,s.style.padding=0,s.appendChild(document.createTextNode(a)),i.appendChild(s),i.appendChild(o),n=o.offsetTop-s.offsetTop+1,i.removeChild(s),i.appendChild(document.createTextNode(a)),i.style.lineHeight="normal",o.style.verticalAlign="super",r=o.offsetTop-i.offsetTop+1,document.body.removeChild(i),this.baseline=n,this.lineWidth=1,this.middle=r}function FontMetrics(){this.data={}}function FrameContainer(t,e,n){this.image=null,this.src=t;var r=this,i=getBounds(t);this.promise=(e?new Promise(function(e){"about:blank"===t.contentWindow.document.URL||null==t.contentWindow.document.documentElement?t.contentWindow.onload=t.onload=function(){e(t)}:e(t)}):this.proxyLoad(n.proxy,i,n)).then(function(t){return html2canvas(t.contentWindow.document.documentElement,{type:"view",width:t.width,height:t.height,proxy:n.proxy,javascriptEnabled:n.javascriptEnabled,removeContainer:n.removeContainer,allowTaint:n.allowTaint,imageTimeout:n.imageTimeout/2})}).then(function(t){return r.image=t})}function GradientContainer(t){this.src=t.value,this.colorStops=[],this.type=null,this.x0=.5,this.y0=.5,this.x1=.5,this.y1=.5,this.promise=Promise.resolve(!0)}function ImageContainer(t,e){this.src=t,this.image=new Image;var n=this;this.tainted=null,this.promise=new Promise(function(r,i){n.image.onload=r,n.image.onerror=i,e&&(n.image.crossOrigin="anonymous"),n.image.src=t,n.image.complete===!0&&r(n.image)})}function ImageLoader(t,e){this.link=null,this.options=t,this.support=e,this.origin=this.getOrigin(window.location.href)}function LinearGradientContainer(t){GradientContainer.apply(this,arguments),this.type=this.TYPES.LINEAR;var e=null===t.args[0].match(this.stepRegExp);e?t.args[0].split(" ").reverse().forEach(function(t){switch(t){case"left":this.x0=0,this.x1=1;break;case"top":this.y0=0,this.y1=1;break;case"right":this.x0=1,this.x1=0;break;case"bottom":this.y0=1,this.y1=0;break;case"to":var e=this.y0,n=this.x0;this.y0=this.y1,this.x0=this.x1,this.x1=n,this.y1=e}},this):(this.y0=0,this.y1=1),this.colorStops=t.args.slice(e?1:0).map(function(t){var e=t.match(this.stepRegExp);return{color:e[1],stop:"%"===e[3]?e[2]/100:null}},this),null===this.colorStops[0].stop&&(this.colorStops[0].stop=0),null===this.colorStops[this.colorStops.length-1].stop&&(this.colorStops[this.colorStops.length-1].stop=1),this.colorStops.forEach(function(t,e){null===t.stop&&this.colorStops.slice(e).some(function(n,r){return null!==n.stop?(t.stop=(n.stop-this.colorStops[e-1].stop)/(r+1)+this.colorStops[e-1].stop,!0):!1},this)},this)}function log(){window.html2canvas.logging&&window.console&&window.console.log&&Function.prototype.bind.call(window.console.log,window.console).apply(window.console,[Date.now()-window.html2canvas.start+"ms","html2canvas:"].concat([].slice.call(arguments,0)))}function NodeContainer(t,e){this.node=t,this.parent=e,this.stack=null,this.bounds=null,this.borders=null,this.clip=[],this.backgroundClip=[],this.offsetBounds=null,this.visible=null,this.computedStyles=null,this.styles={},this.backgroundImages=null,this.transformData=null,this.transformMatrix=null,this.isPseudoElement=!1,this.opacity=null}function selectionValue(t){var e=t.options[t.selectedIndex||0];return e?e.text||"":""}function parseMatrix(t){return t&&"matrix"===t[1]?t[2].split(",").map(function(t){return parseFloat(t.trim())}):void 0}function isPercentage(t){return-1!==t.toString().indexOf("%")}function parseBackgrounds(t){var e,n,r,i,o,s,a,c=" \r\n	",u=[],l=0,h=0,d=function(){e&&('"'===n.substr(0,1)&&(n=n.substr(1,n.length-2)),n&&a.push(n),"-"===e.substr(0,1)&&(i=e.indexOf("-",1)+1)>0&&(r=e.substr(0,i),e=e.substr(i)),u.push({prefix:r,method:e.toLowerCase(),value:o,args:a,image:null})),a=[],e=r=n=o=""};return a=[],e=r=n=o="",t.split("").forEach(function(t){if(!(0===l&&c.indexOf(t)>-1)){switch(t){case'"':s?s===t&&(s=null):s=t;break;case"(":if(s)break;if(0===l)return l=1,void(o+=t);h++;break;case")":if(s)break;if(1===l){if(0===h)return l=0,o+=t,void d();h--}break;case",":if(s)break;if(0===l)return void d();if(1===l&&0===h&&!e.match(/^url$/i))return a.push(n),n="",void(o+=t)}o+=t,0===l?e+=t:n+=t}}),d(),u}function removePx(t){return t.replace("px","")}function asFloat(t){return parseFloat(t)}function getBounds(t){if(t.getBoundingClientRect){var e=t.getBoundingClientRect(),n=null==t.offsetWidth?e.width:t.offsetWidth;return{top:e.top,bottom:e.bottom||e.top+e.height,right:e.left+n,left:e.left,width:n,height:null==t.offsetHeight?e.height:t.offsetHeight}}return{}}function offsetBounds(t){var e=t.offsetParent?offsetBounds(t.offsetParent):{top:0,left:0};return{top:t.offsetTop+e.top,bottom:t.offsetTop+t.offsetHeight+e.top,right:t.offsetLeft+e.left+t.offsetWidth,left:t.offsetLeft+e.left,width:t.offsetWidth,height:t.offsetHeight}}function NodeParser(t,e,n,r,i){log("Starting NodeParser"),this.renderer=e,this.options=i,this.range=null,this.support=n,this.renderQueue=[],this.stack=new StackingContext(!0,1,t.ownerDocument,null);var o=new NodeContainer(t,null);if(t===t.ownerDocument.documentElement){var s=new NodeContainer(this.renderer.isTransparent(o.css("backgroundColor"))?t.ownerDocument.body:t.ownerDocument.documentElement,null);e.rectangle(0,0,e.width,e.height,s.css("backgroundColor"))}o.visibile=o.isElementVisible(),this.createPseudoHideStyles(t.ownerDocument),this.disableAnimations(t.ownerDocument),this.nodes=flatten([o].concat(this.getChildren(o)).filter(function(t){return t.visible=t.isElementVisible()}).map(this.getPseudoElements,this)),this.fontMetrics=new FontMetrics,log("Fetched nodes, total:",this.nodes.length),log("Calculate overflow clips"),this.calculateOverflowClips(),log("Start fetching images"),this.images=r.fetch(this.nodes.filter(isElement)),this.ready=this.images.ready.then(bind(function(){return log("Images loaded, starting parsing"),log("Creating stacking contexts"),this.createStackingContexts(),log("Sorting stacking contexts"),this.sortStackingContexts(this.stack),this.parse(this.stack),log("Render queue created with "+this.renderQueue.length+" items"),new Promise(bind(function(t){i.async?"function"==typeof i.async?i.async.call(this,this.renderQueue,t):this.renderQueue.length>0?(this.renderIndex=0,this.asyncRenderer(this.renderQueue,t)):t():(this.renderQueue.forEach(this.paint,this),t())},this))},this))}function hasParentClip(t){return t.parent&&t.parent.clip.length}function toCamelCase(t){return t.replace(/(\-[a-z])/g,function(t){return t.toUpperCase().replace("-","")})}function ClearTransform(){}function calculateBorders(t,e,n,r){return t.map(function(i,o){if(i.width>0){var s=e.left,a=e.top,c=e.width,u=e.height-t[2].width;switch(o){case 0:u=t[0].width,i.args=drawSide({c1:[s,a],c2:[s+c,a],c3:[s+c-t[1].width,a+u],c4:[s+t[3].width,a+u]},r[0],r[1],n.topLeftOuter,n.topLeftInner,n.topRightOuter,n.topRightInner);break;case 1:s=e.left+e.width-t[1].width,c=t[1].width,i.args=drawSide({c1:[s+c,a],c2:[s+c,a+u+t[2].width],c3:[s,a+u],c4:[s,a+t[0].width]},r[1],r[2],n.topRightOuter,n.topRightInner,n.bottomRightOuter,n.bottomRightInner);break;case 2:a=a+e.height-t[2].width,u=t[2].width,i.args=drawSide({c1:[s+c,a+u],c2:[s,a+u],c3:[s+t[3].width,a],c4:[s+c-t[3].width,a]},r[2],r[3],n.bottomRightOuter,n.bottomRightInner,n.bottomLeftOuter,n.bottomLeftInner);break;case 3:c=t[3].width,i.args=drawSide({c1:[s,a+u+t[2].width],c2:[s,a],c3:[s+c,a+t[0].width],c4:[s+c,a+u]},r[3],r[0],n.bottomLeftOuter,n.bottomLeftInner,n.topLeftOuter,n.topLeftInner)}}return i})}function getCurvePoints(t,e,n,r){var i=4*((Math.sqrt(2)-1)/3),o=n*i,s=r*i,a=t+n,c=e+r;return{topLeft:bezierCurve({x:t,y:c},{x:t,y:c-s},{x:a-o,y:e},{x:a,y:e}),topRight:bezierCurve({x:t,y:e},{x:t+o,y:e},{x:a,y:c-s},{x:a,y:c}),bottomRight:bezierCurve({x:a,y:e},{x:a,y:e+s},{x:t+o,y:c},{x:t,y:c}),bottomLeft:bezierCurve({x:a,y:c},{x:a-o,y:c},{x:t,y:e+s},{x:t,y:e})}}function calculateCurvePoints(t,e,n){var r=t.left,i=t.top,o=t.width,s=t.height,a=e[0][0],c=e[0][1],u=e[1][0],l=e[1][1],h=e[2][0],d=e[2][1],f=e[3][0],p=e[3][1],m=o-u,g=s-d,w=o-h,y=s-p;return{topLeftOuter:getCurvePoints(r,i,a,c).topLeft.subdivide(.5),topLeftInner:getCurvePoints(r+n[3].width,i+n[0].width,Math.max(0,a-n[3].width),Math.max(0,c-n[0].width)).topLeft.subdivide(.5),topRightOuter:getCurvePoints(r+m,i,u,l).topRight.subdivide(.5),topRightInner:getCurvePoints(r+Math.min(m,o+n[3].width),i+n[0].width,m>o+n[3].width?0:u-n[3].width,l-n[0].width).topRight.subdivide(.5),bottomRightOuter:getCurvePoints(r+w,i+g,h,d).bottomRight.subdivide(.5),bottomRightInner:getCurvePoints(r+Math.min(w,o-n[3].width),i+Math.min(g,s+n[0].width),Math.max(0,h-n[1].width),d-n[2].width).bottomRight.subdivide(.5),bottomLeftOuter:getCurvePoints(r,i+y,f,p).bottomLeft.subdivide(.5),bottomLeftInner:getCurvePoints(r+n[3].width,i+y,Math.max(0,f-n[3].width),p-n[2].width).bottomLeft.subdivide(.5)}}function bezierCurve(t,e,n,r){var i=function(t,e,n){return{x:t.x+(e.x-t.x)*n,y:t.y+(e.y-t.y)*n}};return{start:t,startControl:e,endControl:n,end:r,subdivide:function(o){var s=i(t,e,o),a=i(e,n,o),c=i(n,r,o),u=i(s,a,o),l=i(a,c,o),h=i(u,l,o);return[bezierCurve(t,s,u,h),bezierCurve(h,l,c,r)]},curveTo:function(t){t.push(["bezierCurve",e.x,e.y,n.x,n.y,r.x,r.y])},curveToReversed:function(r){r.push(["bezierCurve",n.x,n.y,e.x,e.y,t.x,t.y])}}}function drawSide(t,e,n,r,i,o,s){var a=[];return e[0]>0||e[1]>0?(a.push(["line",r[1].start.x,r[1].start.y]),r[1].curveTo(a)):a.push(["line",t.c1[0],t.c1[1]]),n[0]>0||n[1]>0?(a.push(["line",o[0].start.x,o[0].start.y]),o[0].curveTo(a),a.push(["line",s[0].end.x,s[0].end.y]),s[0].curveToReversed(a)):(a.push(["line",t.c2[0],t.c2[1]]),a.push(["line",t.c3[0],t.c3[1]])),e[0]>0||e[1]>0?(a.push(["line",i[1].end.x,i[1].end.y]),i[1].curveToReversed(a)):a.push(["line",t.c4[0],t.c4[1]]),a}function parseCorner(t,e,n,r,i,o,s){e[0]>0||e[1]>0?(t.push(["line",r[0].start.x,r[0].start.y]),r[0].curveTo(t),r[1].curveTo(t)):t.push(["line",o,s]),(n[0]>0||n[1]>0)&&t.push(["line",i[0].start.x,i[0].start.y])}function negativeZIndex(t){return t.cssInt("zIndex")<0}function positiveZIndex(t){return t.cssInt("zIndex")>0}function zIndex0(t){return 0===t.cssInt("zIndex")}function inlineLevel(t){return-1!==["inline","inline-block","inline-table"].indexOf(t.css("display"))}function isStackingContext(t){return t instanceof StackingContext}function hasText(t){return t.node.data.trim().length>0}function noLetterSpacing(t){return/^(normal|none|0px)$/.test(t.parent.css("letterSpacing"))}function getBorderRadiusData(t){return["TopLeft","TopRight","BottomRight","BottomLeft"].map(function(e){var n=t.css("border"+e+"Radius"),r=n.split(" ");return r.length<=1&&(r[1]=r[0]),r.map(asInt)})}function renderableNode(t){return t.nodeType===Node.TEXT_NODE||t.nodeType===Node.ELEMENT_NODE}function isPositionedForStacking(t){var e=t.css("position"),n=-1!==["absolute","relative","fixed"].indexOf(e)?t.css("zIndex"):"auto";return"auto"!==n}function isPositioned(t){return"static"!==t.css("position")}function isFloating(t){return"none"!==t.css("float")}function isInlineBlock(t){return-1!==["inline-block","inline-table"].indexOf(t.css("display"))}function not(t){var e=this;return function(){return!t.apply(e,arguments)}}function isElement(t){return t.node.nodeType===Node.ELEMENT_NODE}function isPseudoElement(t){return t.isPseudoElement===!0}function isTextNode(t){return t.node.nodeType===Node.TEXT_NODE}function zIndexSort(t){return function(e,n){return e.cssInt("zIndex")+t.indexOf(e)/t.length-(n.cssInt("zIndex")+t.indexOf(n)/t.length)}}function hasOpacity(t){return t.getOpacity()<1}function bind(t,e){return function(){return t.apply(e,arguments)}}function asInt(t){return parseInt(t,10)}function getWidth(t){return t.width}function nonIgnoredElement(t){return t.node.nodeType!==Node.ELEMENT_NODE||-1===["SCRIPT","HEAD","TITLE","OBJECT","BR","OPTION"].indexOf(t.node.nodeName)}function flatten(t){return[].concat.apply([],t)}function stripQuotes(t){var e=t.substr(0,1);return e===t.substr(t.length-1)&&e.match(/'|"/)?t.substr(1,t.length-2):t}function getWords(t){for(var e,n=[],r=0,i=!1;t.length;)isWordBoundary(t[r])===i?(e=t.splice(0,r),e.length&&n.push(window.html2canvas.punycode.ucs2.encode(e)),i=!i,r=0):r++,r>=t.length&&(e=t.splice(0,r),e.length&&n.push(window.html2canvas.punycode.ucs2.encode(e)));return n}function isWordBoundary(t){return-1!==[32,13,10,9,45].indexOf(t)}function hasUnicode(t){return/[^\u0000-\u00ff]/.test(t)}function Proxy(t,e,n){var r=createCallback(supportsCORS),i=createProxyUrl(e,t,r);return supportsCORS?XHR(i):jsonp(n,i,r).then(function(t){return decode64(t.content)})}function ProxyURL(t,e,n){var r=createCallback(supportsCORSImage),i=createProxyUrl(e,t,r);return supportsCORSImage?Promise.resolve(i):jsonp(n,i,r).then(function(t){return"data:"+t.type+";base64,"+t.content})}function jsonp(t,e,n){return new Promise(function(r,i){var o=t.createElement("script"),s=function(){delete window.html2canvas.proxy[n],t.body.removeChild(o)};window.html2canvas.proxy[n]=function(t){s(),r(t)},o.src=e,o.onerror=function(t){s(),i(t)},t.body.appendChild(o)})}function createCallback(t){return t?"":"html2canvas_"+Date.now()+"_"+ ++proxyCount+"_"+Math.round(1e5*Math.random())}function createProxyUrl(t,e,n){return t+"?url="+encodeURIComponent(e)+(n.length?"&callback=html2canvas.proxy."+n:"")}function ProxyImageContainer(t,e){var n=(document.createElement("script"),document.createElement("a"));n.href=t,t=n.href,this.src=t,this.image=new Image;var r=this;this.promise=new Promise(function(n,i){r.image.crossOrigin="Anonymous",r.image.onload=n,r.image.onerror=i,new ProxyURL(t,e,document).then(function(t){r.image.src=t})["catch"](i)})}function PseudoElementContainer(t,e,n){NodeContainer.call(this,t,e),this.isPseudoElement=!0,this.before=":before"===n}function Renderer(t,e,n,r,i){this.width=t,this.height=e,this.images=n,this.options=r,this.document=i}function StackingContext(t,e,n,r){NodeContainer.call(this,n,r),this.ownStacking=t,this.contexts=[],this.children=[],this.opacity=(this.parent?this.parent.stack.opacity:1)*e}function Support(t){this.rangeBounds=this.testRangeBounds(t),this.cors=this.testCORS(),this.svg=this.testSVG()}function SVGContainer(t){this.src=t,this.image=null;var e=this;this.promise=this.hasFabric().then(function(){return e.isInline(t)?Promise.resolve(e.inlineFormatting(t)):XHR(t)}).then(function(t){return new Promise(function(n){html2canvas.fabric.loadSVGFromString(t,e.createCanvas.call(e,n))})})}function decode64(t){var e,n,r,i,o,s,a,c,u="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",l=t.length,h="";for(e=0;l>e;e+=4)n=u.indexOf(t[e]),r=u.indexOf(t[e+1]),i=u.indexOf(t[e+2]),o=u.indexOf(t[e+3]),s=n<<2|r>>4,a=(15&r)<<4|i>>2,c=(3&i)<<6|o,h+=64===i?String.fromCharCode(s):64===o||-1===o?String.fromCharCode(s,a):String.fromCharCode(s,a,c);return h}function SVGNodeContainer(t,e){this.src=t,this.image=null;var n=this;this.promise=e?new Promise(function(e,r){n.image=new Image,n.image.onload=e,n.image.onerror=r,n.image.src="data:image/svg+xml,"+(new XMLSerializer).serializeToString(t),n.image.complete===!0&&e(n.image)}):this.hasFabric().then(function(){return new Promise(function(e){html2canvas.fabric.parseSVGDocument(t,n.createCanvas.call(n,e))})})}function TextContainer(t,e){NodeContainer.call(this,t,e)}function capitalize(t,e,n){return t.length>0?e+n.toUpperCase():void 0}function WebkitGradientContainer(t){GradientContainer.apply(this,arguments),this.type="linear"===t.args[0]?this.TYPES.LINEAR:this.TYPES.RADIAL}function XHR(t){return new Promise(function(e,n){var r=new XMLHttpRequest;r.open("GET",t),r.onload=function(){200===r.status?e(r.responseText):n(new Error(r.statusText))},r.onerror=function(){n(new Error("Network Error"))},r.send()})}function html2pdf(t,e,n){var r=e.canvas;if(!r)return void alert("jsPDF canvas plugin not installed");if(r.pdf=e,e.annotations={_nameMap:[],createAnnotation:function(t,n){var r,i=e.context2d._wrapX(n.left),o=e.context2d._wrapY(n.top),s=(e.context2d._page(n.top),t.indexOf("#"));r=s>=0?{name:t.substring(s+1)}:{url:t},e.link(i,o,n.right-n.left,n.bottom-n.top,r)},setName:function(t,n){var r=e.context2d._wrapX(n.left),i=e.context2d._wrapY(n.top),o=e.context2d._page(n.top);this._nameMap[t]={page:o,x:r,y:i}}},r.annotations=e.annotations,e.context2d._pageBreakAt=function(t){this.pageBreaks.push(t)},e.context2d._gotoPage=function(t){for(;e.internal.getNumberOfPages()<t;)e.addPage();e.setPage(t)},"string"==typeof t){t=t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");var i=document.createElement("iframe");document.body.appendChild(i);var o;o=i.contentDocument,(void 0==o||null==o)&&(o=i.contentWindow.document),o.open(),o.write(t),o.close();html2canvas(o.body,{canvas:r,onrendered:function(t){n&&(i&&i.parentElement.removeChild(i),n(e))}})}else{var s=t;html2canvas(s,{canvas:r,onrendered:function(t){n&&(i&&i.parentElement.removeChild(i),n(e))}})}}global[""]=exports;var jsPDF=function(t){"use strict";function e(e){var n={};this.subscribe=function(t,e,r){if("function"!=typeof e)return!1;n.hasOwnProperty(t)||(n[t]={});var i=Math.random().toString(35);return n[t][i]=[e,!!r],i},this.unsubscribe=function(t){for(var e in n)if(n[e][t])return delete n[e][t],!0;return!1},this.publish=function(r){if(n.hasOwnProperty(r)){var i=Array.prototype.slice.call(arguments,1),o=[];for(var s in n[r]){var a=n[r][s];try{a[0].apply(e,i)}catch(c){t.console&&console.error("jsPDF PubSub Error",c.message,c)}a[1]&&o.push(s)}o.length&&o.forEach(this.unsubscribe)}}}function n(s,a,c,u){var l={};"object"==typeof s&&(l=s,s=l.orientation,a=l.unit||a,c=l.format||c,u=l.compress||l.compressPdf||u),a=a||"mm",c=c||"a4",s=(""+(s||"P")).toLowerCase();var h,d,f,p,m,g,w,y,v,b=((""+c).toLowerCase(),!!u&&"function"==typeof Uint8Array),x=l.textColor||"0 g",k=l.drawColor||"0 G",C=l.fontSize||16,E=l.lineHeight||1.15,S=l.lineWidth||.200025,T=2,_=!1,q=[],I={},P={},A=0,O=[],R=[],N=[],B=[],D=[],L=0,F=0,M=0,j={title:"",subject:"",author:"",keywords:"",creator:""},z={},U=new e(z),H=function(t){return t.toFixed(2)},W=function(t){return t.toFixed(3)},V=function(t){return("0"+parseInt(t)).slice(-2)},G=function(t){_?O[p].push(t):(M+=t.length+1,B.push(t))},X=function(){return T++,q[T]=M,G(T+" 0 obj"),T},Y=function(){var t=2*O.length+1;t+=D.length;var e={objId:t,content:""};return D.push(e),e},J=function(){return T++,q[T]=function(){return M},T},Q=function(t){q[t]=M},$=function(t){G("stream"),G(t),G("endstream")},Z=function(){var e,r,i,o,s,a,c,u,l;for(c=t.adler32cs||n.adler32cs,b&&"undefined"==typeof c&&(b=!1),e=1;A>=e;e++){if(X(),u=(m=N[e].width)*d,l=(g=N[e].height)*d,G("<</Type /Page"),G("/Parent 1 0 R"),G("/Resources 2 0 R"),G("/MediaBox [0 0 "+H(u)+" "+H(l)+"]"),G("/Contents "+(T+1)+" 0 R"),U.publish("putPage",{pageNumber:e,page:O[e]}),G(">>"),G("endobj"),r=O[e].join("\n"),X(),b){for(i=[],o=r.length;o--;)i[o]=r.charCodeAt(o);a=c.from(r),s=new Deflater(6),s.append(new Uint8Array(i)),r=s.flush(),i=new Uint8Array(r.length+6),i.set(new Uint8Array([120,156])),i.set(r,2),i.set(new Uint8Array([255&a,a>>8&255,a>>16&255,a>>24&255]),r.length+2),r=String.fromCharCode.apply(null,i),G("<</Length "+r.length+" /Filter [/FlateDecode]>>")}else G("<</Length "+r.length+">>");$(r),G("endobj")}q[1]=M,G("1 0 obj"),G("<</Type /Pages");var h="/Kids [";for(o=0;A>o;o++)h+=3+2*o+" 0 R ";G(h+"]"),G("/Count "+A),G(">>"),G("endobj")},K=function(t){t.objectNumber=X(),G("<</BaseFont/"+t.PostScriptName+"/Type/Font"),"string"==typeof t.encoding&&G("/Encoding/"+t.encoding),G("/Subtype/Type1>>"),G("endobj")},tt=function(){for(var t in I)I.hasOwnProperty(t)&&K(I[t])},et=function(){U.publish("putXobjectDict")},nt=function(){G("/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]"),G("/Font <<");for(var t in I)I.hasOwnProperty(t)&&G("/"+t+" "+I[t].objectNumber+" 0 R");G(">>"),G("/XObject <<"),et(),G(">>")},rt=function(){tt(),U.publish("putResources"),q[2]=M,G("2 0 obj"),G("<<"),nt(),G(">>"),G("endobj"),U.publish("postPutResources")},it=function(){U.publish("putAdditionalObjects");for(var t=0;t<D.length;t++){var e=D[t];q[e.objId]=M,G(e.objId+" 0 obj"),G(e.content),G("endobj")}T+=D.length,U.publish("postPutAdditionalObjects")},ot=function(t,e,n){P.hasOwnProperty(e)||(P[e]={}),P[e][n]=t},st=function(t,e,n,r){var i="F"+(Object.keys(I).length+1).toString(10),o=I[i]={id:i,PostScriptName:t,fontName:e,fontStyle:n,encoding:r,metadata:{}};return ot(i,e,n),U.publish("addFont",o),i},at=function(){for(var t="helvetica",e="times",n="courier",r="normal",i="bold",o="italic",s="bolditalic",a="StandardEncoding",c=[["Helvetica",t,r],["Helvetica-Bold",t,i],["Helvetica-Oblique",t,o],["Helvetica-BoldOblique",t,s],["Courier",n,r],["Courier-Bold",n,i],["Courier-Oblique",n,o],["Courier-BoldOblique",n,s],["Times-Roman",e,r],["Times-Bold",e,i],["Times-Italic",e,o],["Times-BoldItalic",e,s]],u=0,l=c.length;l>u;u++){var h=st(c[u][0],c[u][1],c[u][2],a),d=c[u][0].split("-");ot(h,d[0],d[1]||"")}U.publish("addFonts",{fonts:I,dictionary:P})},ct=function(e){return e.foo=function(){try{return e.apply(this,arguments)}catch(n){var r=n.stack||"";~r.indexOf(" at ")&&(r=r.split(" at ")[1]);var i="Error in function "+r.split("\n")[0].split("<")[0]+": "+n.message;if(!t.console)throw new Error(i);t.console.error(i,n),t.alert&&alert(i)}},e.foo.bar=e,e.foo},ut=function(t,e){var n,r,i,o,s,a,c,u,l;if(e=e||{},i=e.sourceEncoding||"Unicode",s=e.outputEncoding,(e.autoencode||s)&&I[h].metadata&&I[h].metadata[i]&&I[h].metadata[i].encoding&&(o=I[h].metadata[i].encoding,!s&&I[h].encoding&&(s=I[h].encoding),!s&&o.codePages&&(s=o.codePages[0]),"string"==typeof s&&(s=o[s]),s)){for(c=!1,a=[],n=0,r=t.length;r>n;n++)u=s[t.charCodeAt(n)],u?a.push(String.fromCharCode(u)):a.push(t[n]),a[n].charCodeAt(0)>>8&&(c=!0);t=a.join("")}for(n=t.length;void 0===c&&0!==n;)t.charCodeAt(n-1)>>8&&(c=!0),n--;if(!c)return t;for(a=e.noBOM?[]:[254,255],n=0,r=t.length;r>n;n++){if(u=t.charCodeAt(n),l=u>>8,l>>8)throw new Error("Character at position "+n+" of string '"+t+"' exceeds 16bits. Cannot be encoded into UCS-2 BE");a.push(l),a.push(u-(l<<8))}return String.fromCharCode.apply(void 0,a)},lt=function(t,e){return ut(t,e).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")},ht=function(){G("/Producer (jsPDF "+n.version+")");for(var t in j)j.hasOwnProperty(t)&&j[t]&&G("/"+t.substr(0,1).toUpperCase()+t.substr(1)+" ("+lt(j[t])+")");var e=new Date,r=e.getTimezoneOffset(),i=0>r?"+":"-",o=Math.floor(Math.abs(r/60)),s=Math.abs(r%60),a=[i,V(o),"'",V(s),"'"].join("");G(["/CreationDate (D:",e.getFullYear(),V(e.getMonth()+1),V(e.getDate()),V(e.getHours()),V(e.getMinutes()),V(e.getSeconds()),a,")"].join(""))},dt=function(){switch(G("/Type /Catalog"),G("/Pages 1 0 R"),y||(y="fullwidth"),y){case"fullwidth":G("/OpenAction [3 0 R /FitH null]");break;case"fullheight":G("/OpenAction [3 0 R /FitV null]");break;case"fullpage":G("/OpenAction [3 0 R /Fit]");break;case"original":G("/OpenAction [3 0 R /XYZ null null 1]");break;default:var t=""+y;"%"===t.substr(t.length-1)&&(y=parseInt(y)/100),"number"==typeof y&&G("/OpenAction [3 0 R /XYZ null null "+H(y)+"]")}switch(v||(v="continuous"),v){case"continuous":G("/PageLayout /OneColumn");break;case"single":G("/PageLayout /SinglePage");break;case"two":case"twoleft":G("/PageLayout /TwoColumnLeft");break;case"tworight":G("/PageLayout /TwoColumnRight")}w&&G("/PageMode /"+w),U.publish("putCatalog")},ft=function(){G("/Size "+(T+1)),G("/Root "+T+" 0 R"),G("/Info "+(T-1)+" 0 R")},pt=function(t,e){var n="string"==typeof e&&e.toLowerCase();if("string"==typeof t){var r=t.toLowerCase();o.hasOwnProperty(r)&&(t=o[r][0]/d,e=o[r][1]/d)}if(Array.isArray(t)&&(e=t[1],t=t[0]),n){switch(n.substr(0,1)){case"l":e>t&&(n="s");break;case"p":t>e&&(n="s")}"s"===n&&(f=t,t=e,e=f)}_=!0,O[++A]=[],N[A]={width:Number(t)||m,height:Number(e)||g},R[A]={},wt(A)},mt=function(){pt.apply(this,arguments),G(H(S*d)+" w"),G(k),0!==L&&G(L+" J"),0!==F&&G(F+" j"),U.publish("addPage",{pageNumber:A})},gt=function(t){t>0&&A>=t&&(O.splice(t,1),N.splice(t,1),A--,p>A&&(p=A),this.setPage(p))},wt=function(t){t>0&&A>=t&&(p=t,m=N[t].width,g=N[t].height)},yt=function(t,e){var n;switch(t=void 0!==t?t:I[h].fontName,e=void 0!==e?e:I[h].fontStyle,void 0!==t&&(t=t.toLowerCase()),t){case"sans-serif":case"verdana":case"arial":t="helvetica";break;case"fixed":case"monospace":case"terminal":t="courier";break;case"serif":case"cursive":case"fantasy":default:t="times"}try{n=P[t][e]}catch(r){}return n||(n=P.times[e],null==n&&(n=P.times.normal)),n},vt=function(){_=!1,T=2,B=[],q=[],D=[],G("%PDF-"+r),Z(),it(),rt(),X(),G("<<"),ht(),G(">>"),G("endobj"),X(),G("<<"),dt(),G(">>"),G("endobj");var t,e=M,n="0000000000";for(G("xref"),G("0 "+(T+1)),G(n+" 65535 f "),t=1;T>=t;t++){var i=q[t];G("function"==typeof i?(n+q[t]()).slice(-10)+" 00000 n ":(n+q[t]).slice(-10)+" 00000 n ")}return G("trailer"),G("<<"),ft(),G(">>"),G("startxref"),G(e),G("%%EOF"),_=!0,B.join("\n")},bt=function(t){var e="S";return"F"===t?e="f":"FD"===t||"DF"===t?e="B":("f"===t||"f*"===t||"B"===t||"B*"===t)&&(e=t),e},xt=function(){for(var t=vt(),e=t.length,n=new ArrayBuffer(e),r=new Uint8Array(n);e--;)r[e]=t.charCodeAt(e);return n},kt=function(){return new Blob([xt()],{type:"application/pdf"})},Ct=ct(function(e,n){var r="dataur"===(""+e).substr(0,6)?"data:application/pdf;base64,"+btoa(vt()):0;switch(e){case void 0:return vt();case"save":if(navigator.getUserMedia&&(void 0===t.URL||void 0===t.URL.createObjectURL))return z.output("dataurlnewwindow");saveAs(kt(),n),"function"==typeof saveAs.unload&&t.setTimeout&&setTimeout(saveAs.unload,911);break;case"arraybuffer":return xt();case"blob":return kt();case"bloburi":case"bloburl":return t.URL&&t.URL.createObjectURL(kt())||void 0;case"datauristring":case"dataurlstring":return r;case"dataurlnewwindow":var i=t.open(r);if(i||"undefined"==typeof safari)return i;case"datauri":case"dataurl":return t.document.location.href=r;default:throw new Error('Output type "'+e+'" is not supported.')}});switch(a){case"pt":d=1;break;case"mm":d=72/25.4000508;break;case"cm":d=72/2.54000508;break;case"in":d=72;break;case"px":d=96/72;break;case"pc":d=12;break;case"em":d=12;break;case"ex":d=6;break;default:throw"Invalid unit: "+a}z.internal={pdfEscape:lt,getStyle:bt,getFont:function(){return I[yt.apply(z,arguments)]},getFontSize:function(){return C},getLineHeight:function(){return C*E},write:function(t){G(1===arguments.length?t:Array.prototype.join.call(arguments," "))},getCoordinateString:function(t){return H(t*d);
},getVerticalCoordinateString:function(t){return H((g-t)*d)},collections:{},newObject:X,newAdditionalObject:Y,newObjectDeferred:J,newObjectDeferredBegin:Q,putStream:$,events:U,scaleFactor:d,pageSize:{get width(){return m},get height(){return g}},output:function(t,e){return Ct(t,e)},getNumberOfPages:function(){return O.length-1},pages:O,out:G,f2:H,getPageInfo:function(t){var e=2*(t-1)+3;return{objId:e,pageNumber:t,pageContext:R[t]}},getCurrentPageInfo:function(){var t=2*(p-1)+3;return{objId:t,pageNumber:p,pageContext:R[p]}}},z.addPage=function(){return mt.apply(this,arguments),this},z.setPage=function(){return wt.apply(this,arguments),this},z.insertPage=function(t){return this.addPage(),this.movePage(p,t),this},z.movePage=function(t,e){if(t>e){for(var n=O[t],r=N[t],i=R[t],o=t;o>e;o--)O[o]=O[o-1],N[o]=N[o-1],R[o]=R[o-1];O[e]=n,N[e]=r,R[e]=i,this.setPage(e)}else if(e>t){for(var n=O[t],r=N[t],i=R[t],o=t;e>o;o++)O[o]=O[o+1],N[o]=N[o+1],R[o]=R[o+1];O[e]=n,N[e]=r,R[e]=i,this.setPage(e)}return this},z.deletePage=function(){return gt.apply(this,arguments),this},z.setDisplayMode=function(t,e,n){return y=t,v=e,w=n,this},z.text=function(t,e,n,r,o,s){function a(t){return t=t.split("	").join(Array(l.TabLen||9).join(" ")),lt(t,r)}"number"==typeof t&&(f=n,n=e,e=t,t=f),"string"==typeof t&&(t=t.match(/[\n\r]/)?t.split(/\r\n|\r|\n/g):[t]),"string"==typeof o&&(s=o,o=null),"string"==typeof r&&(s=r,r=null),"number"==typeof r&&(o=r,r=null);var c,u="",p="Td";if(o){o*=Math.PI/180;var m=Math.cos(o),w=Math.sin(o);u=[H(m),H(w),H(-1*w),H(m),""].join(" "),p="Tm"}r=r||{},"noBOM"in r||(r.noBOM=!0),"autoencode"in r||(r.autoencode=!0);var y="",v=this.internal.getCurrentPageInfo().pageContext;if(!0===r.stroke?v.lastTextWasStroke!==!0&&(y="1 Tr\n",v.lastTextWasStroke=!0):(v.lastTextWasStroke&&(y="0 Tr\n"),v.lastTextWasStroke=!1),"undefined"==typeof this._runningPageHeight&&(this._runningPageHeight=0),"string"==typeof t)t=a(t);else{if(!(t instanceof Array))throw new Error('Type of text must be string or Array. "'+t+'" is not recognized.');for(var b=t.concat(),k=[],S=b.length;S--;)k.push(a(b.shift()));var T=Math.ceil((g-n-this._runningPageHeight)*d/(C*E));if(T>=0&&T<k.length+1,s){var _,q,I,P=C*E,A=t.map(function(t){return this.getStringUnitWidth(t)*C/d},this);if(I=Math.max.apply(Math,A),"center"===s)_=e-I/2,e-=A[0]/2;else{if("right"!==s)throw new Error('Unrecognized alignment option, use "center" or "right".');_=e-I,e-=A[0]}for(q=e,t=k[0]+") Tj\n",i=1,S=k.length;i<S;i++){var O=I-A[i];"center"===s&&(O/=2),t+=_-q+O+" -"+P+" Td ("+k[i],q=_+O,i<S-1&&(t+=") Tj\n")}}else t=k.join(") Tj\nT* (")}var R;return c||(R=H((g-n)*d)),G("BT\n/"+h+" "+C+" Tf\n"+C*E+" TL\n"+y+x+"\n"+u+H(e*d)+" "+R+" "+p+"\n("+t+") Tj\nET"),c&&this.text(c,e,n),this},z.lstext=function(t,e,n,r){for(var i=0,o=t.length;o>i;i++,e+=r)this.text(t[i],e,n)},z.line=function(t,e,n,r){return this.lines([[n-t,r-e]],t,e)},z.clip=function(){G("W"),G("S")},z.lines=function(t,e,n,r,i,o){var s,a,c,u,l,h,p,m,w,y,v;for("number"==typeof t&&(f=n,n=e,e=t,t=f),r=r||[1,1],G(W(e*d)+" "+W((g-n)*d)+" m "),s=r[0],a=r[1],u=t.length,y=e,v=n,c=0;u>c;c++)l=t[c],2===l.length?(y=l[0]*s+y,v=l[1]*a+v,G(W(y*d)+" "+W((g-v)*d)+" l")):(h=l[0]*s+y,p=l[1]*a+v,m=l[2]*s+y,w=l[3]*a+v,y=l[4]*s+y,v=l[5]*a+v,G(W(h*d)+" "+W((g-p)*d)+" "+W(m*d)+" "+W((g-w)*d)+" "+W(y*d)+" "+W((g-v)*d)+" c"));return o&&G(" h"),null!==i&&G(bt(i)),this},z.rect=function(t,e,n,r,i){bt(i);return G([H(t*d),H((g-e)*d),H(n*d),H(-r*d),"re"].join(" ")),null!==i&&G(bt(i)),this},z.triangle=function(t,e,n,r,i,o,s){return this.lines([[n-t,r-e],[i-n,o-r],[t-i,e-o]],t,e,[1,1],s,!0),this},z.roundedRect=function(t,e,n,r,i,o,s){var a=4/3*(Math.SQRT2-1);return this.lines([[n-2*i,0],[i*a,0,i,o-o*a,i,o],[0,r-2*o],[0,o*a,-(i*a),o,-i,o],[-n+2*i,0],[-(i*a),0,-i,-(o*a),-i,-o],[0,-r+2*o],[0,-(o*a),i*a,-o,i,-o]],t+i,e,[1,1],s),this},z.ellipse=function(t,e,n,r,i){var o=4/3*(Math.SQRT2-1)*n,s=4/3*(Math.SQRT2-1)*r;return G([H((t+n)*d),H((g-e)*d),"m",H((t+n)*d),H((g-(e-s))*d),H((t+o)*d),H((g-(e-r))*d),H(t*d),H((g-(e-r))*d),"c"].join(" ")),G([H((t-o)*d),H((g-(e-r))*d),H((t-n)*d),H((g-(e-s))*d),H((t-n)*d),H((g-e)*d),"c"].join(" ")),G([H((t-n)*d),H((g-(e+s))*d),H((t-o)*d),H((g-(e+r))*d),H(t*d),H((g-(e+r))*d),"c"].join(" ")),G([H((t+o)*d),H((g-(e+r))*d),H((t+n)*d),H((g-(e+s))*d),H((t+n)*d),H((g-e)*d),"c"].join(" ")),null!==i&&G(bt(i)),this},z.circle=function(t,e,n,r){return this.ellipse(t,e,n,n,r)},z.setProperties=function(t){for(var e in j)j.hasOwnProperty(e)&&t[e]&&(j[e]=t[e]);return this},z.setFontSize=function(t){return C=t,this},z.setFont=function(t,e){return h=yt(t,e),this},z.setFontStyle=z.setFontType=function(t){return h=yt(void 0,t),this},z.getFontList=function(){var t,e,n,r={};for(t in P)if(P.hasOwnProperty(t)){r[t]=n=[];for(e in P[t])P[t].hasOwnProperty(e)&&n.push(e)}return r},z.addFont=function(t,e,n){st(t,e,n,"StandardEncoding")},z.setLineWidth=function(t){return G((t*d).toFixed(2)+" w"),this},z.setDrawColor=function(t,e,n,r){var i;return i=void 0===e||void 0===r&&t===e===n?"string"==typeof t?t+" G":H(t/255)+" G":void 0===r?"string"==typeof t?[t,e,n,"RG"].join(" "):[H(t/255),H(e/255),H(n/255),"RG"].join(" "):"string"==typeof t?[t,e,n,r,"K"].join(" "):[H(t),H(e),H(n),H(r),"K"].join(" "),G(i),this},z.setFillColor=function(t,e,n,r){var i;return void 0===e||void 0===r&&t===e===n?i="string"==typeof t?t+" g":H(t/255)+" g":void 0===r||"object"==typeof r?(i="string"==typeof t?[t,e,n,"rg"].join(" "):[H(t/255),H(e/255),H(n/255),"rg"].join(" "),r&&0===r.a&&(i=["255","255","255","rg"].join(" "))):i="string"==typeof t?[t,e,n,r,"k"].join(" "):[H(t),H(e),H(n),H(r),"k"].join(" "),G(i),this},z.setTextColor=function(t,e,n){if("string"==typeof t&&/^#[0-9A-Fa-f]{6}$/.test(t)){var r=parseInt(t.substr(1),16);t=r>>16&255,e=r>>8&255,n=255&r}return x=0===t&&0===e&&0===n||"undefined"==typeof e?W(t/255)+" g":[W(t/255),W(e/255),W(n/255),"rg"].join(" "),this},z.CapJoinStyles={0:0,butt:0,but:0,miter:0,1:1,round:1,rounded:1,circle:1,2:2,projecting:2,project:2,square:2,bevel:2},z.setLineCap=function(t){var e=this.CapJoinStyles[t];if(void 0===e)throw new Error("Line cap style of '"+t+"' is not recognized. See or extend .CapJoinStyles property for valid styles");return L=e,G(e+" J"),this},z.setLineJoin=function(t){var e=this.CapJoinStyles[t];if(void 0===e)throw new Error("Line join style of '"+t+"' is not recognized. See or extend .CapJoinStyles property for valid styles");return F=e,G(e+" j"),this},z.output=Ct,z.save=function(t){z.output("save",t)};for(var Et in n.API)n.API.hasOwnProperty(Et)&&("events"===Et&&n.API.events.length?!function(t,e){var n,r,i;for(i=e.length-1;-1!==i;i--)n=e[i][0],r=e[i][1],t.subscribe.apply(t,[n].concat("function"==typeof r?[r]:r))}(U,n.API.events):z[Et]=n.API[Et]);return at(),h="F1",mt(c,s),U.publish("initialized"),z}var r="1.3",o={a0:[2383.94,3370.39],a1:[1683.78,2383.94],a2:[1190.55,1683.78],a3:[841.89,1190.55],a4:[595.28,841.89],a5:[419.53,595.28],a6:[297.64,419.53],a7:[209.76,297.64],a8:[147.4,209.76],a9:[104.88,147.4],a10:[73.7,104.88],b0:[2834.65,4008.19],b1:[2004.09,2834.65],b2:[1417.32,2004.09],b3:[1000.63,1417.32],b4:[708.66,1000.63],b5:[498.9,708.66],b6:[354.33,498.9],b7:[249.45,354.33],b8:[175.75,249.45],b9:[124.72,175.75],b10:[87.87,124.72],c0:[2599.37,3676.54],c1:[1836.85,2599.37],c2:[1298.27,1836.85],c3:[918.43,1298.27],c4:[649.13,918.43],c5:[459.21,649.13],c6:[323.15,459.21],c7:[229.61,323.15],c8:[161.57,229.61],c9:[113.39,161.57],c10:[79.37,113.39],dl:[311.81,623.62],letter:[612,792],"government-letter":[576,756],legal:[612,1008],"junior-legal":[576,360],ledger:[1224,792],tabloid:[792,1224],"credit-card":[153,243]};return n.API={events:[]},n.version="1.1.239-git 2015-08-26T20:20:danielzamorano","function"==typeof define&&define.amd?define("jsPDF",function(){return n}):"undefined"!=typeof module&&module.exports?module.exports=n:t.jsPDF=n,n}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this);!function(t){"use strict";t.addHTML=function(t,e,n,r,i){if("undefined"==typeof html2canvas&&"undefined"==typeof rasterizeHTML)throw new Error("You need either https://github.com/niklasvh/html2canvas or https://github.com/cburgmer/rasterizeHTML.js");"number"!=typeof e&&(r=e,i=n),"function"==typeof r&&(i=r,r=null);var o=this.internal,s=o.scaleFactor,a=o.pageSize.width,c=o.pageSize.height;if(r=r||{},r.onrendered=function(t){e=parseInt(e)||0,n=parseInt(n)||0;var o=r.dim||{},u=o.h||0,l=o.w||Math.min(a,t.width/s)-e,h="JPEG";if(r.format&&(h=r.format),t.height>c&&r.pagesplit){var d=function(){for(var r=0;;){var o=document.createElement("canvas");o.width=Math.min(a*s,t.width),o.height=Math.min(c*s,t.height-r);var u=o.getContext("2d");u.drawImage(t,0,r,t.width,o.height,0,0,o.width,o.height);var d=[o,e,r?0:n,o.width/s,o.height/s,h,null,"SLOW"];if(this.addImage.apply(this,d),r+=o.height,r>=t.height)break;this.addPage()}i(l,r,null,d)}.bind(this);if("CANVAS"===t.nodeName){var f=new Image;f.onload=d,f.src=t.toDataURL("image/png"),t=f}else d()}else{var p=Math.random().toString(35),m=[t,e,n,l,u,h,p,"SLOW"];this.addImage.apply(this,m),i(l,u,p,m)}}.bind(this),"undefined"!=typeof html2canvas&&!r.rstz)return html2canvas(t,r);if("undefined"!=typeof rasterizeHTML){var u="drawDocument";return"string"==typeof t&&(u=/^http/.test(t)?"drawURL":"drawHTML"),r.width=r.width||a*s,rasterizeHTML[u](t,void 0,r).then(function(t){r.onrendered(t.image)},function(t){i(null,t)})}return null}}(jsPDF.API),function(t){"use strict";var e="addImage_",n=["jpeg","jpg","png"],r=function(t){var e=this.internal.newObject(),n=this.internal.write,i=this.internal.putStream;if(t.n=e,n("<</Type /XObject"),n("/Subtype /Image"),n("/Width "+t.w),n("/Height "+t.h),t.cs===this.color_spaces.INDEXED?n("/ColorSpace [/Indexed /DeviceRGB "+(t.pal.length/3-1)+" "+("smask"in t?e+2:e+1)+" 0 R]"):(n("/ColorSpace /"+t.cs),t.cs===this.color_spaces.DEVICE_CMYK&&n("/Decode [1 0 1 0 1 0 1 0]")),n("/BitsPerComponent "+t.bpc),"f"in t&&n("/Filter /"+t.f),"dp"in t&&n("/DecodeParms <<"+t.dp+">>"),"trns"in t&&t.trns.constructor==Array){for(var o="",s=0,a=t.trns.length;a>s;s++)o+=t.trns[s]+" "+t.trns[s]+" ";n("/Mask ["+o+"]")}if("smask"in t&&n("/SMask "+(e+1)+" 0 R"),n("/Length "+t.data.length+">>"),i(t.data),n("endobj"),"smask"in t){var c="/Predictor 15 /Colors 1 /BitsPerComponent "+t.bpc+" /Columns "+t.w,u={w:t.w,h:t.h,cs:"DeviceGray",bpc:t.bpc,dp:c,data:t.smask};"f"in t&&(u.f=t.f),r.call(this,u)}t.cs===this.color_spaces.INDEXED&&(this.internal.newObject(),n("<< /Length "+t.pal.length+">>"),i(this.arrayBufferToBinaryString(new Uint8Array(t.pal))),n("endobj"))},i=function(){var t=this.internal.collections[e+"images"];for(var n in t)r.call(this,t[n])},o=function(){var t,n=this.internal.collections[e+"images"],r=this.internal.write;for(var i in n)t=n[i],r("/I"+t.i,t.n,"0","R")},s=function(e){return e&&"string"==typeof e&&(e=e.toUpperCase()),e in t.image_compression?e:t.image_compression.NONE},a=function(){var t=this.internal.collections[e+"images"];return t||(this.internal.collections[e+"images"]=t={},this.internal.events.subscribe("putResources",i),this.internal.events.subscribe("putXobjectDict",o)),t},c=function(t){var e=0;return t&&(e=Object.keys?Object.keys(t).length:function(t){var e=0;for(var n in t)t.hasOwnProperty(n)&&e++;return e}(t)),e},u=function(t){return"undefined"==typeof t||null===t},l=function(e){return"string"==typeof e&&t.sHashCode(e)},h=function(t){return-1===n.indexOf(t)},d=function(e){return"function"!=typeof t["process"+e.toUpperCase()]},f=function(t){return"object"==typeof t&&1===t.nodeType},p=function(t,e,n){if("IMG"===t.nodeName&&t.hasAttribute("src")){var r=""+t.getAttribute("src");if(!n&&0===r.indexOf("data:image/"))return r;!e&&/\.png(?:[?#].*)?$/i.test(r)&&(e="png")}if("CANVAS"===t.nodeName)var i=t;else{var i=document.createElement("canvas");i.width=t.clientWidth||t.width,i.height=t.clientHeight||t.height;var o=i.getContext("2d");if(!o)throw"addImage requires canvas to be supported by browser.";if(n){var s,a,c,u,l,h,d,f,p=Math.PI/180;"object"==typeof n&&(s=n.x,a=n.y,c=n.bg,n=n.angle),f=n*p,u=Math.abs(Math.cos(f)),l=Math.abs(Math.sin(f)),h=i.width,d=i.height,i.width=d*l+h*u,i.height=d*u+h*l,isNaN(s)&&(s=i.width/2),isNaN(a)&&(a=i.height/2),o.clearRect(0,0,i.width,i.height),o.fillStyle=c||"white",o.fillRect(0,0,i.width,i.height),o.save(),o.translate(s,a),o.rotate(f),o.drawImage(t,-(h/2),-(d/2)),o.rotate(-f),o.translate(-s,-a),o.restore()}else o.drawImage(t,0,0,i.width,i.height)}return i.toDataURL("png"==(""+e).toLowerCase()?"image/png":"image/jpeg")},m=function(t,e){var n;if(e)for(var r in e)if(t===e[r].alias){n=e[r];break}return n},g=function(t,e,n){return t||e||(t=-96,e=-96),0>t&&(t=-1*n.w*72/t/this.internal.scaleFactor),0>e&&(e=-1*n.h*72/e/this.internal.scaleFactor),0===t&&(t=e*n.w/n.h),0===e&&(e=t*n.h/n.w),[t,e]},w=function(t,e,n,r,i,o,s){var a=g.call(this,n,r,i),c=this.internal.getCoordinateString,u=this.internal.getVerticalCoordinateString;n=a[0],r=a[1],s[o]=i,this.internal.write("q",c(n),"0 0",c(r),c(t),u(e+r),"cm /I"+i.i,"Do Q")};t.color_spaces={DEVICE_RGB:"DeviceRGB",DEVICE_GRAY:"DeviceGray",DEVICE_CMYK:"DeviceCMYK",CAL_GREY:"CalGray",CAL_RGB:"CalRGB",LAB:"Lab",ICC_BASED:"ICCBased",INDEXED:"Indexed",PATTERN:"Pattern",SEPERATION:"Seperation",DEVICE_N:"DeviceN"},t.decode={DCT_DECODE:"DCTDecode",FLATE_DECODE:"FlateDecode",LZW_DECODE:"LZWDecode",JPX_DECODE:"JPXDecode",JBIG2_DECODE:"JBIG2Decode",ASCII85_DECODE:"ASCII85Decode",ASCII_HEX_DECODE:"ASCIIHexDecode",RUN_LENGTH_DECODE:"RunLengthDecode",CCITT_FAX_DECODE:"CCITTFaxDecode"},t.image_compression={NONE:"NONE",FAST:"FAST",MEDIUM:"MEDIUM",SLOW:"SLOW"},t.sHashCode=function(t){return Array.prototype.reduce&&t.split("").reduce(function(t,e){return t=(t<<5)-t+e.charCodeAt(0),t&t},0)},t.isString=function(t){return"string"==typeof t},t.extractInfoFromBase64DataURI=function(t){return/^data:([\w]+?\/([\w]+?));base64,(.+?)$/g.exec(t)},t.supportsArrayBuffer=function(){return"undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array},t.isArrayBuffer=function(t){return this.supportsArrayBuffer()?t instanceof ArrayBuffer:!1},t.isArrayBufferView=function(t){return this.supportsArrayBuffer()?"undefined"==typeof Uint32Array?!1:t instanceof Int8Array||t instanceof Uint8Array||"undefined"!=typeof Uint8ClampedArray&&t instanceof Uint8ClampedArray||t instanceof Int16Array||t instanceof Uint16Array||t instanceof Int32Array||t instanceof Uint32Array||t instanceof Float32Array||t instanceof Float64Array:!1},t.binaryStringToUint8Array=function(t){for(var e=t.length,n=new Uint8Array(e),r=0;e>r;r++)n[r]=t.charCodeAt(r);return n},t.arrayBufferToBinaryString=function(t){this.isArrayBuffer(t)&&(t=new Uint8Array(t));for(var e="",n=t.byteLength,r=0;n>r;r++)e+=String.fromCharCode(t[r]);return e},t.arrayBufferToBase64=function(t){for(var e,n,r,i,o,s="",a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",c=new Uint8Array(t),u=c.byteLength,l=u%3,h=u-l,d=0;h>d;d+=3)o=c[d]<<16|c[d+1]<<8|c[d+2],e=(16515072&o)>>18,n=(258048&o)>>12,r=(4032&o)>>6,i=63&o,s+=a[e]+a[n]+a[r]+a[i];return 1==l?(o=c[h],e=(252&o)>>2,n=(3&o)<<4,s+=a[e]+a[n]+"=="):2==l&&(o=c[h]<<8|c[h+1],e=(64512&o)>>10,n=(1008&o)>>4,r=(15&o)<<2,s+=a[e]+a[n]+a[r]+"="),s},t.createImageInfo=function(t,e,n,r,i,o,s,a,c,u,l,h){var d={alias:a,w:e,h:n,cs:r,bpc:i,i:s,data:t};return o&&(d.f=o),c&&(d.dp=c),u&&(d.trns=u),l&&(d.pal=l),h&&(d.smask=h),d},t.addImage=function(t,e,r,i,o,g,y,v,b){if("string"!=typeof e){var x=g;g=o,o=i,i=r,r=e,e=x}if("object"==typeof t&&!f(t)&&"imageData"in t){var k=t;t=k.imageData,e=k.format||e,r=k.x||r||0,i=k.y||i||0,o=k.w||o,g=k.h||g,y=k.alias||y,v=k.compression||v,b=k.rotation||k.angle||b}if(isNaN(r)||isNaN(i))throw console.error("jsPDF.addImage: Invalid coordinates",arguments),new Error("Invalid coordinates passed to jsPDF.addImage");var C,E=a.call(this);if(!(C=m(t,E))){var S;if(f(t)&&(t=p(t,e,b)),u(y)&&(y=l(t)),!(C=m(y,E))){if(this.isString(t)){var T=this.extractInfoFromBase64DataURI(t);T?(e=T[2],t=atob(T[3])):137===t.charCodeAt(0)&&80===t.charCodeAt(1)&&78===t.charCodeAt(2)&&71===t.charCodeAt(3)&&(e="png")}if(e=(e||"JPEG").toLowerCase(),h(e))throw new Error("addImage currently only supports formats "+n+", not '"+e+"'");if(d(e))throw new Error("please ensure that the plugin for '"+e+"' support is added");if(this.supportsArrayBuffer()&&(S=t,t=this.binaryStringToUint8Array(t)),C=this["process"+e.toUpperCase()](t,c(E),y,s(v),S),!C)throw new Error("An unkwown error occurred whilst processing the image")}}return w.call(this,r,i,o,g,C,C.i,E),this};var y=function(t){var e,n,r;if(255===!t.charCodeAt(0)||216===!t.charCodeAt(1)||255===!t.charCodeAt(2)||224===!t.charCodeAt(3)||!t.charCodeAt(6)==="J".charCodeAt(0)||!t.charCodeAt(7)==="F".charCodeAt(0)||!t.charCodeAt(8)==="I".charCodeAt(0)||!t.charCodeAt(9)==="F".charCodeAt(0)||0===!t.charCodeAt(10))throw new Error("getJpegSize requires a binary string jpeg file");for(var i=256*t.charCodeAt(4)+t.charCodeAt(5),o=4,s=t.length;s>o;){if(o+=i,255!==t.charCodeAt(o))throw new Error("getJpegSize could not find the size of the image");if(192===t.charCodeAt(o+1)||193===t.charCodeAt(o+1)||194===t.charCodeAt(o+1)||195===t.charCodeAt(o+1)||196===t.charCodeAt(o+1)||197===t.charCodeAt(o+1)||198===t.charCodeAt(o+1)||199===t.charCodeAt(o+1))return n=256*t.charCodeAt(o+5)+t.charCodeAt(o+6),e=256*t.charCodeAt(o+7)+t.charCodeAt(o+8),r=t.charCodeAt(o+9),[e,n,r];o+=2,i=256*t.charCodeAt(o)+t.charCodeAt(o+1)}},v=function(t){var e=t[0]<<8|t[1];if(65496!==e)throw new Error("Supplied data is not a JPEG");for(var n,r,i,o,s=t.length,a=(t[4]<<8)+t[5],c=4;s>c;){if(c+=a,n=b(t,c),a=(n[2]<<8)+n[3],(192===n[1]||194===n[1])&&255===n[0]&&a>7)return n=b(t,c+5),r=(n[2]<<8)+n[3],i=(n[0]<<8)+n[1],o=n[4],{width:r,height:i,numcomponents:o};c+=2}throw new Error("getJpegSizeFromBytes could not find the size of the image")},b=function(t,e){return t.subarray(e,e+5)};t.processJPEG=function(t,e,n,r,i){var o,s=this.color_spaces.DEVICE_RGB,a=this.decode.DCT_DECODE,c=8;return this.isString(t)?(o=y(t),this.createImageInfo(t,o[0],o[1],1==o[3]?this.color_spaces.DEVICE_GRAY:s,c,a,e,n)):(this.isArrayBuffer(t)&&(t=new Uint8Array(t)),this.isArrayBufferView(t)?(o=v(t),t=i||this.arrayBufferToBinaryString(t),this.createImageInfo(t,o.width,o.height,1==o.numcomponents?this.color_spaces.DEVICE_GRAY:s,c,a,e,n)):null)},t.processJPG=function(){return this.processJPEG.apply(this,arguments)}}(jsPDF.API),function(t){"use strict";var e={annotations:[],f2:function(t){return t.toFixed(2)},notEmpty:function(t){return"undefined"!=typeof t&&""!=t?!0:void 0}};return jsPDF.API.annotationPlugin=e,jsPDF.API.events.push(["addPage",function(t){this.annotationPlugin.annotations[t.pageNumber]=[]}]),t.events.push(["putPage",function(t){for(var n=this.annotationPlugin.annotations[t.pageNumber],r=!1,i=0;i<n.length&&!r;i++){var o=n[i];switch(o.type){case"link":if(e.notEmpty(o.options.url)||e.notEmpty(o.options.pageNumber)){r=!0;break}case"text":case"freetext":r=!0}}if(0!=r){this.internal.write("/Annots [");for(var s=this.annotationPlugin.f2,a=this.internal.scaleFactor,c=this.internal.pageSize.height,u=this.internal.getPageInfo(t.pageNumber),i=0;i<n.length;i++){var o=n[i];switch(o.type){case"text":var l=this.internal.newAdditionalObject(),h=this.internal.newAdditionalObject(),d=o.title||"Note",f="/Rect ["+s(o.bounds.x*a)+" "+s(c-(o.bounds.y+o.bounds.h)*a)+" "+s((o.bounds.x+o.bounds.w)*a)+" "+s((c-o.bounds.y)*a)+"] ";y="<</Type /Annot /Subtype /Text "+f+"/Contents ("+o.contents+")",y+=" /Popup "+h.objId+" 0 R",y+=" /P "+u.objId+" 0 R",y+=" /T ("+d+") >>",l.content=y;var p=l.objId+" 0 R",m=30,f="/Rect ["+s((o.bounds.x+m)*a)+" "+s(c-(o.bounds.y+o.bounds.h)*a)+" "+s((o.bounds.x+o.bounds.w+m)*a)+" "+s((c-o.bounds.y)*a)+"] ";y="<</Type /Annot /Subtype /Popup "+f+" /Parent "+p,o.open&&(y+=" /Open true"),y+=" >>",h.content=y,this.internal.write(l.objId,"0 R",h.objId,"0 R");break;case"freetext":var f="/Rect ["+s(o.bounds.x*a)+" "+s((c-o.bounds.y)*a)+" "+s(o.bounds.x+o.bounds.w*a)+" "+s(c-(o.bounds.y+o.bounds.h)*a)+"] ",g=o.color||"#000000";y="<</Type /Annot /Subtype /FreeText "+f+"/Contents ("+o.contents+")",y+=" /DS(font: Helvetica,sans-serif 12.0pt; text-align:left; color:#"+g+")",y+=" /Border [0 0 0]",y+=" >>",this.internal.write(y);break;case"link":if(o.options.name){var w=this.annotations._nameMap[o.options.name];o.options.pageNumber=w.page,o.options.top=w.y}else o.options.top||(o.options.top=0);var f="/Rect ["+s(o.x*a)+" "+s((c-o.y)*a)+" "+s(o.x+o.w*a)+" "+s(c-(o.y+o.h)*a)+"] ",y="";if(o.options.url)y="<</Type /Annot /Subtype /Link "+f+"/Border [0 0 0] /A <</S /URI /URI ("+o.options.url+") >>";else if(o.options.pageNumber){var t=this.internal.getPageInfo(o.options.pageNumber);switch(y="<</Type /Annot /Subtype /Link "+f+"/Border [0 0 0] /Dest ["+t.objId+" 0 R",o.options.magFactor=o.options.magFactor||"XYZ",o.options.magFactor){case"Fit":y+=" /Fit]";break;case"FitH":y+=" /FitH "+o.options.top+"]";break;case"FitV":o.options.left=o.options.left||0,y+=" /FitV "+o.options.left+"]";break;case"XYZ":default:var v=s((c-o.options.top)*a);o.options.left=o.options.left||0,"undefined"==typeof o.options.zoom&&(o.options.zoom=0),y+=" /XYZ "+o.options.left+" "+v+" "+o.options.zoom+"]"}}""!=y&&(y+=" >>",this.internal.write(y))}}this.internal.write("]")}}]),t.createAnnotation=function(t){switch(t.type){case"link":this.link(t.bounds.x,t.bounds.y,t.bounds.w,t.bounds.h,t);break;case"text":case"freetext":this.annotationPlugin.annotations[this.internal.getCurrentPageInfo().pageNumber].push(t)}},t.link=function(t,e,n,r,i){this.annotationPlugin.annotations[this.internal.getCurrentPageInfo().pageNumber].push({x:t,y:e,w:n,h:r,options:i,type:"link"})},t.link=function(t,e,n,r,i){this.annotationPlugin.annotations[this.internal.getCurrentPageInfo().pageNumber].push({x:t,y:e,w:n,h:r,options:i,type:"link"})},t.textWithLink=function(t,e,n,r){var i=this.getTextWidth(t),o=this.internal.getLineHeight();return this.text(t,e,n),n+=.2*o,this.link(e,n-o,i,o,r),i},t.getTextWidth=function(t){var e=this.internal.getFontSize(),n=this.getStringUnitWidth(t)*e/this.internal.scaleFactor;return n},t.getLineHeight=function(){return this.internal.getLineHeight()},this}(jsPDF.API),function(t){"use strict";t.autoPrint=function(){var t;return this.internal.events.subscribe("postPutResources",function(){t=this.internal.newObject(),this.internal.write("<< /S/Named /Type/Action /N/Print >>","endobj")}),this.internal.events.subscribe("putCatalog",function(){this.internal.write("/OpenAction "+t+" 0 R")}),this}}(jsPDF.API),function(t){"use strict";return t.events.push(["initialized",function(){this.canvas.pdf=this}]),t.canvas={getContext:function(t){return this.pdf.context2d},style:{}},Object.defineProperty(t.canvas,"width",{get:function(){return this._width},set:function(t){this._width=t,this.getContext("2d").pageWrapX=t+1}}),Object.defineProperty(t.canvas,"height",{get:function(){return this._height},set:function(t){this._height=t,this.getContext("2d").pageWrapY=t+1}}),this}(jsPDF.API),function(t){"use strict";var e,n,r,i,o=3,s=13,a={x:void 0,y:void 0,w:void 0,h:void 0,ln:void 0},c=1,u=function(t,e,n,r,i){a={x:t,y:e,w:n,h:r,ln:i}},l=function(){return a},h={left:0,top:0,bottom:0};t.setHeaderFunction=function(t){i=t},t.getTextDimensions=function(t){e=this.internal.getFont().fontName,n=this.table_font_size||this.internal.getFontSize(),r=this.internal.getFont().fontStyle;var i,o,s=19.049976/25.4;o=document.createElement("font"),o.id="jsPDFCell";try{o.style.fontStyle=r}catch(a){o.style.fontWeight=r}o.style.fontName=e,o.style.fontSize=n+"pt";try{o.textContent=t}catch(a){o.innerText=t}return document.body.appendChild(o),i={w:(o.offsetWidth+1)*s,h:(o.offsetHeight+1)*s},document.body.removeChild(o),i},t.cellAddPage=function(){var t=this.margins||h;this.addPage(),u(t.left,t.top,void 0,void 0),c+=1},t.cellInitialize=function(){a={x:void 0,y:void 0,w:void 0,h:void 0,ln:void 0},c=1},t.cell=function(t,e,n,r,i,a,c){var d=l();if(void 0!==d.ln)if(d.ln===a)t=d.x+d.w,e=d.y;else{var f=this.margins||h;d.y+d.h+r+s>=this.internal.pageSize.height-f.bottom&&(this.cellAddPage(),this.printHeaders&&this.tableHeaderRow&&this.printHeaderRow(a,!0)),e=l().y+l().h}if(void 0!==i[0])if(this.printingHeaderRow?this.rect(t,e,n,r,"FD"):this.rect(t,e,n,r),"right"===c){i instanceof Array||(i=[i]);for(var p=0;p<i.length;p++){var m=i[p],g=this.getStringUnitWidth(m)*this.internal.getFontSize();this.text(m,t+n-g-o,e+this.internal.getLineHeight()*(p+1))}}else this.text(i,t+o,e+this.internal.getLineHeight());return u(t,e,n,r,a),this},t.arrayMax=function(t,e){var n,r,i,o=t[0];for(n=0,r=t.length;r>n;n+=1)i=t[n],e?-1===e(o,i)&&(o=i):i>o&&(o=i);return o},t.table=function(e,n,r,i,o){if(!r)throw"No data for PDF table";var s,u,l,d,f,p,m,g,w,y,v=[],b=[],x={},k={},C=[],E=[],S=!1,T=!0,_=12,q=h;if(q.width=this.internal.pageSize.width,o&&(o.autoSize===!0&&(S=!0),o.printHeaders===!1&&(T=!1),o.fontSize&&(_=o.fontSize),o.margins&&(q=o.margins)),this.lnMod=0,a={x:void 0,y:void 0,w:void 0,h:void 0,ln:void 0},c=1,this.printHeaders=T,this.margins=q,this.setFontSize(_),this.table_font_size=_,void 0===i||null===i)v=Object.keys(r[0]);else if(i[0]&&"string"!=typeof i[0]){var I=19.049976/25.4;for(u=0,l=i.length;l>u;u+=1)s=i[u],v.push(s.name),b.push(s.prompt),k[s.name]=s.width*I}else v=i;if(S)for(y=function(t){return t[s]},u=0,l=v.length;l>u;u+=1){for(s=v[u],x[s]=r.map(y),C.push(this.getTextDimensions(b[u]||s).w),p=x[s],m=0,d=p.length;d>m;m+=1)f=p[m],C.push(this.getTextDimensions(f).w);k[s]=t.arrayMax(C),C=[]}if(T){var P=this.calculateLineHeight(v,k,b.length?b:v);for(u=0,l=v.length;l>u;u+=1)s=v[u],E.push([e,n,k[s],P,String(b.length?b[u]:s)]);this.setTableHeaderRow(E),this.printHeaderRow(1,!1)}for(u=0,l=r.length;l>u;u+=1){var P;for(g=r[u],P=this.calculateLineHeight(v,k,g),m=0,w=v.length;w>m;m+=1)s=v[m],this.cell(e,n,k[s],P,g[s],u+2,s.align)}return this.lastCellPos=a,this.table_x=e,this.table_y=n,this},t.calculateLineHeight=function(t,e,n){for(var r,i=0,s=0;s<t.length;s++){r=t[s],n[r]=this.splitTextToSize(String(n[r]),e[r]-o);var a=this.internal.getLineHeight()*n[r].length+o;a>i&&(i=a)}return i},t.setTableHeaderRow=function(t){this.tableHeaderRow=t},t.printHeaderRow=function(t,e){if(!this.tableHeaderRow)throw"Property tableHeaderRow does not exist.";var n,r,o,s;if(this.printingHeaderRow=!0,void 0!==i){var a=i(this,c);u(a[0],a[1],a[2],a[3],-1)}this.setFontStyle("bold");var l=[];for(o=0,s=this.tableHeaderRow.length;s>o;o+=1)this.setFillColor(200,200,200),n=this.tableHeaderRow[o],e&&(n[1]=this.margins&&this.margins.top||0,l.push(n)),r=[].concat(n),this.cell.apply(this,r.concat(t));l.length>0&&this.setTableHeaderRow(l),this.setFontStyle("normal"),this.printingHeaderRow=!1}}(jsPDF.API),function(t){"use strict";function e(){this.fillStyle="#000000",this.strokeStyle="#000000",this.font="12pt times",this.textBaseline="alphabetic",this.lineWidth=1,this.lineJoin="miter",this.lineCap="butt",this._translate={x:0,y:0},this.copy=function(t){this.fillStyle=t.fillStyle,this.strokeStyle=t.strokeStyle,this.font=t.font,this.lineWidth=t.lineWidth,this.lineJoin=t.lineJoin,this.lineCap=t.lineCap,this.textBaseline=t.textBaseline,this._fontSize=t._fontSize,this._translate={x:t._translate.x,y:t._translate.y}}}t.events.push(["initialized",function(){this.context2d.pdf=this,this.context2d.internal.pdf=this,this.context2d.ctx=new e,this.context2d.ctxStack=[],this.context2d.path=[]}]),t.context2d={pageWrapXEnabled:!1,pageWrapYEnabled:!0,pageWrapX:9999999,pageWrapY:9999999,f2:function(t){return t.toFixed(2)},fillRect:function(t,e,n,r){t=this._wrapX(t),e=this._wrapY(e),this.pdf.rect(t,e,n,r,"f")},strokeRect:function(t,e,n,r){t=this._wrapX(t),e=this._wrapY(e),this.pdf.rect(t,e,n,r,"s")},clearRect:function(t,e,n,r){t=this._wrapX(t),e=this._wrapY(e),this.save(),this.setFillStyle("#ffffff"),this.pdf.rect(t,e,n,r,"f"),this.restore()},save:function(){this.ctx._fontSize=this.pdf.internal.getFontSize();var t=new e;t.copy(this.ctx),this.ctxStack.push(this.ctx),this.ctx=t},restore:function(){this.ctx=this.ctxStack.pop(),this.setFillStyle(this.ctx.fillStyle),this.setStrokeStyle(this.ctx.strokeStyle),this.setFont(this.ctx.font),this.pdf.setFontSize(this.ctx._fontSize),this.setLineCap(this.ctx.lineCap),this.setLineWidth(this.ctx.lineWidth),this.setLineJoin(this.ctx.lineJoin)},beginPath:function(){this.path=[]},closePath:function(){this.path.push({type:"close"})},setFillStyle:function(t){var e,n,r,i,o=this.internal.rxRgb.exec(t);null!=o?(e=parseInt(o[1]),n=parseInt(o[2]),r=parseInt(o[3])):(o=this.internal.rxRgba.exec(t),null!=o?(e=parseInt(o[1]),n=parseInt(o[2]),r=parseInt(o[3]),i=parseInt(o[4])):("#"!=t.charAt(0)&&(t=CssColors.colorNameToHex(t),t||(t="#000000")),this.ctx.fillStyle=t,4===t.length?(e=this.ctx.fillStyle.substring(1,2),e+=e,n=this.ctx.fillStyle.substring(2,3),n+=n,r=this.ctx.fillStyle.substring(3,4),r+=r):(e=this.ctx.fillStyle.substring(1,3),n=this.ctx.fillStyle.substring(3,5),r=this.ctx.fillStyle.substring(5,7)),e=parseInt(e,16),n=parseInt(n,16),r=parseInt(r,16))),this.pdf.setFillColor(e,n,r,{a:i}),this.pdf.setTextColor(e,n,r,{a:i})},setStrokeStyle:function(t){"#"!=t.charAt(0)&&(t=CssColors.colorNameToHex(t),t||(t="#000000")),this.ctx.strokeStyle=t;var e=this.ctx.strokeStyle.substring(1,3);e=parseInt(e,16);var n=this.ctx.strokeStyle.substring(3,5);n=parseInt(n,16);var r=this.ctx.strokeStyle.substring(5,7);r=parseInt(r,16),this.pdf.setDrawColor(e,n,r)},fillText:function(t,e,n,r){e=this._wrapX(e),n=this._wrapY(n),this.pdf.text(t,e,this._getBaseline(n))},strokeText:function(t,e,n,r){e=this._wrapX(e),n=this._wrapY(n),this.pdf.text(t,e,this._getBaseline(n),{stroke:!0})},setFont:function(t){this.ctx.font=t;var e=/\s*(\w+)\s+(\w+)\s+(\w+)\s+([\d\.]+)(px|pt|em)\s+["']?(\w+)['"]?/;if(c=e.exec(t),null!=c){var n=c[1],r=(c[2],c[3]),i=c[4],o=c[5],s=c[6];i="px"===o?Math.floor(parseFloat(i)):"em"===o?Math.floor(parseFloat(i)*this.pdf.getFontSize()):Math.floor(parseFloat(i)),this.pdf.setFontSize(i),"bold"===r||"700"===r?this.pdf.setFontStyle("bold"):"italic"===n?this.pdf.setFontStyle("italic"):this.pdf.setFontStyle("normal");var a=s;this.pdf.setFont(a,l)}else{var e=/(\d+)(pt|px|em)\s+(\w+)\s*(\w+)?/,c=e.exec(t);if(null!=c){var u=c[1],a=(c[2],c[3]),l=c[4];l||(l="normal"),u="em"===o?Math.floor(parseFloat(i)*this.pdf.getFontSize()):Math.floor(parseFloat(u)),this.pdf.setFontSize(u),this.pdf.setFont(a,l)}}},setTextBaseline:function(t){this.ctx.textBaseline=t},getTextBaseline:function(){return this.ctx.textBaseline},setLineWidth:function(t){this.ctx.lineWidth=t,this.pdf.setLineWidth(t)},setLineCap:function(t){this.ctx.lineCap=t,this.pdf.setLineCap(t)},setLineJoin:function(t){this.ctx.lineJon=t,this.pdf.setLineJoin(t)},moveTo:function(t,e){t=this._wrapX(t),e=this._wrapY(e);var n={type:"mt",x:t,y:e};this.path.push(n)},_wrapX:function(t){return this.pageWrapXEnabled?t%this.pageWrapX:t},_wrapY:function(t){return this.pageWrapYEnabled?(this._gotoPage(this._page(t)),(t-this.lastBreak)%this.pageWrapY):t},lastBreak:0,pageBreaks:[],_page:function(t){if(this.pageWrapYEnabled){this.lastBreak=0;for(var e=0,n=0,r=0;r<this.pageBreaks.length;r++)if(t>=this.pageBreaks[r]){e++,0===this.lastBreak&&n++;var i=this.pageBreaks[r]-this.lastBreak;this.lastBreak=this.pageBreaks[r];var o=Math.floor(i/this.pageWrapY);n+=o}if(0===this.lastBreak){var o=Math.floor(t/this.pageWrapY)+1;n+=o}return n+e}return this.pdf.internal.getCurrentPageInfo().pageNumber},_gotoPage:function(t){},lineTo:function(t,e){t=this._wrapX(t),e=this._wrapY(e);var n={type:"lt",x:t,y:e};this.path.push(n)},bezierCurveTo:function(t,e,n,r,i,o){t=this._wrapX(t),e=this._wrapY(e),n=this._wrapX(n),r=this._wrapY(r),i=this._wrapX(i),o=this._wrapY(o);var s={type:"bct",x1:t,y1:e,x2:n,y2:r,x:i,y:o};this.path.push(s)},quadraticCurveTo:function(t,e,n,r){t=this._wrapX(t),e=this._wrapY(e),n=this._wrapX(n),r=this._wrapY(r);var i={type:"qct",x1:t,y1:e,x:n,y:r};this.path.push(i)},arc:function(t,e,n,r,i,o){t=this._wrapX(t),e=this._wrapY(e);var s={type:"arc",x:t,y:e,radius:n,startAngle:r,endAngle:i,anticlockwise:o};this.path.push(s)},drawImage:function(t,e,n,r,i,o,s,a,c){void 0!==o&&(e=o,n=s,r=a,i=c),e=this._wrapX(e),
n=this._wrapY(n);var u,l=/data:image\/(\w+).*/i,h=l.exec(t);u=null!=h?h[1]:"png",this.pdf.addImage(t,u,e,n,r,i)},stroke:function(){for(var t,e=[],n=!1,r=0;r<this.path.length;r++){var i=this.path[r];switch(i.type){case"mt":t=i,"undefined"!=typeof t&&(this.pdf.lines(e,t.x,t.y,null,"s"),e=[]);break;case"lt":var o=[i.x-this.path[r-1].x,i.y-this.path[r-1].y];e.push(o);break;case"bct":var o=[i.x1-this.path[r-1].x,i.y1-this.path[r-1].y,i.x2-this.path[r-1].x,i.y2-this.path[r-1].y,i.x-this.path[r-1].x,i.y-this.path[r-1].y];e.push(o);break;case"qct":var s=this.path[r-1].x+2/3*(i.x1-this.path[r-1].x),a=this.path[r-1].y+2/3*(i.y1-this.path[r-1].y),c=i.x+2/3*(i.x1-i.x),u=i.y+2/3*(i.y1-i.y),l=i.x,h=i.y,o=[s-this.path[r-1].x,a-this.path[r-1].y,c-this.path[r-1].x,u-this.path[r-1].y,l-this.path[r-1].x,h-this.path[r-1].y];e.push(o);break;case"close":n=!0}}"undefined"!=typeof t&&this.pdf.lines(e,t.x,t.y,null,"s",n);for(var r=0;r<this.path.length;r++){var i=this.path[r];switch(i.type){case"arc":var t=360*i.startAngle/(2*Math.PI),d=360*i.endAngle/(2*Math.PI);this.internal.arc(i.x,i.y,i.radius,t,d,i.anticlockwise,"s")}}this.path=[]},fill:function(){for(var t,e=[],n=0;n<this.path.length;n++){var r=this.path[n];switch(r.type){case"mt":t=r,"undefined"!=typeof t&&(this.pdf.lines(e,t.x,t.y,null,"f"),e=[]);break;case"lt":var i=[r.x-this.path[n-1].x,r.y-this.path[n-1].y];e.push(i);break;case"bct":var i=[r.x1-this.path[n-1].x,r.y1-this.path[n-1].y,r.x2-this.path[n-1].x,r.y2-this.path[n-1].y,r.x-this.path[n-1].x,r.y-this.path[n-1].y];e.push(i);break;case"qct":var o=this.path[n-1].x+2/3*(r.x1-this.path[n-1].x),s=this.path[n-1].y+2/3*(r.y1-this.path[n-1].y),a=r.x+2/3*(r.x1-r.x),c=r.y+2/3*(r.y1-r.y),u=r.x,l=r.y,i=[o-this.path[n-1].x,s-this.path[n-1].y,a-this.path[n-1].x,c-this.path[n-1].y,u-this.path[n-1].x,l-this.path[n-1].y];e.push(i)}}"undefined"!=typeof t&&this.pdf.lines(e,t.x,t.y,null,"f");for(var n=0;n<this.path.length;n++){var r=this.path[n];switch(r.type){case"arc":var t=360*r.startAngle/(2*Math.PI),h=360*r.endAngle/(2*Math.PI);this.internal.arc(r.x,r.y,r.radius,t,h,r.anticlockwise,"f");break;case"close":this.pdf.internal.out("h")}}this.path=[]},clip:function(){},translate:function(t,e){this.ctx._translate={x:t,y:e}},measureText:function(t){var e=this.pdf;return{getWidth:function(){var n=e.internal.getFontSize(),r=e.getStringUnitWidth(t)*n/e.internal.scaleFactor;return r},get width(){return this.getWidth(t)}}},_getBaseline:function(t){var e=parseInt(this.pdf.internal.getFontSize()),n=.25*e;switch(this.ctx.textBaseline){case"bottom":return t-n;case"top":return t+e;case"hanging":return t+e-n;case"middle":return t+e/2-n;case"ideographic":return t;case"alphabetic":default:return t}}};var n=t.context2d;return Object.defineProperty(n,"fillStyle",{set:function(t){this.setFillStyle(t)},get:function(){return this.ctx.fillStyle}}),Object.defineProperty(n,"textBaseline",{set:function(t){this.setTextBaseline(t)},get:function(){return this.getTextBaseline()}}),Object.defineProperty(n,"font",{set:function(t){this.setFont(t)},get:function(){return this.getFont()}}),n.internal={},n.internal.rxRgb=/rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+\s*)\)/,n.internal.rxRgba=/rgba\s*\(\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/,n.internal.arc=function(t,e,n,r,i,o,s){for(var a=this.pdf.internal.scaleFactor,c=this.pdf.internal.pageSize.height,u=this.pdf.internal.f2,l=r*(Math.PI/180),h=i*(Math.PI/180),d=this.createArc(n,l,h,o),f=0;f<d.length;f++){var p=d[f];0==f?this.pdf.internal.out([u((p.x1+t)*a),u((c-(p.y1+e))*a),"m",u((p.x2+t)*a),u((c-(p.y2+e))*a),u((p.x3+t)*a),u((c-(p.y3+e))*a),u((p.x4+t)*a),u((c-(p.y4+e))*a),"c"].join(" ")):this.pdf.internal.out([u((p.x2+t)*a),u((c-(p.y2+e))*a),u((p.x3+t)*a),u((c-(p.y3+e))*a),u((p.x4+t)*a),u((c-(p.y4+e))*a),"c"].join(" "))}null!==s&&this.pdf.internal.out(this.pdf.internal.getStyle(s))},n.internal.createArc=function(t,e,n,r){var i=1e-5,o=2*Math.PI,s=e;(o>s||s>o)&&(s%=o);var a=n;(o>a||a>o)&&(a%=o);for(var c=[],u=Math.PI/2,l=r?-1:1,h=e,d=Math.min(o,Math.abs(a-s));d>i;){var f=h+l*Math.min(d,u);c.push(this.createSmallArc(t,h,f)),d-=Math.abs(f-h),h=f}return c},n.internal.createSmallArc=function(t,e,n){var r=(n-e)/2,i=t*Math.cos(r),o=t*Math.sin(r),s=i,a=-o,c=s*s+a*a,u=c+s*i+a*o,l=4/3*(Math.sqrt(2*c*u)-u)/(s*o-a*i),h=s-l*a,d=a+l*s,f=h,p=-d,m=r+e,g=Math.cos(m),w=Math.sin(m);return{x1:t*Math.cos(e),y1:t*Math.sin(e),x2:h*g-d*w,y2:h*w+d*g,x3:f*g-p*w,y3:f*w+p*g,x4:t*Math.cos(n),y4:t*Math.sin(n)}},this}(jsPDF.API),function(t){var e,n,r,i,o,s,a,c,u,l,h,d,f,p,m,g,w,y,v;e=function(){function t(){}return function(e){return t.prototype=e,new t}}(),u=function(t){var e,n,r,i,o,s,a;for(n=0,r=t.length,e=void 0,i=!1,s=!1;!i&&n!==r;)e=t[n]=t[n].trimLeft(),e&&(i=!0),n++;for(n=r-1;r&&!s&&-1!==n;)e=t[n]=t[n].trimRight(),e&&(s=!0),n--;for(o=/\s+$/g,a=!0,n=0;n!==r;)"\u2028"!=t[n]&&(e=t[n].replace(/\s+/g," "),a&&(e=e.trimLeft()),e&&(a=o.test(e)),t[n]=e),n++;return t},l=function(t,e,n,r){return this.pdf=t,this.x=e,this.y=n,this.settings=r,this.watchFunctions=[],this.init(),this},h=function(t){var e,n,i;for(e=void 0,i=t.split(","),n=i.shift();!e&&n;)e=r[n.trim().toLowerCase()],n=i.shift();return e},d=function(t){t="auto"===t?"0px":t,t.indexOf("em")>-1&&!isNaN(Number(t.replace("em","")))&&(t=18.719*Number(t.replace("em",""))+"px"),t.indexOf("pt")>-1&&!isNaN(Number(t.replace("pt","")))&&(t=1.333*Number(t.replace("pt",""))+"px");var e,n,r;return n=void 0,e=16,(r=f[t])?r:(r={"xx-small":9,"x-small":11,small:13,medium:16,large:19,"x-large":23,"xx-large":28,auto:0}[{css_line_height_string:t}],r!==n?f[t]=r/e:(r=parseFloat(t))?f[t]=r/e:(r=t.match(/([\d\.]+)(px)/),3===r.length?f[t]=parseFloat(r[1])/e:f[t]=1))},c=function(t){var e,n,r;return r=function(t){var e;return e=function(t){return document.defaultView&&document.defaultView.getComputedStyle?document.defaultView.getComputedStyle(t,null):t.currentStyle?t.currentStyle:t.style}(t),function(t){return t=t.replace(/-\D/g,function(t){return t.charAt(1).toUpperCase()}),e[t]}}(t),e={},n=void 0,e["font-family"]=h(r("font-family"))||"times",e["font-style"]=i[r("font-style")]||"normal",e["text-align"]=TextAlignMap[r("text-align")]||"left",n=o[r("font-weight")]||"normal","bold"===n&&("normal"===e["font-style"]?e["font-style"]=n:e["font-style"]=n+e["font-style"]),e["font-size"]=d(r("font-size"))||1,e["line-height"]=d(r("line-height"))||1,e.display="inline"===r("display")?"inline":"block",n="block"===e.display,e["margin-top"]=n&&d(r("margin-top"))||0,e["margin-bottom"]=n&&d(r("margin-bottom"))||0,e["padding-top"]=n&&d(r("padding-top"))||0,e["padding-bottom"]=n&&d(r("padding-bottom"))||0,e["margin-left"]=n&&d(r("margin-left"))||0,e["margin-right"]=n&&d(r("margin-right"))||0,e["padding-left"]=n&&d(r("padding-left"))||0,e["padding-right"]=n&&d(r("padding-right"))||0,e["page-break-before"]=r("page-break-before")||"auto",e["float"]=s[r("cssFloat")]||"none",e.clear=a[r("clear")]||"none",e.color=r("color"),e},p=function(t,e,n){var r,i,o,s,a;if(o=!1,i=void 0,s=void 0,a=void 0,r=n["#"+t.id])if("function"==typeof r)o=r(t,e);else for(i=0,s=r.length;!o&&i!==s;)o=r[i](t,e),i++;if(r=n[t.nodeName],!o&&r)if("function"==typeof r)o=r(t,e);else for(i=0,s=r.length;!o&&i!==s;)o=r[i](t,e),i++;return o},v=function(t,e){var n,r,i,o,s,a,c,u,l,h;for(n=[],r=[],i=0,h=t.rows[0].cells.length,u=t.clientWidth;h>i;)l=t.rows[0].cells[i],r[i]={name:l.textContent.toLowerCase().replace(/\s+/g,""),prompt:l.textContent.replace(/\r?\n/g,""),width:l.clientWidth/u*e.pdf.internal.pageSize.width},i++;for(i=1;i<t.rows.length;){for(a=t.rows[i],s={},o=0;o<a.cells.length;)s[r[o].name]=a.cells[o].textContent.replace(/\r?\n/g,""),o++;n.push(s),i++}return c={rows:n,headers:r}};var b={SCRIPT:1,STYLE:1,NOSCRIPT:1,OBJECT:1,EMBED:1,SELECT:1},x=1;n=function(t,r,i){var o,s,a,u,l,h,d,f,g;for(s=t.childNodes,o=void 0,a=c(t),l="block"===a.display,l&&(r.setBlockBoundary(),r.setBlockStyle(a)),d=19.049976/25.4,u=0,h=s.length;h>u;){if(o=s[u],"object"==typeof o){if(r.executeWatchFunctions(o),1===o.nodeType&&"HEADER"===o.nodeName){var w=o,y=r.pdf.margins_doc.top;r.pdf.internal.events.subscribe("addPage",function(t){r.y=y,n(w,r,i),r.pdf.margins_doc.top=r.y+10,r.y+=10},!1)}if(8===o.nodeType&&"#comment"===o.nodeName)~o.textContent.indexOf("ADD_PAGE")&&(r.pdf.addPage(),r.y=r.pdf.margins_doc.top);else if(1!==o.nodeType||b[o.nodeName])if(3===o.nodeType){var k=o.nodeValue;if(o.nodeValue&&"LI"===o.parentNode.nodeName)if("OL"===o.parentNode.parentNode.nodeName)k=x++ +". "+k;else{var C=a["font-size"];offsetX=(3-.75*C)*r.pdf.internal.scaleFactor,offsetY=.75*C*r.pdf.internal.scaleFactor,radius=1.74*C/r.pdf.internal.scaleFactor,g=function(t,e){this.pdf.circle(t+offsetX,e+offsetY,radius,"FD")}}o.ownerDocument.body.contains(o)&&r.addText(k,a)}else"string"==typeof o&&r.addText(o,a);else{var E;if("IMG"===o.nodeName){var S=o.getAttribute("src");E=m[r.pdf.sHashCode(S)||S]}if(E){r.pdf.internal.pageSize.height-r.pdf.margins_doc.bottom<r.y+o.height&&r.y>r.pdf.margins_doc.top&&(r.pdf.addPage(),r.y=r.pdf.margins_doc.top,r.executeWatchFunctions(o));var T=c(o),_=r.x,q=12/r.pdf.internal.scaleFactor,I=(T["margin-left"]+T["padding-left"])*q,P=(T["margin-right"]+T["padding-right"])*q,A=(T["margin-top"]+T["padding-top"])*q,O=(T["margin-bottom"]+T["padding-bottom"])*q;_+=void 0!==T["float"]&&"right"===T["float"]?r.settings.width-o.width-P:I,r.pdf.addImage(E,_,r.y+A,o.width,o.height),E=void 0,"right"===T["float"]||"left"===T["float"]?(r.watchFunctions.push(function(t,e,n,i){return r.y>=e?(r.x+=t,r.settings.width+=n,!0):i&&1===i.nodeType&&!b[i.nodeName]&&r.x+i.width>r.pdf.margins_doc.left+r.pdf.margins_doc.width?(r.x+=t,r.y=e,r.settings.width+=n,!0):!1}.bind(this,"left"===T["float"]?-o.width-I-P:0,r.y+o.height+A+O,o.width)),r.watchFunctions.push(function(t,e,n){return r.y<t&&e===r.pdf.internal.getNumberOfPages()?1===n.nodeType&&"both"===c(n).clear?(r.y=t,!0):!1:!0}.bind(this,r.y+o.height,r.pdf.internal.getNumberOfPages())),r.settings.width-=o.width+I+P,"left"===T["float"]&&(r.x+=o.width+I+P)):r.y+=o.height+A+O}else if("TABLE"===o.nodeName)f=v(o,r),r.y+=10,r.pdf.table(r.x,r.y,f.rows,f.headers,{autoSize:!1,printHeaders:!0,margins:r.pdf.margins_doc}),r.y=r.pdf.lastCellPos.y+r.pdf.lastCellPos.h+20;else if("OL"===o.nodeName||"UL"===o.nodeName)x=1,p(o,r,i)||n(o,r,i),r.y+=10;else if("LI"===o.nodeName){var R=r.x;r.x+=20/r.pdf.internal.scaleFactor,r.y+=3,p(o,r,i)||n(o,r,i),r.x=R}else"BR"===o.nodeName?(r.y+=a["font-size"]*r.pdf.internal.scaleFactor,r.addText("\u2028",e(a))):p(o,r,i)||n(o,r,i)}}u++}return l?r.setBlockBoundary(g):void 0},m={},g=function(t,e,n,r){function i(){e.pdf.internal.events.publish("imagesLoaded"),r(s)}function o(t,n,r){if(t){var o=new Image;s=++u,o.crossOrigin="",o.onerror=o.onload=function(){if(o.complete&&(0===o.src.indexOf("data:image/")&&(o.width=n||o.width||0,o.height=r||o.height||0),o.width+o.height)){var s=e.pdf.sHashCode(t)||t;m[s]=m[s]||o}--u||i()},o.src=t}}for(var s,a=t.getElementsByTagName("img"),c=a.length,u=0;c--;)o(a[c].getAttribute("src"),a[c].width,a[c].height);return u||i()},w=function(t,e,r){var i=t.getElementsByTagName("footer");if(i.length>0){i=i[0];var o=e.pdf.internal.write,s=e.y;e.pdf.internal.write=function(){},n(i,e,r);var a=Math.ceil(e.y-s)+5;e.y=s,e.pdf.internal.write=o,e.pdf.margins_doc.bottom+=a;for(var c=function(t){var o=void 0!==t?t.pageNumber:1,s=e.y;e.y=e.pdf.internal.pageSize.height-e.pdf.margins_doc.bottom,e.pdf.margins_doc.bottom-=a;for(var c=i.getElementsByTagName("span"),u=0;u<c.length;++u)(" "+c[u].className+" ").replace(/[\n\t]/g," ").indexOf(" pageCounter ")>-1&&(c[u].innerHTML=o),(" "+c[u].className+" ").replace(/[\n\t]/g," ").indexOf(" totalPages ")>-1&&(c[u].innerHTML="###jsPDFVarTotalPages###");n(i,e,r),e.pdf.margins_doc.bottom+=a,e.y=s},u=i.getElementsByTagName("span"),l=0;l<u.length;++l)(" "+u[l].className+" ").replace(/[\n\t]/g," ").indexOf(" totalPages ")>-1&&e.pdf.internal.events.subscribe("htmlRenderingFinished",e.pdf.putTotalPages.bind(e.pdf,"###jsPDFVarTotalPages###"),!0);e.pdf.internal.events.subscribe("addPage",c,!1),c(),b.FOOTER=1}},y=function(t,e,r,i,o,s){if(!e)return!1;"string"==typeof e||e.parentNode||(e=""+e.innerHTML),"string"==typeof e&&(e=function(t){var e,n,r,i;return r="jsPDFhtmlText"+Date.now().toString()+(1e3*Math.random()).toFixed(0),i="position: absolute !important;clip: rect(1px 1px 1px 1px); /* IE6, IE7 */clip: rect(1px, 1px, 1px, 1px);padding:0 !important;border:0 !important;height: 1px !important;width: 1px !important; top:auto;left:-100px;overflow: hidden;",n=document.createElement("div"),n.style.cssText=i,n.innerHTML='<iframe style="height:1px;width:1px" name="'+r+'" />',document.body.appendChild(n),e=window.frames[r],e.document.open(),e.document.writeln(t),e.document.close(),e.document.body}(e.replace(/<\/?script[^>]*?>/gi,"")));var a,c=new l(t,r,i,o);return g.call(this,e,c,o.elementHandlers,function(t){w(e,c,o.elementHandlers),n(e,c,o.elementHandlers),c.pdf.internal.events.publish("htmlRenderingFinished"),a=c.dispose(),"function"==typeof s?s(a):t&&console.error("jsPDF Warning: rendering issues? provide a callback to fromHTML!")}),a||{x:c.x,y:c.y}},l.prototype.init=function(){return this.paragraph={text:[],style:[]},this.pdf.internal.write("q")},l.prototype.dispose=function(){return this.pdf.internal.write("Q"),{x:this.x,y:this.y,ready:!0}},l.prototype.executeWatchFunctions=function(t){var e=!1,n=[];if(this.watchFunctions.length>0){for(var r=0;r<this.watchFunctions.length;++r)this.watchFunctions[r](t)===!0?e=!0:n.push(this.watchFunctions[r]);this.watchFunctions=n}return e},l.prototype.splitFragmentsIntoLines=function(t,n){var r,i,o,s,a,c,u,l,h,d,f,p,m,g,w;for(i=12,f=this.pdf.internal.scaleFactor,a={},o=void 0,d=void 0,s=void 0,c=void 0,w=void 0,h=void 0,l=void 0,u=void 0,p=[],m=[p],r=0,g=this.settings.width;t.length;)if(c=t.shift(),w=n.shift(),c)if(o=w["font-family"],d=w["font-style"],s=a[o+d],s||(s=this.pdf.internal.getFont(o,d).metadata.Unicode,a[o+d]=s),h={widths:s.widths,kerning:s.kerning,fontSize:w["font-size"]*i,textIndent:r},l=this.pdf.getStringUnitWidth(c,h)*h.fontSize/f,"\u2028"==c)p=[],m.push(p);else if(r+l>g){for(u=this.pdf.splitTextToSize(c,g,h),p.push([u.shift(),w]);u.length;)p=[[u.shift(),w]],m.push(p);r=this.pdf.getStringUnitWidth(p[0][0],h)*h.fontSize/f}else p.push([c,w]),r+=l;if(void 0!==w["text-align"]&&("center"===w["text-align"]||"right"===w["text-align"]||"justify"===w["text-align"]))for(var y=0;y<m.length;++y){var v=this.pdf.getStringUnitWidth(m[y][0][0],h)*h.fontSize/f;y>0&&(m[y][0][1]=e(m[y][0][1]));var b=g-v;if("right"===w["text-align"])m[y][0][1]["margin-left"]=b;else if("center"===w["text-align"])m[y][0][1]["margin-left"]=b/2;else if("justify"===w["text-align"]){var x=m[y][0][0].split(" ").length-1;m[y][0][1]["word-spacing"]=b/x,y===m.length-1&&(m[y][0][1]["word-spacing"]=0)}}return m},l.prototype.RenderTextFragment=function(t,e){var n,r,i;i=0,n=12,this.pdf.internal.pageSize.height-this.pdf.margins_doc.bottom<this.y+this.pdf.internal.getFontSize()&&(this.pdf.internal.write("ET","Q"),this.pdf.addPage(),this.y=this.pdf.margins_doc.top,this.pdf.internal.write("q","BT 0 g",this.pdf.internal.getCoordinateString(this.x),this.pdf.internal.getVerticalCoordinateString(this.y),e.color,"Td"),i=Math.max(i,e["line-height"],e["font-size"]),this.pdf.internal.write(0,(-1*n*i).toFixed(2),"Td")),r=this.pdf.internal.getFont(e["font-family"],e["font-style"]);var o=this.getPdfColor(e.color);o!==this.lastTextColor&&(this.pdf.internal.write(o),this.lastTextColor=o),void 0!==e["word-spacing"]&&e["word-spacing"]>0&&this.pdf.internal.write(e["word-spacing"].toFixed(2),"Tw"),this.pdf.internal.write("/"+r.id,(n*e["font-size"]).toFixed(2),"Tf","("+this.pdf.internal.pdfEscape(t)+") Tj"),void 0!==e["word-spacing"]&&this.pdf.internal.write(0,"Tw")},l.prototype.getPdfColor=function(t){var e,n,r,i,o=/rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+\s*)\)/,s=o.exec(t);if(null!=s?(n=parseInt(s[1]),r=parseInt(s[2]),i=parseInt(s[3])):("#"!=t.charAt(0)&&(t=CssColors.colorNameToHex(t),t||(t="#000000")),n=t.substring(1,3),n=parseInt(n,16),r=t.substring(3,5),r=parseInt(r,16),i=t.substring(5,7),i=parseInt(i,16)),"string"==typeof n&&/^#[0-9A-Fa-f]{6}$/.test(n)){var a=parseInt(n.substr(1),16);n=a>>16&255,r=a>>8&255,i=255&a}var c=this.f3;return e=0===n&&0===r&&0===i||"undefined"==typeof r?c(n/255)+" g":[c(n/255),c(r/255),c(i/255),"rg"].join(" ")},l.prototype.f3=function(t){return t.toFixed(3)},l.prototype.renderParagraph=function(t){var e,n,r,i,o,s,a,c,l,h,d,f,p,m,g;if(i=u(this.paragraph.text),m=this.paragraph.style,e=this.paragraph.blockstyle,p=this.paragraph.priorblockstyle||{},this.paragraph={text:[],style:[],blockstyle:{},priorblockstyle:e},i.join("").trim()){c=this.splitFragmentsIntoLines(i,m),a=void 0,l=void 0,n=12,r=n/this.pdf.internal.scaleFactor,this.priorMarginBottom=this.priorMarginBottom||0,f=(Math.max((e["margin-top"]||0)-this.priorMarginBottom,0)+(e["padding-top"]||0))*r,d=((e["margin-bottom"]||0)+(e["padding-bottom"]||0))*r,this.priorMarginBottom=e["margin-bottom"]||0,"always"===e["page-break-before"]&&(this.pdf.addPage(),this.y=0,f=((e["margin-top"]||0)+(e["padding-top"]||0))*r),h=this.pdf.internal.write,o=void 0,s=void 0,this.y+=f,h("q","BT 0 g",this.pdf.internal.getCoordinateString(this.x),this.pdf.internal.getVerticalCoordinateString(this.y),"Td");for(var w=0;c.length;){for(a=c.shift(),l=0,o=0,s=a.length;o!==s;)a[o][0].trim()&&(l=Math.max(l,a[o][1]["line-height"],a[o][1]["font-size"]),g=7*a[o][1]["font-size"]),o++;var y=0,v=0;void 0!==a[0][1]["margin-left"]&&a[0][1]["margin-left"]>0&&(wantedIndent=this.pdf.internal.getCoordinateString(a[0][1]["margin-left"]),y=wantedIndent-w,w=wantedIndent);var v=Math.max(e["margin-left"]||0,0)*r;for(h(y+v,(-1*n*l).toFixed(2),"Td"),o=0,s=a.length;o!==s;)a[o][0]&&this.RenderTextFragment(a[o][0],a[o][1]),o++;if(this.y+=l*r,this.executeWatchFunctions(a[0][1])&&c.length>0){var b=[],x=[];c.forEach(function(t){for(var e=0,n=t.length;e!==n;)t[e][0]&&(b.push(t[e][0]+" "),x.push(t[e][1])),++e}),c=this.splitFragmentsIntoLines(u(b),x),h("ET","Q"),h("q","BT 0 g",this.pdf.internal.getCoordinateString(this.x),this.pdf.internal.getVerticalCoordinateString(this.y),"Td")}}return t&&"function"==typeof t&&t.call(this,this.x-9,this.y-g/2),h("ET","Q"),this.y+=d}},l.prototype.setBlockBoundary=function(t){return this.renderParagraph(t)},l.prototype.setBlockStyle=function(t){return this.paragraph.blockstyle=t},l.prototype.addText=function(t,e){return this.paragraph.text.push(t),this.paragraph.style.push(e)},r={helvetica:"helvetica","sans-serif":"helvetica","times new roman":"times",serif:"times",times:"times",monospace:"courier",courier:"courier"},o={100:"normal",200:"normal",300:"normal",400:"normal",500:"bold",600:"bold",700:"bold",800:"bold",900:"bold",normal:"normal",bold:"bold",bolder:"bold",lighter:"normal"},i={normal:"normal",italic:"italic",oblique:"italic"},TextAlignMap={left:"left",right:"right",center:"center",justify:"justify"},s={none:"none",right:"right",left:"left"},a={none:"none",both:"both"},f={normal:1},t.fromHTML=function(t,e,n,r,i,o){"use strict";return this.margins_doc=o||{top:0,bottom:0},r||(r={}),r.elementHandlers||(r.elementHandlers={}),y(this,t,isNaN(e)?4:e,isNaN(n)?4:n,r,i)}}(jsPDF.API),function(t){"use strict";var e,n,r;t.addJS=function(t){return r=t,this.internal.events.subscribe("postPutResources",function(t){e=this.internal.newObject(),this.internal.write("<< /Names [(EmbeddedJS) "+(e+1)+" 0 R] >>","endobj"),n=this.internal.newObject(),this.internal.write("<< /S /JavaScript /JS (",r,") >>","endobj")}),this.internal.events.subscribe("putCatalog",function(){void 0!==e&&void 0!==n&&this.internal.write("/Names <</JavaScript "+e+" 0 R>>")}),this}}(jsPDF.API),function(t){"use strict";return t.events.push(["postPutResources",function(){var t=this,e=/^(\d+) 0 obj$/;if(this.outline.root.children.length>0)for(var n=t.outline.render().split(/\r\n/),r=0;r<n.length;r++){var i=n[r],o=e.exec(i);if(null!=o){var s=o[1];t.internal.newObjectDeferredBegin(s)}t.internal.write(i)}if(this.outline.createNamedDestinations){for(var a=this.internal.pages.length,c=[],r=0;a>r;r++){var u=t.internal.newObject();c.push(u);var l=t.internal.getPageInfo(r+1);t.internal.write("<< /D["+l.objId+" 0 R /XYZ null null null]>> endobj")}var h=t.internal.newObject();t.internal.write("<< /Names [ ");for(var r=0;r<c.length;r++)t.internal.write("(page_"+(r+1)+")"+c[r]+" 0 R");t.internal.write(" ] >>","endobj"),namesOid=t.internal.newObject(),t.internal.write("<< /Dests "+h+" 0 R"),t.internal.write(">>","endobj")}}]),t.events.push(["putCatalog",function(){var t=this;t.outline.root.children.length>0&&(t.internal.write("/Outlines",this.outline.makeRef(this.outline.root)),this.outline.createNamedDestinations&&t.internal.write("/Names "+namesOid+" 0 R"))}]),t.events.push(["initialized",function(){var t=this;t.outline={createNamedDestinations:!1,root:{children:[]}};t.outline.add=function(t,e,n){var r={title:e,options:n,children:[]};return null==t&&(t=this.root),t.children.push(r),r},t.outline.render=function(){return this.ctx={},this.ctx.val="",this.ctx.pdf=t,this.genIds_r(this.root),this.renderRoot(this.root),this.renderItems(this.root),this.ctx.val},t.outline.genIds_r=function(e){e.id=t.internal.newObjectDeferred();for(var n=0;n<e.children.length;n++)this.genIds_r(e.children[n])},t.outline.renderRoot=function(t){this.objStart(t),this.line("/Type /Outlines"),t.children.length>0&&(this.line("/First "+this.makeRef(t.children[0])),this.line("/Last "+this.makeRef(t.children[t.children.length-1]))),this.line("/Count "+this.count_r({count:0},t)),this.objEnd()},t.outline.renderItems=function(e){for(var n=0;n<e.children.length;n++){var r=e.children[n];this.objStart(r),this.line("/Title "+this.makeString(r.title)),this.line("/Parent "+this.makeRef(e)),n>0&&this.line("/Prev "+this.makeRef(e.children[n-1])),n<e.children.length-1&&this.line("/Next "+this.makeRef(e.children[n+1])),r.children.length>0&&(this.line("/First "+this.makeRef(r.children[0])),this.line("/Last "+this.makeRef(r.children[r.children.length-1])));var i=this.count=this.count_r({count:0},r);if(i>0&&this.line("/Count "+i),r.options&&r.options.pageNumber){var o=t.internal.getPageInfo(r.options.pageNumber);this.line("/Dest ["+o.objId+" 0 R /XYZ 0 "+this.ctx.pdf.internal.pageSize.height+" 0]")}this.objEnd()}for(var n=0;n<e.children.length;n++){var r=e.children[n];this.renderItems(r)}},t.outline.line=function(t){this.ctx.val+=t+"\r\n"},t.outline.makeRef=function(t){return t.id+" 0 R"},t.outline.makeString=function(e){return"("+t.internal.pdfEscape(e)+")"},t.outline.objStart=function(t){this.ctx.val+="\r\n"+t.id+" 0 obj\r\n<<\r\n"},t.outline.objEnd=function(t){this.ctx.val+=">> \r\nendobj\r\n"},t.outline.count_r=function(t,e){for(var n=0;n<e.children.length;n++)t.count++,this.count_r(t,e.children[n]);return t.count}}]),this}(jsPDF.API),function(t){"use strict";var e=function(){return"function"!=typeof PNG||"function"!=typeof FlateStream},n=function(e){return e!==t.image_compression.NONE&&r()},r=function(){var t="function"==typeof Deflater;if(!t)throw new Error("requires deflate.js for compression");return t},i=function(e,n,r,i){var c=5,f=l;switch(i){case t.image_compression.FAST:c=3,f=u;break;case t.image_compression.MEDIUM:c=6,f=h;break;case t.image_compression.SLOW:c=9,f=d}e=a(e,n,r,f);var p=new Uint8Array(o(c)),m=s(e),g=new Deflater(c),w=g.append(e),y=g.flush(),v=p.length+w.length+y.length,b=new Uint8Array(v+4);return b.set(p),b.set(w,p.length),b.set(y,p.length+w.length),b[v++]=m>>>24&255,b[v++]=m>>>16&255,b[v++]=m>>>8&255,b[v++]=255&m,t.arrayBufferToBinaryString(b)},o=function(t,e){var n=8,r=Math.LOG2E*Math.log(32768)-8,i=r<<4|n,o=i<<8,s=Math.min(3,(e-1&255)>>1);return o|=s<<6,o|=0,o+=31-o%31,[i,255&o&255]},s=function(t,e){for(var n,r=1,i=65535&r,o=r>>>16&65535,s=t.length,a=0;s>0;){n=s>e?e:s,s-=n;do i+=t[a++],o+=i;while(--n);i%=65521,o%=65521}return(o<<16|i)>>>0},a=function(t,e,n,r){for(var i,o,s,a=t.length/e,c=new Uint8Array(t.length+a),u=p(),l=0;a>l;l++){if(s=l*e,i=t.subarray(s,s+e),r)c.set(r(i,n,o),s+l);else{for(var h=0,d=u.length,f=[];d>h;h++)f[h]=u[h](i,n,o);var g=m(f.concat());c.set(f[g],s+l)}o=i}return c},c=function(t,e,n){var r=Array.apply([],t);return r.unshift(0),r},u=function(t,e,n){var r,i=[],o=0,s=t.length;for(i[0]=1;s>o;o++)r=t[o-e]||0,i[o+1]=t[o]-r+256&255;return i},l=function(t,e,n){var r,i=[],o=0,s=t.length;for(i[0]=2;s>o;o++)r=n&&n[o]||0,i[o+1]=t[o]-r+256&255;return i},h=function(t,e,n){var r,i,o=[],s=0,a=t.length;for(o[0]=3;a>s;s++)r=t[s-e]||0,i=n&&n[s]||0,o[s+1]=t[s]+256-(r+i>>>1)&255;return o},d=function(t,e,n){var r,i,o,s,a=[],c=0,u=t.length;for(a[0]=4;u>c;c++)r=t[c-e]||0,i=n&&n[c]||0,o=n&&n[c-e]||0,s=f(r,i,o),a[c+1]=t[c]-s+256&255;return a},f=function(t,e,n){var r=t+e-n,i=Math.abs(r-t),o=Math.abs(r-e),s=Math.abs(r-n);return o>=i&&s>=i?t:s>=o?e:n},p=function(){return[c,u,l,h,d]},m=function(t){for(var e,n,r,i=0,o=t.length;o>i;)e=g(t[i].slice(1)),(n>e||!n)&&(n=e,r=i),i++;return r},g=function(t){for(var e=0,n=t.length,r=0;n>e;)r+=Math.abs(t[e++]);return r};t.processPNG=function(t,r,o,s,a){var c,u,l,h,d,f,p=this.color_spaces.DEVICE_RGB,m=this.decode.FLATE_DECODE,g=8;if(this.isArrayBuffer(t)&&(t=new Uint8Array(t)),this.isArrayBufferView(t)){if(e())throw new Error("PNG support requires png.js and zlib.js");if(c=new PNG(t),t=c.imgData,g=c.bits,p=c.colorSpace,h=c.colors,-1!==[4,6].indexOf(c.colorType)){if(8===c.bits)for(var w,y,v=32==c.pixelBitlength?new Uint32Array(c.decodePixels().buffer):16==c.pixelBitlength?new Uint16Array(c.decodePixels().buffer):new Uint8Array(c.decodePixels().buffer),b=v.length,x=new Uint8Array(b*c.colors),k=new Uint8Array(b),C=c.pixelBitlength-c.bits,E=0,S=0;b>E;E++){for(w=v[E],y=0;C>y;)x[S++]=w>>>y&255,y+=c.bits;k[E]=w>>>y&255}if(16===c.bits){for(var w,v=new Uint32Array(c.decodePixels().buffer),b=v.length,x=new Uint8Array(b*(32/c.pixelBitlength)*c.colors),k=new Uint8Array(b*(32/c.pixelBitlength)),T=c.colors>1,E=0,S=0,_=0;b>E;)w=v[E++],x[S++]=w>>>0&255,T&&(x[S++]=w>>>16&255,w=v[E++],x[S++]=w>>>0&255),k[_++]=w>>>16&255;g=8}n(s)?(t=i(x,c.width*c.colors,c.colors,s),f=i(k,c.width,1,s)):(t=x,f=k,m=null)}if(3===c.colorType&&(p=this.color_spaces.INDEXED,d=c.palette,c.transparency.indexed)){for(var q=c.transparency.indexed,I=0,E=0,b=q.length;b>E;++E)I+=q[E];if(I/=255,I===b-1&&-1!==q.indexOf(0))l=[q.indexOf(0)];else if(I!==b){for(var v=c.decodePixels(),k=new Uint8Array(v.length),E=0,b=v.length;b>E;E++)k[E]=q[v[E]];f=i(k,c.width,1)}}return u=m===this.decode.FLATE_DECODE?"/Predictor 15 /Colors "+h+" /BitsPerComponent "+g+" /Columns "+c.width:"/Colors "+h+" /BitsPerComponent "+g+" /Columns "+c.width,(this.isArrayBuffer(t)||this.isArrayBufferView(t))&&(t=this.arrayBufferToBinaryString(t)),(f&&this.isArrayBuffer(f)||this.isArrayBufferView(f))&&(f=this.arrayBufferToBinaryString(f)),this.createImageInfo(t,c.width,c.height,p,g,m,r,o,u,l,d,f)}throw new Error("Unsupported PNG image data, try using JPEG instead.")}}(jsPDF.API),function(t){"use strict";var e=t.getCharWidthsArray=function(t,e){e||(e={});var n,r,i,o=e.widths?e.widths:this.internal.getFont().metadata.Unicode.widths,s=o.fof?o.fof:1,a=e.kerning?e.kerning:this.internal.getFont().metadata.Unicode.kerning,c=a.fof?a.fof:1,u=0,l=o[0]||s,h=[];for(n=0,r=t.length;r>n;n++)i=t.charCodeAt(n),h.push((o[i]||l)/s+(a[i]&&a[i][u]||0)/c),u=i;return h},n=function(t){for(var e=t.length,n=0;e;)e--,n+=t[e];return n},r=t.getStringUnitWidth=function(t,r){return n(e.call(this,t,r))},i=function(t,e,n,r){for(var i=[],o=0,s=t.length,a=0;o!==s&&a+e[o]<n;)a+=e[o],o++;i.push(t.slice(0,o));var c=o;for(a=0;o!==s;)a+e[o]>r&&(i.push(t.slice(c,o)),a=0,c=o),a+=e[o],o++;return c!==o&&i.push(t.slice(c,o)),i},o=function(t,o,s){s||(s={});var a,c,u,l,h,d,f=[],p=[f],m=s.textIndent||0,g=0,w=0,y=t.split(" "),v=e(" ",s)[0];if(d=-1===s.lineIndent?y[0].length+2:s.lineIndent||0){var b=Array(d).join(" "),x=[];y.map(function(t){t=t.split(/\s*\n/),t.length>1?x=x.concat(t.map(function(t,e){return(e&&t.length?"\n":"")+t})):x.push(t[0])}),y=x,d=r(b,s)}for(u=0,l=y.length;l>u;u++){var k=0;if(a=y[u],d&&"\n"==a[0]&&(a=a.substr(1),k=1),c=e(a,s),w=n(c),m+g+w>o||k){if(w>o){for(h=i(a,c,o-(m+g),o),f.push(h.shift()),f=[h.pop()];h.length;)p.push([h.shift()]);w=n(c.slice(a.length-f[0].length))}else f=[a];p.push(f),m=w+d,g=v}else f.push(a),m+=g+w,g=v}if(d)var C=function(t,e){return(e?b:"")+t.join(" ")};else var C=function(t){return t.join(" ")};return p.map(C)};t.splitTextToSize=function(t,e,n){n||(n={});var r,i=n.fontSize||this.internal.getFontSize(),s=function(t){var e={0:1},n={};if(t.widths&&t.kerning)return{widths:t.widths,kerning:t.kerning};var r=this.internal.getFont(t.fontName,t.fontStyle),i="Unicode";return r.metadata[i]?{widths:r.metadata[i].widths||e,kerning:r.metadata[i].kerning||n}:{widths:e,kerning:n}}.call(this,n);r=Array.isArray(t)?t:t.split(/\r?\n/);var a=1*this.internal.scaleFactor*e/i;s.textIndent=n.textIndent?1*n.textIndent*this.internal.scaleFactor/i:0,s.lineIndent=n.lineIndent;var c,u,l=[];for(c=0,u=r.length;u>c;c++)l=l.concat(o(r[c],a,s));return l}}(jsPDF.API),function(t){"use strict";var e=function(t){for(var e="0123456789abcdef",n="klmnopqrstuvwxyz",r={},i=0;i<n.length;i++)r[n[i]]=e[i];var o,s,a,c,u,l={},h=1,d=l,f=[],p="",m="",g=t.length-1;for(i=1;i!=g;)u=t[i],i+=1,"'"==u?s?(c=s.join(""),s=o):s=[]:s?s.push(u):"{"==u?(f.push([d,c]),d={},c=o):"}"==u?(a=f.pop(),a[0][a[1]]=d,c=o,d=a[0]):"-"==u?h=-1:c===o?r.hasOwnProperty(u)?(p+=r[u],c=parseInt(p,16)*h,h=1,p=""):p+=u:r.hasOwnProperty(u)?(m+=r[u],d[c]=parseInt(m,16)*h,h=1,c=o,m=""):m+=u;return l},n={codePages:["WinAnsiEncoding"],WinAnsiEncoding:e("{19m8n201n9q201o9r201s9l201t9m201u8m201w9n201x9o201y8o202k8q202l8r202m9p202q8p20aw8k203k8t203t8v203u9v2cq8s212m9t15m8w15n9w2dw9s16k8u16l9u17s9z17x8y17y9y}")},r={Unicode:{Courier:n,"Courier-Bold":n,"Courier-BoldOblique":n,"Courier-Oblique":n,Helvetica:n,"Helvetica-Bold":n,"Helvetica-BoldOblique":n,"Helvetica-Oblique":n,"Times-Roman":n,"Times-Bold":n,"Times-BoldItalic":n,"Times-Italic":n}},i={Unicode:{"Courier-Oblique":e("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-BoldItalic":e("{'widths'{k3o2q4ycx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2r202m2n2n3m2o3m2p5n202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5n4l4m4m4m4n4m4o4s4p4m4q4m4r4s4s4y4t2r4u3m4v4m4w3x4x5t4y4s4z4s5k3x5l4s5m4m5n3r5o3x5p4s5q4m5r5t5s4m5t3x5u3x5v2l5w1w5x2l5y3t5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q2l6r3m6s3r6t1w6u1w6v3m6w1w6x4y6y3r6z3m7k3m7l3m7m2r7n2r7o1w7p3r7q2w7r4m7s3m7t2w7u2r7v2n7w1q7x2n7y3t202l3mcl4mal2ram3man3mao3map3mar3mas2lat4uau1uav3maw3way4uaz2lbk2sbl3t'fof'6obo2lbp3tbq3mbr1tbs2lbu1ybv3mbz3mck4m202k3mcm4mcn4mco4mcp4mcq5ycr4mcs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz2w203k6o212m6o2dw2l2cq2l3t3m3u2l17s3x19m3m}'kerning'{cl{4qu5kt5qt5rs17ss5ts}201s{201ss}201t{cks4lscmscnscoscpscls2wu2yu201ts}201x{2wu2yu}2k{201ts}2w{4qx5kx5ou5qx5rs17su5tu}2x{17su5tu5ou}2y{4qx5kx5ou5qx5rs17ss5ts}'fof'-6ofn{17sw5tw5ou5qw5rs}7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qs}3v{17su5tu5os5qs}7p{17su5tu}ck{4qu5kt5qt5rs17ss5ts}4l{4qu5kt5qt5rs17ss5ts}cm{4qu5kt5qt5rs17ss5ts}cn{4qu5kt5qt5rs17ss5ts}co{4qu5kt5qt5rs17ss5ts}cp{4qu5kt5qt5rs17ss5ts}6l{4qu5ou5qw5rt17su5tu}5q{ckuclucmucnucoucpu4lu}5r{ckuclucmucnucoucpu4lu}7q{cksclscmscnscoscps4ls}6p{4qu5ou5qw5rt17sw5tw}ek{4qu5ou5qw5rt17su5tu}el{4qu5ou5qw5rt17su5tu}em{4qu5ou5qw5rt17su5tu}en{4qu5ou5qw5rt17su5tu}eo{4qu5ou5qw5rt17su5tu}ep{4qu5ou5qw5rt17su5tu}es{17ss5ts5qs4qu}et{4qu5ou5qw5rt17sw5tw}eu{4qu5ou5qw5rt17ss5ts}ev{17ss5ts5qs4qu}6z{17sw5tw5ou5qw5rs}fm{17sw5tw5ou5qw5rs}7n{201ts}fo{17sw5tw5ou5qw5rs}fp{17sw5tw5ou5qw5rs}fq{17sw5tw5ou5qw5rs}7r{cksclscmscnscoscps4ls}fs{17sw5tw5ou5qw5rs}ft{17su5tu}fu{17su5tu}fv{17su5tu}fw{17su5tu}fz{cksclscmscnscoscps4ls}}}"),"Helvetica-Bold":e("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}"),
Courier:e("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Courier-BoldOblique":e("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-Bold":e("{'widths'{k3q2q5ncx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2l202m2n2n3m2o3m2p6o202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5x4l4s4m4m4n4s4o4s4p4m4q3x4r4y4s4y4t2r4u3m4v4y4w4m4x5y4y4s4z4y5k3x5l4y5m4s5n3r5o4m5p4s5q4s5r6o5s4s5t4s5u4m5v2l5w1w5x2l5y3u5z3m6k2l6l3m6m3r6n2w6o3r6p2w6q2l6r3m6s3r6t1w6u2l6v3r6w1w6x5n6y3r6z3m7k3r7l3r7m2w7n2r7o2l7p3r7q3m7r4s7s3m7t3m7u2w7v2r7w1q7x2r7y3o202l3mcl4sal2lam3man3mao3map3mar3mas2lat4uau1yav3maw3tay4uaz2lbk2sbl3t'fof'6obo2lbp3rbr1tbs2lbu2lbv3mbz3mck4s202k3mcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3rek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3m3u2l17s4s19m3m}'kerning'{cl{4qt5ks5ot5qy5rw17sv5tv}201t{cks4lscmscnscoscpscls4wv}2k{201ts}2w{4qu5ku7mu5os5qx5ru17su5tu}2x{17su5tu5ou5qs}2y{4qv5kv7mu5ot5qz5ru17su5tu}'fof'-6o7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qu}3v{17su5tu5os5qu}fu{17su5tu5ou5qu}7p{17su5tu5ou5qu}ck{4qt5ks5ot5qy5rw17sv5tv}4l{4qt5ks5ot5qy5rw17sv5tv}cm{4qt5ks5ot5qy5rw17sv5tv}cn{4qt5ks5ot5qy5rw17sv5tv}co{4qt5ks5ot5qy5rw17sv5tv}cp{4qt5ks5ot5qy5rw17sv5tv}6l{17st5tt5ou5qu}17s{ckuclucmucnucoucpu4lu4wu}5o{ckuclucmucnucoucpu4lu4wu}5q{ckzclzcmzcnzcozcpz4lz4wu}5r{ckxclxcmxcnxcoxcpx4lx4wu}5t{ckuclucmucnucoucpu4lu4wu}7q{ckuclucmucnucoucpu4lu}6p{17sw5tw5ou5qu}ek{17st5tt5qu}el{17st5tt5ou5qu}em{17st5tt5qu}en{17st5tt5qu}eo{17st5tt5qu}ep{17st5tt5ou5qu}es{17ss5ts5qu}et{17sw5tw5ou5qu}eu{17sw5tw5ou5qu}ev{17ss5ts5qu}6z{17sw5tw5ou5qu5rs}fm{17sw5tw5ou5qu5rs}fn{17sw5tw5ou5qu5rs}fo{17sw5tw5ou5qu5rs}fp{17sw5tw5ou5qu5rs}fq{17sw5tw5ou5qu5rs}7r{cktcltcmtcntcotcpt4lt5os}fs{17sw5tw5ou5qu5rs}ft{17su5tu5ou5qu}7m{5os}fv{17su5tu5ou5qu}fw{17su5tu5ou5qu}fz{cksclscmscnscoscps4ls}}}"),Helvetica:e("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}"),"Helvetica-BoldOblique":e("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}"),"Courier-Bold":e("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-Italic":e("{'widths'{k3n2q4ycx2l201n3m201o5t201s2l201t2l201u2l201w3r201x3r201y3r2k1t2l2l202m2n2n3m2o3m2p5n202q5t2r1p2s2l2t2l2u3m2v4n2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w4n3x4n3y4n3z3m4k5w4l3x4m3x4n4m4o4s4p3x4q3x4r4s4s4s4t2l4u2w4v4m4w3r4x5n4y4m4z4s5k3x5l4s5m3x5n3m5o3r5p4s5q3x5r5n5s3x5t3r5u3r5v2r5w1w5x2r5y2u5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q1w6r3m6s3m6t1w6u1w6v2w6w1w6x4s6y3m6z3m7k3m7l3m7m2r7n2r7o1w7p3m7q2w7r4m7s2w7t2w7u2r7v2s7w1v7x2s7y3q202l3mcl3xal2ram3man3mao3map3mar3mas2lat4wau1vav3maw4nay4waz2lbk2sbl4n'fof'6obo2lbp3mbq3obr1tbs2lbu1zbv3mbz3mck3x202k3mcm3xcn3xco3xcp3xcq5tcr4mcs3xct3xcu3xcv3xcw2l2m2ucy2lcz2ldl4mdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr4nfs3mft3mfu3mfv3mfw3mfz2w203k6o212m6m2dw2l2cq2l3t3m3u2l17s3r19m3m}'kerning'{cl{5kt4qw}201s{201sw}201t{201tw2wy2yy6q-t}201x{2wy2yy}2k{201tw}2w{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}2x{17ss5ts5os}2y{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}'fof'-6o6t{17ss5ts5qs}7t{5os}3v{5qs}7p{17su5tu5qs}ck{5kt4qw}4l{5kt4qw}cm{5kt4qw}cn{5kt4qw}co{5kt4qw}cp{5kt4qw}6l{4qs5ks5ou5qw5ru17su5tu}17s{2ks}5q{ckvclvcmvcnvcovcpv4lv}5r{ckuclucmucnucoucpu4lu}5t{2ks}6p{4qs5ks5ou5qw5ru17su5tu}ek{4qs5ks5ou5qw5ru17su5tu}el{4qs5ks5ou5qw5ru17su5tu}em{4qs5ks5ou5qw5ru17su5tu}en{4qs5ks5ou5qw5ru17su5tu}eo{4qs5ks5ou5qw5ru17su5tu}ep{4qs5ks5ou5qw5ru17su5tu}es{5ks5qs4qs}et{4qs5ks5ou5qw5ru17su5tu}eu{4qs5ks5qw5ru17su5tu}ev{5ks5qs4qs}ex{17ss5ts5qs}6z{4qv5ks5ou5qw5ru17su5tu}fm{4qv5ks5ou5qw5ru17su5tu}fn{4qv5ks5ou5qw5ru17su5tu}fo{4qv5ks5ou5qw5ru17su5tu}fp{4qv5ks5ou5qw5ru17su5tu}fq{4qv5ks5ou5qw5ru17su5tu}7r{5os}fs{4qv5ks5ou5qw5ru17su5tu}ft{17su5tu5qs}fu{17su5tu5qs}fv{17su5tu5qs}fw{17su5tu5qs}}}"),"Times-Roman":e("{'widths'{k3n2q4ycx2l201n3m201o6o201s2l201t2l201u2l201w2w201x2w201y2w2k1t2l2l202m2n2n3m2o3m2p5n202q6o2r1m2s2l2t2l2u3m2v3s2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v1w3w3s3x3s3y3s3z2w4k5w4l4s4m4m4n4m4o4s4p3x4q3r4r4s4s4s4t2l4u2r4v4s4w3x4x5t4y4s4z4s5k3r5l4s5m4m5n3r5o3x5p4s5q4s5r5y5s4s5t4s5u3x5v2l5w1w5x2l5y2z5z3m6k2l6l2w6m3m6n2w6o3m6p2w6q2l6r3m6s3m6t1w6u1w6v3m6w1w6x4y6y3m6z3m7k3m7l3m7m2l7n2r7o1w7p3m7q3m7r4s7s3m7t3m7u2w7v3k7w1o7x3k7y3q202l3mcl4sal2lam3man3mao3map3mar3mas2lat4wau1vav3maw3say4waz2lbk2sbl3s'fof'6obo2lbp3mbq2xbr1tbs2lbu1zbv3mbz2wck4s202k3mcm4scn4sco4scp4scq5tcr4mcs3xct3xcu3xcv3xcw2l2m2tcy2lcz2ldl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek2wel2wem2wen2weo2wep2weq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr3sfs3mft3mfu3mfv3mfw3mfz3m203k6o212m6m2dw2l2cq2l3t3m3u1w17s4s19m3m}'kerning'{cl{4qs5ku17sw5ou5qy5rw201ss5tw201ws}201s{201ss}201t{ckw4lwcmwcnwcowcpwclw4wu201ts}2k{201ts}2w{4qs5kw5os5qx5ru17sx5tx}2x{17sw5tw5ou5qu}2y{4qs5kw5os5qx5ru17sx5tx}'fof'-6o7t{ckuclucmucnucoucpu4lu5os5rs}3u{17su5tu5qs}3v{17su5tu5qs}7p{17sw5tw5qs}ck{4qs5ku17sw5ou5qy5rw201ss5tw201ws}4l{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cm{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cn{4qs5ku17sw5ou5qy5rw201ss5tw201ws}co{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cp{4qs5ku17sw5ou5qy5rw201ss5tw201ws}6l{17su5tu5os5qw5rs}17s{2ktclvcmvcnvcovcpv4lv4wuckv}5o{ckwclwcmwcnwcowcpw4lw4wu}5q{ckyclycmycnycoycpy4ly4wu5ms}5r{cktcltcmtcntcotcpt4lt4ws}5t{2ktclvcmvcnvcovcpv4lv4wuckv}7q{cksclscmscnscoscps4ls}6p{17su5tu5qw5rs}ek{5qs5rs}el{17su5tu5os5qw5rs}em{17su5tu5os5qs5rs}en{17su5qs5rs}eo{5qs5rs}ep{17su5tu5os5qw5rs}es{5qs}et{17su5tu5qw5rs}eu{17su5tu5qs5rs}ev{5qs}6z{17sv5tv5os5qx5rs}fm{5os5qt5rs}fn{17sv5tv5os5qx5rs}fo{17sv5tv5os5qx5rs}fp{5os5qt5rs}fq{5os5qt5rs}7r{ckuclucmucnucoucpu4lu5os}fs{17sv5tv5os5qx5rs}ft{17ss5ts5qs}fu{17sw5tw5qs}fv{17sw5tw5qs}fw{17ss5ts5qs}fz{ckuclucmucnucoucpu4lu5os5rs}}}"),"Helvetica-Oblique":e("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}")}};t.events.push(["addFonts",function(t){var e,n,o,s,a,c="Unicode";for(n in t.fonts)t.fonts.hasOwnProperty(n)&&(e=t.fonts[n],o=i[c][e.PostScriptName],o&&(s=e.metadata[c]?e.metadata[c]:e.metadata[c]={},s.widths=o.widths,s.kerning=o.kerning),a=r[c][e.PostScriptName],a&&(s=e.metadata[c]?e.metadata[c]:e.metadata[c]={},s.encoding=a,a.codePages&&a.codePages.length&&(e.encoding=a.codePages[0])))}])}(jsPDF.API),function(t){"use strict";t.addSVG=function(t,e,n,r,i){function o(t,e){var n=e.createElement("style");n.type="text/css",n.styleSheet?n.styleSheet.cssText=t:n.appendChild(e.createTextNode(t)),e.getElementsByTagName("head")[0].appendChild(n)}function s(t){var e="childframe",n=t.createElement("iframe");return o(".jsPDF_sillysvg_iframe {display:none;position:absolute;}",t),n.name=e,n.setAttribute("width",0),n.setAttribute("height",0),n.setAttribute("frameborder","0"),n.setAttribute("scrolling","no"),n.setAttribute("seamless","seamless"),n.setAttribute("class","jsPDF_sillysvg_iframe"),t.body.appendChild(n),n}function a(t,e){var n=(e.contentWindow||e.contentDocument).document;return n.write(t),n.close(),n.getElementsByTagName("svg")[0]}function c(t){for(var e=parseFloat(t[1]),n=parseFloat(t[2]),r=[],i=3,o=t.length;o>i;)"c"===t[i]?(r.push([parseFloat(t[i+1]),parseFloat(t[i+2]),parseFloat(t[i+3]),parseFloat(t[i+4]),parseFloat(t[i+5]),parseFloat(t[i+6])]),i+=7):"l"===t[i]?(r.push([parseFloat(t[i+1]),parseFloat(t[i+2])]),i+=3):i+=1;return[e,n,r]}var u;if(e===u||n===u)throw new Error("addSVG needs values for 'x' and 'y'");var l=s(document),h=a(t,l),d=[1,1],f=parseFloat(h.getAttribute("width")),p=parseFloat(h.getAttribute("height"));f&&p&&(r&&i?d=[r/f,i/p]:r?d=[r/f,r/f]:i&&(d=[i/p,i/p]));var m,g,w,y,v=h.childNodes;for(m=0,g=v.length;g>m;m++)w=v[m],w.tagName&&"PATH"===w.tagName.toUpperCase()&&(y=c(w.getAttribute("d").split(" ")),y[0]=y[0]*d[0]+e,y[1]=y[1]*d[1]+n,this.lines.call(this,y[2],y[0],y[1],d));return this}}(jsPDF.API),function(t){"use strict";t.putTotalPages=function(t){for(var e=new RegExp(t,"g"),n=1;n<=this.internal.getNumberOfPages();n++)for(var r=0;r<this.internal.pages[n].length;r++)this.internal.pages[n][r]=this.internal.pages[n][r].replace(e,this.internal.getNumberOfPages());return this}}(jsPDF.API),function(t){"use strict";if(t.URL=t.URL||t.webkitURL,t.Blob&&t.URL)try{return void new Blob}catch(e){}var n=t.BlobBuilder||t.WebKitBlobBuilder||t.MozBlobBuilder||function(t){var e=function(t){return Object.prototype.toString.call(t).match(/^\[object\s(.*)\]$/)[1]},n=function(){this.data=[]},r=function(t,e,n){this.data=t,this.size=t.length,this.type=e,this.encoding=n},i=n.prototype,o=r.prototype,s=t.FileReaderSync,a=function(t){this.code=this[this.name=t]},c="NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR".split(" "),u=c.length,l=t.URL||t.webkitURL||t,h=l.createObjectURL,d=l.revokeObjectURL,f=l,p=t.btoa,m=t.atob,g=t.ArrayBuffer,w=t.Uint8Array,y=/^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/;for(r.fake=o.fake=!0;u--;)a.prototype[c[u]]=u+1;return l.createObjectURL||(f=t.URL=function(t){var e,n=document.createElementNS("http://www.w3.org/1999/xhtml","a");return n.href=t,"origin"in n||("data:"===n.protocol.toLowerCase()?n.origin=null:(e=t.match(y),n.origin=e&&e[1])),n}),f.createObjectURL=function(t){var e,n=t.type;return null===n&&(n="application/octet-stream"),t instanceof r?(e="data:"+n,"base64"===t.encoding?e+";base64,"+t.data:"URI"===t.encoding?e+","+decodeURIComponent(t.data):p?e+";base64,"+p(t.data):e+","+encodeURIComponent(t.data)):h?h.call(l,t):void 0},f.revokeObjectURL=function(t){"data:"!==t.substring(0,5)&&d&&d.call(l,t)},i.append=function(t){var n=this.data;if(w&&(t instanceof g||t instanceof w)){for(var i="",o=new w(t),c=0,u=o.length;u>c;c++)i+=String.fromCharCode(o[c]);n.push(i)}else if("Blob"===e(t)||"File"===e(t)){if(!s)throw new a("NOT_READABLE_ERR");var l=new s;n.push(l.readAsBinaryString(t))}else t instanceof r?"base64"===t.encoding&&m?n.push(m(t.data)):"URI"===t.encoding?n.push(decodeURIComponent(t.data)):"raw"===t.encoding&&n.push(t.data):("string"!=typeof t&&(t+=""),n.push(unescape(encodeURIComponent(t))))},i.getBlob=function(t){return arguments.length||(t=null),new r(this.data.join(""),t,"raw")},i.toString=function(){return"[object BlobBuilder]"},o.slice=function(t,e,n){var i=arguments.length;return 3>i&&(n=null),new r(this.data.slice(t,i>1?e:this.data.length),n,this.encoding)},o.toString=function(){return"[object Blob]"},o.close=function(){this.size=0,delete this.data},n}(t);t.Blob=function(t,e){var r=e?e.type||"":"",i=new n;if(t)for(var o=0,s=t.length;s>o;o++)Uint8Array&&t[o]instanceof Uint8Array?i.append(t[o].buffer):i.append(t[o]);var a=i.getBlob(r);return!a.slice&&a.webkitSlice&&(a.slice=a.webkitSlice),a};var r=Object.getPrototypeOf||function(t){return t.__proto__};t.Blob.prototype=r(new t.Blob)}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content||this);var saveAs=saveAs||function(t){"use strict";if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var e=t.document,n=function(){return t.URL||t.webkitURL||t},r=e.createElementNS("http://www.w3.org/1999/xhtml","a"),i="download"in r,o=function(t){var e=new MouseEvent("click");t.dispatchEvent(e)},s=t.webkitRequestFileSystem,a=t.requestFileSystem||s||t.mozRequestFileSystem,c=function(e){(t.setImmediate||t.setTimeout)(function(){throw e},0)},u="application/octet-stream",l=0,h=500,d=function(e){var r=function(){"string"==typeof e?n().revokeObjectURL(e):e.remove()};t.chrome?r():setTimeout(r,h)},f=function(t,e,n){e=[].concat(e);for(var r=e.length;r--;){var i=t["on"+e[r]];if("function"==typeof i)try{i.call(t,n||t)}catch(o){c(o)}}},p=function(t){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(t.type)?new Blob(["\ufeff",t],{type:t.type}):t},m=function(e,c,h){h||(e=p(e));var m,g,w,y=this,v=e.type,b=!1,x=function(){f(y,"writestart progress write writeend".split(" "))},k=function(){if((b||!m)&&(m=n().createObjectURL(e)),g)g.location.href=m;else{var r=t.open(m,"_blank");void 0==r&&"undefined"!=typeof safari&&(t.location.href=m)}y.readyState=y.DONE,x(),d(m)},C=function(t){return function(){return y.readyState!==y.DONE?t.apply(this,arguments):void 0}},E={create:!0,exclusive:!1};return y.readyState=y.INIT,c||(c="download"),i?(m=n().createObjectURL(e),r.href=m,r.download=c,void setTimeout(function(){o(r),x(),d(m),y.readyState=y.DONE})):(t.chrome&&v&&v!==u&&(w=e.slice||e.webkitSlice,e=w.call(e,0,e.size,u),b=!0),s&&"download"!==c&&(c+=".download"),(v===u||s)&&(g=t),a?(l+=e.size,void a(t.TEMPORARY,l,C(function(t){t.root.getDirectory("saved",E,C(function(t){var n=function(){t.getFile(c,E,C(function(t){t.createWriter(C(function(n){n.onwriteend=function(e){g.location.href=t.toURL(),y.readyState=y.DONE,f(y,"writeend",e),d(t)},n.onerror=function(){var t=n.error;t.code!==t.ABORT_ERR&&k()},"writestart progress write abort".split(" ").forEach(function(t){n["on"+t]=y["on"+t]}),n.write(e),y.abort=function(){n.abort(),y.readyState=y.DONE},y.readyState=y.WRITING}),k)}),k)};t.getFile(c,{create:!1},C(function(t){t.remove(),n()}),C(function(t){t.code===t.NOT_FOUND_ERR?n():k()}))}),k)}),k)):void k())},g=m.prototype,w=function(t,e,n){return new m(t,e,n)};return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(t,e,n){return n||(t=p(t)),navigator.msSaveOrOpenBlob(t,e||"download")}:(g.abort=function(){var t=this;t.readyState=t.DONE,f(t,"abort")},g.readyState=g.INIT=0,g.WRITING=1,g.DONE=2,g.error=g.onwritestart=g.onprogress=g.onwrite=g.onabort=g.onerror=g.onwriteend=null,w)}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);"undefined"!=typeof module&&module.exports&&(module.exports.saveAs=saveAs),void function(t,e){"object"==typeof module?module.exports=e():t.adler32cs=e()}(jsPDF,function(){var t="function"==typeof ArrayBuffer&&"function"==typeof Uint8Array,e=null,n=function(){if(!t)return function(){return!1};try{var n=require("buffer");"function"==typeof n.Buffer&&(e=n.Buffer)}catch(r){}return function(t){return t instanceof ArrayBuffer||null!==e&&t instanceof e}}(),r=function(){return null!==e?function(t){return new e(t,"utf8").toString("binary")}:function(t){return unescape(encodeURIComponent(t))}}(),i=65521,o=function(t,e){for(var n=65535&t,r=t>>>16,o=0,s=e.length;s>o;o++)n=(n+(255&e.charCodeAt(o)))%i,r=(r+n)%i;return(r<<16|n)>>>0},s=function(t,e){for(var n=65535&t,r=t>>>16,o=0,s=e.length;s>o;o++)n=(n+e[o])%i,r=(r+n)%i;return(r<<16|n)>>>0},a={},c=a.Adler32=function(){var e=function(t){if(!(this instanceof e))throw new TypeError("Constructor cannot called be as a function.");if(!isFinite(t=null==t?1:+t))throw new Error("First arguments needs to be a finite number.");this.checksum=t>>>0},i=e.prototype={};return i.constructor=e,e.from=function(t){return t.prototype=i,t}(function(t){if(!(this instanceof e))throw new TypeError("Constructor cannot called be as a function.");if(null==t)throw new Error("First argument needs to be a string.");this.checksum=o(1,t.toString())}),e.fromUtf8=function(t){return t.prototype=i,t}(function(t){if(!(this instanceof e))throw new TypeError("Constructor cannot called be as a function.");if(null==t)throw new Error("First argument needs to be a string.");var n=r(t.toString());this.checksum=o(1,n)}),t&&(e.fromBuffer=function(t){return t.prototype=i,t}(function(t){if(!(this instanceof e))throw new TypeError("Constructor cannot called be as a function.");if(!n(t))throw new Error("First argument needs to be ArrayBuffer.");var r=new Uint8Array(t);return this.checksum=s(1,r)})),i.update=function(t){if(null==t)throw new Error("First argument needs to be a string.");return t=t.toString(),this.checksum=o(this.checksum,t)},i.updateUtf8=function(t){if(null==t)throw new Error("First argument needs to be a string.");var e=r(t.toString());return this.checksum=o(this.checksum,e)},t&&(i.updateBuffer=function(t){if(!n(t))throw new Error("First argument needs to be ArrayBuffer.");var e=new Uint8Array(t);return this.checksum=s(this.checksum,e)}),i.clone=function(){return new c(this.checksum)},e}();return a.from=function(t){if(null==t)throw new Error("First argument needs to be a string.");return o(1,t.toString())},a.fromUtf8=function(t){if(null==t)throw new Error("First argument needs to be a string.");var e=r(t.toString());return o(1,e)},t&&(a.fromBuffer=function(t){if(!n(t))throw new Error("First argument need to be ArrayBuffer.");var e=new Uint8Array(t);return s(1,e)}),a});var CssColors={};CssColors._colorsTable={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",honeydew:"#f0fff0",hotpink:"#ff69b4","indianred ":"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgrey:"#d3d3d3",lightgreen:"#90ee90",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370d8",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#d87093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"},CssColors.colorNameToHex=function(t){return t=t.toLowerCase(),"undefined"!=typeof this._colorsTable[t]?this._colorsTable[t]:!1};var Deflater=function(t){function e(){function t(t){var e,n,i,o,s,c,u=r.dyn_tree,l=r.stat_desc.static_tree,h=r.stat_desc.extra_bits,d=r.stat_desc.extra_base,p=r.stat_desc.max_length,m=0;for(o=0;a>=o;o++)t.bl_count[o]=0;for(u[2*t.heap[t.heap_max]+1]=0,e=t.heap_max+1;f>e;e++)n=t.heap[e],o=u[2*u[2*n+1]+1]+1,o>p&&(o=p,m++),u[2*n+1]=o,n>r.max_code||(t.bl_count[o]++,s=0,n>=d&&(s=h[n-d]),c=u[2*n],t.opt_len+=c*(o+s),l&&(t.static_len+=c*(l[2*n+1]+s)));if(0!==m){do{for(o=p-1;0===t.bl_count[o];)o--;t.bl_count[o]--,t.bl_count[o+1]+=2,t.bl_count[p]--,m-=2}while(m>0);for(o=p;0!==o;o--)for(n=t.bl_count[o];0!==n;)i=t.heap[--e],i>r.max_code||(u[2*i+1]!=o&&(t.opt_len+=(o-u[2*i+1])*u[2*i],u[2*i+1]=o),n--)}}function e(t,e){var n=0;do n|=1&t,t>>>=1,n<<=1;while(--e>0);return n>>>1}function n(t,n,r){var i,o,s,c=[],u=0;for(i=1;a>=i;i++)c[i]=u=u+r[i-1]<<1;for(o=0;n>=o;o++)s=t[2*o+1],0!==s&&(t[2*o]=e(c[s]++,s))}var r=this;r.build_tree=function(e){var i,o,s,a=r.dyn_tree,c=r.stat_desc.static_tree,u=r.stat_desc.elems,l=-1;for(e.heap_len=0,e.heap_max=f,i=0;u>i;i++)0!==a[2*i]?(e.heap[++e.heap_len]=l=i,e.depth[i]=0):a[2*i+1]=0;for(;e.heap_len<2;)s=e.heap[++e.heap_len]=2>l?++l:0,a[2*s]=1,e.depth[s]=0,e.opt_len--,c&&(e.static_len-=c[2*s+1]);for(r.max_code=l,i=Math.floor(e.heap_len/2);i>=1;i--)e.pqdownheap(a,i);s=u;do i=e.heap[1],e.heap[1]=e.heap[e.heap_len--],e.pqdownheap(a,1),o=e.heap[1],e.heap[--e.heap_max]=i,e.heap[--e.heap_max]=o,a[2*s]=a[2*i]+a[2*o],e.depth[s]=Math.max(e.depth[i],e.depth[o])+1,a[2*i+1]=a[2*o+1]=s,e.heap[1]=s++,e.pqdownheap(a,1);while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],t(e),n(a,r.max_code,e.bl_count)}}function n(t,e,n,r,i){var o=this;o.static_tree=t,o.extra_bits=e,o.extra_base=n,o.elems=r,o.max_length=i}function r(t,e,n,r,i){var o=this;o.good_length=t,o.max_lazy=e,o.nice_length=n,o.max_chain=r,o.func=i}function i(t,e,n,r){var i=t[2*e],o=t[2*n];return o>i||i==o&&r[e]<=r[n]}function o(){function t(){var t;for(Pt=2*Tt,Ot[Nt-1]=0,t=0;Nt-1>t;t++)Ot[t]=0;Xt=j[Yt].max_lazy,Qt=j[Yt].good_length,$t=j[Yt].nice_length,Gt=j[Yt].max_chain,Ut=0,Ft=0,Wt=0,Mt=Vt=tt-1,zt=0,Rt=0}function r(){var t;for(t=0;d>t;t++)Zt[2*t]=0;for(t=0;c>t;t++)Kt[2*t]=0;for(t=0;u>t;t++)te[2*t]=0;Zt[2*p]=1,ee.opt_len=ee.static_len=0,ae=ue=0}function o(){ne.dyn_tree=Zt,ne.stat_desc=n.static_l_desc,re.dyn_tree=Kt,re.stat_desc=n.static_d_desc,ie.dyn_tree=te,ie.stat_desc=n.static_bl_desc,he=0,de=0,le=8,r()}function s(t,e){var n,r,i=-1,o=t[1],s=0,a=7,c=4;for(0===o&&(a=138,c=3),t[2*(e+1)+1]=65535,n=0;e>=n;n++)r=o,o=t[2*(n+1)+1],++s<a&&r==o||(c>s?te[2*r]+=s:0!==r?(r!=i&&te[2*r]++,te[2*g]++):10>=s?te[2*w]++:te[2*y]++,s=0,i=r,0===o?(a=138,c=3):r==o?(a=6,c=3):(a=7,c=4))}function a(){var t;for(s(Zt,ne.max_code),s(Kt,re.max_code),ie.build_tree(ee),t=u-1;t>=3&&0===te[2*e.bl_order[t]+1];t--);return ee.opt_len+=3*(t+1)+5+5+4,t}function l(t){ee.pending_buf[ee.pending++]=t}function f(t){l(255&t),l(t>>>8&255)}function m(t){l(t>>8&255),l(255&t&255)}function N(t,e){var n,r=e;de>v-r?(n=t,he|=n<<de&65535,f(he),he=n>>>v-de,de+=r-v):(he|=t<<de&65535,de+=r)}function rt(t,e){var n=2*t;N(65535&e[n],65535&e[n+1])}function it(t,e){var n,r,i=-1,o=t[1],s=0,a=7,c=4;for(0===o&&(a=138,c=3),n=0;e>=n;n++)if(r=o,o=t[2*(n+1)+1],!(++s<a&&r==o)){if(c>s){do rt(r,te);while(0!==--s)}else 0!==r?(r!=i&&(rt(r,te),s--),rt(g,te),N(s-3,2)):10>=s?(rt(w,te),N(s-3,3)):(rt(y,te),N(s-11,7));s=0,i=r,0===o?(a=138,c=3):r==o?(a=6,c=3):(a=7,c=4)}}function ot(t,n,r){var i;for(N(t-257,5),N(n-1,5),N(r-4,4),i=0;r>i;i++)N(te[2*e.bl_order[i]+1],3);it(Zt,t-1),it(Kt,n-1)}function st(){16==de?(f(he),he=0,de=0):de>=8&&(l(255&he),he>>>=8,de-=8)}function at(){N(Z<<1,3),rt(p,n.static_ltree),st(),9>1+le+10-de&&(N(Z<<1,3),rt(p,n.static_ltree),st()),le=7}function ct(t,n){var r,i,o;if(ee.pending_buf[ce+2*ae]=t>>>8&255,ee.pending_buf[ce+2*ae+1]=255&t,ee.pending_buf[oe+ae]=255&n,ae++,0===t?Zt[2*n]++:(ue++,t--,Zt[2*(e._length_code[n]+h+1)]++,Kt[2*e.d_code(t)]++),0===(8191&ae)&&Yt>2){for(r=8*ae,i=Ut-Ft,o=0;c>o;o++)r+=Kt[2*o]*(5+e.extra_dbits[o]);if(r>>>=3,ue<Math.floor(ae/2)&&r<Math.floor(i/2))return!0}return ae==se-1}function ut(t,n){var r,i,o,s,a=0;if(0!==ae)do r=ee.pending_buf[ce+2*a]<<8&65280|255&ee.pending_buf[ce+2*a+1],i=255&ee.pending_buf[oe+a],a++,0===r?rt(i,t):(o=e._length_code[i],rt(o+h+1,t),s=e.extra_lbits[o],0!==s&&(i-=e.base_length[o],N(i,s)),r--,o=e.d_code(r),rt(o,n),s=e.extra_dbits[o],0!==s&&(r-=e.base_dist[o],N(r,s)));while(ae>a);rt(p,t),le=t[2*p+1]}function lt(){de>8?f(he):de>0&&l(255&he),he=0,de=0}function ht(t,e,n){lt(),le=8,n&&(f(e),f(~e)),ee.pending_buf.set(It.subarray(t,t+e),ee.pending),ee.pending+=e}function dt(t,e,n){N(($<<1)+(n?1:0),3),ht(t,e,!0)}function ft(t,e,i){var o,s,c=0;Yt>0?(ne.build_tree(ee),re.build_tree(ee),c=a(),o=ee.opt_len+3+7>>>3,s=ee.static_len+3+7>>>3,o>=s&&(o=s)):o=s=e+5,o>=e+4&&-1!=t?dt(t,e,i):s==o?(N((Z<<1)+(i?1:0),3),ut(n.static_ltree,n.static_dtree)):(N((K<<1)+(i?1:0),3),ot(ne.max_code+1,re.max_code+1,c+1),ut(Zt,Kt)),r(),i&&lt()}function pt(t){ft(Ft>=0?Ft:-1,Ut-Ft,t),Ft=Ut,xt.flush_pending()}function mt(){var t,e,n,r;do{if(r=Pt-Wt-Ut,0===r&&0===Ut&&0===Wt)r=Tt;else if(-1==r)r--;else if(Ut>=Tt+Tt-nt){It.set(It.subarray(Tt,Tt+Tt),0),Ht-=Tt,Ut-=Tt,Ft-=Tt,t=Nt,n=t;do e=65535&Ot[--n],Ot[n]=e>=Tt?e-Tt:0;while(0!==--t);t=Tt,n=t;do e=65535&At[--n],At[n]=e>=Tt?e-Tt:0;while(0!==--t);r+=Tt}if(0===xt.avail_in)return;t=xt.read_buf(It,Ut+Wt,r),Wt+=t,Wt>=tt&&(Rt=255&It[Ut],Rt=(Rt<<Lt^255&It[Ut+1])&Dt)}while(nt>Wt&&0!==xt.avail_in)}function gt(t){var e,n=65535;for(n>Ct-5&&(n=Ct-5);;){if(1>=Wt){if(mt(),0===Wt&&t==E)return U;if(0===Wt)break}if(Ut+=Wt,Wt=0,e=Ft+n,(0===Ut||Ut>=e)&&(Wt=Ut-e,Ut=e,pt(!1),0===xt.avail_out))return U;if(Ut-Ft>=Tt-nt&&(pt(!1),0===xt.avail_out))return U}return pt(t==_),0===xt.avail_out?t==_?W:U:t==_?V:H}function wt(t){var e,n,r=Gt,i=Ut,o=Vt,s=Ut>Tt-nt?Ut-(Tt-nt):0,a=$t,c=qt,u=Ut+et,l=It[i+o-1],h=It[i+o];Vt>=Qt&&(r>>=2),a>Wt&&(a=Wt);do if(e=t,It[e+o]==h&&It[e+o-1]==l&&It[e]==It[i]&&It[++e]==It[i+1]){i+=2,e++;do;while(It[++i]==It[++e]&&It[++i]==It[++e]&&It[++i]==It[++e]&&It[++i]==It[++e]&&It[++i]==It[++e]&&It[++i]==It[++e]&&It[++i]==It[++e]&&It[++i]==It[++e]&&u>i);if(n=et-(u-i),i=u-et,n>o){if(Ht=t,o=n,n>=a)break;l=It[i+o-1],h=It[i+o]}}while((t=65535&At[t&c])>s&&0!==--r);return Wt>=o?o:Wt}function yt(t){for(var e,n=0;;){if(nt>Wt){if(mt(),nt>Wt&&t==E)return U;if(0===Wt)break}if(Wt>=tt&&(Rt=(Rt<<Lt^255&It[Ut+(tt-1)])&Dt,n=65535&Ot[Rt],At[Ut&qt]=Ot[Rt],Ot[Rt]=Ut),0!==n&&Tt-nt>=(Ut-n&65535)&&Jt!=k&&(Mt=wt(n)),Mt>=tt)if(e=ct(Ut-Ht,Mt-tt),Wt-=Mt,Xt>=Mt&&Wt>=tt){Mt--;do Ut++,Rt=(Rt<<Lt^255&It[Ut+(tt-1)])&Dt,n=65535&Ot[Rt],At[Ut&qt]=Ot[Rt],Ot[Rt]=Ut;while(0!==--Mt);Ut++}else Ut+=Mt,Mt=0,Rt=255&It[Ut],Rt=(Rt<<Lt^255&It[Ut+1])&Dt;else e=ct(0,255&It[Ut]),Wt--,Ut++;if(e&&(pt(!1),0===xt.avail_out))return U}return pt(t==_),0===xt.avail_out?t==_?W:U:t==_?V:H}function vt(t){for(var e,n,r=0;;){if(nt>Wt){if(mt(),nt>Wt&&t==E)return U;if(0===Wt)break}if(Wt>=tt&&(Rt=(Rt<<Lt^255&It[Ut+(tt-1)])&Dt,r=65535&Ot[Rt],At[Ut&qt]=Ot[Rt],Ot[Rt]=Ut),Vt=Mt,jt=Ht,Mt=tt-1,0!==r&&Xt>Vt&&Tt-nt>=(Ut-r&65535)&&(Jt!=k&&(Mt=wt(r)),5>=Mt&&(Jt==x||Mt==tt&&Ut-Ht>4096)&&(Mt=tt-1)),Vt>=tt&&Vt>=Mt){n=Ut+Wt-tt,e=ct(Ut-1-jt,Vt-tt),Wt-=Vt-1,Vt-=2;do++Ut<=n&&(Rt=(Rt<<Lt^255&It[Ut+(tt-1)])&Dt,r=65535&Ot[Rt],At[Ut&qt]=Ot[Rt],Ot[Rt]=Ut);while(0!==--Vt);if(zt=0,Mt=tt-1,Ut++,e&&(pt(!1),0===xt.avail_out))return U}else if(0!==zt){if(e=ct(0,255&It[Ut-1]),e&&pt(!1),Ut++,Wt--,0===xt.avail_out)return U}else zt=1,Ut++,Wt--}return 0!==zt&&(e=ct(0,255&It[Ut-1]),zt=0),pt(t==_),0===xt.avail_out?t==_?W:U:t==_?V:H}function bt(e){return e.total_in=e.total_out=0,e.msg=null,ee.pending=0,ee.pending_out=0,kt=Y,St=E,o(),t(),q}var xt,kt,Ct,Et,St,Tt,_t,qt,It,Pt,At,Ot,Rt,Nt,Bt,Dt,Lt,Ft,Mt,jt,zt,Ut,Ht,Wt,Vt,Gt,Xt,Yt,Jt,Qt,$t,Zt,Kt,te,ee=this,ne=new e,re=new e,ie=new e;
ee.depth=[];var oe,se,ae,ce,ue,le,he,de;ee.bl_count=[],ee.heap=[],Zt=[],Kt=[],te=[],ee.pqdownheap=function(t,e){for(var n=ee.heap,r=n[e],o=e<<1;o<=ee.heap_len&&(o<ee.heap_len&&i(t,n[o+1],n[o],ee.depth)&&o++,!i(t,r,n[o],ee.depth));)n[e]=n[o],e=o,o<<=1;n[e]=r},ee.deflateInit=function(t,e,n,r,i,o){return r||(r=Q),i||(i=D),o||(o=C),t.msg=null,e==b&&(e=6),1>i||i>B||r!=Q||9>n||n>15||0>e||e>9||0>o||o>k?A:(t.dstate=ee,_t=n,Tt=1<<_t,qt=Tt-1,Bt=i+7,Nt=1<<Bt,Dt=Nt-1,Lt=Math.floor((Bt+tt-1)/tt),It=new Uint8Array(2*Tt),At=[],Ot=[],se=1<<i+6,ee.pending_buf=new Uint8Array(4*se),Ct=4*se,ce=Math.floor(se/2),oe=3*se,Yt=e,Jt=o,Et=255&r,bt(t))},ee.deflateEnd=function(){return kt!=X&&kt!=Y&&kt!=J?A:(ee.pending_buf=null,Ot=null,At=null,It=null,ee.dstate=null,kt==Y?O:q)},ee.deflateParams=function(t,e,n){var r=q;return e==b&&(e=6),0>e||e>9||0>n||n>k?A:(j[Yt].func!=j[e].func&&0!==t.total_in&&(r=t.deflate(S)),Yt!=e&&(Yt=e,Xt=j[Yt].max_lazy,Qt=j[Yt].good_length,$t=j[Yt].nice_length,Gt=j[Yt].max_chain),Jt=n,r)},ee.deflateSetDictionary=function(t,e,n){var r,i=n,o=0;if(!e||kt!=X)return A;if(tt>i)return q;for(i>Tt-nt&&(i=Tt-nt,o=n-i),It.set(e.subarray(o,o+i),0),Ut=i,Ft=i,Rt=255&It[0],Rt=(Rt<<Lt^255&It[1])&Dt,r=0;i-tt>=r;r++)Rt=(Rt<<Lt^255&It[r+(tt-1)])&Dt,At[r&qt]=Ot[Rt],Ot[Rt]=r;return q},ee.deflate=function(t,e){var n,r,i,o,s;if(e>_||0>e)return A;if(!t.next_out||!t.next_in&&0!==t.avail_in||kt==J&&e!=_)return t.msg=z[P-A],A;if(0===t.avail_out)return t.msg=z[P-R],R;if(xt=t,o=St,St=e,kt==X&&(r=Q+(_t-8<<4)<<8,i=(Yt-1&255)>>1,i>3&&(i=3),r|=i<<6,0!==Ut&&(r|=G),r+=31-r%31,kt=Y,m(r)),0!==ee.pending){if(xt.flush_pending(),0===xt.avail_out)return St=-1,q}else if(0===xt.avail_in&&o>=e&&e!=_)return xt.msg=z[P-R],R;if(kt==J&&0!==xt.avail_in)return t.msg=z[P-R],R;if(0!==xt.avail_in||0!==Wt||e!=E&&kt!=J){switch(s=-1,j[Yt].func){case L:s=gt(e);break;case F:s=yt(e);break;case M:s=vt(e)}if((s==W||s==V)&&(kt=J),s==U||s==W)return 0===xt.avail_out&&(St=-1),q;if(s==H){if(e==S)at();else if(dt(0,0,!1),e==T)for(n=0;Nt>n;n++)Ot[n]=0;if(xt.flush_pending(),0===xt.avail_out)return St=-1,q}}return e!=_?q:I}}function s(){var t=this;t.next_in_index=0,t.next_out_index=0,t.avail_in=0,t.total_in=0,t.avail_out=0,t.total_out=0}var a=15,c=30,u=19,l=29,h=256,d=h+1+l,f=2*d+1,p=256,m=7,g=16,w=17,y=18,v=16,b=-1,x=1,k=2,C=0,E=0,S=1,T=3,_=4,q=0,I=1,P=2,A=-2,O=-3,R=-5,N=[0,1,2,3,4,4,5,5,6,6,6,6,7,7,7,7,8,8,8,8,8,8,8,8,9,9,9,9,9,9,9,9,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,0,0,16,17,18,18,19,19,20,20,20,20,21,21,21,21,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29];e._length_code=[0,1,2,3,4,5,6,7,8,8,9,9,10,10,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,16,16,16,16,17,17,17,17,17,17,17,17,18,18,18,18,18,18,18,18,19,19,19,19,19,19,19,19,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28],e.base_length=[0,1,2,3,4,5,6,7,8,10,12,14,16,20,24,28,32,40,48,56,64,80,96,112,128,160,192,224,0],e.base_dist=[0,1,2,3,4,6,8,12,16,24,32,48,64,96,128,192,256,384,512,768,1024,1536,2048,3072,4096,6144,8192,12288,16384,24576],e.d_code=function(t){return 256>t?N[t]:N[256+(t>>>7)]},e.extra_lbits=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],e.extra_dbits=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],e.extra_blbits=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],e.bl_order=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],n.static_ltree=[12,8,140,8,76,8,204,8,44,8,172,8,108,8,236,8,28,8,156,8,92,8,220,8,60,8,188,8,124,8,252,8,2,8,130,8,66,8,194,8,34,8,162,8,98,8,226,8,18,8,146,8,82,8,210,8,50,8,178,8,114,8,242,8,10,8,138,8,74,8,202,8,42,8,170,8,106,8,234,8,26,8,154,8,90,8,218,8,58,8,186,8,122,8,250,8,6,8,134,8,70,8,198,8,38,8,166,8,102,8,230,8,22,8,150,8,86,8,214,8,54,8,182,8,118,8,246,8,14,8,142,8,78,8,206,8,46,8,174,8,110,8,238,8,30,8,158,8,94,8,222,8,62,8,190,8,126,8,254,8,1,8,129,8,65,8,193,8,33,8,161,8,97,8,225,8,17,8,145,8,81,8,209,8,49,8,177,8,113,8,241,8,9,8,137,8,73,8,201,8,41,8,169,8,105,8,233,8,25,8,153,8,89,8,217,8,57,8,185,8,121,8,249,8,5,8,133,8,69,8,197,8,37,8,165,8,101,8,229,8,21,8,149,8,85,8,213,8,53,8,181,8,117,8,245,8,13,8,141,8,77,8,205,8,45,8,173,8,109,8,237,8,29,8,157,8,93,8,221,8,61,8,189,8,125,8,253,8,19,9,275,9,147,9,403,9,83,9,339,9,211,9,467,9,51,9,307,9,179,9,435,9,115,9,371,9,243,9,499,9,11,9,267,9,139,9,395,9,75,9,331,9,203,9,459,9,43,9,299,9,171,9,427,9,107,9,363,9,235,9,491,9,27,9,283,9,155,9,411,9,91,9,347,9,219,9,475,9,59,9,315,9,187,9,443,9,123,9,379,9,251,9,507,9,7,9,263,9,135,9,391,9,71,9,327,9,199,9,455,9,39,9,295,9,167,9,423,9,103,9,359,9,231,9,487,9,23,9,279,9,151,9,407,9,87,9,343,9,215,9,471,9,55,9,311,9,183,9,439,9,119,9,375,9,247,9,503,9,15,9,271,9,143,9,399,9,79,9,335,9,207,9,463,9,47,9,303,9,175,9,431,9,111,9,367,9,239,9,495,9,31,9,287,9,159,9,415,9,95,9,351,9,223,9,479,9,63,9,319,9,191,9,447,9,127,9,383,9,255,9,511,9,0,7,64,7,32,7,96,7,16,7,80,7,48,7,112,7,8,7,72,7,40,7,104,7,24,7,88,7,56,7,120,7,4,7,68,7,36,7,100,7,20,7,84,7,52,7,116,7,3,8,131,8,67,8,195,8,35,8,163,8,99,8,227,8],n.static_dtree=[0,5,16,5,8,5,24,5,4,5,20,5,12,5,28,5,2,5,18,5,10,5,26,5,6,5,22,5,14,5,30,5,1,5,17,5,9,5,25,5,5,5,21,5,13,5,29,5,3,5,19,5,11,5,27,5,7,5,23,5],n.static_l_desc=new n(n.static_ltree,e.extra_lbits,h+1,d,a),n.static_d_desc=new n(n.static_dtree,e.extra_dbits,0,c,a),n.static_bl_desc=new n(null,e.extra_blbits,0,u,m);var B=9,D=8,L=0,F=1,M=2,j=[new r(0,0,0,0,L),new r(4,4,8,4,F),new r(4,5,16,8,F),new r(4,6,32,32,F),new r(4,4,16,16,M),new r(8,16,32,32,M),new r(8,16,128,128,M),new r(8,32,128,256,M),new r(32,128,258,1024,M),new r(32,258,258,4096,M)],z=["need dictionary","stream end","","","stream error","data error","","buffer error","",""],U=0,H=1,W=2,V=3,G=32,X=42,Y=113,J=666,Q=8,$=0,Z=1,K=2,tt=3,et=258,nt=et+tt+1;return s.prototype={deflateInit:function(t,e){var n=this;return n.dstate=new o,e||(e=a),n.dstate.deflateInit(n,t,e)},deflate:function(t){var e=this;return e.dstate?e.dstate.deflate(e,t):A},deflateEnd:function(){var t=this;if(!t.dstate)return A;var e=t.dstate.deflateEnd();return t.dstate=null,e},deflateParams:function(t,e){var n=this;return n.dstate?n.dstate.deflateParams(n,t,e):A},deflateSetDictionary:function(t,e){var n=this;return n.dstate?n.dstate.deflateSetDictionary(n,t,e):A},read_buf:function(t,e,n){var r=this,i=r.avail_in;return i>n&&(i=n),0===i?0:(r.avail_in-=i,t.set(r.next_in.subarray(r.next_in_index,r.next_in_index+i),e),r.next_in_index+=i,r.total_in+=i,i)},flush_pending:function(){var t=this,e=t.dstate.pending;e>t.avail_out&&(e=t.avail_out),0!==e&&(t.next_out.set(t.dstate.pending_buf.subarray(t.dstate.pending_out,t.dstate.pending_out+e),t.next_out_index),t.next_out_index+=e,t.dstate.pending_out+=e,t.total_out+=e,t.avail_out-=e,t.dstate.pending-=e,0===t.dstate.pending&&(t.dstate.pending_out=0))}},function(t){var e=this,n=new s,r=512,i=E,o=new Uint8Array(r);"undefined"==typeof t&&(t=b),n.deflateInit(t),n.next_out=o,e.append=function(t,e){var s,a,c=[],u=0,l=0,h=0;if(t.length){n.next_in_index=0,n.next_in=t,n.avail_in=t.length;do{if(n.next_out_index=0,n.avail_out=r,s=n.deflate(i),s!=q)throw"deflating: "+n.msg;n.next_out_index&&(n.next_out_index==r?c.push(new Uint8Array(o)):c.push(new Uint8Array(o.subarray(0,n.next_out_index)))),h+=n.next_out_index,e&&n.next_in_index>0&&n.next_in_index!=u&&(e(n.next_in_index),u=n.next_in_index)}while(n.avail_in>0||0===n.avail_out);return a=new Uint8Array(h),c.forEach(function(t){a.set(t,l),l+=t.length}),a}},e.flush=function(){var t,e,i=[],s=0,a=0;do{if(n.next_out_index=0,n.avail_out=r,t=n.deflate(_),t!=I&&t!=q)throw"deflating: "+n.msg;r-n.avail_out>0&&i.push(new Uint8Array(o.subarray(0,n.next_out_index))),a+=n.next_out_index}while(n.avail_in>0||0===n.avail_out);return n.deflateEnd(),e=new Uint8Array(a),i.forEach(function(t){e.set(t,s),s+=t.length}),e}}}(this);(function(t,e,n,r,i,o,s){function a(t,e,n,r){return p(t,t,n,r,e).then(function(i){A("Document cloned");var o="["+Wt+"='true']";t.querySelector(o).removeAttribute(Wt);var s=i.contentWindow,a=s.document.querySelector(o),u="function"==typeof e.onclone?Promise.resolve(e.onclone(s.document)):Promise.resolve(!0);return u.then(function(){return c(a,i,e,n,r)})})}function c(t,n,r,i,o){var s=n.contentWindow,a=new Nt(s.document),c=new I(r,a),f=M(t),p="view"===r.type?i:h(s.document),m="view"===r.type?o:d(s.document),g=new Ut(p,m,c,r,e),w=new z(t,g,a,c,r);return w.ready.then(function(){A("Finished rendering");var e;return e="view"===r.type?l(g.canvas,{width:g.canvas.width,height:g.canvas.height,top:0,left:0,x:0,y:0}):t===s.document.body||t===s.document.documentElement||null!=r.canvas?g.canvas:l(g.canvas,{width:null!=r.width?r.width:f.width,height:null!=r.height?r.height:f.height,top:f.top,left:f.left,x:s.pageXOffset,y:s.pageYOffset}),u(n,r),e})}function u(t,e){e.removeContainer&&(t.parentNode.removeChild(t),A("Cleaned up container"))}function l(t,n){var r=e.createElement("canvas"),i=Math.min(t.width-1,Math.max(0,n.left)),o=Math.min(t.width,Math.max(1,n.left+n.width)),s=Math.min(t.height-1,Math.max(0,n.top)),a=Math.min(t.height,Math.max(1,n.top+n.height));return r.width=n.width,r.height=n.height,A("Cropping canvas at:","left:",n.left,"top:",n.top,"width:",o-i,"height:",a-s),A("Resulting crop with width",n.width,"and height",n.height," with x",i,"and y",s),r.getContext("2d").drawImage(t,i,s,o-i,a-s,n.x,n.y,o-i,a-s),r}function h(t){return Math.max(Math.max(t.body.scrollWidth,t.documentElement.scrollWidth),Math.max(t.body.offsetWidth,t.documentElement.offsetWidth),Math.max(t.body.clientWidth,t.documentElement.clientWidth))}function d(t){return Math.max(Math.max(t.body.scrollHeight,t.documentElement.scrollHeight),Math.max(t.body.offsetHeight,t.documentElement.offsetHeight),Math.max(t.body.clientHeight,t.documentElement.clientHeight))}function f(){return"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}function p(t,e,n,r,i){y(t);var o=t.documentElement.cloneNode(!0),s=e.createElement("iframe");return s.className="html2canvas-container",s.style.visibility="hidden",s.style.position="fixed",s.style.left="-10000px",s.style.top="0px",s.style.border="0",s.width=n,s.height=r,s.scrolling="no",e.body.appendChild(s),new Promise(function(e){var n=s.contentWindow.document;s.contentWindow.onload=s.onload=function(){var o=setInterval(function(){n.body.childNodes.length>0&&(v(t,n),clearInterval(o),"view"===i.type&&s.contentWindow.scrollTo(r,a),e(s))},50)};var r=t.defaultView.pageXOffset,a=t.defaultView.pageYOffset;n.open(),n.write("<!DOCTYPE html><html></html>"),m(t,r,a),n.replaceChild(i.javascriptEnabled===!0?n.adoptNode(o):b(n.adoptNode(o)),n.documentElement),n.close()})}function m(t,e,n){(e!==t.defaultView.pageXOffset||n!==t.defaultView.pageYOffset)&&t.defaultView.scrollTo(e,n)}function g(e,n,r,i,o,s){return new St(e,n,t.document).then(w(e)).then(function(t){return p(t,r,i,o,s)})}function w(t){return function(n){var r,i=new DOMParser;try{r=i.parseFromString(n,"text/html")}catch(o){A("DOMParser not supported, falling back to createHTMLDocument"),r=e.implementation.createHTMLDocument("");try{r.open(),r.write(n),r.close()}catch(s){A("createHTMLDocument write not supported, falling back to document.body.innerHTML"),r.body.innerHTML=n}}var a=r.querySelector("base");if(!a||!a.href.host){var c=r.createElement("base");c.href=t,r.head.insertBefore(c,r.head.firstChild)}return r}}function y(t){[].slice.call(t.querySelectorAll("canvas"),0).forEach(function(t){t.setAttribute(Vt,"canvas-"+Gt++)})}function v(t,e){[].slice.call(t.querySelectorAll("["+Vt+"]"),0).forEach(function(t){try{var n=e.querySelector("["+Vt+'="'+t.getAttribute(Vt)+'"]');n&&(n.width=t.width,n.height=t.height,n.getContext("2d").putImageData(t.getContext("2d").getImageData(0,0,t.width,t.height),0,0))}catch(r){A("Unable to copy canvas content from",t,r)}t.removeAttribute(Vt)})}function b(t){return[].slice.call(t.childNodes,0).filter(x).forEach(function(e){"SCRIPT"===e.tagName?t.removeChild(e):b(e)}),t}function x(t){return t.nodeType===Node.ELEMENT_NODE}function k(t){var n=e.createElement("a");return n.href=t,n.href=n.href,n}function C(t){if(this.src=t,A("DummyImageContainer for",t),!this.promise||!this.image){A("Initiating DummyImageContainer"),C.prototype.image=new Image;var e=this.image;C.prototype.promise=new Promise(function(t,n){e.onload=t,e.onerror=n,e.src=f(),e.complete===!0&&t(e)})}}function E(t,n){var r,i,o=e.createElement("div"),s=e.createElement("img"),a=e.createElement("span"),c="Hidden Text";o.style.visibility="hidden",o.style.fontFamily=t,o.style.fontSize=n,o.style.margin=0,o.style.padding=0,e.body.appendChild(o),s.src=f(),s.width=1,s.height=1,s.style.margin=0,s.style.padding=0,s.style.verticalAlign="baseline",a.style.fontFamily=t,a.style.fontSize=n,a.style.margin=0,a.style.padding=0,a.appendChild(e.createTextNode(c)),o.appendChild(a),o.appendChild(s),r=s.offsetTop-a.offsetTop+1,o.removeChild(a),o.appendChild(e.createTextNode(c)),o.style.lineHeight="normal",s.style.verticalAlign="super",i=s.offsetTop-o.offsetTop+1,e.body.removeChild(o),this.baseline=r,this.lineWidth=1,this.middle=i}function S(){this.data={}}function T(t,e,n){this.image=null,this.src=t;var r=this,i=M(t);this.promise=(e?new Promise(function(e){"about:blank"===t.contentWindow.document.URL||null==t.contentWindow.document.documentElement?t.contentWindow.onload=t.onload=function(){e(t)}:e(t)}):this.proxyLoad(n.proxy,i,n)).then(function(t){return html2canvas(t.contentWindow.document.documentElement,{type:"view",width:t.width,height:t.height,proxy:n.proxy,javascriptEnabled:n.javascriptEnabled,removeContainer:n.removeContainer,allowTaint:n.allowTaint,imageTimeout:n.imageTimeout/2})}).then(function(t){return r.image=t})}function _(t){this.src=t.value,this.colorStops=[],this.type=null,this.x0=.5,this.y0=.5,this.x1=.5,this.y1=.5,this.promise=Promise.resolve(!0)}function q(t,e){this.src=t,this.image=new Image;var n=this;this.tainted=null,this.promise=new Promise(function(r,i){n.image.onload=r,n.image.onerror=i,e&&(n.image.crossOrigin="anonymous"),n.image.src=t,n.image.complete===!0&&r(n.image)})}function I(e,n){this.link=null,this.options=e,this.support=n,this.origin=this.getOrigin(t.location.href)}function P(t){_.apply(this,arguments),this.type=this.TYPES.LINEAR;var e=null===t.args[0].match(this.stepRegExp);e?t.args[0].split(" ").reverse().forEach(function(t){switch(t){case"left":this.x0=0,this.x1=1;break;case"top":this.y0=0,this.y1=1;break;case"right":this.x0=1,this.x1=0;break;case"bottom":this.y0=1,this.y1=0;break;case"to":var e=this.y0,n=this.x0;this.y0=this.y1,this.x0=this.x1,this.x1=n,this.y1=e}},this):(this.y0=0,this.y1=1),this.colorStops=t.args.slice(e?1:0).map(function(t){var e=t.match(this.stepRegExp);return{color:e[1],stop:"%"===e[3]?e[2]/100:null}},this),null===this.colorStops[0].stop&&(this.colorStops[0].stop=0),null===this.colorStops[this.colorStops.length-1].stop&&(this.colorStops[this.colorStops.length-1].stop=1),this.colorStops.forEach(function(t,e){null===t.stop&&this.colorStops.slice(e).some(function(n,r){return null!==n.stop?(t.stop=(n.stop-this.colorStops[e-1].stop)/(r+1)+this.colorStops[e-1].stop,!0):!1},this)},this)}function A(){t.html2canvas.logging&&t.console&&t.console.log&&Function.prototype.bind.call(t.console.log,t.console).apply(t.console,[Date.now()-t.html2canvas.start+"ms","html2canvas:"].concat([].slice.call(arguments,0)))}function O(t,e){this.node=t,this.parent=e,this.stack=null,this.bounds=null,this.borders=null,this.clip=[],this.backgroundClip=[],this.offsetBounds=null,this.visible=null,this.computedStyles=null,this.styles={},this.backgroundImages=null,this.transformData=null,this.transformMatrix=null,this.isPseudoElement=!1,this.opacity=null}function R(t){var e=t.options[t.selectedIndex||0];return e?e.text||"":""}function N(t){return t&&"matrix"===t[1]?t[2].split(",").map(function(t){return parseFloat(t.trim())}):void 0}function B(t){return-1!==t.toString().indexOf("%")}function D(t){var e,n,r,i,o,s,a,c=" \r\n	",u=[],l=0,h=0,d=function(){e&&('"'===n.substr(0,1)&&(n=n.substr(1,n.length-2)),n&&a.push(n),"-"===e.substr(0,1)&&(i=e.indexOf("-",1)+1)>0&&(r=e.substr(0,i),e=e.substr(i)),u.push({prefix:r,method:e.toLowerCase(),value:o,args:a,image:null})),a=[],e=r=n=o=""};return a=[],e=r=n=o="",t.split("").forEach(function(t){if(!(0===l&&c.indexOf(t)>-1)){switch(t){case'"':s?s===t&&(s=null):s=t;break;case"(":if(s)break;if(0===l)return l=1,void(o+=t);h++;break;case")":if(s)break;if(1===l){if(0===h)return l=0,o+=t,void d();h--}break;case",":if(s)break;if(0===l)return void d();if(1===l&&0===h&&!e.match(/^url$/i))return a.push(n),n="",void(o+=t)}o+=t,0===l?e+=t:n+=t}}),d(),u}function L(t){return t.replace("px","")}function F(t){return parseFloat(t)}function M(t){if(t.getBoundingClientRect){var e=t.getBoundingClientRect(),n=null==t.offsetWidth?e.width:t.offsetWidth;return{top:e.top,bottom:e.bottom||e.top+e.height,right:e.left+n,left:e.left,width:n,height:null==t.offsetHeight?e.height:t.offsetHeight}}return{}}function j(t){var e=t.offsetParent?j(t.offsetParent):{top:0,left:0};return{top:t.offsetTop+e.top,bottom:t.offsetTop+t.offsetHeight+e.top,right:t.offsetLeft+e.left+t.offsetWidth,left:t.offsetLeft+e.left,width:t.offsetWidth,height:t.offsetHeight}}function z(t,e,n,r,i){A("Starting NodeParser"),this.renderer=e,this.options=i,this.range=null,this.support=n,this.renderQueue=[],this.stack=new Rt(!0,1,t.ownerDocument,null);var o=new O(t,null);if(t===t.ownerDocument.documentElement){var s=new O(this.renderer.isTransparent(o.css("backgroundColor"))?t.ownerDocument.body:t.ownerDocument.documentElement,null);e.rectangle(0,0,e.width,e.height,s.css("backgroundColor"))}o.visibile=o.isElementVisible(),this.createPseudoHideStyles(t.ownerDocument),this.disableAnimations(t.ownerDocument),this.nodes=bt([o].concat(this.getChildren(o)).filter(function(t){return t.visible=t.isElementVisible()}).map(this.getPseudoElements,this)),this.fontMetrics=new S,A("Fetched nodes, total:",this.nodes.length),A("Calculate overflow clips"),this.calculateOverflowClips(),A("Start fetching images"),this.images=r.fetch(this.nodes.filter(ht)),this.ready=this.images.ready.then(gt(function(){return A("Images loaded, starting parsing"),A("Creating stacking contexts"),this.createStackingContexts(),A("Sorting stacking contexts"),this.sortStackingContexts(this.stack),this.parse(this.stack),A("Render queue created with "+this.renderQueue.length+" items"),new Promise(gt(function(t){i.async?"function"==typeof i.async?i.async.call(this,this.renderQueue,t):this.renderQueue.length>0?(this.renderIndex=0,this.asyncRenderer(this.renderQueue,t)):t():(this.renderQueue.forEach(this.paint,this),t())},this))},this))}function U(t){return t.parent&&t.parent.clip.length}function H(t){return t.replace(/(\-[a-z])/g,function(t){return t.toUpperCase().replace("-","")})}function W(){}function V(t,e,n,r){return t.map(function(i,o){if(i.width>0){var s=e.left,a=e.top,c=e.width,u=e.height-t[2].width;switch(o){case 0:u=t[0].width,i.args=J({c1:[s,a],c2:[s+c,a],c3:[s+c-t[1].width,a+u],c4:[s+t[3].width,a+u]},r[0],r[1],n.topLeftOuter,n.topLeftInner,n.topRightOuter,n.topRightInner);break;case 1:s=e.left+e.width-t[1].width,c=t[1].width,i.args=J({c1:[s+c,a],c2:[s+c,a+u+t[2].width],c3:[s,a+u],c4:[s,a+t[0].width]},r[1],r[2],n.topRightOuter,n.topRightInner,n.bottomRightOuter,n.bottomRightInner);break;case 2:a=a+e.height-t[2].width,u=t[2].width,i.args=J({c1:[s+c,a+u],c2:[s,a+u],c3:[s+t[3].width,a],c4:[s+c-t[3].width,a]},r[2],r[3],n.bottomRightOuter,n.bottomRightInner,n.bottomLeftOuter,n.bottomLeftInner);break;case 3:c=t[3].width,i.args=J({c1:[s,a+u+t[2].width],c2:[s,a],c3:[s+c,a+t[0].width],c4:[s+c,a+u]},r[3],r[0],n.bottomLeftOuter,n.bottomLeftInner,n.topLeftOuter,n.topLeftInner)}}return i})}function G(t,e,n,r){var i=4*((Math.sqrt(2)-1)/3),o=n*i,s=r*i,a=t+n,c=e+r;return{topLeft:Y({x:t,y:c},{x:t,y:c-s},{x:a-o,y:e},{x:a,y:e}),topRight:Y({x:t,y:e},{x:t+o,y:e},{x:a,y:c-s},{x:a,y:c}),bottomRight:Y({x:a,y:e},{x:a,y:e+s},{x:t+o,y:c},{x:t,y:c}),bottomLeft:Y({x:a,y:c},{x:a-o,y:c},{x:t,y:e+s},{x:t,y:e})}}function X(t,e,n){var r=t.left,i=t.top,o=t.width,s=t.height,a=e[0][0],c=e[0][1],u=e[1][0],l=e[1][1],h=e[2][0],d=e[2][1],f=e[3][0],p=e[3][1],m=o-u,g=s-d,w=o-h,y=s-p;return{topLeftOuter:G(r,i,a,c).topLeft.subdivide(.5),topLeftInner:G(r+n[3].width,i+n[0].width,Math.max(0,a-n[3].width),Math.max(0,c-n[0].width)).topLeft.subdivide(.5),topRightOuter:G(r+m,i,u,l).topRight.subdivide(.5),topRightInner:G(r+Math.min(m,o+n[3].width),i+n[0].width,m>o+n[3].width?0:u-n[3].width,l-n[0].width).topRight.subdivide(.5),bottomRightOuter:G(r+w,i+g,h,d).bottomRight.subdivide(.5),bottomRightInner:G(r+Math.min(w,o-n[3].width),i+Math.min(g,s+n[0].width),Math.max(0,h-n[1].width),d-n[2].width).bottomRight.subdivide(.5),bottomLeftOuter:G(r,i+y,f,p).bottomLeft.subdivide(.5),bottomLeftInner:G(r+n[3].width,i+y,Math.max(0,f-n[3].width),p-n[2].width).bottomLeft.subdivide(.5)}}function Y(t,e,n,r){var i=function(t,e,n){return{x:t.x+(e.x-t.x)*n,y:t.y+(e.y-t.y)*n}};return{start:t,startControl:e,endControl:n,end:r,subdivide:function(o){var s=i(t,e,o),a=i(e,n,o),c=i(n,r,o),u=i(s,a,o),l=i(a,c,o),h=i(u,l,o);return[Y(t,s,u,h),Y(h,l,c,r)]},curveTo:function(t){t.push(["bezierCurve",e.x,e.y,n.x,n.y,r.x,r.y])},curveToReversed:function(r){r.push(["bezierCurve",n.x,n.y,e.x,e.y,t.x,t.y])}}}function J(t,e,n,r,i,o,s){var a=[];return e[0]>0||e[1]>0?(a.push(["line",r[1].start.x,r[1].start.y]),r[1].curveTo(a)):a.push(["line",t.c1[0],t.c1[1]]),n[0]>0||n[1]>0?(a.push(["line",o[0].start.x,o[0].start.y]),o[0].curveTo(a),a.push(["line",s[0].end.x,s[0].end.y]),s[0].curveToReversed(a)):(a.push(["line",t.c2[0],t.c2[1]]),a.push(["line",t.c3[0],t.c3[1]])),e[0]>0||e[1]>0?(a.push(["line",i[1].end.x,i[1].end.y]),i[1].curveToReversed(a)):a.push(["line",t.c4[0],t.c4[1]]),a}function Q(t,e,n,r,i,o,s){e[0]>0||e[1]>0?(t.push(["line",r[0].start.x,r[0].start.y]),r[0].curveTo(t),r[1].curveTo(t)):t.push(["line",o,s]),(n[0]>0||n[1]>0)&&t.push(["line",i[0].start.x,i[0].start.y])}function $(t){return t.cssInt("zIndex")<0}function Z(t){return t.cssInt("zIndex")>0}function K(t){return 0===t.cssInt("zIndex")}function tt(t){return-1!==["inline","inline-block","inline-table"].indexOf(t.css("display"))}function et(t){return t instanceof Rt}function nt(t){return t.node.data.trim().length>0}function rt(t){return/^(normal|none|0px)$/.test(t.parent.css("letterSpacing"))}function it(t){return["TopLeft","TopRight","BottomRight","BottomLeft"].map(function(e){var n=t.css("border"+e+"Radius"),r=n.split(" ");return r.length<=1&&(r[1]=r[0]),r.map(wt)})}function ot(t){return t.nodeType===Node.TEXT_NODE||t.nodeType===Node.ELEMENT_NODE}function st(t){var e=t.css("position"),n=-1!==["absolute","relative","fixed"].indexOf(e)?t.css("zIndex"):"auto";return"auto"!==n}function at(t){return"static"!==t.css("position")}function ct(t){return"none"!==t.css("float")}function ut(t){return-1!==["inline-block","inline-table"].indexOf(t.css("display"))}function lt(t){var e=this;return function(){return!t.apply(e,arguments)}}function ht(t){return t.node.nodeType===Node.ELEMENT_NODE}function dt(t){return t.isPseudoElement===!0}function ft(t){return t.node.nodeType===Node.TEXT_NODE}function pt(t){return function(e,n){return e.cssInt("zIndex")+t.indexOf(e)/t.length-(n.cssInt("zIndex")+t.indexOf(n)/t.length)}}function mt(t){return t.getOpacity()<1}function gt(t,e){return function(){return t.apply(e,arguments)}}function wt(t){return parseInt(t,10)}function yt(t){return t.width}function vt(t){return t.node.nodeType!==Node.ELEMENT_NODE||-1===["SCRIPT","HEAD","TITLE","OBJECT","BR","OPTION"].indexOf(t.node.nodeName)}function bt(t){return[].concat.apply([],t)}function xt(t){var e=t.substr(0,1);return e===t.substr(t.length-1)&&e.match(/'|"/)?t.substr(1,t.length-2):t}function kt(e){for(var n,r=[],i=0,o=!1;e.length;)Ct(e[i])===o?(n=e.splice(0,i),n.length&&r.push(t.html2canvas.punycode.ucs2.encode(n)),o=!o,i=0):i++,i>=e.length&&(n=e.splice(0,i),n.length&&r.push(t.html2canvas.punycode.ucs2.encode(n)));return r}function Ct(t){return-1!==[32,13,10,9,45].indexOf(t)}function Et(t){return/[^\u0000-\u00ff]/.test(t)}function St(t,e,n){var r=qt(Yt),i=It(e,t,r);return Yt?zt(i):_t(n,i,r).then(function(t){return Dt(t.content)})}function Tt(t,e,n){var r=qt(Jt),i=It(e,t,r);return Jt?Promise.resolve(i):_t(n,i,r).then(function(t){return"data:"+t.type+";base64,"+t.content})}function _t(e,n,r){return new Promise(function(i,o){var s=e.createElement("script"),a=function(){delete t.html2canvas.proxy[r],e.body.removeChild(s)};t.html2canvas.proxy[r]=function(t){a(),i(t)},s.src=n,s.onerror=function(t){a(),o(t)},e.body.appendChild(s)})}function qt(t){return t?"":"html2canvas_"+Date.now()+"_"+ ++Xt+"_"+Math.round(1e5*Math.random())}function It(t,e,n){return t+"?url="+encodeURIComponent(e)+(n.length?"&callback=html2canvas.proxy."+n:"")}function Pt(t,n){var r=(e.createElement("script"),e.createElement("a"));r.href=t,t=r.href,this.src=t,this.image=new Image;var i=this;this.promise=new Promise(function(r,o){i.image.crossOrigin="Anonymous",i.image.onload=r,i.image.onerror=o,new Tt(t,n,e).then(function(t){i.image.src=t})["catch"](o)})}function At(t,e,n){O.call(this,t,e),this.isPseudoElement=!0,this.before=":before"===n}function Ot(t,e,n,r,i){this.width=t,this.height=e,this.images=n,this.options=r,this.document=i}function Rt(t,e,n,r){O.call(this,n,r),this.ownStacking=t,this.contexts=[],this.children=[],this.opacity=(this.parent?this.parent.stack.opacity:1)*e}function Nt(t){this.rangeBounds=this.testRangeBounds(t),this.cors=this.testCORS(),this.svg=this.testSVG()}function Bt(t){this.src=t,this.image=null;var e=this;this.promise=this.hasFabric().then(function(){return e.isInline(t)?Promise.resolve(e.inlineFormatting(t)):zt(t)}).then(function(t){return new Promise(function(n){html2canvas.fabric.loadSVGFromString(t,e.createCanvas.call(e,n))})})}function Dt(t){var e,n,r,i,o,s,a,c,u="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",l=t.length,h="";for(e=0;l>e;e+=4)n=u.indexOf(t[e]),r=u.indexOf(t[e+1]),i=u.indexOf(t[e+2]),o=u.indexOf(t[e+3]),s=n<<2|r>>4,a=(15&r)<<4|i>>2,c=(3&i)<<6|o,h+=64===i?String.fromCharCode(s):64===o||-1===o?String.fromCharCode(s,a):String.fromCharCode(s,a,c);return h}function Lt(t,e){this.src=t,this.image=null;var n=this;this.promise=e?new Promise(function(e,r){n.image=new Image,n.image.onload=e,n.image.onerror=r,n.image.src="data:image/svg+xml,"+(new XMLSerializer).serializeToString(t),n.image.complete===!0&&e(n.image)}):this.hasFabric().then(function(){return new Promise(function(e){html2canvas.fabric.parseSVGDocument(t,n.createCanvas.call(n,e))})})}function Ft(t,e){O.call(this,t,e)}function Mt(t,e,n){return t.length>0?e+n.toUpperCase():void 0}function jt(t){_.apply(this,arguments),this.type="linear"===t.args[0]?this.TYPES.LINEAR:this.TYPES.RADIAL}function zt(t){return new Promise(function(e,n){var r=new XMLHttpRequest;r.open("GET",t),r.onload=function(){200===r.status?e(r.responseText):n(new Error(r.statusText))},r.onerror=function(){n(new Error("Network Error"))},r.send()})}function Ut(t,e){Ot.apply(this,arguments),this.canvas=this.options.canvas||this.document.createElement("canvas"),this.options.canvas||(this.canvas.width=t,this.canvas.height=e),this.ctx=this.canvas.getContext("2d"),this.options.background&&this.rectangle(0,0,t,e,this.options.background),this.taintCtx=this.document.createElement("canvas").getContext("2d"),this.ctx.textBaseline="bottom",this.variables={},A("Initialized CanvasRenderer with size",t,"x",e)}function Ht(t){return t.length>0}if(!function(){var n,r,o,s;!function(){var t={},e={};n=function(e,n,r){t[e]={deps:n,callback:r}},s=o=r=function(n){function i(t){if("."!==t.charAt(0))return t;for(var e=t.split("/"),r=n.split("/").slice(0,-1),i=0,o=e.length;o>i;i++){var s=e[i];if(".."===s)r.pop();else{if("."===s)continue;r.push(s)}}return r.join("/")}if(s._eak_seen=t,e[n])return e[n];if(e[n]={},!t[n])throw new Error("Could not find module "+n);for(var o,a=t[n],c=a.deps,u=a.callback,l=[],h=0,d=c.length;d>h;h++)"exports"===c[h]?l.push(o={}):l.push(r(i(c[h])));var f=u.apply(this,l);return e[n]=o||f}}(),n("promise/all",["./utils","exports"],function(t,e){"use strict";function n(t){var e=this;if(!r(t))throw new TypeError("You must pass an array to all.");return new e(function(e,n){function r(t){return function(e){o(t,e)}}function o(t,n){a[t]=n,0===--c&&e(a)}var s,a=[],c=t.length;0===c&&e([]);for(var u=0;u<t.length;u++)s=t[u],s&&i(s.then)?s.then(r(u),n):o(u,s)})}var r=t.isArray,i=t.isFunction;e.all=n}),n("promise/asap",["exports"],function(n){"use strict";function r(){return function(){process.nextTick(a)}}function o(){var t=0,n=new h(a),r=e.createTextNode("");return n.observe(r,{characterData:!0}),function(){r.data=t=++t%2}}function s(){return function(){d.setTimeout(a,1)}}function a(){for(var t=0;t<f.length;t++){var e=f[t],n=e[0],r=e[1];n(r)}f=[]}function c(t,e){var n=f.push([t,e]);1===n&&u()}var u,l="undefined"!=typeof t?t:{},h=l.MutationObserver||l.WebKitMutationObserver,d="undefined"!=typeof i?i:this,f=[];u="undefined"!=typeof process&&"[object process]"==={}.toString.call(process)?r():h?o():s(),n.asap=c}),n("promise/cast",["exports"],function(t){"use strict";function e(t){if(t&&"object"==typeof t&&t.constructor===this)return t;var e=this;return new e(function(e){e(t)})}t.cast=e}),n("promise/config",["exports"],function(t){"use strict";function e(t,e){return 2!==arguments.length?n[t]:void(n[t]=e)}var n={instrument:!1};t.config=n,t.configure=e}),n("promise/polyfill",["./promise","./utils","exports"],function(e,n,r){"use strict";function i(){var e="Promise"in t&&"cast"in t.Promise&&"resolve"in t.Promise&&"reject"in t.Promise&&"all"in t.Promise&&"race"in t.Promise&&function(){var e;return new t.Promise(function(t){e=t}),s(e)}();e||(t.Promise=o)}var o=e.Promise,s=n.isFunction;r.polyfill=i}),n("promise/promise",["./config","./utils","./cast","./all","./race","./resolve","./reject","./asap","exports"],function(t,e,n,r,i,o,s,a,c){"use strict";function u(t){if(!k(t))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof u))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this._subscribers=[],l(t,this)}function l(t,e){
function n(t){m(e,t)}function r(t){w(e,t)}try{t(n,r)}catch(i){r(i)}}function h(t,e,n,r){var i,o,s,a,c=k(n);if(c)try{i=n(r),s=!0}catch(u){a=!0,o=u}else i=r,s=!0;p(e,i)||(c&&s?m(e,i):a?w(e,o):t===A?m(e,i):t===O&&w(e,i))}function d(t,e,n,r){var i=t._subscribers,o=i.length;i[o]=e,i[o+A]=n,i[o+O]=r}function f(t,e){for(var n,r,i=t._subscribers,o=t._detail,s=0;s<i.length;s+=3)n=i[s],r=i[s+e],h(e,n,r,o);t._subscribers=null}function p(t,e){var n,r=null;try{if(t===e)throw new TypeError("A promises callback cannot return that same promise.");if(x(e)&&(r=e.then,k(r)))return r.call(e,function(r){return n?!0:(n=!0,void(e!==r?m(t,r):g(t,r)))},function(e){return n?!0:(n=!0,void w(t,e))}),!0}catch(i){return n?!0:(w(t,i),!0)}return!1}function m(t,e){t===e?g(t,e):p(t,e)||g(t,e)}function g(t,e){t._state===I&&(t._state=P,t._detail=e,b.async(y,t))}function w(t,e){t._state===I&&(t._state=P,t._detail=e,b.async(v,t))}function y(t){f(t,t._state=A)}function v(t){f(t,t._state=O)}var b=t.config,x=(t.configure,e.objectOrFunction),k=e.isFunction,C=(e.now,n.cast),E=r.all,S=i.race,T=o.resolve,_=s.reject,q=a.asap;b.async=q;var I=void 0,P=0,A=1,O=2;u.prototype={constructor:u,_state:void 0,_detail:void 0,_subscribers:void 0,then:function(t,e){var n=this,r=new this.constructor(function(){});if(this._state){var i=arguments;b.async(function(){h(n._state,r,i[n._state-1],n._detail)})}else d(this,r,t,e);return r},"catch":function(t){return this.then(null,t)}},u.all=E,u.cast=C,u.race=S,u.resolve=T,u.reject=_,c.Promise=u}),n("promise/race",["./utils","exports"],function(t,e){"use strict";function n(t){var e=this;if(!r(t))throw new TypeError("You must pass an array to race.");return new e(function(e,n){for(var r,i=0;i<t.length;i++)r=t[i],r&&"function"==typeof r.then?r.then(e,n):e(r)})}var r=t.isArray;e.race=n}),n("promise/reject",["exports"],function(t){"use strict";function e(t){var e=this;return new e(function(e,n){n(t)})}t.reject=e}),n("promise/resolve",["exports"],function(t){"use strict";function e(t){var e=this;return new e(function(e){e(t)})}t.resolve=e}),n("promise/utils",["exports"],function(t){"use strict";function e(t){return n(t)||"object"==typeof t&&null!==t}function n(t){return"function"==typeof t}function r(t){return"[object Array]"===Object.prototype.toString.call(t)}var i=Date.now||function(){return(new Date).getTime()};t.objectOrFunction=e,t.isFunction=n,t.isArray=r,t.now=i}),r("promise/polyfill").polyfill()}(),"function"!=typeof Object.create||"function"!=typeof e.createElement("canvas").getContext)return void(t.html2canvas=function(){return Promise.reject("No canvas support")});!function(t){function e(t){throw RangeError(N[t])}function s(t,e){for(var n=t.length,r=[];n--;)r[n]=e(t[n]);return r}function a(t,e){var n=t.split("@"),r="";n.length>1&&(r=n[0]+"@",t=n[1]);var i=t.split(R),o=s(i,e).join(".");return r+o}function c(t){for(var e,n,r=[],i=0,o=t.length;o>i;)e=t.charCodeAt(i++),e>=55296&&56319>=e&&o>i?(n=t.charCodeAt(i++),56320==(64512&n)?r.push(((1023&e)<<10)+(1023&n)+65536):(r.push(e),i--)):r.push(e);return r}function u(t){return s(t,function(t){var e="";return t>65535&&(t-=65536,e+=L(t>>>10&1023|55296),t=56320|1023&t),e+=L(t)}).join("")}function l(t){return 10>t-48?t-22:26>t-65?t-65:26>t-97?t-97:C}function h(t,e){return t+22+75*(26>t)-((0!=e)<<5)}function d(t,e,n){var r=0;for(t=n?D(t/_):t>>1,t+=D(t/e);t>B*S>>1;r+=C)t=D(t/B);return D(r+(B+1)*t/(t+T))}function f(t){var n,r,i,o,s,a,c,h,f,p,m=[],g=t.length,w=0,y=I,v=q;for(r=t.lastIndexOf(P),0>r&&(r=0),i=0;r>i;++i)t.charCodeAt(i)>=128&&e("not-basic"),m.push(t.charCodeAt(i));for(o=r>0?r+1:0;g>o;){for(s=w,a=1,c=C;o>=g&&e("invalid-input"),h=l(t.charCodeAt(o++)),(h>=C||h>D((k-w)/a))&&e("overflow"),w+=h*a,f=v>=c?E:c>=v+S?S:c-v,!(f>h);c+=C)p=C-f,a>D(k/p)&&e("overflow"),a*=p;n=m.length+1,v=d(w-s,n,0==s),D(w/n)>k-y&&e("overflow"),y+=D(w/n),w%=n,m.splice(w++,0,y)}return u(m)}function p(t){var n,r,i,o,s,a,u,l,f,p,m,g,w,y,v,b=[];for(t=c(t),g=t.length,n=I,r=0,s=q,a=0;g>a;++a)m=t[a],128>m&&b.push(L(m));for(i=o=b.length,o&&b.push(P);g>i;){for(u=k,a=0;g>a;++a)m=t[a],m>=n&&u>m&&(u=m);for(w=i+1,u-n>D((k-r)/w)&&e("overflow"),r+=(u-n)*w,n=u,a=0;g>a;++a)if(m=t[a],n>m&&++r>k&&e("overflow"),m==n){for(l=r,f=C;p=s>=f?E:f>=s+S?S:f-s,!(p>l);f+=C)v=l-p,y=C-p,b.push(L(h(p+v%y,0))),l=D(v/y);b.push(L(h(l,0))),s=d(r,w,i==o),r=0,++i}++r,++n}return b.join("")}function m(t){return a(t,function(t){return A.test(t)?f(t.slice(4).toLowerCase()):t})}function g(t){return a(t,function(t){return O.test(t)?"xn--"+p(t):t})}var w="object"==typeof r&&r&&!r.nodeType&&r,y="object"==typeof n&&n&&!n.nodeType&&n,v="object"==typeof i&&i;(v.global===v||v.window===v||v.self===v)&&(t=v);var b,x,k=2147483647,C=36,E=1,S=26,T=38,_=700,q=72,I=128,P="-",A=/^xn--/,O=/[^\x20-\x7E]/,R=/[\x2E\u3002\uFF0E\uFF61]/g,N={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},B=C-E,D=Math.floor,L=String.fromCharCode;if(b={version:"1.3.1",ucs2:{decode:c,encode:u},decode:f,encode:p,toASCII:g,toUnicode:m},"function"==typeof o&&"object"==typeof o.amd&&o.amd)o("punycode",function(){return b});else if(w&&y)if(n.exports==w)y.exports=b;else for(x in b)b.hasOwnProperty(x)&&(w[x]=b[x]);else t.punycode=b}(this);var Wt="data-html2canvas-node",Vt="data-html2canvas-canvas-clone",Gt=0;t.html2canvas=function(n,r){if(r=r||{},r.logging&&(t.html2canvas.logging=!0,t.html2canvas.start=Date.now()),r.async="undefined"==typeof r.async?!0:r.async,r.allowTaint="undefined"==typeof r.allowTaint?!1:r.allowTaint,r.removeContainer="undefined"==typeof r.removeContainer?!0:r.removeContainer,r.javascriptEnabled="undefined"==typeof r.javascriptEnabled?!1:r.javascriptEnabled,r.imageTimeout="undefined"==typeof r.imageTimeout?1e4:r.imageTimeout,"string"==typeof n)return"string"!=typeof r.proxy?Promise.reject("Proxy must be used when rendering url"):g(k(n),r.proxy,e,t.innerWidth,t.innerHeight,r).then(function(e){return c(e.contentWindow.document.documentElement,e,r,t.innerWidth,t.innerHeight)});var i=(n===s?[e.documentElement]:n.length?n:[n])[0];return i.setAttribute(Wt,"true"),a(i.ownerDocument,r,i.ownerDocument.defaultView.innerWidth,i.ownerDocument.defaultView.innerHeight).then(function(t){return"function"==typeof r.onrendered&&(A("options.onrendered is deprecated, html2canvas returns a Promise containing the canvas"),r.onrendered(t)),t})},t.html2canvas.punycode=this.punycode,t.html2canvas.proxy={},S.prototype.getMetrics=function(t,e){return this.data[t+"-"+e]===s&&(this.data[t+"-"+e]=new E(t,e)),this.data[t+"-"+e]},T.prototype.proxyLoad=function(t,e,n){var r=this.src;return g(r.src,t,r.ownerDocument,e.width,e.height,n)},_.prototype.TYPES={LINEAR:1,RADIAL:2},I.prototype.findImages=function(t){var e=[];return t.reduce(function(t,e){switch(e.node.nodeName){case"IMG":return t.concat([{args:[e.node.src],method:"url"}]);case"svg":case"IFRAME":return t.concat([{args:[e.node],method:e.node.nodeName}])}return t},[]).forEach(this.addImage(e,this.loadImage),this),e},I.prototype.findBackgroundImage=function(t,e){return e.parseBackgroundImages().filter(this.hasImageBackground).forEach(this.addImage(t,this.loadImage),this),t},I.prototype.addImage=function(t,e){return function(n){n.args.forEach(function(r){this.imageExists(t,r)||(t.splice(0,0,e.call(this,n)),A("Added image #"+t.length,"string"==typeof r?r.substring(0,100):r))},this)}},I.prototype.hasImageBackground=function(t){return"none"!==t.method},I.prototype.loadImage=function(t){if("url"===t.method){var e=t.args[0];return!this.isSVG(e)||this.support.svg||this.options.allowTaint?e.match(/data:image\/.*;base64,/i)?new q(e.replace(/url\(['"]{0,}|['"]{0,}\)$/gi,""),!1):this.isSameOrigin(e)||this.options.allowTaint===!0||this.isSVG(e)?new q(e,!1):this.support.cors&&!this.options.allowTaint&&this.options.useCORS?new q(e,!0):this.options.proxy?new Pt(e,this.options.proxy):new C(e):new Bt(e)}return"linear-gradient"===t.method?new P(t):"gradient"===t.method?new jt(t):"svg"===t.method?new Lt(t.args[0],this.support.svg):"IFRAME"===t.method?new T(t.args[0],this.isSameOrigin(t.args[0].src),this.options):new C(t)},I.prototype.isSVG=function(t){return"svg"===t.substring(t.length-3).toLowerCase()||Bt.prototype.isInline(t)},I.prototype.imageExists=function(t,e){return t.some(function(t){return t.src===e})},I.prototype.isSameOrigin=function(t){return this.getOrigin(t)===this.origin},I.prototype.getOrigin=function(t){var n=this.link||(this.link=e.createElement("a"));return n.href=t,n.href=n.href,n.protocol+n.hostname+n.port},I.prototype.getPromise=function(t){return this.timeout(t,this.options.imageTimeout)["catch"](function(){var e=new C(t.src);return e.promise.then(function(e){t.image=e})})},I.prototype.get=function(t){var e=null;return this.images.some(function(n){return(e=n).src===t})?e:null},I.prototype.fetch=function(t){return this.images=t.reduce(gt(this.findBackgroundImage,this),this.findImages(t)),this.images.forEach(function(t,e){t.promise.then(function(){A("Succesfully loaded image #"+(e+1),t)},function(n){A("Failed loading image #"+(e+1),t,n)})}),this.ready=Promise.all(this.images.map(this.getPromise,this)),A("Finished searching images"),this},I.prototype.timeout=function(t,e){var n;return Promise.race([t.promise,new Promise(function(r,i){n=setTimeout(function(){A("Timed out loading image",t),i(t)},e)})]).then(function(t){return clearTimeout(n),t})},P.prototype=Object.create(_.prototype),P.prototype.stepRegExp=/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/,O.prototype.cloneTo=function(t){t.visible=this.visible,t.borders=this.borders,t.bounds=this.bounds,t.clip=this.clip,t.backgroundClip=this.backgroundClip,t.computedStyles=this.computedStyles,t.styles=this.styles,t.backgroundImages=this.backgroundImages,t.opacity=this.opacity},O.prototype.getOpacity=function(){return null===this.opacity?this.opacity=this.cssFloat("opacity"):this.opacity},O.prototype.assignStack=function(t){this.stack=t,t.children.push(this)},O.prototype.isElementVisible=function(){return this.node.nodeType===Node.TEXT_NODE?this.parent.visible:"none"!==this.css("display")&&"hidden"!==this.css("visibility")&&!this.node.hasAttribute("data-html2canvas-ignore")&&("INPUT"!==this.node.nodeName||"hidden"!==this.node.getAttribute("type"))},O.prototype.css=function(t){return this.computedStyles||(this.computedStyles=this.isPseudoElement?this.parent.computedStyle(this.before?":before":":after"):this.computedStyle(null)),this.styles[t]||(this.styles[t]=this.computedStyles[t])},O.prototype.prefixedCss=function(t){var e=["webkit","moz","ms","o"],n=this.css(t);return n===s&&e.some(function(e){return n=this.css(e+t.substr(0,1).toUpperCase()+t.substr(1)),n!==s},this),n===s?null:n},O.prototype.computedStyle=function(t){return this.node.ownerDocument.defaultView.getComputedStyle(this.node,t)},O.prototype.cssInt=function(t){var e=parseInt(this.css(t),10);return isNaN(e)?0:e},O.prototype.cssFloat=function(t){var e=parseFloat(this.css(t));return isNaN(e)?0:e},O.prototype.fontWeight=function(){var t=this.css("fontWeight");switch(parseInt(t,10)){case 401:t="bold";break;case 400:t="normal"}return t},O.prototype.parseClip=function(){var t=this.css("clip").match(this.CLIP);return t?{top:parseInt(t[1],10),right:parseInt(t[2],10),bottom:parseInt(t[3],10),left:parseInt(t[4],10)}:null},O.prototype.parseBackgroundImages=function(){return this.backgroundImages||(this.backgroundImages=D(this.css("backgroundImage")))},O.prototype.cssList=function(t,e){var n=(this.css(t)||"").split(",");return n=n[e||0]||n[0]||"auto",n=n.trim().split(" "),1===n.length&&(n=[n[0],n[0]]),n},O.prototype.parseBackgroundSize=function(t,e,n){var r,i,o=this.cssList("backgroundSize",n);if(B(o[0]))r=t.width*parseFloat(o[0])/100;else{if(/contain|cover/.test(o[0])){var s=t.width/t.height,a=e.width/e.height;return a>s^"contain"===o[0]?{width:t.height*a,height:t.height}:{width:t.width,height:t.width/a}}r=parseInt(o[0],10)}return i="auto"===o[0]&&"auto"===o[1]?e.height:"auto"===o[1]?r/e.width*e.height:B(o[1])?t.height*parseFloat(o[1])/100:parseInt(o[1],10),"auto"===o[0]&&(r=i/e.height*e.width),{width:r,height:i}},O.prototype.parseBackgroundPosition=function(t,e,n,r){var i,o,s=this.cssList("backgroundPosition",n);return i=B(s[0])?(t.width-(r||e).width)*(parseFloat(s[0])/100):parseInt(s[0],10),o="auto"===s[1]?i/e.width*e.height:B(s[1])?(t.height-(r||e).height)*parseFloat(s[1])/100:parseInt(s[1],10),"auto"===s[0]&&(i=o/e.height*e.width),{left:i,top:o}},O.prototype.parseBackgroundRepeat=function(t){return this.cssList("backgroundRepeat",t)[0]},O.prototype.parseTextShadows=function(){var t=this.css("textShadow"),e=[];if(t&&"none"!==t)for(var n=t.match(this.TEXT_SHADOW_PROPERTY),r=0;n&&r<n.length;r++){var i=n[r].match(this.TEXT_SHADOW_VALUES);e.push({color:i[0],offsetX:i[1]?parseFloat(i[1].replace("px","")):0,offsetY:i[2]?parseFloat(i[2].replace("px","")):0,blur:i[3]?i[3].replace("px",""):0})}return e},O.prototype.parseTransform=function(){if(!this.transformData)if(this.hasTransform()){var t=this.parseBounds(),e=this.prefixedCss("transformOrigin").split(" ").map(L).map(F);e[0]+=t.left,e[1]+=t.top,this.transformData={origin:e,matrix:this.parseTransformMatrix()}}else this.transformData={origin:[0,0],matrix:[1,0,0,1,0,0]};return this.transformData},O.prototype.parseTransformMatrix=function(){if(!this.transformMatrix){var t=this.prefixedCss("transform"),e=t?N(t.match(this.MATRIX_PROPERTY)):null;this.transformMatrix=e?e:[1,0,0,1,0,0]}return this.transformMatrix},O.prototype.parseBounds=function(){return this.bounds||(this.bounds=this.hasTransform()?j(this.node):M(this.node))},O.prototype.hasTransform=function(){return"1,0,0,1,0,0"!==this.parseTransformMatrix().join(",")||this.parent&&this.parent.hasTransform()},O.prototype.getValue=function(){var t=this.node.value||"";return t="SELECT"===this.node.tagName?R(this.node):t,0===t.length?this.node.placeholder||"":t},O.prototype.MATRIX_PROPERTY=/(matrix)\((.+)\)/,O.prototype.TEXT_SHADOW_PROPERTY=/((rgba|rgb)\([^\)]+\)(\s-?\d+px){0,})/g,O.prototype.TEXT_SHADOW_VALUES=/(-?\d+px)|(#.+)|(rgb\(.+\))|(rgba\(.+\))/g,O.prototype.CLIP=/^rect\((\d+)px,? (\d+)px,? (\d+)px,? (\d+)px\)$/,z.prototype.calculateOverflowClips=function(){this.nodes.forEach(function(t){if(ht(t)){dt(t)&&t.appendToDOM(),t.borders=this.parseBorders(t);var e="hidden"===t.css("overflow")?[t.borders.clip]:[],n=t.parseClip();n&&-1!==["absolute","fixed"].indexOf(t.css("position"))&&e.push([["rect",t.bounds.left+n.left,t.bounds.top+n.top,n.right-n.left,n.bottom-n.top]]),t.clip=U(t)?t.parent.clip.concat(e):e,t.backgroundClip="hidden"!==t.css("overflow")?t.clip.concat([t.borders.clip]):t.clip,dt(t)&&t.cleanDOM()}else ft(t)&&(t.clip=U(t)?t.parent.clip:[]);dt(t)||(t.bounds=null)},this)},z.prototype.asyncRenderer=function(t,e,n){n=n||Date.now(),this.paint(t[this.renderIndex++]),t.length===this.renderIndex?e():n+20>Date.now()?this.asyncRenderer(t,e,n):setTimeout(gt(function(){this.asyncRenderer(t,e)},this),0)},z.prototype.createPseudoHideStyles=function(t){this.createStyles(t,"."+At.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE+':before { content: "" !important; display: none !important; }.'+At.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER+':after { content: "" !important; display: none !important; }')},z.prototype.disableAnimations=function(t){this.createStyles(t,"* { -webkit-animation: none !important; -moz-animation: none !important; -o-animation: none !important; animation: none !important; -webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; transition: none !important;}")},z.prototype.createStyles=function(t,e){var n=t.createElement("style");n.innerHTML=e,t.body.appendChild(n)},z.prototype.getPseudoElements=function(t){var e=[[t]];if(t.node.nodeType===Node.ELEMENT_NODE){var n=this.getPseudoElement(t,":before"),r=this.getPseudoElement(t,":after");n&&e.push(n),r&&e.push(r)}return bt(e)},z.prototype.getPseudoElement=function(t,n){var r=t.computedStyle(n);if(!r||!r.content||"none"===r.content||"-moz-alt-content"===r.content||"none"===r.display)return null;for(var i=xt(r.content),o="url"===i.substr(0,3),s=e.createElement(o?"img":"html2canvaspseudoelement"),a=new At(s,t,n),c=r.length-1;c>=0;c--){var u=H(r.item(c));s.style[u]=r[u]}if(s.className=At.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE+" "+At.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER,o)return s.src=D(i)[0].args[0],[a];var l=e.createTextNode(i);return s.appendChild(l),[a,new Ft(l,a)]},z.prototype.getChildren=function(t){return bt([].filter.call(t.node.childNodes,ot).map(function(e){var n=[e.nodeType===Node.TEXT_NODE?new Ft(e,t):new O(e,t)].filter(vt);return e.nodeType===Node.ELEMENT_NODE&&n.length&&"TEXTAREA"!==e.tagName?n[0].isElementVisible()?n.concat(this.getChildren(n[0])):[]:n},this))},z.prototype.newStackingContext=function(t,e){var n=new Rt(e,t.getOpacity(),t.node,t.parent);t.cloneTo(n);var r=e?n.getParentStack(this):n.parent.stack;r.contexts.push(n),t.stack=n},z.prototype.createStackingContexts=function(){this.nodes.forEach(function(t){ht(t)&&(this.isRootElement(t)||mt(t)||st(t)||this.isBodyWithTransparentRoot(t)||t.hasTransform())?this.newStackingContext(t,!0):ht(t)&&(at(t)&&K(t)||ut(t)||ct(t))?this.newStackingContext(t,!1):t.assignStack(t.parent.stack)},this)},z.prototype.isBodyWithTransparentRoot=function(t){return"BODY"===t.node.nodeName&&this.renderer.isTransparent(t.parent.css("backgroundColor"))},z.prototype.isRootElement=function(t){return null===t.parent},z.prototype.sortStackingContexts=function(t){t.contexts.sort(pt(t.contexts.slice(0))),t.contexts.forEach(this.sortStackingContexts,this)},z.prototype.parseTextBounds=function(t){return function(e,n,r){if("none"!==t.parent.css("textDecoration").substr(0,4)||0!==e.trim().length){if(this.support.rangeBounds&&!t.parent.hasTransform()){var i=r.slice(0,n).join("").length;return this.getRangeBounds(t.node,i,e.length)}if(t.node&&"string"==typeof t.node.data){var o=t.node.splitText(e.length),s=this.getWrapperBounds(t.node,t.parent.hasTransform());return t.node=o,s}}else(!this.support.rangeBounds||t.parent.hasTransform())&&(t.node=t.node.splitText(e.length));return{}}},z.prototype.getWrapperBounds=function(t,e){var n=t.ownerDocument.createElement("html2canvaswrapper"),r=t.parentNode,i=t.cloneNode(!0);n.appendChild(t.cloneNode(!0)),r.replaceChild(n,t);var o=e?j(n):M(n);return r.replaceChild(i,n),o},z.prototype.getRangeBounds=function(t,e,n){var r=this.range||(this.range=t.ownerDocument.createRange());return r.setStart(t,e),r.setEnd(t,e+n),r.getBoundingClientRect()},z.prototype.parse=function(t){var e=t.contexts.filter($),n=t.children.filter(ht),r=n.filter(lt(ct)),i=r.filter(lt(at)).filter(lt(tt)),o=n.filter(lt(at)).filter(ct),s=r.filter(lt(at)).filter(tt),a=t.contexts.concat(r.filter(at)).filter(K),c=t.children.filter(ft).filter(nt),u=t.contexts.filter(Z);e.concat(i).concat(o).concat(s).concat(a).concat(c).concat(u).forEach(function(t){this.renderQueue.push(t),et(t)&&(this.parse(t),this.renderQueue.push(new W))},this)},z.prototype.paint=function(t){try{t instanceof W?this.renderer.ctx.restore():ft(t)?(dt(t.parent)&&t.parent.appendToDOM(),this.paintText(t),dt(t.parent)&&t.parent.cleanDOM()):this.paintNode(t)}catch(e){A(e)}},z.prototype.paintNode=function(t){if(et(t)&&(this.renderer.setOpacity(t.opacity),this.renderer.ctx.save(),t.hasTransform()&&this.renderer.setTransform(t.parseTransform())),"INPUT"===t.node.nodeName&&"checkbox"===t.node.type)this.paintCheckbox(t);else if("INPUT"===t.node.nodeName&&"radio"===t.node.type)this.paintRadio(t);else{if("always"===t.css("page-break-before")){var e=this.options.canvas.getContext("2d");"function"==typeof e._pageBreakAt&&e._pageBreakAt(t.node.offsetTop)}this.paintElement(t)}if(t.node.getAttribute){var n=t.node.getAttribute("name");if(null===n)var n=t.node.getAttribute("id");if(null!==n){var r=this.options.canvas.annotations;r&&r.setName(n,t.bounds)}}},z.prototype.paintElement=function(t){var e=t.parseBounds();this.renderer.clip(t.backgroundClip,function(){this.renderer.renderBackground(t,e,t.borders.borders.map(yt))},this),this.renderer.clip(t.clip,function(){this.renderer.renderBorders(t.borders.borders)},this),this.renderer.clip(t.backgroundClip,function(){switch(t.node.nodeName){case"svg":case"IFRAME":var n=this.images.get(t.node);n?this.renderer.renderImage(t,e,t.borders,n):A("Error loading <"+t.node.nodeName+">",t.node);break;case"IMG":var r=this.images.get(t.node.src);r?this.renderer.renderImage(t,e,t.borders,r):A("Error loading <img>",t.node.src);break;case"CANVAS":this.renderer.renderImage(t,e,t.borders,{image:t.node});break;case"SELECT":case"INPUT":case"TEXTAREA":this.paintFormValue(t)}},this)},z.prototype.paintCheckbox=function(t){var e=t.parseBounds(),n=Math.min(e.width,e.height),r={width:n-1,height:n-1,top:e.top,left:e.left},i=[3,3],o=[i,i,i,i],s=[1,1,1,1].map(function(t){return{color:"#A5A5A5",width:t}}),a=X(r,o,s);this.renderer.clip(t.backgroundClip,function(){this.renderer.rectangle(r.left+1,r.top+1,r.width-2,r.height-2,"#DEDEDE"),this.renderer.renderBorders(V(s,r,a,o)),t.node.checked&&(this.renderer.font("#424242","normal","normal","bold",n-3+"px","arial"),this.renderer.text("✔",r.left+n/6,r.top+n-1))},this)},z.prototype.paintRadio=function(t){var e=t.parseBounds(),n=Math.min(e.width,e.height)-2;this.renderer.clip(t.backgroundClip,function(){this.renderer.circleStroke(e.left+1,e.top+1,n,"#DEDEDE",1,"#A5A5A5"),t.node.checked&&this.renderer.circle(Math.ceil(e.left+n/4)+1,Math.ceil(e.top+n/4)+1,Math.floor(n/2),"#424242")},this)},z.prototype.paintFormValue=function(t){if(t.getValue().length>0){var e=t.node.ownerDocument,n=e.createElement("html2canvaswrapper"),r=["lineHeight","textAlign","fontFamily","fontWeight","fontSize","color","paddingLeft","paddingTop","paddingRight","paddingBottom","width","height","borderLeftStyle","borderTopStyle","borderLeftWidth","borderTopWidth","boxSizing","whiteSpace","wordWrap"];r.forEach(function(e){try{n.style[e]=t.css(e)}catch(r){A("html2canvas: Parse: Exception caught in renderFormValue: "+r.message)}});var i=t.parseBounds();n.style.position="fixed",n.style.left=i.left+"px",n.style.top=i.top+"px",n.textContent=t.getValue(),e.body.appendChild(n),this.paintText(new Ft(n.firstChild,t)),e.body.removeChild(n)}},z.prototype.paintText=function(e){e.applyTextTransform();var n=t.html2canvas.punycode.ucs2.decode(e.node.data),r=this.options.letterRendering&&!rt(e)||Et(e.node.data)?n.map(function(e){return t.html2canvas.punycode.ucs2.encode([e])}):kt(n),i=e.parent.fontWeight(),o=e.parent.css("fontSize"),a=e.parent.css("fontFamily"),c=e.parent.parseTextShadows();this.renderer.font(e.parent.css("color"),e.parent.css("fontStyle"),e.parent.css("fontVariant"),i,o,a),c.length?this.renderer.fontShadow(c[0].color,c[0].offsetX,c[0].offsetY,c[0].blur):this.renderer.clearShadow(),this.renderer.clip(e.parent.clip,function(){r.map(this.parseTextBounds(e),this).forEach(function(t,n){t&&(t.left===s&&(t.left=0),t.bottom===s&&(t.bottom=0),this.renderer.text(r[n],t.left,t.bottom),this.renderTextDecoration(e.parent,t,this.fontMetrics.getMetrics(a,o)),0==n&&"LI"===e.parent.node.nodeName&&this.renderBullet(e,t),0==n&&this.renderAnnotation(e.parent,t))},this)},this)},z.prototype.generateListNumber={listAlpha:function(t){var e,n="";do e=t%26,n=String.fromCharCode(e+64)+n,t/=26;while(26*t>26);return n},listRoman:function(t){var e,n=["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"],r=[1e3,900,500,400,100,90,50,40,10,9,5,4,1],i="",o=n.length;if(0>=t||t>=4e3)return t;for(e=0;o>e;e+=1)for(;t>=r[e];)t-=r[e],i+=n[e];return i}},z.prototype.listItemText=function(t,e){switch(t){case"decimal-leading-zero":text=1===e.toString().length?e="0"+e.toString():e.toString();break;case"upper-roman":text=this.generateListNumber.listRoman(e);break;case"lower-roman":text=this.generateListNumber.listRoman(e).toLowerCase();break;case"lower-alpha":text=this.generateListNumber.listAlpha(e).toLowerCase();break;case"upper-alpha":text=this.generateListNumber.listAlpha(e);break;case"decimal":default:text=e}return text},z.prototype.renderBullet=function(t,e){var n=t.parent.css("listStyleType");if("none"!==n){var r=e.top+(e.bottom-e.top)/2,i=this.renderer.canvas.getContext("2d"),o=i.measureText("M").width,s=o/4,a=.75*o,c=e.left-a;switch(n){case"decimal":case"decimal-leading-zero":case"upper-alpha":case"lower-alpha":case"upper-roman":case"lower-roman":var u=t.parent,l=u.parent,h=Array.prototype.slice.call(l.node.children),d=h.indexOf(u.node)+1,f=this.listItemText(n,d);f+=".";var p=e.left-a;p-=i.measureText(f).width,i.fillText(f,p,e.bottom);break;case"square":var s=o/3;c-=s,r-=s/2,i.fillRect(c,r,s,s);break;case"circle":var s=o/6;c-=s,i.beginPath(),i.arc(c,r,s,0,2*Math.PI),i.closePath(),i.stroke();break;case"disc":default:var s=o/6;c-=s,i.beginPath(),i.arc(c,r,s,0,2*Math.PI),i.closePath(),i.fill()}}},z.prototype.renderTextDecoration=function(t,e,n){switch(t.css("textDecoration").split(" ")[0]){case"underline":this.renderer.rectangle(e.left,Math.round(e.top+n.baseline+n.lineWidth),e.width,1,t.css("color"));break;case"overline":this.renderer.rectangle(e.left,Math.round(e.top),e.width,1,t.css("color"));break;case"line-through":this.renderer.rectangle(e.left,Math.ceil(e.top+n.middle+n.lineWidth),e.width,1,t.css("color"))}},z.prototype.renderAnnotation=function(t,e){if("A"===t.node.nodeName){var n=t.node.getAttribute("href");if(n){var r=this.options.canvas.annotations;r&&r.createAnnotation(n,t.bounds)}}},z.prototype.parseBorders=function(t){var e=t.parseBounds(),n=it(t),r=["Top","Right","Bottom","Left"].map(function(e){return{width:t.cssInt("border"+e+"Width"),color:t.css("border"+e+"Color"),args:null}}),i=X(e,n,r);return{clip:this.parseBackgroundClip(t,i,r,n,e),borders:V(r,e,i,n)}},z.prototype.parseBackgroundClip=function(t,e,n,r,i){var o=t.css("backgroundClip"),s=[];switch(o){case"content-box":case"padding-box":Q(s,r[0],r[1],e.topLeftInner,e.topRightInner,i.left+n[3].width,i.top+n[0].width),Q(s,r[1],r[2],e.topRightInner,e.bottomRightInner,i.left+i.width-n[1].width,i.top+n[0].width),Q(s,r[2],r[3],e.bottomRightInner,e.bottomLeftInner,i.left+i.width-n[1].width,i.top+i.height-n[2].width),Q(s,r[3],r[0],e.bottomLeftInner,e.topLeftInner,i.left+n[3].width,i.top+i.height-n[2].width);break;default:Q(s,r[0],r[1],e.topLeftOuter,e.topRightOuter,i.left,i.top),Q(s,r[1],r[2],e.topRightOuter,e.bottomRightOuter,i.left+i.width,i.top),Q(s,r[2],r[3],e.bottomRightOuter,e.bottomLeftOuter,i.left+i.width,i.top+i.height),Q(s,r[3],r[0],e.bottomLeftOuter,e.topLeftOuter,i.left,i.top+i.height)}return s};var Xt=0,Yt="withCredentials"in new XMLHttpRequest,Jt="crossOrigin"in new Image;At.prototype.cloneTo=function(t){At.prototype.cloneTo.call(this,t),t.isPseudoElement=!0,t.before=this.before},At.prototype=Object.create(O.prototype),At.prototype.appendToDOM=function(){this.before?this.parent.node.insertBefore(this.node,this.parent.node.firstChild):this.parent.node.appendChild(this.node),this.parent.node.className+=" "+this.getHideClass()},At.prototype.cleanDOM=function(){this.node.parentNode.removeChild(this.node),this.parent.node.className=this.parent.node.className.replace(this.getHideClass(),"")},At.prototype.getHideClass=function(){return this["PSEUDO_HIDE_ELEMENT_CLASS_"+(this.before?"BEFORE":"AFTER")]},At.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE="___html2canvas___pseudoelement_before",At.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER="___html2canvas___pseudoelement_after",Ot.prototype.renderImage=function(t,e,n,r){var i=t.cssInt("paddingLeft"),o=t.cssInt("paddingTop"),s=t.cssInt("paddingRight"),a=t.cssInt("paddingBottom"),c=n.borders,u=e.width-(c[1].width+c[3].width+i+s),l=e.height-(c[0].width+c[2].width+o+a);this.drawImage(r,0,0,r.image.width||u,r.image.height||l,e.left+i+c[3].width,e.top+o+c[0].width,u,l)},Ot.prototype.renderBackground=function(t,e,n){e.height>0&&e.width>0&&(this.renderBackgroundColor(t,e),this.renderBackgroundImage(t,e,n))},Ot.prototype.renderBackgroundColor=function(t,e){var n=t.css("backgroundColor");this.isTransparent(n)||this.rectangle(e.left,e.top,e.width,e.height,t.css("backgroundColor"))},Ot.prototype.renderBorders=function(t){t.forEach(this.renderBorder,this)},Ot.prototype.renderBorder=function(t){this.isTransparent(t.color)||null===t.args||this.drawShape(t.args,t.color)},Ot.prototype.renderBackgroundImage=function(t,e,n){var r=t.parseBackgroundImages();r.reverse().forEach(function(r,i,o){switch(r.method){case"url":var s=this.images.get(r.args[0]);s?this.renderBackgroundRepeating(t,e,s,o.length-(i+1),n):A("Error loading background-image",r.args[0]);break;case"linear-gradient":case"gradient":var a=this.images.get(r.value);a?this.renderBackgroundGradient(a,e,n):A("Error loading background-image",r.args[0]);break;case"none":break;default:A("Unknown background-image type",r.args[0])}},this)},Ot.prototype.renderBackgroundRepeating=function(t,e,n,r,i){var o=t.parseBackgroundSize(e,n.image,r),s=t.parseBackgroundPosition(e,n.image,r,o),a=t.parseBackgroundRepeat(r);switch(a){case"repeat-x":case"repeat no-repeat":this.backgroundRepeatShape(n,s,o,e,e.left+i[3],e.top+s.top+i[0],99999,o.height,i);break;case"repeat-y":case"no-repeat repeat":this.backgroundRepeatShape(n,s,o,e,e.left+s.left+i[3],e.top+i[0],o.width,99999,i);break;case"no-repeat":this.backgroundRepeatShape(n,s,o,e,e.left+s.left+i[3],e.top+s.top+i[0],o.width,o.height,i);break;default:this.renderBackgroundRepeat(n,s,o,{top:e.top,left:e.left},i[3],i[0])}},Ot.prototype.isTransparent=function(t){return!t||"transparent"===t||"rgba(0, 0, 0, 0)"===t},Rt.prototype=Object.create(O.prototype),Rt.prototype.getParentStack=function(t){var e=this.parent?this.parent.stack:null;return e?e.ownStacking?e:e.getParentStack(t):t.stack},Nt.prototype.testRangeBounds=function(t){var e,n,r,i,o=!1;return t.createRange&&(e=t.createRange(),e.getBoundingClientRect&&(n=t.createElement("boundtest"),n.style.height="123px",n.style.display="block",t.body.appendChild(n),e.selectNode(n),r=e.getBoundingClientRect(),i=r.height,123===i&&(o=!0),t.body.removeChild(n))),o},Nt.prototype.testCORS=function(){return"undefined"!=typeof(new Image).crossOrigin},Nt.prototype.testSVG=function(){var t=new Image,n=e.createElement("canvas"),r=n.getContext("2d");t.src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";try{r.drawImage(t,0,0),n.toDataURL()}catch(i){return!1}return!0},Bt.prototype.hasFabric=function(){return html2canvas.fabric?Promise.resolve():Promise.reject(new Error("html2canvas.svg.js is not loaded, cannot render svg"))},Bt.prototype.inlineFormatting=function(t){return/^data:image\/svg\+xml;base64,/.test(t)?this.decode64(this.removeContentType(t)):this.removeContentType(t)},Bt.prototype.removeContentType=function(t){return t.replace(/^data:image\/svg\+xml(;base64)?,/,"")},Bt.prototype.isInline=function(t){return/^data:image\/svg\+xml/i.test(t)},Bt.prototype.createCanvas=function(t){var e=this;return function(n,r){var i=new html2canvas.fabric.StaticCanvas("c");e.image=i.lowerCanvasEl,i.setWidth(r.width).setHeight(r.height).add(html2canvas.fabric.util.groupSVGElements(n,r)).renderAll(),t(i.lowerCanvasEl)}},Bt.prototype.decode64=function(e){return"function"==typeof t.atob?t.atob(e):Dt(e)},Lt.prototype=Object.create(Bt.prototype),Ft.prototype=Object.create(O.prototype),Ft.prototype.applyTextTransform=function(){this.node.data=this.transform(this.parent.css("textTransform"))},Ft.prototype.transform=function(t){var e=this.node.data;switch(t){case"lowercase":return e.toLowerCase();case"capitalize":return e.replace(/(^|\s|:|-|\(|\))([a-z])/g,Mt);case"uppercase":return e.toUpperCase();default:return e}},jt.prototype=Object.create(_.prototype),Ut.prototype=Object.create(Ot.prototype),Ut.prototype.setFillStyle=function(t){return this.ctx.fillStyle=t,this.ctx},Ut.prototype.rectangle=function(t,e,n,r,i){this.setFillStyle(i).fillRect(t,e,n,r)},Ut.prototype.circle=function(t,e,n,r){this.setFillStyle(r),this.ctx.beginPath(),this.ctx.arc(t+n/2,e+n/2,n/2,0,2*Math.PI,!0),this.ctx.closePath(),this.ctx.fill()},Ut.prototype.circleStroke=function(t,e,n,r,i,o){
this.circle(t,e,n,r),this.ctx.strokeStyle=o,this.ctx.stroke()},Ut.prototype.drawShape=function(t,e){this.shape(t),this.setFillStyle(e).fill()},Ut.prototype.taints=function(t){if(null===t.tainted){this.taintCtx.drawImage(t.image,0,0);try{this.taintCtx.getImageData(0,0,1,1),t.tainted=!1}catch(n){this.taintCtx=e.createElement("canvas").getContext("2d"),t.tainted=!0}}return t.tainted},Ut.prototype.drawImage=function(t,e,n,r,i,o,s,a,c){(!this.taints(t)||this.options.allowTaint)&&this.ctx.drawImage(t.image,e,n,r,i,o,s,a,c)},Ut.prototype.clip=function(t,e,n){this.ctx.save(),t.filter(Ht).forEach(function(t){this.shape(t).clip()},this),e.call(n),this.ctx.restore()},Ut.prototype.shape=function(t){return this.ctx.beginPath(),t.forEach(function(t,e){"rect"===t[0]?this.ctx.rect.apply(this.ctx,t.slice(1)):this.ctx[0===e?"moveTo":t[0]+"To"].apply(this.ctx,t.slice(1))},this),this.ctx.closePath(),this.ctx},Ut.prototype.font=function(t,e,n,r,i,o){this.setFillStyle(t).font=[e,n,r,i,o].join(" ").split(",")[0]},Ut.prototype.fontShadow=function(t,e,n,r){this.setVariable("shadowColor",t).setVariable("shadowOffsetY",e).setVariable("shadowOffsetX",n).setVariable("shadowBlur",r)},Ut.prototype.clearShadow=function(){this.setVariable("shadowColor","rgba(0,0,0,0)")},Ut.prototype.setOpacity=function(t){this.ctx.globalAlpha=t},Ut.prototype.setTransform=function(t){this.ctx.translate(t.origin[0],t.origin[1]),this.ctx.transform.apply(this.ctx,t.matrix),this.ctx.translate(-t.origin[0],-t.origin[1])},Ut.prototype.setVariable=function(t,e){return this.variables[t]!==e&&(this.variables[t]=this.ctx[t]=e),this},Ut.prototype.text=function(t,e,n){this.ctx.fillText(t,e,n)},Ut.prototype.backgroundRepeatShape=function(t,e,n,r,i,o,s,a,c){var u=[["line",Math.round(i),Math.round(o)],["line",Math.round(i+s),Math.round(o)],["line",Math.round(i+s),Math.round(a+o)],["line",Math.round(i),Math.round(a+o)]];this.clip([u],function(){this.renderBackgroundRepeat(t,e,n,r,c[3],c[0])},this)},Ut.prototype.renderBackgroundRepeat=function(t,e,n,r,i,o){var s=Math.round(r.left+e.left+i),a=Math.round(r.top+e.top+o);this.setFillStyle(this.ctx.createPattern(this.resizeImage(t,n),"repeat")),this.ctx.translate(s,a),this.ctx.fill(),this.ctx.translate(-s,-a)},Ut.prototype.renderBackgroundGradient=function(t,e){if(t instanceof P){var n=this.ctx.createLinearGradient(e.left+e.width*t.x0,e.top+e.height*t.y0,e.left+e.width*t.x1,e.top+e.height*t.y1);t.colorStops.forEach(function(t){n.addColorStop(t.stop,t.color)}),this.rectangle(e.left,e.top,e.width,e.height,n)}},Ut.prototype.resizeImage=function(t,n){var r=t.image;if(r.width===n.width&&r.height===n.height)return r;var i,o=e.createElement("canvas");return o.width=n.width,o.height=n.height,i=o.getContext("2d"),i.drawImage(r,0,0,r.width,r.height,0,0,n.width,n.height),o}}).call({},window,document);var html2canvasNodeAttribute="data-html2canvas-node",html2canvasCanvasCloneAttribute="data-html2canvas-canvas-clone",html2canvasCanvasCloneIndex=0;window.html2canvas=function(t,e){if(e=e||{},e.logging&&(window.html2canvas.logging=!0,window.html2canvas.start=Date.now()),e.async="undefined"==typeof e.async?!0:e.async,e.allowTaint="undefined"==typeof e.allowTaint?!1:e.allowTaint,e.removeContainer="undefined"==typeof e.removeContainer?!0:e.removeContainer,e.javascriptEnabled="undefined"==typeof e.javascriptEnabled?!1:e.javascriptEnabled,e.imageTimeout="undefined"==typeof e.imageTimeout?1e4:e.imageTimeout,"string"==typeof t)return"string"!=typeof e.proxy?Promise.reject("Proxy must be used when rendering url"):loadUrlDocument(absoluteUrl(t),e.proxy,document,window.innerWidth,window.innerHeight,e).then(function(t){return renderWindow(t.contentWindow.document.documentElement,t,e,window.innerWidth,window.innerHeight)});var n=(void 0===t?[document.documentElement]:t.length?t:[t])[0];return n.setAttribute(html2canvasNodeAttribute,"true"),renderDocument(n.ownerDocument,e,n.ownerDocument.defaultView.innerWidth,n.ownerDocument.defaultView.innerHeight).then(function(t){return"function"==typeof e.onrendered&&(log("options.onrendered is deprecated, html2canvas returns a Promise containing the canvas"),e.onrendered(t)),t})},window.html2canvas.punycode=this.punycode,window.html2canvas.proxy={},("function"!=typeof Object.create||"function"!=typeof document.createElement("canvas").getContext)&&(window.html2canvas=function(){return Promise.reject("No canvas support")}),FontMetrics.prototype.getMetrics=function(t,e){return void 0===this.data[t+"-"+e]&&(this.data[t+"-"+e]=new Font(t,e)),this.data[t+"-"+e]},FrameContainer.prototype.proxyLoad=function(t,e,n){var r=this.src;return loadUrlDocument(r.src,t,r.ownerDocument,e.width,e.height,n)},GradientContainer.prototype.TYPES={LINEAR:1,RADIAL:2},ImageLoader.prototype.findImages=function(t){var e=[];return t.reduce(function(t,e){switch(e.node.nodeName){case"IMG":return t.concat([{args:[e.node.src],method:"url"}]);case"svg":case"IFRAME":return t.concat([{args:[e.node],method:e.node.nodeName}])}return t},[]).forEach(this.addImage(e,this.loadImage),this),e},ImageLoader.prototype.findBackgroundImage=function(t,e){return e.parseBackgroundImages().filter(this.hasImageBackground).forEach(this.addImage(t,this.loadImage),this),t},ImageLoader.prototype.addImage=function(t,e){return function(n){n.args.forEach(function(r){this.imageExists(t,r)||(t.splice(0,0,e.call(this,n)),log("Added image #"+t.length,"string"==typeof r?r.substring(0,100):r))},this)}},ImageLoader.prototype.hasImageBackground=function(t){return"none"!==t.method},ImageLoader.prototype.loadImage=function(t){if("url"===t.method){var e=t.args[0];return!this.isSVG(e)||this.support.svg||this.options.allowTaint?e.match(/data:image\/.*;base64,/i)?new ImageContainer(e.replace(/url\(['"]{0,}|['"]{0,}\)$/gi,""),!1):this.isSameOrigin(e)||this.options.allowTaint===!0||this.isSVG(e)?new ImageContainer(e,!1):this.support.cors&&!this.options.allowTaint&&this.options.useCORS?new ImageContainer(e,!0):this.options.proxy?new ProxyImageContainer(e,this.options.proxy):new DummyImageContainer(e):new SVGContainer(e)}return"linear-gradient"===t.method?new LinearGradientContainer(t):"gradient"===t.method?new WebkitGradientContainer(t):"svg"===t.method?new SVGNodeContainer(t.args[0],this.support.svg):"IFRAME"===t.method?new FrameContainer(t.args[0],this.isSameOrigin(t.args[0].src),this.options):new DummyImageContainer(t)},ImageLoader.prototype.isSVG=function(t){return"svg"===t.substring(t.length-3).toLowerCase()||SVGContainer.prototype.isInline(t)},ImageLoader.prototype.imageExists=function(t,e){return t.some(function(t){return t.src===e})},ImageLoader.prototype.isSameOrigin=function(t){return this.getOrigin(t)===this.origin},ImageLoader.prototype.getOrigin=function(t){var e=this.link||(this.link=document.createElement("a"));return e.href=t,e.href=e.href,e.protocol+e.hostname+e.port},ImageLoader.prototype.getPromise=function(t){return this.timeout(t,this.options.imageTimeout)["catch"](function(){var e=new DummyImageContainer(t.src);return e.promise.then(function(e){t.image=e})})},ImageLoader.prototype.get=function(t){var e=null;return this.images.some(function(n){return(e=n).src===t})?e:null},ImageLoader.prototype.fetch=function(t){return this.images=t.reduce(bind(this.findBackgroundImage,this),this.findImages(t)),this.images.forEach(function(t,e){t.promise.then(function(){log("Succesfully loaded image #"+(e+1),t)},function(n){log("Failed loading image #"+(e+1),t,n)})}),this.ready=Promise.all(this.images.map(this.getPromise,this)),log("Finished searching images"),this},ImageLoader.prototype.timeout=function(t,e){var n;return Promise.race([t.promise,new Promise(function(r,i){n=setTimeout(function(){log("Timed out loading image",t),i(t)},e)})]).then(function(t){return clearTimeout(n),t})},LinearGradientContainer.prototype=Object.create(GradientContainer.prototype),LinearGradientContainer.prototype.stepRegExp=/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/,NodeContainer.prototype.cloneTo=function(t){t.visible=this.visible,t.borders=this.borders,t.bounds=this.bounds,t.clip=this.clip,t.backgroundClip=this.backgroundClip,t.computedStyles=this.computedStyles,t.styles=this.styles,t.backgroundImages=this.backgroundImages,t.opacity=this.opacity},NodeContainer.prototype.getOpacity=function(){return null===this.opacity?this.opacity=this.cssFloat("opacity"):this.opacity},NodeContainer.prototype.assignStack=function(t){this.stack=t,t.children.push(this)},NodeContainer.prototype.isElementVisible=function(){return this.node.nodeType===Node.TEXT_NODE?this.parent.visible:"none"!==this.css("display")&&"hidden"!==this.css("visibility")&&!this.node.hasAttribute("data-html2canvas-ignore")&&("INPUT"!==this.node.nodeName||"hidden"!==this.node.getAttribute("type"))},NodeContainer.prototype.css=function(t){return this.computedStyles||(this.computedStyles=this.isPseudoElement?this.parent.computedStyle(this.before?":before":":after"):this.computedStyle(null)),this.styles[t]||(this.styles[t]=this.computedStyles[t])},NodeContainer.prototype.prefixedCss=function(t){var e=["webkit","moz","ms","o"],n=this.css(t);return void 0===n&&e.some(function(e){return n=this.css(e+t.substr(0,1).toUpperCase()+t.substr(1)),void 0!==n},this),void 0===n?null:n},NodeContainer.prototype.computedStyle=function(t){return this.node.ownerDocument.defaultView.getComputedStyle(this.node,t)},NodeContainer.prototype.cssInt=function(t){var e=parseInt(this.css(t),10);return isNaN(e)?0:e},NodeContainer.prototype.cssFloat=function(t){var e=parseFloat(this.css(t));return isNaN(e)?0:e},NodeContainer.prototype.fontWeight=function(){var t=this.css("fontWeight");switch(parseInt(t,10)){case 401:t="bold";break;case 400:t="normal"}return t},NodeContainer.prototype.parseClip=function(){var t=this.css("clip").match(this.CLIP);return t?{top:parseInt(t[1],10),right:parseInt(t[2],10),bottom:parseInt(t[3],10),left:parseInt(t[4],10)}:null},NodeContainer.prototype.parseBackgroundImages=function(){return this.backgroundImages||(this.backgroundImages=parseBackgrounds(this.css("backgroundImage")))},NodeContainer.prototype.cssList=function(t,e){var n=(this.css(t)||"").split(",");return n=n[e||0]||n[0]||"auto",n=n.trim().split(" "),1===n.length&&(n=[n[0],n[0]]),n},NodeContainer.prototype.parseBackgroundSize=function(t,e,n){var r,i,o=this.cssList("backgroundSize",n);if(isPercentage(o[0]))r=t.width*parseFloat(o[0])/100;else{if(/contain|cover/.test(o[0])){var s=t.width/t.height,a=e.width/e.height;return a>s^"contain"===o[0]?{width:t.height*a,height:t.height}:{width:t.width,height:t.width/a}}r=parseInt(o[0],10)}return i="auto"===o[0]&&"auto"===o[1]?e.height:"auto"===o[1]?r/e.width*e.height:isPercentage(o[1])?t.height*parseFloat(o[1])/100:parseInt(o[1],10),"auto"===o[0]&&(r=i/e.height*e.width),{width:r,height:i}},NodeContainer.prototype.parseBackgroundPosition=function(t,e,n,r){var i,o,s=this.cssList("backgroundPosition",n);return i=isPercentage(s[0])?(t.width-(r||e).width)*(parseFloat(s[0])/100):parseInt(s[0],10),o="auto"===s[1]?i/e.width*e.height:isPercentage(s[1])?(t.height-(r||e).height)*parseFloat(s[1])/100:parseInt(s[1],10),"auto"===s[0]&&(i=o/e.height*e.width),{left:i,top:o}},NodeContainer.prototype.parseBackgroundRepeat=function(t){return this.cssList("backgroundRepeat",t)[0]},NodeContainer.prototype.parseTextShadows=function(){var t=this.css("textShadow"),e=[];if(t&&"none"!==t)for(var n=t.match(this.TEXT_SHADOW_PROPERTY),r=0;n&&r<n.length;r++){var i=n[r].match(this.TEXT_SHADOW_VALUES);e.push({color:i[0],offsetX:i[1]?parseFloat(i[1].replace("px","")):0,offsetY:i[2]?parseFloat(i[2].replace("px","")):0,blur:i[3]?i[3].replace("px",""):0})}return e},NodeContainer.prototype.parseTransform=function(){if(!this.transformData)if(this.hasTransform()){var t=this.parseBounds(),e=this.prefixedCss("transformOrigin").split(" ").map(removePx).map(asFloat);e[0]+=t.left,e[1]+=t.top,this.transformData={origin:e,matrix:this.parseTransformMatrix()}}else this.transformData={origin:[0,0],matrix:[1,0,0,1,0,0]};return this.transformData},NodeContainer.prototype.parseTransformMatrix=function(){if(!this.transformMatrix){var t=this.prefixedCss("transform"),e=t?parseMatrix(t.match(this.MATRIX_PROPERTY)):null;this.transformMatrix=e?e:[1,0,0,1,0,0]}return this.transformMatrix},NodeContainer.prototype.parseBounds=function(){return this.bounds||(this.bounds=this.hasTransform()?offsetBounds(this.node):getBounds(this.node))},NodeContainer.prototype.hasTransform=function(){return"1,0,0,1,0,0"!==this.parseTransformMatrix().join(",")||this.parent&&this.parent.hasTransform()},NodeContainer.prototype.getValue=function(){var t=this.node.value||"";return t="SELECT"===this.node.tagName?selectionValue(this.node):t,0===t.length?this.node.placeholder||"":t},NodeContainer.prototype.MATRIX_PROPERTY=/(matrix)\((.+)\)/,NodeContainer.prototype.TEXT_SHADOW_PROPERTY=/((rgba|rgb)\([^\)]+\)(\s-?\d+px){0,})/g,NodeContainer.prototype.TEXT_SHADOW_VALUES=/(-?\d+px)|(#.+)|(rgb\(.+\))|(rgba\(.+\))/g,NodeContainer.prototype.CLIP=/^rect\((\d+)px,? (\d+)px,? (\d+)px,? (\d+)px\)$/,NodeParser.prototype.calculateOverflowClips=function(){this.nodes.forEach(function(t){if(isElement(t)){isPseudoElement(t)&&t.appendToDOM(),t.borders=this.parseBorders(t);var e="hidden"===t.css("overflow")?[t.borders.clip]:[],n=t.parseClip();n&&-1!==["absolute","fixed"].indexOf(t.css("position"))&&e.push([["rect",t.bounds.left+n.left,t.bounds.top+n.top,n.right-n.left,n.bottom-n.top]]),t.clip=hasParentClip(t)?t.parent.clip.concat(e):e,t.backgroundClip="hidden"!==t.css("overflow")?t.clip.concat([t.borders.clip]):t.clip,isPseudoElement(t)&&t.cleanDOM()}else isTextNode(t)&&(t.clip=hasParentClip(t)?t.parent.clip:[]);isPseudoElement(t)||(t.bounds=null)},this)},NodeParser.prototype.asyncRenderer=function(t,e,n){n=n||Date.now(),this.paint(t[this.renderIndex++]),t.length===this.renderIndex?e():n+20>Date.now()?this.asyncRenderer(t,e,n):setTimeout(bind(function(){this.asyncRenderer(t,e)},this),0)},NodeParser.prototype.createPseudoHideStyles=function(t){this.createStyles(t,"."+PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE+':before { content: "" !important; display: none !important; }.'+PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER+':after { content: "" !important; display: none !important; }')},NodeParser.prototype.disableAnimations=function(t){this.createStyles(t,"* { -webkit-animation: none !important; -moz-animation: none !important; -o-animation: none !important; animation: none !important; -webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; transition: none !important;}")},NodeParser.prototype.createStyles=function(t,e){var n=t.createElement("style");n.innerHTML=e,t.body.appendChild(n)},NodeParser.prototype.getPseudoElements=function(t){var e=[[t]];if(t.node.nodeType===Node.ELEMENT_NODE){var n=this.getPseudoElement(t,":before"),r=this.getPseudoElement(t,":after");n&&e.push(n),r&&e.push(r)}return flatten(e)},NodeParser.prototype.getPseudoElement=function(t,e){var n=t.computedStyle(e);if(!n||!n.content||"none"===n.content||"-moz-alt-content"===n.content||"none"===n.display)return null;for(var r=stripQuotes(n.content),i="url"===r.substr(0,3),o=document.createElement(i?"img":"html2canvaspseudoelement"),s=new PseudoElementContainer(o,t,e),a=n.length-1;a>=0;a--){var c=toCamelCase(n.item(a));o.style[c]=n[c]}if(o.className=PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE+" "+PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER,i)return o.src=parseBackgrounds(r)[0].args[0],[s];var u=document.createTextNode(r);return o.appendChild(u),[s,new TextContainer(u,s)]},NodeParser.prototype.getChildren=function(t){return flatten([].filter.call(t.node.childNodes,renderableNode).map(function(e){var n=[e.nodeType===Node.TEXT_NODE?new TextContainer(e,t):new NodeContainer(e,t)].filter(nonIgnoredElement);return e.nodeType===Node.ELEMENT_NODE&&n.length&&"TEXTAREA"!==e.tagName?n[0].isElementVisible()?n.concat(this.getChildren(n[0])):[]:n},this))},NodeParser.prototype.newStackingContext=function(t,e){var n=new StackingContext(e,t.getOpacity(),t.node,t.parent);t.cloneTo(n);var r=e?n.getParentStack(this):n.parent.stack;r.contexts.push(n),t.stack=n},NodeParser.prototype.createStackingContexts=function(){this.nodes.forEach(function(t){isElement(t)&&(this.isRootElement(t)||hasOpacity(t)||isPositionedForStacking(t)||this.isBodyWithTransparentRoot(t)||t.hasTransform())?this.newStackingContext(t,!0):isElement(t)&&(isPositioned(t)&&zIndex0(t)||isInlineBlock(t)||isFloating(t))?this.newStackingContext(t,!1):t.assignStack(t.parent.stack)},this)},NodeParser.prototype.isBodyWithTransparentRoot=function(t){return"BODY"===t.node.nodeName&&this.renderer.isTransparent(t.parent.css("backgroundColor"))},NodeParser.prototype.isRootElement=function(t){return null===t.parent},NodeParser.prototype.sortStackingContexts=function(t){t.contexts.sort(zIndexSort(t.contexts.slice(0))),t.contexts.forEach(this.sortStackingContexts,this)},NodeParser.prototype.parseTextBounds=function(t){return function(e,n,r){if("none"!==t.parent.css("textDecoration").substr(0,4)||0!==e.trim().length){if(this.support.rangeBounds&&!t.parent.hasTransform()){var i=r.slice(0,n).join("").length;return this.getRangeBounds(t.node,i,e.length)}if(t.node&&"string"==typeof t.node.data){var o=t.node.splitText(e.length),s=this.getWrapperBounds(t.node,t.parent.hasTransform());return t.node=o,s}}else(!this.support.rangeBounds||t.parent.hasTransform())&&(t.node=t.node.splitText(e.length));return{}}},NodeParser.prototype.getWrapperBounds=function(t,e){var n=t.ownerDocument.createElement("html2canvaswrapper"),r=t.parentNode,i=t.cloneNode(!0);n.appendChild(t.cloneNode(!0)),r.replaceChild(n,t);var o=e?offsetBounds(n):getBounds(n);return r.replaceChild(i,n),o},NodeParser.prototype.getRangeBounds=function(t,e,n){var r=this.range||(this.range=t.ownerDocument.createRange());return r.setStart(t,e),r.setEnd(t,e+n),r.getBoundingClientRect()},NodeParser.prototype.parse=function(t){var e=t.contexts.filter(negativeZIndex),n=t.children.filter(isElement),r=n.filter(not(isFloating)),i=r.filter(not(isPositioned)).filter(not(inlineLevel)),o=n.filter(not(isPositioned)).filter(isFloating),s=r.filter(not(isPositioned)).filter(inlineLevel),a=t.contexts.concat(r.filter(isPositioned)).filter(zIndex0),c=t.children.filter(isTextNode).filter(hasText),u=t.contexts.filter(positiveZIndex);e.concat(i).concat(o).concat(s).concat(a).concat(c).concat(u).forEach(function(t){this.renderQueue.push(t),isStackingContext(t)&&(this.parse(t),this.renderQueue.push(new ClearTransform))},this)},NodeParser.prototype.paint=function(t){try{t instanceof ClearTransform?this.renderer.ctx.restore():isTextNode(t)?(isPseudoElement(t.parent)&&t.parent.appendToDOM(),this.paintText(t),isPseudoElement(t.parent)&&t.parent.cleanDOM()):this.paintNode(t)}catch(e){log(e)}},NodeParser.prototype.paintNode=function(t){isStackingContext(t)&&(this.renderer.setOpacity(t.opacity),this.renderer.ctx.save(),t.hasTransform()&&this.renderer.setTransform(t.parseTransform())),"INPUT"===t.node.nodeName&&"checkbox"===t.node.type?this.paintCheckbox(t):"INPUT"===t.node.nodeName&&"radio"===t.node.type?this.paintRadio(t):this.paintElement(t)},NodeParser.prototype.paintElement=function(t){var e=t.parseBounds();this.renderer.clip(t.backgroundClip,function(){this.renderer.renderBackground(t,e,t.borders.borders.map(getWidth))},this),this.renderer.clip(t.clip,function(){this.renderer.renderBorders(t.borders.borders)},this),this.renderer.clip(t.backgroundClip,function(){switch(t.node.nodeName){case"svg":case"IFRAME":var n=this.images.get(t.node);n?this.renderer.renderImage(t,e,t.borders,n):log("Error loading <"+t.node.nodeName+">",t.node);break;case"IMG":var r=this.images.get(t.node.src);r?this.renderer.renderImage(t,e,t.borders,r):log("Error loading <img>",t.node.src);break;case"CANVAS":this.renderer.renderImage(t,e,t.borders,{image:t.node});break;case"SELECT":case"INPUT":case"TEXTAREA":this.paintFormValue(t)}},this)},NodeParser.prototype.paintCheckbox=function(t){var e=t.parseBounds(),n=Math.min(e.width,e.height),r={width:n-1,height:n-1,top:e.top,left:e.left},i=[3,3],o=[i,i,i,i],s=[1,1,1,1].map(function(t){return{color:"#A5A5A5",width:t}}),a=calculateCurvePoints(r,o,s);this.renderer.clip(t.backgroundClip,function(){this.renderer.rectangle(r.left+1,r.top+1,r.width-2,r.height-2,"#DEDEDE"),this.renderer.renderBorders(calculateBorders(s,r,a,o)),t.node.checked&&(this.renderer.font("#424242","normal","normal","bold",n-3+"px","arial"),this.renderer.text("✔",r.left+n/6,r.top+n-1))},this)},NodeParser.prototype.paintRadio=function(t){var e=t.parseBounds(),n=Math.min(e.width,e.height)-2;this.renderer.clip(t.backgroundClip,function(){this.renderer.circleStroke(e.left+1,e.top+1,n,"#DEDEDE",1,"#A5A5A5"),t.node.checked&&this.renderer.circle(Math.ceil(e.left+n/4)+1,Math.ceil(e.top+n/4)+1,Math.floor(n/2),"#424242")},this)},NodeParser.prototype.paintFormValue=function(t){if(t.getValue().length>0){var e=t.node.ownerDocument,n=e.createElement("html2canvaswrapper"),r=["lineHeight","textAlign","fontFamily","fontWeight","fontSize","color","paddingLeft","paddingTop","paddingRight","paddingBottom","width","height","borderLeftStyle","borderTopStyle","borderLeftWidth","borderTopWidth","boxSizing","whiteSpace","wordWrap","list-style-type"];r.forEach(function(e){try{n.style[e]=t.css(e)}catch(r){log("html2canvas: Parse: Exception caught in renderFormValue: "+r.message)}});var i=t.parseBounds();n.style.position="fixed",n.style.left=i.left+"px",n.style.top=i.top+"px",n.textContent=t.getValue(),e.body.appendChild(n),this.paintText(new TextContainer(n.firstChild,t)),e.body.removeChild(n)}},NodeParser.prototype.paintText=function(t){t.applyTextTransform();var e=window.html2canvas.punycode.ucs2.decode(t.node.data),n=this.options.letterRendering&&!noLetterSpacing(t)||hasUnicode(t.node.data)?e.map(function(t){return window.html2canvas.punycode.ucs2.encode([t])}):getWords(e),r=t.parent.fontWeight(),i=t.parent.css("fontSize"),o=t.parent.css("fontFamily"),s=t.parent.parseTextShadows();this.renderer.font(t.parent.css("color"),t.parent.css("fontStyle"),t.parent.css("fontVariant"),r,i,o),s.length?this.renderer.fontShadow(s[0].color,s[0].offsetX,s[0].offsetY,s[0].blur):this.renderer.clearShadow(),this.renderer.clip(t.parent.clip,function(){n.map(this.parseTextBounds(t),this).forEach(function(e,r){e&&(this.renderer.text(n[r],e.left,e.bottom),this.renderTextDecoration(t.parent,e,this.fontMetrics.getMetrics(o,i)))},this)},this)},NodeParser.prototype.renderTextDecoration=function(t,e,n){switch(t.css("textDecoration").split(" ")[0]){case"underline":this.renderer.rectangle(e.left,Math.round(e.top+n.baseline+n.lineWidth),e.width,1,t.css("color"));break;case"overline":this.renderer.rectangle(e.left,Math.round(e.top),e.width,1,t.css("color"));break;case"line-through":this.renderer.rectangle(e.left,Math.ceil(e.top+n.middle+n.lineWidth),e.width,1,t.css("color"))}},NodeParser.prototype.parseBorders=function(t){var e=t.parseBounds(),n=getBorderRadiusData(t),r=["Top","Right","Bottom","Left"].map(function(e){return{width:t.cssInt("border"+e+"Width"),color:t.css("border"+e+"Color"),args:null}}),i=calculateCurvePoints(e,n,r);return{clip:this.parseBackgroundClip(t,i,r,n,e),borders:calculateBorders(r,e,i,n)}},NodeParser.prototype.parseBackgroundClip=function(t,e,n,r,i){var o=t.css("backgroundClip"),s=[];switch(o){case"content-box":case"padding-box":parseCorner(s,r[0],r[1],e.topLeftInner,e.topRightInner,i.left+n[3].width,i.top+n[0].width),parseCorner(s,r[1],r[2],e.topRightInner,e.bottomRightInner,i.left+i.width-n[1].width,i.top+n[0].width),parseCorner(s,r[2],r[3],e.bottomRightInner,e.bottomLeftInner,i.left+i.width-n[1].width,i.top+i.height-n[2].width),parseCorner(s,r[3],r[0],e.bottomLeftInner,e.topLeftInner,i.left+n[3].width,i.top+i.height-n[2].width);break;default:parseCorner(s,r[0],r[1],e.topLeftOuter,e.topRightOuter,i.left,i.top),parseCorner(s,r[1],r[2],e.topRightOuter,e.bottomRightOuter,i.left+i.width,i.top),parseCorner(s,r[2],r[3],e.bottomRightOuter,e.bottomLeftOuter,i.left+i.width,i.top+i.height),parseCorner(s,r[3],r[0],e.bottomLeftOuter,e.topLeftOuter,i.left,i.top+i.height)}return s},!function(){var t,e,n,r;!function(){var i={},o={};t=function(t,e,n){i[t]={deps:e,callback:n}},r=n=e=function(t){function n(e){if("."!==e.charAt(0))return e;for(var n=e.split("/"),r=t.split("/").slice(0,-1),i=0,o=n.length;o>i;i++){var s=n[i];if(".."===s)r.pop();else{if("."===s)continue;r.push(s)}}return r.join("/")}if(r._eak_seen=i,o[t])return o[t];if(o[t]={},!i[t])throw new Error("Could not find module "+t);for(var s,a=i[t],c=a.deps,u=a.callback,l=[],h=0,d=c.length;d>h;h++)"exports"===c[h]?l.push(s={}):l.push(e(n(c[h])));var f=u.apply(this,l);return o[t]=s||f}}(),t("promise/all",["./utils","exports"],function(t,e){"use strict";function n(t){var e=this;if(!r(t))throw new TypeError("You must pass an array to all.");return new e(function(e,n){function r(t){return function(e){o(t,e)}}function o(t,n){a[t]=n,0===--c&&e(a)}var s,a=[],c=t.length;0===c&&e([]);for(var u=0;u<t.length;u++)s=t[u],s&&i(s.then)?s.then(r(u),n):o(u,s)})}var r=t.isArray,i=t.isFunction;e.all=n}),t("promise/asap",["exports"],function(t){"use strict";function e(){return function(){process.nextTick(i)}}function n(){var t=0,e=new c(i),n=document.createTextNode("");return e.observe(n,{characterData:!0}),function(){n.data=t=++t%2}}function r(){return function(){u.setTimeout(i,1)}}function i(){for(var t=0;t<l.length;t++){var e=l[t],n=e[0],r=e[1];n(r)}l=[]}function o(t,e){var n=l.push([t,e]);1===n&&s()}var s,a="undefined"!=typeof window?window:{},c=a.MutationObserver||a.WebKitMutationObserver,u="undefined"!=typeof global?global:this,l=[];s="undefined"!=typeof process&&"[object process]"==={}.toString.call(process)?e():c?n():r(),t.asap=o}),t("promise/cast",["exports"],function(t){"use strict";function e(t){if(t&&"object"==typeof t&&t.constructor===this)return t;var e=this;return new e(function(e){e(t)})}t.cast=e}),t("promise/config",["exports"],function(t){"use strict";function e(t,e){return 2!==arguments.length?n[t]:void(n[t]=e)}var n={instrument:!1};t.config=n,t.configure=e}),t("promise/polyfill",["./promise","./utils","exports"],function(t,e,n){"use strict";function r(){var t="Promise"in window&&"cast"in window.Promise&&"resolve"in window.Promise&&"reject"in window.Promise&&"all"in window.Promise&&"race"in window.Promise&&function(){var t;return new window.Promise(function(e){t=e}),o(t)}();t||(window.Promise=i)}var i=t.Promise,o=e.isFunction;n.polyfill=r}),t("promise/promise",["./config","./utils","./cast","./all","./race","./resolve","./reject","./asap","exports"],function(t,e,n,r,i,o,s,a,c){"use strict";function u(t){if(!k(t))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof u))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this._subscribers=[],l(t,this)}function l(t,e){function n(t){m(e,t)}function r(t){w(e,t)}try{t(n,r)}catch(i){r(i)}}function h(t,e,n,r){var i,o,s,a,c=k(n);if(c)try{i=n(r),s=!0}catch(u){a=!0,o=u}else i=r,s=!0;p(e,i)||(c&&s?m(e,i):a?w(e,o):t===A?m(e,i):t===O&&w(e,i))}function d(t,e,n,r){var i=t._subscribers,o=i.length;i[o]=e,i[o+A]=n,i[o+O]=r}function f(t,e){for(var n,r,i=t._subscribers,o=t._detail,s=0;s<i.length;s+=3)n=i[s],r=i[s+e],h(e,n,r,o);t._subscribers=null}function p(t,e){var n,r=null;try{if(t===e)throw new TypeError("A promises callback cannot return that same promise.");if(x(e)&&(r=e.then,k(r)))return r.call(e,function(r){return n?!0:(n=!0,void(e!==r?m(t,r):g(t,r)))},function(e){return n?!0:(n=!0,void w(t,e))}),!0}catch(i){return n?!0:(w(t,i),!0)}return!1}function m(t,e){t===e?g(t,e):p(t,e)||g(t,e)}function g(t,e){t._state===I&&(t._state=P,t._detail=e,b.async(y,t))}function w(t,e){t._state===I&&(t._state=P,t._detail=e,b.async(v,t))}function y(t){f(t,t._state=A)}function v(t){f(t,t._state=O)}var b=t.config,x=(t.configure,e.objectOrFunction),k=e.isFunction,C=(e.now,n.cast),E=r.all,S=i.race,T=o.resolve,_=s.reject,q=a.asap;b.async=q;var I=void 0,P=0,A=1,O=2;u.prototype={constructor:u,_state:void 0,_detail:void 0,_subscribers:void 0,then:function(t,e){var n=this,r=new this.constructor(function(){});if(this._state){var i=arguments;b.async(function(){h(n._state,r,i[n._state-1],n._detail)})}else d(this,r,t,e);return r},"catch":function(t){return this.then(null,t)}},u.all=E,u.cast=C,u.race=S,u.resolve=T,u.reject=_,c.Promise=u}),t("promise/race",["./utils","exports"],function(t,e){"use strict";function n(t){var e=this;if(!r(t))throw new TypeError("You must pass an array to race.");return new e(function(e,n){for(var r,i=0;i<t.length;i++)r=t[i],r&&"function"==typeof r.then?r.then(e,n):e(r)})}var r=t.isArray;e.race=n}),t("promise/reject",["exports"],function(t){"use strict";function e(t){var e=this;return new e(function(e,n){n(t)})}t.reject=e}),t("promise/resolve",["exports"],function(t){"use strict";function e(t){var e=this;return new e(function(e){e(t)})}t.resolve=e}),t("promise/utils",["exports"],function(t){"use strict";function e(t){return n(t)||"object"==typeof t&&null!==t}function n(t){return"function"==typeof t}function r(t){return"[object Array]"===Object.prototype.toString.call(t)}var i=Date.now||function(){return(new Date).getTime()};t.objectOrFunction=e,t.isFunction=n,t.isArray=r,t.now=i}),e("promise/polyfill").polyfill()}();var proxyCount=0,supportsCORS="withCredentials"in new XMLHttpRequest,supportsCORSImage="crossOrigin"in new Image;PseudoElementContainer.prototype.cloneTo=function(t){PseudoElementContainer.prototype.cloneTo.call(this,t),t.isPseudoElement=!0,t.before=this.before},PseudoElementContainer.prototype=Object.create(NodeContainer.prototype),PseudoElementContainer.prototype.appendToDOM=function(){this.before?this.parent.node.insertBefore(this.node,this.parent.node.firstChild):this.parent.node.appendChild(this.node),this.parent.node.className+=" "+this.getHideClass()},PseudoElementContainer.prototype.cleanDOM=function(){this.node.parentNode.removeChild(this.node),this.parent.node.className=this.parent.node.className.replace(this.getHideClass(),"")},PseudoElementContainer.prototype.getHideClass=function(){return this["PSEUDO_HIDE_ELEMENT_CLASS_"+(this.before?"BEFORE":"AFTER")]},PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE="___html2canvas___pseudoelement_before",PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER="___html2canvas___pseudoelement_after",Renderer.prototype.renderImage=function(t,e,n,r){var i=t.cssInt("paddingLeft"),o=t.cssInt("paddingTop"),s=t.cssInt("paddingRight"),a=t.cssInt("paddingBottom"),c=n.borders,u=e.width-(c[1].width+c[3].width+i+s),l=e.height-(c[0].width+c[2].width+o+a);this.drawImage(r,0,0,r.image.width||u,r.image.height||l,e.left+i+c[3].width,e.top+o+c[0].width,u,l)},Renderer.prototype.renderBackground=function(t,e,n){e.height>0&&e.width>0&&(this.renderBackgroundColor(t,e),this.renderBackgroundImage(t,e,n))},Renderer.prototype.renderBackgroundColor=function(t,e){var n=t.css("backgroundColor");this.isTransparent(n)||this.rectangle(e.left,e.top,e.width,e.height,t.css("backgroundColor"))},Renderer.prototype.renderBorders=function(t){t.forEach(this.renderBorder,this)},Renderer.prototype.renderBorder=function(t){this.isTransparent(t.color)||null===t.args||this.drawShape(t.args,t.color)},Renderer.prototype.renderBackgroundImage=function(t,e,n){var r=t.parseBackgroundImages();r.reverse().forEach(function(r,i,o){switch(r.method){case"url":var s=this.images.get(r.args[0]);s?this.renderBackgroundRepeating(t,e,s,o.length-(i+1),n):log("Error loading background-image",r.args[0]);break;case"linear-gradient":case"gradient":var a=this.images.get(r.value);a?this.renderBackgroundGradient(a,e,n):log("Error loading background-image",r.args[0]);break;case"none":break;default:log("Unknown background-image type",r.args[0])}},this)},Renderer.prototype.renderBackgroundRepeating=function(t,e,n,r,i){
var o=t.parseBackgroundSize(e,n.image,r),s=t.parseBackgroundPosition(e,n.image,r,o),a=t.parseBackgroundRepeat(r);switch(a){case"repeat-x":case"repeat no-repeat":this.backgroundRepeatShape(n,s,o,e,e.left+i[3],e.top+s.top+i[0],99999,o.height,i);break;case"repeat-y":case"no-repeat repeat":this.backgroundRepeatShape(n,s,o,e,e.left+s.left+i[3],e.top+i[0],o.width,99999,i);break;case"no-repeat":this.backgroundRepeatShape(n,s,o,e,e.left+s.left+i[3],e.top+s.top+i[0],o.width,o.height,i);break;default:this.renderBackgroundRepeat(n,s,o,{top:e.top,left:e.left},i[3],i[0])}},Renderer.prototype.isTransparent=function(t){return!t||"transparent"===t||"rgba(0, 0, 0, 0)"===t},StackingContext.prototype=Object.create(NodeContainer.prototype),StackingContext.prototype.getParentStack=function(t){var e=this.parent?this.parent.stack:null;return e?e.ownStacking?e:e.getParentStack(t):t.stack},Support.prototype.testRangeBounds=function(t){var e,n,r,i,o=!1;return t.createRange&&(e=t.createRange(),e.getBoundingClientRect&&(n=t.createElement("boundtest"),n.style.height="123px",n.style.display="block",t.body.appendChild(n),e.selectNode(n),r=e.getBoundingClientRect(),i=r.height,123===i&&(o=!0),t.body.removeChild(n))),o},Support.prototype.testCORS=function(){return"undefined"!=typeof(new Image).crossOrigin},Support.prototype.testSVG=function(){var t=new Image,e=document.createElement("canvas"),n=e.getContext("2d");t.src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";try{n.drawImage(t,0,0),e.toDataURL()}catch(r){return!1}return!0},SVGContainer.prototype.hasFabric=function(){return html2canvas.fabric?Promise.resolve():Promise.reject(new Error("html2canvas.svg.js is not loaded, cannot render svg"))},SVGContainer.prototype.inlineFormatting=function(t){return/^data:image\/svg\+xml;base64,/.test(t)?this.decode64(this.removeContentType(t)):this.removeContentType(t)},SVGContainer.prototype.removeContentType=function(t){return t.replace(/^data:image\/svg\+xml(;base64)?,/,"")},SVGContainer.prototype.isInline=function(t){return/^data:image\/svg\+xml/i.test(t)},SVGContainer.prototype.createCanvas=function(t){var e=this;return function(n,r){var i=new html2canvas.fabric.StaticCanvas("c");e.image=i.lowerCanvasEl,i.setWidth(r.width).setHeight(r.height).add(html2canvas.fabric.util.groupSVGElements(n,r)).renderAll(),t(i.lowerCanvasEl)}},SVGContainer.prototype.decode64=function(t){return"function"==typeof window.atob?window.atob(t):decode64(t)},SVGNodeContainer.prototype=Object.create(SVGContainer.prototype),TextContainer.prototype=Object.create(NodeContainer.prototype),TextContainer.prototype.applyTextTransform=function(){this.node.data=this.transform(this.parent.css("textTransform"))},TextContainer.prototype.transform=function(t){var e=this.node.data;switch(t){case"lowercase":return e.toLowerCase();case"capitalize":return e.replace(/(^|\s|:|-|\(|\))([a-z])/g,capitalize);case"uppercase":return e.toUpperCase();default:return e}},WebkitGradientContainer.prototype=Object.create(GradientContainer.prototype),function(t){var e;e=function(){function e(t){var e,n,r,i,o,s,a,c,u,l,h,d,f,p,m;for(this.data=t,this.pos=8,this.palette=[],this.imgData=[],this.transparency={},this.animation=null,this.text={},s=null;;){switch(e=this.readUInt32(),l=function(){var t,e;for(e=[],a=t=0;4>t;a=++t)e.push(String.fromCharCode(this.data[this.pos++]));return e}.call(this).join("")){case"IHDR":this.width=this.readUInt32(),this.height=this.readUInt32(),this.bits=this.data[this.pos++],this.colorType=this.data[this.pos++],this.compressionMethod=this.data[this.pos++],this.filterMethod=this.data[this.pos++],this.interlaceMethod=this.data[this.pos++];break;case"acTL":this.animation={numFrames:this.readUInt32(),numPlays:this.readUInt32()||1/0,frames:[]};break;case"PLTE":this.palette=this.read(e);break;case"fcTL":s&&this.animation.frames.push(s),this.pos+=4,s={width:this.readUInt32(),height:this.readUInt32(),xOffset:this.readUInt32(),yOffset:this.readUInt32()},o=this.readUInt16(),i=this.readUInt16()||100,s.delay=1e3*o/i,s.disposeOp=this.data[this.pos++],s.blendOp=this.data[this.pos++],s.data=[];break;case"IDAT":case"fdAT":for("fdAT"===l&&(this.pos+=4,e-=4),t=(null!=s?s.data:void 0)||this.imgData,a=f=0;e>=0?e>f:f>e;a=e>=0?++f:--f)t.push(this.data[this.pos++]);break;case"tRNS":switch(this.transparency={},this.colorType){case 3:if(r=this.palette.length/3,this.transparency.indexed=this.read(e),this.transparency.indexed.length>r)throw new Error("More transparent colors than palette size");if(h=r-this.transparency.indexed.length,h>0)for(a=p=0;h>=0?h>p:p>h;a=h>=0?++p:--p)this.transparency.indexed.push(255);break;case 0:this.transparency.grayscale=this.read(e)[0];break;case 2:this.transparency.rgb=this.read(e)}break;case"tEXt":d=this.read(e),c=d.indexOf(0),u=String.fromCharCode.apply(String,d.slice(0,c)),this.text[u]=String.fromCharCode.apply(String,d.slice(c+1));break;case"IEND":return s&&this.animation.frames.push(s),this.colors=function(){switch(this.colorType){case 0:case 3:case 4:return 1;case 2:case 6:return 3}}.call(this),this.hasAlphaChannel=4===(m=this.colorType)||6===m,n=this.colors+(this.hasAlphaChannel?1:0),this.pixelBitlength=this.bits*n,this.colorSpace=function(){switch(this.colors){case 1:return"DeviceGray";case 3:return"DeviceRGB"}}.call(this),void(this.imgData=new Uint8Array(this.imgData));default:this.pos+=e}if(this.pos+=4,this.pos>this.data.length)throw new Error("Incomplete or corrupt PNG file")}}var n,r,i,o,s,a,c,u;e.load=function(t,n,r){var i;return"function"==typeof n&&(r=n),i=new XMLHttpRequest,i.open("GET",t,!0),i.responseType="arraybuffer",i.onload=function(){var t,o;return t=new Uint8Array(i.response||i.mozResponseArrayBuffer),o=new e(t),"function"==typeof(null!=n?n.getContext:void 0)&&o.render(n),"function"==typeof r?r(o):void 0},i.send(null)},o=0,i=1,s=2,r=0,n=1,e.prototype.read=function(t){var e,n,r;for(r=[],e=n=0;t>=0?t>n:n>t;e=t>=0?++n:--n)r.push(this.data[this.pos++]);return r},e.prototype.readUInt32=function(){var t,e,n,r;return t=this.data[this.pos++]<<24,e=this.data[this.pos++]<<16,n=this.data[this.pos++]<<8,r=this.data[this.pos++],t|e|n|r},e.prototype.readUInt16=function(){var t,e;return t=this.data[this.pos++]<<8,e=this.data[this.pos++],t|e},e.prototype.decodePixels=function(t){var e,n,r,i,o,s,a,c,u,l,h,d,f,p,m,g,w,y,v,b,x,k,C;if(null==t&&(t=this.imgData),0===t.length)return new Uint8Array(0);for(t=new FlateStream(t),t=t.getBytes(),d=this.pixelBitlength/8,g=d*this.width,f=new Uint8Array(g*this.height),s=t.length,m=0,p=0,n=0;s>p;){switch(t[p++]){case 0:for(i=v=0;g>v;i=v+=1)f[n++]=t[p++];break;case 1:for(i=b=0;g>b;i=b+=1)e=t[p++],o=d>i?0:f[n-d],f[n++]=(e+o)%256;break;case 2:for(i=x=0;g>x;i=x+=1)e=t[p++],r=(i-i%d)/d,w=m&&f[(m-1)*g+r*d+i%d],f[n++]=(w+e)%256;break;case 3:for(i=k=0;g>k;i=k+=1)e=t[p++],r=(i-i%d)/d,o=d>i?0:f[n-d],w=m&&f[(m-1)*g+r*d+i%d],f[n++]=(e+Math.floor((o+w)/2))%256;break;case 4:for(i=C=0;g>C;i=C+=1)e=t[p++],r=(i-i%d)/d,o=d>i?0:f[n-d],0===m?w=y=0:(w=f[(m-1)*g+r*d+i%d],y=r&&f[(m-1)*g+(r-1)*d+i%d]),a=o+w-y,c=Math.abs(a-o),l=Math.abs(a-w),h=Math.abs(a-y),u=l>=c&&h>=c?o:h>=l?w:y,f[n++]=(e+u)%256;break;default:throw new Error("Invalid filter algorithm: "+t[p-1])}m++}return f},e.prototype.decodePalette=function(){var t,e,n,r,i,o,s,a,c,u;for(r=this.palette,s=this.transparency.indexed||[],o=new Uint8Array((s.length||0)+r.length),i=0,n=r.length,t=0,e=a=0,c=r.length;c>a;e=a+=3)o[i++]=r[e],o[i++]=r[e+1],o[i++]=r[e+2],o[i++]=null!=(u=s[t++])?u:255;return o},e.prototype.copyToImageData=function(t,e){var n,r,i,o,s,a,c,u,l,h,d;if(r=this.colors,l=null,n=this.hasAlphaChannel,this.palette.length&&(l=null!=(d=this._decodedPalette)?d:this._decodedPalette=this.decodePalette(),r=4,n=!0),i=t.data||t,u=i.length,s=l||e,o=a=0,1===r)for(;u>o;)c=l?4*e[o/4]:a,h=s[c++],i[o++]=h,i[o++]=h,i[o++]=h,i[o++]=n?s[c++]:255,a=c;else for(;u>o;)c=l?4*e[o/4]:a,i[o++]=s[c++],i[o++]=s[c++],i[o++]=s[c++],i[o++]=n?s[c++]:255,a=c},e.prototype.decode=function(){var t;return t=new Uint8Array(this.width*this.height*4),this.copyToImageData(t,this.decodePixels()),t};try{c=t.document.createElement("canvas"),u=c.getContext("2d")}catch(l){return-1}return a=function(t){var e;return u.width=t.width,u.height=t.height,u.clearRect(0,0,t.width,t.height),u.putImageData(t,0,0),e=new Image,e.src=c.toDataURL(),e},e.prototype.decodeFrames=function(t){var e,n,r,i,o,s,c,u;if(this.animation){for(c=this.animation.frames,u=[],n=o=0,s=c.length;s>o;n=++o)e=c[n],r=t.createImageData(e.width,e.height),i=this.decodePixels(new Uint8Array(e.data)),this.copyToImageData(r,i),e.imageData=r,u.push(e.image=a(r));return u}},e.prototype.renderFrame=function(t,e){var n,o,a;return o=this.animation.frames,n=o[e],a=o[e-1],0===e&&t.clearRect(0,0,this.width,this.height),(null!=a?a.disposeOp:void 0)===i?t.clearRect(a.xOffset,a.yOffset,a.width,a.height):(null!=a?a.disposeOp:void 0)===s&&t.putImageData(a.imageData,a.xOffset,a.yOffset),n.blendOp===r&&t.clearRect(n.xOffset,n.yOffset,n.width,n.height),t.drawImage(n.image,n.xOffset,n.yOffset)},e.prototype.animate=function(t){var e,n,r,i,o,s,a=this;return n=0,s=this.animation,i=s.numFrames,r=s.frames,o=s.numPlays,(e=function(){var s,c;return s=n++%i,c=r[s],a.renderFrame(t,s),i>1&&o>n/i?a.animation._timeout=setTimeout(e,c.delay):void 0})()},e.prototype.stopAnimation=function(){var t;return clearTimeout(null!=(t=this.animation)?t._timeout:void 0)},e.prototype.render=function(t){var e,n;return t._png&&t._png.stopAnimation(),t._png=this,t.width=this.width,t.height=this.height,e=t.getContext("2d"),this.animation?(this.decodeFrames(e),this.animate(e)):(n=e.createImageData(this.width,this.height),this.copyToImageData(n,this.decodePixels()),e.putImageData(n,0,0))},e}(),t.PNG=e}("undefined"!=typeof window&&window||this);var DecodeStream=function(){function t(){this.pos=0,this.bufferLength=0,this.eof=!1,this.buffer=null}return t.prototype={ensureBuffer:function(t){var e=this.buffer,n=e?e.byteLength:0;if(n>t)return e;for(var r=512;t>r;)r<<=1;for(var i=new Uint8Array(r),o=0;n>o;++o)i[o]=e[o];return this.buffer=i},getByte:function(){for(var t=this.pos;this.bufferLength<=t;){if(this.eof)return null;this.readBlock()}return this.buffer[this.pos++]},getBytes:function(t){var e=this.pos;if(t){this.ensureBuffer(e+t);for(var n=e+t;!this.eof&&this.bufferLength<n;)this.readBlock();var r=this.bufferLength;n>r&&(n=r)}else{for(;!this.eof;)this.readBlock();var n=this.bufferLength}return this.pos=n,this.buffer.subarray(e,n)},lookChar:function(){for(var t=this.pos;this.bufferLength<=t;){if(this.eof)return null;this.readBlock()}return String.fromCharCode(this.buffer[this.pos])},getChar:function(){for(var t=this.pos;this.bufferLength<=t;){if(this.eof)return null;this.readBlock()}return String.fromCharCode(this.buffer[this.pos++])},makeSubStream:function(t,e,n){for(var r=t+e;this.bufferLength<=r&&!this.eof;)this.readBlock();return new Stream(this.buffer,t,e,n)},skip:function(t){t||(t=1),this.pos+=t},reset:function(){this.pos=0}},t}(),FlateStream=function(){function t(t){throw new Error(t)}function e(e){var n=0,r=e[n++],i=e[n++];(-1==r||-1==i)&&t("Invalid header in flate stream"),8!=(15&r)&&t("Unknown compression method in flate stream"),((r<<8)+i)%31!=0&&t("Bad FCHECK in flate stream"),32&i&&t("FDICT bit set in flate stream"),this.bytes=e,this.bytesPos=n,this.codeSize=0,this.codeBuf=0,DecodeStream.call(this)}if("undefined"==typeof Uint32Array)return void 0;var n=new Uint32Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),r=new Uint32Array([3,4,5,6,7,8,9,10,65547,65549,65551,65553,131091,131095,131099,131103,196643,196651,196659,196667,262211,262227,262243,262259,327811,327843,327875,327907,258,258,258]),i=new Uint32Array([1,2,3,4,65541,65543,131081,131085,196625,196633,262177,262193,327745,327777,393345,393409,459009,459137,524801,525057,590849,591361,657409,658433,724993,727041,794625,798721,868353,876545]),o=[new Uint32Array([459008,524368,524304,524568,459024,524400,524336,590016,459016,524384,524320,589984,524288,524416,524352,590048,459012,524376,524312,589968,459028,524408,524344,590032,459020,524392,524328,59e4,524296,524424,524360,590064,459010,524372,524308,524572,459026,524404,524340,590024,459018,524388,524324,589992,524292,524420,524356,590056,459014,524380,524316,589976,459030,524412,524348,590040,459022,524396,524332,590008,524300,524428,524364,590072,459009,524370,524306,524570,459025,524402,524338,590020,459017,524386,524322,589988,524290,524418,524354,590052,459013,524378,524314,589972,459029,524410,524346,590036,459021,524394,524330,590004,524298,524426,524362,590068,459011,524374,524310,524574,459027,524406,524342,590028,459019,524390,524326,589996,524294,524422,524358,590060,459015,524382,524318,589980,459031,524414,524350,590044,459023,524398,524334,590012,524302,524430,524366,590076,459008,524369,524305,524569,459024,524401,524337,590018,459016,524385,524321,589986,524289,524417,524353,590050,459012,524377,524313,589970,459028,524409,524345,590034,459020,524393,524329,590002,524297,524425,524361,590066,459010,524373,524309,524573,459026,524405,524341,590026,459018,524389,524325,589994,524293,524421,524357,590058,459014,524381,524317,589978,459030,524413,524349,590042,459022,524397,524333,590010,524301,524429,524365,590074,459009,524371,524307,524571,459025,524403,524339,590022,459017,524387,524323,589990,524291,524419,524355,590054,459013,524379,524315,589974,459029,524411,524347,590038,459021,524395,524331,590006,524299,524427,524363,590070,459011,524375,524311,524575,459027,524407,524343,590030,459019,524391,524327,589998,524295,524423,524359,590062,459015,524383,524319,589982,459031,524415,524351,590046,459023,524399,524335,590014,524303,524431,524367,590078,459008,524368,524304,524568,459024,524400,524336,590017,459016,524384,524320,589985,524288,524416,524352,590049,459012,524376,524312,589969,459028,524408,524344,590033,459020,524392,524328,590001,524296,524424,524360,590065,459010,524372,524308,524572,459026,524404,524340,590025,459018,524388,524324,589993,524292,524420,524356,590057,459014,524380,524316,589977,459030,524412,524348,590041,459022,524396,524332,590009,524300,524428,524364,590073,459009,524370,524306,524570,459025,524402,524338,590021,459017,524386,524322,589989,524290,524418,524354,590053,459013,524378,524314,589973,459029,524410,524346,590037,459021,524394,524330,590005,524298,524426,524362,590069,459011,524374,524310,524574,459027,524406,524342,590029,459019,524390,524326,589997,524294,524422,524358,590061,459015,524382,524318,589981,459031,524414,524350,590045,459023,524398,524334,590013,524302,524430,524366,590077,459008,524369,524305,524569,459024,524401,524337,590019,459016,524385,524321,589987,524289,524417,524353,590051,459012,524377,524313,589971,459028,524409,524345,590035,459020,524393,524329,590003,524297,524425,524361,590067,459010,524373,524309,524573,459026,524405,524341,590027,459018,524389,524325,589995,524293,524421,524357,590059,459014,524381,524317,589979,459030,524413,524349,590043,459022,524397,524333,590011,524301,524429,524365,590075,459009,524371,524307,524571,459025,524403,524339,590023,459017,524387,524323,589991,524291,524419,524355,590055,459013,524379,524315,589975,459029,524411,524347,590039,459021,524395,524331,590007,524299,524427,524363,590071,459011,524375,524311,524575,459027,524407,524343,590031,459019,524391,524327,589999,524295,524423,524359,590063,459015,524383,524319,589983,459031,524415,524351,590047,459023,524399,524335,590015,524303,524431,524367,590079]),9],s=[new Uint32Array([327680,327696,327688,327704,327684,327700,327692,327708,327682,327698,327690,327706,327686,327702,327694,0,327681,327697,327689,327705,327685,327701,327693,327709,327683,327699,327691,327707,327687,327703,327695,0]),5];return e.prototype=Object.create(DecodeStream.prototype),e.prototype.getBits=function(e){for(var n,r=this.codeSize,i=this.codeBuf,o=this.bytes,s=this.bytesPos;e>r;)"undefined"==typeof(n=o[s++])&&t("Bad encoding in flate stream"),i|=n<<r,r+=8;return n=i&(1<<e)-1,this.codeBuf=i>>e,this.codeSize=r-=e,this.bytesPos=s,n},e.prototype.getCode=function(e){for(var n=e[0],r=e[1],i=this.codeSize,o=this.codeBuf,s=this.bytes,a=this.bytesPos;r>i;){var c;"undefined"==typeof(c=s[a++])&&t("Bad encoding in flate stream"),o|=c<<i,i+=8}var u=n[o&(1<<r)-1],l=u>>16,h=65535&u;return(0==i||l>i||0==l)&&t("Bad encoding in flate stream"),this.codeBuf=o>>l,this.codeSize=i-l,this.bytesPos=a,h},e.prototype.generateHuffmanTable=function(t){for(var e=t.length,n=0,r=0;e>r;++r)t[r]>n&&(n=t[r]);for(var i=1<<n,o=new Uint32Array(i),s=1,a=0,c=2;n>=s;++s,a<<=1,c<<=1)for(var u=0;e>u;++u)if(t[u]==s){for(var l=0,h=a,r=0;s>r;++r)l=l<<1|1&h,h>>=1;for(var r=l;i>r;r+=c)o[r]=s<<16|u;++a}return[o,n]},e.prototype.readBlock=function(){function e(t,e,n,r,i){for(var o=t.getBits(n)+r;o-->0;)e[C++]=i}var a=this.getBits(3);if(1&a&&(this.eof=!0),a>>=1,0==a){var c,u=this.bytes,l=this.bytesPos;"undefined"==typeof(c=u[l++])&&t("Bad block header in flate stream");var h=c;"undefined"==typeof(c=u[l++])&&t("Bad block header in flate stream"),h|=c<<8,"undefined"==typeof(c=u[l++])&&t("Bad block header in flate stream");var d=c;"undefined"==typeof(c=u[l++])&&t("Bad block header in flate stream"),d|=c<<8,d!=(65535&~h)&&t("Bad uncompressed block length in flate stream"),this.codeBuf=0,this.codeSize=0;var f=this.bufferLength,p=this.ensureBuffer(f+h),m=f+h;this.bufferLength=m;for(var g=f;m>g;++g){if("undefined"==typeof(c=u[l++])){this.eof=!0;break}p[g]=c}return void(this.bytesPos=l)}var w,y;if(1==a)w=o,y=s;else if(2==a){for(var v=this.getBits(5)+257,b=this.getBits(5)+1,x=this.getBits(4)+4,k=Array(n.length),C=0;x>C;)k[n[C++]]=this.getBits(3);for(var E=this.generateHuffmanTable(k),S=0,C=0,T=v+b,_=new Array(T);T>C;){var q=this.getCode(E);16==q?e(this,_,2,3,S):17==q?e(this,_,3,3,S=0):18==q?e(this,_,7,11,S=0):_[C++]=S=q}w=this.generateHuffmanTable(_.slice(0,v)),y=this.generateHuffmanTable(_.slice(v,T))}else t("Unknown block type in flate stream");for(var p=this.buffer,I=p?p.length:0,P=this.bufferLength;;){var A=this.getCode(w);if(256>A)P+1>=I&&(p=this.ensureBuffer(P+1),I=p.length),p[P++]=A;else{if(256==A)return void(this.bufferLength=P);A-=257,A=r[A];var O=A>>16;O>0&&(O=this.getBits(O));var S=(65535&A)+O;A=this.getCode(y),A=i[A],O=A>>16,O>0&&(O=this.getBits(O));var R=(65535&A)+O;P+S>=I&&(p=this.ensureBuffer(P+S),I=p.length);for(var N=0;S>N;++N,++P)p[P]=p[P-R]}}},e}();!function(t){var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";"undefined"==typeof t.btoa&&(t.btoa=function(t){var n,r,i,o,s,a,c,u,l=0,h=0,d="",f=[];if(!t)return t;do n=t.charCodeAt(l++),r=t.charCodeAt(l++),i=t.charCodeAt(l++),u=n<<16|r<<8|i,o=u>>18&63,s=u>>12&63,a=u>>6&63,c=63&u,f[h++]=e.charAt(o)+e.charAt(s)+e.charAt(a)+e.charAt(c);while(l<t.length);d=f.join("");var p=t.length%3;return(p?d.slice(0,p-3):d)+"===".slice(p||3)}),"undefined"==typeof t.atob&&(t.atob=function(t){var n,r,i,o,s,a,c,u,l=0,h=0,d="",f=[];if(!t)return t;t+="";do o=e.indexOf(t.charAt(l++)),s=e.indexOf(t.charAt(l++)),a=e.indexOf(t.charAt(l++)),c=e.indexOf(t.charAt(l++)),u=o<<18|s<<12|a<<6|c,n=u>>16&255,r=u>>8&255,i=255&u,64==a?f[h++]=String.fromCharCode(n):64==c?f[h++]=String.fromCharCode(n,r):f[h++]=String.fromCharCode(n,r,i);while(l<t.length);return d=f.join("")}),Array.prototype.map||(Array.prototype.map=function(t){if(void 0===this||null===this||"function"!=typeof t)throw new TypeError;for(var e=Object(this),n=e.length>>>0,r=new Array(n),i=arguments.length>1?arguments[1]:void 0,o=0;n>o;o++)o in e&&(r[o]=t.call(i,e[o],o,e));return r}),Array.isArray||(Array.isArray=function(t){return"[object Array]"===Object.prototype.toString.call(t)}),Array.prototype.forEach||(Array.prototype.forEach=function(t,e){"use strict";if(void 0===this||null===this||"function"!=typeof t)throw new TypeError;for(var n=Object(this),r=n.length>>>0,i=0;r>i;i++)i in n&&t.call(e,n[i],i,n)}),Object.keys||(Object.keys=function(){"use strict";var t=Object.prototype.hasOwnProperty,e=!{toString:null}.propertyIsEnumerable("toString"),n=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],r=n.length;return function(i){if("object"!=typeof i&&("function"!=typeof i||null===i))throw new TypeError;var o,s,a=[];for(o in i)t.call(i,o)&&a.push(o);if(e)for(s=0;r>s;s++)t.call(i,n[s])&&a.push(n[s]);return a}}()),String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")}),String.prototype.trimLeft||(String.prototype.trimLeft=function(){return this.replace(/^\s+/g,"")}),String.prototype.trimRight||(String.prototype.trimRight=function(){return this.replace(/\s+$/g,"")})}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this),"object"==typeof require&&("undefined"==typeof require_baseUrl_override&&(require_baseUrl_override="../"),require.config({baseUrl:require_baseUrl_override,shim:{"plugins/standard_fonts_metrics":{deps:["jspdf"]},"plugins/split_text_to_size":{deps:["jspdf"]},"plugins/annotations":{deps:["jspdf","plugins/standard_fonts_metrics","plugins/split_text_to_size"]},"plugins/outline":{deps:["jspdf"]},"plugins/addimage":{deps:["jspdf"]},"plugins/png_support":{deps:["jspdf","libs/png_support/png","libs/png_support/zlib"]},"plugins/from_html":{deps:["jspdf"]},"plugins/context2d":{deps:["jspdf","plugins/png_support","plugins/addimage","libs/css_colors"]},"libs/html2canvas/dist/html2canvas":{deps:["jspdf"]},"plugins/canvas":{deps:["jspdf"]},html2pdf:{deps:["jspdf","plugins/standard_fonts_metrics","plugins/split_text_to_size","plugins/png_support","plugins/context2d","plugins/canvas","plugins/annotations","libs/html2canvas/dist/html2canvas"]},"test/test_harness":{deps:["jspdf","jspdf.plugin.standard_fonts_metrics","jspdf.plugin.split_text_to_size"]}},paths:{html2pdf:"libs/html2pdf"}}));var requirejs,require,define;!function(global){function isFunction(t){return"[object Function]"===ostring.call(t)}function isArray(t){return"[object Array]"===ostring.call(t)}function each(t,e){if(t){var n;for(n=0;n<t.length&&(!t[n]||!e(t[n],n,t));n+=1);}}function eachReverse(t,e){if(t){var n;for(n=t.length-1;n>-1&&(!t[n]||!e(t[n],n,t));n-=1);}}function hasProp(t,e){return hasOwn.call(t,e)}function getOwn(t,e){return hasProp(t,e)&&t[e]}function eachProp(t,e){var n;for(n in t)if(hasProp(t,n)&&e(t[n],n))break}function mixin(t,e,n,r){return e&&eachProp(e,function(e,i){(n||!hasProp(t,i))&&(!r||"object"!=typeof e||!e||isArray(e)||isFunction(e)||e instanceof RegExp?t[i]=e:(t[i]||(t[i]={}),mixin(t[i],e,n,r)))}),t}function bind(t,e){return function(){return e.apply(t,arguments)}}function scripts(){return document.getElementsByTagName("script")}function defaultOnError(t){throw t}function getGlobal(t){if(!t)return t;var e=global;return each(t.split("."),function(t){e=e[t]}),e}function makeError(t,e,n,r){var i=new Error(e+"\nhttp://requirejs.org/docs/errors.html#"+t);return i.requireType=t,i.requireModules=r,n&&(i.originalError=n),i}function newContext(t){function e(t){var e,n;for(e=0;e<t.length;e++)if(n=t[e],"."===n)t.splice(e,1),e-=1;else if(".."===n){if(0===e||1==e&&".."===t[2]||".."===t[e-1])continue;e>0&&(t.splice(e-1,2),e-=2)}}function n(t,n,r){var i,o,s,a,c,u,l,h,d,f,p,m,g=n&&n.split("/"),w=C.map,y=w&&w["*"];if(t&&(t=t.split("/"),l=t.length-1,C.nodeIdCompat&&jsSuffixRegExp.test(t[l])&&(t[l]=t[l].replace(jsSuffixRegExp,"")),"."===t[0].charAt(0)&&g&&(m=g.slice(0,g.length-1),t=m.concat(t)),e(t),t=t.join("/")),r&&w&&(g||y)){s=t.split("/");t:for(a=s.length;a>0;a-=1){if(u=s.slice(0,a).join("/"),g)for(c=g.length;c>0;c-=1)if(o=getOwn(w,g.slice(0,c).join("/")),o&&(o=getOwn(o,u))){h=o,d=a;break t}!f&&y&&getOwn(y,u)&&(f=getOwn(y,u),p=a)}!h&&f&&(h=f,d=p),h&&(s.splice(0,d,h),t=s.join("/"))}return i=getOwn(C.pkgs,t),i?i:t}function r(t){isBrowser&&each(scripts(),function(e){return e.getAttribute("data-requiremodule")===t&&e.getAttribute("data-requirecontext")===b.contextName?(e.parentNode.removeChild(e),!0):void 0})}function i(t){var e=getOwn(C.paths,t);return e&&isArray(e)&&e.length>1?(e.shift(),b.require.undef(t),b.makeRequire(null,{skipMap:!0})([t]),!0):void 0}function o(t){var e,n=t?t.indexOf("!"):-1;return n>-1&&(e=t.substring(0,n),t=t.substring(n+1,t.length)),[e,t]}function s(t,e,r,i){var s,a,c,u,l=null,h=e?e.name:null,d=t,f=!0,p="";return t||(f=!1,t="_@r"+(A+=1)),u=o(t),l=u[0],t=u[1],l&&(l=n(l,h,i),a=getOwn(q,l)),t&&(l?p=a&&a.normalize?a.normalize(t,function(t){return n(t,h,i)}):-1===t.indexOf("!")?n(t,h,i):t:(p=n(t,h,i),u=o(p),l=u[0],p=u[1],r=!0,s=b.nameToUrl(p))),c=!l||a||r?"":"_unnormalized"+(O+=1),{prefix:l,name:p,parentMap:e,unnormalized:!!c,url:s,originalName:d,isDefine:f,id:(l?l+"!"+p:p)+c}}function a(t){var e=t.id,n=getOwn(E,e);return n||(n=E[e]=new b.Module(t)),n}function c(t,e,n){var r=t.id,i=getOwn(E,r);!hasProp(q,r)||i&&!i.defineEmitComplete?(i=a(t),i.error&&"error"===e?n(i.error):i.on(e,n)):"defined"===e&&n(q[r])}function u(t,e){var n=t.requireModules,r=!1;e?e(t):(each(n,function(e){var n=getOwn(E,e);n&&(n.error=t,n.events.error&&(r=!0,n.emit("error",t)))}),r||req.onError(t))}function l(){globalDefQueue.length&&(apsp.apply(_,[_.length,0].concat(globalDefQueue)),globalDefQueue=[])}function h(t){delete E[t],delete S[t]}function d(t,e,n){var r=t.map.id;t.error?t.emit("error",t.error):(e[r]=!0,each(t.depMaps,function(r,i){var o=r.id,s=getOwn(E,o);!s||t.depMatched[i]||n[o]||(getOwn(e,o)?(t.defineDep(i,q[o]),t.check()):d(s,e,n))}),n[r]=!0)}function f(){var t,e,n=1e3*C.waitSeconds,o=n&&b.startTime+n<(new Date).getTime(),s=[],a=[],c=!1,l=!0;if(!y){if(y=!0,eachProp(S,function(t){var n=t.map,u=n.id;if(t.enabled&&(n.isDefine||a.push(t),!t.error))if(!t.inited&&o)i(u)?(e=!0,c=!0):(s.push(u),r(u));else if(!t.inited&&t.fetched&&n.isDefine&&(c=!0,!n.prefix))return l=!1}),o&&s.length)return t=makeError("timeout","Load timeout for modules: "+s,null,s),t.contextName=b.contextName,u(t);l&&each(a,function(t){d(t,{},{})}),o&&!e||!c||!isBrowser&&!isWebWorker||k||(k=setTimeout(function(){k=0,f()},50)),y=!1}}function p(t){hasProp(q,t[0])||a(s(t[0],null,!0)).init(t[1],t[2])}function m(t,e,n,r){t.detachEvent&&!isOpera?r&&t.detachEvent(r,e):t.removeEventListener(n,e,!1)}function g(t){var e=t.currentTarget||t.srcElement;return m(e,b.onScriptLoad,"load","onreadystatechange"),m(e,b.onScriptError,"error"),{node:e,id:e&&e.getAttribute("data-requiremodule")}}function w(){var t;for(l();_.length;){if(t=_.shift(),null===t[0])return u(makeError("mismatch","Mismatched anonymous define() module: "+t[t.length-1]));p(t)}}var y,v,b,x,k,C={waitSeconds:7,baseUrl:"./",paths:{},bundles:{},pkgs:{},shim:{},config:{}},E={},S={},T={},_=[],q={},I={},P={},A=1,O=1;return x={require:function(t){return t.require?t.require:t.require=b.makeRequire(t.map)},exports:function(t){return t.usingExports=!0,t.map.isDefine?t.exports?q[t.map.id]=t.exports:t.exports=q[t.map.id]={}:void 0},module:function(t){return t.module?t.module:t.module={id:t.map.id,uri:t.map.url,config:function(){return getOwn(C.config,t.map.id)||{}},exports:t.exports||(t.exports={})}}},v=function(t){this.events=getOwn(T,t.id)||{},this.map=t,this.shim=getOwn(C.shim,t.id),this.depExports=[],this.depMaps=[],this.depMatched=[],this.pluginMaps={},this.depCount=0},v.prototype={init:function(t,e,n,r){r=r||{},this.inited||(this.factory=e,n?this.on("error",n):this.events.error&&(n=bind(this,function(t){this.emit("error",t)})),this.depMaps=t&&t.slice(0),this.errback=n,this.inited=!0,this.ignore=r.ignore,r.enabled||this.enabled?this.enable():this.check())},defineDep:function(t,e){this.depMatched[t]||(this.depMatched[t]=!0,this.depCount-=1,this.depExports[t]=e)},fetch:function(){if(!this.fetched){this.fetched=!0,b.startTime=(new Date).getTime();var t=this.map;return this.shim?void b.makeRequire(this.map,{enableBuildCallback:!0})(this.shim.deps||[],bind(this,function(){return t.prefix?this.callPlugin():this.load()})):t.prefix?this.callPlugin():this.load()}},load:function(){var t=this.map.url;I[t]||(I[t]=!0,b.load(this.map.id,t))},check:function(){if(this.enabled&&!this.enabling){var t,e,n=this.map.id,r=this.depExports,i=this.exports,o=this.factory;if(this.inited){if(this.error)this.emit("error",this.error);else if(!this.defining){if(this.defining=!0,this.depCount<1&&!this.defined){if(isFunction(o)){if(this.events.error&&this.map.isDefine||req.onError!==defaultOnError)try{i=b.execCb(n,o,r,i)}catch(s){t=s}else i=b.execCb(n,o,r,i);if(this.map.isDefine&&void 0===i&&(e=this.module,e?i=e.exports:this.usingExports&&(i=this.exports)),t)return t.requireMap=this.map,t.requireModules=this.map.isDefine?[this.map.id]:null,t.requireType=this.map.isDefine?"define":"require",u(this.error=t)}else i=o;this.exports=i,this.map.isDefine&&!this.ignore&&(q[n]=i,req.onResourceLoad&&req.onResourceLoad(b,this.map,this.depMaps)),h(n),this.defined=!0}this.defining=!1,this.defined&&!this.defineEmitted&&(this.defineEmitted=!0,this.emit("defined",this.exports),this.defineEmitComplete=!0)}}else this.fetch()}},callPlugin:function(){var t=this.map,e=t.id,r=s(t.prefix);this.depMaps.push(r),c(r,"defined",bind(this,function(r){var i,o,l,d=getOwn(P,this.map.id),f=this.map.name,p=this.map.parentMap?this.map.parentMap.name:null,m=b.makeRequire(t.parentMap,{enableBuildCallback:!0});return this.map.unnormalized?(r.normalize&&(f=r.normalize(f,function(t){return n(t,p,!0)})||""),o=s(t.prefix+"!"+f,this.map.parentMap),c(o,"defined",bind(this,function(t){this.init([],function(){return t},null,{enabled:!0,ignore:!0})})),l=getOwn(E,o.id),void(l&&(this.depMaps.push(o),this.events.error&&l.on("error",bind(this,function(t){this.emit("error",t)})),l.enable()))):d?(this.map.url=b.nameToUrl(d),void this.load()):(i=bind(this,function(t){this.init([],function(){return t},null,{enabled:!0})}),i.error=bind(this,function(t){this.inited=!0,this.error=t,t.requireModules=[e],eachProp(E,function(t){0===t.map.id.indexOf(e+"_unnormalized")&&h(t.map.id)}),u(t)}),i.fromText=bind(this,function(n,r){var o=t.name,c=s(o),l=useInteractive;r&&(n=r),l&&(useInteractive=!1),a(c),hasProp(C.config,e)&&(C.config[o]=C.config[e]);try{req.exec(n)}catch(h){return u(makeError("fromtexteval","fromText eval for "+e+" failed: "+h,h,[e]))}l&&(useInteractive=!0),this.depMaps.push(c),b.completeLoad(o),m([o],i)}),void r.load(t.name,m,i,C))})),b.enable(r,this),this.pluginMaps[r.id]=r},enable:function(){S[this.map.id]=this,this.enabled=!0,this.enabling=!0,each(this.depMaps,bind(this,function(t,e){var n,r,i;if("string"==typeof t){if(t=s(t,this.map.isDefine?this.map:this.map.parentMap,!1,!this.skipMap),this.depMaps[e]=t,i=getOwn(x,t.id))return void(this.depExports[e]=i(this));this.depCount+=1,c(t,"defined",bind(this,function(t){this.defineDep(e,t),this.check()})),this.errback&&c(t,"error",bind(this,this.errback))}n=t.id,r=E[n],hasProp(x,n)||!r||r.enabled||b.enable(t,this)})),eachProp(this.pluginMaps,bind(this,function(t){var e=getOwn(E,t.id);e&&!e.enabled&&b.enable(t,this)})),this.enabling=!1,this.check()},on:function(t,e){var n=this.events[t];n||(n=this.events[t]=[]),n.push(e)},emit:function(t,e){each(this.events[t],function(t){t(e)}),"error"===t&&delete this.events[t]}},b={config:C,contextName:t,registry:E,defined:q,urlFetched:I,defQueue:_,Module:v,makeModuleMap:s,nextTick:req.nextTick,onError:u,configure:function(t){t.baseUrl&&"/"!==t.baseUrl.charAt(t.baseUrl.length-1)&&(t.baseUrl+="/");var e=C.shim,n={paths:!0,bundles:!0,config:!0,map:!0};eachProp(t,function(t,e){n[e]?(C[e]||(C[e]={}),mixin(C[e],t,!0,!0)):C[e]=t}),t.bundles&&eachProp(t.bundles,function(t,e){each(t,function(t){t!==e&&(P[t]=e)})}),t.shim&&(eachProp(t.shim,function(t,n){isArray(t)&&(t={deps:t}),!t.exports&&!t.init||t.exportsFn||(t.exportsFn=b.makeShimExports(t)),e[n]=t}),C.shim=e),t.packages&&each(t.packages,function(t){var e,n;t="string"==typeof t?{name:t}:t,n=t.name,e=t.location,e&&(C.paths[n]=t.location),C.pkgs[n]=t.name+"/"+(t.main||"main").replace(currDirRegExp,"").replace(jsSuffixRegExp,"")}),eachProp(E,function(t,e){t.inited||t.map.unnormalized||(t.map=s(e))}),(t.deps||t.callback)&&b.require(t.deps||[],t.callback)},makeShimExports:function(t){function e(){var e;return t.init&&(e=t.init.apply(global,arguments)),
e||t.exports&&getGlobal(t.exports)}return e},makeRequire:function(e,i){function o(n,r,c){var l,h,d;return i.enableBuildCallback&&r&&isFunction(r)&&(r.__requireJsBuild=!0),"string"==typeof n?isFunction(r)?u(makeError("requireargs","Invalid require call"),c):e&&hasProp(x,n)?x[n](E[e.id]):req.get?req.get(b,n,e,o):(h=s(n,e,!1,!0),l=h.id,hasProp(q,l)?q[l]:u(makeError("notloaded",'Module name "'+l+'" has not been loaded yet for context: '+t+(e?"":". Use require([])")))):(w(),b.nextTick(function(){w(),d=a(s(null,e)),d.skipMap=i.skipMap,d.init(n,r,c,{enabled:!0}),f()}),o)}return i=i||{},mixin(o,{isBrowser:isBrowser,toUrl:function(t){var r,i=t.lastIndexOf("."),o=t.split("/")[0],s="."===o||".."===o;return-1!==i&&(!s||i>1)&&(r=t.substring(i,t.length),t=t.substring(0,i)),b.nameToUrl(n(t,e&&e.id,!0),r,!0)},defined:function(t){return hasProp(q,s(t,e,!1,!0).id)},specified:function(t){return t=s(t,e,!1,!0).id,hasProp(q,t)||hasProp(E,t)}}),e||(o.undef=function(t){l();var n=s(t,e,!0),i=getOwn(E,t);r(t),delete q[t],delete I[n.url],delete T[t],eachReverse(_,function(e,n){e[0]===t&&_.splice(n,1)}),i&&(i.events.defined&&(T[t]=i.events),h(t))}),o},enable:function(t){var e=getOwn(E,t.id);e&&a(t).enable()},completeLoad:function(t){var e,n,r,o=getOwn(C.shim,t)||{},s=o.exports;for(l();_.length;){if(n=_.shift(),null===n[0]){if(n[0]=t,e)break;e=!0}else n[0]===t&&(e=!0);p(n)}if(r=getOwn(E,t),!e&&!hasProp(q,t)&&r&&!r.inited){if(!(!C.enforceDefine||s&&getGlobal(s)))return i(t)?void 0:u(makeError("nodefine","No define call for "+t,null,[t]));p([t,o.deps||[],o.exportsFn])}f()},nameToUrl:function(t,e,n){var r,i,o,s,a,c,u,l=getOwn(C.pkgs,t);if(l&&(t=l),u=getOwn(P,t))return b.nameToUrl(u,e,n);if(req.jsExtRegExp.test(t))a=t+(e||"");else{for(r=C.paths,i=t.split("/"),o=i.length;o>0;o-=1)if(s=i.slice(0,o).join("/"),c=getOwn(r,s)){isArray(c)&&(c=c[0]),i.splice(0,o,c);break}a=i.join("/"),a+=e||(/^data\:|\?/.test(a)||n?"":".js"),a=("/"===a.charAt(0)||a.match(/^[\w\+\.\-]+:/)?"":C.baseUrl)+a}return C.urlArgs?a+((-1===a.indexOf("?")?"?":"&")+C.urlArgs):a},load:function(t,e){req.load(b,t,e)},execCb:function(t,e,n,r){return e.apply(r,n)},onScriptLoad:function(t){if("load"===t.type||readyRegExp.test((t.currentTarget||t.srcElement).readyState)){interactiveScript=null;var e=g(t);b.completeLoad(e.id)}},onScriptError:function(t){var e=g(t);return i(e.id)?void 0:u(makeError("scripterror","Script error for: "+e.id,t,[e.id]))}},b.require=b.makeRequire(),b}function getInteractiveScript(){return interactiveScript&&"interactive"===interactiveScript.readyState?interactiveScript:(eachReverse(scripts(),function(t){return"interactive"===t.readyState?interactiveScript=t:void 0}),interactiveScript)}var req,s,head,baseElement,dataMain,src,interactiveScript,currentlyAddingScript,mainScript,subPath,version="2.1.15",commentRegExp=/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,cjsRequireRegExp=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,jsSuffixRegExp=/\.js$/,currDirRegExp=/^\.\//,op=Object.prototype,ostring=op.toString,hasOwn=op.hasOwnProperty,ap=Array.prototype,apsp=ap.splice,isBrowser=!("undefined"==typeof window||"undefined"==typeof navigator||!window.document),isWebWorker=!isBrowser&&"undefined"!=typeof importScripts,readyRegExp=isBrowser&&"PLAYSTATION 3"===navigator.platform?/^complete$/:/^(complete|loaded)$/,defContextName="_",isOpera="undefined"!=typeof opera&&"[object Opera]"===opera.toString(),contexts={},cfg={},globalDefQueue=[],useInteractive=!1;if("undefined"==typeof define){if("undefined"!=typeof requirejs){if(isFunction(requirejs))return;cfg=requirejs,requirejs=void 0}"undefined"==typeof require||isFunction(require)||(cfg=require,require=void 0),req=requirejs=function(t,e,n,r){var i,o,s=defContextName;return isArray(t)||"string"==typeof t||(o=t,isArray(e)?(t=e,e=n,n=r):t=[]),o&&o.context&&(s=o.context),i=getOwn(contexts,s),i||(i=contexts[s]=req.s.newContext(s)),o&&i.configure(o),i.require(t,e,n)},req.config=function(t){return req(t)},req.nextTick="undefined"!=typeof setTimeout?function(t){setTimeout(t,4)}:function(t){t()},require||(require=req),req.version=version,req.jsExtRegExp=/^\/|:|\?|\.js$/,req.isBrowser=isBrowser,s=req.s={contexts:contexts,newContext:newContext},req({}),each(["toUrl","undef","defined","specified"],function(t){req[t]=function(){var e=contexts[defContextName];return e.require[t].apply(e,arguments)}}),isBrowser&&(head=s.head=document.getElementsByTagName("head")[0],baseElement=document.getElementsByTagName("base")[0],baseElement&&(head=s.head=baseElement.parentNode)),req.onError=defaultOnError,req.createNode=function(t,e,n){var r=t.xhtml?document.createElementNS("http://www.w3.org/1999/xhtml","html:script"):document.createElement("script");return r.type=t.scriptType||"text/javascript",r.charset="utf-8",r.async=!0,r},req.load=function(t,e,n){var r,i=t&&t.config||{};if(isBrowser)return r=req.createNode(i,e,n),r.setAttribute("data-requirecontext",t.contextName),r.setAttribute("data-requiremodule",e),!r.attachEvent||r.attachEvent.toString&&r.attachEvent.toString().indexOf("[native code")<0||isOpera?(r.addEventListener("load",t.onScriptLoad,!1),r.addEventListener("error",t.onScriptError,!1)):(useInteractive=!0,r.attachEvent("onreadystatechange",t.onScriptLoad)),r.src=n,currentlyAddingScript=r,baseElement?head.insertBefore(r,baseElement):head.appendChild(r),currentlyAddingScript=null,r;if(isWebWorker)try{importScripts(n),t.completeLoad(e)}catch(o){t.onError(makeError("importscripts","importScripts failed for "+e+" at "+n,o,[e]))}},isBrowser&&!cfg.skipDataMain&&eachReverse(scripts(),function(t){return head||(head=t.parentNode),dataMain=t.getAttribute("data-main"),dataMain?(mainScript=dataMain,cfg.baseUrl||(src=mainScript.split("/"),mainScript=src.pop(),subPath=src.length?src.join("/")+"/":"./",cfg.baseUrl=subPath),mainScript=mainScript.replace(jsSuffixRegExp,""),req.jsExtRegExp.test(mainScript)&&(mainScript=dataMain),cfg.deps=cfg.deps?cfg.deps.concat(mainScript):[mainScript],!0):void 0}),define=function(t,e,n){var r,i;"string"!=typeof t&&(n=e,e=t,t=null),isArray(e)||(n=e,e=null),!e&&isFunction(n)&&(e=[],n.length&&(n.toString().replace(commentRegExp,"").replace(cjsRequireRegExp,function(t,n){e.push(n)}),e=(1===n.length?["require"]:["require","exports","module"]).concat(e))),useInteractive&&(r=currentlyAddingScript||getInteractiveScript(),r&&(t||(t=r.getAttribute("data-requiremodule")),i=contexts[r.getAttribute("data-requirecontext")])),(i?i.defQueue:globalDefQueue).push([t,e,n])},define.amd={jQuery:!0},req.exec=function(text){return eval(text)},req(cfg)}}(this)}({},function(){return this}());

/*!

JSZipUtils - A collection of cross-browser utilities to go along with JSZip.
<http://stuk.github.io/jszip-utils>

(c) 2014 Stuart Knightley, David Duponchel
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip-utils/master/LICENSE.markdown.

*/
!function(a){"object"==typeof exports?module.exports=a():"function"==typeof define&&define.amd?define(a):"undefined"!=typeof window?window.JSZipUtils=a():"undefined"!=typeof global?global.JSZipUtils=a():"undefined"!=typeof self&&(self.JSZipUtils=a())}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};b[g][0].call(j.exports,function(a){var c=b[g][1][a];return e(c?c:a)},j,j.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b){"use strict";function c(){try{return new window.XMLHttpRequest}catch(a){}}function d(){try{return new window.ActiveXObject("Microsoft.XMLHTTP")}catch(a){}}var e={};e._getBinaryFromXHR=function(a){return a.response||a.responseText};var f=window.ActiveXObject?function(){return c()||d()}:c;e.getBinaryContent=function(a,b){try{var c=f();c.open("GET",a,!0),"responseType"in c&&(c.responseType="arraybuffer"),c.overrideMimeType&&c.overrideMimeType("text/plain; charset=x-user-defined"),c.onreadystatechange=function(){var d,f;if(4===c.readyState)if(200===c.status||0===c.status){d=null,f=null;try{d=e._getBinaryFromXHR(c)}catch(g){f=new Error(g)}b(f,d)}else b(new Error("Ajax error for "+a+" : "+this.status+" "+this.statusText),null)},c.send()}catch(d){b(new Error(d),null)}},b.exports=e},{}]},{},[1])(1)});

/*!

JSZip - A Javascript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2014 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/master/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/master/LICENSE
*/
!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;"undefined"!=typeof window?b=window:"undefined"!=typeof global?b=global:"undefined"!=typeof self&&(b=self),b.JSZip=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};b[g][0].call(j.exports,function(a){var c=b[g][1][a];return e(c?c:a)},j,j.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){"use strict";var d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";c.encode=function(a){for(var b,c,e,f,g,h,i,j="",k=0;k<a.length;)b=a.charCodeAt(k++),c=a.charCodeAt(k++),e=a.charCodeAt(k++),f=b>>2,g=(3&b)<<4|c>>4,h=(15&c)<<2|e>>6,i=63&e,isNaN(c)?h=i=64:isNaN(e)&&(i=64),j=j+d.charAt(f)+d.charAt(g)+d.charAt(h)+d.charAt(i);return j},c.decode=function(a){var b,c,e,f,g,h,i,j="",k=0;for(a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");k<a.length;)f=d.indexOf(a.charAt(k++)),g=d.indexOf(a.charAt(k++)),h=d.indexOf(a.charAt(k++)),i=d.indexOf(a.charAt(k++)),b=f<<2|g>>4,c=(15&g)<<4|h>>2,e=(3&h)<<6|i,j+=String.fromCharCode(b),64!=h&&(j+=String.fromCharCode(c)),64!=i&&(j+=String.fromCharCode(e));return j}},{}],2:[function(a,b){"use strict";function c(){this.compressedSize=0,this.uncompressedSize=0,this.crc32=0,this.compressionMethod=null,this.compressedContent=null}c.prototype={getContent:function(){return null},getCompressedContent:function(){return null}},b.exports=c},{}],3:[function(a,b,c){"use strict";c.STORE={magic:"\x00\x00",compress:function(a){return a},uncompress:function(a){return a},compressInputType:null,uncompressInputType:null},c.DEFLATE=a("./flate")},{"./flate":8}],4:[function(a,b){"use strict";var c=a("./utils"),d=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918e3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117];b.exports=function(a,b){if("undefined"==typeof a||!a.length)return 0;var e="string"!==c.getTypeOf(a);"undefined"==typeof b&&(b=0);var f=0,g=0,h=0;b=-1^b;for(var i=0,j=a.length;j>i;i++)h=e?a[i]:a.charCodeAt(i),g=255&(b^h),f=d[g],b=b>>>8^f;return-1^b}},{"./utils":21}],5:[function(a,b){"use strict";function c(){this.data=null,this.length=0,this.index=0}var d=a("./utils");c.prototype={checkOffset:function(a){this.checkIndex(this.index+a)},checkIndex:function(a){if(this.length<a||0>a)throw new Error("End of data reached (data length = "+this.length+", asked index = "+a+"). Corrupted zip ?")},setIndex:function(a){this.checkIndex(a),this.index=a},skip:function(a){this.setIndex(this.index+a)},byteAt:function(){},readInt:function(a){var b,c=0;for(this.checkOffset(a),b=this.index+a-1;b>=this.index;b--)c=(c<<8)+this.byteAt(b);return this.index+=a,c},readString:function(a){return d.transformTo("string",this.readData(a))},readData:function(){},lastIndexOfSignature:function(){},readDate:function(){var a=this.readInt(4);return new Date((a>>25&127)+1980,(a>>21&15)-1,a>>16&31,a>>11&31,a>>5&63,(31&a)<<1)}},b.exports=c},{"./utils":21}],6:[function(a,b,c){"use strict";c.base64=!1,c.binary=!1,c.dir=!1,c.createFolders=!1,c.date=null,c.compression=null,c.compressionOptions=null,c.comment=null,c.unixPermissions=null,c.dosPermissions=null},{}],7:[function(a,b,c){"use strict";var d=a("./utils");c.string2binary=function(a){return d.string2binary(a)},c.string2Uint8Array=function(a){return d.transformTo("uint8array",a)},c.uint8Array2String=function(a){return d.transformTo("string",a)},c.string2Blob=function(a){var b=d.transformTo("arraybuffer",a);return d.arrayBuffer2Blob(b)},c.arrayBuffer2Blob=function(a){return d.arrayBuffer2Blob(a)},c.transformTo=function(a,b){return d.transformTo(a,b)},c.getTypeOf=function(a){return d.getTypeOf(a)},c.checkSupport=function(a){return d.checkSupport(a)},c.MAX_VALUE_16BITS=d.MAX_VALUE_16BITS,c.MAX_VALUE_32BITS=d.MAX_VALUE_32BITS,c.pretty=function(a){return d.pretty(a)},c.findCompression=function(a){return d.findCompression(a)},c.isRegExp=function(a){return d.isRegExp(a)}},{"./utils":21}],8:[function(a,b,c){"use strict";var d="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,e=a("pako");c.uncompressInputType=d?"uint8array":"array",c.compressInputType=d?"uint8array":"array",c.magic="\b\x00",c.compress=function(a,b){return e.deflateRaw(a,{level:b.level||-1})},c.uncompress=function(a){return e.inflateRaw(a)}},{pako:24}],9:[function(a,b){"use strict";function c(a,b){return this instanceof c?(this.files={},this.comment=null,this.root="",a&&this.load(a,b),void(this.clone=function(){var a=new c;for(var b in this)"function"!=typeof this[b]&&(a[b]=this[b]);return a})):new c(a,b)}var d=a("./base64");c.prototype=a("./object"),c.prototype.load=a("./load"),c.support=a("./support"),c.defaults=a("./defaults"),c.utils=a("./deprecatedPublicUtils"),c.base64={encode:function(a){return d.encode(a)},decode:function(a){return d.decode(a)}},c.compressions=a("./compressions"),b.exports=c},{"./base64":1,"./compressions":3,"./defaults":6,"./deprecatedPublicUtils":7,"./load":10,"./object":13,"./support":17}],10:[function(a,b){"use strict";var c=a("./base64"),d=a("./zipEntries");b.exports=function(a,b){var e,f,g,h;for(b=b||{},b.base64&&(a=c.decode(a)),f=new d(a,b),e=f.files,g=0;g<e.length;g++)h=e[g],this.file(h.fileName,h.decompressed,{binary:!0,optimizedBinaryString:!0,date:h.date,dir:h.dir,comment:h.fileComment.length?h.fileComment:null,unixPermissions:h.unixPermissions,dosPermissions:h.dosPermissions,createFolders:b.createFolders});return f.zipComment.length&&(this.comment=f.zipComment),this}},{"./base64":1,"./zipEntries":22}],11:[function(a,b){(function(a){"use strict";b.exports=function(b,c){return new a(b,c)},b.exports.test=function(b){return a.isBuffer(b)}}).call(this,"undefined"!=typeof Buffer?Buffer:void 0)},{}],12:[function(a,b){"use strict";function c(a){this.data=a,this.length=this.data.length,this.index=0}var d=a("./uint8ArrayReader");c.prototype=new d,c.prototype.readData=function(a){this.checkOffset(a);var b=this.data.slice(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./uint8ArrayReader":18}],13:[function(a,b){"use strict";var c=a("./support"),d=a("./utils"),e=a("./crc32"),f=a("./signature"),g=a("./defaults"),h=a("./base64"),i=a("./compressions"),j=a("./compressedObject"),k=a("./nodeBuffer"),l=a("./utf8"),m=a("./stringWriter"),n=a("./uint8ArrayWriter"),o=function(a){if(a._data instanceof j&&(a._data=a._data.getContent(),a.options.binary=!0,a.options.base64=!1,"uint8array"===d.getTypeOf(a._data))){var b=a._data;a._data=new Uint8Array(b.length),0!==b.length&&a._data.set(b,0)}return a._data},p=function(a){var b=o(a),e=d.getTypeOf(b);return"string"===e?!a.options.binary&&c.nodebuffer?k(b,"utf-8"):a.asBinary():b},q=function(a){var b=o(this);return null===b||"undefined"==typeof b?"":(this.options.base64&&(b=h.decode(b)),b=a&&this.options.binary?D.utf8decode(b):d.transformTo("string",b),a||this.options.binary||(b=d.transformTo("string",D.utf8encode(b))),b)},r=function(a,b,c){this.name=a,this.dir=c.dir,this.date=c.date,this.comment=c.comment,this.unixPermissions=c.unixPermissions,this.dosPermissions=c.dosPermissions,this._data=b,this.options=c,this._initialMetadata={dir:c.dir,date:c.date}};r.prototype={asText:function(){return q.call(this,!0)},asBinary:function(){return q.call(this,!1)},asNodeBuffer:function(){var a=p(this);return d.transformTo("nodebuffer",a)},asUint8Array:function(){var a=p(this);return d.transformTo("uint8array",a)},asArrayBuffer:function(){return this.asUint8Array().buffer}};var s=function(a,b){var c,d="";for(c=0;b>c;c++)d+=String.fromCharCode(255&a),a>>>=8;return d},t=function(){var a,b,c={};for(a=0;a<arguments.length;a++)for(b in arguments[a])arguments[a].hasOwnProperty(b)&&"undefined"==typeof c[b]&&(c[b]=arguments[a][b]);return c},u=function(a){return a=a||{},a.base64!==!0||null!==a.binary&&void 0!==a.binary||(a.binary=!0),a=t(a,g),a.date=a.date||new Date,null!==a.compression&&(a.compression=a.compression.toUpperCase()),a},v=function(a,b,c){var e,f=d.getTypeOf(b);if(c=u(c),"string"==typeof c.unixPermissions&&(c.unixPermissions=parseInt(c.unixPermissions,8)),c.unixPermissions&&16384&c.unixPermissions&&(c.dir=!0),c.dosPermissions&&16&c.dosPermissions&&(c.dir=!0),c.dir&&(a=x(a)),c.createFolders&&(e=w(a))&&y.call(this,e,!0),c.dir||null===b||"undefined"==typeof b)c.base64=!1,c.binary=!1,b=null,f=null;else if("string"===f)c.binary&&!c.base64&&c.optimizedBinaryString!==!0&&(b=d.string2binary(b));else{if(c.base64=!1,c.binary=!0,!(f||b instanceof j))throw new Error("The data of '"+a+"' is in an unsupported format !");"arraybuffer"===f&&(b=d.transformTo("uint8array",b))}var g=new r(a,b,c);return this.files[a]=g,g},w=function(a){"/"==a.slice(-1)&&(a=a.substring(0,a.length-1));var b=a.lastIndexOf("/");return b>0?a.substring(0,b):""},x=function(a){return"/"!=a.slice(-1)&&(a+="/"),a},y=function(a,b){return b="undefined"!=typeof b?b:!1,a=x(a),this.files[a]||v.call(this,a,null,{dir:!0,createFolders:b}),this.files[a]},z=function(a,b,c){var f,g=new j;return a._data instanceof j?(g.uncompressedSize=a._data.uncompressedSize,g.crc32=a._data.crc32,0===g.uncompressedSize||a.dir?(b=i.STORE,g.compressedContent="",g.crc32=0):a._data.compressionMethod===b.magic?g.compressedContent=a._data.getCompressedContent():(f=a._data.getContent(),g.compressedContent=b.compress(d.transformTo(b.compressInputType,f),c))):(f=p(a),(!f||0===f.length||a.dir)&&(b=i.STORE,f=""),g.uncompressedSize=f.length,g.crc32=e(f),g.compressedContent=b.compress(d.transformTo(b.compressInputType,f),c)),g.compressedSize=g.compressedContent.length,g.compressionMethod=b.magic,g},A=function(a,b){var c=a;return a||(c=b?16893:33204),(65535&c)<<16},B=function(a){return 63&(a||0)},C=function(a,b,c,g,h){var i,j,k,m,n=(c.compressedContent,d.transformTo("string",l.utf8encode(b.name))),o=b.comment||"",p=d.transformTo("string",l.utf8encode(o)),q=n.length!==b.name.length,r=p.length!==o.length,t=b.options,u="",v="",w="";k=b._initialMetadata.dir!==b.dir?b.dir:t.dir,m=b._initialMetadata.date!==b.date?b.date:t.date;var x=0,y=0;k&&(x|=16),"UNIX"===h?(y=798,x|=A(b.unixPermissions,k)):(y=20,x|=B(b.dosPermissions,k)),i=m.getHours(),i<<=6,i|=m.getMinutes(),i<<=5,i|=m.getSeconds()/2,j=m.getFullYear()-1980,j<<=4,j|=m.getMonth()+1,j<<=5,j|=m.getDate(),q&&(v=s(1,1)+s(e(n),4)+n,u+="up"+s(v.length,2)+v),r&&(w=s(1,1)+s(this.crc32(p),4)+p,u+="uc"+s(w.length,2)+w);var z="";z+="\n\x00",z+=q||r?"\x00\b":"\x00\x00",z+=c.compressionMethod,z+=s(i,2),z+=s(j,2),z+=s(c.crc32,4),z+=s(c.compressedSize,4),z+=s(c.uncompressedSize,4),z+=s(n.length,2),z+=s(u.length,2);var C=f.LOCAL_FILE_HEADER+z+n+u,D=f.CENTRAL_FILE_HEADER+s(y,2)+z+s(p.length,2)+"\x00\x00\x00\x00"+s(x,4)+s(g,4)+n+u+p;return{fileRecord:C,dirRecord:D,compressedObject:c}},D={load:function(){throw new Error("Load method is not defined. Is the file jszip-load.js included ?")},filter:function(a){var b,c,d,e,f=[];for(b in this.files)this.files.hasOwnProperty(b)&&(d=this.files[b],e=new r(d.name,d._data,t(d.options)),c=b.slice(this.root.length,b.length),b.slice(0,this.root.length)===this.root&&a(c,e)&&f.push(e));return f},file:function(a,b,c){if(1===arguments.length){if(d.isRegExp(a)){var e=a;return this.filter(function(a,b){return!b.dir&&e.test(a)})}return this.filter(function(b,c){return!c.dir&&b===a})[0]||null}return a=this.root+a,v.call(this,a,b,c),this},folder:function(a){if(!a)return this;if(d.isRegExp(a))return this.filter(function(b,c){return c.dir&&a.test(b)});var b=this.root+a,c=y.call(this,b),e=this.clone();return e.root=c.name,e},remove:function(a){a=this.root+a;var b=this.files[a];if(b||("/"!=a.slice(-1)&&(a+="/"),b=this.files[a]),b&&!b.dir)delete this.files[a];else for(var c=this.filter(function(b,c){return c.name.slice(0,a.length)===a}),d=0;d<c.length;d++)delete this.files[c[d].name];return this},generate:function(a){a=t(a||{},{base64:!0,compression:"STORE",compressionOptions:null,type:"base64",platform:"DOS",comment:null,mimeType:"application/zip"}),d.checkSupport(a.type),("darwin"===a.platform||"freebsd"===a.platform||"linux"===a.platform||"sunos"===a.platform)&&(a.platform="UNIX"),"win32"===a.platform&&(a.platform="DOS");var b,c,e=[],g=0,j=0,k=d.transformTo("string",this.utf8encode(a.comment||this.comment||""));for(var l in this.files)if(this.files.hasOwnProperty(l)){var o=this.files[l],p=o.options.compression||a.compression.toUpperCase(),q=i[p];if(!q)throw new Error(p+" is not a valid compression method !");var r=o.options.compressionOptions||a.compressionOptions||{},u=z.call(this,o,q,r),v=C.call(this,l,o,u,g,a.platform);g+=v.fileRecord.length+u.compressedSize,j+=v.dirRecord.length,e.push(v)}var w="";w=f.CENTRAL_DIRECTORY_END+"\x00\x00\x00\x00"+s(e.length,2)+s(e.length,2)+s(j,4)+s(g,4)+s(k.length,2)+k;var x=a.type.toLowerCase();for(b="uint8array"===x||"arraybuffer"===x||"blob"===x||"nodebuffer"===x?new n(g+j+w.length):new m(g+j+w.length),c=0;c<e.length;c++)b.append(e[c].fileRecord),b.append(e[c].compressedObject.compressedContent);for(c=0;c<e.length;c++)b.append(e[c].dirRecord);b.append(w);var y=b.finalize();switch(a.type.toLowerCase()){case"uint8array":case"arraybuffer":case"nodebuffer":return d.transformTo(a.type.toLowerCase(),y);case"blob":return d.arrayBuffer2Blob(d.transformTo("arraybuffer",y),a.mimeType);case"base64":return a.base64?h.encode(y):y;default:return y}},crc32:function(a,b){return e(a,b)},utf8encode:function(a){return d.transformTo("string",l.utf8encode(a))},utf8decode:function(a){return l.utf8decode(a)}};b.exports=D},{"./base64":1,"./compressedObject":2,"./compressions":3,"./crc32":4,"./defaults":6,"./nodeBuffer":11,"./signature":14,"./stringWriter":16,"./support":17,"./uint8ArrayWriter":19,"./utf8":20,"./utils":21}],14:[function(a,b,c){"use strict";c.LOCAL_FILE_HEADER="PK",c.CENTRAL_FILE_HEADER="PK",c.CENTRAL_DIRECTORY_END="PK",c.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",c.ZIP64_CENTRAL_DIRECTORY_END="PK",c.DATA_DESCRIPTOR="PK\b"},{}],15:[function(a,b){"use strict";function c(a,b){this.data=a,b||(this.data=e.string2binary(this.data)),this.length=this.data.length,this.index=0}var d=a("./dataReader"),e=a("./utils");c.prototype=new d,c.prototype.byteAt=function(a){return this.data.charCodeAt(a)},c.prototype.lastIndexOfSignature=function(a){return this.data.lastIndexOf(a)},c.prototype.readData=function(a){this.checkOffset(a);var b=this.data.slice(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./dataReader":5,"./utils":21}],16:[function(a,b){"use strict";var c=a("./utils"),d=function(){this.data=[]};d.prototype={append:function(a){a=c.transformTo("string",a),this.data.push(a)},finalize:function(){return this.data.join("")}},b.exports=d},{"./utils":21}],17:[function(a,b,c){(function(a){"use strict";if(c.base64=!0,c.array=!0,c.string=!0,c.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,c.nodebuffer="undefined"!=typeof a,c.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)c.blob=!1;else{var b=new ArrayBuffer(0);try{c.blob=0===new Blob([b],{type:"application/zip"}).size}catch(d){try{var e=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,f=new e;f.append(b),c.blob=0===f.getBlob("application/zip").size}catch(d){c.blob=!1}}}}).call(this,"undefined"!=typeof Buffer?Buffer:void 0)},{}],18:[function(a,b){"use strict";function c(a){a&&(this.data=a,this.length=this.data.length,this.index=0)}var d=a("./dataReader");c.prototype=new d,c.prototype.byteAt=function(a){return this.data[a]},c.prototype.lastIndexOfSignature=function(a){for(var b=a.charCodeAt(0),c=a.charCodeAt(1),d=a.charCodeAt(2),e=a.charCodeAt(3),f=this.length-4;f>=0;--f)if(this.data[f]===b&&this.data[f+1]===c&&this.data[f+2]===d&&this.data[f+3]===e)return f;return-1},c.prototype.readData=function(a){if(this.checkOffset(a),0===a)return new Uint8Array(0);var b=this.data.subarray(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./dataReader":5}],19:[function(a,b){"use strict";var c=a("./utils"),d=function(a){this.data=new Uint8Array(a),this.index=0};d.prototype={append:function(a){0!==a.length&&(a=c.transformTo("uint8array",a),this.data.set(a,this.index),this.index+=a.length)},finalize:function(){return this.data}},b.exports=d},{"./utils":21}],20:[function(a,b,c){"use strict";for(var d=a("./utils"),e=a("./support"),f=a("./nodeBuffer"),g=new Array(256),h=0;256>h;h++)g[h]=h>=252?6:h>=248?5:h>=240?4:h>=224?3:h>=192?2:1;g[254]=g[254]=1;var i=function(a){var b,c,d,f,g,h=a.length,i=0;for(f=0;h>f;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),i+=128>c?1:2048>c?2:65536>c?3:4;for(b=e.uint8array?new Uint8Array(i):new Array(i),g=0,f=0;i>g;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),128>c?b[g++]=c:2048>c?(b[g++]=192|c>>>6,b[g++]=128|63&c):65536>c?(b[g++]=224|c>>>12,b[g++]=128|c>>>6&63,b[g++]=128|63&c):(b[g++]=240|c>>>18,b[g++]=128|c>>>12&63,b[g++]=128|c>>>6&63,b[g++]=128|63&c);return b},j=function(a,b){var c;for(b=b||a.length,b>a.length&&(b=a.length),c=b-1;c>=0&&128===(192&a[c]);)c--;return 0>c?b:0===c?b:c+g[a[c]]>b?c:b},k=function(a){var b,c,e,f,h=a.length,i=new Array(2*h);for(c=0,b=0;h>b;)if(e=a[b++],128>e)i[c++]=e;else if(f=g[e],f>4)i[c++]=65533,b+=f-1;else{for(e&=2===f?31:3===f?15:7;f>1&&h>b;)e=e<<6|63&a[b++],f--;f>1?i[c++]=65533:65536>e?i[c++]=e:(e-=65536,i[c++]=55296|e>>10&1023,i[c++]=56320|1023&e)}return i.length!==c&&(i.subarray?i=i.subarray(0,c):i.length=c),d.applyFromCharCode(i)};c.utf8encode=function(a){return e.nodebuffer?f(a,"utf-8"):i(a)},c.utf8decode=function(a){if(e.nodebuffer)return d.transformTo("nodebuffer",a).toString("utf-8");a=d.transformTo(e.uint8array?"uint8array":"array",a);for(var b=[],c=0,f=a.length,g=65536;f>c;){var h=j(a,Math.min(c+g,f));b.push(e.uint8array?k(a.subarray(c,h)):k(a.slice(c,h))),c=h}return b.join("")}},{"./nodeBuffer":11,"./support":17,"./utils":21}],21:[function(a,b,c){"use strict";function d(a){return a}function e(a,b){for(var c=0;c<a.length;++c)b[c]=255&a.charCodeAt(c);return b}function f(a){var b=65536,d=[],e=a.length,f=c.getTypeOf(a),g=0,h=!0;try{switch(f){case"uint8array":String.fromCharCode.apply(null,new Uint8Array(0));break;case"nodebuffer":String.fromCharCode.apply(null,j(0))}}catch(i){h=!1}if(!h){for(var k="",l=0;l<a.length;l++)k+=String.fromCharCode(a[l]);return k}for(;e>g&&b>1;)try{d.push("array"===f||"nodebuffer"===f?String.fromCharCode.apply(null,a.slice(g,Math.min(g+b,e))):String.fromCharCode.apply(null,a.subarray(g,Math.min(g+b,e)))),g+=b}catch(i){b=Math.floor(b/2)}return d.join("")}function g(a,b){for(var c=0;c<a.length;c++)b[c]=a[c];return b}var h=a("./support"),i=a("./compressions"),j=a("./nodeBuffer");c.string2binary=function(a){for(var b="",c=0;c<a.length;c++)b+=String.fromCharCode(255&a.charCodeAt(c));return b},c.arrayBuffer2Blob=function(a,b){c.checkSupport("blob"),b=b||"application/zip";try{return new Blob([a],{type:b})}catch(d){try{var e=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,f=new e;return f.append(a),f.getBlob(b)}catch(d){throw new Error("Bug : can't construct the Blob.")}}},c.applyFromCharCode=f;var k={};k.string={string:d,array:function(a){return e(a,new Array(a.length))},arraybuffer:function(a){return k.string.uint8array(a).buffer},uint8array:function(a){return e(a,new Uint8Array(a.length))},nodebuffer:function(a){return e(a,j(a.length))}},k.array={string:f,array:d,arraybuffer:function(a){return new Uint8Array(a).buffer},uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return j(a)}},k.arraybuffer={string:function(a){return f(new Uint8Array(a))},array:function(a){return g(new Uint8Array(a),new Array(a.byteLength))},arraybuffer:d,uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return j(new Uint8Array(a))}},k.uint8array={string:f,array:function(a){return g(a,new Array(a.length))},arraybuffer:function(a){return a.buffer},uint8array:d,nodebuffer:function(a){return j(a)}},k.nodebuffer={string:f,array:function(a){return g(a,new Array(a.length))},arraybuffer:function(a){return k.nodebuffer.uint8array(a).buffer},uint8array:function(a){return g(a,new Uint8Array(a.length))},nodebuffer:d},c.transformTo=function(a,b){if(b||(b=""),!a)return b;c.checkSupport(a);var d=c.getTypeOf(b),e=k[d][a](b);return e},c.getTypeOf=function(a){return"string"==typeof a?"string":"[object Array]"===Object.prototype.toString.call(a)?"array":h.nodebuffer&&j.test(a)?"nodebuffer":h.uint8array&&a instanceof Uint8Array?"uint8array":h.arraybuffer&&a instanceof ArrayBuffer?"arraybuffer":void 0},c.checkSupport=function(a){var b=h[a.toLowerCase()];if(!b)throw new Error(a+" is not supported by this browser")},c.MAX_VALUE_16BITS=65535,c.MAX_VALUE_32BITS=-1,c.pretty=function(a){var b,c,d="";for(c=0;c<(a||"").length;c++)b=a.charCodeAt(c),d+="\\x"+(16>b?"0":"")+b.toString(16).toUpperCase();return d},c.findCompression=function(a){for(var b in i)if(i.hasOwnProperty(b)&&i[b].magic===a)return i[b];return null},c.isRegExp=function(a){return"[object RegExp]"===Object.prototype.toString.call(a)}},{"./compressions":3,"./nodeBuffer":11,"./support":17}],22:[function(a,b){"use strict";function c(a,b){this.files=[],this.loadOptions=b,a&&this.load(a)}var d=a("./stringReader"),e=a("./nodeBufferReader"),f=a("./uint8ArrayReader"),g=a("./utils"),h=a("./signature"),i=a("./zipEntry"),j=a("./support"),k=a("./object");c.prototype={checkSignature:function(a){var b=this.reader.readString(4);if(b!==a)throw new Error("Corrupted zip or bug : unexpected signature ("+g.pretty(b)+", expected "+g.pretty(a)+")")},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2),this.zipComment=this.reader.readString(this.zipCommentLength),this.zipComment=k.utf8decode(this.zipComment)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.versionMadeBy=this.reader.readString(2),this.versionNeeded=this.reader.readInt(2),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var a,b,c,d=this.zip64EndOfCentralSize-44,e=0;d>e;)a=this.reader.readInt(2),b=this.reader.readInt(4),c=this.reader.readString(b),this.zip64ExtensibleData[a]={id:a,length:b,value:c}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),this.disksCount>1)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var a,b;for(a=0;a<this.files.length;a++)b=this.files[a],this.reader.setIndex(b.localHeaderOffset),this.checkSignature(h.LOCAL_FILE_HEADER),b.readLocalPart(this.reader),b.handleUTF8(),b.processAttributes()},readCentralDir:function(){var a;for(this.reader.setIndex(this.centralDirOffset);this.reader.readString(4)===h.CENTRAL_FILE_HEADER;)a=new i({zip64:this.zip64},this.loadOptions),a.readCentralPart(this.reader),this.files.push(a)},readEndOfCentral:function(){var a=this.reader.lastIndexOfSignature(h.CENTRAL_DIRECTORY_END);if(-1===a){var b=!0;try{this.reader.setIndex(0),this.checkSignature(h.LOCAL_FILE_HEADER),b=!1}catch(c){}throw new Error(b?"Can't find end of central directory : is this a zip file ? If it is, see http://stuk.github.io/jszip/documentation/howto/read_zip.html":"Corrupted zip : can't find end of central directory")}if(this.reader.setIndex(a),this.checkSignature(h.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===g.MAX_VALUE_16BITS||this.diskWithCentralDirStart===g.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===g.MAX_VALUE_16BITS||this.centralDirRecords===g.MAX_VALUE_16BITS||this.centralDirSize===g.MAX_VALUE_32BITS||this.centralDirOffset===g.MAX_VALUE_32BITS){if(this.zip64=!0,a=this.reader.lastIndexOfSignature(h.ZIP64_CENTRAL_DIRECTORY_LOCATOR),-1===a)throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator");this.reader.setIndex(a),this.checkSignature(h.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(h.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}},prepareReader:function(a){var b=g.getTypeOf(a);this.reader="string"!==b||j.uint8array?"nodebuffer"===b?new e(a):new f(g.transformTo("uint8array",a)):new d(a,this.loadOptions.optimizedBinaryString)},load:function(a){this.prepareReader(a),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},b.exports=c},{"./nodeBufferReader":12,"./object":13,"./signature":14,"./stringReader":15,"./support":17,"./uint8ArrayReader":18,"./utils":21,"./zipEntry":23}],23:[function(a,b){"use strict";function c(a,b){this.options=a,this.loadOptions=b}var d=a("./stringReader"),e=a("./utils"),f=a("./compressedObject"),g=a("./object"),h=0,i=3;c.prototype={isEncrypted:function(){return 1===(1&this.bitFlag)},useUTF8:function(){return 2048===(2048&this.bitFlag)},prepareCompressedContent:function(a,b,c){return function(){var d=a.index;a.setIndex(b);var e=a.readData(c);return a.setIndex(d),e}},prepareContent:function(a,b,c,d,f){return function(){var a=e.transformTo(d.uncompressInputType,this.getCompressedContent()),b=d.uncompress(a);if(b.length!==f)throw new Error("Bug : uncompressed data size mismatch");return b}},readLocalPart:function(a){var b,c;if(a.skip(22),this.fileNameLength=a.readInt(2),c=a.readInt(2),this.fileName=a.readString(this.fileNameLength),a.skip(c),-1==this.compressedSize||-1==this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory (compressedSize == -1 || uncompressedSize == -1)");if(b=e.findCompression(this.compressionMethod),null===b)throw new Error("Corrupted zip : compression "+e.pretty(this.compressionMethod)+" unknown (inner file : "+this.fileName+")");if(this.decompressed=new f,this.decompressed.compressedSize=this.compressedSize,this.decompressed.uncompressedSize=this.uncompressedSize,this.decompressed.crc32=this.crc32,this.decompressed.compressionMethod=this.compressionMethod,this.decompressed.getCompressedContent=this.prepareCompressedContent(a,a.index,this.compressedSize,b),this.decompressed.getContent=this.prepareContent(a,a.index,this.compressedSize,b,this.uncompressedSize),this.loadOptions.checkCRC32&&(this.decompressed=e.transformTo("string",this.decompressed.getContent()),g.crc32(this.decompressed)!==this.crc32))throw new Error("Corrupted zip : CRC32 mismatch")},readCentralPart:function(a){if(this.versionMadeBy=a.readInt(2),this.versionNeeded=a.readInt(2),this.bitFlag=a.readInt(2),this.compressionMethod=a.readString(2),this.date=a.readDate(),this.crc32=a.readInt(4),this.compressedSize=a.readInt(4),this.uncompressedSize=a.readInt(4),this.fileNameLength=a.readInt(2),this.extraFieldsLength=a.readInt(2),this.fileCommentLength=a.readInt(2),this.diskNumberStart=a.readInt(2),this.internalFileAttributes=a.readInt(2),this.externalFileAttributes=a.readInt(4),this.localHeaderOffset=a.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");this.fileName=a.readString(this.fileNameLength),this.readExtraFields(a),this.parseZIP64ExtraField(a),this.fileComment=a.readString(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var a=this.versionMadeBy>>8;this.dir=16&this.externalFileAttributes?!0:!1,a===h&&(this.dosPermissions=63&this.externalFileAttributes),a===i&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileName.slice(-1)||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var a=new d(this.extraFields[1].value);this.uncompressedSize===e.MAX_VALUE_32BITS&&(this.uncompressedSize=a.readInt(8)),this.compressedSize===e.MAX_VALUE_32BITS&&(this.compressedSize=a.readInt(8)),this.localHeaderOffset===e.MAX_VALUE_32BITS&&(this.localHeaderOffset=a.readInt(8)),this.diskNumberStart===e.MAX_VALUE_32BITS&&(this.diskNumberStart=a.readInt(4))}},readExtraFields:function(a){var b,c,d,e=a.index;for(this.extraFields=this.extraFields||{};a.index<e+this.extraFieldsLength;)b=a.readInt(2),c=a.readInt(2),d=a.readString(c),this.extraFields[b]={id:b,length:c,value:d}},handleUTF8:function(){if(this.useUTF8())this.fileName=g.utf8decode(this.fileName),this.fileComment=g.utf8decode(this.fileComment);else{var a=this.findExtraFieldUnicodePath();null!==a&&(this.fileName=a);var b=this.findExtraFieldUnicodeComment();null!==b&&(this.fileComment=b)}},findExtraFieldUnicodePath:function(){var a=this.extraFields[28789];if(a){var b=new d(a.value);return 1!==b.readInt(1)?null:g.crc32(this.fileName)!==b.readInt(4)?null:g.utf8decode(b.readString(a.length-5))
}return null},findExtraFieldUnicodeComment:function(){var a=this.extraFields[25461];if(a){var b=new d(a.value);return 1!==b.readInt(1)?null:g.crc32(this.fileComment)!==b.readInt(4)?null:g.utf8decode(b.readString(a.length-5))}return null}},b.exports=c},{"./compressedObject":2,"./object":13,"./stringReader":15,"./utils":21}],24:[function(a,b){"use strict";var c=a("./lib/utils/common").assign,d=a("./lib/deflate"),e=a("./lib/inflate"),f=a("./lib/zlib/constants"),g={};c(g,d,e,f),b.exports=g},{"./lib/deflate":25,"./lib/inflate":26,"./lib/utils/common":27,"./lib/zlib/constants":30}],25:[function(a,b,c){"use strict";function d(a,b){var c=new s(b);if(c.push(a,!0),c.err)throw c.msg;return c.result}function e(a,b){return b=b||{},b.raw=!0,d(a,b)}function f(a,b){return b=b||{},b.gzip=!0,d(a,b)}var g=a("./zlib/deflate.js"),h=a("./utils/common"),i=a("./utils/strings"),j=a("./zlib/messages"),k=a("./zlib/zstream"),l=0,m=4,n=0,o=1,p=-1,q=0,r=8,s=function(a){this.options=h.assign({level:p,method:r,chunkSize:16384,windowBits:15,memLevel:8,strategy:q,to:""},a||{});var b=this.options;b.raw&&b.windowBits>0?b.windowBits=-b.windowBits:b.gzip&&b.windowBits>0&&b.windowBits<16&&(b.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new k,this.strm.avail_out=0;var c=g.deflateInit2(this.strm,b.level,b.method,b.windowBits,b.memLevel,b.strategy);if(c!==n)throw new Error(j[c]);b.header&&g.deflateSetHeader(this.strm,b.header)};s.prototype.push=function(a,b){var c,d,e=this.strm,f=this.options.chunkSize;if(this.ended)return!1;d=b===~~b?b:b===!0?m:l,e.input="string"==typeof a?i.string2buf(a):a,e.next_in=0,e.avail_in=e.input.length;do{if(0===e.avail_out&&(e.output=new h.Buf8(f),e.next_out=0,e.avail_out=f),c=g.deflate(e,d),c!==o&&c!==n)return this.onEnd(c),this.ended=!0,!1;(0===e.avail_out||0===e.avail_in&&d===m)&&this.onData("string"===this.options.to?i.buf2binstring(h.shrinkBuf(e.output,e.next_out)):h.shrinkBuf(e.output,e.next_out))}while((e.avail_in>0||0===e.avail_out)&&c!==o);return d===m?(c=g.deflateEnd(this.strm),this.onEnd(c),this.ended=!0,c===n):!0},s.prototype.onData=function(a){this.chunks.push(a)},s.prototype.onEnd=function(a){a===n&&(this.result="string"===this.options.to?this.chunks.join(""):h.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},c.Deflate=s,c.deflate=d,c.deflateRaw=e,c.gzip=f},{"./utils/common":27,"./utils/strings":28,"./zlib/deflate.js":32,"./zlib/messages":37,"./zlib/zstream":39}],26:[function(a,b,c){"use strict";function d(a,b){var c=new m(b);if(c.push(a,!0),c.err)throw c.msg;return c.result}function e(a,b){return b=b||{},b.raw=!0,d(a,b)}var f=a("./zlib/inflate.js"),g=a("./utils/common"),h=a("./utils/strings"),i=a("./zlib/constants"),j=a("./zlib/messages"),k=a("./zlib/zstream"),l=a("./zlib/gzheader"),m=function(a){this.options=g.assign({chunkSize:16384,windowBits:0,to:""},a||{});var b=this.options;b.raw&&b.windowBits>=0&&b.windowBits<16&&(b.windowBits=-b.windowBits,0===b.windowBits&&(b.windowBits=-15)),!(b.windowBits>=0&&b.windowBits<16)||a&&a.windowBits||(b.windowBits+=32),b.windowBits>15&&b.windowBits<48&&0===(15&b.windowBits)&&(b.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new k,this.strm.avail_out=0;var c=f.inflateInit2(this.strm,b.windowBits);if(c!==i.Z_OK)throw new Error(j[c]);this.header=new l,f.inflateGetHeader(this.strm,this.header)};m.prototype.push=function(a,b){var c,d,e,j,k,l=this.strm,m=this.options.chunkSize;if(this.ended)return!1;d=b===~~b?b:b===!0?i.Z_FINISH:i.Z_NO_FLUSH,l.input="string"==typeof a?h.binstring2buf(a):a,l.next_in=0,l.avail_in=l.input.length;do{if(0===l.avail_out&&(l.output=new g.Buf8(m),l.next_out=0,l.avail_out=m),c=f.inflate(l,i.Z_NO_FLUSH),c!==i.Z_STREAM_END&&c!==i.Z_OK)return this.onEnd(c),this.ended=!0,!1;l.next_out&&(0===l.avail_out||c===i.Z_STREAM_END||0===l.avail_in&&d===i.Z_FINISH)&&("string"===this.options.to?(e=h.utf8border(l.output,l.next_out),j=l.next_out-e,k=h.buf2string(l.output,e),l.next_out=j,l.avail_out=m-j,j&&g.arraySet(l.output,l.output,e,j,0),this.onData(k)):this.onData(g.shrinkBuf(l.output,l.next_out)))}while(l.avail_in>0&&c!==i.Z_STREAM_END);return c===i.Z_STREAM_END&&(d=i.Z_FINISH),d===i.Z_FINISH?(c=f.inflateEnd(this.strm),this.onEnd(c),this.ended=!0,c===i.Z_OK):!0},m.prototype.onData=function(a){this.chunks.push(a)},m.prototype.onEnd=function(a){a===i.Z_OK&&(this.result="string"===this.options.to?this.chunks.join(""):g.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},c.Inflate=m,c.inflate=d,c.inflateRaw=e,c.ungzip=d},{"./utils/common":27,"./utils/strings":28,"./zlib/constants":30,"./zlib/gzheader":33,"./zlib/inflate.js":35,"./zlib/messages":37,"./zlib/zstream":39}],27:[function(a,b,c){"use strict";var d="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;c.assign=function(a){for(var b=Array.prototype.slice.call(arguments,1);b.length;){var c=b.shift();if(c){if("object"!=typeof c)throw new TypeError(c+"must be non-object");for(var d in c)c.hasOwnProperty(d)&&(a[d]=c[d])}}return a},c.shrinkBuf=function(a,b){return a.length===b?a:a.subarray?a.subarray(0,b):(a.length=b,a)};var e={arraySet:function(a,b,c,d,e){if(b.subarray&&a.subarray)return void a.set(b.subarray(c,c+d),e);for(var f=0;d>f;f++)a[e+f]=b[c+f]},flattenChunks:function(a){var b,c,d,e,f,g;for(d=0,b=0,c=a.length;c>b;b++)d+=a[b].length;for(g=new Uint8Array(d),e=0,b=0,c=a.length;c>b;b++)f=a[b],g.set(f,e),e+=f.length;return g}},f={arraySet:function(a,b,c,d,e){for(var f=0;d>f;f++)a[e+f]=b[c+f]},flattenChunks:function(a){return[].concat.apply([],a)}};c.setTyped=function(a){a?(c.Buf8=Uint8Array,c.Buf16=Uint16Array,c.Buf32=Int32Array,c.assign(c,e)):(c.Buf8=Array,c.Buf16=Array,c.Buf32=Array,c.assign(c,f))},c.setTyped(d)},{}],28:[function(a,b,c){"use strict";function d(a,b){if(65537>b&&(a.subarray&&g||!a.subarray&&f))return String.fromCharCode.apply(null,e.shrinkBuf(a,b));for(var c="",d=0;b>d;d++)c+=String.fromCharCode(a[d]);return c}var e=a("./common"),f=!0,g=!0;try{String.fromCharCode.apply(null,[0])}catch(h){f=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(h){g=!1}for(var i=new e.Buf8(256),j=0;256>j;j++)i[j]=j>=252?6:j>=248?5:j>=240?4:j>=224?3:j>=192?2:1;i[254]=i[254]=1,c.string2buf=function(a){var b,c,d,f,g,h=a.length,i=0;for(f=0;h>f;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),i+=128>c?1:2048>c?2:65536>c?3:4;for(b=new e.Buf8(i),g=0,f=0;i>g;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),128>c?b[g++]=c:2048>c?(b[g++]=192|c>>>6,b[g++]=128|63&c):65536>c?(b[g++]=224|c>>>12,b[g++]=128|c>>>6&63,b[g++]=128|63&c):(b[g++]=240|c>>>18,b[g++]=128|c>>>12&63,b[g++]=128|c>>>6&63,b[g++]=128|63&c);return b},c.buf2binstring=function(a){return d(a,a.length)},c.binstring2buf=function(a){for(var b=new e.Buf8(a.length),c=0,d=b.length;d>c;c++)b[c]=a.charCodeAt(c);return b},c.buf2string=function(a,b){var c,e,f,g,h=b||a.length,j=new Array(2*h);for(e=0,c=0;h>c;)if(f=a[c++],128>f)j[e++]=f;else if(g=i[f],g>4)j[e++]=65533,c+=g-1;else{for(f&=2===g?31:3===g?15:7;g>1&&h>c;)f=f<<6|63&a[c++],g--;g>1?j[e++]=65533:65536>f?j[e++]=f:(f-=65536,j[e++]=55296|f>>10&1023,j[e++]=56320|1023&f)}return d(j,e)},c.utf8border=function(a,b){var c;for(b=b||a.length,b>a.length&&(b=a.length),c=b-1;c>=0&&128===(192&a[c]);)c--;return 0>c?b:0===c?b:c+i[a[c]]>b?c:b}},{"./common":27}],29:[function(a,b){"use strict";function c(a,b,c,d){for(var e=65535&a|0,f=a>>>16&65535|0,g=0;0!==c;){g=c>2e3?2e3:c,c-=g;do e=e+b[d++]|0,f=f+e|0;while(--g);e%=65521,f%=65521}return e|f<<16|0}b.exports=c},{}],30:[function(a,b){b.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],31:[function(a,b){"use strict";function c(){for(var a,b=[],c=0;256>c;c++){a=c;for(var d=0;8>d;d++)a=1&a?3988292384^a>>>1:a>>>1;b[c]=a}return b}function d(a,b,c,d){var f=e,g=d+c;a=-1^a;for(var h=d;g>h;h++)a=a>>>8^f[255&(a^b[h])];return-1^a}var e=c();b.exports=d},{}],32:[function(a,b,c){"use strict";function d(a,b){return a.msg=G[b],b}function e(a){return(a<<1)-(a>4?9:0)}function f(a){for(var b=a.length;--b>=0;)a[b]=0}function g(a){var b=a.state,c=b.pending;c>a.avail_out&&(c=a.avail_out),0!==c&&(C.arraySet(a.output,b.pending_buf,b.pending_out,c,a.next_out),a.next_out+=c,b.pending_out+=c,a.total_out+=c,a.avail_out-=c,b.pending-=c,0===b.pending&&(b.pending_out=0))}function h(a,b){D._tr_flush_block(a,a.block_start>=0?a.block_start:-1,a.strstart-a.block_start,b),a.block_start=a.strstart,g(a.strm)}function i(a,b){a.pending_buf[a.pending++]=b}function j(a,b){a.pending_buf[a.pending++]=b>>>8&255,a.pending_buf[a.pending++]=255&b}function k(a,b,c,d){var e=a.avail_in;return e>d&&(e=d),0===e?0:(a.avail_in-=e,C.arraySet(b,a.input,a.next_in,e,c),1===a.state.wrap?a.adler=E(a.adler,b,e,c):2===a.state.wrap&&(a.adler=F(a.adler,b,e,c)),a.next_in+=e,a.total_in+=e,e)}function l(a,b){var c,d,e=a.max_chain_length,f=a.strstart,g=a.prev_length,h=a.nice_match,i=a.strstart>a.w_size-jb?a.strstart-(a.w_size-jb):0,j=a.window,k=a.w_mask,l=a.prev,m=a.strstart+ib,n=j[f+g-1],o=j[f+g];a.prev_length>=a.good_match&&(e>>=2),h>a.lookahead&&(h=a.lookahead);do if(c=b,j[c+g]===o&&j[c+g-1]===n&&j[c]===j[f]&&j[++c]===j[f+1]){f+=2,c++;do;while(j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&m>f);if(d=ib-(m-f),f=m-ib,d>g){if(a.match_start=b,g=d,d>=h)break;n=j[f+g-1],o=j[f+g]}}while((b=l[b&k])>i&&0!==--e);return g<=a.lookahead?g:a.lookahead}function m(a){var b,c,d,e,f,g=a.w_size;do{if(e=a.window_size-a.lookahead-a.strstart,a.strstart>=g+(g-jb)){C.arraySet(a.window,a.window,g,g,0),a.match_start-=g,a.strstart-=g,a.block_start-=g,c=a.hash_size,b=c;do d=a.head[--b],a.head[b]=d>=g?d-g:0;while(--c);c=g,b=c;do d=a.prev[--b],a.prev[b]=d>=g?d-g:0;while(--c);e+=g}if(0===a.strm.avail_in)break;if(c=k(a.strm,a.window,a.strstart+a.lookahead,e),a.lookahead+=c,a.lookahead+a.insert>=hb)for(f=a.strstart-a.insert,a.ins_h=a.window[f],a.ins_h=(a.ins_h<<a.hash_shift^a.window[f+1])&a.hash_mask;a.insert&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[f+hb-1])&a.hash_mask,a.prev[f&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=f,f++,a.insert--,!(a.lookahead+a.insert<hb)););}while(a.lookahead<jb&&0!==a.strm.avail_in)}function n(a,b){var c=65535;for(c>a.pending_buf_size-5&&(c=a.pending_buf_size-5);;){if(a.lookahead<=1){if(m(a),0===a.lookahead&&b===H)return sb;if(0===a.lookahead)break}a.strstart+=a.lookahead,a.lookahead=0;var d=a.block_start+c;if((0===a.strstart||a.strstart>=d)&&(a.lookahead=a.strstart-d,a.strstart=d,h(a,!1),0===a.strm.avail_out))return sb;if(a.strstart-a.block_start>=a.w_size-jb&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.strstart>a.block_start&&(h(a,!1),0===a.strm.avail_out)?sb:sb}function o(a,b){for(var c,d;;){if(a.lookahead<jb){if(m(a),a.lookahead<jb&&b===H)return sb;if(0===a.lookahead)break}if(c=0,a.lookahead>=hb&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart),0!==c&&a.strstart-c<=a.w_size-jb&&(a.match_length=l(a,c)),a.match_length>=hb)if(d=D._tr_tally(a,a.strstart-a.match_start,a.match_length-hb),a.lookahead-=a.match_length,a.match_length<=a.max_lazy_match&&a.lookahead>=hb){a.match_length--;do a.strstart++,a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart;while(0!==--a.match_length);a.strstart++}else a.strstart+=a.match_length,a.match_length=0,a.ins_h=a.window[a.strstart],a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+1])&a.hash_mask;else d=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++;if(d&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=a.strstart<hb-1?a.strstart:hb-1,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function p(a,b){for(var c,d,e;;){if(a.lookahead<jb){if(m(a),a.lookahead<jb&&b===H)return sb;if(0===a.lookahead)break}if(c=0,a.lookahead>=hb&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart),a.prev_length=a.match_length,a.prev_match=a.match_start,a.match_length=hb-1,0!==c&&a.prev_length<a.max_lazy_match&&a.strstart-c<=a.w_size-jb&&(a.match_length=l(a,c),a.match_length<=5&&(a.strategy===S||a.match_length===hb&&a.strstart-a.match_start>4096)&&(a.match_length=hb-1)),a.prev_length>=hb&&a.match_length<=a.prev_length){e=a.strstart+a.lookahead-hb,d=D._tr_tally(a,a.strstart-1-a.prev_match,a.prev_length-hb),a.lookahead-=a.prev_length-1,a.prev_length-=2;do++a.strstart<=e&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart);while(0!==--a.prev_length);if(a.match_available=0,a.match_length=hb-1,a.strstart++,d&&(h(a,!1),0===a.strm.avail_out))return sb}else if(a.match_available){if(d=D._tr_tally(a,0,a.window[a.strstart-1]),d&&h(a,!1),a.strstart++,a.lookahead--,0===a.strm.avail_out)return sb}else a.match_available=1,a.strstart++,a.lookahead--}return a.match_available&&(d=D._tr_tally(a,0,a.window[a.strstart-1]),a.match_available=0),a.insert=a.strstart<hb-1?a.strstart:hb-1,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function q(a,b){for(var c,d,e,f,g=a.window;;){if(a.lookahead<=ib){if(m(a),a.lookahead<=ib&&b===H)return sb;if(0===a.lookahead)break}if(a.match_length=0,a.lookahead>=hb&&a.strstart>0&&(e=a.strstart-1,d=g[e],d===g[++e]&&d===g[++e]&&d===g[++e])){f=a.strstart+ib;do;while(d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&f>e);a.match_length=ib-(f-e),a.match_length>a.lookahead&&(a.match_length=a.lookahead)}if(a.match_length>=hb?(c=D._tr_tally(a,1,a.match_length-hb),a.lookahead-=a.match_length,a.strstart+=a.match_length,a.match_length=0):(c=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++),c&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function r(a,b){for(var c;;){if(0===a.lookahead&&(m(a),0===a.lookahead)){if(b===H)return sb;break}if(a.match_length=0,c=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++,c&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function s(a){a.window_size=2*a.w_size,f(a.head),a.max_lazy_match=B[a.level].max_lazy,a.good_match=B[a.level].good_length,a.nice_match=B[a.level].nice_length,a.max_chain_length=B[a.level].max_chain,a.strstart=0,a.block_start=0,a.lookahead=0,a.insert=0,a.match_length=a.prev_length=hb-1,a.match_available=0,a.ins_h=0}function t(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=Y,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new C.Buf16(2*fb),this.dyn_dtree=new C.Buf16(2*(2*db+1)),this.bl_tree=new C.Buf16(2*(2*eb+1)),f(this.dyn_ltree),f(this.dyn_dtree),f(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new C.Buf16(gb+1),this.heap=new C.Buf16(2*cb+1),f(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new C.Buf16(2*cb+1),f(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function u(a){var b;return a&&a.state?(a.total_in=a.total_out=0,a.data_type=X,b=a.state,b.pending=0,b.pending_out=0,b.wrap<0&&(b.wrap=-b.wrap),b.status=b.wrap?lb:qb,a.adler=2===b.wrap?0:1,b.last_flush=H,D._tr_init(b),M):d(a,O)}function v(a){var b=u(a);return b===M&&s(a.state),b}function w(a,b){return a&&a.state?2!==a.state.wrap?O:(a.state.gzhead=b,M):O}function x(a,b,c,e,f,g){if(!a)return O;var h=1;if(b===R&&(b=6),0>e?(h=0,e=-e):e>15&&(h=2,e-=16),1>f||f>Z||c!==Y||8>e||e>15||0>b||b>9||0>g||g>V)return d(a,O);8===e&&(e=9);var i=new t;return a.state=i,i.strm=a,i.wrap=h,i.gzhead=null,i.w_bits=e,i.w_size=1<<i.w_bits,i.w_mask=i.w_size-1,i.hash_bits=f+7,i.hash_size=1<<i.hash_bits,i.hash_mask=i.hash_size-1,i.hash_shift=~~((i.hash_bits+hb-1)/hb),i.window=new C.Buf8(2*i.w_size),i.head=new C.Buf16(i.hash_size),i.prev=new C.Buf16(i.w_size),i.lit_bufsize=1<<f+6,i.pending_buf_size=4*i.lit_bufsize,i.pending_buf=new C.Buf8(i.pending_buf_size),i.d_buf=i.lit_bufsize>>1,i.l_buf=3*i.lit_bufsize,i.level=b,i.strategy=g,i.method=c,v(a)}function y(a,b){return x(a,b,Y,$,_,W)}function z(a,b){var c,h,k,l;if(!a||!a.state||b>L||0>b)return a?d(a,O):O;if(h=a.state,!a.output||!a.input&&0!==a.avail_in||h.status===rb&&b!==K)return d(a,0===a.avail_out?Q:O);if(h.strm=a,c=h.last_flush,h.last_flush=b,h.status===lb)if(2===h.wrap)a.adler=0,i(h,31),i(h,139),i(h,8),h.gzhead?(i(h,(h.gzhead.text?1:0)+(h.gzhead.hcrc?2:0)+(h.gzhead.extra?4:0)+(h.gzhead.name?8:0)+(h.gzhead.comment?16:0)),i(h,255&h.gzhead.time),i(h,h.gzhead.time>>8&255),i(h,h.gzhead.time>>16&255),i(h,h.gzhead.time>>24&255),i(h,9===h.level?2:h.strategy>=T||h.level<2?4:0),i(h,255&h.gzhead.os),h.gzhead.extra&&h.gzhead.extra.length&&(i(h,255&h.gzhead.extra.length),i(h,h.gzhead.extra.length>>8&255)),h.gzhead.hcrc&&(a.adler=F(a.adler,h.pending_buf,h.pending,0)),h.gzindex=0,h.status=mb):(i(h,0),i(h,0),i(h,0),i(h,0),i(h,0),i(h,9===h.level?2:h.strategy>=T||h.level<2?4:0),i(h,wb),h.status=qb);else{var m=Y+(h.w_bits-8<<4)<<8,n=-1;n=h.strategy>=T||h.level<2?0:h.level<6?1:6===h.level?2:3,m|=n<<6,0!==h.strstart&&(m|=kb),m+=31-m%31,h.status=qb,j(h,m),0!==h.strstart&&(j(h,a.adler>>>16),j(h,65535&a.adler)),a.adler=1}if(h.status===mb)if(h.gzhead.extra){for(k=h.pending;h.gzindex<(65535&h.gzhead.extra.length)&&(h.pending!==h.pending_buf_size||(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending!==h.pending_buf_size));)i(h,255&h.gzhead.extra[h.gzindex]),h.gzindex++;h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),h.gzindex===h.gzhead.extra.length&&(h.gzindex=0,h.status=nb)}else h.status=nb;if(h.status===nb)if(h.gzhead.name){k=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending===h.pending_buf_size)){l=1;break}l=h.gzindex<h.gzhead.name.length?255&h.gzhead.name.charCodeAt(h.gzindex++):0,i(h,l)}while(0!==l);h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),0===l&&(h.gzindex=0,h.status=ob)}else h.status=ob;if(h.status===ob)if(h.gzhead.comment){k=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending===h.pending_buf_size)){l=1;break}l=h.gzindex<h.gzhead.comment.length?255&h.gzhead.comment.charCodeAt(h.gzindex++):0,i(h,l)}while(0!==l);h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),0===l&&(h.status=pb)}else h.status=pb;if(h.status===pb&&(h.gzhead.hcrc?(h.pending+2>h.pending_buf_size&&g(a),h.pending+2<=h.pending_buf_size&&(i(h,255&a.adler),i(h,a.adler>>8&255),a.adler=0,h.status=qb)):h.status=qb),0!==h.pending){if(g(a),0===a.avail_out)return h.last_flush=-1,M}else if(0===a.avail_in&&e(b)<=e(c)&&b!==K)return d(a,Q);if(h.status===rb&&0!==a.avail_in)return d(a,Q);if(0!==a.avail_in||0!==h.lookahead||b!==H&&h.status!==rb){var o=h.strategy===T?r(h,b):h.strategy===U?q(h,b):B[h.level].func(h,b);if((o===ub||o===vb)&&(h.status=rb),o===sb||o===ub)return 0===a.avail_out&&(h.last_flush=-1),M;if(o===tb&&(b===I?D._tr_align(h):b!==L&&(D._tr_stored_block(h,0,0,!1),b===J&&(f(h.head),0===h.lookahead&&(h.strstart=0,h.block_start=0,h.insert=0))),g(a),0===a.avail_out))return h.last_flush=-1,M}return b!==K?M:h.wrap<=0?N:(2===h.wrap?(i(h,255&a.adler),i(h,a.adler>>8&255),i(h,a.adler>>16&255),i(h,a.adler>>24&255),i(h,255&a.total_in),i(h,a.total_in>>8&255),i(h,a.total_in>>16&255),i(h,a.total_in>>24&255)):(j(h,a.adler>>>16),j(h,65535&a.adler)),g(a),h.wrap>0&&(h.wrap=-h.wrap),0!==h.pending?M:N)}function A(a){var b;return a&&a.state?(b=a.state.status,b!==lb&&b!==mb&&b!==nb&&b!==ob&&b!==pb&&b!==qb&&b!==rb?d(a,O):(a.state=null,b===qb?d(a,P):M)):O}var B,C=a("../utils/common"),D=a("./trees"),E=a("./adler32"),F=a("./crc32"),G=a("./messages"),H=0,I=1,J=3,K=4,L=5,M=0,N=1,O=-2,P=-3,Q=-5,R=-1,S=1,T=2,U=3,V=4,W=0,X=2,Y=8,Z=9,$=15,_=8,ab=29,bb=256,cb=bb+1+ab,db=30,eb=19,fb=2*cb+1,gb=15,hb=3,ib=258,jb=ib+hb+1,kb=32,lb=42,mb=69,nb=73,ob=91,pb=103,qb=113,rb=666,sb=1,tb=2,ub=3,vb=4,wb=3,xb=function(a,b,c,d,e){this.good_length=a,this.max_lazy=b,this.nice_length=c,this.max_chain=d,this.func=e};B=[new xb(0,0,0,0,n),new xb(4,4,8,4,o),new xb(4,5,16,8,o),new xb(4,6,32,32,o),new xb(4,4,16,16,p),new xb(8,16,32,32,p),new xb(8,16,128,128,p),new xb(8,32,128,256,p),new xb(32,128,258,1024,p),new xb(32,258,258,4096,p)],c.deflateInit=y,c.deflateInit2=x,c.deflateReset=v,c.deflateResetKeep=u,c.deflateSetHeader=w,c.deflate=z,c.deflateEnd=A,c.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":27,"./adler32":29,"./crc32":31,"./messages":37,"./trees":38}],33:[function(a,b){"use strict";function c(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}b.exports=c},{}],34:[function(a,b){"use strict";var c=30,d=12;b.exports=function(a,b){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C;e=a.state,f=a.next_in,B=a.input,g=f+(a.avail_in-5),h=a.next_out,C=a.output,i=h-(b-a.avail_out),j=h+(a.avail_out-257),k=e.dmax,l=e.wsize,m=e.whave,n=e.wnext,o=e.window,p=e.hold,q=e.bits,r=e.lencode,s=e.distcode,t=(1<<e.lenbits)-1,u=(1<<e.distbits)-1;a:do{15>q&&(p+=B[f++]<<q,q+=8,p+=B[f++]<<q,q+=8),v=r[p&t];b:for(;;){if(w=v>>>24,p>>>=w,q-=w,w=v>>>16&255,0===w)C[h++]=65535&v;else{if(!(16&w)){if(0===(64&w)){v=r[(65535&v)+(p&(1<<w)-1)];continue b}if(32&w){e.mode=d;break a}a.msg="invalid literal/length code",e.mode=c;break a}x=65535&v,w&=15,w&&(w>q&&(p+=B[f++]<<q,q+=8),x+=p&(1<<w)-1,p>>>=w,q-=w),15>q&&(p+=B[f++]<<q,q+=8,p+=B[f++]<<q,q+=8),v=s[p&u];c:for(;;){if(w=v>>>24,p>>>=w,q-=w,w=v>>>16&255,!(16&w)){if(0===(64&w)){v=s[(65535&v)+(p&(1<<w)-1)];continue c}a.msg="invalid distance code",e.mode=c;break a}if(y=65535&v,w&=15,w>q&&(p+=B[f++]<<q,q+=8,w>q&&(p+=B[f++]<<q,q+=8)),y+=p&(1<<w)-1,y>k){a.msg="invalid distance too far back",e.mode=c;break a}if(p>>>=w,q-=w,w=h-i,y>w){if(w=y-w,w>m&&e.sane){a.msg="invalid distance too far back",e.mode=c;break a}if(z=0,A=o,0===n){if(z+=l-w,x>w){x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}}else if(w>n){if(z+=l+n-w,w-=n,x>w){x-=w;do C[h++]=o[z++];while(--w);if(z=0,x>n){w=n,x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}}}else if(z+=n-w,x>w){x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}for(;x>2;)C[h++]=A[z++],C[h++]=A[z++],C[h++]=A[z++],x-=3;x&&(C[h++]=A[z++],x>1&&(C[h++]=A[z++]))}else{z=h-y;do C[h++]=C[z++],C[h++]=C[z++],C[h++]=C[z++],x-=3;while(x>2);x&&(C[h++]=C[z++],x>1&&(C[h++]=C[z++]))}break}}break}}while(g>f&&j>h);x=q>>3,f-=x,q-=x<<3,p&=(1<<q)-1,a.next_in=f,a.next_out=h,a.avail_in=g>f?5+(g-f):5-(f-g),a.avail_out=j>h?257+(j-h):257-(h-j),e.hold=p,e.bits=q}},{}],35:[function(a,b,c){"use strict";function d(a){return(a>>>24&255)+(a>>>8&65280)+((65280&a)<<8)+((255&a)<<24)}function e(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new r.Buf16(320),this.work=new r.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function f(a){var b;return a&&a.state?(b=a.state,a.total_in=a.total_out=b.total=0,a.msg="",b.wrap&&(a.adler=1&b.wrap),b.mode=K,b.last=0,b.havedict=0,b.dmax=32768,b.head=null,b.hold=0,b.bits=0,b.lencode=b.lendyn=new r.Buf32(ob),b.distcode=b.distdyn=new r.Buf32(pb),b.sane=1,b.back=-1,C):F}function g(a){var b;return a&&a.state?(b=a.state,b.wsize=0,b.whave=0,b.wnext=0,f(a)):F}function h(a,b){var c,d;return a&&a.state?(d=a.state,0>b?(c=0,b=-b):(c=(b>>4)+1,48>b&&(b&=15)),b&&(8>b||b>15)?F:(null!==d.window&&d.wbits!==b&&(d.window=null),d.wrap=c,d.wbits=b,g(a))):F}function i(a,b){var c,d;return a?(d=new e,a.state=d,d.window=null,c=h(a,b),c!==C&&(a.state=null),c):F}function j(a){return i(a,rb)}function k(a){if(sb){var b;for(p=new r.Buf32(512),q=new r.Buf32(32),b=0;144>b;)a.lens[b++]=8;for(;256>b;)a.lens[b++]=9;for(;280>b;)a.lens[b++]=7;for(;288>b;)a.lens[b++]=8;for(v(x,a.lens,0,288,p,0,a.work,{bits:9}),b=0;32>b;)a.lens[b++]=5;v(y,a.lens,0,32,q,0,a.work,{bits:5}),sb=!1}a.lencode=p,a.lenbits=9,a.distcode=q,a.distbits=5}function l(a,b,c,d){var e,f=a.state;return null===f.window&&(f.wsize=1<<f.wbits,f.wnext=0,f.whave=0,f.window=new r.Buf8(f.wsize)),d>=f.wsize?(r.arraySet(f.window,b,c-f.wsize,f.wsize,0),f.wnext=0,f.whave=f.wsize):(e=f.wsize-f.wnext,e>d&&(e=d),r.arraySet(f.window,b,c-d,e,f.wnext),d-=e,d?(r.arraySet(f.window,b,c-d,d,0),f.wnext=d,f.whave=f.wsize):(f.wnext+=e,f.wnext===f.wsize&&(f.wnext=0),f.whave<f.wsize&&(f.whave+=e))),0}function m(a,b){var c,e,f,g,h,i,j,m,n,o,p,q,ob,pb,qb,rb,sb,tb,ub,vb,wb,xb,yb,zb,Ab=0,Bb=new r.Buf8(4),Cb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!a||!a.state||!a.output||!a.input&&0!==a.avail_in)return F;c=a.state,c.mode===V&&(c.mode=W),h=a.next_out,f=a.output,j=a.avail_out,g=a.next_in,e=a.input,i=a.avail_in,m=c.hold,n=c.bits,o=i,p=j,xb=C;a:for(;;)switch(c.mode){case K:if(0===c.wrap){c.mode=W;break}for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(2&c.wrap&&35615===m){c.check=0,Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0),m=0,n=0,c.mode=L;break}if(c.flags=0,c.head&&(c.head.done=!1),!(1&c.wrap)||(((255&m)<<8)+(m>>8))%31){a.msg="incorrect header check",c.mode=lb;break}if((15&m)!==J){a.msg="unknown compression method",c.mode=lb;break}if(m>>>=4,n-=4,wb=(15&m)+8,0===c.wbits)c.wbits=wb;else if(wb>c.wbits){a.msg="invalid window size",c.mode=lb;break}c.dmax=1<<wb,a.adler=c.check=1,c.mode=512&m?T:V,m=0,n=0;break;case L:for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(c.flags=m,(255&c.flags)!==J){a.msg="unknown compression method",c.mode=lb;break}if(57344&c.flags){a.msg="unknown header flags set",c.mode=lb;break}c.head&&(c.head.text=m>>8&1),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0,c.mode=M;case M:for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.head&&(c.head.time=m),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,Bb[2]=m>>>16&255,Bb[3]=m>>>24&255,c.check=t(c.check,Bb,4,0)),m=0,n=0,c.mode=N;case N:for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.head&&(c.head.xflags=255&m,c.head.os=m>>8),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0,c.mode=O;case O:if(1024&c.flags){for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.length=m,c.head&&(c.head.extra_len=m),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0}else c.head&&(c.head.extra=null);c.mode=P;case P:if(1024&c.flags&&(q=c.length,q>i&&(q=i),q&&(c.head&&(wb=c.head.extra_len-c.length,c.head.extra||(c.head.extra=new Array(c.head.extra_len)),r.arraySet(c.head.extra,e,g,q,wb)),512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,c.length-=q),c.length))break a;c.length=0,c.mode=Q;case Q:if(2048&c.flags){if(0===i)break a;q=0;do wb=e[g+q++],c.head&&wb&&c.length<65536&&(c.head.name+=String.fromCharCode(wb));while(wb&&i>q);if(512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,wb)break a}else c.head&&(c.head.name=null);c.length=0,c.mode=R;case R:if(4096&c.flags){if(0===i)break a;q=0;do wb=e[g+q++],c.head&&wb&&c.length<65536&&(c.head.comment+=String.fromCharCode(wb));while(wb&&i>q);if(512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,wb)break a}else c.head&&(c.head.comment=null);c.mode=S;case S:if(512&c.flags){for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m!==(65535&c.check)){a.msg="header crc mismatch",c.mode=lb;break}m=0,n=0}c.head&&(c.head.hcrc=c.flags>>9&1,c.head.done=!0),a.adler=c.check=0,c.mode=V;break;case T:for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}a.adler=c.check=d(m),m=0,n=0,c.mode=U;case U:if(0===c.havedict)return a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,E;a.adler=c.check=1,c.mode=V;case V:if(b===A||b===B)break a;case W:if(c.last){m>>>=7&n,n-=7&n,c.mode=ib;break}for(;3>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}switch(c.last=1&m,m>>>=1,n-=1,3&m){case 0:c.mode=X;break;case 1:if(k(c),c.mode=bb,b===B){m>>>=2,n-=2;break a}break;case 2:c.mode=$;break;case 3:a.msg="invalid block type",c.mode=lb}m>>>=2,n-=2;break;case X:for(m>>>=7&n,n-=7&n;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if((65535&m)!==(m>>>16^65535)){a.msg="invalid stored block lengths",c.mode=lb;break}if(c.length=65535&m,m=0,n=0,c.mode=Y,b===B)break a;case Y:c.mode=Z;case Z:if(q=c.length){if(q>i&&(q=i),q>j&&(q=j),0===q)break a;r.arraySet(f,e,g,q,h),i-=q,g+=q,j-=q,h+=q,c.length-=q;break}c.mode=V;break;case $:for(;14>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(c.nlen=(31&m)+257,m>>>=5,n-=5,c.ndist=(31&m)+1,m>>>=5,n-=5,c.ncode=(15&m)+4,m>>>=4,n-=4,c.nlen>286||c.ndist>30){a.msg="too many length or distance symbols",c.mode=lb;break}c.have=0,c.mode=_;case _:for(;c.have<c.ncode;){for(;3>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.lens[Cb[c.have++]]=7&m,m>>>=3,n-=3}for(;c.have<19;)c.lens[Cb[c.have++]]=0;if(c.lencode=c.lendyn,c.lenbits=7,yb={bits:c.lenbits},xb=v(w,c.lens,0,19,c.lencode,0,c.work,yb),c.lenbits=yb.bits,xb){a.msg="invalid code lengths set",c.mode=lb;break}c.have=0,c.mode=ab;case ab:for(;c.have<c.nlen+c.ndist;){for(;Ab=c.lencode[m&(1<<c.lenbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(16>sb)m>>>=qb,n-=qb,c.lens[c.have++]=sb;else{if(16===sb){for(zb=qb+2;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m>>>=qb,n-=qb,0===c.have){a.msg="invalid bit length repeat",c.mode=lb;break}wb=c.lens[c.have-1],q=3+(3&m),m>>>=2,n-=2}else if(17===sb){for(zb=qb+3;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=qb,n-=qb,wb=0,q=3+(7&m),m>>>=3,n-=3}else{for(zb=qb+7;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=qb,n-=qb,wb=0,q=11+(127&m),m>>>=7,n-=7}if(c.have+q>c.nlen+c.ndist){a.msg="invalid bit length repeat",c.mode=lb;break}for(;q--;)c.lens[c.have++]=wb}}if(c.mode===lb)break;if(0===c.lens[256]){a.msg="invalid code -- missing end-of-block",c.mode=lb;break}if(c.lenbits=9,yb={bits:c.lenbits},xb=v(x,c.lens,0,c.nlen,c.lencode,0,c.work,yb),c.lenbits=yb.bits,xb){a.msg="invalid literal/lengths set",c.mode=lb;break}if(c.distbits=6,c.distcode=c.distdyn,yb={bits:c.distbits},xb=v(y,c.lens,c.nlen,c.ndist,c.distcode,0,c.work,yb),c.distbits=yb.bits,xb){a.msg="invalid distances set",c.mode=lb;break}if(c.mode=bb,b===B)break a;case bb:c.mode=cb;case cb:if(i>=6&&j>=258){a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,u(a,p),h=a.next_out,f=a.output,j=a.avail_out,g=a.next_in,e=a.input,i=a.avail_in,m=c.hold,n=c.bits,c.mode===V&&(c.back=-1);
break}for(c.back=0;Ab=c.lencode[m&(1<<c.lenbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(rb&&0===(240&rb)){for(tb=qb,ub=rb,vb=sb;Ab=c.lencode[vb+((m&(1<<tb+ub)-1)>>tb)],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=tb+qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=tb,n-=tb,c.back+=tb}if(m>>>=qb,n-=qb,c.back+=qb,c.length=sb,0===rb){c.mode=hb;break}if(32&rb){c.back=-1,c.mode=V;break}if(64&rb){a.msg="invalid literal/length code",c.mode=lb;break}c.extra=15&rb,c.mode=db;case db:if(c.extra){for(zb=c.extra;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.length+=m&(1<<c.extra)-1,m>>>=c.extra,n-=c.extra,c.back+=c.extra}c.was=c.length,c.mode=eb;case eb:for(;Ab=c.distcode[m&(1<<c.distbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(0===(240&rb)){for(tb=qb,ub=rb,vb=sb;Ab=c.distcode[vb+((m&(1<<tb+ub)-1)>>tb)],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=tb+qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=tb,n-=tb,c.back+=tb}if(m>>>=qb,n-=qb,c.back+=qb,64&rb){a.msg="invalid distance code",c.mode=lb;break}c.offset=sb,c.extra=15&rb,c.mode=fb;case fb:if(c.extra){for(zb=c.extra;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.offset+=m&(1<<c.extra)-1,m>>>=c.extra,n-=c.extra,c.back+=c.extra}if(c.offset>c.dmax){a.msg="invalid distance too far back",c.mode=lb;break}c.mode=gb;case gb:if(0===j)break a;if(q=p-j,c.offset>q){if(q=c.offset-q,q>c.whave&&c.sane){a.msg="invalid distance too far back",c.mode=lb;break}q>c.wnext?(q-=c.wnext,ob=c.wsize-q):ob=c.wnext-q,q>c.length&&(q=c.length),pb=c.window}else pb=f,ob=h-c.offset,q=c.length;q>j&&(q=j),j-=q,c.length-=q;do f[h++]=pb[ob++];while(--q);0===c.length&&(c.mode=cb);break;case hb:if(0===j)break a;f[h++]=c.length,j--,c.mode=cb;break;case ib:if(c.wrap){for(;32>n;){if(0===i)break a;i--,m|=e[g++]<<n,n+=8}if(p-=j,a.total_out+=p,c.total+=p,p&&(a.adler=c.check=c.flags?t(c.check,f,p,h-p):s(c.check,f,p,h-p)),p=j,(c.flags?m:d(m))!==c.check){a.msg="incorrect data check",c.mode=lb;break}m=0,n=0}c.mode=jb;case jb:if(c.wrap&&c.flags){for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m!==(4294967295&c.total)){a.msg="incorrect length check",c.mode=lb;break}m=0,n=0}c.mode=kb;case kb:xb=D;break a;case lb:xb=G;break a;case mb:return H;case nb:default:return F}return a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,(c.wsize||p!==a.avail_out&&c.mode<lb&&(c.mode<ib||b!==z))&&l(a,a.output,a.next_out,p-a.avail_out)?(c.mode=mb,H):(o-=a.avail_in,p-=a.avail_out,a.total_in+=o,a.total_out+=p,c.total+=p,c.wrap&&p&&(a.adler=c.check=c.flags?t(c.check,f,p,a.next_out-p):s(c.check,f,p,a.next_out-p)),a.data_type=c.bits+(c.last?64:0)+(c.mode===V?128:0)+(c.mode===bb||c.mode===Y?256:0),(0===o&&0===p||b===z)&&xb===C&&(xb=I),xb)}function n(a){if(!a||!a.state)return F;var b=a.state;return b.window&&(b.window=null),a.state=null,C}function o(a,b){var c;return a&&a.state?(c=a.state,0===(2&c.wrap)?F:(c.head=b,b.done=!1,C)):F}var p,q,r=a("../utils/common"),s=a("./adler32"),t=a("./crc32"),u=a("./inffast"),v=a("./inftrees"),w=0,x=1,y=2,z=4,A=5,B=6,C=0,D=1,E=2,F=-2,G=-3,H=-4,I=-5,J=8,K=1,L=2,M=3,N=4,O=5,P=6,Q=7,R=8,S=9,T=10,U=11,V=12,W=13,X=14,Y=15,Z=16,$=17,_=18,ab=19,bb=20,cb=21,db=22,eb=23,fb=24,gb=25,hb=26,ib=27,jb=28,kb=29,lb=30,mb=31,nb=32,ob=852,pb=592,qb=15,rb=qb,sb=!0;c.inflateReset=g,c.inflateReset2=h,c.inflateResetKeep=f,c.inflateInit=j,c.inflateInit2=i,c.inflate=m,c.inflateEnd=n,c.inflateGetHeader=o,c.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":27,"./adler32":29,"./crc32":31,"./inffast":34,"./inftrees":36}],36:[function(a,b){"use strict";var c=a("../utils/common"),d=15,e=852,f=592,g=0,h=1,i=2,j=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],k=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],l=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],m=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];b.exports=function(a,b,n,o,p,q,r,s){var t,u,v,w,x,y,z,A,B,C=s.bits,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=null,O=0,P=new c.Buf16(d+1),Q=new c.Buf16(d+1),R=null,S=0;for(D=0;d>=D;D++)P[D]=0;for(E=0;o>E;E++)P[b[n+E]]++;for(H=C,G=d;G>=1&&0===P[G];G--);if(H>G&&(H=G),0===G)return p[q++]=20971520,p[q++]=20971520,s.bits=1,0;for(F=1;G>F&&0===P[F];F++);for(F>H&&(H=F),K=1,D=1;d>=D;D++)if(K<<=1,K-=P[D],0>K)return-1;if(K>0&&(a===g||1!==G))return-1;for(Q[1]=0,D=1;d>D;D++)Q[D+1]=Q[D]+P[D];for(E=0;o>E;E++)0!==b[n+E]&&(r[Q[b[n+E]]++]=E);if(a===g?(N=R=r,y=19):a===h?(N=j,O-=257,R=k,S-=257,y=256):(N=l,R=m,y=-1),M=0,E=0,D=F,x=q,I=H,J=0,v=-1,L=1<<H,w=L-1,a===h&&L>e||a===i&&L>f)return 1;for(var T=0;;){T++,z=D-J,r[E]<y?(A=0,B=r[E]):r[E]>y?(A=R[S+r[E]],B=N[O+r[E]]):(A=96,B=0),t=1<<D-J,u=1<<I,F=u;do u-=t,p[x+(M>>J)+u]=z<<24|A<<16|B|0;while(0!==u);for(t=1<<D-1;M&t;)t>>=1;if(0!==t?(M&=t-1,M+=t):M=0,E++,0===--P[D]){if(D===G)break;D=b[n+r[E]]}if(D>H&&(M&w)!==v){for(0===J&&(J=H),x+=F,I=D-J,K=1<<I;G>I+J&&(K-=P[I+J],!(0>=K));)I++,K<<=1;if(L+=1<<I,a===h&&L>e||a===i&&L>f)return 1;v=M&w,p[v]=H<<24|I<<16|x-q|0}}return 0!==M&&(p[x+M]=D-J<<24|64<<16|0),s.bits=H,0}},{"../utils/common":27}],37:[function(a,b){"use strict";b.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],38:[function(a,b,c){"use strict";function d(a){for(var b=a.length;--b>=0;)a[b]=0}function e(a){return 256>a?gb[a]:gb[256+(a>>>7)]}function f(a,b){a.pending_buf[a.pending++]=255&b,a.pending_buf[a.pending++]=b>>>8&255}function g(a,b,c){a.bi_valid>V-c?(a.bi_buf|=b<<a.bi_valid&65535,f(a,a.bi_buf),a.bi_buf=b>>V-a.bi_valid,a.bi_valid+=c-V):(a.bi_buf|=b<<a.bi_valid&65535,a.bi_valid+=c)}function h(a,b,c){g(a,c[2*b],c[2*b+1])}function i(a,b){var c=0;do c|=1&a,a>>>=1,c<<=1;while(--b>0);return c>>>1}function j(a){16===a.bi_valid?(f(a,a.bi_buf),a.bi_buf=0,a.bi_valid=0):a.bi_valid>=8&&(a.pending_buf[a.pending++]=255&a.bi_buf,a.bi_buf>>=8,a.bi_valid-=8)}function k(a,b){var c,d,e,f,g,h,i=b.dyn_tree,j=b.max_code,k=b.stat_desc.static_tree,l=b.stat_desc.has_stree,m=b.stat_desc.extra_bits,n=b.stat_desc.extra_base,o=b.stat_desc.max_length,p=0;for(f=0;U>=f;f++)a.bl_count[f]=0;for(i[2*a.heap[a.heap_max]+1]=0,c=a.heap_max+1;T>c;c++)d=a.heap[c],f=i[2*i[2*d+1]+1]+1,f>o&&(f=o,p++),i[2*d+1]=f,d>j||(a.bl_count[f]++,g=0,d>=n&&(g=m[d-n]),h=i[2*d],a.opt_len+=h*(f+g),l&&(a.static_len+=h*(k[2*d+1]+g)));if(0!==p){do{for(f=o-1;0===a.bl_count[f];)f--;a.bl_count[f]--,a.bl_count[f+1]+=2,a.bl_count[o]--,p-=2}while(p>0);for(f=o;0!==f;f--)for(d=a.bl_count[f];0!==d;)e=a.heap[--c],e>j||(i[2*e+1]!==f&&(a.opt_len+=(f-i[2*e+1])*i[2*e],i[2*e+1]=f),d--)}}function l(a,b,c){var d,e,f=new Array(U+1),g=0;for(d=1;U>=d;d++)f[d]=g=g+c[d-1]<<1;for(e=0;b>=e;e++){var h=a[2*e+1];0!==h&&(a[2*e]=i(f[h]++,h))}}function m(){var a,b,c,d,e,f=new Array(U+1);for(c=0,d=0;O-1>d;d++)for(ib[d]=c,a=0;a<1<<_[d];a++)hb[c++]=d;for(hb[c-1]=d,e=0,d=0;16>d;d++)for(jb[d]=e,a=0;a<1<<ab[d];a++)gb[e++]=d;for(e>>=7;R>d;d++)for(jb[d]=e<<7,a=0;a<1<<ab[d]-7;a++)gb[256+e++]=d;for(b=0;U>=b;b++)f[b]=0;for(a=0;143>=a;)eb[2*a+1]=8,a++,f[8]++;for(;255>=a;)eb[2*a+1]=9,a++,f[9]++;for(;279>=a;)eb[2*a+1]=7,a++,f[7]++;for(;287>=a;)eb[2*a+1]=8,a++,f[8]++;for(l(eb,Q+1,f),a=0;R>a;a++)fb[2*a+1]=5,fb[2*a]=i(a,5);kb=new nb(eb,_,P+1,Q,U),lb=new nb(fb,ab,0,R,U),mb=new nb(new Array(0),bb,0,S,W)}function n(a){var b;for(b=0;Q>b;b++)a.dyn_ltree[2*b]=0;for(b=0;R>b;b++)a.dyn_dtree[2*b]=0;for(b=0;S>b;b++)a.bl_tree[2*b]=0;a.dyn_ltree[2*X]=1,a.opt_len=a.static_len=0,a.last_lit=a.matches=0}function o(a){a.bi_valid>8?f(a,a.bi_buf):a.bi_valid>0&&(a.pending_buf[a.pending++]=a.bi_buf),a.bi_buf=0,a.bi_valid=0}function p(a,b,c,d){o(a),d&&(f(a,c),f(a,~c)),E.arraySet(a.pending_buf,a.window,b,c,a.pending),a.pending+=c}function q(a,b,c,d){var e=2*b,f=2*c;return a[e]<a[f]||a[e]===a[f]&&d[b]<=d[c]}function r(a,b,c){for(var d=a.heap[c],e=c<<1;e<=a.heap_len&&(e<a.heap_len&&q(b,a.heap[e+1],a.heap[e],a.depth)&&e++,!q(b,d,a.heap[e],a.depth));)a.heap[c]=a.heap[e],c=e,e<<=1;a.heap[c]=d}function s(a,b,c){var d,f,i,j,k=0;if(0!==a.last_lit)do d=a.pending_buf[a.d_buf+2*k]<<8|a.pending_buf[a.d_buf+2*k+1],f=a.pending_buf[a.l_buf+k],k++,0===d?h(a,f,b):(i=hb[f],h(a,i+P+1,b),j=_[i],0!==j&&(f-=ib[i],g(a,f,j)),d--,i=e(d),h(a,i,c),j=ab[i],0!==j&&(d-=jb[i],g(a,d,j)));while(k<a.last_lit);h(a,X,b)}function t(a,b){var c,d,e,f=b.dyn_tree,g=b.stat_desc.static_tree,h=b.stat_desc.has_stree,i=b.stat_desc.elems,j=-1;for(a.heap_len=0,a.heap_max=T,c=0;i>c;c++)0!==f[2*c]?(a.heap[++a.heap_len]=j=c,a.depth[c]=0):f[2*c+1]=0;for(;a.heap_len<2;)e=a.heap[++a.heap_len]=2>j?++j:0,f[2*e]=1,a.depth[e]=0,a.opt_len--,h&&(a.static_len-=g[2*e+1]);for(b.max_code=j,c=a.heap_len>>1;c>=1;c--)r(a,f,c);e=i;do c=a.heap[1],a.heap[1]=a.heap[a.heap_len--],r(a,f,1),d=a.heap[1],a.heap[--a.heap_max]=c,a.heap[--a.heap_max]=d,f[2*e]=f[2*c]+f[2*d],a.depth[e]=(a.depth[c]>=a.depth[d]?a.depth[c]:a.depth[d])+1,f[2*c+1]=f[2*d+1]=e,a.heap[1]=e++,r(a,f,1);while(a.heap_len>=2);a.heap[--a.heap_max]=a.heap[1],k(a,b),l(f,j,a.bl_count)}function u(a,b,c){var d,e,f=-1,g=b[1],h=0,i=7,j=4;for(0===g&&(i=138,j=3),b[2*(c+1)+1]=65535,d=0;c>=d;d++)e=g,g=b[2*(d+1)+1],++h<i&&e===g||(j>h?a.bl_tree[2*e]+=h:0!==e?(e!==f&&a.bl_tree[2*e]++,a.bl_tree[2*Y]++):10>=h?a.bl_tree[2*Z]++:a.bl_tree[2*$]++,h=0,f=e,0===g?(i=138,j=3):e===g?(i=6,j=3):(i=7,j=4))}function v(a,b,c){var d,e,f=-1,i=b[1],j=0,k=7,l=4;for(0===i&&(k=138,l=3),d=0;c>=d;d++)if(e=i,i=b[2*(d+1)+1],!(++j<k&&e===i)){if(l>j){do h(a,e,a.bl_tree);while(0!==--j)}else 0!==e?(e!==f&&(h(a,e,a.bl_tree),j--),h(a,Y,a.bl_tree),g(a,j-3,2)):10>=j?(h(a,Z,a.bl_tree),g(a,j-3,3)):(h(a,$,a.bl_tree),g(a,j-11,7));j=0,f=e,0===i?(k=138,l=3):e===i?(k=6,l=3):(k=7,l=4)}}function w(a){var b;for(u(a,a.dyn_ltree,a.l_desc.max_code),u(a,a.dyn_dtree,a.d_desc.max_code),t(a,a.bl_desc),b=S-1;b>=3&&0===a.bl_tree[2*cb[b]+1];b--);return a.opt_len+=3*(b+1)+5+5+4,b}function x(a,b,c,d){var e;for(g(a,b-257,5),g(a,c-1,5),g(a,d-4,4),e=0;d>e;e++)g(a,a.bl_tree[2*cb[e]+1],3);v(a,a.dyn_ltree,b-1),v(a,a.dyn_dtree,c-1)}function y(a){var b,c=4093624447;for(b=0;31>=b;b++,c>>>=1)if(1&c&&0!==a.dyn_ltree[2*b])return G;if(0!==a.dyn_ltree[18]||0!==a.dyn_ltree[20]||0!==a.dyn_ltree[26])return H;for(b=32;P>b;b++)if(0!==a.dyn_ltree[2*b])return H;return G}function z(a){pb||(m(),pb=!0),a.l_desc=new ob(a.dyn_ltree,kb),a.d_desc=new ob(a.dyn_dtree,lb),a.bl_desc=new ob(a.bl_tree,mb),a.bi_buf=0,a.bi_valid=0,n(a)}function A(a,b,c,d){g(a,(J<<1)+(d?1:0),3),p(a,b,c,!0)}function B(a){g(a,K<<1,3),h(a,X,eb),j(a)}function C(a,b,c,d){var e,f,h=0;a.level>0?(a.strm.data_type===I&&(a.strm.data_type=y(a)),t(a,a.l_desc),t(a,a.d_desc),h=w(a),e=a.opt_len+3+7>>>3,f=a.static_len+3+7>>>3,e>=f&&(e=f)):e=f=c+5,e>=c+4&&-1!==b?A(a,b,c,d):a.strategy===F||f===e?(g(a,(K<<1)+(d?1:0),3),s(a,eb,fb)):(g(a,(L<<1)+(d?1:0),3),x(a,a.l_desc.max_code+1,a.d_desc.max_code+1,h+1),s(a,a.dyn_ltree,a.dyn_dtree)),n(a),d&&o(a)}function D(a,b,c){return a.pending_buf[a.d_buf+2*a.last_lit]=b>>>8&255,a.pending_buf[a.d_buf+2*a.last_lit+1]=255&b,a.pending_buf[a.l_buf+a.last_lit]=255&c,a.last_lit++,0===b?a.dyn_ltree[2*c]++:(a.matches++,b--,a.dyn_ltree[2*(hb[c]+P+1)]++,a.dyn_dtree[2*e(b)]++),a.last_lit===a.lit_bufsize-1}var E=a("../utils/common"),F=4,G=0,H=1,I=2,J=0,K=1,L=2,M=3,N=258,O=29,P=256,Q=P+1+O,R=30,S=19,T=2*Q+1,U=15,V=16,W=7,X=256,Y=16,Z=17,$=18,_=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],ab=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],bb=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],cb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],db=512,eb=new Array(2*(Q+2));d(eb);var fb=new Array(2*R);d(fb);var gb=new Array(db);d(gb);var hb=new Array(N-M+1);d(hb);var ib=new Array(O);d(ib);var jb=new Array(R);d(jb);var kb,lb,mb,nb=function(a,b,c,d,e){this.static_tree=a,this.extra_bits=b,this.extra_base=c,this.elems=d,this.max_length=e,this.has_stree=a&&a.length},ob=function(a,b){this.dyn_tree=a,this.max_code=0,this.stat_desc=b},pb=!1;c._tr_init=z,c._tr_stored_block=A,c._tr_flush_block=C,c._tr_tally=D,c._tr_align=B},{"../utils/common":27}],39:[function(a,b){"use strict";function c(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}b.exports=c},{}]},{},[9])(9)});

/*!
    localForage -- Offline Storage, Improved
    Version 1.4.0
    https://mozilla.github.io/localForage
    (c) 2013-2015 Mozilla, Apache License 2.0
*/
!function(){var a,b,c,d;!function(){var e={},f={};a=function(a,b,c){e[a]={deps:b,callback:c}},d=c=b=function(a){function c(b){if("."!==b.charAt(0))return b;for(var c=b.split("/"),d=a.split("/").slice(0,-1),e=0,f=c.length;f>e;e++){var g=c[e];if(".."===g)d.pop();else{if("."===g)continue;d.push(g)}}return d.join("/")}if(d._eak_seen=e,f[a])return f[a];if(f[a]={},!e[a])throw new Error("Could not find module "+a);for(var g,h=e[a],i=h.deps,j=h.callback,k=[],l=0,m=i.length;m>l;l++)"exports"===i[l]?k.push(g={}):k.push(b(c(i[l])));var n=j.apply(this,k);return f[a]=g||n}}(),a("promise/all",["./utils","exports"],function(a,b){"use strict";function c(a){var b=this;if(!d(a))throw new TypeError("You must pass an array to all.");return new b(function(b,c){function d(a){return function(b){f(a,b)}}function f(a,c){h[a]=c,0===--i&&b(h)}var g,h=[],i=a.length;0===i&&b([]);for(var j=0;j<a.length;j++)g=a[j],g&&e(g.then)?g.then(d(j),c):f(j,g)})}var d=a.isArray,e=a.isFunction;b.all=c}),a("promise/asap",["exports"],function(a){"use strict";function b(){return function(){process.nextTick(e)}}function c(){var a=0,b=new i(e),c=document.createTextNode("");return b.observe(c,{characterData:!0}),function(){c.data=a=++a%2}}function d(){return function(){j.setTimeout(e,1)}}function e(){for(var a=0;a<k.length;a++){var b=k[a],c=b[0],d=b[1];c(d)}k=[]}function f(a,b){var c=k.push([a,b]);1===c&&g()}var g,h="undefined"!=typeof window?window:{},i=h.MutationObserver||h.WebKitMutationObserver,j="undefined"!=typeof global?global:void 0===this?window:this,k=[];g="undefined"!=typeof process&&"[object process]"==={}.toString.call(process)?b():i?c():d(),a.asap=f}),a("promise/config",["exports"],function(a){"use strict";function b(a,b){return 2!==arguments.length?c[a]:void(c[a]=b)}var c={instrument:!1};a.config=c,a.configure=b}),a("promise/polyfill",["./promise","./utils","exports"],function(a,b,c){"use strict";function d(){var a;a="undefined"!=typeof global?global:"undefined"!=typeof window&&window.document?window:self;var b="Promise"in a&&"resolve"in a.Promise&&"reject"in a.Promise&&"all"in a.Promise&&"race"in a.Promise&&function(){var b;return new a.Promise(function(a){b=a}),f(b)}();b||(a.Promise=e)}var e=a.Promise,f=b.isFunction;c.polyfill=d}),a("promise/promise",["./config","./utils","./all","./race","./resolve","./reject","./asap","exports"],function(a,b,c,d,e,f,g,h){"use strict";function i(a){if(!v(a))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof i))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this._subscribers=[],j(a,this)}function j(a,b){function c(a){o(b,a)}function d(a){q(b,a)}try{a(c,d)}catch(e){d(e)}}function k(a,b,c,d){var e,f,g,h,i=v(c);if(i)try{e=c(d),g=!0}catch(j){h=!0,f=j}else e=d,g=!0;n(b,e)||(i&&g?o(b,e):h?q(b,f):a===D?o(b,e):a===E&&q(b,e))}function l(a,b,c,d){var e=a._subscribers,f=e.length;e[f]=b,e[f+D]=c,e[f+E]=d}function m(a,b){for(var c,d,e=a._subscribers,f=a._detail,g=0;g<e.length;g+=3)c=e[g],d=e[g+b],k(b,c,d,f);a._subscribers=null}function n(a,b){var c,d=null;try{if(a===b)throw new TypeError("A promises callback cannot return that same promise.");if(u(b)&&(d=b.then,v(d)))return d.call(b,function(d){return c?!0:(c=!0,void(b!==d?o(a,d):p(a,d)))},function(b){return c?!0:(c=!0,void q(a,b))}),!0}catch(e){return c?!0:(q(a,e),!0)}return!1}function o(a,b){a===b?p(a,b):n(a,b)||p(a,b)}function p(a,b){a._state===B&&(a._state=C,a._detail=b,t.async(r,a))}function q(a,b){a._state===B&&(a._state=C,a._detail=b,t.async(s,a))}function r(a){m(a,a._state=D)}function s(a){m(a,a._state=E)}var t=a.config,u=(a.configure,b.objectOrFunction),v=b.isFunction,w=(b.now,c.all),x=d.race,y=e.resolve,z=f.reject,A=g.asap;t.async=A;var B=void 0,C=0,D=1,E=2;i.prototype={constructor:i,_state:void 0,_detail:void 0,_subscribers:void 0,then:function(a,b){var c=this,d=new this.constructor(function(){});if(this._state){var e=arguments;t.async(function(){k(c._state,d,e[c._state-1],c._detail)})}else l(this,d,a,b);return d},"catch":function(a){return this.then(null,a)}},i.all=w,i.race=x,i.resolve=y,i.reject=z,h.Promise=i}),a("promise/race",["./utils","exports"],function(a,b){"use strict";function c(a){var b=this;if(!d(a))throw new TypeError("You must pass an array to race.");return new b(function(b,c){for(var d,e=0;e<a.length;e++)d=a[e],d&&"function"==typeof d.then?d.then(b,c):b(d)})}var d=a.isArray;b.race=c}),a("promise/reject",["exports"],function(a){"use strict";function b(a){var b=this;return new b(function(b,c){c(a)})}a.reject=b}),a("promise/resolve",["exports"],function(a){"use strict";function b(a){if(a&&"object"==typeof a&&a.constructor===this)return a;var b=this;return new b(function(b){b(a)})}a.resolve=b}),a("promise/utils",["exports"],function(a){"use strict";function b(a){return c(a)||"object"==typeof a&&null!==a}function c(a){return"function"==typeof a}function d(a){return"[object Array]"===Object.prototype.toString.call(a)}var e=Date.now||function(){return(new Date).getTime()};a.objectOrFunction=b,a.isFunction=c,a.isArray=d,a.now=e}),b("promise/polyfill").polyfill()}(),function(a,b){"object"==typeof exports&&"object"==typeof module?module.exports=b():"function"==typeof define&&define.amd?define([],b):"object"==typeof exports?exports.localforage=b():a.localforage=b()}(this,function(){return function(a){function b(d){if(c[d])return c[d].exports;var e=c[d]={exports:{},id:d,loaded:!1};return a[d].call(e.exports,e,e.exports,b),e.loaded=!0,e.exports}var c={};return b.m=a,b.c=c,b.p="",b(0)}([function(a,b,c){"use strict";function d(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}b.__esModule=!0;var e=function(a){function b(a,b){a[b]=function(){var c=arguments;return a.ready().then(function(){return a[b].apply(a,c)})}}function e(){for(var a=1;a<arguments.length;a++){var b=arguments[a];if(b)for(var c in b)b.hasOwnProperty(c)&&(m(b[c])?arguments[0][c]=b[c].slice():arguments[0][c]=b[c])}return arguments[0]}function f(a){for(var b in h)if(h.hasOwnProperty(b)&&h[b]===a)return!0;return!1}var g={},h={INDEXEDDB:"asyncStorage",LOCALSTORAGE:"localStorageWrapper",WEBSQL:"webSQLStorage"},i=[h.INDEXEDDB,h.WEBSQL,h.LOCALSTORAGE],j=["clear","getItem","iterate","key","keys","length","removeItem","setItem"],k={description:"",driver:i.slice(),name:"localforage",size:4980736,storeName:"keyvaluepairs",version:1},l=function(a){var b={};return b[h.INDEXEDDB]=!!function(){try{var b=b||a.indexedDB||a.webkitIndexedDB||a.mozIndexedDB||a.OIndexedDB||a.msIndexedDB;return"undefined"!=typeof a.openDatabase&&a.navigator&&a.navigator.userAgent&&/Safari/.test(a.navigator.userAgent)&&!/Chrome/.test(a.navigator.userAgent)?!1:b&&"function"==typeof b.open&&"undefined"!=typeof a.IDBKeyRange}catch(c){return!1}}(),b[h.WEBSQL]=!!function(){try{return a.openDatabase}catch(b){return!1}}(),b[h.LOCALSTORAGE]=!!function(){try{return a.localStorage&&"setItem"in a.localStorage&&a.localStorage.setItem}catch(b){return!1}}(),b}(a),m=Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)},n=function(){function a(b){d(this,a),this.INDEXEDDB=h.INDEXEDDB,this.LOCALSTORAGE=h.LOCALSTORAGE,this.WEBSQL=h.WEBSQL,this._defaultConfig=e({},k),this._config=e({},this._defaultConfig,b),this._driverSet=null,this._initDriver=null,this._ready=!1,this._dbInfo=null,this._wrapLibraryMethodsWithReady(),this.setDriver(this._config.driver)}return a.prototype.config=function(a){if("object"==typeof a){if(this._ready)return new Error("Can't call config() after localforage has been used.");for(var b in a)"storeName"===b&&(a[b]=a[b].replace(/\W/g,"_")),this._config[b]=a[b];return"driver"in a&&a.driver&&this.setDriver(this._config.driver),!0}return"string"==typeof a?this._config[a]:this._config},a.prototype.defineDriver=function(a,b,c){var d=new Promise(function(b,c){try{var d=a._driver,e=new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver"),h=new Error("Custom driver name already in use: "+a._driver);if(!a._driver)return void c(e);if(f(a._driver))return void c(h);for(var i=j.concat("_initStorage"),k=0;k<i.length;k++){var m=i[k];if(!m||!a[m]||"function"!=typeof a[m])return void c(e)}var n=Promise.resolve(!0);"_support"in a&&(n=a._support&&"function"==typeof a._support?a._support():Promise.resolve(!!a._support)),n.then(function(c){l[d]=c,g[d]=a,b()},c)}catch(o){c(o)}});return d.then(b,c),d},a.prototype.driver=function(){return this._driver||null},a.prototype.getDriver=function(a,b,d){var e=this,h=function(){if(f(a))switch(a){case e.INDEXEDDB:return new Promise(function(a,b){a(c(1))});case e.LOCALSTORAGE:return new Promise(function(a,b){a(c(2))});case e.WEBSQL:return new Promise(function(a,b){a(c(4))})}else if(g[a])return Promise.resolve(g[a]);return Promise.reject(new Error("Driver not found."))}();return h.then(b,d),h},a.prototype.getSerializer=function(a){var b=new Promise(function(a,b){a(c(3))});return a&&"function"==typeof a&&b.then(function(b){a(b)}),b},a.prototype.ready=function(a){var b=this,c=b._driverSet.then(function(){return null===b._ready&&(b._ready=b._initDriver()),b._ready});return c.then(a,a),c},a.prototype.setDriver=function(a,b,c){function d(){f._config.driver=f.driver()}function e(a){return function(){function b(){for(;c<a.length;){var e=a[c];return c++,f._dbInfo=null,f._ready=null,f.getDriver(e).then(function(a){return f._extend(a),d(),f._ready=f._initStorage(f._config),f._ready})["catch"](b)}d();var g=new Error("No available storage method found.");return f._driverSet=Promise.reject(g),f._driverSet}var c=0;return b()}}var f=this;m(a)||(a=[a]);var g=this._getSupportedDrivers(a),h=null!==this._driverSet?this._driverSet["catch"](function(){return Promise.resolve()}):Promise.resolve();return this._driverSet=h.then(function(){var a=g[0];return f._dbInfo=null,f._ready=null,f.getDriver(a).then(function(a){f._driver=a._driver,d(),f._wrapLibraryMethodsWithReady(),f._initDriver=e(g)})})["catch"](function(){d();var a=new Error("No available storage method found.");return f._driverSet=Promise.reject(a),f._driverSet}),this._driverSet.then(b,c),this._driverSet},a.prototype.supports=function(a){return!!l[a]},a.prototype._extend=function(a){e(this,a)},a.prototype._getSupportedDrivers=function(a){for(var b=[],c=0,d=a.length;d>c;c++){var e=a[c];this.supports(e)&&b.push(e)}return b},a.prototype._wrapLibraryMethodsWithReady=function(){for(var a=0;a<j.length;a++)b(this,j[a])},a.prototype.createInstance=function(b){return new a(b)},a}();return new n}("undefined"!=typeof window?window:self);b["default"]=e,a.exports=b["default"]},function(a,b){"use strict";b.__esModule=!0;var c=function(a){function b(b,c){b=b||[],c=c||{};try{return new Blob(b,c)}catch(d){if("TypeError"!==d.name)throw d;for(var e=a.BlobBuilder||a.MSBlobBuilder||a.MozBlobBuilder||a.WebKitBlobBuilder,f=new e,g=0;g<b.length;g+=1)f.append(b[g]);return f.getBlob(c.type)}}function c(a){for(var b=a.length,c=new ArrayBuffer(b),d=new Uint8Array(c),e=0;b>e;e++)d[e]=a.charCodeAt(e);return c}function d(a){return new Promise(function(b,c){var d=new XMLHttpRequest;d.open("GET",a),d.withCredentials=!0,d.responseType="arraybuffer",d.onreadystatechange=function(){return 4===d.readyState?200===d.status?b({response:d.response,type:d.getResponseHeader("Content-Type")}):void c({status:d.status,response:d.response}):void 0},d.send()})}function e(a){return new Promise(function(c,e){var f=b([""],{type:"image/png"}),g=a.transaction([D],"readwrite");g.objectStore(D).put(f,"key"),g.oncomplete=function(){var b=a.transaction([D],"readwrite"),f=b.objectStore(D).get("key");f.onerror=e,f.onsuccess=function(a){var b=a.target.result,e=URL.createObjectURL(b);d(e).then(function(a){c(!(!a||"image/png"!==a.type))},function(){c(!1)}).then(function(){URL.revokeObjectURL(e)})}},g.onerror=g.onabort=e})["catch"](function(){return!1})}function f(a){return"boolean"==typeof B?Promise.resolve(B):e(a).then(function(a){return B=a})}function g(a){return new Promise(function(b,c){var d=new FileReader;d.onerror=c,d.onloadend=function(c){var d=btoa(c.target.result||"");b({__local_forage_encoded_blob:!0,data:d,type:a.type})},d.readAsBinaryString(a)})}function h(a){var d=c(atob(a.data));return b([d],{type:a.type})}function i(a){return a&&a.__local_forage_encoded_blob}function j(a){var b=this,c=b._initReady().then(function(){var a=C[b._dbInfo.name];return a&&a.dbReady?a.dbReady:void 0});return c.then(a,a),c}function k(a){var b=C[a.name],c={};c.promise=new Promise(function(a){c.resolve=a}),b.deferredOperations.push(c),b.dbReady?b.dbReady=b.dbReady.then(function(){return c.promise}):b.dbReady=c.promise}function l(a){var b=C[a.name],c=b.deferredOperations.pop();c&&c.resolve()}function m(a){function b(){return Promise.resolve()}var c=this,d={db:null};if(a)for(var e in a)d[e]=a[e];C||(C={});var f=C[d.name];f||(f={forages:[],db:null,dbReady:null,deferredOperations:[]},C[d.name]=f),f.forages.push(c),c._initReady||(c._initReady=c.ready,c.ready=j);for(var g=[],h=0;h<f.forages.length;h++){var i=f.forages[h];i!==c&&g.push(i._initReady()["catch"](b))}var k=f.forages.slice(0);return Promise.all(g).then(function(){return d.db=f.db,n(d)}).then(function(a){return d.db=a,q(d,c._defaultConfig.version)?o(d):a}).then(function(a){d.db=f.db=a,c._dbInfo=d;for(var b=0;b<k.length;b++){var e=k[b];e!==c&&(e._dbInfo.db=d.db,e._dbInfo.version=d.version)}})}function n(a){return p(a,!1)}function o(a){return p(a,!0)}function p(b,c){return new Promise(function(d,e){if(b.db){if(!c)return d(b.db);k(b),b.db.close()}var f=[b.name];c&&f.push(b.version);var g=A.open.apply(A,f);c&&(g.onupgradeneeded=function(c){var d=g.result;try{d.createObjectStore(b.storeName),c.oldVersion<=1&&d.createObjectStore(D)}catch(e){if("ConstraintError"!==e.name)throw e;a.console.warn('The database "'+b.name+'" has been upgraded from version '+c.oldVersion+" to version "+c.newVersion+', but the storage "'+b.storeName+'" already exists.')}}),g.onerror=function(){e(g.error)},g.onsuccess=function(){d(g.result),l(b)}})}function q(b,c){if(!b.db)return!0;var d=!b.db.objectStoreNames.contains(b.storeName),e=b.version<b.db.version,f=b.version>b.db.version;if(e&&(b.version!==c&&a.console.warn('The database "'+b.name+"\" can't be downgraded from version "+b.db.version+" to version "+b.version+"."),b.version=b.db.version),f||d){if(d){var g=b.db.version+1;g>b.version&&(b.version=g)}return!0}return!1}function r(b,c){var d=this;"string"!=typeof b&&(a.console.warn(b+" used as a key, but it is not a string."),b=String(b));var e=new Promise(function(a,c){d.ready().then(function(){var e=d._dbInfo,f=e.db.transaction(e.storeName,"readonly").objectStore(e.storeName),g=f.get(b);g.onsuccess=function(){var b=g.result;void 0===b&&(b=null),i(b)&&(b=h(b)),a(b)},g.onerror=function(){c(g.error)}})["catch"](c)});return z(e,c),e}function s(a,b){var c=this,d=new Promise(function(b,d){c.ready().then(function(){var e=c._dbInfo,f=e.db.transaction(e.storeName,"readonly").objectStore(e.storeName),g=f.openCursor(),j=1;g.onsuccess=function(){var c=g.result;if(c){var d=c.value;i(d)&&(d=h(d));var e=a(d,c.key,j++);void 0!==e?b(e):c["continue"]()}else b()},g.onerror=function(){d(g.error)}})["catch"](d)});return z(d,b),d}function t(b,c,d){var e=this;"string"!=typeof b&&(a.console.warn(b+" used as a key, but it is not a string."),b=String(b));var h=new Promise(function(a,d){var h;e.ready().then(function(){return h=e._dbInfo,c instanceof Blob?f(h.db).then(function(a){return a?c:g(c)}):c}).then(function(c){var e=h.db.transaction(h.storeName,"readwrite"),f=e.objectStore(h.storeName);null===c&&(c=void 0),e.oncomplete=function(){void 0===c&&(c=null),a(c)},e.onabort=e.onerror=function(){var a=g.error?g.error:g.transaction.error;d(a)};var g=f.put(c,b)})["catch"](d)});return z(h,d),h}function u(b,c){var d=this;"string"!=typeof b&&(a.console.warn(b+" used as a key, but it is not a string."),b=String(b));var e=new Promise(function(a,c){d.ready().then(function(){var e=d._dbInfo,f=e.db.transaction(e.storeName,"readwrite"),g=f.objectStore(e.storeName),h=g["delete"](b);f.oncomplete=function(){a()},f.onerror=function(){c(h.error)},f.onabort=function(){var a=h.error?h.error:h.transaction.error;c(a)}})["catch"](c)});return z(e,c),e}function v(a){var b=this,c=new Promise(function(a,c){b.ready().then(function(){var d=b._dbInfo,e=d.db.transaction(d.storeName,"readwrite"),f=e.objectStore(d.storeName),g=f.clear();e.oncomplete=function(){a()},e.onabort=e.onerror=function(){var a=g.error?g.error:g.transaction.error;c(a)}})["catch"](c)});return z(c,a),c}function w(a){var b=this,c=new Promise(function(a,c){b.ready().then(function(){var d=b._dbInfo,e=d.db.transaction(d.storeName,"readonly").objectStore(d.storeName),f=e.count();f.onsuccess=function(){a(f.result)},f.onerror=function(){c(f.error)}})["catch"](c)});return z(c,a),c}function x(a,b){var c=this,d=new Promise(function(b,d){return 0>a?void b(null):void c.ready().then(function(){var e=c._dbInfo,f=e.db.transaction(e.storeName,"readonly").objectStore(e.storeName),g=!1,h=f.openCursor();h.onsuccess=function(){var c=h.result;return c?void(0===a?b(c.key):g?b(c.key):(g=!0,c.advance(a))):void b(null)},h.onerror=function(){d(h.error)}})["catch"](d)});return z(d,b),d}function y(a){var b=this,c=new Promise(function(a,c){b.ready().then(function(){var d=b._dbInfo,e=d.db.transaction(d.storeName,"readonly").objectStore(d.storeName),f=e.openCursor(),g=[];f.onsuccess=function(){var b=f.result;return b?(g.push(b.key),void b["continue"]()):void a(g)},f.onerror=function(){c(f.error)}})["catch"](c)});return z(c,a),c}function z(a,b){b&&a.then(function(a){b(null,a)},function(a){b(a)})}var A=A||a.indexedDB||a.webkitIndexedDB||a.mozIndexedDB||a.OIndexedDB||a.msIndexedDB;if(A){var B,C,D="local-forage-detect-blob-support",E={_driver:"asyncStorage",_initStorage:m,iterate:s,getItem:r,setItem:t,removeItem:u,clear:v,length:w,key:x,keys:y};return E}}("undefined"!=typeof window?window:self);b["default"]=c,a.exports=b["default"]},function(a,b,c){"use strict";b.__esModule=!0;var d=function(a){function b(a){var b=this,d={};if(a)for(var e in a)d[e]=a[e];return d.keyPrefix=d.name+"/",d.storeName!==b._defaultConfig.storeName&&(d.keyPrefix+=d.storeName+"/"),b._dbInfo=d,new Promise(function(a,b){a(c(3))}).then(function(a){return d.serializer=a,Promise.resolve()})}function d(a){var b=this,c=b.ready().then(function(){for(var a=b._dbInfo.keyPrefix,c=m.length-1;c>=0;c--){var d=m.key(c);0===d.indexOf(a)&&m.removeItem(d)}});return l(c,a),c}function e(b,c){var d=this;"string"!=typeof b&&(a.console.warn(b+" used as a key, but it is not a string."),b=String(b));var e=d.ready().then(function(){var a=d._dbInfo,c=m.getItem(a.keyPrefix+b);return c&&(c=a.serializer.deserialize(c)),c});return l(e,c),e}function f(a,b){var c=this,d=c.ready().then(function(){for(var b=c._dbInfo,d=b.keyPrefix,e=d.length,f=m.length,g=1,h=0;f>h;h++){var i=m.key(h);if(0===i.indexOf(d)){var j=m.getItem(i);if(j&&(j=b.serializer.deserialize(j)),j=a(j,i.substring(e),g++),void 0!==j)return j}}});return l(d,b),d}function g(a,b){var c=this,d=c.ready().then(function(){var b,d=c._dbInfo;try{b=m.key(a)}catch(e){b=null}return b&&(b=b.substring(d.keyPrefix.length)),b});return l(d,b),d}function h(a){var b=this,c=b.ready().then(function(){for(var a=b._dbInfo,c=m.length,d=[],e=0;c>e;e++)0===m.key(e).indexOf(a.keyPrefix)&&d.push(m.key(e).substring(a.keyPrefix.length));return d});return l(c,a),c}function i(a){var b=this,c=b.keys().then(function(a){return a.length});return l(c,a),c}function j(b,c){var d=this;"string"!=typeof b&&(a.console.warn(b+" used as a key, but it is not a string."),b=String(b));var e=d.ready().then(function(){var a=d._dbInfo;m.removeItem(a.keyPrefix+b)});return l(e,c),e}function k(b,c,d){var e=this;"string"!=typeof b&&(a.console.warn(b+" used as a key, but it is not a string."),b=String(b));var f=e.ready().then(function(){void 0===c&&(c=null);var a=c;return new Promise(function(d,f){var g=e._dbInfo;g.serializer.serialize(c,function(c,e){if(e)f(e);else try{m.setItem(g.keyPrefix+b,c),d(a)}catch(h){("QuotaExceededError"===h.name||"NS_ERROR_DOM_QUOTA_REACHED"===h.name)&&f(h),f(h)}})})});return l(f,d),f}function l(a,b){b&&a.then(function(a){b(null,a)},function(a){b(a)})}var m=null;try{if(!(a.localStorage&&"setItem"in a.localStorage))return;m=a.localStorage}catch(n){return}var o={_driver:"localStorageWrapper",_initStorage:b,iterate:f,getItem:e,setItem:k,removeItem:j,clear:d,length:i,key:g,keys:h};return o}("undefined"!=typeof window?window:self);b["default"]=d,a.exports=b["default"]},function(a,b){"use strict";b.__esModule=!0;var c=function(a){function b(b,c){b=b||[],c=c||{};try{return new Blob(b,c)}catch(d){if("TypeError"!==d.name)throw d;for(var e=a.BlobBuilder||a.MSBlobBuilder||a.MozBlobBuilder||a.WebKitBlobBuilder,f=new e,g=0;g<b.length;g+=1)f.append(b[g]);return f.getBlob(c.type)}}function c(a,b){var c="";if(a&&(c=a.toString()),a&&("[object ArrayBuffer]"===a.toString()||a.buffer&&"[object ArrayBuffer]"===a.buffer.toString())){var d,e=j;a instanceof ArrayBuffer?(d=a,e+=l):(d=a.buffer,"[object Int8Array]"===c?e+=n:"[object Uint8Array]"===c?e+=o:"[object Uint8ClampedArray]"===c?e+=p:"[object Int16Array]"===c?e+=q:"[object Uint16Array]"===c?e+=s:"[object Int32Array]"===c?e+=r:"[object Uint32Array]"===c?e+=t:"[object Float32Array]"===c?e+=u:"[object Float64Array]"===c?e+=v:b(new Error("Failed to get type for BinaryArray"))),b(e+f(d))}else if("[object Blob]"===c){var g=new FileReader;g.onload=function(){var c=h+a.type+"~"+f(this.result);b(j+m+c)},g.readAsArrayBuffer(a)}else try{b(JSON.stringify(a))}catch(i){console.error("Couldn't convert value into a JSON string: ",a),b(null,i)}}function d(a){if(a.substring(0,k)!==j)return JSON.parse(a);var c,d=a.substring(w),f=a.substring(k,w);if(f===m&&i.test(d)){var g=d.match(i);c=g[1],d=d.substring(g[0].length)}var h=e(d);switch(f){case l:return h;case m:return b([h],{type:c});case n:return new Int8Array(h);case o:return new Uint8Array(h);case p:return new Uint8ClampedArray(h);case q:return new Int16Array(h);case s:return new Uint16Array(h);case r:return new Int32Array(h);case t:return new Uint32Array(h);case u:return new Float32Array(h);case v:return new Float64Array(h);default:throw new Error("Unkown type: "+f)}}function e(a){var b,c,d,e,f,h=.75*a.length,i=a.length,j=0;"="===a[a.length-1]&&(h--,"="===a[a.length-2]&&h--);var k=new ArrayBuffer(h),l=new Uint8Array(k);for(b=0;i>b;b+=4)c=g.indexOf(a[b]),d=g.indexOf(a[b+1]),e=g.indexOf(a[b+2]),f=g.indexOf(a[b+3]),l[j++]=c<<2|d>>4,l[j++]=(15&d)<<4|e>>2,l[j++]=(3&e)<<6|63&f;return k}function f(a){var b,c=new Uint8Array(a),d="";for(b=0;b<c.length;b+=3)d+=g[c[b]>>2],d+=g[(3&c[b])<<4|c[b+1]>>4],d+=g[(15&c[b+1])<<2|c[b+2]>>6],d+=g[63&c[b+2]];return c.length%3===2?d=d.substring(0,d.length-1)+"=":c.length%3===1&&(d=d.substring(0,d.length-2)+"=="),d}var g="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",h="~~local_forage_type~",i=/^~~local_forage_type~([^~]+)~/,j="__lfsc__:",k=j.length,l="arbf",m="blob",n="si08",o="ui08",p="uic8",q="si16",r="si32",s="ur16",t="ui32",u="fl32",v="fl64",w=k+l.length,x={serialize:c,deserialize:d,stringToBuffer:e,bufferToString:f};return x}("undefined"!=typeof window?window:self);b["default"]=c,a.exports=b["default"]},function(a,b,c){"use strict";b.__esModule=!0;var d=function(a){function b(a){var b=this,d={db:null};if(a)for(var e in a)d[e]="string"!=typeof a[e]?a[e].toString():a[e];var f=new Promise(function(a,c){try{d.db=m(d.name,String(d.version),d.description,d.size)}catch(e){return c(e)}d.db.transaction(function(e){e.executeSql("CREATE TABLE IF NOT EXISTS "+d.storeName+" (id INTEGER PRIMARY KEY, key unique, value)",[],function(){b._dbInfo=d,a()},function(a,b){c(b)})})});return new Promise(function(a,b){a(c(3))}).then(function(a){return d.serializer=a,f})}function d(b,c){var d=this;"string"!=typeof b&&(a.console.warn(b+" used as a key, but it is not a string."),b=String(b));var e=new Promise(function(a,c){d.ready().then(function(){var e=d._dbInfo;e.db.transaction(function(d){d.executeSql("SELECT * FROM "+e.storeName+" WHERE key = ? LIMIT 1",[b],function(b,c){var d=c.rows.length?c.rows.item(0).value:null;d&&(d=e.serializer.deserialize(d)),a(d)},function(a,b){c(b)})})})["catch"](c)});return l(e,c),e}function e(a,b){var c=this,d=new Promise(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){c.executeSql("SELECT * FROM "+e.storeName,[],function(c,d){for(var f=d.rows,g=f.length,h=0;g>h;h++){var i=f.item(h),j=i.value;if(j&&(j=e.serializer.deserialize(j)),j=a(j,i.key,h+1),void 0!==j)return void b(j)}b()},function(a,b){d(b)})})})["catch"](d)});return l(d,b),d}function f(b,c,d){var e=this;"string"!=typeof b&&(a.console.warn(b+" used as a key, but it is not a string."),b=String(b));var f=new Promise(function(a,d){e.ready().then(function(){void 0===c&&(c=null);var f=c,g=e._dbInfo;g.serializer.serialize(c,function(c,e){e?d(e):g.db.transaction(function(e){e.executeSql("INSERT OR REPLACE INTO "+g.storeName+" (key, value) VALUES (?, ?)",[b,c],function(){a(f)},function(a,b){d(b)})},function(a){a.code===a.QUOTA_ERR&&d(a)})})})["catch"](d)});return l(f,d),f}function g(b,c){var d=this;"string"!=typeof b&&(a.console.warn(b+" used as a key, but it is not a string."),b=String(b));var e=new Promise(function(a,c){d.ready().then(function(){var e=d._dbInfo;e.db.transaction(function(d){d.executeSql("DELETE FROM "+e.storeName+" WHERE key = ?",[b],function(){a()},function(a,b){c(b)})})})["catch"](c)});return l(e,c),e}function h(a){var b=this,c=new Promise(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){b.executeSql("DELETE FROM "+d.storeName,[],function(){a()},function(a,b){c(b)})})})["catch"](c)});return l(c,a),c}function i(a){var b=this,c=new Promise(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){b.executeSql("SELECT COUNT(key) as c FROM "+d.storeName,[],function(b,c){var d=c.rows.item(0).c;a(d)},function(a,b){c(b)})})})["catch"](c)});return l(c,a),c}function j(a,b){var c=this,d=new Promise(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){c.executeSql("SELECT key FROM "+e.storeName+" WHERE id = ? LIMIT 1",[a+1],function(a,c){var d=c.rows.length?c.rows.item(0).key:null;b(d)},function(a,b){d(b)})})})["catch"](d)});return l(d,b),d}function k(a){var b=this,c=new Promise(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){b.executeSql("SELECT key FROM "+d.storeName,[],function(b,c){for(var d=[],e=0;e<c.rows.length;e++)d.push(c.rows.item(e).key);a(d)},function(a,b){c(b)})})})["catch"](c)});return l(c,a),c}function l(a,b){b&&a.then(function(a){b(null,a)},function(a){b(a)})}var m=a.openDatabase;if(m){var n={_driver:"webSQLStorage",_initStorage:b,iterate:e,getItem:d,setItem:f,removeItem:g,clear:h,length:i,key:j,keys:k};return n}}("undefined"!=typeof window?window:self);b["default"]=d,a.exports=b["default"]}])});

var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);

!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n;n="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,n.ss=t()}}(function(){return function t(n,r,e){function i(u,s){if(!r[u]){if(!n[u]){var a="function"==typeof require&&require;if(!s&&a)return a(u,!0);if(o)return o(u,!0);var f=new Error("Cannot find module '"+u+"'");throw f.code="MODULE_NOT_FOUND",f}var l=r[u]={exports:{}};n[u][0].call(l.exports,function(t){var r=n[u][1][t];return i(r?r:t)},l,l.exports,t,n,r,e)}return r[u].exports}for(var o="function"==typeof require&&require,u=0;u<e.length;u++)i(e[u]);return i}({1:[function(t,n,r){"use strict";var e=n.exports={};e.linearRegression=t(17),e.linearRegressionLine=t(18),e.standardDeviation=t(43),e.rSquared=t(32),e.mode=t(25),e.min=t(23),e.max=t(20),e.sum=t(45),e.quantile=t(30),e.quantileSorted=t(31),e.iqr=e.interquartileRange=t(15),e.medianAbsoluteDeviation=e.mad=t(19),e.chunk=t(7),e.shuffle=t(40),e.shuffleInPlace=t(41),e.sample=t(34),e.ckmeans=t(8),e.sortedUniqueCount=t(42),e.sumNthPowerDeviations=t(46),e.sampleCovariance=t(36),e.sampleCorrelation=t(35),e.sampleVariance=t(39),e.sampleStandardDeviation=t(38),e.sampleSkewness=t(37),e.geometricMean=t(13),e.harmonicMean=t(14),e.mean=e.average=t(21),e.median=t(22),e.rootMeanSquare=e.rms=t(33),e.variance=t(49),e.tTest=t(47),e.tTestTwoSample=t(48),e.bayesian=t(2),e.perceptron=t(27),e.epsilon=t(10),e.factorial=t(12),e.bernoulliDistribution=t(3),e.binomialDistribution=t(4),e.poissonDistribution=t(28),e.chiSquaredGoodnessOfFit=t(6),e.zScore=t(50),e.cumulativeStdNormalProbability=t(9),e.standardNormalTable=t(44),e.errorFunction=e.erf=t(11),e.inverseErrorFunction=t(16),e.probit=t(29),e.mixin=t(24)},{10:10,11:11,12:12,13:13,14:14,15:15,16:16,17:17,18:18,19:19,2:2,20:20,21:21,22:22,23:23,24:24,25:25,27:27,28:28,29:29,3:3,30:30,31:31,32:32,33:33,34:34,35:35,36:36,37:37,38:38,39:39,4:4,40:40,41:41,42:42,43:43,44:44,45:45,46:46,47:47,48:48,49:49,50:50,6:6,7:7,8:8,9:9}],2:[function(t,n,r){"use strict";function e(){this.totalCount=0,this.data={}}e.prototype.train=function(t,n){this.data[n]||(this.data[n]={});for(var r in t){var e=t[r];void 0===this.data[n][r]&&(this.data[n][r]={}),void 0===this.data[n][r][e]&&(this.data[n][r][e]=0),this.data[n][r][t[r]]++}this.totalCount++},e.prototype.score=function(t){var n,r={};for(var e in t){var i=t[e];for(n in this.data)void 0===r[n]&&(r[n]={}),this.data[n][e]?r[n][e+"_"+i]=(this.data[n][e][i]||0)/this.totalCount:r[n][e+"_"+i]=0}var o={};for(n in r)for(var u in r[n])void 0===o[n]&&(o[n]=0),o[n]+=r[n][u];return o},n.exports=e},{}],3:[function(t,n,r){"use strict";function e(t){return 0>t||t>1?null:i(1,t)}var i=t(4);n.exports=e},{4:4}],4:[function(t,n,r){"use strict";function e(t,n){if(0>n||n>1||0>=t||t%1!==0)return null;var r=0,e=0,u={};do u[r]=o(t)/(o(r)*o(t-r))*(Math.pow(n,r)*Math.pow(1-n,t-r)),e+=u[r],r++;while(1-i>e);return u}var i=t(10),o=t(12);n.exports=e},{10:10,12:12}],5:[function(t,n,r){"use strict";var e={1:{.995:0,.99:0,.975:0,.95:0,.9:.02,.5:.45,.1:2.71,.05:3.84,.025:5.02,.01:6.63,.005:7.88},2:{.995:.01,.99:.02,.975:.05,.95:.1,.9:.21,.5:1.39,.1:4.61,.05:5.99,.025:7.38,.01:9.21,.005:10.6},3:{.995:.07,.99:.11,.975:.22,.95:.35,.9:.58,.5:2.37,.1:6.25,.05:7.81,.025:9.35,.01:11.34,.005:12.84},4:{.995:.21,.99:.3,.975:.48,.95:.71,.9:1.06,.5:3.36,.1:7.78,.05:9.49,.025:11.14,.01:13.28,.005:14.86},5:{.995:.41,.99:.55,.975:.83,.95:1.15,.9:1.61,.5:4.35,.1:9.24,.05:11.07,.025:12.83,.01:15.09,.005:16.75},6:{.995:.68,.99:.87,.975:1.24,.95:1.64,.9:2.2,.5:5.35,.1:10.65,.05:12.59,.025:14.45,.01:16.81,.005:18.55},7:{.995:.99,.99:1.25,.975:1.69,.95:2.17,.9:2.83,.5:6.35,.1:12.02,.05:14.07,.025:16.01,.01:18.48,.005:20.28},8:{.995:1.34,.99:1.65,.975:2.18,.95:2.73,.9:3.49,.5:7.34,.1:13.36,.05:15.51,.025:17.53,.01:20.09,.005:21.96},9:{.995:1.73,.99:2.09,.975:2.7,.95:3.33,.9:4.17,.5:8.34,.1:14.68,.05:16.92,.025:19.02,.01:21.67,.005:23.59},10:{.995:2.16,.99:2.56,.975:3.25,.95:3.94,.9:4.87,.5:9.34,.1:15.99,.05:18.31,.025:20.48,.01:23.21,.005:25.19},11:{.995:2.6,.99:3.05,.975:3.82,.95:4.57,.9:5.58,.5:10.34,.1:17.28,.05:19.68,.025:21.92,.01:24.72,.005:26.76},12:{.995:3.07,.99:3.57,.975:4.4,.95:5.23,.9:6.3,.5:11.34,.1:18.55,.05:21.03,.025:23.34,.01:26.22,.005:28.3},13:{.995:3.57,.99:4.11,.975:5.01,.95:5.89,.9:7.04,.5:12.34,.1:19.81,.05:22.36,.025:24.74,.01:27.69,.005:29.82},14:{.995:4.07,.99:4.66,.975:5.63,.95:6.57,.9:7.79,.5:13.34,.1:21.06,.05:23.68,.025:26.12,.01:29.14,.005:31.32},15:{.995:4.6,.99:5.23,.975:6.27,.95:7.26,.9:8.55,.5:14.34,.1:22.31,.05:25,.025:27.49,.01:30.58,.005:32.8},16:{.995:5.14,.99:5.81,.975:6.91,.95:7.96,.9:9.31,.5:15.34,.1:23.54,.05:26.3,.025:28.85,.01:32,.005:34.27},17:{.995:5.7,.99:6.41,.975:7.56,.95:8.67,.9:10.09,.5:16.34,.1:24.77,.05:27.59,.025:30.19,.01:33.41,.005:35.72},18:{.995:6.26,.99:7.01,.975:8.23,.95:9.39,.9:10.87,.5:17.34,.1:25.99,.05:28.87,.025:31.53,.01:34.81,.005:37.16},19:{.995:6.84,.99:7.63,.975:8.91,.95:10.12,.9:11.65,.5:18.34,.1:27.2,.05:30.14,.025:32.85,.01:36.19,.005:38.58},20:{.995:7.43,.99:8.26,.975:9.59,.95:10.85,.9:12.44,.5:19.34,.1:28.41,.05:31.41,.025:34.17,.01:37.57,.005:40},21:{.995:8.03,.99:8.9,.975:10.28,.95:11.59,.9:13.24,.5:20.34,.1:29.62,.05:32.67,.025:35.48,.01:38.93,.005:41.4},22:{.995:8.64,.99:9.54,.975:10.98,.95:12.34,.9:14.04,.5:21.34,.1:30.81,.05:33.92,.025:36.78,.01:40.29,.005:42.8},23:{.995:9.26,.99:10.2,.975:11.69,.95:13.09,.9:14.85,.5:22.34,.1:32.01,.05:35.17,.025:38.08,.01:41.64,.005:44.18},24:{.995:9.89,.99:10.86,.975:12.4,.95:13.85,.9:15.66,.5:23.34,.1:33.2,.05:36.42,.025:39.36,.01:42.98,.005:45.56},25:{.995:10.52,.99:11.52,.975:13.12,.95:14.61,.9:16.47,.5:24.34,.1:34.28,.05:37.65,.025:40.65,.01:44.31,.005:46.93},26:{.995:11.16,.99:12.2,.975:13.84,.95:15.38,.9:17.29,.5:25.34,.1:35.56,.05:38.89,.025:41.92,.01:45.64,.005:48.29},27:{.995:11.81,.99:12.88,.975:14.57,.95:16.15,.9:18.11,.5:26.34,.1:36.74,.05:40.11,.025:43.19,.01:46.96,.005:49.65},28:{.995:12.46,.99:13.57,.975:15.31,.95:16.93,.9:18.94,.5:27.34,.1:37.92,.05:41.34,.025:44.46,.01:48.28,.005:50.99},29:{.995:13.12,.99:14.26,.975:16.05,.95:17.71,.9:19.77,.5:28.34,.1:39.09,.05:42.56,.025:45.72,.01:49.59,.005:52.34},30:{.995:13.79,.99:14.95,.975:16.79,.95:18.49,.9:20.6,.5:29.34,.1:40.26,.05:43.77,.025:46.98,.01:50.89,.005:53.67},40:{.995:20.71,.99:22.16,.975:24.43,.95:26.51,.9:29.05,.5:39.34,.1:51.81,.05:55.76,.025:59.34,.01:63.69,.005:66.77},50:{.995:27.99,.99:29.71,.975:32.36,.95:34.76,.9:37.69,.5:49.33,.1:63.17,.05:67.5,.025:71.42,.01:76.15,.005:79.49},60:{.995:35.53,.99:37.48,.975:40.48,.95:43.19,.9:46.46,.5:59.33,.1:74.4,.05:79.08,.025:83.3,.01:88.38,.005:91.95},70:{.995:43.28,.99:45.44,.975:48.76,.95:51.74,.9:55.33,.5:69.33,.1:85.53,.05:90.53,.025:95.02,.01:100.42,.005:104.22},80:{.995:51.17,.99:53.54,.975:57.15,.95:60.39,.9:64.28,.5:79.33,.1:96.58,.05:101.88,.025:106.63,.01:112.33,.005:116.32},90:{.995:59.2,.99:61.75,.975:65.65,.95:69.13,.9:73.29,.5:89.33,.1:107.57,.05:113.14,.025:118.14,.01:124.12,.005:128.3},100:{.995:67.33,.99:70.06,.975:74.22,.95:77.93,.9:82.36,.5:99.33,.1:118.5,.05:124.34,.025:129.56,.01:135.81,.005:140.17}};n.exports=e},{}],6:[function(t,n,r){"use strict";function e(t,n,r){for(var e,u,s=i(t),a=0,f=1,l=n(s),c=[],h=[],p=0;p<t.length;p++)void 0===c[t[p]]&&(c[t[p]]=0),c[t[p]]++;for(p=0;p<c.length;p++)void 0===c[p]&&(c[p]=0);for(u in l)u in c&&(h[u]=l[u]*t.length);for(u=h.length-1;u>=0;u--)h[u]<3&&(h[u-1]+=h[u],h.pop(),c[u-1]+=c[u],c.pop());for(u=0;u<c.length;u++)a+=Math.pow(c[u]-h[u],2)/h[u];return e=c.length-f-1,o[e][r]<a}var i=t(21),o=t(5);n.exports=e},{21:21,5:5}],7:[function(t,n,r){"use strict";function e(t,n){var r=[];if(0>=n)return null;for(var e=0;e<t.length;e+=n)r.push(t.slice(e,e+n));return r}n.exports=e},{}],8:[function(t,n,r){"use strict";function e(t,n){for(var r=[],e=0;t>e;e++){for(var i=[],o=0;n>o;o++)i.push(0);r.push(i)}return r}function i(t,n){if(n>t.length)throw new Error("Cannot generate more classes than there are data values");var r=u(t),i=o(r);if(1===i)return[r];for(var s=e(n,r.length),a=e(n,r.length),f=0;n>f;f++)for(var l=r[0],c=Math.max(f,1);c<r.length;c++)if(0===f){var h=Math.pow(r[c]-l,2);s[f][c]=s[f][c-1]+c/(c+1)*h;var p=c*l+r[c];l=p/(c+1)}else for(var v=0,g=0,d=c;d>=f;d--)v+=(c-d)/(c-d+1)*Math.pow(r[d]-g,2),g=(r[d]+(c-d)*g)/(c-d+1),d===c?(s[f][c]=v,a[f][c]=d,d>0&&(s[f][c]+=s[f-1][d-1])):0===d?v<=s[f][c]&&(s[f][c]=v,a[f][c]=d):v+s[f-1][d-1]<s[f][c]&&(s[f][c]=v+s[f-1][d-1],a[f][c]=d);var x=[],M=a[0].length-1;for(f=a.length-1;f>=0;f--){var w=a[f][M];x[f]=r.slice(w,M+1),f>0&&(M=w-1)}return x}var o=t(42),u=t(26);n.exports=i},{26:26,42:42}],9:[function(t,n,r){"use strict";function e(t){var n=Math.abs(t),r=Math.min(Math.round(100*n),i.length-1);return t>=0?i[r]:+(1-i[r]).toFixed(4)}var i=t(44);n.exports=e},{44:44}],10:[function(t,n,r){"use strict";var e=1e-4;n.exports=e},{}],11:[function(t,n,r){"use strict";function e(t){var n=1/(1+.5*Math.abs(t)),r=n*Math.exp(-Math.pow(t,2)-1.26551223+1.00002368*n+.37409196*Math.pow(n,2)+.09678418*Math.pow(n,3)-.18628806*Math.pow(n,4)+.27886807*Math.pow(n,5)-1.13520398*Math.pow(n,6)+1.48851587*Math.pow(n,7)-.82215223*Math.pow(n,8)+.17087277*Math.pow(n,9));return t>=0?1-r:r-1}n.exports=e},{}],12:[function(t,n,r){"use strict";function e(t){if(0>t)return null;for(var n=1,r=2;t>=r;r++)n*=r;return n}n.exports=e},{}],13:[function(t,n,r){"use strict";function e(t){if(0===t.length)return null;for(var n=1,r=0;r<t.length;r++){if(t[r]<=0)return null;n*=t[r]}return Math.pow(n,1/t.length)}n.exports=e},{}],14:[function(t,n,r){"use strict";function e(t){if(0===t.length)return null;for(var n=0,r=0;r<t.length;r++){if(t[r]<=0)return null;n+=1/t[r]}return t.length/n}n.exports=e},{}],15:[function(t,n,r){"use strict";function e(t){return 0===t.length?null:i(t,.75)-i(t,.25)}var i=t(30);n.exports=e},{30:30}],16:[function(t,n,r){"use strict";function e(t){var n=8*(Math.PI-3)/(3*Math.PI*(4-Math.PI)),r=Math.sqrt(Math.sqrt(Math.pow(2/(Math.PI*n)+Math.log(1-t*t)/2,2)-Math.log(1-t*t)/n)-(2/(Math.PI*n)+Math.log(1-t*t)/2));return t>=0?r:-r}n.exports=e},{}],17:[function(t,n,r){"use strict";function e(t){var n,r,e=t.length;if(1===e)n=0,r=t[0][1];else{for(var i,o,u,s=0,a=0,f=0,l=0,c=0;e>c;c++)i=t[c],o=i[0],u=i[1],s+=o,a+=u,f+=o*o,l+=o*u;n=(e*l-s*a)/(e*f-s*s),r=a/e-n*s/e}return{m:n,b:r}}n.exports=e},{}],18:[function(t,n,r){"use strict";function e(t){return function(n){return t.b+t.m*n}}n.exports=e},{}],19:[function(t,n,r){"use strict";function e(t){if(!t||0===t.length)return null;for(var n=i(t),r=[],e=0;e<t.length;e++)r.push(Math.abs(t[e]-n));return i(r)}var i=t(22);n.exports=e},{22:22}],20:[function(t,n,r){"use strict";function e(t){for(var n,r=0;r<t.length;r++)(t[r]>n||void 0===n)&&(n=t[r]);return n}n.exports=e},{}],21:[function(t,n,r){"use strict";function e(t){return 0===t.length?null:i(t)/t.length}var i=t(45);n.exports=e},{45:45}],22:[function(t,n,r){"use strict";function e(t){if(0===t.length)return null;var n=i(t);if(n.length%2===1)return n[(n.length-1)/2];var r=n[n.length/2-1],e=n[n.length/2];return(r+e)/2}var i=t(26);n.exports=e},{26:26}],23:[function(t,n,r){"use strict";function e(t){for(var n,r=0;r<t.length;r++)(t[r]<n||void 0===n)&&(n=t[r]);return n}n.exports=e},{}],24:[function(t,n,r){"use strict";function e(t,n){function r(n){return function(){var r=Array.prototype.slice.apply(arguments);return r.unshift(this),t[n].apply(t,r)}}var e=!(!Object.defineProperty||!Object.defineProperties);if(!e)throw new Error("without defineProperty, simple-statistics cannot be mixed in");var i,o=["median","standardDeviation","sum","sampleSkewness","mean","min","max","quantile","geometricMean","harmonicMean","root_mean_square"];i=n?n.slice():Array.prototype;for(var u=0;u<o.length;u++)Object.defineProperty(i,o[u],{value:r(o[u]),configurable:!0,enumerable:!1,writable:!0});return i}n.exports=e},{}],25:[function(t,n,r){"use strict";function e(t){if(0===t.length)return null;if(1===t.length)return t[0];for(var n,r=i(t),e=r[0],o=0,u=1,s=1;s<r.length+1;s++)r[s]!==e?(u>o&&(o=u,n=e),u=1,e=r[s]):u++;return n}var i=t(26);n.exports=e},{26:26}],26:[function(t,n,r){"use strict";function e(t){return t.slice().sort(function(t,n){return t-n})}n.exports=e},{}],27:[function(t,n,r){"use strict";function e(){this.weights=[],this.bias=0}e.prototype.predict=function(t){if(t.length!==this.weights.length)return null;for(var n=0,r=0;r<this.weights.length;r++)n+=this.weights[r]*t[r];return n+=this.bias,n>0?1:0},e.prototype.train=function(t,n){if(0!==n&&1!==n)return null;t.length!==this.weights.length&&(this.weights=t,this.bias=1);var r=this.predict(t);if(r!==n){for(var e=n-r,i=0;i<this.weights.length;i++)this.weights[i]+=e*t[i];this.bias+=e}return this},n.exports=e},{}],28:[function(t,n,r){"use strict";function e(t){if(0>=t)return null;var n=0,r=0,e={};do e[n]=Math.pow(Math.E,-t)*Math.pow(t,n)/o(n),r+=e[n],n++;while(1-i>r);return e}var i=t(10),o=t(12);n.exports=e},{10:10,12:12}],29:[function(t,n,r){"use strict";function e(t){return 0===t?t=i:t>=1&&(t=1-i),Math.sqrt(2)*o(2*t-1)}var i=t(10),o=t(16);n.exports=e},{10:10,16:16}],30:[function(t,n,r){"use strict";function e(t,n){if(0===t.length)return null;var r=o(t);if(n.length){for(var e=[],u=0;u<n.length;u++)e[u]=i(r,n[u]);return e}return i(r,n)}var i=t(31),o=t(26);n.exports=e},{26:26,31:31}],31:[function(t,n,r){"use strict";function e(t,n){var r=t.length*n;return 0>n||n>1?null:1===n?t[t.length-1]:0===n?t[0]:r%1!==0?t[Math.ceil(r)-1]:t.length%2===0?(t[r-1]+t[r])/2:t[r]}n.exports=e},{}],32:[function(t,n,r){"use strict";function e(t,n){if(t.length<2)return 1;for(var r,e=0,i=0;i<t.length;i++)e+=t[i][1];r=e/t.length;for(var o=0,u=0;u<t.length;u++)o+=Math.pow(r-t[u][1],2);for(var s=0,a=0;a<t.length;a++)s+=Math.pow(t[a][1]-n(t[a][0]),2);return 1-s/o}n.exports=e},{}],33:[function(t,n,r){"use strict";function e(t){if(0===t.length)return null;for(var n=0,r=0;r<t.length;r++)n+=Math.pow(t[r],2);return Math.sqrt(n/t.length)}n.exports=e},{}],34:[function(t,n,r){"use strict";function e(t,n,r){var e=i(t,r);return e.slice(0,n)}var i=t(40);n.exports=e},{40:40}],35:[function(t,n,r){"use strict";function e(t,n){var r=i(t,n),e=o(t),u=o(n);return null===r||null===e||null===u?null:r/e/u}var i=t(36),o=t(38);n.exports=e},{36:36,38:38}],36:[function(t,n,r){"use strict";function e(t,n){if(t.length<=1||t.length!==n.length)return null;for(var r=i(t),e=i(n),o=0,u=0;u<t.length;u++)o+=(t[u]-r)*(n[u]-e);var s=t.length-1;return o/s}var i=t(21);n.exports=e},{21:21}],37:[function(t,n,r){"use strict";function e(t){if(t.length<3)return null;var n=t.length,r=Math.pow(o(t),3),e=i(t,3);return n*e/((n-1)*(n-2)*r)}var i=t(46),o=t(38);n.exports=e},{38:38,46:46}],38:[function(t,n,r){"use strict";function e(t){return t.length<=1?null:Math.sqrt(i(t))}var i=t(39);n.exports=e},{39:39}],39:[function(t,n,r){"use strict";function e(t){if(t.length<=1)return null;var n=i(t,2),r=t.length-1;return n/r}var i=t(46);n.exports=e},{46:46}],40:[function(t,n,r){"use strict";function e(t,n){return t=t.slice(),i(t.slice(),n)}var i=t(41);n.exports=e},{41:41}],41:[function(t,n,r){"use strict";function e(t,n){n=n||Math.random;for(var r,e,i=t.length;i>0;)e=Math.floor(n()*i--),r=t[i],t[i]=t[e],t[e]=r;return t}n.exports=e},{}],42:[function(t,n,r){"use strict";function e(t){for(var n,r=0,e=0;e<t.length;e++)(0===e||t[e]!==n)&&(n=t[e],r++);return r}n.exports=e},{}],43:[function(t,n,r){"use strict";function e(t){return 0===t.length?null:Math.sqrt(i(t))}var i=t(49);n.exports=e},{49:49}],44:[function(t,n,r){"use strict";function e(t){for(var n=t,r=t,e=1;15>e;e++)r*=t*t/(2*e+1),n+=r;return Math.round(1e4*(.5+n/i*Math.exp(-t*t/2)))/1e4}for(var i=Math.sqrt(2*Math.PI),o=[],u=0;3.09>=u;u+=.01)o.push(e(u));n.exports=o},{}],45:[function(t,n,r){"use strict";function e(t){for(var n=0,r=0;r<t.length;r++)n+=t[r];return n}n.exports=e},{}],46:[function(t,n,r){"use strict";function e(t,n){for(var r=i(t),e=0,o=0;o<t.length;o++)e+=Math.pow(t[o]-r,n);return e}var i=t(21);n.exports=e},{21:21}],47:[function(t,n,r){"use strict";function e(t,n){var r=o(t),e=i(t),u=Math.sqrt(t.length);return(r-n)/(e/u)}var i=t(43),o=t(21);n.exports=e},{21:21,43:43}],48:[function(t,n,r){"use strict";function e(t,n,r){var e=t.length,u=n.length;if(!e||!u)return null;r||(r=0);var s=i(t),a=i(n),f=((e-1)*o(t)+(u-1)*o(n))/(e+u-2);return(s-a-r)/Math.sqrt(f*(1/e+1/u))}var i=t(21),o=t(39);n.exports=e},{21:21,39:39}],49:[function(t,n,r){"use strict";function e(t){return 0===t.length?null:i(t,2)/t.length}var i=t(46);n.exports=e},{46:46}],50:[function(t,n,r){"use strict";function e(t,n,r){return(t-n)/r}n.exports=e},{}]},{},[1])(1)});
//# sourceMappingURL=dist/simple_statistics.min.js.map

/* Only edit javascript files in the assets/js directory */

dusa_popover = function() {

}

dusa_popover.close = function() {
  d3.selectAll(".close-btn .b").classed("close", !d3.selectAll(".close-btn .b").classed("close"));
  d3.selectAll(".overlay").remove();
  var body = d3.select("body");
  body.on("keyup.popover", null);
  if (!body.classed("embed") && !body.classed("map")) body.style("overflow", "visible");
  d3.select(window).on("resize.popover", null);
}

function getElDimensions(el) {
  if(el === undefined){
    return [window.innerWidth, window.innerHeight];
  }
  return [
    Math.max(el.scrollWidth, el.offsetWidth, el.clientWidth),
    Math.max(el.scrollHeight, el.offsetHeight, el.clientHeight)
  ];
}


function getLinkPath(href) {
    var l = document.createElement("a");
    l.href = href;
    var tmp_url = l.pathname + l.search;
    if (tmp_url[0] != '/') {
      tmp_url = '/' + tmp_url;
    }
    return tmp_url;
}

dusa_popover.open = function(panels, active_panel_id, url, embed_url, build) {
  var active_panel = null, ev = d3.event;

  var loaded = 0, total = 0;

  var unfilteredData = build.data.map(function(d) {
    var url = d.url;

    if (url.indexOf("rank=") > 0) {
      var rank = new RegExp("&([a-z_]*)rank=([0-9,%C]*)").exec(url);
      url = url.replace(rank[0], "");
    }

    if (d.params && d.params.show) {
      d.params.show.split(",").forEach(function(s, i){
        if (s !== "geo" && s in d.params && url.indexOf(s + "=") > 0) {
          var show = new RegExp("&" + s + "=([a-zA-Z0-9,%C]*)").exec(url);
          url = url.replace(show[0], "");
        }
      });
    }

    if (d.url !== url) {
      d.url = url;
      total++;
      load(url, function(newData, other){
        d.data = viz.formatData(newData, d, build);
        loaded++;
      });
    }
    return d;
  });

  d3.select("body")
    .style("overflow", "hidden")
    .append("div")
      .attr("class", "overlay")
      .attr("id", "bg")

  var view = d3.select("body")
    .append("div")
      .attr("class", "overlay")
      .attr("id", "view")
      .on("click", dusa_popover.close)

  var modal = view
    .append("div")
      .attr("class", "modal")
      .on("click", function(){ d3.event.stopPropagation() })

  modal.append("div")
    .attr("class", "close-btn")
    .html('<div class="in"><div class="bd"><div class="b-1 b close"><span></span></div><div class="b-2 b close"><span></span></div><div class="b-3 b close"><span></span></div></div></div>')
    .on("click", dusa_popover.close)

  var header = modal
    .append("div")
      .attr("class", "header")

  header
    .append("h2")
      .text("Options")

  var body = modal
    .append("div")
      .attr("class", "body")

  var loader = body.append("div")
    .attr("class", "loader")
    .html("<i class='fa fa-spinner fa-spin'></i>Loading Data");

  var nav = body
    .append("div")
      .attr("class", "nav")

  function ready() {

    if (loaded < total) {
      setTimeout(ready, 100);
      return;
    }

    // return;

    embed_url = "https://datausa.io" + embed_url;

    loader.remove();

    var s = 250;
    panels.forEach(function(p, i){
      var panel_link = nav
        .append("span")
          .attr("class", "change_share")
          .attr("id", p.title.toLowerCase())
          .attr("data-target-id", p.title.toLowerCase())
          .text(p.title)
          .on("click", function(){
            var src = d3.event ? (d3.event.srcElement || d3.event.target) : (ev.srcElement || ev.target);
            if(src === window){
              var target_id = active_panel.attr("data-target-id");
            }
            else {
              var target_id = d3.select(src).attr("data-target-id");
              if (!target_id || typeof(target_id) != "string") target_id = d3.select(src.parentNode).attr("data-target-id");
            }
            var this_tab = d3.select(".change_share#"+target_id)
            var pos = this_tab.node().offsetLeft;
            var w = this_tab.node().offsetWidth;
            d3.select(".panels")
              .classed("noslide", this === window)
              .style("transform", "translateX("+(i*80)*-1+"vw)")
            d3.select("span.highlight")
              .classed("noslide", this === window)
              .style("width", w+"px")
              .style("left", pos+"px")
            if(target_id === "data"){
              var window_h = getElDimensions()[1];
              var el_h = getElDimensions(d3.select("div.panel#data").node())[1];
              var new_h = Math.round(Math.max(250, (Math.min(window_h, el_h) * 0.8)));
              d3.selectAll(".panel").style("height", new_h+"px")
            }
            else {
              d3.selectAll(".panel").style("height", 250+"px")
            }
          })
      if(p.title.toLowerCase() == active_panel_id){
        active_panel = panel_link;
      }
    })
    nav
      .append("span")
        .attr("class", "highlight")

    var panel_divs = body
      .append("div")
        .attr("class", "panels")
        // .style("width", (panels.length+1)*100+"%")

    panels.forEach(function(p){
      var panel = panel_divs
        .append("div")
          .attr("class", "panel")
          .attr("id", p.title.toLowerCase())

      if(p.title.toLowerCase() == "share"){
        var social = panel.append("div")
          .attr("class", "social")

        social.append("a")
          .attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(embed_url))
          .attr("target", "_blank")
          .attr("class", "fa fa-facebook")

        social.append("a")
          .attr("href", "https://twitter.com/home?status=" + encodeURIComponent(embed_url))
          .attr("target", "_blank")
          .attr("class", "fa fa-twitter")

        panel.append("input")
          .attr("type", "text")
          .attr("readonly", true)
          .attr("class", "share-link")
          .property("value", embed_url)
          .on("click", function(){ this.select(); })
      }
      else if(p.title.toLowerCase() == "embed"){
        var embed_options = panel.append("div")
          .attr("class", "embed_options")

        var demo = embed_options.append("div")
          .attr("class", "demo")
          .append("img")
            .attr("src", "/static/img/profiles/embed_viz.svg")

        var options = embed_options.append("div")
          .attr("class", "options")

        var option = options.append("div").attr("class", "option")
        option.append("p").text("Copy and paste the following code to place an interactive version of this visualization on your website.");
        option.append("input")
          .attr("type", "checkbox")
          .on("change", function(){
            var demo_img = d3.select(".demo img");
            var embed_link_input = d3.select(".embed-link");
            var old_embed_link = embed_link_input.property("value")
            if(this.checked){
              demo_img.attr("src", "/static/img/profiles/embed.svg")
              embed_link_input.property("value", old_embed_link.replace("?viz=True", "?"))
            }
            else {
              demo_img.attr("src", "/static/img/profiles/embed_viz.svg")
              embed_link_input.property("value", old_embed_link.replace("?", "?viz=True"))
            }
          })
        option.append("label").text("Include paragraph and stats")

        var sizes = options.append("select")
        sizes.append("option").attr("value", "720|480").text("Small 720 x 480")
        sizes.append("option").attr("value", "1440|1080").text("Large 1440 x 1080")
        sizes.append("option").attr("value", "").text("Fullscreen")

        sizes.on("change", function(){
          var dimensions = this[this.selectedIndex].value.split("|");
          var w = dimensions.length == 2 ? dimensions[0]+"px" : "100%";
          var h = dimensions.length == 2 ? dimensions[1]+"px" : "100%";
          d3.select(".embed-link").property("value", function(){
            var cur_val = d3.select(this).property("value")
            cur_val = cur_val.replace(/width="([px0-9%]+)"/, 'width="'+w+'"')
            cur_val = cur_val.replace(/height="([px0-9%]+)"/, 'height="'+h+'"')
            return cur_val;
          })
        })


        panel.append("input")
          .attr("type", "text")
          .attr("readonly", true)
          .attr("class", "embed-link")
          .property("value", '<iframe width="720px" height="480px" src="https://embed.datausa.io'+getLinkPath(url)+'?viz=True" frameborder="0" ></iframe>')
          .on("click", function(){ this.select(); })
      }
      else if(p.title.toLowerCase() == "download"){
        var social = panel.append("div")
          .attr("class", "filetypes")

        var container;
        if (["top", "bottom"].indexOf(build.color) >= 0) {
          container = d3.select(build.container.node().parentNode).selectAll("svg");
        }
        else {
          container = build.container.selectAll(".d3plus");
          if (container.size()) container = container.selectAll("svg");
          else container = build.container.selectAll("svg");
        }

        var file_svg = social.append("div")
          .on("click", function(){
            save(container, {"mode": "svg", "name":build.title})
          })
        file_svg.append("i")
          .attr("class", "fa fa-file-code-o")
        file_svg.append("span")
          .text("SVG")

        var file_pdf = social.append("div")
          .on("click", function(){
            save(container, {"mode": "pdf", "name":build.title})
          })
        file_pdf.append("i")
          .attr("class", "fa fa-file-pdf-o")
        file_pdf.append("span")
          .text("PDF")

        var file_img = social.append("div")
          .on("click", function(){
            save(container, {"mode": "png", "name":build.title})
          })
        file_img.append("i")
          .attr("class", "fa fa-file-image-o")
        file_img.append("span")
          .text("Image")

        var file_csv = social.append("div")
          .on("click", function(){
            // save(container, {"mode": "png", "name":build.title})

            d3.event.preventDefault();
            var urls = unfilteredData.reduce(function(arr, dataobj){ return arr.concat(dataobj.url) }, []),
                limit_regex = new RegExp("&limit=([0-9]*)"),
                zip = new JSZip();

            function loadCSV() {
              var u = urls.pop(), r = limit_regex.exec(u);
              if (r) u = u.replace(r[0], "");
              u = u.replace("/api/", "/api/csv/");
              JSZipUtils.getBinaryContent(u, function(e, d){
                var csv_title = build.title;
                if (unfilteredData.length > 1) {
                  csv_title += ("-" + (urls.length + 1));
                }
                zip.file(csv_title + ".csv", d);
                if (urls.length) {
                  loadCSV();
                }
                else {
                  saveAs(zip.generate({type:"blob"}), build.title + ".zip");
                }
              });
            }

            loadCSV();

          })
        file_csv.append("i")
          .attr("class", "fa fa-file-text-o")
        file_csv.append("span")
          .text("CSV")
      }
      else if(p.title.toLowerCase() == "data"){
        var data_panel = panel.append("div")
          .attr("class", "data")

        if (unfilteredData.length) {
          var loaded = 0, dataArray = [], headers = [], tblData = [];
          var format = build.viz.format(Object),
              textFormat = format.text.value || format.text,
              numFormat = format.number.value || format.number;

          format = function(v, key) {
            if (v === undefined || v === null) {
              return "N/A";
            }
            else if (v.constructor === Number) {
              return numFormat(v, {"key": key});
            }
            else {
              return textFormat(v, {"key": key});
            }
          }

          var tbl = data_panel.html("<table><thead><tr></tr></thead><tbody></tbody></table>").select("table")

          for (var i = 0; i < unfilteredData.length; i++) {
            var dataURL = unfilteredData[i].url.replace(/\?limit=[0-9]+&/gi, "?").replace(/&limit=[0-9]+/gi, "")
            load(dataURL, function(data, url, return_data){
              headers = headers.concat(return_data.headers);
              dataArray = dataArray.concat(data);
              loaded++;
              if(loaded === unfilteredData.length){
                headers = d3plus.util.uniques(headers);
                dataArray.forEach(function(dArr){
                  var newArr = [];
                  headers.forEach(function(header){
                    var datum = dArr[header] || " - ";
                    newArr.push(datum);
                  })
                  tblData.push(newArr);
                })
                // console.log(headers, tblData);

                /*
                 *  Table Headers
                 */
                var thead = tbl.select("thead > tr").selectAll("th")
                  .data(headers);
                thead.enter().append("th");
                thead.text(function(d){
                  return format(d).replace(/&nbsp;/g, "");
                });
                thead.exit().remove();

                // set new width of table based on headers
                // var tbl_w = 0;
                // tbl.selectAll("th").each(function() { tbl_w += this.offsetWidth });
                // data_panel.style("width", tbl_w+"px");

                /*
                 *  Table Rows
                 */
                var rows = tbl.select("tbody").selectAll("tr")
                  .data(tblData);
                rows.enter().append("tr");
                rows.each(function(d){
                  var cols = d3.select(this).selectAll("td")
                    .data(d);
                  cols.enter().append("td")
                  cols.html(function(d, i){
                    return format(d, headers[i]);
                  })
                  cols.exit().remove();
                });
                rows.exit().remove();

              }
            })
          }
        }

      }
      else if(p.title.toLowerCase() == "api"){
        var api_panel = panel.append("div")
          .attr("class", "api");

        unfilteredData.forEach(function(d, i){
          api_panel.append("h3")
            .text(function(){
              if(unfilteredData.length === 1){
                return "API URL"
              }
              return "API URL #"+(i+1);
            })

          api_panel.append("input")
            .attr("type", "text")
            .attr("readonly", true)
            .property("value", "https://api.datausa.io" + getLinkPath(d.url))
            .on("click", function(){ this.select(); })
        })

      }
    })

    if(active_panel){
      active_panel.on("click")()
    }

    // "ESC" button will close popover
    d3.select("body").on("keyup.popover", function(){
      if (d3.event.keyCode === 27) {
        dusa_popover.close();
      }
    })

    d3.select(window).on("resize.popover", function(){
      active_panel.on("click")();
    })

  }

  ready();

}

d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) {
          if (nextNodes.indexOf(link.target) < 0) {
            nextNodes.push(link.target);
          }
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};

window.onload = function() {

  d3.select("body").on("keyup.site", function(){

    // Site key events when not in an input box
    if (document.activeElement.tagName.toLowerCase() !== "input") {

      // Press "s" to highlight most recent search
      if (d3.event.keyCode === 83) {
        if(d3.select("body").classed("home")){
          d3.select("#search-home").classed("open", true);
          var search_input = d3.select("#home-search-input");
          search_input.node().focus();
          search.container = d3.select("#search-" + search_input.attr("data-search"));
          search.data = true;
          search.reload();
        }
        else {
          d3.select(".search-box").classed("open", true);
          var search_input = d3.select("#nav-search-input");
          search.data = false;
          search_input.node().focus();
        //   d3.select("#search-simple-nav").classed("open", true);
        //   search_input.node().focus();
        //   if(search_input.property("value") !== ""){
        //     // d3.select(".search-box").classed("open", true);
        //   }
        //   d3.select(".search-box").classed("open", true);
        }
      }

    }
    else {

    }

    // "ESC" button
    if (d3.event.keyCode === 27) {
      // close all search results
      d3.selectAll(".search-body").classed("open", false);
      d3.selectAll(".search-input").each(function(){ this.blur(); });
      d3.select(".search-box").classed("open", false);
      d3.select("#search-simple-nav").classed("open", false)
    }

  });

  // Key events while the search input is active
  var searchInterval, keywait = 300;
  d3.selectAll(".search-input").on("keyup.search-input", function(){

    // "ESC" button
    if (d3.event.keyCode === 27) {
      d3.select(".search-box").classed("open", false);
      d3.select("#search-simple-nav").classed("open", false);
      d3.select(".search-box input").node().blur();
    }

    // Enter button
    if (d3.event.keyCode === 13) {
      var curr_el = d3.select(this).select("a.search-item:focus").node() || d3.select("a.search-item").node();
      if(curr_el) {
        window.location = d3.select(curr_el).attr("href");
      }
      // var search_txt = d3.select(this).property("value");
      // window.location = "/search/?q="+encodeURIComponent(search_txt);
    }

    var q = this.value.toLowerCase();

    if(this.id == "nav-search-input"){
      if(q === "") {
        // d3.select("#search-simple-nav").style("display", "none")
        d3.select("#search-simple-nav").classed("open", false)
        return;
      }
      else {
        // d3.select("#search-simple-nav").style("display", "block")
        d3.select("#search-simple-nav").classed("open", true)
      }
    }

    // only execute search if it's a character not ctl, alt, arrows eventCategory
    var non_alpha_keys = [37, 38, 39, 40]
    if (d3.event.which !== 0 && String.fromCharCode(d3.event.keyCode) !== "" && non_alpha_keys.indexOf(d3.event.keyCode) < 0) {
      if (q !== search.term) {
        clearInterval(searchInterval);
        search.term = q;
        search.container = d3.select("#search-" + d3.select(this).attr("data-search"));

        if (q.length) {
          searchInterval = setTimeout(function(){
            search.reload();
            clearInterval(searchInterval);
          }, keywait);
        }
        else {
          search.reload();
        }
      }
    }

  });

  d3.selectAll(".search-input, .search-results").on("keyup.search-results", function(){
    d3.event.preventDefault();

    // Up/Down Arrows
    if (d3.event.keyCode === 40 || d3.event.keyCode === 38) {
      d3.event.preventDefault();
      var up = d3.event.keyCode === 38;

      // get current active element
      var curr_el = d3.select(this).select("a.search-item:focus").node();
      if(curr_el){
        var next_el = up ? curr_el.previousSibling : curr_el.nextSibling;
        if(!next_el){
          if(up){
            d3.select(this.parentNode.parentNode).select('input').node().focus();
          }
          else {
            next_el = document.querySelectorAll("a.search-item")[0];
          }
        }
      }
      else if(!up){
        var next_el = document.querySelectorAll(".search-item")[0];
      }

      if(next_el) {
        d3.select(next_el)
          .on("focus", function(){
            d3.select("body").style("overflow", "hidden");
          })
          .on("blur", function(){
            d3.select("body").style("overflow", null);
          })
        next_el.focus();
      }


      return false;
    }

    // Enter
    // if (d3.event.keyCode === 13) {
    //   var curr_el = d3.select(this).select("a.search-item:focus").node() || document.querySelectorAll("a.search-item")[0];
    //   console.log(curr_el)
    //   if(!curr_el){
    //     // var search_txt = d3.select(this).property("value");
    //     // window.location = "/search/?q="+encodeURIComponent(search_txt);
    //   }
    // }

  });

  d3.selectAll(".search-results").on("keydown.search-results", function(){
    // Up/Down Arrows
    if (d3.event.keyCode === 40 || d3.event.keyCode === 38) {
      d3.event.preventDefault();
      return false;
    }
  });


  d3.selectAll("[data-ga]").on("click.ga", function(){

    var _this = d3.select(this);
    var action = _this.attr("data-ga") || "click";
    var category = _this.attr("data-ga-cat") || "general";
    var label = _this.attr("data-ga-label") || "n/a";
    var target = _this.attr("data-ga-target") || false;
    var send = true;

    if(target){
      var parent = this.parentNode;
      if (action == "show data") {
        parent = parent.parentNode;
      }
      target = d3.select(parent).select(target);
      send = target.classed("visible") || target.classed("open");
    }

    if (send) {

      console.log("GA, action: ", action, "category: ", category, "label: ", label)

      ga('send', {
        hitType: 'event',
        eventCategory: category,
        eventAction: action,
        eventLabel: label
      });

    }

  })

}

var load = function(url, callback) {

  localforage.getItem("cache_version", function(error, c){

    if (parseInt(c) !== parseInt(cache_version) + 1) {
      localforage.clear();
      localforage.setItem("cache_version", parseInt(cache_version) + 1, loadUrl);
    }
    else {
      loadUrl();
    }

    function loadUrl() {

      if (load.cache[url]) {
        var data = load.cache[url];
        callback(load.datafold(data), url, data);
      }
      else {

        if (url in load.queue) {
          load.queue[url].push(callback);
        }
        else {
          load.queue[url] = [callback];

          if (load.storeLocal(url)) {

            localforage.getItem(url, function(error, data) {

              if (data) {
                data = JSON.parse(LZString.decompressFromUTF16(data));
                load.callbacks(url, data);
              }
              else {
                d3.json(url, function(error, json){
                  load.rawData(error, json, url);
                });
              }

            });

          }
          else {
            d3.json(url, function(error, data){
              load.rawData(error, data, url);
            });
          }

        }

      }

    }

  });

}

load.cache = {};
load.queue = {};

load.callbacks = function(url, data) {
  var folded = load.datafold(data);
  while (load.queue[url].length) {
    var callback = load.queue[url].shift();
    callback(folded, url, data);
  }
  delete load.queue[url];
}

load.datafold = function(data) {
  if (data.data && data.headers) {
    return data.data.map(function(d){
      return d.reduce(function(obj, v, i){
        if (data.headers[i] === "value_rca") v = v < 1 ? 0 : v;
        obj[data.headers[i]] = v;
        return obj;
      }, {});
    })
  }
  else {
    return data;
  }
}

load.storeLocal = function(url) {
  return (url.indexOf("/attrs") > 0 && url.indexOf("/search") < 0) || url.indexOf("/topojson") > 0;
}

load.rawData = function(error, data, url) {
  if (error) {
    console.log(error);
    console.log(url);
    data = {"headers": [], "data": []};
  }
  var zip = LZString.compressToUTF16(JSON.stringify(data));
  if (load.storeLocal(url)) localforage.setItem(url, zip);
  load.cache[url] = data;
  load.callbacks(url, data);
}

var save = function(svg, options) {

  options = options ? options : {};

  if (!options.mode) options.mode = "png";
  if (!options.name) options.name = "download";
  if (!options.padding) options.padding = 15;
  if (!options.scale) options.scale = 2;
  options.filename = options.name + "." + options.mode;

  if (options.mode === "svg") {
    svg.each(function(){
      var outer = d3plus.client.ie ? (new XMLSerializer()).serializeToString(this) : this.outerHTML;
      saveAs(new Blob([outer], {type:"application/svg+xml"}), options.filename);
    })
    return;
  }

  var parent = d3.select("body.map");
  if (!parent.size()) parent = d3.select(svg.node().parentNode.parentNode.parentNode.parentNode);
  var sources = parent.selectAll(".sub-source"),
      footerHeight = options.padding,
      sourceData = [],
      title = d3.select(parent.node().parentNode).select(".embed-title"),
      titleHeight = title.size() ? title.node().offsetHeight + options.padding : 0,
      sub = d3.select(parent.node().parentNode).select(".sub-title"),
      subHeight = sub.size() ? sub.node().offsetHeight + 5 : 0;
  if (sources.size()) {
    sources.each(function(d){
      sourceData.push({"y": footerHeight, "loaded": false});
      footerHeight += this.offsetHeight;
    });
  }

  var svgWidth = parseFloat(svg.attr("width"), 10),
      svgHeight = parseFloat(svg.attr("height"), 10);

  var ui = d3.select(svg.node().parentNode).select("#d3plus_drawer");
  if (ui.size()) {
    svgHeight -= ui.node().offsetHeight;
  }

  var canvas = document.createElement("canvas");
  canvas.width = (svgWidth + (options.padding * 2)) * options.scale;
  canvas.height = ((options.padding * 2) + titleHeight + subHeight + (svgHeight * svg.size()) + footerHeight) * options.scale;

  var context = canvas.getContext('2d');
  context.scale(options.scale, options.scale);
  context.clearRect(0, 0, canvas.width / 2, canvas.height / 2);

  if (options.mode === "pdf") {
    context.beginPath();
    context.rect(0, 0, canvas.width / 2, canvas.height / 2);
    context.fillStyle = "white";
    context.fill();
  }

  var imageTiles = {},
      tileGroup = svg.select("g.tiles");

  if (tileGroup.size()) {
    var scale = Math.round(parseFloat(tileGroup.attr("transform").match(/scale\(([^a-z]+)\)/i)[1])),
        translate = tileGroup.attr("transform").match(/translate\(([^a-z]+)\)/i)[1];

    translate = translate.replace(/([^a-z])\s([^a-z])/gi, "$1,$2");
    translate = translate.split(",").map(function(d){
        return Math.round(parseFloat(d) * scale);
      });

    svg.select("g.tiles").selectAll("image").each(function(){
      var x = parseFloat(d3.select(this).attr("x")) * scale + translate[0],
          y = parseFloat(d3.select(this).attr("y")) * scale + translate[1],
          url = d3.select(this).attr("href");

      imageTiles[url] = {"loaded": false};

      var img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function(){
          var canvas2 = document.createElement('CANVAS');
          var ctx2 = canvas2.getContext('2d');
          canvas2.height = scale;
          canvas2.width = scale;
          ctx2.drawImage(this, 0, 0, scale, scale);
          var himg = document.createElement('img');
          himg.src = canvas2.toDataURL('image/png');
          imageTiles[url] = {
            "img": himg,
            "loaded": true,
            "x": x,
            "y": y
          };
      };
      img.src = url;

    });
  }

  var legendIcons = svg.selectAll("#key rect");

  if (legendIcons.size()) {
    var keyBox = svg.select("#key").node().getBBox();

    var translate = svg.select("#key").attr("transform").match(/translate\(([^a-z]+)\)/i)[1];
    translate = translate.replace(/([^a-z])\s([^a-z])/gi, "$1,$2").split(",").map(Number);
    var startY = keyBox.y + translate[1];

    legendIcons.each(function(d, i){
      var pattern = d3.select(this).attr("fill");
      var image = pattern.indexOf("url") === 0;
      if (image) {
        pattern = pattern.split("#")[1];
        pattern = svg.select("#" + pattern.substring(0, pattern.length-1));
        var size = parseFloat(pattern.select("image").attr("width"));
        var rect = pattern.select("rect").node();
      }
      else {
        var rect = d3.select(this).attr("stroke", "none").node();
        var size = parseFloat(d3.select(this).attr("width"));
      }

      var x = options.padding + keyBox.x + (i * (size + 5)), y = options.padding + titleHeight + subHeight + startY;

      rect = d3plus.client.ie ? (new XMLSerializer()).serializeToString(rect) : rect.outerHTML;
      context.drawSvg(rect, x, y);

      context.save();
      if (image) {
        var img = document.createElement('img');
        img.src = pattern.select("image").attr("href");
        context.translate(x, y);
        context.drawImage(img, 0, 0, size, size);
      }
      context.restore();

    });
  }

  // Wait for all the tiles to download
  checkStatus();

  function checkStatus() {

    var allDone = true;
    for (var key in imageTiles) {
      if (!imageTiles[key].loaded) {
        allDone = false;
        break;
      }
    }

    // if (allDone) {
    //   for (var i = 0; i < sources.size(); i++) {
    //     if (!sourceData[i].loaded) {
    //       allDone = false;
    //       break;
    //     }
    //   }
    // }

    if (allDone) {
      finish();
    } else {
      setTimeout(function(){ checkStatus(); }, 500);
    }
  }

  function finish() {

    // draw image tiles
    for (var key in imageTiles) {
      var tile = imageTiles[key];
      context.save();
      context.beginPath();
      context.translate(options.padding, options.padding + titleHeight + subHeight);
      context.rect(0, 0, svgWidth, svgHeight * svg.size());
      context.clip();
      context.drawImage(tile.img, tile.x, tile.y);
      context.restore();
    }

    // // draw svg path
    svg.each(function(d, i){
      d3.select(this).selectAll("svg > *").each(function(){
        if (!d3.select(this).classed("tiles") && d3.select(this).attr("id") !== "key") {
          var outer = d3plus.client.ie ? (new XMLSerializer()).serializeToString(this) : this.outerHTML;
          context.save();
          context.translate(options.padding, options.padding + titleHeight + subHeight + (svgHeight * i));
          context.rect(0, 0, svgWidth, svgHeight);
          context.clip();
          context.drawSvg(outer);
          context.restore();
        }
      });
    });

    function text2svg(text, title) {
      text = d3.select(text);
      title = title || text.text().replace(" Options", "").trim();
      title = title
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      var fC = text.style("color"),
          fF = text.style("font-family").split(",")[0],
          fS = text.style("font-size");

      if (fF.indexOf("'") !== 0) fF = "'" + fF + "'";
      return "<text stroke='none' dy='" + fS + "' fill='" + fC + "' font-family=" + fF + " font-size='" + fS + "'>" + title + "</text>";
    }

    sources.each(function(d, i){

      var text = text2svg(this);
      context.save();
      context.translate(options.padding, options.padding + titleHeight + subHeight + (svgHeight * svg.size()) + sourceData[i].y);
      context.drawSvg(text);
      context.restore();

    });

    if (title.size()) {
      var titleText = text2svg(title.node(), options.name.split(" of ").slice(1).join(" of "));
      context.save();
      context.translate(options.padding, options.padding);
      context.drawSvg(titleText);
      context.restore();
    }

    if (sub.size()) {
      var subText = text2svg(sub.node());
      context.save();
      context.translate(options.padding, titleHeight + 5);
      context.drawSvg(subText);
      context.restore();
    }

    var logo = d3.select(".datausa-link").select("img"),
        logoHeight = logo.node().offsetHeight,
        logoWidth = logo.node().offsetWidth,
        logoX = canvas.width/options.scale - logoWidth - options.padding,
        logoY = canvas.height/options.scale - logoHeight - options.padding - 10;

    context.save();
    context.translate(logoX, logoY);
    context.drawImage(logo.node(), 0, 0, logoWidth, logoHeight);
    context.restore();

    // save the canvas
    render();

  }

  function render() {

    if (options.mode === "pdf") {

      var outputWidth = 8.5,
          outputHeight = 11,
          outputUnit = "in";

      var aspect = canvas.width / canvas.height;

      var orientation = aspect > 1 ? "landscape" : "portrait";

      var pdf = new jsPDF(orientation, outputUnit, [outputWidth, outputHeight]);

      var width = orientation === "landscape" ? outputHeight : outputWidth,
          height = orientation === "landscape" ? outputWidth : outputHeight,
          top, left, margin = 0.5;

      if (aspect < width/height) {
        height -= (margin * 2);
        var tempWidth = height * aspect;
        top = margin;
        left = (width - tempWidth) / 2;
        width = tempWidth;
      }
      else {
        width -= (margin * 2);
        var tempHeight = width / aspect;
        left = margin;
        top = (height - tempHeight) / 2;
        height = tempHeight;
      }

      pdf.addImage(canvas, "canvas", left, top, width, height);
      pdf.save(options.filename);

    }
    else canvas.toBlob(function(blob) { saveAs(blob, options.filename); });

  }

}

var attrs_meta = {
  "geo": {
    "name": "Geography",
    "sumlevels": [
      {
        "name": "State",
        "id": "040",
        "children": ["050", "310", "160", "795"]
      },
      {
        "name": "County",
        "id": "050",
        "children": ["160"]
      },
      {
        "name": "Metro Area",
        "id": "310",
        "children": ["050", "160"]
      },
      {
        "name": "Place",
        "id": "160"
      },
      {
        "name": "PUMA",
        "id": "795"
      }
    ]
  },
  "naics": {
    "name": "Industry",
    "sumlevels": [
      {"name":"Industry Sector", "id":0, "children":[1, 2]},
      {"name":"Industry Subsector", "id":1, "children":[2]},
      {"name":"Industry Group", "id":2}
    ]
  },
  "soc": {
    "name": "Occupations",
    "sumlevels": [
      {"name":"Major Occupation Group", "id":0, "children":[1, 2, 3]},
      {"name":"Minor Occupation Group", "id":1, "children":[2, 3]},
      {"name":"Broad Occupation", "id":2, "children":[3]},
      {"name":"Detailed Occupation", "id":3}
    ]
  },
  "cip": {
    "name": "Education",
    "sumlevels": [
      {"name":"2 digit Course", "id":0, "children":[1, 2]},
      {"name":"4 digit Course", "id":1, "children":[2]},
      {"name":"6 digit Course", "id":2}
    ]
  }
}
sumlevels_cy_id = {}
for (var attr_type in attrs_meta){
  sumlevels_cy_id[attr_type] = {}
  attrs_meta[attr_type]["sumlevels"].forEach(function(sumlevel){
    sumlevel.results = 0
    sumlevels_cy_id[attr_type][sumlevel["id"]] = sumlevel
  })
}

function prettyUrl(d) {
  return (d.url_name ? d.url_name : d.id);
}

var search = {
  "advanced": false,
  "anchors": {},
  "click": false,
  "container": false,
  "current_depth": {
    "cip": null,
    "soc": null,
    "naics": null,
    "geo": null
  },
  "data": true,
  "depth": null,
  "max": 10,
  "nesting": {
    "cip": [0, 1, 2],
    "naics": [0, 1, 2],
    "soc": [0, 1, 2, 3],
    "geo": ["040", "050", "310", "160", "860", "795", "140"]
  },
  "parents": [],
  "stem_only": null,
  "term": "",
  "type": "",
  "children": {
    "geo": {
      "040": ["050", "310", ""]
    }
  },
  "zip": false
};

search.reload = function() {

  this.container.select(".search-results").html("<div id='search-loading'><p><i class='fa fa-spinner fa-spin'></i> Searching...</p></div>");

  this.type = this.type || "";
  // var sumlevel = (this.type && this.current_depth[this.type]) ? this.nesting[this.type][this.current_depth[this.type]] : ""
  // var q_params = [['q', this.term], ['kind', this.type], ['sumlevel', sumlevel]]
  var q_params = [['q', this.term], ['kind', this.type], ['stem_only', this.stem_only]]
                  .filter(function(q){ return q[1] || q[1]===0; })
                  .reduce(function(a, b, i){
                    var sep = i ? "&" : "";
                    return a+sep+b[0]+"="+encodeURIComponent(b[1]);
                  }, "?")

  // set URL query parameter to search query
  if(this.advanced){
    window.history.replaceState({}, "", "/search/"+q_params);
  }
  else {
    d3.selectAll(".results-show-all a").attr("href", "/search/"+q_params).classed("pri-link", true);
  }

  // if contrained, show "clear refinements"
  if(this.type){
    d3.select(".clear").style("display", "inline-block")
  }

  var query_sumlevel = !this.term && this.depth ? "&sumlevel="+this.depth : "";
  var query_is_stem = this.stem_only ? "&is_stem=2" : "";
  load(api + "/attrs/search?limit=100&q="+this.term+"&kind="+this.type+query_is_stem+query_sumlevel, function(data, url, raw) {

    // console.log(data, url, raw);

    this.zip = raw.zip_search;

    d3.select(".search-suggestions").style("display", "inline-block").text('');

    if(this.advanced){
      this.max = null;
      if(raw.suggestions){
        var search_suggestions = raw.suggestions.slice();
        if(raw.autocorrected){
          d3.select(".search-autocorrected").style("display", "block")
          d3.select(".search-autocorrected span.result").text(search_suggestions.shift())
        }
        else {
          d3.select(".search-autocorrected").style("display", "none")
        }
        if(search_suggestions.length){
          var suggestions_span = d3.select(".search-suggestions")
            .style("display", "inline-block")
            .text("Did you mean: ")
          var search_suggestions_a = search_suggestions.map(function(s, i){
            return "<a class='suggestion-link' href='/search/?q="+s+"'>"+s+"</a>"
          })
          suggestions_span.append("span").html(search_suggestions_a.join(", "))
          suggestions_span.append("span").text("?")
        }
      }
      this.update_refine(data);
    }

    // set cutoff
    if(this.max){
      if(data.length > this.max){
        var left_over = data.length - this.max;
        d3.selectAll(".results-show-all a span.more").text("("+left_over+" more)")
      }
      else {
        d3.selectAll(".results-show-all a span.more").text("")
      }
      data = data.slice(0, this.max);
    }


    search.vars = raw.related_vars || [];
    if (search.data) {

      search.vars.forEach(function(v) {
        v.related_attrs.forEach(function(a) {

          var results = data.filter(function(d) { return d.kind === a; });
          var ids = results.map(function(d) { return d.id; });
          var extra_url = api + "/api/?show=" + a + "&" + a + "=" + ids.join(",") + "&required=" + v.related_vars.join(",");
          if (v.params) {
            for (var p in v.params) {
              extra_url += "&" + p + "=" + v.params[p];
            }
          }
          if (extra_url.indexOf("sumlevel") < 0) {
            extra_url += "&sumlevel=all";
          }
          load(extra_url, function(var_data, var_url, var_raw) {
            // if (var_raw.subs && var_raw.subs[a]) {
            //   var sub_ids = var_raw.subs[a].split(",");
            // }
            // else var sub_ids = false;
            if (var_data instanceof Array) {
              v.loaded = var_data.reduce(function(obj, vd) {
                // obj[sub_ids ? ids[sub_ids.indexOf(vd[a])] : vd[a]] = vd;
                obj[vd[a]] = vd;
                return obj;
              }, {});
            }
            else v.loaded = {error: true};
            search.render();
          });

        });
      });

    }

    var items = this.container.select(".search-results").html("")
      .selectAll(".search-item")
      .data(this.filter(data), function(d){ return d.id; });

    items.enter().append(this.advanced ? "div" : "a")
      .attr("class", function(d) {
        return "search-item " + d.kind;
      });

    d3.selectAll(".no-search-results")
      .style("display", items.empty() ? "block" : "none");

    // click first item
    // items.selectAll("a.expand").on("click", search.open_details);
    // var first_item = items.filter(function(d, i){ return i===0 });
    // if(!first_item.empty()){
    //   first_item.on("click")(first_item.datum());
    // }
    // else{
    //   this.clear_details();
    // }

    items.exit().remove();

    search.render();

  }.bind(this));

}

search.render = function() {
  this.container.select(".search-results").selectAll(".search-item")
    .each(this.advanced ? this.btnLarge : this.btnSmall);
}

search.btnLarge = function(d) {

  var search_item = d3.select(this);

  var thumb = search_item.selectAll(".thumb").data([0]);
  thumb.enter()
    .append("span").attr("class", "thumb")
    .append("img").attr("src", "/static/img/icons/" + d.kind + "_c.svg");

  var info = search_item.selectAll(".info").data([0]);
  var infoEnter = info.enter().append("div").attr("class", "info");
  var title = infoEnter.append("h2")
    .append("a")
    .text(d.display)
    .attr("href", "/profile/" + d.kind + "/" + prettyUrl(d) + "/");
  // title.append("i").attr("class", "fa fa-angle-down")
  // title.append("i").attr("class", "fa fa-angle-up")

  var profile = search_item.selectAll(".profile").data([0]);
  profile.enter().append("div").attr("class", "profile")
    .append("a").attr("href", "#")
    .html("Details")
    .on("click", search.open_details);

  var xtra = search_item.selectAll(".xtra").data([0]);
  xtra = xtra.enter().append("div").attr("class", "xtra");

  if (d.id === "01000US") {
    var subtitle = infoEnter.append("p").attr("class", "subtitle").text("Nation");
  }
  if (sumlevels_cy_id[d.kind][d.sumlevel]) {
    var subtitle = infoEnter.append("p").attr("class", "subtitle").text(sumlevels_cy_id[d.kind][d.sumlevel].name);
    if (d.is_stem > 0) subtitle.append("span").attr("class", "stem").text("STEM");
  }

  if (search.zip) {
    infoEnter.append("span")
      .attr("class", "zip")
      .text("Based on zip code: " + d.zipcode.slice(7))
  }
  // xtra info
  // var xtra = infoEnter.append("div").attr("class", "xtra")
  if (search.anchors[d.kind].sections) {
    var ul = xtra.append("ul")
    search.anchors[d.kind].sections.forEach(function(anchor){
      var li = ul.append("li");
      li.append("a")
        .attr("href", "/profile/" + d.kind + "/" + prettyUrl(d) + "/#" + anchor.anchor)
        .append("img")
        .attr("src", "/static/img/icons/" + anchor.anchor + ".svg")
        .on("click", function(){ d3.event.stopPropagation(); })
      li.append("a")
        .attr("href", "/profile/" + d.kind + "/" + prettyUrl(d) + "/#" + anchor.anchor)
        .append("span")
        .text(anchor.title)
        .on("click", function(){ d3.event.stopPropagation(); })
    })
  }
  // xtra.append("p").attr("class", "parents")

  var sections = search.vars.filter(function(v) {
    return v.related_attrs.indexOf(d.kind) >= 0;
  });

  var vars = search.data ? sections.reduce(function(arr, v) {
    v.related_vars.forEach(function(k, i) {
      if (!v.loaded || (v.loaded && v.loaded[d.id])) {
        arr.push({
          description: v.description[i],
          data: v.loaded ? v.loaded[d.id] : false,
          key: k
        });
      }
    });
    return arr;
  }, []) : [];

  var section = info.selectAll(".section").data(search.click ? [] : [0]);
  section.enter().append("p").attr("class", "section").append("a");
  section.exit().remove();
  section.select("a")
    .attr("href", search.click ? "#"
      : "/profile/" + d.kind + "/" + prettyUrl(d) + "/"
      + (sections.length
          ? "#" + sections[0].section
          : ""))
    .text(sections.length ? "Jump to " + sections[0].section_title : "");

  var stats = info.selectAll(".search-stats").data(vars.length ? [0] : []);
  stats.enter().append("div").attr("class", "search-stats");
  stats.exit().remove();

  var stat = stats.selectAll(".search-stat").data(vars, function(v) {
    return v.key;
  });
  stat.exit().remove();
  var statEnter = stat.enter().append("div").attr("class", "search-stat");
  statEnter.append("div").attr("class", "stat-title");
  statEnter.append("div").attr("class", "stat-value");
  stat.select(".stat-title").text(function(s, i) {
    return s.description || dictionary[s.key] || s.key;
  });

  stat.select(".stat-value")
    .html(function(s) {
      return s.data
           ? viz.format.number(s.data[s.key], {key: s.key})
           : "<i class='fa fa-spinner fa-spin fa-lg'></i>";
    });

}

search.btnSmall = function(d) {

  var sections = search.vars.filter(function(v) {
    return v.related_attrs.indexOf(d.kind) >= 0;
  });

  var search_item = d3.select(this)
    .attr("href", search.click ? "#"
      : "/profile/" + d.kind + "/" + prettyUrl(d) + "/"
      + (sections.length
          ? "#" + sections[0].section
          : ""));

  if (search.click) {
    d3.select(this).on("click", function(d) {
      d3.event.preventDefault();
      search.click(d);
    })
  }

  var icon = search_item.selectAll("img").data([0]);
  icon.enter().append("img");
  icon.attr("src", "/static/img/icons/" + d.kind + "_c.svg");


  var text = search_item.selectAll(".search-item-t").data([0]);
  text.enter().append("div").attr("class", "search-item-t");

  var title = text.selectAll("h2").data([0]);
  title.enter().append("h2")
  title.text(d.display);

  var sub = text.selectAll(".subtitle").data([0]);
  sub.enter().append("p").attr("class", "subtitle")
  sub.text(d.id === "01000US" ? "Nation"
    : sumlevels_cy_id[d.kind][d.sumlevel]
    ? sumlevels_cy_id[d.kind][d.sumlevel].name
    : "");

  var vars = search.data ? sections.reduce(function(arr, v) {
    v.related_vars.forEach(function(k, i) {
      if (!v.loaded || (v.loaded && v.loaded[d.id])) {
        arr.push({
          description: v.description[i],
          data: v.loaded ? v.loaded[d.id] : false,
          key: k
        });
      }
    });
    return arr;
  }, []) : [];

  var section = text.selectAll(".section").data(search.click || !search.data ? [] : [0]);
  section.enter().append("p").attr("class", "section");
  section.exit().remove();
  section.text(sections.length ? "Jump to " + sections[0].section_title : "");

  var stats = text.selectAll(".search-stats").data(vars.length ? [0] : []);
  stats.enter().append("div").attr("class", "search-stats");
  stats.exit().remove();

  var stat = stats.selectAll(".search-stat").data(vars, function(v) {
    return v.key;
  });
  stat.exit().remove();
  var statEnter = stat.enter().append("div").attr("class", "search-stat");
  statEnter.append("div").attr("class", "stat-title");
  statEnter.append("div").attr("class", "stat-value");
  stat.select(".stat-title").text(function(s, i) {
    return s.description || dictionary[s.key] || s.key;
  });

  stat.select(".stat-value")
    .html(function(s) {
      return s.data
           ? viz.format.number(s.data[s.key], {key: s.key})
           : "<i class='fa fa-spinner fa-spin fa-lg'></i>";
    });

}

search.filter = function(data) {
  if(this.type){
    data = data.filter(function(d){ return d.kind == this.type; }.bind(this))
  }
  if(this.depth){
    data = data.filter(function(d){ return d.sumlevel == this.depth; }.bind(this))
  }
  if (this.filterID) {
    data = data.filter(function(d){ return d.id !== this.filterID && d.url_name !== this.filterID; }.bind(this));
  }
  return data;
}

search.back = function(index) {
  if (index === undefined) index = this.history.length - 1;
  if (this.history.length) {
    var previous = this.history[index];
    this.history = this.history.slice(0, index);
    this.parents = previous.parents;
    this.current_depth[this.type] = previous.depth;
    this.reload();
  }
}

search.open_details = function(d){

  // prevent default anchor link behavior
  d3.event.preventDefault();

  // toggle xtra div
  var search_item = d3.select(this.parentNode.parentNode);
  var current_state = search_item.classed("open")
  d3.selectAll(".search-item").classed("open", false)
  search_item.classed("open", !current_state)

  // set parents
  var p_container = search_item.select(".xtra .parents");
  if( p_container.size() && !p_container.text()) {
    var parents_api_url = api + "/attrs/"+d.kind+"/"+d.id+"/parents"
    load(parents_api_url, function(parents) {
      parents.forEach(function(p){
        p_container.append("a")
          .attr("href", "/profile/" + d.kind + "/" + prettyUrl(p) + "/")
          .text(p.name)
      })
    })
  }
}

search.clear_details = function(){
  d3.select(".search-details .details-title").text('');
  d3.select(".search-details .details-sumlevels").html('');
  d3.select(".search-details .details-sumlevels-results").html('');
  d3.select(".search-details .details-anchors").html('');
}

search.update_refine = function(data){

  if(this.term === ""){
    // reset defaults
    d3.selectAll(".search-refine div").classed("no-results", false);
    d3.selectAll(".search-refine li a").classed("no-results", false);
    d3.selectAll(".num_res").text(function(){ return d3.select(this).attr("data-default") });
  }
  else {
    // reset defaults
    d3.selectAll(".search-refine div").classed("no-results", true);
    d3.selectAll(".search-refine li a").classed("no-results", true);
    d3.selectAll(".num_res").text("0");

    data.forEach(function(d){
      var attr_div = d3.select(".search-refine div."+d.kind)
      var total_res = attr_div.select("h2 .num_res").text();
      total_res = parseInt(total_res) + 1
      attr_div.select("h2 .num_res").text(total_res)
      attr_div.select("h2 a").classed("no-results", false);
      attr_div.classed("no-results", false);

      var sumlevel_a = attr_div.select("a[data-depth='"+d.sumlevel+"']");
      sumlevel_a.classed("no-results", false);
      var sumlevel_span = sumlevel_a.select(".num_res");
      if(!sumlevel_span.empty()){
        sumlevel_res = parseInt(sumlevel_span.text()) + 1
        sumlevel_span.text(sumlevel_res)
      }
      else {
        //console.log(d.sumlevel, d.kind)
      }
    })
  }

}

var attrStyles = {

  "nationality": {
    "us": {
        "color": "#41a392",
        "icon": "thing_passportusa.png"
    },
    "foreign": {
        "color": "#455a7d",
        "icon": "thing_passportwld.png"
    }
},

  "sex": {
    "1": {
        "color": "#1A3E61",
        "icon": "gender_mars.png"
    },
    "2": {
        "color": "#CA3434",
        "icon": "gender_venus.png"
    },
    "men": {
        "color": "#1A3E61",
        "icon": "gender_mars.png"
    },
    "women": {
        "color": "#CA3434",
        "icon": "gender_venus.png"
    },
    "male": {
        "color": "#1A3E61",
        "icon": "gender_mars.png"
    },
    "female": {
        "color": "#CA3434",
        "icon": "gender_venus.png"
    }
},

  "sector": {
    "0": {
        "color": "#49418e",
        "icon": "person_admin.png"
    },
    "1": {
        "color": "#ffd3a6",
        "icon": "thing_bigdot.png"
    },
    "2": {
        "color": "#72f5c4",
        "icon": "thing_stripewheel.png"
    },
    "3": {
        "color": "#17c0c0",
        "icon": "thing_stripewheel.png"
    },
    "4": {
        "color": "#ff8166",
        "icon": "thing_bigdot.png"
    },
    "5": {
        "color": "#1fc1ad",
        "icon": "thing_stripewheel.png"
    },
    "6": {
        "color": "#2e6695",
        "icon": "thing_stripewheel.png"
    },
    "7": {
        "color": "#d1685e",
        "icon": "thing_bigdot.png"
    },
    "8": {
        "color": "#2b5652",
        "icon": "thing_stripewheel.png"
    },
    "9": {
        "color": "#33425b",
        "icon": "thing_stripewheel.png"
    },
    "99": {
        "color": "#ccc",
        "icon": "thing_question.png"
    },
},

  "race": {
    "1": {
        "color": "#ff8166",
        "icon": "person_profile.png"
    },
    "white": {
        "color": "#ff8166",
        "icon": "person_profile.png"
    },
    "2": {
        "color": "#ffb563",
        "icon": "person_profile.png"
    },
    "black": {
        "color": "#ffb563",
        "icon": "person_profile.png"
    },
    "3": {
        "color": "#c19a1f",
        "icon": "person_profile.png"
    },
    "4": {
        "color": "#f33535",
        "icon": "person_profile.png"
    },
    "5": {
        "color": "#82a8e7",
        "icon": "person_profile.png"
    },
    "native": {
        "color": "#82a8e7",
        "icon": "person_profile.png"
    },
    "6": {
        "color": "#1a9b9a",
        "icon": "person_profile.png"
    },
    "asian": {
        "color": "#1a9b9a",
        "icon": "person_profile.png"
    },
    "7": {
        "color": "#bf168e",
        "icon": "person_profile.png"
    },
    "hawaiian": {
        "color": "#bf168e",
        "icon": "person_profile.png"
    },
    "8": {
        "color": "#2f1fc1",
        "icon": "person_profile.png"
    },
    "other": {
        "color": "#2f1fc1",
        "icon": "person_profile.png"
    },
    "unknown": {
        "color": "#2f1fc1",
        "icon": "person_profile.png"
    },
    "9": {
        "color": "#336a81",
        "icon": "person_profile.png"
    },
    "multi": {
        "color": "#336a81",
        "icon": "person_profile.png"
    },
    "2ormore": {
        "color": "#336a81",
        "icon": "person_profile.png"
    },
    "hispanic": {
        "color": "#49418e",
        "icon": "person_profile.png"
    },
    "latino": {
        "color": "#49418e",
        "icon": "person_profile.png"
    }
},

  "skill_key": "parent",
  "skill": {
    "Complex Problem Solving": {
        "color": "#ff8166",
        "icon": "thing_atom.png"
    },
    "Resource Management Skills": {
        "color": "#ffb563",
        "icon": "thing_hourglass.png"
    },
    "System Skills": {
        "color": "#1a9b9a",
        "icon": "app_network.png"
    },
    "Basic Skills": {
        "color": "#336a81",
        "icon": "thing_book.png"
    },
    "Judgment Skills": {
        "color": "#49418e",
        "icon": "thing_gavel.png"
    },
    "Social Skills": {
        "color": "#2f1fc1",
        "icon": "thing_talkbubble.png"
    }
},

  "student_pool": {
    "Degrees Awarded": {
        "color": "#41a392",
        "icon": "thing_gradcap.png"
    },
    "Workforce": {
        "color": "#455a7d",
        "icon": "person_business.png"
    }
},

  // SOC coloring
  "soc_key": ["great_grandparent", "grandparent", "parent"],
  "soc": {
    "110000-290000": {
        "color": "#ff8166",
        "icon": "thing_computer.png"
    },
    "310000-390000": {
        "color": "#ffb563",
        "icon": "thing_utensils.png"
    },
    "410000-430000": {
        "color": "#1a9b9a",
        "icon": "thing_box.png"
    },
    "450000-490000": {
        "color": "#336a81",
        "icon": "thing_wrench.png"
    },
    "510000-530000": {
        "color": "#49418e",
        "icon": "thing_truck.png"
    },
    "550000": {
        "color": "#2f1fc1",
        "icon": "thing_airplane.png"
    }
},

  "acs_occ_2": {
    "00": {
        "color": "#ff8166",
        "icon": "thing_computer.png"
    },
    "01": {
        "color": "#ffb563",
        "icon": "thing_utensils.png"
    },
    "02": {
        "color": "#1a9b9a",
        "icon": "thing_box.png"
    },
    "03": {
        "color": "#336a81",
        "icon": "thing_wrench.png"
    },
    "04": {
        "color": "#49418e",
        "icon": "thing_truck.png"
    }
},

"bls_soc": {
    "000000": {
        "color": "#7a8896",
        "icon": "app_geo_map.png"
    },
    "110000": {
        "color": "#2c5753",
        "icon": "person_business.png"
    },
    "130000": {
        "color": "#bf168e",
        "icon": "place_moneyhouse.png"
    },
    "150000": {
        "color": "#336a81",
        "icon": "thing_computer.png"
    },
    "170000": {
        "color": "#5a1d28",
        "icon": "thing_textile.png"
    },
    "190000": {
        "color": "#82a8e7",
        "icon": "thing_leaf.png"
    },
    "210000": {
        "color": "#ffb587",
        "icon": "person_family.png"
    },
    "230000": {
        "color": "#0072cd",
        "icon": "thing_gavel.png"
    },
    "250000": {
        "color": "#1f304c",
        "icon": "thing_book.png"
    },
    "270000": {
        "color": "#1fc1ad",
        "icon": "thing_theater.png"
    },
    "290000": {
        "color": "#f33535",
        "icon": "thing_medic.png"
    },
    "310000": {
        "color": "#ff8166",
        "icon": "person_nurse.png"
    },
    "330000": {
        "color": "#5467de",
        "icon": "person_military.png"
    },
    "350000": {
        "color": "#17c0c0",
        "icon": "thing_utensils.png"
    },
    "370000": {
        "color": "#2f1fc1",
        "icon": "thing_waterdrop.png"
    },
    "390000": {
        "color": "#e6d26e",
        "icon": "person_wheelchair.png"
    },
    "410000": {
        "color": "#72f5c4",
        "icon": "place_store.png"
    },
    "430000": {
        "color": "#acb57e",
        "icon": "person_admin.png"
    },
    "450000": {
        "color": "#aee0ae",
        "icon": "thing_wheat.png"
    },
    "470000": {
        "color": "#c1461f",
        "icon": "thing_trafficcone.png"
    },
    "490000": {
        "color": "#92407c",
        "icon": "thing_wrench.png"
    },
    "510000": {
        "color": "#ffd3a6",
        "icon": "thing_sqruler.png"
    },
    "530000": {
        "color": "#418e84",
        "icon": "thing_truck.png"
    },
    "550000": {
        "color": "#8e7b41",
        "icon": "thing_airplane.png"
    }
},

  // NAICS coloring
  "naics_key": ["grandparent", "parent"],
  "naics": {
    "11-21": {
        "color": "#49418e",
        "icon": "thing_wheat.png"
    },
    "23": {
        "color": "#c19a1f",
        "icon": "thing_trafficcone.png"
    },
    "31-33": {
        "color": "#fdf18d",
        "icon": "place_factory.png"
    },
    "42": {
        "color": "#5467de",
        "icon": "thing_box.png"
    },
    "44-45": {
        "color": "#1f304c",
        "icon": "place_store.png"
    },
    "48-49, 22": {
        "color": "#c1461f",
        "icon": "thing_truck.png"
    },
    "51": {
        "color": "#5b1e29",
        "icon": "thing_computer.png"
    },
    "52-53": {
        "color": "#bf168e",
        "icon": "place_moneyhouse.png"
    },
    "54-56": {
        "color": "#2c5753",
        "icon": "person_business.png"
    },
    "61-62": {
        "color": "#f33535",
        "icon": "thing_medic.png"
    },
    "71-72": {
        "color": "#1fc1ad",
        "icon": "thing_theater.png"
    },
    "81": {
        "color": "#82a8e7",
        "icon": "person_general.png"
    },
    "92": {
        "color": "#ffb587",
        "icon": "person_family.png"
    },
    "928110": {
        "color": "#2f1fc1",
        "icon": "thing_airplane.png"
    }
},

  "acs_ind_2": {
    "00": {
        "color": "#49418e",
        "icon": "thing_wheat.png"
    },
    "01": {
        "color": "#c19a1f",
        "icon": "thing_trafficcone.png"
    },
    "02": {
        "color": "#fdf18d",
        "icon": "place_factory.png"
    },
    "03": {
        "color": "#5467de",
        "icon": "thing_box.png"
    },
    "04": {
        "color": "#1f304c",
        "icon": "place_store.png"
    },
    "05": {
        "color": "#c1461f",
        "icon": "thing_truck.png"
    },
    "06": {
        "color": "#5b1e29",
        "icon": "thing_computer.png"
    },
    "07": {
        "color": "#bf168e",
        "icon": "place_moneyhouse.png"
    },
    "08": {
        "color": "#2c5753",
        "icon": "thing_recycle.png"
    },
    "09": {
        "color": "#f33535",
        "icon": "thing_medic.png"
    },
    "10": {
        "color": "#1fc1ad",
        "icon": "thing_theater.png"
    },
    "11": {
        "color": "#82a8e7",
        "icon": "person_general.png"
    },
    "12": {
        "color": "#ffb587",
        "icon": "person_family.png"
    }
},

"bls_naics": {
    "000000": {
        "color": "#7a8896",
        "icon": "app_geo_map.png"
    },
    "11": {
        "color": "#49418e",
        "icon": "thing_wheat.png"
    },
    "21": {
        "color": "#c19a1f",
        "icon": "thing_pickaxe.png"
    },
    "22": {
        "color": "#8e7b41",
        "icon": "thing_waterdrop.png"
    },
    "23": {
        "color": "#5467de",
        "icon": "thing_trafficcone.png"
    },
    "31-33": {
        "color": "#1f304c",
        "icon": "place_factory.png"
    },
    "42": {
        "color": "#c1461f",
        "icon": "thing_box.png"
    },
    "44-45": {
        "color": "#5b1e29",
        "icon": "place_store.png"
    },
    "48-49": {
        "color": "#c0178f",
        "icon": "thing_truck.png"
    },
    "51": {
        "color": "#1f304c",
        "icon": "thing_computer.png"
    },
    "52": {
        "color": "#f33535",
        "icon": "place_moneyhouse.png"
    },
    "53": {
        "color": "#1fc1ad",
        "icon": "place_home.png"
    },
    "54": {
        "color": "#0072cd",
        "icon": "thing_wrench.png"
    },
    "55": {
        "color": "#ffd3a6",
        "icon": "person_business.png"
    },
    "56": {
        "color": "#2c5753",
        "icon": "thing_recycle.png"
    },
    "61": {
        "color": "#92407c",
        "icon": "thing_gradcap.png"
    },
    "62": {
        "color": "#ff8166",
        "icon": "thing_medic.png"
    },
    "71": {
        "color": "#72f5c4",
        "icon": "thing_theater.png"
    },
    "72": {
        "color": "#82a8e7",
        "icon": "thing_utensils.png"
    },
    "81": {
        "color": "#ffb563",
        "icon": "person_general.png"
    },
    "92": {
        "color": "#2f1fc1",
        "icon": "person_family.png"
    }
},

"iocode_key": "parent",
"iocode": {
    "11": {
        "color": "#49418e",
        "icon": "thing_wheat.png"
    },
    "21": {
        "color": "#c19a1f",
        "icon": "thing_pickaxe.png"
    },
    "22": {
        "color": "#aee0ae",
        "icon": "thing_waterdrop.png"
    },
    "23": {
        "color": "#4B9DCD",
        "icon": "thing_trafficcone.png"
    },
    "31G": {
        "color": "#8e7b41",
        "icon": "place_factory.png"
    },
    "42": {
        "color": "#E6D26E",
        "icon": "thing_box.png"
    },
    "44RT": {
        "color": "#5467de",
        "icon": "place_store.png"
    },
    "48TW": {
        "color": "#1f304c",
        "icon": "thing_truck.png"
    },
    "51": {
        "color": "#c1461f",
        "icon": "thing_computer.png"
    },
    "55": {
        "color": "#FEF28E",
        "icon": "person_business.png"
    },
    "6": {
        "color": "#5b1e29",
        "icon": "thing_medic.png"
    },
    "7": {
        "color": "#c0178f",
        "icon": "thing_theater.png"
    },
    "81": {
        "color": "#33426b",
        "icon": "person_general.png"
    },
    "F": {
        "color": "#89BFEA",
        "icon": "person_general.png"
    },
    "F020": {
        "color": "#1f304c",
        "icon": "place_moneyhouse.png"
    },
    "F100": {
        "color": "#f33535",
        "icon": "app_stacked.png"
    },
    "FIRE": {
        "color": "#1fc1ad",
        "icon": "place_home.png"
    },
    "G": {
        "color": "#0072cd",
        "icon": "place_government.png"
    },
    "HS": {
        "color": "#418E84",
        "icon": "place_home.png"
    },
    "ORE": {
        "color": "#003651",
        "icon": "place_home.png"
    },
    "Other": {
        "color": "#ffd3a6",
        "icon": "thing_gauge.png"
    },
    "PROF": {
        "color": "#2c5753",
        "icon": "person_business.png"
    },
    "TOTCOMOUT": {
        "color": "#BD9B97",
        "icon": "app_geo_map.png"
    },
    "TOTFU": {
        "color": "#979BBD",
        "icon": "app_geo_map.png"
    },
    "TOTII": {
        "color": "#7072A0",
        "icon": "app_geo_map.png"
    },
    "TOTINDOUT": {
        "color": "#92407c",
        "icon": "export_val.png"
    },
    "TOTVA": {
        "color": "#ff8166",
        "icon": "import_val.png"
    },
    "Used": {
        "color": "#72f5c4",
        "icon": "thing_recycle.png"
    },
    "V001": {
        "color": "#82a8e7",
        "icon": "person_admin.png"
    },
    "V002": {
        "color": "#ffb563",
        "icon": "thing_documentscroll.png"
    },
    "V003": {
        "color": "#2f1fc1",
        "icon": "app_occugrid.png"
    }
},

  "cip_2": {
    "01": {
        "color": "#aee0ae",
        "icon": "thing_wheat.png"
    },
    "03": {
        "color": "#979bbd",
        "icon": "thing_recycle.png"
    },
    "04": {
        "color": "#5a1d28",
        "icon": "thing_textile.png"
    },
    "05": {
        "color": "#c0451e",
        "icon": "place_earth.png"
    },
    "09": {
        "color": "#bf168e",
        "icon": "thing_documentscroll.png"
    },
    "10": {
        "color": "#d1685e",
        "icon": "thing_radiotower.png"
    },
    "11": {
        "color": "#336a81",
        "icon": "thing_computer.png"
    },
    "12": {
        "color": "#17c0c0",
        "icon": "thing_utensils.png"
    },
    "13": {
        "color": "#4b9dcd",
        "icon": "thing_gradcap.png"
    },
    "14": {
        "color": "#fdf18d",
        "icon": "place_factory.png"
    },
    "15": {
        "color": "#8c567c",
        "icon": "thing_gears.png"
    },
    "16": {
        "color": "#b36a52",
        "icon": "export_val.png"
    },
    "19": {
        "color": "#e6d26e",
        "icon": "person_wheelchair.png"
    },
    "22": {
        "color": "#0072cd",
        "icon": "thing_gavel.png"
    },
    "23": {
        "color": "#1f304c",
        "icon": "thing_book.png"
    },
    "24": {
        "color": "#7072a0",
        "icon": "app_rings.png"
    },
    "25": {
        "color": "#acb57e",
        "icon": "person_admin.png"
    },
    "26": {
        "color": "#ffb563",
        "icon": "thing_dna.png"
    },
    "27": {
        "color": "#89bfea",
        "icon": "thing_pi.png"
    },
    "29": {
        "color": "#8e7b41",
        "icon": "thing_airplane.png"
    },
    "30": {
        "color": "#33425b",
        "icon": "thing_arrows.png"
    },
    "31": {
        "color": "#72f5c4",
        "icon": "thing_shoe.png"
    },
    "38": {
        "color": "#003651",
        "icon": "thing_question.png"
    },
    "39": {
        "color": "#2f1fc1",
        "icon": "thing_moon.png"
    },
    "40": {
        "color": "#82a8e7",
        "icon": "thing_leaf.png"
    },
    "41": {
        "color": "#d8e9f0",
        "icon": "thing_flask.png"
    },
    "42": {
        "color": "#5467de",
        "icon": "thing_talkbubble.png"
    },
    "43": {
        "color": "#ff8166",
        "icon": "thing_policeshield.png"
    },
    "44": {
        "color": "#ffb587",
        "icon": "person_family.png"
    },
    "45": {
        "color": "#c19a1f",
        "icon": "app_network.png"
    },
    "46": {
        "color": "#bc9a96",
        "icon": "thing_trafficcone.png"
    },
    "47": {
        "color": "#92407c",
        "icon": "thing_wrench.png"
    },
    "48": {
        "color": "#ffd3a6",
        "icon": "thing_sqruler.png"
    },
    "49": {
        "color": "#418e84",
        "icon": "thing_truck.png"
    },
    "50": {
        "color": "#1fc1ad",
        "icon": "thing_theater.png"
    },
    "51": {
        "color": "#f33535",
        "icon": "thing_medic.png"
    },
    "52": {
        "color": "#2c5753",
        "icon": "person_business.png"
    },
    "54": {
        "color": "#49418e",
        "icon": "app_stacked.png"
    },
    "GS": {
        "color": "#853b3c",
        "icon": "thing_flask.png"
    }
  }

}

var chartStyles = {

  "background": {
    "color": "transparent",
    "stroke": {
      "width": 0
    }
  },

  "labels": {
    "default": {
      "pri": {
        "color": "#211f1a",
        "family": "Palanquin",
        "size": 12,
        "weight": 400,
        "transform": "uppercase",
        // "spacing": 1
      },
      "sec": {
        "color": "#211f1a",
        "family": "Palanquin",
        "size": 12,
        "weight": 400,
        "transform": "uppercase",
        // "spacing": 1
      }
    },
    "discrete": {
      "pri": {
        "color": "#211f1a",
        "family": "Palanquin",
        "size": 12,
        "weight": 400,
        "transform": "uppercase",
        "spacing": 1
      },
      "sec": {
        "color": "#211f1a",
        "family": "Palanquin",
        "size": 12,
        "weight": 400,
        "transform": "uppercase",
        "spacing": 1
      }
    }
  },

  "lines": {
    "color": "#333",
    "dasharray": "4",
    "font": {
      "color": "#211f1a",
      "family": "Palanquin",
      "size": 12,
      "weight": 400
    }
  },

  "ticks": {
    "default": {
      "pri": {
        "color": "#ccc",
        "font": {
          "color": "#211f1a",
          "family": "Source Sans Pro",
          "size": 12,
          "weight": 400
        },
        "size": 10
      },
      "sec": {
        "color": "#ccc",
        "font": {
          "color": "#211f1a",
          "family": "Source Sans Pro",
          "size": 12,
          "weight": 400
        },
        "size": 10
      }
    },
    "discrete": {
      "pri": {
        "color": "#ccc",
        "font": {
          "color": "#211f1a",
          "family": "Palanquin",
          "size": 12,
          "weight": 400
        },
        "size": 10
      },
      "sec": {
        "color": "#ccc",
        "font": {
          "color": "#211f1a",
          "family": "Palanquin",
          "size": 12,
          "weight": 400
        },
        "size": 10
      }
    }
  },

  "zeroline": {
    "default": {
      "pri": {
        "color": "#ccc"
      },
      "sec": {
        "color": "#ccc"
      }
    },
    "discrete": {
      "pri": {
        "color": "#ccc"
      },
      "sec": {
        "color": "#ccc"
      }
    }
  }

}

var vizStyles = {

  top: "#1A3E61", // top 5 bars
  bottom: "#58879A", // bottom 5 bars

  default: {
    pri: "#ef6145",
    sec: "#C6C7CA",
    compare: "#ff976c"
  },
  geo: {
    pri: "#ef6145",
    sec: "#C6C7CA",
    compare: "#ff976c"
  },
  cip: {
    pri: "#ef6145",
    sec: "#C6C7CA",
    compare: "#ff976c"
  },
  soc: {
    pri: "#ef6145",
    sec: "#C6C7CA",
    compare: "#ff976c"
  },
  naics: {
    pri: "#ef6145",
    sec: "#C6C7CA",
    compare: "#ff976c"
  },

  // pri: "#ef6145",
  // sec: "#C6C7CA",
  compare: "#ff976c",

  "tooltip": {
    "background": "white",
    "font": {
      "color": "#888",
      "family": "Palanquin",
      "size": 18,
      "weight": 300
    },
    "small": 250
  },

  "ui": {
    "border": 1,
    "color": {
      "primary": "white",
      "secondary": "#ccc"
    },
    "font": {
      "color": "#1B191D",
      "family": "Palanquin",
      "size": 12,
      "transform": "none",
      "weight": 300,
      "secondary": {
        "color": "#949494",
        "family": "Palanquin",
        "size": 12,
        "transform": "none",
        "weight": 300
      }
    }
  },

  "ui_map": {
    "border": 1,
    "color": {
      "primary": "white",
      "secondary": "#ccc"
    },
    "font": {
      "color": "#1B191D",
      "family": "Palanquin",
      "size": 12,
      "transform": "none",
      "weight": 300,
      "secondary": {
        "color": "#949494",
        "family": "Palanquin",
        "size": 12,
        "transform": "none",
        "weight": 300
      }
    }
  },

  "background": "transparent",
  "color": {
    "missing": "#efefef",
    // "heatmap": ['#273b98', '#abd9e9', '#E8EA94', '#fdae61', '#992E3F'],
    // "heatmap": ['#CEF0DE','#41b6c4','#2c7fb8','#253494'],
    // "heatmap": ['#f0f9e8','#CEF0DE','#7bccc4','#43a2ca','#0868ac'],
    // "heatmap": ['#eff3ff','#c6dbef','#9ecae1','#6baed6','#3182bd','#08519c'],
    "heatmap": ['#eff3ff','#c6dbef','#9ecae1','#6baed6','#3182bd','#004994'],
    "primary": "#aaa"
  },
  "edges": {
    "color": "#d0d0d0"
  },
  "labels": {
    "font": {
      // add keys for any visualization type you want to overwrite
      "default": {
        "family": "Pathway Gothic One",
        "size": 13
      },
      "tree_map": {
        "family": "Pathway Gothic One",
        "size": 13
      }
    }
  },
  "legend": {
    "font": {
      "color": "#444",
      "family": "Palanquin",
      "size": 12,
      "weight": 400
    }
  },
  "lines": {
    "interpolation": "monotone",
    "stroke-width": 2
  },
  "messages": {
    "font": {
      "color": "#888",
      "family": "Palanquin",
      "size": 16,
      "weight": 300
    }
  },
  "sankey": {
    "padding": 5,
    "width": 150
  },
  "shapes": {
    "padding": 0,
    "stroke": {
      "width": 1
    }
  },

  "pin": {
    // "color": "#F33535",
    "color": "transparent",
    "stroke": "#d5614d",
    "path": "M0.001-53.997c-9.94,0-18,8.058-18,17.998l0,0l0,0c0,2.766,0.773,5.726,1.888,8.066C-13.074-20.4,0.496,0,0.496,0s12.651-20.446,15.593-27.964v-0.061l0.021,0.005c-0.007,0.019-0.016,0.038-0.021,0.056c0.319-0.643,0.603-1.306,0.846-1.985c0.001-0.003,0.003-0.006,0.004-0.009c0.001-0.001,0.001-0.003,0.002-0.005c0.557-1.361,1.059-3.054,1.059-6.035c0,0,0,0,0-0.001l0,0C17.999-45.939,9.939-53.997,0.001-53.997z M0.001-29.874c-3.763,0-6.812-3.05-6.812-6.812c0-3.762,3.05-6.812,6.812-6.812c3.762,0,6.812,3.05,6.812,6.812C6.812-32.924,3.763-29.874,0.001-29.874z",
    "scale": 0.5
  },

  "tiles_viz": "light_all", // either light_all or dark_all
  "tiles_map": "light_all" // either light_all or dark_all

}

var viz = function(build) {

  if (!build.colors) build.colors = vizStyles.defaults;

  delete build.config.height;

  if (build.config.y2 && build.config.y2.value === "01000US" && build.highlight === "01000US") {
    delete build.config.y2;
    if (build.config.x.persist) {
      build.config.x.persist.position = false;
    }
  }

  build.viz = build.config.type === "geo_map" ? viz.map() : d3plus.viz();

  build.viz
    .messages(!build.container.classed("thumbprint"))
    .config(viz.defaults(build))
    .tooltip({
      "children": build.config.tooltip.value.length < 3
    })
    .background("transparent")
    .container(build.container.select(".d3plus"))
    .error("Please Wait")
    .draw();

  if (build.highlight) {

    build.viz.class(function(d, viz){
      var attr = d[viz.id.value] + "";
      return build.highlight === "01000US" || attr === build.highlight ? "highlight" :
             build.highlight.length > attr.length ? "outline" : "";
    });

  }

  viz.loadCoords(build);

  return build;

};

viz.finish = function(build) {

  var source_text = d3plus.string.list(d3plus.util.uniques(build.sources.reduce(function(arr, s, i){
    if (s) {
      var t = s.dataset;
      if (s.link) {
        t = "<a class='source-link' href='" + s.link + "' target='_blank'>" + t + "</a>";
      }
      arr.push(t);
    }
    return arr;
  }, [])));

  d3.select(build.container.node().parentNode).select(".source")
    .html(source_text);

  var org_text = d3plus.string.list(d3plus.util.uniques(build.sources.reduce(function(arr, s, i){
    if (s) {
      arr.push(s.org);
    }
    return arr;
  }, [])));

  d3.select(build.container.node().parentNode).select(".org")
    .html(org_text);

  if (!build.config.color) {
    if (build.viz.attrs()[build.highlight]) {
      build.config.color = function(d, viz) {
        return d[viz.id.value] === build.compare ? build.colors.compare
             : d[viz.id.value] === build.highlight ? build.colors.pri
             : build.colors.sec;
      };
    }
    else {
      build.config.color = function(d, viz) {
        return d[viz.id.value] === build.compare ? build.colors.compare : build.colors.pri;
      };
    }
    build.config.legend = false;
  }
  else if (build.config.color in attrStyles) {
    var attrs = build.attrs.map(function(a){
      var t = a.type;
      if (t in attrStyles && attrStyles[t].constructor === String) {
        return attrStyles[t];
      }
      return t;
    });
    build.color = build.config.color;
    if (attrs.indexOf(build.color) >= 0 && build.color !== "race") {
      build.config.color = "color";
      build.config.icon = "icon";
    }
    else {
      build.config.color = function(d) {
        if (!(d[build.color] in attrStyles[build.color])) {
          console.warn("Missing color for \"" + d[build.color] + "\"");
          return false;
        }
        else {
          return attrStyles[build.color][d[build.color]].color;
        }
      };
      build.config.icon = function(d) {
        if (!(d[build.color] in attrStyles[build.color])) {
          console.warn("Missing icon for \"" + d[build.color] + "\"");
          return false;
        }
        else {
          return "/static/img/attrs/" + attrStyles[build.color][d[build.color]].icon;
        }
      };
    }
  }
  else if (build.config.color in vizStyles) {
    build.color = build.config.color;
    build.config.color = function() {
      return vizStyles[build.color];
    };
  }

  var years = d3plus.util.uniques(build.viz.data(), function(d) { return d.year; }),
      axis = build.config.x ? build.config.x.value : null;

  if (years.length > 1 && axis !== build.viz.time()) {
    if (!build.config.ui) build.config.ui = [];
    var focus = d3.max(build.viz.data(), function(d) { return d.year; });
    build.viz.time({solo: focus})
    build.config.ui.push({
      focus: focus,
      method: function(d, viz) {
        viz.time({solo: [d]}).draw();
      },
      // label: "Year",
      value: years.sort().map(function(y) { var obj = {}; obj[y] = y; return obj; })
    });
  }
  else {
    build.viz.time(false);
  }

  var large = 100;

  build.viz
    .config(viz[build.config.type](build))
    .config(build.config)
    .depth(build.config.depth)
    .data({large: large})

  if (build.config.id.constructor === String) build.viz.text(build.config.id);

  build.viz.error(false).draw();

};

viz.redraw = function(build) {
  build.viz.error(false).draw();
};

viz.bar = function(build) {

  if (!d3plus.object.validate(build.config.y)) {
    build.config.y = {"value": build.config.y};
  }

  if (build.config.y2 && !d3plus.object.validate(build.config.y2)) {
    build.config.y2 = {"value": build.config.y2};
  }

  var discrete = build.config.y.scale === "discrete" ? "y" : "x";

  if (build.config.y2) {
    build.viz.data(build.viz.data().map(function(d){
      if (d[build.config.id] === build.config.y2.value) {
        d["y2_" + build.config.y.value] = d[build.config.y.value];
        delete d[build.config.y.value];
      }
      return d;
    }).sort(function(a, b){
      return a[build.config.id] === build.config.y2.value ? 1 : -1;
    }));
    build.config.y2.value = "y2_" + build.config.y.value;
  }

  var axis_style = function(axis) {

    var key = axis.length === 1 ? "pri" : "sec",
        range = false;

    var toggle = build.select || build.config.ui && build.config.ui.filter(function(u) { return u.method === axis; }).length;

    if (!toggle && build.config[axis] && axis !== discrete) {
      range = [0, d3.max(build.viz.data(), function(d) { return d[build.config[axis].value]; })];
    }

    return {
      axis: {
        color: discrete === axis ? "none" : chartStyles.zeroline.default[key].color,
        value: discrete !== axis
      },
      grid: discrete !== axis,
      range: range,
      ticks: {
        color: discrete === axis ? "none" : chartStyles.ticks.default[key].color,
        labels: discrete !== axis || !build.config.labels,
        size: discrete === axis ? 0 : chartStyles.ticks.default[key].size
      }
    }

  }

  return {
    "labels": {
      "align": "left",
      "resize": false,
      "value": false
    },
    "legend": {
      "data": build.data[0].url.indexOf("limit=") < 0
    },
    "order": {
      "agg": "max"
    },
    "x": axis_style("x"),
    "x2": axis_style("x2"),
    "y": axis_style("y"),
    "y2": axis_style("y2")
  };

}

var all_caps = ["cip", "naics", "rca", "soc", "usa"],
    attr_ids = ["geo", "cip", "soc", "naics"],
    range100 = ["non_eng_speakers_pct", "owner_occupied_housing_units", "us_citizens", "grads_total_growth"];

viz.defaults = function(build) {

  var discrete = build.config.y && build.config.y.scale === "discrete" ? "y" : "x";

  if (build.config.order === "bucket") {
    build.config.order = {
      "sort": "asc",
      "value": function(a) {
        if (a.bucket.indexOf("none") >= 0) {
          return -1;
        }
        else if (a.bucket.indexOf("under") >= 0 || a.bucket.indexOf("less") >= 0) {
          return 0;
        }
        else if (a.bucket.indexOf("more") >= 0 || a.bucket.indexOf("over") >= 0) {
          return 100000;
        }
        else {
          var b = a.bucket;
          if (b.indexOf("_") > 0) b = b.split("_")[1];
          return parseFloat(b, 10);
        }
      }
    }
  }

  var axis_style = function(axis) {

    var key = build.config[axis] || false, label = false;
    if (d3plus.object.validate(key)) {
      key = key.value;
    }
    else if (key) {
      build.config[axis] = {"value": key};
    }

    if (key) {
      label = build.config[axis].label !== void 0 ? build.config[axis].label : axis.indexOf("y") === 0 && attr_ids.indexOf(key) >= 0 ? false : true;
      if (label in dictionary) label = dictionary[label];
      build.config[axis].label = label;
    }

    if (build.config[axis] && build.config[axis].ticks && build.config[axis].ticks.value && build.config[axis].ticks.value.constructor === String) {
      build.config[axis].ticks.value = JSON.parse(build.config[axis].ticks.value);
    }

    var range = range100.indexOf(key) >= 0 ? [0, 1] : false;

    var key = axis.length === 1 ? "pri" : "sec",
        style = axis === discrete ? "discrete" : "default",
        labelFont = d3plus.util.copy(chartStyles.labels[style][key]);

    if (build.config.y2 && ["y", "y2"].indexOf(axis) >= 0) {
      if (build.config.y2.value === "01000US" || build.config.y2.label === "National Average" || build.config.y2.label === "USA") {
        if (axis === "y") labelFont.color = build.colors.pri;
        else if (axis === "y2") labelFont.color = build.colors.sec;
      }
      else if (build.config.color in attrStyles) {
        var colors = attrStyles[build.config.color];
        if (colors[build.config[axis].value]) labelFont.color = colors[build.config[axis].value].color;
        else if (colors[build.config[axis].label]) labelFont.color = colors[build.config[axis].label].color;
      }
    }

    return {
      "label": {
        "font": labelFont,
        "padding": 0
      },
      "lines": chartStyles.lines,
      "range": range,
      "ticks": chartStyles.ticks[style][key]
    };
  };

  var messageBg = vizStyles.background;
  if (!build.container.classed("thumbprint") && messageBg === "transparent") {
    function findSection(node) {
      if (node.tagName.toLowerCase() === "section") {
        var bg = d3.select(node).style("background-color");
        return bg !== "rgba(0, 0, 0, 0)" ? bg : d3.select("body").style("background-color");
      }
      else if (node.tagName.toLowerCase() === "body") {
        return messageBg;
      }
      else {
        return findSection(node.parentNode);
      }
    }
    messageBg = findSection(build.container.node());
    if (messageBg === "rgba(0, 0, 0, 0)") messageBg = "#fff";
  }

  return {
    axes: {
      background: chartStyles.background,
      ticks: false
    },
    background: vizStyles.background,
    color: vizStyles.color,
    data: vizStyles.shapes,
    edges: vizStyles.edges,
    format: {
      number: viz.format.number,
      text: function(text, params) {
        return viz.format.text(text, params, build);
      }
    },
    height: {
      small: 10
    },
    icon: {
      style: "knockout"
    },
    labels: {
      font: vizStyles.labels.font[build.config.type] || vizStyles.labels.font.default
    },
    legend: {
      font: vizStyles.legend.font,
      labels: false,
      order: {
        sort: "desc",
        value: "size"
      }
    },
    messages: {
      background: messageBg,
      font: vizStyles.messages.font,
      style: "large",
      value: "Drawing Visualization"
    },
    time: {
      fixed: false,
      value: "year"
    },
    timeline: false,
    tooltip: vizStyles.tooltip,
    ui: vizStyles.ui,
    x: axis_style("x"),
    x2: axis_style("x2"),
    y: axis_style("y"),
    y2: axis_style("y2")
  }
}

viz.geo_map = function(build) {

  var key = build.config.coords.key;

  var profile = (d3.select("body").classed("profile") || d3.select("body").classed("story")) && !d3.select("body").classed("embed");

  return {
    "coords": {
      "center": [0, 0],
      "key": key,
      "padding": 0,
      "projection": key === "birthplace" ? "equirectangular" : "albersUsa",
      "simplify": false
    },
    "labels": false,
    "mouse": {
      "click": false
    },
    "zoom": {
      "pan": profile ? false : true,
      "scroll": profile ? false : true
    }
  };
}

viz.line = function(build) {
  return {
    "shape": {
      "interpolate": vizStyles.lines.interpolation
    },
    "size": vizStyles.lines["stroke-width"]
  };
}

viz.radar = function(build) {
  return {
    "mouse": {
      "click": false
    },
    "tooltip": {
      "children": false,
      "size": false
    }
  };
}

viz.sankey = function(build) {

  build.sankeyInit = false;
  network = viz.sankeyData(build);
  build.sankeyInit = true;

  return {
    "data": {
      "padding": vizStyles.sankey.padding
    },
    "edges": {
      "strength": "value_millions",
      "value": network.edges
    },
    "focus": {
      "tooltip": false,
      "value": network.focus
    },
    "history": {
      "reset": function(){},
    },
    "labels": {
      "resize": false
    },
    "mouse": {
      "click": function(d, v) {
        var old_focus = v.focus()[0];
        if (d.id !== old_focus) {
          v.error("Loading...").draw();
          var states = v.history(Object).states;
          states.push(function(){
            build.data.forEach(function(data){
              data.url = data.url.replace(build.highlight, old_focus);
            });
            viz.loadData(build, "sankeyData");
          });
          v.history({"states": states});
          build.data.forEach(function(data){
            data.url = data.url.replace(build.highlight, d.id);
          });
          viz.loadData(build, "sankeyData");
        }
      }
    },
    "nodes": network.nodes,
    "size": vizStyles.sankey.width
  };
}

viz.sankeyData = function(b) {

  var nodes = {}, focus, data = b.viz.data();
  var edges = data.map(function(e, i){
    if (!(e.id in nodes)) {
      nodes[e.id] = {"id": e.id};
      focus = e.id;
    }
    if ("use" in e) {
      if (e.use === focus) e.use += "_alt";
      if (!(e.use in nodes)) nodes[e.use] = {"id": e.use};
      var s = nodes[e.use], t = nodes[e.id];
    }
    else if ("make" in e) {
      if (e.make === focus) e.make += "_alt";
      if (!(e.make in nodes)) nodes[e.make] = {"id": e.make};
      var s = nodes[e.id], t = nodes[e.make];
    }
    return {
      "source": s,
      "target": t,
      "value_millions": e.value_millions
    };
  });

  data.forEach(function(d){

    if ("use" in d) {
      d.id = d.use;
      delete d.use;
    }
    if ("make" in d) {
      d.id = d.make;
      delete d.make;
    }

    if (d.id === focus) {
      d.id += "_alt";
    }

  });

  b.viz.data(data);

  if (!b.sankeyInit) {
    return {
      "edges": edges,
      "focus": focus,
      "nodes": d3.values(nodes)
    }
  }
  else {
    b.highlight = focus;
    b.viz
      .nodes(d3.values(nodes))
      .edges(edges)
      .focus(focus)
      .error(false)
      .draw();
  }

}

viz.scatter = function(build) {

  function getRange(axis) {

    var h = build.viz.height(),
        w = build.viz.width();

    var max = Math.floor(d3.max([d3.min([w, h])/15, 6]));

    if (build.config[axis]) {
      var k = build.config[axis].value;
      if (k !== build.config.id) {
        var d = axis.indexOf("x") === 0 ? w : h,
            range = d3.extent(build.viz.data(), function(d) { return d[k]; });
        range[0] -= range[0] * (max / d);
        range[1] += range[1] * (max / d);
        return range;
      }
    }
    return false;
  }

  return {
    x: {range: getRange("x")},
    y: {range: getRange("y")}
  };
}

viz.tree_map = function(build) {

  function noAgg(k) {
    return function(leaves) {
      if (leaves.length === 1) return leaves[0][k];
      else return null;
    }
  }

  return {
    "aggs": {
      "avg_wage": noAgg("avg_wage"),
      "avg_wage_moe": noAgg("avg_wage_moe"),
      "avg_wage_rank": noAgg("avg_wage_rank"),
      "avg_wage_ft": noAgg("avg_wage_ft"),
      "avg_wage_ft_moe": noAgg("avg_wage_ft_moe"),
      "avg_wage_ft_rank": noAgg("avg_wage_ft_rank"),
      "avg_wage_pt": noAgg("avg_wage_pt"),
      "avg_wage_pt_moe": noAgg("avg_wage_pt_moe"),
      "avg_wage_pt_rank": noAgg("avg_wage_pt_rank"),
      "avg_hrs": noAgg("avg_hrs"),
      "avg_hrs_moe": noAgg("avg_hrs_moe"),
      "avg_hrs_rank": noAgg("avg_hrs_rank"),
      "avg_hrs_ft": noAgg("avg_hrs_ft"),
      "avg_hrs_ft_moe": noAgg("avg_hrs_ft_moe"),
      "avg_hrs_ft_rank": noAgg("avg_hrs_ft_rank"),
      "avg_hrs_pt": noAgg("avg_hrs_pt"),
      "avg_hrs_pt_moe": noAgg("avg_hrs_pt_moe"),
      "avg_hrs_pt_rank": noAgg("avg_hrs_pt_rank"),
      "avg_age": noAgg("avg_age"),
      "avg_age_moe": noAgg("avg_age_moe"),
      "avg_age_rank": noAgg("avg_age_rank"),
      "med_earnings": noAgg("med_earnings"),
      "med_earnings_moe": noAgg("med_earnings_moe")
    },
    "labels": {
      "align": "left",
      "valign": "top"
    },
    "legend": {
      "filters": true
    },
    "title": {
      "total": {
        "font": {
          "color": "#444",
          "family": "Palanquin",
          "size": 14,
          "transform": "uppercase",
          "weight": 700
        },
        "value": {
          "prefix": dictionary[build.config.size] + ": "
        }
      }
    }
  };
}

viz.format = {
  "number": function(number, params) {

    var prefix = "";

    if (params.key) {

      var key = params.key + "";
      delete params.key;

      if (key === "year") return number;

      if (key.indexOf("_moe") > 0) {
        prefix = "<span class='plus-minus'>±</span> ";
        key = key.replace("_moe", "");
      }

      if (key.indexOf("emp_thousands") >= 0) {
        number = number * 1000;
      }
      else if (key == "value_millions") {
        number = number * 1000000;
      }
      else if (key == "output") {
        number = number * 1000000000;
      }

      if (key.indexOf("y2_") === 0) {
        key = key.slice(3);
      }

      if (proportions.indexOf(key) >= 0) number = number * 100;

      if ((params.output !== "x" || number < 1000) && number < 999999.99 && number >= 0.1) {
        var prec = ["gini"].indexOf(key) >= 0 ? "3" : key.indexOf("_rca") > 0 || key in affixes ? "2" : "1";
        number = d3.format(",." + prec + "f")(number);
        number = prec === "3" ? number.replace(".000", "") : prec === "2" ? number.replace(".00", "") : number.replace(".0", "");
      }
      else {
        number = d3plus.number.format(number, params);
      }

      if (key in affixes) {
        var a = affixes[key];
        number = a[0] + number + a[1];
      }

      if (proportions.indexOf(key) >= 0 || percentages.indexOf(key) >= 0) {
        number = number + "%";
      }
      return prefix + number;

    }

    return prefix + d3plus.number.format(number, params);

  },
  "text": function(text, params, build) {

    if (text.indexOf("_moe") > 0) {
      return "&nbsp;&nbsp;&nbsp;&nbsp;Margin of Error";
    }
    else if (text.indexOf("_rank") > 0) {
      return "Rank";
    }

    if (text.indexOf("y2_") === 0) {
      text = text.slice(3);
    }

    if (build && text === "bucket") {
      ["x", "y", "x2", "y2"].forEach(function(axis){
        if (d3plus.object.validate(build.config[axis]) &&
            build.config[axis].value === "bucket" &&
            build.config[axis].label &&
            build.config[axis].label !== true) {
          text = build.config[axis].label;
        }
      });
    }

    if (dictionary[text]) {
      if (per1000.indexOf(text) >= 0) return dictionary[text] + " per 1,000 People";
      if (per10000.indexOf(text) >= 0) return dictionary[text] + " per 10,000 People";
      if (per100000.indexOf(text) >= 0) return dictionary[text] + " per 100,000 People";
      return dictionary[text];
    }

    // All caps text
    if (all_caps.indexOf(text.toLowerCase()) >= 0) {
      return text.toUpperCase();
    }

    if (params.key) {

      if (params.key === "name") {
        return text;
      }

      // Format buckets
      if (params.key === "bucket") {

        var key = false;

        if (text.indexOf("_") > 0) {
          text = text.split("_");
          key = text.shift();
          text = text.join("_");
        }

        if (build && key === false) {
          ["x", "y", "x2", "y2"].forEach(function(axis){
            if (d3plus.object.validate(build.config[axis]) &&
                build.config[axis].value === "bucket" &&
                build.config[axis].label &&
                build.config[axis].label !== true) {
              key = build.config[axis].label;
            }
          });
        }

        var a = key && key in affixes ? affixes[key].slice() : ["", ""];
        var thousands = ["income"];
        for (var i = thousands.length; i > 0; i--) {
          var t = thousands[i - 1];
          if (t in dictionary) {
            thousands.push(dictionary[t]);
          }
        }
        if (thousands.indexOf(key) >= 0) a[1] = "k";

        if (text.indexOf("to") > 0) {
          return text.split("to").map(function(t){
            return a[0] + t + a[1];
          }).join("-");
        }
        else if (text.indexOf("less") === 0) {
          return "< " + a[0] + text.slice(4) + a[1];
        }
        else if (text.indexOf("under") === 0) {
          return "< " + a[0] + text.slice(5) + a[1];
        }
        else if (text.indexOf("over") > 0 || text.indexOf("more") > 0) {
          return a[0] + text.slice(0, text.length - 4) + a[1] + " +";
        }
        else if (text.toLowerCase() === "none") {
          return a[0] + "0" + a[1];
        }
        else {
          return a[0] + d3plus.string.title(text) + a[1];
        }
      }

      if (params.key === "geo" && text.indexOf("140") === 0) {
        text = text.slice(12);
        var num = text.slice(0, 4), suffix = text.slice(4);
        suffix = suffix === "00" ? "" : "." + suffix;
        return "Census Tract " + num + suffix;
      }

      var attrs = build && build.viz ? build.viz.attrs() : false;
      if (attrs && text in attrs) {
        return d3plus.string.title(attrs[text].name, params);
      }

      if (attr_ids.indexOf(params.key) >= 0) return text.toUpperCase();

    }

    return d3plus.string.title(text, params);

  }
}

viz.loadAttrs = function(build) {
  var next = "loadData";

  build.viz.error("Loading Attributes").draw();

  if (build.attrs.length) {
    var loaded = 0, attrs = {};
    for (var i = 0; i < build.attrs.length; i++) {
      load(build.attrs[i].url, function(data, url){
        var a = build.attrs.filter(function(a){ return a.url === url; })[0];
        a.data = data;
        var type = a.type === "university" ? "sector" : a.type, color_key = type;
        if (type + "_key" in attrStyles) {
          color_key = attrStyles[type + "_key"];
        }
        if (!(color_key instanceof Array)) color_key = [color_key];
        var colorize = build.config.color === type && type in attrStyles ? attrStyles[type] : false;
        for (var i = 0; i < data.length; i++) {
          var d = data[i];
          if (type === "iocode") {
            if (!d.parent && d.id.charAt(0) === "F" && d.id !== "FIRE") d.parent = "F";
            else if (!d.parent) d.parent = d.id;
          }
          if (colorize) {
            var lookup = false;
            color_key.forEach(function(k){
              if (k in d && d[k] && d[k] in colorize) {
                lookup = colorize[d[k]];
              }
            })
            if (!lookup && d.id in colorize) {
              lookup = colorize[d.id];
            }
            if (lookup) {
              d.color = lookup.color;
              d.icon = "/static/img/attrs/" + lookup.icon;
            }
            if (a.type === "skill") {
              d.skill = d.id;
            }
          }
          attrs[d.id] = d;
          if (type === "iocode") {
            attrs[d.id + "_alt"] = d;
          }
        }
        loaded++;
        if (loaded === build.attrs.length) {
          build.viz.attrs(attrs);
          viz[next](build);
        }
      })
    }
  }
  else {
    viz[next](build);
  }

};

viz.prepBuild = function(build, i) {

  if (!build.container) build.container = d3.select(d3.selectAll(".viz")[0][i]);
  build.loaded = false;
  build.timer = false;
  build.index = i;
  build.colors = vizStyles[attr_type];
  build.data.forEach(function(d) {
    d.orig_url = d.url;
  })
  build.orig_color = build.config.color;

  var title = d3.select(build.container.node().parentNode.parentNode).select("h2");
  if (title.size()) {
    build.title = title.text().replace(" Options", "").replace(/\u00a0/g, "");
    if (["top", "bottom"].indexOf(build.config.color) >= 0) {
      var cat = dictionary[build.attrs[0].type];
      if (cat.indexOf("y") === cat.length - 1) cat = cat.slice(0, cat.length - 1) + "ies";
      else cat = cat + "s";
      build.title = build.title + " " + cat;
    }
    var locale = d3plus.viz().format(Object).locale.value.visualization,
        type = locale[build.config.type] || d3plus.string.title(type);
    build.title = "Data USA - " + type + " of " + build.title;
    if (build.profile && location.href.indexOf("/story/") < 0 && !build.compare) {
      var joiner = build.profile_type === "geo" ? " in " : " for ";
      if (build.profile.id === "01000US") joiner = " in the ";
      build.title += joiner + d3plus.string.title(build.profile.name);
      if (build.profile_type === "cip") build.title += " Majors";
    }
  }
  else {
    build.title = "data";
  }

  var select = d3.select(build.container.node().parentNode).select("select");
  if (select.size()) {

    d3plus.form()
      .search(false)
      .ui({
        "margin": 0
      })
      .ui(vizStyles.ui)
      .focus({"callback": function(id, form){

        var param = this.getAttribute("data-param"),
            method = this.getAttribute("data-method"),
            prev = this.getAttribute("data-default");

        if (id !== prev) {

          d3.select(this).attr("data-default", id);

          d3.select(this.parentNode).selectAll(".select-text")
           .html(d3.select(this).select("option[value='"+ id +"']").text());

          d3.select(this.parentNode).selectAll("span[data-url]")
           .each(function(){

             d3.select(this.parentNode).classed("loading", true);
             var url = this.getAttribute("data-url");

             if (param.length && url.indexOf("show=" + param) > 0) {
               var attr = form.data().filter(function(d){ return d.value === id; });
               if (attr.length && attr[0].text) {
                 d3.select(this).html(attr[0].text);
               }
             }
             else {

               if (param.length) {
                 url = url.replace(param + "=" + prev, param + "=" + id);
               }
               else {
                 url = url.replace("order=" + prev, "order=" + id);
                 url = url.replace("required=" + prev, "required=" + id);
               }
               d3.select(this).attr("data-url", url);

               var rank = 1;
               if (url.indexOf("rank=") > 0) {
                 var rank = new RegExp("&rank=([0-9]*)").exec(url);
                 url = url.replace(rank[0], "");
                 rank = parseFloat(rank[1])
               }
               if (url.indexOf("limit=") > 0) {
                 var limit = new RegExp("&limit=([0-9]*)").exec(url);
                 url = url.replace(limit[0], "&limit=3");
               }

               load(url, function(data, u){
                 d3.select(this.parentNode).classed("loading", false)
                 var text = data.value.split("; ")[rank - 1];
                 if (!text) text = "N/A";
                 if (text.indexOf("and ") === 0) {
                   text = text.replace("and ", "");
                 }
                 d3.select(this).html(text);
               }.bind(this));

             }

           });

          if (param.length) {
           build.data.forEach(function(b){
             b.url = b.url.replace(param + "=" + prev, param + "=" + id);
           });
           viz.loadData(build, "redraw");
          }
          else if (method.length) {
           build.viz[method](id).draw();
          }

        }

      }.bind(select.node())})
      .data(select)
      .width(select.node().parentNode.offsetWidth)
      .type("drop")
      .draw();

  }

  d3.select(build.container.node().parentNode.parentNode).select("a.share-embed")
    .on("click", function(){
      d3.event.preventDefault();
      dusa_popover.open([
        {"title":"Share"},
        {"title":"Embed"},
        {"title":"Download"},
        {"title":"Data"},
        {"title":"API"}
      ],
      d3.select(this).attr("data-target-id"),
      d3.select(this).attr("data-url"),
      d3.select(this).attr("data-embed"),
      build)
    });

};

viz.resizeBuild = function(b) {
  b.top = b.container.node().offsetTop;
  b.height = b.container.node().offsetHeight;
  if (!b.height) {
    b.top = b.container.node().parentNode.parentNode.parentNode.offsetTop;
    b.height = b.container.node().parentNode.offsetHeight;
  }
  if (b.loaded) {
    b.container.select(".d3plus")
      .style("height", "auto")
      .style("width", "auto");
    b.viz
      .height(false)
      .width(false)
      .draw();
  }
}

viz.loadBuilds = function() {

  if (builds.length) {

    builds.forEach(viz.prepBuild);
    builds.forEach(viz.resizeBuild);

    function resizeApps() {
      builds.forEach(viz.resizeBuild);
    }
    resizeFunctions.push(resizeApps);

    var scrollBuffer = -200, n = [32];
    function buildInView(b) {
      var top = d3plus.client.scroll.y(), height = window.innerHeight;
      return top+height > b.top+scrollBuffer && top+scrollBuffer < b.top+b.height;
    }

    function buildScroll(ms) {
      if (ms === undefined) ms = 0;
      for (var i = 0; i < builds.length; i++) {
        var b = builds[i];
        if (!b.timer && !b.loaded) {
          if (buildInView(b)) {
            b.timer = setTimeout(function(build){
              clearTimeout(build.timer);
              build.timer = false;
              if (buildInView(build)) {
                current_build = viz(build);
                build.loaded = true;
              }
            }, ms, b);
          }
        }
      }
    }

    scrollFunctions.push(buildScroll);

  }

}

var excludedGeos = ["79500US4804701", "16000US0641278", "XXATA"];

viz.loadCoords = function(build) {
  var next = "loadAttrs";

  build.viz.error("Loading Coordinates").draw();

  var type = build.config.coords;

  if (type) {

    if (type.constructor === String) {
      build.config.coords = {"key": type};
    }
    else if (!type.key) {
      type = type.value;
      build.config.coords.key = type;
      delete build.config.coords.value;
    }
    else {
      type = type.key;
    }

    if (type === "nations") {
      build.config.coords.key = "states";
      type = "states";
    }

    var solo = build.config.coords.solo;
    if (!(solo instanceof Array)) {
      if (solo && solo.length) build.config.coords.solo = solo.split(",");
      else build.config.coords.solo = [];
    }

    build.config.coords.solo = build.config.coords.solo.filter(function(c){
      return excludedGeos.indexOf(c) < 0;
    });
    build.config.coords.mute = excludedGeos;

    var filename = type;
    if (["places", "tracts"].indexOf(type) >= 0) {
      if (build.config.coords.solo.length) {
        filename += "_" + build.config.coords.solo[0].slice(7, 9);
        build.config.coords.solo.push("040" + build.config.coords.solo[0].slice(3, 9));
      }
      else {
        filename += "_" + build.highlight.slice(7, 9);
      }
    }

    load("/static/topojson/" + filename + ".json", function(data){

      build.viz.coords(data);
      viz[next](build);

    });

  }
  else {
    viz[next](build);
  }

}

var attrNesting = {
  "acs_ind": [2, 4, 6],
  "acs_occ": [2, 4, 6, 8, 10],
  "cip": [2, 4, 6]
};

// var attrMapping = {
//   "degree": {
//     "20": "3",
//     "21": "5",
//     "22": "7",
//     "23": "18",
//     "24": "17"
//   }
// }

viz.formatData = function(data, d, build) {

  // if (d.params.show in attrMapping) {
  //   var show = d.params.show, map = attrMapping[show];
  //   if (return_data.source.dataset.indexOf("PUMS") >= 0) {
  //     for (var i = 0; i < data.length; i++) {
  //       data[i][show] = map[data[i][show]];
  //     }
  //   }
  //
  // }

  if (d.static) {
    for (var i = 0; i < data.length; i++) {
      for (var k in d.static) {
        data[i][k] = d.static[k];
      }
    }
  }

  if (d.map) {
    if ("delete" in d.map) {
      var deleteMap = d.map.delete;
      delete d.map.delete;
    }
    else {
      var deleteMap = true;
    }
    for (var i = 0; i < data.length; i++) {
      for (var k in d.map) {
        data[i][k] = data[i][d.map[k]];
        if (deleteMap) delete data[i][d.map[k]];
      }
    }
  }

  if (d.split) {

    var split_data = [],
        regex = new RegExp(d.split.regex),
        keys = d3.keys(data[0]).filter(function(k){
          return regex.exec(k);
        });

    if (d.split.map) {
      for (var k in d.split.map) {
        d.split.map[k] = new RegExp(d.split.map[k]);
      }
    }

    for (var i = 0; i < data.length; i++) {
      var dat = data[i];
      for (var ii = 0; ii < keys.length; ii++) {
        var dd = d3plus.util.copy(dat);
        dd[d.split.id] = regex.exec(keys[ii])[1];
        dd[d.split.value] = dat[keys[ii]];

        if (keys[ii] + "_moe" in dat) {
          dd[d.split.value + "_moe"] = dat[keys[ii] + "_moe"];
        }

        if (d.split.map) {
          for (var sk in d.split.map) {
            var mapex = d.split.map[sk].exec(keys[ii]);
            if (mapex) {
              dd[sk] = mapex[1];
            }
          }
        }
        for (var iii = 0; iii < keys.length; iii++) {
          delete dd[keys[iii]];
          delete dd[keys[iii] + "_moe"];
        }
        split_data.push(dd);
      }
    }
    data = split_data;
  }

  if (d.share) {
    var share = d.share.split("."), share_id = share[1] || false;
    share = share[0];
    var shareData = data.reduce(function(obj, s) {
      if (!obj[s.year]) obj[s.year] = [];
      obj[s.year].push(s);
      return obj;
    }, {});
    for (var year in shareData) {
      if (share_id) {
        shareData[year] = d3plus.util.uniques(shareData[year], share_id).reduce(function(obj, id){
          obj[id] = d3.sum(shareData[year], function(dat){
            return dat[share_id] === id ? dat[share] : 0;
          });
          return obj;
        }, {});
      }
      else {
        shareData[year] = d3.sum(shareData[year], function(dat){ return dat[share]; });
      }
    }
    if (share_id) {
      for (var i = 0; i < data.length; i++) {
        data[i].share = data[i][share]/shareData[data[i].year][data[i][share_id]] * 100;
      }
    }
    else {
      for (var i = 0; i < data.length; i++) {
        data[i].share = data[i][share]/shareData[data[i].year] * 100;
      }
    }
  }

  for (var i = 0; i < build.attrs.length; i++) {
    var type = build.attrs[i].type,
        nesting = attrNesting[type],
        attr_key = attrStyles[type + "_key"];

    if (nesting && nesting.constructor === Array) {
      for (var ii = 0; ii < data.length; ii++) {
        var datum = data[ii];
        for (var iii = 0; iii < nesting.length; iii++) {
          var length = nesting[iii];
          var k = type + "_" + length;
          datum[k] = datum[type].slice(0, length);
          if (k === build.config.color && k in attrStyles && datum[k] in attrStyles[k]) {
            datum.color = attrStyles[k][datum[k]].color;
          }
        }
      }
    }
    else if (build.config.type === "sankey") {

      var attrs = build.viz.attrs();
      for (var ii = 0; ii < data.length; ii++) {
        var datum = data[ii];
        type = "use" in datum ? "use" : "make";
        datum.icon = attrs[datum[type]].icon;
      }

    }
    else if (build.config.id instanceof Array) {

      nesting = build.config.id;
      type = nesting[nesting.length - 1];
      var attrs = build.viz.attrs();
      for (var ii = 0; ii < data.length; ii++) {
        var datum = data[ii];
        for (var iii = 0; iii < nesting.length; iii++) {
          var id = nesting[iii];
          if (attrs[datum[type]] && attrs[datum[type]][id]) {
            var a = attrs[datum[type]];
            datum[id] = a[id];
            datum.icon = a.icon;
          }
        }
      }

    }

  }

  if (data.length && "university" in data[0]) {
    var attrs = build.viz.attrs();
    for (var i = 0; i < data.length; i++) {
      data[i].sector = attrs[data[i].university].sector;
    }
  }

  return data;

}

viz.loadData = function(build, next) {
  if (!next) next = "finish";

  build.viz.error("Loading Data").draw();

  build.sources = [];

  if (build.data.length) {
    var loaded = 0, dataArray = [];
    for (var i = 0; i < build.data.length; i++) {
      load(build.data[i].url, function(data, url, return_data){

        if (build.compare && return_data.subs) {
          for (var type in return_data.subs) {
            var show = new RegExp("&" + type + "=([%a-zA-Z0-9]*)").exec(url);
            var subIndex = show[1].split("%2C").indexOf(build.compare);
            if (subIndex >= 0) build.compare = return_data.subs[type].split(",")[subIndex];
          }
        }

        var d = build.data.filter(function(d){ return d.url === url; })[0];

        d.data = viz.formatData(data, d, build);
        d.source = return_data.source;
        build.sources.push(return_data.source)
        dataArray = dataArray.concat(d.data);
        loaded++;
        if (loaded === build.data.length) {
          build.viz.data(dataArray);
          viz[next](build);
        }
      })
    }
  }
  else {
    viz[next](build);
  }

}

d3.geo.albersUsaPr = function() {
  var ε = 1e-6;

  var lower48 = d3.geo.albers();

  // EPSG:3338
  var alaska = d3.geo.conicEqualArea()
      .rotate([154, 0])
      .center([-2, 58.5])
      .parallels([55, 65]);

  // ESRI:102007
  var hawaii = d3.geo.conicEqualArea()
      .rotate([157, 0])
      .center([-3, 19.9])
      .parallels([8, 18]);

  // XXX? You should check that this is a standard PR projection!
  var puertoRico = d3.geo.conicEqualArea()
      .rotate([66, 0])
      .center([0, 18])
      .parallels([8, 18]);

  var point,
      pointStream = {point: function(x, y) { point = [x, y]; }},
      lower48Point,
      alaskaPoint,
      hawaiiPoint,
      puertoRicoPoint;

  function albersUsa(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    point = null;
    (lower48Point(x, y), point)
        || (alaskaPoint(x, y), point)
        || (hawaiiPoint(x, y), point)
        || (puertoRicoPoint(x, y), point);
    return point;
  }

  albersUsa.invert = function(coordinates) {
    var k = lower48.scale(),
        t = lower48.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;
    return (y >= .120 && y < .234 && x >= -.425 && x < -.214 ? alaska
        : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii
        : y >= .204 && y < .234 && x >= .320 && x < .380 ? puertoRico
        : lower48).invert(coordinates);
  };

  // A naïve multi-projection stream.
  // The projections must have mutually exclusive clip regions on the sphere,
  // as this will avoid emitting interleaving lines and polygons.
  albersUsa.stream = function(stream) {
    var lower48Stream = lower48.stream(stream),
        alaskaStream = alaska.stream(stream),
        hawaiiStream = hawaii.stream(stream),
        puertoRicoStream = puertoRico.stream(stream);
    return {
      point: function(x, y) {
        lower48Stream.point(x, y);
        alaskaStream.point(x, y);
        hawaiiStream.point(x, y);
        puertoRicoStream.point(x, y);
      },
      sphere: function() {
        lower48Stream.sphere();
        alaskaStream.sphere();
        hawaiiStream.sphere();
        puertoRicoStream.sphere();
      },
      lineStart: function() {
        lower48Stream.lineStart();
        alaskaStream.lineStart();
        hawaiiStream.lineStart();
        puertoRicoStream.lineStart();
      },
      lineEnd: function() {
        lower48Stream.lineEnd();
        alaskaStream.lineEnd();
        hawaiiStream.lineEnd();
        puertoRicoStream.lineEnd();
      },
      polygonStart: function() {
        lower48Stream.polygonStart();
        alaskaStream.polygonStart();
        hawaiiStream.polygonStart();
        puertoRicoStream.polygonStart();
      },
      polygonEnd: function() {
        lower48Stream.polygonEnd();
        alaskaStream.polygonEnd();
        hawaiiStream.polygonEnd();
        puertoRicoStream.polygonEnd();
      }
    };
  };

  albersUsa.precision = function(_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_);
    alaska.precision(_);
    hawaii.precision(_);
    puertoRico.precision(_);
    return albersUsa;
  };

  albersUsa.scale = function(_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_);
    alaska.scale(_ * .35);
    hawaii.scale(_);
    puertoRico.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function(_) {
    if (!arguments.length) return lower48.translate();
    var k = lower48.scale(), x = +_[0], y = +_[1];

    lower48Point = lower48
        .translate(_)
        .clipExtent([[x - .455 * k, y - .238 * k], [x + .455 * k, y + .238 * k]])
        .stream(pointStream).point;

    alaskaPoint = alaska
        .translate([x - .307 * k, y + .201 * k])
        .clipExtent([[x - .425 * k + ε, y + .120 * k + ε], [x - .214 * k - ε, y + .234 * k - ε]])
        .stream(pointStream).point;

    hawaiiPoint = hawaii
        .translate([x - .205 * k, y + .212 * k])
        .clipExtent([[x - .214 * k + ε, y + .166 * k + ε], [x - .115 * k - ε, y + .234 * k - ε]])
        .stream(pointStream).point;

    puertoRicoPoint = puertoRico
        .translate([x + .350 * k, y + .224 * k])
        .clipExtent([[x + .320 * k, y + .204 * k], [x + .380 * k, y + .234 * k]])
        .stream(pointStream).point;

    return albersUsa;
  };

  return albersUsa.scale(1070);
}

viz.mapDraw = function(vars) {

  var hiddenTopo = ["04000US69", "04000US66", "04000US60", "04000US78", "05000US60050", "05000US60010", "05000US60020", "05000US66010", "05000US69100", "05000US69110", "05000US69120", "05000US69085", "79500US6600100"];
  var us_bounds = [[-0.6061309513487787,-0.9938707206384574],[0.40254429811306913,-0.44220355964829655]];

  var fullscreen = d3.select("#map-filters").size(),
      cartodb = fullscreen ? vizStyles.tiles_map : vizStyles.tiles_viz,
      defaultRotate = vars.id && vars.id.value === "birthplace" ? [0, 0] : [90, 0],
      defaultZoom = vars.id && vars.id.value === "birthplace" ? 1 : 0.95,
      ocean = cartodb === "light_all" ? "#cdd1d3" : "#242426",
      pathOpacity = 0.75,
      pathStroke = 1,
      polyZoom = 20000,
      scaleAlign = "middle",
      scaleHeight = 10,
      scalePadding = 5,
      strokeOpacity = 0.35,
      timing = 600,
      zoomFactor = 2;

  var scaleText = {
    "fill": vizStyles.legend.font.color,
    "font-family": vizStyles.legend.font.family,
    "font-size": vizStyles.legend.font.size,
    "font-weight": vizStyles.legend.font.weight,
    "stroke": "transparent"
  }

  var borderColor = function(c) {
    // return "transparent";
    if (c === vizStyles.color.missing) return "#b9b9b9";
    return d3.rgb(c).darker(0.5);
    return d3plus.color.legible(c);
  }

  var elementSize = function(element, s) {

    if (element.tagName === undefined || ["BODY","HTML"].indexOf(element.tagName) >= 0) {

      var val  = window["inner"+s.charAt(0).toUpperCase()+s.slice(1)];
      var elem = document !== element ? d3.select(element) : false;

      if (elem) {
        if (s === "width") {
          val -= parseFloat(elem.style("margin-left"), 10);
          val -= parseFloat(elem.style("margin-right"), 10);
          val -= parseFloat(elem.style("padding-left"), 10);
          val -= parseFloat(elem.style("padding-right"), 10);
        }
        else {
          val -= parseFloat(elem.style("margin-top"), 10);
          val -= parseFloat(elem.style("margin-bottom"), 10);
          val -= parseFloat(elem.style("padding-top"), 10);
          val -= parseFloat(elem.style("padding-bottom"), 10);
        }
      }
      vars[s].value = val;
    }
    else {
      val = parseFloat(d3.select(element).style(s), 10);
      if (typeof val === "number" && val > 0) {
        vars[s].value = val;
      }
      else if (element.tagName !== "BODY") {
        elementSize(element.parentNode, s);
      }
    }
  }

  vars.container.value
    .style("position", function() {
      var current = d3.select(this).style("position");
      var remain  = ["absolute","fixed"].indexOf(current) >= 0;
      return remain ? current : "relative"
    });

  // detect size on first draw
  if (!vars.width.value) elementSize(vars.container.value.node(), "width");
  if (!vars.height.value) elementSize(vars.container.value.node(), "height");

  var width = vars.width.value,
      height = vars.height.value,
      center = [width/2, height/2];

  vars.container.value
    .style("width", width + "px")
    .style("height", height + "px");

  var svg = vars.container.value.selectAll("svg").data([0]);
  svg.enter().append("svg")

  svg
    .attr("width", width)
    .attr("height", height);

  var coords = vars.coords.value;
  if (coords && vars.coords.key) {

    var projectionType = "mercator";
    if (vars.coords.key === "states" && location.href.indexOf("/map/") < 0) {
      projectionType = "albersUsaPr";
      vars.tiles.value = false;
    }

    if (vars.tiles.value) {

      svg.style("background-color", vars.messages.background)
        .transition().duration(timing)
        .style("background-color", ocean);

      var attribution = vars.container.value.selectAll(".attribution").data([0]);

      var attr_text =  "";
      if (vars.zoom.value) {
        attr_text += "Hold <b>SHIFT</b> for box zoom<br />";
      }
      attr_text += "Map tiles by <a target='_blank' href='http://cartodb.com/attributions'>CartoDB</a>";

      attribution.enter().append("div")
        .attr("class", "attribution")
        .html(attr_text)
        // .html('&copy; <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a target="_blank" href="http://cartodb.com/attributions">CartoDB</a>')

    }

    var tileGroup = svg.selectAll("g.tiles").data([0]);
    tileGroup.enter().append("g").attr("class", "tiles")
      .attr("opacity", 0).transition().duration(timing).attr("opacity", 1);

    var polyGroup = svg.selectAll("g.paths").data([0]);
    polyGroup.enter().append("g").attr("class", "paths")
      .attr("opacity", 0).transition().duration(timing).attr("opacity", 1);

    var pinGroup = svg.selectAll("g.pins").data([0]);
    pinGroup.enter().append("g").attr("class", "pins")
      .attr("opacity", 0).transition().duration(timing).attr("opacity", 1);

    var brushGroup = svg.selectAll("g.brush").data([0]);
    brushGroup.enter().append("g").attr("class", "brush");

    var xBrush = d3.scale.identity().domain([0, width]),
        yBrush = d3.scale.identity().domain([0, height]);

    function brushended(e) {
      if (!d3.event.sourceEvent) return;

      var extent = brush.extent();
      brushGroup.call(brush.clear());

      var zs = zoom.scale(), zt = zoom.translate();

      var pos1 = extent[0].map(function(p, i){return (p - zt[i])/(zs/polyZoom); })
      var pos2 = extent[1].map(function(p, i){return (p - zt[i])/(zs/polyZoom); })

      zoomToBounds([pos1, pos2]);

    }

    var brush = d3.svg.brush()
      .x(xBrush)
      .y(yBrush)
      .on("brushend", brushended);

    if (vars.zoom.value) brushGroup.call(brush);

    var data_range = d3plus.util.uniques(vars.data.filtered, vars.color.value).filter(function(d){
      return d !== null && typeof d === "number";
    });

    if (data_range.length > 1) {

      var color_range = vizStyles.color.heatmap;

      var jenksData = vars.data.filtered
        .filter(function(d){ return d[vars.color.value] !== null && typeof d[vars.color.value] === "number"; })
        .map(function(d) { return d[vars.color.value]; }).sort();

      if (jenksData.length < color_range.length) {
        var step = (jenksData.length - 1) / (color_range.length - 1);
        var ts = d3.scale.linear()
          .domain(d3.range(0, jenksData.length + step, step))
          .interpolate(d3.interpolateHsl)
          .range(color_range);

        color_range = jenksData.map(function(d, i) { return ts(i);});
      }

      var jenks = ss.ckmeans(jenksData, color_range.length);
      jenks = d3.merge(jenks.map(function(c, i) { return i === jenks.length - 1 ? [c[0], c[c.length - 1]] : [c[0]]; }));
      var colorScale = d3.scale.threshold()
        .domain(jenks)
        .range(["black"].concat(color_range).concat(color_range[color_range.length - 1]));

    }
    else if (data_range.length) {
      var colorScale = function(d){ return color_range[color_range.length - 1]; }
    }
    else {
      var colorScale = false;
    }

    var dataMap = vars.data.filtered.reduce(function(obj, d){
      obj[d[vars.id.value]] = d;
      return obj;
    }, {});

    if (colorScale && colorScale.domain) {

      var scale = svg.selectAll("g.scale").data([0]);
      scale.enter().append("g")
        .attr("class", "scale")
        .attr("opacity", 0);

      var values = colorScale.domain(),
          colors = color_range;

      var key_width = d3.min([width * 0.9, 600]);

      var xScale = d3.scale.linear()
        .domain(d3.extent(values))
        .range([0, key_width]);

      var smallLast = xScale(values[values.length - 1]) - xScale(values[values.length - 2]) < 2;

      var key_offset = width / 2 - key_width / 2;

      var heatmap = scale.selectAll("rect.d3plus_legend_break")
        .data(colors);

      function breakStyle(b) {
        b
          .attr("height", scaleHeight)
          .attr("fill", String)
          .attr("stroke", scaleText.fill)
          .attr("stroke-width", 1)
          .attr("y", scalePadding);
      }

      heatmap.enter().append("rect")
        .attr("class", "d3plus_legend_break")
        .attr("x", width / 2)
        .attr("width", 0)
        .attr("fill-opacity", pathOpacity)
        .call(breakStyle);

      heatmap.transition().duration(timing)
        .attr("x", function(d, i) {
          return (key_offset) + xScale(values[i]);
        })
        .attr("width", function(d, i) {
          return xScale(values[i + 1]) - xScale(values[i]) + (smallLast && i === colors.length - 1 ? 3 : 0);
        })
        .call(breakStyle);

      var text = scale.selectAll("text.d3plus_tick")
        .data(values);

      var textHeight = scaleText["font-size"];

      function textY(d, i) {
        return textHeight + scalePadding * 1.5 + scaleHeight + (i % 2 ? textHeight : 0);
      }

      text.enter().append("text")
        .attr("class","d3plus_tick")
        .attr("x",function(d){
          if (scaleAlign === "middle") return Math.floor(key_width/2);
          else if (scaleAlign === "end") return key_width;
          else return 0;
        })
        .attr("dx", key_offset)
        .attr("y", textY)
        .style("text-anchor", "middle");

      text
        .order()
        .attr(scaleText)
        .text(function(d){
          return vars.format.number(d, {"key": vars.color.value, "vars": vars});
        })
        .attr("y", textY)
        .transition().duration(timing)
          .attr("x", xScale)
          .attr("dx", key_offset)
          .attr("opacity", function(d, i) { return smallLast && i === values.length - 1 ? 0 : 1; });

      text.exit().transition().duration(timing)
        .attr("opacity", 0)
        .remove();

      var tick = scale.selectAll("line.d3plus_tick")
        .data(values);

      function tickStyle(t) {
        t
          .attr("y1", scalePadding)
          .attr("y2", function(d, i){
            return scalePadding * 2 + scaleHeight + (i % 2 ? textHeight : 0);
          })
          .attr("stroke", scaleText.fill)
          .attr("stroke-width", 1)
      }

      tick.enter().append("line")
        .attr("class","d3plus_tick")
        .attr("x1",function(d){
          if (scaleAlign === "middle") return key_offset + Math.floor(key_width/2);
          else if (scaleAlign === "end") return key_offset + key_width;
          else return key_offset;
        })
        .attr("x2",function(d){
          if (scaleAlign === "middle") return key_offset + Math.floor(key_width/2);
          else if (scaleAlign === "end") return key_offset + key_width;
          else return key_offset;
        })
        .attr("opacity", 0)
        .call(tickStyle);

      tick
        .order()
        .transition().duration(timing)
          .attr("x1", function(d) { return key_offset + xScale(d); })
          .attr("x2", function(d) { return key_offset + xScale(d); })
          .attr("opacity", function(d, i) { return smallLast && i === values.length - 1 ? 0 : 1; })
          .call(tickStyle);

      tick.exit().transition().duration(timing)
        .attr("opacity", 0)
        .remove();

      var label = scale.selectAll("text.scale_label").data([0]);
      label.enter().append("text").attr("class", "scale_label")

      label
        .attr("text-anchor", scaleAlign)
        .attr("x",function(d){
          if (scaleAlign === "middle") {
            return Math.floor(width/2);
          }
          else if (scaleAlign === "end") {
            return width;
          }
          else {
            return 0;
          }
        })
        .attr("y", -scalePadding)
        .text(vars.format.text(vars.color.value))
        .attr(scaleText);

      var key_box = scale.node().getBBox(),
          key_height = key_box.height + key_box.y;

      // key_height += attribution.node().offsetHeight;
      key_height += scalePadding;

      if (vars.time.years.length > 1) key_height += vars.container.value.select(".year-toggle").node().offsetHeight;

      scale.attr("transform" , "translate(0, " + (height - key_height) + ")")
        .transition().duration(timing).attr("opacity", 1);

      key_height += scalePadding;

    }
    else {
      key_height = 0;
    }
    var thumb = d3.select(vars.container.value.node().parentNode).classed("thumbprint");
    var pinData = [];
    var coordTopo = d3plus.util.copy(coords.objects[vars.coords.key]);
    coordTopo.geometries = coordTopo.geometries.filter(function(c){
      if (vars.pins.value.indexOf(c.id) >= 0) pinData.push(c);
      if (hiddenTopo.indexOf(c.id) >= 0) return false;
      if (!thumb && vars.coords.key !== "states" && c.id.indexOf("040") === 0) return false;
      return vars.coords.solo.length ? vars.coords.solo.indexOf(c.id) >= 0 :
             vars.coords.mute.length ? vars.coords.mute.indexOf(c.id) < 0 : true;
    })
    var coordData = topojson.feature(coords, coordTopo);

    if (!vars.zoom.set) {

      vars.zoom.projection = d3.geo[projectionType]()
        .scale((1 * polyZoom) / 2 / Math.PI)
        .translate([0, 0]);

      if (projectionType === "mercator") vars.zoom.projection.rotate(defaultRotate);

    }

    var projection = vars.zoom.projection;

    var path = d3.geo.path()
      .projection(projection);

    var showUS = projectionType === "mercator" && vars.id.value === "geo" && !vars.coords.solo.length;

    var coordBounds = path.bounds(coordData),
        b = showUS ? us_bounds : coordBounds,
        s = defaultZoom / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / (height - key_height)),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2 - key_height/2];

    var minZoom = defaultZoom / Math.max((coordBounds[1][0] - coordBounds[0][0]) / width, (coordBounds[1][1] - coordBounds[0][1]) / (height - key_height));

    // Update the projection to use computed scale & translate.
    if (!vars.zoom.set) {

      // projection.scale(s).translate(t);
      var zs = s;
      if (!(projectionType === "mercator" && vars.id.value === "geo" && !vars.coords.solo.length)) {
        zs = (s/Math.PI/2) * polyZoom;
      }

      vars.zoom.behavior = d3.behavior.zoom()
        .scale(zs * 2 * Math.PI)
        .scaleExtent([1 << 9, 1 << 25])
        .translate(t)
        .on("zoom", zoomed);

      // With the center computed, now adjust the projection such that
      // it uses the zoom behavior’s translate and scale.
      // projection.scale((1 * polyZoom) / 2 / Math.PI);

    }

    var zoom = vars.zoom.behavior;

    pinData = pinData.map(function(d){ return path.centroid(topojson.feature(coords, d)); });

    if (vars.zoom.value) {

      var controls = vars.container.value.selectAll(".map-controls").data([0]);
      var controls_enter = controls.enter().append("div")
        .attr("class", "map-controls");

      function zoomMath(factor) {

        var scale = zoom.scale(),
            extent = zoom.scaleExtent(),
            translate = zoom.translate(),
            x = translate[0], y = translate[1],
            target_scale = scale * factor;

        // If we're already at an extent, done
        if (target_scale === extent[0] || target_scale === extent[1]) { return false; }

        // If the factor is too much, scale it down to reach the extent exactly
        var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale));
        if (clamped_target_scale != target_scale){
            target_scale = clamped_target_scale;
            factor = target_scale / scale;
        }

        // Center each vector, stretch, then put back
        x = (x - center[0]) * factor + center[0];
        y = (y - center[1]) * factor + center[1];

        zoom.scale(target_scale).translate([x, y]);
        zoomed(timing);
      }

      controls_enter.append("div").attr("class", "zoom-in").on(d3plus.client.pointer.click, function(){
        zoomMath(zoomFactor);
      });

      controls_enter.append("div").attr("class", "zoom-out").on(d3plus.client.pointer.click, function(){
        zoomMath(1/zoomFactor);
      });

      controls_enter.append("div").attr("class", "zoom-reset");
      controls.select(".zoom-reset").on(d3plus.client.pointer.click, function(){
        d3plus.tooltip.remove("geo_map_sidebar");
        vars.highlight.value = false;
        vars.highlight.path = undefined;
        zoomLogic();
      });

    }

    var polyStyle = function(p) {
      p
        .attr("fill", function(d) {
          var dat = dataMap[d.id];
          var val = dat && vars.color.value in dat ? dat[vars.color.value] : null;
          d.color = colorScale && val !== null && typeof val === "number" ? colorScale(val) : vizStyles.color.missing;
          return d.color;
        })
        .attr("fill-opacity", pathOpacity)
        .attr("stroke-width", pathStroke/(zoom.scale()/polyZoom))
        .attr("stroke-opacity", strokeOpacity)
        .attr("stroke", function(d){
          return borderColor(d.color);
        });
    }

    var polys = polyGroup.selectAll("path")
      .data(coordData.features, function(d){
        if (vars.highlight.value === d.id) {
          if (vars.mouse.value && d.id.slice(0, 3) !== "140") createTooltip(d, true);
          vars.highlight.path = d;
        }
        return d.id;
      });

    polys.exit().remove();

    polys.enter().append("path")
      .attr("d", path)
      // .attr("vector-effect", "non-scaling-stroke")
      .attr("class", function(d){
        var o = {};
        o[vars.id.value] = d.id;
        var c = vars.class.value ? vars.class.value(o, vars) : "";
        return "d3plus_coordinates " + c;
      })
      .attr("id", function(d){
        return d.id;
      })
      .call(polyStyle);

    function createTooltip(d, big) {

      var dat = dataMap[d.id];

      var id = big ? "geo_map_sidebar" : "geo_map";

      if (big) {
        if (fullscreen) {
          var x = 0, y = d3.select("#map-filters").node().offsetHeight + d3.select("#top-nav").node().offsetHeight + 15,
              mh = window.innerHeight - y - 15;
          if (d3plus.client.ie) mh -= 35;
        }
        else {
          var margin = 0,
              x = window.innerWidth - margin - vizStyles.tooltip.small/2,
              y = margin,
              mh = vars.height.value;
        }
      }
      else {
        var mouse = d3.mouse(d3.select("html").node()),
            x = mouse[0], y = mouse[1],
            mh = undefined;
      }
      var tooltip_data = [];

      var tooltip_data = vars.tooltip.value.reduce(function(arr, t){
        if (dat && t in dat && dat[t] !== null && dat[t] !== undefined) {
          arr.push({
            "group": "",
            "name": vars.format.text(t, {}),
            "value": vars.format.value(dat[t], {"key": t}),
            "highlight": t === vars.color.value
          });
        }
        return arr;
      }, []);
      var link_id = vars.attrs.value[d.id] ? vars.attrs.value[d.id].url_name : d.id;
      var html = " ", link = "/profile/geo/" + link_id + "/";
      if (d.id && big && vars.tooltip.url) {
        html = "<div class='d3plus_tooltip_html_seperator'></div>";
        // html = "<a class='btn pri-btn' href='" + link + "'>View Profile</a>";
        if (big.constructor === String) {
          html += big;
        }
        else {
          html += "<div class='loader'><i class='fa fa-circle-o-notch fa-spin'></i>Loading Data</div>";
        }
      }
      else if (d.id === void 0) {
        var length = vars.data.filtered.length,
            tdata = vars.data.filtered.filter(function(d){
              return d[vars.color.value] !== void 0 && d[vars.color.value] !== null;
            });
        if (tdata.length > 20) {
          var top = tdata.slice(0, 10).map(function(c, i){
            var n = vars.attrs.value[c.geo].display_name || vars.attrs.value[c.geo].name;
            return "<tr><td class='list-rank'>" + (i + 1) + ".</td><td class='list-name' id='id" + c.geo + "'>" + n + "</td><td class='list-value'>" + vars.format.number(c[vars.color.value], {"key": vars.color.value, "vars": vars}) + "</td></tr>";
          }).join("");
          var bottom = tdata.slice().reverse().slice(0, 10).reverse().map(function(c, i){
            var n = vars.attrs.value[c.geo].display_name || vars.attrs.value[c.geo].name;
            return "<tr><td class='list-rank'>" + ((length - 9) + i) + ".</td><td class='list-name' id='id" + c.geo + "'>" + n + "</td><td class='list-value'>" + vars.format.number(c[vars.color.value], {"key": vars.color.value, "vars": vars}) + "</td></tr>";
          }).join("");
          var html = "<div class='list-title'>Top 10 Locations</div><table>" + top + "</table><div class='list-title'>Bottom 10 Locations</div><table>" + bottom + "</table>";
        }
        else {
          var html = tdata.map(function(c, i){
            var n = vars.attrs.value[c.geo].display_name || vars.attrs.value[c.geo].name;
            return "<tr><td class='list-rank'>" + (i + 1) + ".</td><td class='list-name' id='id" + c.geo + "'>" + n + "</td><td class='list-value'>" + vars.format.number(c[vars.color.value], {"key": vars.color.value, "vars": vars}) + "</td></tr>";
          }).join("");
          html = "<div class='list-title'>Location Ranking</div><table>" + html + "</table>";
        }
      }

      var tooltip_obj = {
        "align": !big ? "top center" : "bottom center",
        "arrow": big ? false : true,
        "background": vizStyles.tooltip.background,
        "color": big ? false : d.color,
        "data": tooltip_data,
        "description": big && d.id ? "Last selected geography" : tooltip_data.length || d.id === void 0 ? false : vars.tooltip.value.length ? "No Data Available" : false,
        "fontcolor": vizStyles.tooltip.font.color,
        "fontfamily": vizStyles.tooltip.font.family,
        "fontsize": vizStyles.tooltip.font.size,
        "fontweight": vizStyles.tooltip.font.weight,
        "footer": big ? false : !vars.zoom.value ? "Click to View Profile" : tooltip_data.length ? d.id === vars.highlight.value ? "Click to Recenter Map" : "Click for More Info" : "Click to Zoom In",
        "html": html,
        "id": id,
        "js": big && d.id ? function(elem) {
          elem.select(".d3plus_tooltip_title").on(d3plus.client.pointer.click, function(){
            window.location = link;
          });
        } : big ? function(elem) {
          elem.selectAll(".list-name").on(d3plus.client.pointer.click, function(){
            vars.zoom.reset = true;
            vars.self.highlight(this.id.slice(2)).draw();
          });
        } : false,
        "max_height": mh,
        "max_width": vizStyles.tooltip.small,
        "mouseevents": big ? true : false,
        "offset": big ? 0 : 3,
        "parent": big && !fullscreen ? vars.container.value : big ? d3.select("#map-controls") : d3.select("body"),
        "title": d.id ? vars.format.text(d.id, {"key": vars.id.value, "vars": vars}, {"viz": vars.self}) : undefined,
        "width": vizStyles.tooltip.small,
        "x": x,
        "y": y
      };

      d3plus.tooltip.remove(id);
      d3plus.tooltip.create(tooltip_obj);

      if (d.id && big === true && vars.tooltip.url) {
        var url = vars.tooltip.url;
        var prefix = d.id.slice(0, 3)
        if (prefix == "040") {
          url += "&where=geo:^" + d.id.replace("040", "050");
        }
        else {
          url += "&geo=" + d.id;
        }
        load(url, function(data) {

          if (data.length > 20) {
            var top = data.slice(0, 10).map(function(c, i){
              var n = vars.attrs.value[c.geo].display_name || vars.attrs.value[c.geo].name;
              return "<tr><td class='list-rank'>" + (i + 1) + ".</td><td class='list-name' id='id" + c.geo + "'>" + n + "</td><td class='list-value'>" + vars.format.number(c[vars.color.value], {"key": vars.color.value, "vars": vars}) + "</td></tr>";
            }).join("");
            var bottom = data.slice().reverse().slice(0, 10).reverse().map(function(c, i){
              var n = vars.attrs.value[c.geo].display_name || vars.attrs.value[c.geo].name;
              return "<tr><td class='list-rank'>" + ((data.length - 9) + i) + ".</td><td class='list-name' id='id" + c.geo + "'>" + n + "</td><td class='list-value'>" + vars.format.number(c[vars.color.value], {"key": vars.color.value, "vars": vars}) + "</td></tr>";
            }).join("");
            var html = "<div class='list-title'>Top 10 Locations</div><table>" + top + "</table><div class='list-title'>Bottom 10 Locations</div><table>" + bottom + "</table>";
          }
          else {
            var html = data.map(function(c, i){
              var n = vars.attrs.value[c.geo].display_name || vars.attrs.value[c.geo].name;
              return "<tr><td class='list-rank'>" + (i + 1) + ".</td><td class='list-name' id='id" + c.geo + "'>" + n + "</td><td class='list-value'>" + vars.format.number(c[vars.color.value], {"key": vars.color.value, "vars": vars}) + "</td></tr>";
            }).join("");
            html = "<div class='list-title'>County Ranking</div><table>" + html + "</table>";
          }

          createTooltip(d, html);
        });
      }

    }

    if (vars.mouse.value) {

      var drag = true;

      polys
        .on("mouseover", function(d){
          if (vars.zoom.brush) {
            d3plus.tooltip.remove("geo_map");
          }
          else {
            if (!d3plus.client.ie) this.parentNode.appendChild(this);
            d3.select(this).attr("stroke-opacity", 1).style("cursor", "pointer");
            createTooltip(d);
          }
        })
        .on(d3plus.client.pointer.move, function(d){
          drag = d3.event.buttons ? true : false;
          if (drag) vars.zoom.reset = false;
          if (vars.zoom.brush) {
            d3plus.tooltip.remove("geo_map");
          }
          else {
            if (!d3plus.client.ie) this.parentNode.appendChild(this);
            d3.select(this).attr("stroke-opacity", 1).style("cursor", "pointer");
            createTooltip(d);
          }
        })
        .on("mouseout", function(d){
          d3.select(this).attr("stroke-opacity", strokeOpacity);
          d3plus.tooltip.remove("geo_map");
        })
        .on(d3plus.client.pointer.click, function(d){
          if (!vars.zoom.value) {
            var link_id = vars.attrs.value[d.id] ? vars.attrs.value[d.id].url_name : d.id;
            window.location = "/profile/geo/" + link_id + "/";
          }
          else if (drag) {
            drag = false;
          }
          else if (vars.highlight.value === d.id) {
            d3plus.tooltip.remove("geo_map_sidebar");
            vars.highlight.value = false;
            vars.highlight.path = undefined;
            zoomLogic();
          }
          else {
            vars.highlight.value = d.id;
            vars.highlight.path = d;
            d3.select(this).attr("fill-opacity", pathOpacity);
            d3plus.tooltip.remove("geo_map");
            zoomLogic(d);
            var dat = dataMap[d.id];
            if (d.id.slice(0, 3) !== "140" && dat) createTooltip(d, true);
            else d3plus.tooltip.remove("geo_map_sidebar");
          }
        });

    }

    if (vars.zoom.reset) {
      polys.call(polyStyle);
    }
    else {
      polys
        .transition().duration(timing)
        .call(polyStyle);
    }

    var pins = pinGroup.selectAll(".pin").data(pinData);
    pins.enter().append("path")
      .attr("class", "pin")
      .attr("vector-effect", "non-scaling-stroke")
      .attr("stroke-width", 1)
      .attr("d", vizStyles.pin.path)
      .attr("fill", vizStyles.pin.color)
      .attr("stroke", vizStyles.pin.stroke);

    if (vars.tiles.value) {
      var tile = d3.geo.tile()
        .overflow([true, false]);
    }

    if (vars.zoom.value) {
      zoomEvents();
    }

    if ((!vars.zoom.set || vars.color.changed) && fullscreen) createTooltip({}, true);

    if (!vars.zoom.set) {
      zoomed();
      vars.zoom.set = true;
    }
    else if (vars.zoom.reset) {
      zoomLogic(vars.highlight.path);
    }

  }

  function zoomEvents() {
    if (vars.zoom.brush) {
      brushGroup.style("display", "inline");
      svg.on(".zoom", null);
    }
    else if (vars.zoom.value) {
      brushGroup.style("display", "none");
      svg.call(zoom);
      if (!vars.zoom.scroll) {
        svg
          .on("mousewheel.zoom", null)
          .on("MozMousePixelScroll.zoom", null)
          .on("wheel.zoom", null);
      }
      if (!vars.zoom.pan) {
        svg
          .on("mousedown.zoom", null)
          .on("mousemove.zoom", null)
          .on("touchstart.zoom", null)
          .on("touchmove.zoom", null);
      }
    }
  }

  function zoomLogic(d) {

    vars.zoom.reset = true;

    var mod = 0;
    if (d) {
      var bounds = path.bounds(d);
      mod = fullscreen || d.id.slice(0, 3) === "140" ? 0 : 250;
      zoomToBounds(bounds, mod);
    }
    else {
      if (fullscreen) createTooltip({}, true);
      var ns = s;
      if (!(projectionType === "mercator" && vars.id.value === "geo" && !vars.coords.solo.length)) {
        ns = (ns/Math.PI/2) * polyZoom;
      }
      zoom.scale(ns * 2 * Math.PI).translate(t);
      zoomed(timing);
    }

  }

  function zoomToBounds(b, mod) {

    if (mod === void 0) {
      mod = fullscreen || !vars.highlight.path || vars.highlight.path.id.slice(0, 3) === "140" ? 0 : 250;
    }

    var w = width - mod;

    var ns = defaultZoom / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / (height - key_height)),
        nt = [(w - ns * (b[1][0] + b[0][0])) / 2, (height - ns * (b[1][1] + b[0][1])) / 2 - key_height/2];

    ns = (ns/Math.PI/2) * polyZoom;

    zoom.scale(ns * 2 * Math.PI).translate(nt);
    zoomed(timing);

  }

  function zoomed(zoomtiming) {

    if (d3.event && !vars.zoom.pan) {
      vars.zoom.pan = true;
      zoomEvents();
    }

    var trans = zoom.translate(),
        s = zoom.scale();
    var pz = s / polyZoom;

    if (pz < minZoom) {
      pz = minZoom;
      s = pz * polyZoom;
      zoom.scale(s);
    }

    if (!showUS) {

      var nh = height - key_height;
      var bh = coordBounds[1][1] - coordBounds[0][1];
      var bw = coordBounds[1][0] - coordBounds[0][0];
      var xoffset = (width - (bw * pz)) / 2;
      var xmin = xoffset > 0 ? xoffset : 0;
      var xmax = xoffset > 0 ? width - xoffset : width;
      var yoffset = (nh - (bh * pz)) / 2;
      var ymin = yoffset > 0 ? yoffset : 0;
      var ymax = yoffset > 0 ? nh - yoffset : nh;

      if (trans[0] + coordBounds[0][0] * pz > xmin) {
        trans[0] = -coordBounds[0][0] * pz + xmin
      }
      else if (trans[0] + coordBounds[1][0] * pz < xmax) {
        trans[0] = xmax - (coordBounds[1][0] * pz)
      }

      if (trans[1] + coordBounds[0][1] * pz > ymin) {
        trans[1] = -coordBounds[0][1] * pz + ymin
      }
      else if (trans[1] + coordBounds[1][1] * pz < ymax) {
        trans[1] = ymax - (coordBounds[1][1] * pz)
      }

    }

    zoom.translate(trans);

    if (vars.tiles.value) {
      var d = projection(defaultRotate)[0] - projection([0, 0])[0];
      var tileTrans = trans.slice();
      tileTrans[0] += (d/polyZoom) * s;
      var tileData = tile
        .size([width, height])
        .scale(s)
        .translate(tileTrans)
        ();
    }
    else {
      var tileData = [];
    }

    polyGroup.attr("transform", "translate(" + trans + ")scale(" + pz + ")")
      .selectAll("path").attr("stroke-width", pathStroke/pz);
    pinGroup.attr("transform", "translate(" + trans + ")scale(" + pz + ")")
      .selectAll(".pin")
      .attr("transform", function(d){
        return "translate(" + d + ")scale(" + (1/pz*vizStyles.pin.scale) + ")";
      });

    if (vars.tiles.value) {
      tileGroup.attr("transform", "scale(" + tileData.scale + ")translate(" + tileData.translate + ")");
    }

    var tilePaths = tileGroup.selectAll("image.tile")
        .data(tileData, function(d) { return d; });

    tilePaths.exit().remove();

    tilePaths.enter().append("image")
      .attr("xlink:href", function(d) {
        var x = d[0] % tileData.width;
        if (x < 0) x += tileData.width;
        return "https://cartodb-basemaps-" + ["a", "b", "c", "d"][Math.random() * 3 | 0] + ".global.ssl.fastly.net/" + cartodb + "/" + d[2] + "/" + x + "/" + d[1] + ".png";
      })
      .attr("width", 1)
      .attr("height", 1)
      .attr("x", function(d) { return d[0]; })
      .attr("y", function(d) { return d[1]; });

  }

  d3.select("body")
    .on("keydown.map", function() {
      if (d3.event.keyCode === 16) {
        vars.zoom.brush = true;
        zoomEvents();
      }
    })
    .on("keyup.map", function() {
      if (d3.event.keyCode === 16) {
        vars.zoom.brush = false;
        zoomEvents();
      }
    });

  return vars.self;

}

viz.map = function() {

  // setup default vars, mimicing D3plus
  var vars = {
    attrs: {objectOnly: true, value: {}},
    background: {value: "transparent"},
    class: {value: false},
    color: {value: false},
    container: {value: false},
    coords: {value: false, solo: [], mute: []},
    data: {value: []},
    depth: {value: 0},
    error: {value: false},
    form: false,
    format: {
      value: function(value, opts){
        if (typeof value === "number") {
          return this.number(value, opts);
        }
        else if (typeof value === "string") {
          return this.text(value, opts);
        }
        return JSON.stringify(value);
      },
      number: viz.format.number,
      text: viz.format.text
    },
    height: {value: false},
    highlight: {value: false},
    id: {value: false},
    messages: {value: true},
    mouse: {value: true},
    pins: {value: []},
    text: {value: "name"},
    tiles: {value: true},
    time: {value: false, solo: false, years: false},
    tooltip: {url: false, value: []},
    width: {value: false},
    zoom: {pan: false, scroll: false, set: false, value: true, reset: true}
  };

  // the drawing function
  vars.self = function() {

    if (vars.data.value.length && !vars.time.years) {
      vars.time.years = d3plus.util.uniques(vars.data.value.filter(function(d) { return typeof d[vars.color.value] === "number"; }), function(d) { return d.year; }).sort(function(a, b) { return a - b; });
      vars.data.value = vars.data.value.filter(function(d) { return vars.time.years.indexOf(d.year) >= 0; });
    }

    var time = vars.time.years && vars.time.years.length > 1;

    var toggle = vars.container.value.selectAll(".year-toggle").data([null]);
    toggle.enter().append("div").attr("class", "year-toggle");
    toggle.transition().duration(600).style("opacity", time ? 1 : 0);

    if (time) {
      if (!vars.time.solo) vars.time.solo = vars.time.years[vars.time.years.length - 1];
      vars.data.filtered = vars.data.value.filter(function(d) { return d.year === vars.time.solo });

      if (!vars.form) {
        vars.form = d3plus.form()
          .container(toggle)
          .id("value")
          .focus(vars.time.solo, function(d) {
            if (d !== vars.time.solo) {
              vars.time.solo = d;
              vars.self.draw();
            }
          })
          .text("text")
          .type("toggle")
          .ui({margin: 0})
          .ui(vizStyles.ui)
          // .title("Year")
          .draw();
      }
      vars.form
        .data(vars.time.years.map(function(d) { return {value: d, text: d + ""}; }))
        .focus(vars.time.solo)
        .draw();
    }
    else vars.data.filtered = vars.data.value;

    viz.mapDraw(vars);
    vars.color.changed = false;
    return vars.self;
  }

  // default logic for setting a var key
  var methodSet = function(method, _) {
    if (!vars[method]) vars[method] = {};
    if (_.constructor === Object && _.type === "Topology") {
      vars[method].changed = true;
      vars[method].value = _;
    }
    else if (_.constructor === Object && vars[method].objectOnly !== true) {
      for (var k in _) {
        vars[method][k] = _[k];
      }
    }
    else {
      vars[method].changed = true;
      vars[method].value = _;
    }
  }

  // attach simple set/get methods for all keys in vars
  for (var key in vars) {
    vars.self[key] = (function(method){
      return function(_) {
        if (arguments.length) {
          if (_ === Object) return vars[method];
          methodSet(method, _);
          return vars.self;
        }
        return vars[method].value;
      }
    })(key);
  }

  // method for passing multiple methods in one function
  vars.self.config = function(_) {
    for (var method in _) {
      methodSet(method, _[method]);
    }
    return vars.self;
  }

  vars.self.draw = vars.self;
  return vars.self;

}

d3.geo.tile = function() {
  var size = [960, 500],
      scale = 256,
      translate = [size[0] / 2, size[1] / 2],
      zoomDelta = 0,
      X = clamp,
      Y = clamp;

  function tile() {
    var z = Math.max(Math.log(scale) / Math.LN2 - 8, 0),
        z0 = Math.round(z + zoomDelta),
        k = Math.pow(2, z - z0 + 8),
        origin = [(translate[0] - scale / 2) / k, (translate[1] - scale / 2) / k],
        tiles = [],
        w = 1 << z0,
        x0 = X(Math.floor(-origin[0]), w),
        y0 = Y(Math.floor(-origin[1]), w),
        x1 = X(Math.ceil(size[0] / k - origin[0]), w),
        y1 = Y(Math.ceil(size[1] / k - origin[1]), w);

    for (var y = y0; y < y1; ++y) {
      for (var x = x0; x < x1; ++x) {
        tiles.push([x, y, z0]);
      }
    }

    tiles.translate = origin;
    tiles.scale = k;
    tiles.width = w;

    return tiles;
  }

  tile.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return tile;
  };

  tile.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return tile;
  };

  tile.translate = function(_) {
    if (!arguments.length) return translate;
    translate = _;
    return tile;
  };

  tile.zoomDelta = function(_) {
    if (!arguments.length) return zoomDelta;
    zoomDelta = +_;
    return tile;
  };

  tile.overflow = function(_) {
    if (!arguments.length) return [X === identity, Y === identity];
    X = _[0] ? identity : clamp;
    Y = _[1] ? identity : clamp;
    return tile;
  };

  return tile;

  function identity(x) { return x; }
  function clamp(x, max) { return Math.max(0, Math.min(max, x)); }
};
