/*jshint browser: true, node: true
*/

(function (exports) {
    'use strict';

  // 判断是否支持Array.isArray(),如果不支持，就定义一个Array.isArray()方法
  if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

  /**
   * 获取浏览器信息
   * @param {string} ua - ua信息
   * @returns {{}}
   */
  function checkUserAgent(ua) {
        var browser = {};
        var match = /(dolfin)[ \/]([\w.]+)/.exec( ua ) ||
                /(edge)[ \/]([\w.]+)/.exec( ua ) ||
                /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
                /(tizen)[ \/]([\w.]+)/.exec( ua ) ||
                /(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
                /(webkit)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
                /(msie) ([\w.]+)/.exec( ua ) ||
                ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) ||
                ["","unknown"];
        if (match[1] === "webkit") {
            match = /(iphone|ipad|ipod)[\S\s]*os ([\w._\-]+) like/.exec(ua) ||
                /(android)[ \/]([\w._\-]+);/.exec(ua) || [match[0], "safari", match[2]];
        } else if (match[1] === "mozilla") {
            if (/trident/.test(ua)) {
                match[1] = "msie";
            } else {
                match[1] = "firefox";
            }
        } else if (/polaris|natebrowser|([010|011|016|017|018|019]{3}\d{3,4}\d{4}$)/.test(ua)) {
            match[1] = "polaris";
        }

        browser[match[1]] = true;
        browser.name = match[1];
        browser.version = setVersion(match[2]);

        return browser;
    }

  /**
   * 格式化version
   * @param {string} versionString - 版本号
   * @returns {{}}
   */
    function setVersion(versionString) {
        var version = {};

        var versions = versionString ? versionString.split(/\.|-|_/) : ["0","0","0"];
        version.info = versions.join(".");
        version.major = versions[0] || "0";
        version.minor = versions[1] || "0";
        version.patch = versions[2] || "0";

        return version;
    }

  /**
   * 核对平台
   * @param {string} ua - useragent
   * @returns {*}
   */
    function checkPlatform (ua) {
        if (isPc(ua)) {
            return "pc";
        } else if (isTablet(ua)) {
            return "tablet";
        } else if (isMobile(ua)) {
            return "mobile";
        } else {
            return "";
        }
    }

  /**
   * 判断是不是PC
   * @param ua
   * @returns {boolean}
   */
  function isPc (ua) {
        if (ua.match(/linux|windows (nt|98)|macintosh|cros/) && !ua.match(/android|mobile|polaris|lgtelecom|uzard|natebrowser|ktf;|skt;/)) {
            return true;
        }
        return false;
    }

  /**
   * 判断是不是pad
   * @param ua
   * @returns {boolean}
   */
  function isTablet (ua) {
        if (ua.match(/ipad/) || (ua.match(/android/) && !ua.match(/mobi|mini|fennec/))) {
            return true;
        }
        return false;
    }

  /**
   * 判断是不是手机
   * @param ua
   * @returns {boolean}
   */
  function isMobile (ua) {
        if (!!ua.match(/ip(hone|od)|android.+mobile|windows (ce|phone)|blackberry|bb10|symbian|webos|firefox.+fennec|opera m(ob|in)i|tizen.+mobile|polaris|iemobile|lgtelecom|nokia|sonyericsson|dolfin|uzard|natebrowser|ktf;|skt;/)) {
            return true;
        } else {
            return false;
        }
    }

  /**
   * 核对操作系统
   * @param {string} ua -useragent
   * @returns {{}}
   */
    function checkOs (ua) {
        var os = {},
            match = /(iphone|ipad|ipod)[\S\s]*os ([\w._\-]+) like/.exec(ua) ||
                    (/polaris|natebrowser|([010|011|016|017|018|019]{3}\d{3,4}\d{4}$)/.test(ua)? ["", "polaris", "0.0.0"] : false) ||
                    /(windows)(?: nt | phone(?: os){0,1} | )([\w._\-]+)/.exec(ua) ||
                    /(android)[ \/]([\w._\-]+);/.exec(ua) ||
                    (/android/.test(ua)? ["", "android", "0.0.0"] : false) ||
                    (/(windows)/.test(ua)? ["", "windows", "0.0.0"] : false) ||
                    /(mac) os x ([\w._\-]+)/.exec(ua) ||
                    /(tizen)[ \/]([\w._\-]+);/.exec(ua) ||
                    (/(linux)/.test(ua)? ["", "linux", "0.0.0"] : false) ||
                    (/webos/.test(ua)? ["", "webos", "0.0.0"] : false) ||
                    /(cros)(?:\s[\w]+\s)([\d._\-]+)/.exec(ua) ||
                    /(bada)[ \/]([\w._\-]+)/.exec(ua) ||
                    (/bada/.test(ua)? ["", "bada", "0.0.0"] : false) ||
                    (/(rim|blackberry|bb10)/.test(ua)? ["", "blackberry", "0.0.0"] : false) ||
                    ["", "unknown", "0.0.0"];

        if (match[1] === "iphone" || match[1] === "ipad" || match[1] === "ipod") {
            match[1] = "ios";
        } else if (match[1] === "windows" && match[2] === "98") {
            match[2] = "0.98.0";
        }
        if (match[1] === 'cros') {
            match[1] = "chrome";
        }
        os[match[1]] = true;
        os.name = match[1];
        os.version = setVersion(match[2]);
        return os;
    }

    var baseAppList = ['crios', 'fxios', 'daumapps'];


  /**
   * 核对app信息
   * @param {string} ua - useragent
   * @param {string|array} customAppList - app列表
   * @returns {{}}
   */
    function checkApp (ua, customAppList) {
        var app = {},
            match = null,
            checkAppList = baseAppList;

        if (Array.isArray(customAppList)) {
            checkAppList = baseAppList.concat(customAppList);  
        } else if (typeof customAppList === 'string') {
            checkAppList = baseAppList.concat([customAppList]);
        }

        for(var i=0, len=checkAppList.length; i<len; i+=1) {
            var appname = checkAppList[i];
            var regex = new RegExp('('+ appname + ')[ \\/]([\\w._\\-]+)');
            match = regex.exec( ua );
            if (match) {
                break;
            }
        }

        if (!match) {
            match = ["",""];
        }

        if (match[1]) {
            app.isApp = true;
            app.name = match[1];
            app.version = setVersion(match[2]);
        } else {
            app.isApp = false;
        }

        return app;
    }

  /**
   * 获取ua信息，并且格式化为小写
   * @param ua
   * @returns {string}
   */
    function getLowerUserAgent(ua) {
        var lowerUa = '';
        if (!ua) {

            // 获取ua
            if (typeof window !== 'undefined' && window.navigator && typeof window.navigator.userAgent === 'string') {
                lowerUa = window.navigator.userAgent.toLowerCase();
            } else {
                lowerUa = '';
            }
        } else {
            lowerUa = ua.toLowerCase();
        }

        return lowerUa;
    }


  /**
   * 获取ua信息
   * @param {string} ua - ua信息
   * @type {userAgent}
   */
  var userAgent = exports.userAgent = function (ua, customAppList) {
        var lowerUa = getLowerUserAgent(ua);
        
        return {
            ua: lowerUa,
            browser: checkUserAgent(lowerUa),
            platform: checkPlatform(lowerUa),
            os: checkOs(lowerUa),
            app: checkApp(lowerUa, customAppList)
        };
    };

    if (typeof window === 'object' && window.navigator.userAgent) {
        window.ua_result = userAgent(window.navigator.userAgent) || null;
    }

})((function (){
    // Make userAgent a Node module, if possible.
    if (typeof exports === 'object') {
        exports.daumtools = exports;
        exports.util = exports;
        return exports;
    } else if (typeof window === 'object') {
        window.daumtools = (typeof window.daumtools === 'undefined') ? {} : window.daumtools;
        window.util = (typeof window.util === 'undefined') ? window.daumtools : window.util;
        return window.daumtools;
    } else if (typeof self === 'object') {
        // for use in web workers
        self.daumtools = (typeof self.daumtools === 'undefined') ? {} : self.daumtools;
        self.util = (typeof self.util === 'undefined') ? self.daumtools : self.util;
        return self;
    }
})());
