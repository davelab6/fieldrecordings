/*
A bit of javascript for SOE

requires: jQuery, Raphael

*/

var SOE_debug = false;

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

function initMediaPlayer()
{
// 	var sol = "flash,html";
	var sol = "html,flash";
	jQuery('.audio-mpeg, .audio-mp3, .audio-x-mp3').each(function(index)
	{
		var that = jQuery(this);
		var wp_id =  that.attr('id').substring(6);
		var audioFile = that.attr('title');
		that.attr('title', '');
		var playerDiv = that.children('.media-player').first();
		var isSow = false;
		if(playerDiv.attr('id') == 'sow_media_player')
			isSow = true;
		
		var  player = playerDiv.jPlayer(
			{
			ready: function () 
			{
				var tt = trackTrack;
				var tp = trackPaused;
				playerDiv.jPlayer("setMedia", { mp3: audioFile});
				playerDiv.bind(jQuery.jPlayer.event.play, function() { playerDiv.jPlayer("pauseOthers"); });
				if(isSow && tt > 0)
				{
					if( tp == 1)
						playerDiv.jPlayer('pause', tt);
					else
						playerDiv.jPlayer('play', tt);
				}
			},
			preload: 'metadata',
			supplied: "mp3",
			solution: sol,
			swfPath: jplayerswf,
			cssSelectorAncestor: '#jp_interface_' + wp_id,
			cssSelector: {
				play: '.jp-play',
				pause: '.jp-pause'
			},
			errorAlerts: SOE_debug,
			warningAlerts: false
		});
		
		
	});
	
	jQuery('.audio-ogg').each(function(index)
	{
		var that = jQuery(this);
		var wp_id =  that.attr('id').substring(6);
		var audioFile = that.attr('title');
		that.attr('title', '');
		var playerDiv = that.children('.media-player').first();
		var isSow = false;
		if(playerDiv.attr('id') == 'sow_media_player')
			isSow = true;
		
		var  player = playerDiv.jPlayer({
			ready: function () 
			{
				playerDiv.jPlayer("setMedia", { oga: audioFile});
				playerDiv.bind(jQuery.jPlayer.event.play, function() { playerDiv.jPlayer("pauseOthers"); });
				var tt = trackTrack;
				var tp = trackPaused;
				if(isSow && tt > 0)
				{
					if( tp == 1)
						playerDiv.jPlayer('pause', tt);
					else
						playerDiv.jPlayer('play', tt);
				}
			},
			supplied: "oga",
			solution: sol,
			swfPath: jplayerswf,
			cssSelectorAncestor: '#jp_interface_' + wp_id,
			cssSelector: {
				play: '.jp-play',
				pause: '.jp-pause'
			},
			errorAlerts: SOE_debug,
			warningAlerts: false
		});
	});
}


var raph = undefined;
var p = undefined;

var map_id = new Array();
var map_path = new Array();

var theCursorLine = new Object();

function Point(x, y)
{
	if(x instanceof Point)
	{
		this.x = x.x;
		this.y = x.y;
	}
	else
	{
		this.x = x;
		this.y = y;
	}
}

Point.prototype.scale = function(sx, sy)
{
	var gsy = sx;
	if(sy != undefined)
		gsy = sy;
	this.x = this.x * sx;
	this.y = this.y * gsy;
	return this;
}

Point.prototype.toString = function()
{
	return " [ " +this.x + " ; " +this.y + " ] ";
}

function Rect(left, top, width, height)
{
	if(left instanceof Rect)
	{
		this._x = left._x;
		this._y = left._y;
		this._width = left._width;
		this._height = left._height;
	}
	else
	{
		this._x = left;
		this._y = top;
		this._width = width;
		this._height = height;
	}
}

Rect.prototype.top = function(){return this._y;}
Rect.prototype.left = function(){return this._x;}
Rect.prototype.width = function(){return this._width;}
Rect.prototype.height = function(){return this._height;}
Rect.prototype.right = function(){return this._x + this._width;}
Rect.prototype.bottom = function(){return this._y + this._height;}
Rect.prototype.center = function(){return (new Point(this._x + (this._width / 2), this._y + (this._height / 2)));}
Rect.prototype.translate = function(dx, dy){this._x += dx; this._y += dy;}
Rect.prototype.move = function(x, y){this._x = x; this._y = y;}

