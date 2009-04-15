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
var gPatternColorDialog = {
    onLoad : function() {
        try {
            if (window.arguments[0]) {
                this.info = window.arguments[0];
            } else {
                this.info = {};
                this.info.patternInfo = { cssStyle : "", patterns : ""};
            }

            this.initControls();
        } catch (err) {
            alert(err);
        }
        sizeToContent();
    },

    initControls : function() {
        this.widgets = {};

        this.widgets.colorSchemeList = document.getElementById("color-scheme-list");
        this.widgets.forePicker = document.getElementById("fore-picker");
        this.widgets.backPicker = document.getElementById("back-picker");
        this.widgets.filePattern = document.getElementById("file-pattern");
        this.widgets.cssBlock = document.getElementById("css-block");
        this.widgets.langList = document.getElementById("langList");

        this.dialog = document.documentElement;

        this.initValues();
    },

    initValues : function() {
        if (this.info.patternInfo.cssStyle) {
            this.widgets.cssBlock.value = this.info.patternInfo.cssStyle;
            this.updateColorPickers(extensions.dafizilla.tabcolor.tabUtils
                .getCssProperties(this.widgets.cssBlock.value));
        } else {
            this.updateSelectedColor(document.getElementById("predefined01"));
        }
        if (this.info.patternInfo.patterns) {
            this.widgets.filePattern.value = this.info.patternInfo.patterns;
        }

        // Add an empty menuitem on langList so user must choose
        // an item to append the extensions
        var menuitem = document.createElement("menuitem");
        menuitem.setAttribute("label", "");
        var list = document.getAnonymousNodes(this.widgets.langList)[0].firstChild;
        list.insertBefore(menuitem, list.firstChild);
        list.parentNode.selectedIndex = 0;

        this.updateAccept();
    },

    updateSelectedColor : function(menuitem) {
        var color = this.getSelectedColor(menuitem);
        this.updateColorPickers(color);
        this.rebuildCssStyle();
        this.widgets.filePattern.focus();
    },

    getSelectedColor : function(menuitem) {
        var style = menuitem.ownerDocument.defaultView.getComputedStyle(menuitem, null);
        return { "background-color" : style.getPropertyValue("background-color"),
                "color" : style.getPropertyValue("color")};
    },

    updateColorPickers : function(properties) {
        this.widgets.forePicker.color = properties["color"];
        this.widgets.backPicker.color = properties["background-color"];
    },

    onInputFilePattern : function () {
        this.updateAccept();
    },

    rebuildCssStyle : function() {
        var properties = extensions.dafizilla.tabcolor.tabUtils
            .getCssProperties(this.widgets.cssBlock.value);
        properties["color"] = this.widgets.forePicker.color;
        properties["background-color"] = this.widgets.backPicker.color;

        // add border if not present
        var reBorder = /border.*/;
        var addBorder = true;
        for (var i in properties) {
            if (reBorder.test(i)) {
                addBorder = false;
                break;
            }
        }
        if (addBorder) {
            properties["border"] = "1px solid #000 !important";
        }

        this.widgets.cssBlock.value = extensions.dafizilla.tabcolor.tabUtils
            .cssTextFromProperties(properties);
    },

    updateAccept : function() {
        if (this.widgets.filePattern.value == "") {
            this.dialog.getButton("accept").disabled = true;
        } else {
            this.dialog.getButton("accept").disabled = false;
        }
    },

    onAccept : function() {
        this.info.patternInfo.cssStyle = this.widgets.cssBlock.value;
        this.info.patternInfo.patterns = this.widgets.filePattern.value;
        this.info.isOk = true;

        return true;
    },

    onAppendExtensions : function(language) {
        var langService = Components
            .classes["@activestate.com/koLanguageRegistryService;1"]
            .getService(Components.interfaces.koILanguageRegistryService);

        var patterns = {};
        var count = {};
        langService.patternsFromLanguageName(language, patterns, count);
        patterns = patterns.value;
        count = count.value;

        if (count == 0) {
            return;
        }
        var currPattern = this.widgets.filePattern.value;
        var extArr = [];

        if (currPattern != "") {
            extArr.push(currPattern.replace(/;*$/, ""));
        }

        for (var i = 0; i < count; i++) {
            extArr.push(patterns[i]);
        }

        this.widgets.filePattern.value = extArr.join(";");
        this.updateAccept();
        this.widgets.filePattern.focus();
    }
}
