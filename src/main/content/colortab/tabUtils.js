/*
# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Initial Developer of the Original Code is
# Davide Ficano.
# Portions created by the Initial Developer are Copyright (C) 2009
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#   Davide Ficano <davide.ficano@gmail.com>
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****
*/
if (typeof(extensions) == 'undefined') {
    var extensions = {};
}

if (typeof(extensions.dafizilla) == 'undefined') {
    extensions.dafizilla = {};
}

if (typeof(extensions.dafizilla.tabcolor) == 'undefined') {
    extensions.dafizilla.tabcolor = {};
}

extensions.dafizilla.tabcolor.tabUtils = {};

(function() {
    _stylesInfo = null;
    commonUtils = extensions.dafizilla.tabcolor.commonUtils;
    stringUtils = extensions.dafizilla.tabcolor.stringUtils;

    // Contains cached info, the object prototype is
    // .cssStyle
    // .patternsRegExpr[]
    this._cachedInfoList = null;

    this.getCssProperties = function(cssText) {
        var m = cssText.match(/([a-z-]*)\s*:\s*([^;]*)/g);
        var cssStyle = {};

        if (m) {
            for (var i in m) {
                var properties = m[i].match(/([a-z-]*)\s*:\s*([^;]*)/);
                if (properties) {
                    cssStyle[stringUtils.trim(properties[1])] = stringUtils.trim(properties[2]);
                }
            }
        }
        
        return cssStyle;
    }
    
    this.cssTextFromProperties = function(properties) {
        var arr = [];
        
        for (i in properties) {
            arr.push(i + ": " + properties[i]);
        }
        return arr.join("; ") + ";";
    }
    
    function getStyle(str) {
        for (var i in this._cachedInfoList) {
            var info = this._cachedInfoList[i];
            
            for (var p in info.patternsRegExpr) {
                var re = info.patternsRegExpr[p];
                if (re.matches(str)) {
                    return info.cssStyle;
                }
            }
        }
        return null;
    }
    
    function buildStyle(styleInfo) {
        if (styleInfo.cssStyle == "") {
            return null;
        }
        var cssStyle = styleInfo.cssStyle;
        if (!/border/.test(cssStyle)) {
            cssStyle = "border:1px solid #000 !important; " + cssStyle;
        }
        
        return "-moz-appearance:none !important; " + cssStyle;
    }

    this.getConfigFile = function() {
        var file = commonUtils.getProfileDir();
        file.append("dafizilla");
        file.append("colortab.json");
        
        return file;
    }

    this.loadStylesInfo = function() {
        var str;
        var file = this.getConfigFile();
        
        if (file.exists()) {
            str = commonUtils.loadTextFile(file.path);
        } else {
            str = commonUtils
                .readHttpReq("chrome://colortab/content/colortab.json")
                .responseText;
            if (!file.parent.exists()) {
                file.parent.create(
                        Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
            }
            commonUtils.saveTextFile(file.path, str);
        }

        _stylesInfo = commonUtils.getJSON().parse(str);
        
        return _stylesInfo;
    }

    this.saveStylesInfo = function(stylesInfo) {
        var file = this.getConfigFile();
        var str = commonUtils.getJSON().stringify(stylesInfo);
        commonUtils.saveTextFile(file.path, str);
    }
    
    /**
     * create the reg expr array property and the final css to use
     */
    function createCachedInfo(stylesInfo) {
        this._cachedInfoList = [];

        for (var i in stylesInfo) {
            var styleInfo = stylesInfo[i];
            var cachedInfo = {};

            cachedInfo.cssStyle = buildStyle(styleInfo);
            if (cachedInfo.cssStyle) {
                cachedInfo.patternsRegExpr = [];
                var patterns = styleInfo.patterns.split(";");

                for (var p in patterns) {
                    if (patterns[p] != "") {
                        cachedInfo.patternsRegExpr.push(new stringUtils.PatternMatcher
                            .strategies.globCaseContains(patterns[p], false));
                    }
                }
                this._cachedInfoList.push(cachedInfo);
            }
        }
    }
    
    this.init = function() {
        this.loadStylesInfo();
        createCachedInfo(_stylesInfo.patternList);
    }
    
    this.setViewTabStyle = function(view) {
        if (!_stylesInfo.enabled) {
            return;
        }
        if (view && view.document && view.document.file) {
            var path = view.document.file.path;

            var style = getStyle(path);
            commonUtils.log(style);
            if (style) {
                var tab = view.parentNode._tab;
                tab.style.cssText = style;
            }
        }
    }
}).apply(extensions.dafizilla.tabcolor.tabUtils);
