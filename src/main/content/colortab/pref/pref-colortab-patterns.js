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
var widget = {};
var stylesInfo;
var patternList;

function OnPreferencePageOK(prefset) {
    stylesInfo.enabled = widget.enableColorTab.checked;
    extensions.dafizilla.tabcolor.tabUtils.saveStylesInfo(stylesInfo);
    var obs = extensions.dafizilla.tabcolor.commonUtils.getObserverService();
    obs.notifyObservers(null, "colortab_pref_changed", "");
    return true;
}

function OnPreferencePageInitalize(prefset) {
    widget.patternList = document.getElementById("pattern-list");
    widget.enableColorTab = document.getElementById("enable-color-tab");
}

function OnPreferencePageLoading(prefset) {
    stylesInfo = extensions.dafizilla.tabcolor.tabUtils.loadStylesInfo();

    widget.enableColorTab.checked = stylesInfo.enabled;

    patternList = stylesInfo.patternList;
    for (var i in patternList) {
        var pattern = patternList[i];

        var listitem = document.createElement("richlistitem");
        var label = document.createElement("label");
        label.setAttribute("value", pattern.patterns);
        label.setAttribute("style", pattern.cssStyle);
        label.setAttribute("flex", "1");
        listitem.appendChild(label);
        widget.patternList.appendChild(listitem);
    }
}

function colorTabOnLoad() {
    parent.hPrefWindow.onpageload();
}

function onDeletePattern() {
    var selIdx = widget.patternList.selectedIndex;
    if (selIdx < 0) {
        return;
    }
    patternList.splice(selIdx, 1);
    widget.patternList.removeItemAt(selIdx);

    if (patternList.length > 0) {
        widget.patternList.selectedIndex = patternList.length == selIdx ? selIdx - 1 : selIdx;
    } else {
        widget.patternList.selectedIndex = -1;
    }
}

function onAddPattern() {
    var info = { isOk : false, patternInfo : {} };
    window.openDialog('chrome://colortab/content/pref/pattern-dialog.xul',
                      '_blank',
                      'chrome,modal,titlebar,resizable,centerscreen', info);
    if (info.isOk) {

        patternList.push(info.patternInfo);
        var listitem = document.createElement("richlistitem");
        var label = document.createElement("label");
        label.setAttribute("value", info.patternInfo.patterns);
        label.setAttribute("style", info.patternInfo.cssStyle);
        label.setAttribute("flex", "1");
        listitem.appendChild(label);
        widget.patternList.appendChild(listitem);
    }
}

function onEditPattern() {
    if (widget.patternList.selectedIndex < 0) {
        return;
    }
    var info = { isOk : false, patternInfo : patternList[widget.patternList.selectedIndex] };
    window.openDialog('chrome://colortab/content/pref/pattern-dialog.xul',
                      '_blank',
                      'chrome,modal,titlebar,resizable,centerscreen', info);
    if (info.isOk) {
        var listitem = widget.patternList.selectedItem.firstChild; 
        listitem.setAttribute("value", info.patternInfo.patterns);
        listitem.setAttribute("style", info.patternInfo.cssStyle);
    }
}

function movePattern(moveUp) {
    var fromIdx = widget.patternList.selectedIndex;

    if (fromIdx < 0) {
        return;
    }

    var offset;

    if (moveUp) {
        if (fromIdx <= 0) {
            return;
        }
        offset = -1;
    } else {
        if (fromIdx >= patternList.length - 1) {
            return;
        }
        offset = +1;
    }

    var toIdx = fromIdx + offset;

    var fromEl = widget.patternList.getItemAtIndex(fromIdx).firstChild;
    var toEl = widget.patternList.getItemAtIndex(toIdx).firstChild;

    fromEl.setAttribute("value", patternList[toIdx].patterns);
    fromEl.setAttribute("style", patternList[toIdx].cssStyle);

    toEl.setAttribute("value", patternList[fromIdx].patterns);
    toEl.setAttribute("style", patternList[fromIdx].cssStyle);

    extensions.dafizilla.tabcolor.commonUtils.swap(patternList, fromIdx, toIdx);

    widget.patternList.selectedIndex = toIdx;
    widget.patternList.ensureIndexIsVisible(toIdx);
}

function onSelectPattern() {
    var selIdx = widget.patternList.selectedIndex;

    var addButton = document.getElementById("add-pattern");
    var editButton = document.getElementById("edit-pattern");
    var deleteButton = document.getElementById("delete-pattern");
    var upButton = document.getElementById("up-pattern");
    var downButton = document.getElementById("down-pattern");

    upButton.disabled = selIdx <= 0;
    downButton.disabled = selIdx < 0 || selIdx >= patternList.length - 1;
    deleteButton.disabled = selIdx < 0;
    editButton.disabled = selIdx < 0;
}