Rect.prototype.intersects = function(r) 
{
	return (this.left() <= r.right() &&
	r.left() <= this.right() &&
	this.top() <= r.bottom() &&
	r.top() <= this.bottom());
}
function Color(r, g, b, a)
{
	this.r = r;
	this.g = g;
	this.b = b;
	if(a == undefined)
		this.a = 255;
	else
		this.a = a;
}

Color.prototype.toString = function()
{
	var colS = "rgba("+ this.r +","+ this.g +","+ this.b +","+ this.a +")";
	return colS;
}

function Path(R, p)
{
	this._pdata = "";
	if(p != undefined)
		this._pdata = p;
	
	this._stroke = "#000";
	this._fill = "transparent";
	this._path =  R.path(this._pdata).attr(
	{
		stroke : this._stroke,
		fill : this._fill,
		path : this._pdata
	});
	this._path.hide();
	this._scale = {sx:1,sy:1};
// 	this._rotation = "0";
	this._translation = {dx:0,dy:0};
}

Path.prototype._updateAttrs = function()
{
// 	this._path.attr(
// 	{
// 		path : this._pdata,
// 		stroke : this._stroke,
// 		fill : this._fill,
// 		rotation : this._rotation,
// 		translation : this._translation,
// 		scale : this._scale
// 	});
//         
        this._path.attr('path', this._pdata);
        this._path.attr('stroke',this._stroke );
        this._path.attr('fill', this._fill);
//         this._path.translate(this._translation.dx * this._scale.sx, this._translation.dy * this._scale.sy);
//         this._path.scale(this._scale.sx, this._scale.sy);
//         this._path.rotate(this._rotation);
	var mat = 'matrix('+this._scale.sx+',0,0,'+this._scale.sy+','+(this._translation.dx * this._scale.sx)+','+(this._translation.dy * this._scale.sy)+')';
// 	this._path.attr('transform', mat);
	this._path.node.setAttribute('transform', mat);
}

Path.prototype.simplify = function()
{
	var simpliFactor = 3;
}

Path.prototype.bbox = function()
{
	var ret = this._path.getBBox(false);
	ret.x = (ret.x + this._translation.dx) * this._scale.sx;
	ret.y = (ret.y + this._translation.dy) * this._scale.sy;
	ret.height *= this._scale.sy;
	ret.width *= this._scale.sx;
	return ret;
// 	return (new Point(bb.x, bb.y));
}

Path.prototype.attr = function(key, val)
{
	this._path.attr(key, val);
	return this;
}

Path.prototype.moveTo = function(x,y)
{
	this._pdata += "M "+ x + " " + y;
	return this;
}

Path.prototype.lineTo = function(x,y)
{
	this._pdata += "L "+ x + " " + y;
	return this;
}

Path.prototype.cubicTo = function(cx1,cy1 , cx2,cy2, x,y)
{
	this._pdata += "C " + cx1 + " " + cy1 + " " + cx2 + " " + cy2 + " " + x + " " + y;
	return this;
}

Path.prototype.close = function(x,y)
{
	this._pdata += " z";
	return this;
}

Path.prototype.stroke = function(color)
{
	if(color == undefined)
		return this._stroke;
	else
	{
		this._stroke = color;
	}
	return this;
}

Path.prototype.fill = function(color)
{
	if(color == undefined)
		return this._fill;
	else
	{
		this._fill = color;
	}
	return this;
}

Path.prototype.abs = function()
{
	var bb = this._path.getBBox();
	return this.translate(-bb.x, -bb.y); 
}

Path.prototype.scale = function(sx, sy)
{
	var gsx = sy;
	if(sy == undefined)
		gsx = sx
// 	this._scale = sx + " " + gsx + " 0 0";
        this._scale = {sx:sx,sy:gsx};
	return this;
}

Path.prototype.translate = function(dx, dy)
{
// 	this._translation = dx + " " + dy;
        this._translation = {dx:dx, dy:dy};
	return this;
}

Path.prototype.rotate = function(r)
{
	this._rotation = r;
	return this;
}

Path.prototype.reset = function(p)
{
	if(p == undefined)
		this._pdata = "";
	else
		this._pdata = p;
	
	return this;
}

Path.prototype.draw = function()
{
	this._updateAttrs();
	this._path.show();
	return this;
}

Path.prototype.element = function()
{
	return this._path.node;
}

Path.prototype.toBack = function()
{
	this._path.toBack();
	return this;
}

Path.prototype.toFront = function()
{
	this._path.toFront();
	return this;
}
Path.prototype.remove = function()
{
	this._path.remove();
	this.reset();
}

