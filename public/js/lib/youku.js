var log = console.log.bind(console);

var canPlayM3U8 = (function(){
	return !!document.createElement('video').canPlayType('application/x-mpegURL') && 
	navigator.userAgent.indexOf('PlayStation') === -1;
})();

function match(url) {
	return /v\.youku\.com/.test(url.attr('host')) && !!window.videoId
}

function createElement (tagName, attributes) {
	var element = document.createElement(tagName)
	if ( typeof attributes === 'function' ) {
		attributes.call(element)
	} else {
		for (var attribute in attributes) {
			if ( attributes.hasOwnProperty(attribute) ) {
				switch (attribute) {
				case 'appendTo':
					attributes[attribute].appendChild(element)
					break
				case 'innerHTML':
				case 'className':
				case 'id':
					element[attribute] = attributes[attribute]
					break
				case 'style':
					var styles = attributes[attribute]
					for (var name in styles)
						if ( styles.hasOwnProperty(name) )
							element.style[name] = styles[name]
					break
				default:
					element.setAttribute(attribute, attributes[attribute] + '')
				}
			}
		}
	}
	return element
}

function noop(){}
var callbackPrefix = 'MAMA2_HTTP_JSONP_CALLBACK'
var callbackCount  = 0
var timeoutDelay   = 10000

function callbackHandle () {
	return callbackPrefix + callbackCount++
}

function jsonp (url, callback, callbackKey) {

	callbackKey = callbackKey || 'callback'

	var _callbackHandle = callbackHandle()	
	window[_callbackHandle] = function (rs) {
		clearTimeout(timeoutTimer)
		window[_callbackHandle] = noop
		callback(rs)
		document.body.removeChild(script)
	}
	var timeoutTimer = setTimeout(function () {
		window[_callbackHandle](-1)
	}, timeoutDelay)

	var script = createElement('script', {
		appendTo: document.body,
		src: url + (url.indexOf('?') >= 0 ? '&' : '?') + callbackKey + '=' + _callbackHandle
	})
}


function queryString (obj) {
	var query = []
	for (one in obj) {
		if (obj.hasOwnProperty(one)) {
			query.push([one, obj[one]].join('='))
		}
	}
	return query.join('&')
}

function defalutOption (option, defalutValue) {
	return option === undefined ? defalutValue : option
}

function queryString (obj) {
	var query = []
	for (one in obj) {
		if (obj.hasOwnProperty(one)) {
			query.push([one, obj[one]].join('='))
		}
	}
	return query.join('&')
}

function joinUrl (url, queryString) {
	return url + (url.indexOf('?') ? '?' : '&') + queryString
}

