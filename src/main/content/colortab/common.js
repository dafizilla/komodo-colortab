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

extensions.dafizilla.tabcolor.commonUtils = {};

(function() {
    locale : Components.classes["@mozilla.org/intl/stringbundle;1"]
    .getService(Components.interfaces.nsIStringBundleService)
    .createBundle("chrome://colortab/locale/colortab.properties");

    this.removeMenuItems = function(menu) {
        var children = menu.childNodes;
    
        for (var i = children.length - 1; i >= 0; i--) {
            menu.removeChild(children[i]);
        }
    }
    
    this.getLocalizedMessage = function(msg) {
        return locale.GetStringFromName(msg);
    }
    
    this.getFormattedMessage = function(msg, ar) {
        return locale.formatStringFromName(msg, ar, ar.length);
    }
    
    this.getObserverService = function () {
        return Components.classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService);
    }
    
    this.getProfileDir = function() {
        return this.getPrefDir("PrefD");
    }
    
    this.getPrefDir = function(dir) {
        return Components.classes["@mozilla.org/file/directory_service;1"]
            .getService(Components.interfaces.nsIProperties)
            .get(dir, Components.interfaces.nsILocalFile);
    }
    
    this.makeLocalFile = function(path, arrayAppendPaths) {
        var file;
    
        try {
            file = path.QueryInterface(Components.interfaces.nsILocalFile);
        } catch (err) {
            file = Components.classes["@mozilla.org/file/local;1"]
                   .createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(path);
        }
    
        if (arrayAppendPaths != null
            && arrayAppendPaths != undefined
            && arrayAppendPaths.length) {
            for (var i = 0; i < arrayAppendPaths.length; i++) {
                file.append(arrayAppendPaths[i]);
            }
        }
        return file;
    }
    
    this.read = function(file) {
        var str = "";
        var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
            .createInstance(Components.interfaces.nsIFileInputStream);
        var siStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
            .createInstance(Components.interfaces.nsIScriptableInputStream);
    
        fiStream.init(file, 1, 0, false);
        siStream.init(fiStream);
        str += siStream.read(-1);
        siStream.close();
        fiStream.close();
        return str;
    }
    
    this.loadTextFile = function(fileName) {
        var file = this.makeLocalFile(fileName);
    
        if (!file.exists()) {
            return null;
        }
    
        var fileContent = this.read(file);
    
        return fileContent;
    }
    
    this.saveTextFile = function(fileName, fileContent, permissions) {
        var os = this.makeOutputStream(fileName, false, permissions);
        os.write(fileContent, fileContent.length);
        os.flush();
        os.close();
    }
    
    this.makeOutputStream = function(fileNameOrLocalFile, append, permissions) {
        permissions = typeof(permissions) == "undefined" ? 0600 : permissions;
        var os = Components.classes["@mozilla.org/network/file-output-stream;1"]
            .createInstance(Components.interfaces.nsIFileOutputStream);
        var flags = 0x02 | 0x08 | 0x20; // wronly | create | truncate
        if (append != null && append != undefined && append) {
            flags = 0x02 | 0x10; // wronly | append
        }
        var file = this.makeLocalFile(fileNameOrLocalFile);
    
        os.init(file, flags, permissions, 0);
    
        return os;
    }
    
    this.readHttpReq = function(urlName) {
        var httpReq = new XMLHttpRequest();
        httpReq.open("GET", urlName, false);
        httpReq.send(null);
    
        return httpReq;
    }
    
    this.log = function(msg) {
        ko.logging.getLogger("extensions.colortab").warn(msg);
    }

    this.getJSON = function() {
        // test for Firefox 3.1
        if (typeof(JSON) != "undefined") {
            return JSON;
        }
        var json = Components.classes["@mozilla.org/dom/json;1"]
            .createInstance(Components.interfaces.nsIJSON);
        return { stringify : json.encode, parse : json.decode};
    }
    
    this.swap = function(arr, idx1, idx2) {
        if ((idx1 == idx2) || (idx1 < 0) || (idx2 < 0)) {
            return;
        }
        var temp = arr[idx1];

        arr[idx1] = arr[idx2];
        arr[idx2] = temp;
    }
}).apply(extensions.dafizilla.tabcolor.commonUtils);