Path.prototype.contains = function(point)
{
	var bbox = this._path.getBBox();
	if(point.x > bbox.x
		&& point.x < bbox.x + bbox.width
		&& point.y > bbox.y
		&& point.y < bbox.y + bbox.height)
		return true;
	return false;
}


function circle(paper, r)
{
	var c = new Path(paper);
	var r_half = r * 0.5522847498;
	var r_double = r * 2;
	c.moveTo(r, 0);
	c.cubicTo(r + r_half, 0, r_double, r - r_half, r_double, r);
	c.cubicTo(r_double, r + r_half, r + r_half, r_double, r, r_double);
	c.cubicTo(r - r_half, r_double,0, r + r_half, 0, r);
	c.cubicTo(0, r - r_half, r - r_half, 0, r, 0);
	
	return c;
}


function lineConnect(paper, jqelem, x, y)
{
	var e = jqelem;
	var o = e.offset();
	var sx = o.left + Math.floor(e.width() / 2);
	var sy = o.top + Math.floor(e.height() / 2);
// 	var l = new Path();
	var lc = new Path(paper).moveTo(sx,sy).lineTo(x,y).draw();
	return lc;
}

function line(paper, p0, p1)
{
	var l = new Path(paper);
	l.moveTo(p0.x,p0.y).lineTo(p1.x,p1.y).draw();
	return l;
}


var svgHeight = 1862;
var svgWidth = 2160;

var tmenu_duration = 'slow';
function mapClick()
{
	jQuery('.menu_item_active').click();
}
function toggleMenu()
{
	jQuery('.site_menu_item').removeClass('menu_item_active');
	jQuery('#carte').unbind('click', mapClick);
	
	toggleNews(true);
	
	var that = jQuery(this);
	var menu = jQuery('#menu_index');
	var id = that.attr('id');
	var callerType = id.split('_').pop();
	if(menu.hasClass('menu_closed'))
	{
		if(menu.hasClass('menu_' + callerType))
		{
			menu.slideDown(tmenu_duration);
			menu.removeClass('menu_closed');
		}
		else
		{
			menu.removeClass();
			menu.load(rootUrl + callerType,
			function()
			{
				menu.slideDown(tmenu_duration);
				menu.addClass('menu_' + callerType);
				
			});
		}
		that.addClass('menu_item_active');
		jQuery('#carte').bind('click', mapClick);
	}
	else
	{
		if(menu.hasClass('menu_' + callerType))
		{
			menu.slideUp(tmenu_duration);
			menu.addClass('menu_closed');
		}
		else
		{
			that.addClass('menu_item_active');
			menu.removeClass();
			menu.load(rootUrl + callerType,
				  function()
				  {
// 					  menu.slideDown('slow');
					  menu.addClass('menu_' + callerType);
			
				  });
			jQuery('#carte').bind('click', mapClick);
		}
	}
	return false;
}


function follow(e)
{
	var c = e.children();
	c.each(function()
	{
		follow(jQuery(this));
	});
}

function svgloadComplete(id, maxid)
{
	if(id == maxid)
		follow(jQuery(document));
}


function toggleSats()
{
	var visible = undefined;
	if(jQuery('.visible_loc_obj').length > 0)
		visible = jQuery('.visible_loc_obj').first();
	
	jQuery('.located_object').hide();
	
	var that = jQuery(this);
	var t = undefined;
	var types = new Array('artist','event','organization');
	for(var i = 0; i < types.length; i++)
	{
		var tt = types[i];
		if(that.hasClass('type_' + tt))
		{
			t = tt;
			break;
		}
	}
	if(t != undefined)
	{
		var lo = jQuery('#located_object_' + t);
		if(visible != undefined)
		{
			visible.hide();
			visible.removeClass('visible_loc_obj');
			if(visible.attr('id') != lo.attr('id'))
			{
				lo.addClass('visible_loc_obj');
				lo.show();
			}
		}
		else
		{
			lo.show();
			lo.addClass('visible_loc_obj');
		}
		
		
	}
}


function paginateMenu()
{
// 	jQuery('.page').hide();
// 	jQuery('#menu_page_0').show();
	jQuery('.menu_page_prev').live('click',function()
	{
		var that = jQuery(this);
		var parent = that.parent().parent();
		var target = parent.prev();
		
		parent.hide();
		target.show();
	})
	jQuery('.menu_page_next').live('click',function()
	{
		var that = jQuery(this);
		var parent = that.parent().parent();
		var target = parent.next();
		
		parent.hide();
		target.show();
	})
}