function ajax (options) {
	var url         = defalutOption(options.url, '')
	var query       = queryString( defalutOption(options.param, {}) )
	var method      = defalutOption(options.method, 'GET')
	var callback    = defalutOption(options.callback, noop)
	var contentType = defalutOption(options.contentType, 'json')
	var context     = defalutOption(options.context, null)

	if (options.jsonp) {
		return jsonp(
			joinUrl(url, query),
			callback.bind(context),
			typeof options.jsonp === 'string' ? options.jsonp : undefined
		)
	}

	var xhr = new XMLHttpRequest()
	if (method === 'get') {
		url = joinUrl(url, query)
		query = ''
	}
	xhr.open(method, url, true)
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
	xhr.send(query)
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 ) {
			if (xhr.status === 200) {
				var data = request.responseText
				if (contentType.toLowerCase() === 'json') {
					try {
						data = JSON.parse(data)
					} catch(e) {
						data = -1
					}					
				}
				return callback.call(context, data)
			} else {
				return callback.call(context, -1)
			}
		}
	}
}
var parseYoukuCode = function (_id, callback) {
	log('开始解析youku视频地址')	
	var mk_a3 = 'b4et';
	var mk_a4 = 'boa4';
	var userCache_a1 = '4';
	var userCache_a2 = '1';
	var rs;
	var sid;
	var token;

	function na(a) {
		if (!a) return "";
		var a = a.toString(),
			c, b, f, i, e, h = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27,
				28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
			];
		i = a.length;
		f = 0;
		for (e = ""; f < i;) {
			do c = h[a.charCodeAt(f++) & 255]; while (f < i && -1 == c);
			if (-1 == c) break;
			do b = h[a.charCodeAt(f++) & 255]; while (f < i && -1 == b);
			if (-1 == b) break;
			e += String.fromCharCode(c << 2 | (b & 48) >> 4);
			do {
				c = a.charCodeAt(f++) & 255;
				if (61 == c) return e;
				c = h[c]
			} while (f < i && -1 == c);
			if (-1 == c) break;
			e += String.fromCharCode((b & 15) << 4 | (c & 60) >> 2);
			do {
				b = a.charCodeAt(f++) & 255;
				if (61 == b) return e;
				b = h[b]
			} while (f < i && -1 == b);
			if (-1 == b) break;
			e += String.fromCharCode((c &
				3) << 6 | b)
		}
		return e
	}

	function D(a) {
		if (!a) return "";
		var a = a.toString(),
			c, b, f, e, g, h;
		f = a.length;
		b = 0;
		for (c = ""; b < f;) {
			e = a.charCodeAt(b++) & 255;
			if (b == f) {
				c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(e >> 2);
				c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt((e & 3) << 4);
				c += "==";
				break
			}
			g = a.charCodeAt(b++);
			if (b == f) {
				c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(e >> 2);
				c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt((e & 3) << 4 | (g & 240) >> 4);
				c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt((g &
					15) << 2);
				c += "=";
				break
			}
			h = a.charCodeAt(b++);
			c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(e >> 2);
			c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt((e & 3) << 4 | (g & 240) >> 4);
			c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt((g & 15) << 2 | (h & 192) >> 6);
			c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(h & 63)
		}
		return c
	}

	function E(a, c) {
		for (var b = [], f = 0, i, e = "", h = 0; 256 > h; h++) b[h] = h;
		for (h = 0; 256 > h; h++) f = (f + b[h] + a.charCodeAt(h % a.length)) % 256, i = b[h], b[h] = b[f], b[f] = i;
		for (var q = f = h = 0; q < c.length; q++) h = (h + 1) % 256, f = (f + b[h]) % 256, i = b[h], b[h] = b[f], b[f] = i, e += String.fromCharCode(c.charCodeAt(q) ^ b[(b[h] + b[f]) % 256]);
		return e
	}

	function F(a, c) {
		for (var b = [], f = 0; f < a.length; f++) {
			for (var i = 0, i = "a" <= a[f] && "z" >= a[f] ? a[f].charCodeAt(0) - 97 : a[f] - 0 + 26, e = 0; 36 > e; e++)
				if (c[e] == i) {
					i = e;
					break
				}
			b[f] = 25 < i ? i - 26 : String.fromCharCode(i + 97)
		}
		return b.join("")
	}
	function T (a, c) {
		this._sid = sid;
		this._seed = a.seed;
		this._fileType = c;
		var b = new U(this._seed);
		this._streamFileIds = a.streamfileids;
		this._videoSegsDic = {};
		for (c in a.segs) {		
			for (var f = [], i = 0, g = 0; g < a.segs[c].length; g++) {
				var h = a.segs[c][g],
					q = {};
				q.no = h.no;
				q.size = h.size;
				q.seconds = h.seconds;
				h.k && (q.key = h.k);
				q.fileId = this.getFileId(a.streamfileids, c, parseInt(g), b);
				q.type = c;
				q.src = this.getVideoSrc(h.no, a, c, q.fileId);
				f[i++] = q
			}
			this._videoSegsDic[c] = f
		}	
	}

	function U (a) {
		this._randomSeed = a;
		this.cg_hun();
	};
	U.prototype = {
		cg_hun: function() {
			this._cgStr = "";
			for (var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/\\:._-1234567890", c = a.length, b = 0; b < c; b++) {
				var f = parseInt(this.ran() * a.length);
				this._cgStr += a.charAt(f);
				a = a.split(a.charAt(f)).join("")
			}
		},
		cg_fun: function(a) {
			for (var a = a.split("*"), c = "", b = 0; b < a.length - 1; b++) c += this._cgStr.charAt(a[b]);
			return c
		},
		ran: function() {
			this._randomSeed = (211 * this._randomSeed +
				30031) % 65536;
			return this._randomSeed / 65536
		}
	};
	T.prototype = {
		getFileId: function(a, c, b, f) {
			for (var i in a)
				if (i == c) {
					streamFid = a[i];
					break
				}
			if ("" == streamFid) return "";
			c = f.cg_fun(streamFid);
			a = c.slice(0, 8);
			b = b.toString(16);
			1 == b.length && (b = "0" + b);
			b = b.toUpperCase();
			c = c.slice(10, c.length);
			return a + b + c
		},
		getVideoSrc: function(a, c, d, f, i, g) {
			if (!c.videoid || !d) return "";
			var h = {
				flv: 0,
				flvhd: 0,
				mp4: 1,
				hd2: 2,
				"3gphd": 1,
				"3gp": 0
			}[d],
				q = {
					flv: "flv",
					mp4: "mp4",
					hd2: "flv",
					"3gphd": "mp4",
					"3gp": "flv"
				}[d],
				k = a.toString(16);
			1 == k.length && (k =
				"0" + k);
			var l = c.segs[d][a].seconds,
				a = c.segs[d][a].k;
			if ("" == a || -1 == a) a = c.key2 + c.key1;
			d = "";
			c.show && (d = c.show.show_paid ? "&ypremium=1" : "&ymovie=1");
			c = "/player/getFlvPath/sid/" + sid + "_" + k + "/st/" + q + "/fileid/" + f + "?K=" + a + "&hd=" + h + "&myp=0&ts=" + l + "&ypp=0" + d;
			f = encodeURIComponent(D(E(F(mk_a4 + "poz" + userCache_a2, [19, 1, 4, 7, 30, 14, 28, 8, 24, 17, 6, 35, 34, 16, 9, 10, 13, 22, 32, 29, 31, 21, 18, 3, 2, 23, 25, 27, 11, 20, 5, 15, 12, 0, 33, 26]).toString(), sid + "_" + f + "_" + token)));
			c = c + ("&ep=" + f) + "&ctype=12&ev=1" + ("&token=" + token);
			c += "&oip=" + rs.data[0].ip;
			return "//k.youku.com" + (c + ((i ? "/password/" + i : "") + (g ? g : "")))
		}
	};
	_id = 'XMzA3OTM5ODExMg';
	ajax({
		url: '//v.youku.com/player/getPlaylist/VideoIDS/' + _id + '/Pf/4/ctype/12/ev/1',
		jsonp: '__callback',
		callback: function (param) {
			if(param == -1) {
				log('解析youku视频地址失败', 2)
			}
			rs = param;
			var a = param.data[0],
				c = E(F(mk_a3 + "o0b" + userCache_a1, [19, 1, 4, 7, 30, 14, 28, 8, 24,
					17, 6, 35, 34, 16, 9, 10, 13, 22, 32, 29, 31, 21, 18, 3, 2, 23, 25, 27, 11, 20, 5, 15, 12, 0, 33, 26
				]).toString(), na(a.ep));
			c     = c.split("_");
			sid   = c[0];
			token = c[1];
			if ( canPlayM3U8 ) {
				var ep  = encodeURIComponent(D(E(F(mk_a4 + "poz" + userCache_a2, [19, 1, 4, 7, 30, 14, 28, 8, 24, 17, 6, 35, 34, 16, 9, 10, 13, 22, 32, 29, 31, 21, 18, 3, 2, 23, 25, 27, 11, 20, 5, 15, 12, 0, 33, 26]).toString(), sid + "_" + _id + "_" + token)));
				var oip = a.ip;
				var source = [
					['超清', '//pl.youku.com/playlist/m3u8?vid='+_id+'&type=hd2&ctype=12&keyframe=1&ep='+ep+'&sid='+sid+'&token='+token+'&ev=1&oip='+oip],
					['高清', '//pl.youku.com/playlist/m3u8?vid='+_id+'&type=mp4&ctype=12&keyframe=1&ep='+ep+'&sid='+sid+'&token='+token+'&ev=1&oip='+oip],
					['标清', '//pl.youku.com/playlist/m3u8?vid='+_id+'&type=flv&ctype=12&keyframe=1&ep='+ep+'&sid='+sid+'&token='+token+'&ev=1&oip='+oip]
				];
				log('解析youku视频地址成功 ' + source.map(function (item) {return '<a href='+item[1]+'>'+item[0]+'</a>'}).join(' '), 2)

				callback(source);
			} else {
				var t = new T(a);
				var source = [
					['标清', t._videoSegsDic['3gphd'][0].src]
				];
				log('解析youku视频地址成功 ' + source.map(function (item) {return '<a href='+item[1]+'>'+item[0]+'</a>'}).join(' '), 2)
				callback(source);
			}
		}
	})
}

