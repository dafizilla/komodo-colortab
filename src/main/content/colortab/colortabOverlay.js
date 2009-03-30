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

var gColorTabOverlay = {
    onLoad : function() {
        try {
            var obs = extensions.dafizilla.tabcolor.commonUtils.getObserverService();
            obs.addObserver(this, "colortab_pref_changed", false);
            this.addListeners();
            extensions.dafizilla.tabcolor.tabUtils.init();
        } catch(e) {
            extensions.dafizilla.tabcolor.commonUtils.log(e);
        }
    },

    onUnLoad : function() {
        this.removeListeners();
    },

    addListeners : function() {
        var self = this;

        this.handle_view_document_attached_setup = function(event) {
            self.onViewOpened(event);
        };

        window.addEventListener('view_document_attached',
                                this.handle_view_document_attached_setup, false);
    },

    removeListeners : function() {
        window.removeEventListener('view_document_attached',
                                this.handle_view_document_attached_setup, false);
    },

    onViewOpened : function(event) {
        var currView = event.originalTarget;

        extensions.dafizilla.tabcolor.tabUtils.setViewTabStyle(currView);
    },

    observe : function(subject, topic, data) {
        try {
            switch (topic) {
                case "colortab_pref_changed":
                    extensions.dafizilla.tabcolor.tabUtils.prefChanged();
                    break;
            }
        } catch (err) {
            alert(topic + "--" + data + "\n" + err);
        }
    }
}

window.addEventListener("load", function(event) { gColorTabOverlay.onLoad(event); }, false);
window.addEventListener("unload", function(event) { gColorTabOverlay.onUnLoad(event); }, false);