function collides(obj, objList)
{
	for(var i = 0; i < objList.length; i++)
	{
		if(obj.intersects(objList[i]))
			return true;
	}
	return false;
}

function drawCursorLine(x)
{
// 	return;
	if(theCursorLine.line != undefined)
	{
		theCursorLine.line.remove();
		theCursorLine.triangle.remove();
	}
	var W = jQuery(window);
	var slidX = x;
	var slidY = jQuery("#menu_item").outerHeight() + jQuery("#menu_item").offset().top;
	theCursorLine.line = line(raph, new Point(slidX, W.height()), new Point(slidX, slidY));
	var tc = 20;
	var tc1 = 10;
	var triangle = new Path(raph);
	triangle.moveTo(slidX + (tc1 /2), slidY)
	.lineTo(slidX, slidY + tc1)
	.lineTo(slidX - (tc1 /2), slidY)
	.close()
	.fill(new Color(0,0,0).toString())
	.draw();
	theCursorLine.triangle = new Path(raph);
	theCursorLine.triangle.moveTo(slidX + (tc /2), W.height())
	.lineTo(slidX, W.height() - tc)
	.lineTo(slidX - (tc /2), W.height())
	.close()
	.fill(new Color(0,0,0).toString())
	.draw();
	
	
	
	
}

function toggleNews(inst)
{
	var n = jQuery('#newsContent');
	var mn = jQuery('#menu_item_news');
	if(inst.hasOwnProperty('type') && inst.type == 'click')
		inst = n.is(':visible');
// 	alert(parseInt(mn.css('padding-left')));
	if(inst)
	{
// 		n.hide();
		n.slideUp(tmenu_duration);
		mn.removeClass('news-active');
	}
	else
	{
		jQuery('.menu_item_active').click();
		//n.show();
		n.slideDown(tmenu_duration);
// 		n.css({ 
// 			position : 'fixed',
// 			left : (mn.offset().left) + "px" ,
// 			top: (mn.offset().top + mn.outerHeight()) + "px" 
// 		});
		mn.addClass('news-active');
	}
}

var curCityPoint = undefined;
var countryCode = '';

var bscale = 1;
var btransx = 0;
var btransy = 0;

function initMap(ttt)
{
	if(ttt == false)
		return;
	var ww = jQuery(window).width();
	var wh = jQuery(window).height();
	svgWidth = ww * 0.99;
	svgHeight = wh * 0.99;
	raph = Raphael(document.getElementById("carte"), svgWidth, svgHeight );
	var minimap_stroke = new Color(0x18,0x95,0x9A);//fc264a
	var minimap_fill = new Color(0x18,0x95,0x9A);
	var country_fill =  new Color(0xff,0xff,0xff);
	var country_stroke = new Color(0xFC,0x26,0x4A);//#18959a
	var cityColor = new Color(0xFC,0x26,0x4A);
	var white = new Color(255,255,255);
	
	bscale = wh * 20 / 1000;
	/*
	 -10 is ~ our most West longitude
	 -45 is ~ the latitude at which we wish to center the map
	W * s + x * s = T
	(W + x) * s = T
	W + x = T/s
	x = T/s - W
	*/
	var targetX = 500; // at the right of content_outer
	var targetY = wh * .7 // vertical center of the viewport
	
	btransx = (targetX / bscale) + 10;
	btransy = (targetY/ bscale) + 45;
	
	var scale = 4;
	var trh = ww * 0.85 * (1/scale);
	var trv = 330 * (1/scale);
	// draw circle
	// 	var c = circle(raph, 110);
	// 	c.stroke("red");
	// 	c.translate((ww * 0.8) + 20 , 20);
	// 	c.draw();
	var mframe = new Path(raph);
	// 	mframe.moveTo(ww * 0.8, 0).lineTo(ww * 0.8, wh * 0.3).lineTo(ww, wh * 0.3).lineTo(ww,0).close().stroke('transparent').fill(new Color(200,200,200).toString()).draw();
	var loc = window.location;
	
	var citySize = 4 / bscale;
	var surcitySize = 8 / bscale;
	var labelRects = new Array();
	var dCountries = new Array();
	var labelsElem = jQuery('#labels');
	var theCountry = '';
// 	var textureElem = null;
	for(var ci = 0; ci < locations.length ; ci++)
	{
		if(locations[ci].id == theCity)
		{
			theCountry = locations[ci].country;
			break;
		}
	}
	for(var ci = 0; ci < locations.length ; ci++)
	{
		var cloc = locations[ci];
		var city = new circle(raph, citySize);
		city.scale(bscale).translate(btransx + cloc.lon - (citySize ), btransy + cloc.lat - (citySize ));
		if(cloc.id == theCity)
		{
			city.stroke(minimap_fill.toString()).fill(minimap_fill.toString()).attr("stroke-width", 1 / bscale).draw();
			
			var surcity = new circle(raph, surcitySize);
			surcity.scale(bscale).translate(btransx + cloc.lon - (surcitySize ), btransy + cloc.lat - (surcitySize ));
			surcity.stroke(minimap_fill.toString()).attr("stroke-width", 2 / bscale).draw();
		}
		else
		{
			city.fill(white.toString()).stroke(cityColor.toString()).attr("stroke-width", 1 / bscale).draw();
		}
		var bb = city.bbox();
		var cityPoint = new Point(bb.x + (bb.width / 2), bb.y + (bb.height / 2));
		var CurCityClass = "";
		var cityZIndex = 'z-index:100;';
		if(cloc.id == theCity)
		{
			curCityPoint = cityPoint;
			countryCode = cloc.country;
			// Draw current country (large)
			jQuery.get(templateUrl + "svg_path.php", { id: cloc.country },
				   function(data)
				   {
					var curCountryData = json_parse(data);
					var curCountryPath = new Path(raph, curCountryData.p);
					curCountryPath.scale(bscale)
					.translate(btransx, btransy)
					.stroke('transparent')
					.fill(country_stroke.toString())
					.draw().toBack();
			
					curCountryPath.simplify();
					
					// Insert texture;
					var ctx =  curCityPoint.x ;
					var cty =  0 ;
					var iW = ww ;
					var iH = wh;
					
// 					textureElem = raph.image(templateUrl 
// 					+'texture/texture.php?'
// 					+'cx='+  Math.floor(curCityPoint.x / 10) * Math.floor(curCityPoint.x / 10)
// 					+'&cy='+ Math.floor(curCityPoint.y / 7) * Math.floor(curCityPoint.y / 7)
// 					+'&w='+  Math.floor(iW)
// 					+'&h='+  Math.floor(iH)
// 					, 0, cty, iW, iH).toBack();
					var cityImgURL = templateUrl 
					+'texture/texture.php?'
					+'cx='+  Math.floor(curCityPoint.x / 10) * Math.floor(curCityPoint.x / 10)
					+'&cy='+ Math.floor(curCityPoint.y / 7) * Math.floor(curCityPoint.y / 7)
					+'&w='+  Math.floor(iW)
					+'&h='+  Math.floor(iH);
					jQuery('#texture').css('background-image', 'url("'+cityImgURL+'")');
			
				   });
				   CurCityClass = " city_current";
				   drawCursorLine(cityPoint.x);
				   
				   cityZIndex = 'z-index:200;';
		}
		
		var labX = Math.floor(cityPoint.x /*+ bb.width*/);
		var labY = Math.floor(cityPoint.y /*+ bb.height*/);
		var citylink = jQuery('<div class="city_label' + CurCityClass +'" style="position:absolute;top:' + labY +'px;left:' + labX +'px;'+ cityZIndex +'"><a href="' + cloc.url +'">' + cloc.name +'</a></div>');
		labelsElem.append(citylink);
		var labelRect = new Rect(labX, labY , citylink.width() , citylink.height()/*citylink.outerWidth() , citylink.outerHeight()*/ );
		{
			var r = 0;
			var t = 0;
			var x = 0;
			var y = 0;
			while(collides(labelRect, labelRects))
			{
				if(t == -400)
					t = 0;
				else
					t -= 10;
				r += 1;
				x = Math.floor(r * Math.cos(t));
				y = Math.floor(r * Math.sin(t));
				labelRect.move(labX + x, labY + y);
			}
		}
		if(labX != labelRect.left() || labY != labelRect.top())
		{
			citylink.animate({ top: labelRect.top(), left: labelRect.left() }, 1500);
		}
		labelRects.push(labelRect);
		
		
		if(dCountries.indexOf(cloc.country) < 0  && cloc.country != theCountry)
		{
			dCountries.push(cloc.country);
			
			/*** Served version */
			jQuery.get(templateUrl + "svg_path.php", { id: cloc.country },
				function(data)
				{
					var countryData = json_parse(data);
					if(countryData.status == 0)
					{
						var countryPath = new Path(raph, countryData.p);
						countryPath.scale(bscale)
						.translate(btransx , btransy)
						.stroke(minimap_stroke.toString())
						.fill(country_fill.toString())
						.attr("stroke-width", 1 / bscale)
						.toBack().draw();
						
// 						if(textureElem)
// 							textureElem.toBack();
					}
				});
			
			/***  Static version
			countryPath = new Path(raph, countries[cloc.country]);
			countryPath.scale(bscale)
			.translate(btransx , btransy)
			.stroke(minimap_stroke.toString())
			.attr("stroke-width", "0.2")
			.draw();
			*/
		}
	}
	jQuery(window).resize(function() 
	{
		drawCursorLine(curCityPoint.x);
	});
// 	textureElem.toBack();
}

function timelinePrev()
{
	var tl = jQuery('#timeline1');
	var tlWidth = tl.width();
	var tb = jQuery('#timeline_table');
	tb.css('position', 'relative');
	var xOffset = tb.offset().left - tl.offset().left;
	var tbWidth = tb.width();
	var limit = 0 ;
	if(xOffset >=  limit)
	{
		return;
	}
	var newOffset = Math.min(limit , xOffset + tlWidth);
	if(newOffset ==  limit)
	{
		jQuery('#timeline-nav-prev').addClass('inactive_nav');
	}
	jQuery('#timeline-nav-next').removeClass('inactive_nav');
// 	tb.css('left', newOffset+'px');
	tb.animate({ left: xOffset, left: newOffset }, 1000);
}
function timelineNext()
{
	var tl = jQuery('#timeline1');
	var tlWidth = tl.width();
	var tb = jQuery('#timeline_table');
	tb.css('position', 'relative');
	var xOffset = tb.offset().left - tl.offset().left;
	var tbWidth = tb.width();
	var limit = tlWidth - tbWidth ;
	if(xOffset <=  limit)
	{
		return
	}
	var newOffset = Math.max(limit , xOffset - tlWidth);
	if(newOffset ==  limit)
	{
		jQuery('#timeline-nav-next').addClass('inactive_nav');
	}
	jQuery('#timeline-nav-prev').removeClass('inactive_nav');
// 	tb.css('left', newOffset+'px');
	tb.animate({ left: xOffset, left: newOffset }, 1000);
}

function initSOE()
{
	initMediaPlayer();
	jQuery('#sow_media_player').bind(jQuery.jPlayer.event.play, function(event)
	{
		jQuery('#sow_media_player').bind(jQuery.jPlayer.event.timeupdate, function(event)
		{
			trackTrack = event.jPlayer.status.currentTime;
			jQuery.ajax({
				type: 'POST',
		url: templateUrl + 'tracktrack.php',
		data: { tt : trackTrack, tp: 0 },
		async : false
			});
		});
	});

	jQuery('#sow_media_player').bind(jQuery.jPlayer.event.pause, function(event)
	{
		jQuery('#sow_media_player').unbind(jQuery.jPlayer.event.timeupdate);
		trackTrack = event.jPlayer.status.currentTime;
		trackPaused = 1;
		jQuery.ajax({
			type: 'POST',
	      url: templateUrl + 'tracktrack.php',
	      data: { tt : trackTrack, tp: trackPaused},
	      async : false
		});
	});
	initMap(doMap);

	/// Menu
	var menuIndex = jQuery('#menu_index');
	menuIndex.hide();
	jQuery('#menu_item span.site_menu_item').click(toggleMenu);
	if(!jQuery('#menu_item_news').hasClass('news-active'))
		jQuery('#newsContent').hide();
	jQuery('#menu_item_news').click(toggleNews);
	paginateMenu();
	
	jQuery('#timeline-nav-prev').live('click',timelinePrev);
	jQuery('#timeline-nav-next').live('click',timelineNext);

}


jQuery(document).ready(initSOE);
// jQuery(window).unload(
// 	function () 
// 	{ 
// // 		alert('TT = '+trackTrack);
// 		jQuery.ajax({
// 			type: 'POST',
// 			url: templateUrl + 'tracktrack.php',
// 			data: { tt : trackTrack},
// 			async : false
// 			});
// 		
// 	} );
