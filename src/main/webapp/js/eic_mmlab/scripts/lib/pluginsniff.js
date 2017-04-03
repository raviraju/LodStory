
/**
 * PLUGIN FRAMEWORK, Version 0.5
 * For details, see the Knallgrau web site: http://www.knallgrau.at/code/prototype/plugins_js
 * Copyright (c) 2006 Matthias Platzer <matthias@knallgrau.at>
 * This code is freely distributable under the terms of an MIT-style license.
 * 
 ***********************************************************************************
 *  Copyright (c) 2006 Matthias Platzer <matthias@knallgrau.at>
 *  
 *  Permission is hereby granted, free of charge, to any person obtaining a copy 
 *  of this software and associated documentation files (the "Software"), to deal 
 *  in the Software without restriction, including without limitation the rights 
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
 *  copies of the Software, and to permit persons to whom the Software is 
 *  furnished to do so, subject to the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
 *  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *
 ***********************************************************************************
 *
 *  inspired by Prototype JavaScript framework
 *
 *  Provides the following functions
 *    // name accepts: 
 *    // Acrobat, QuickTime, DivX, Director, 
 *    // 'Windows Media', Flash, Java, RealPlayer, VLC
 *    Plugin.isInstalled(String name) 
 *    Plugin.getVersion(String name)
 *    Plugin.getPluginsForMimeType(String mimeType)  // returns Array of Plugin Names
 *    Plugin.getPluginsForFileSuffix(String suffix)  // returns Array of Plugin Names
 *    Plugin.embed(pluginName, options, target)
 *    Plugin.getInfo(String name) 
 *      // Result Object contains informations about the plugin
 *      Boolean isInstalled
 *      String  version
 *      String  description
 *      Array   progID        to be used with new ActiveXObject()
 *      String  classID       for ActiveX
 *      String  pluginsPage   URL to download the plugin
 *      Array   acceptedMimeTypes  provides MimeType info for IE
 *
 * CHANGELOG:
 * 17.12.2005: Version 0.1
 *   initial version
 * 18.12.2005: Version 0.2
 *   added mimetypes for divx & co.
 *   added VLC support (detection for IE is missing)
 *   renamed getPluginsForMimeType, getPluginsForFileSuffix -> returns Array, instead of String
 *   dropped support vor Adobe SVG (IE)
 *   tested and debugged RealPlayer -> still reports a strange version number
 *   fixed bugs where script did break on unknown name attribute
 *   added experimental Plugin.embed
 * 20.12.2005: Version 0.3
 *   added docs
 *   added license
 *   rewrote Plugin.embed -> now it's easier to add new formats
 *   downloadURL became pluginsPage
 *   added mimeType, activeXType and codeBase to Plugin.PLUGINS
 *   Plugin.embed accepts strings as target (id)
 *   Added Plugin.embed support for Flash, RealPlayer and VLC
 * 23.03.2006: Version 0.4
 *   Fixed a few warnings reported by firefox in javascript strict mode (reported by Olav Roth)
 * 13.04.2006: Version 0.5
 *   Improved support for Windows Media Plugin
 *   - use WM6.4 ClassID instead of WM7 (this fixes a lot of bad behaviour, like missing controls)
 *   - detect installed ActiveX support for Mozilla (Firefox)
 *   - added support for forceObjectTag as a sideeffect
 *   Fixed a bug with embeding VLC (src needs to be present in the embed tag)
 *   Updated DivX support to final Version 1.0
 * 
 * you may remove the comments section, but please leave the copyright
/*--------------------------------------------------------------------------*/
	
var PluginFactory = function() {

  // Returns if plugin with identifier name is installed
  // @see Plugin.getInfo
  this.isInstalled = function(name) {
    return Plugin.getInfo(name).isInstalled;
  }

  // Returns version number of plugin if available
  // @see Plugin.getInfo
  this.getVersion = function(name) {
    return Plugin.getInfo(name).version;
  }

  // Returns an Array of plugin identifier names, 
  // that can handle this mimeType.
  this.getPluginsForMimeType = function(mimeType) {
    var result = [];
    if (supportsNavigatorPlugins()) {
      // navigator.mimeTypes
      for (var i=0; i<navigator.mimeTypes.length; i++) {
        if (navigator.mimeTypes[i].type.indexOf(mimeType) == 0 && navigator.mimeTypes[i].enabledPlugin) {
          var pluginName = (findPluginName(navigator.mimeTypes[i].enabledPlugin.name) || navigator.mimeTypes[i].enabledPlugin.name);
          if (!Array.contains(result, pluginName)) result.push(pluginName);
        }
      }
    } else {
      // Code for IE using ActiveX
      for (var pluginName in Plugin.PLUGINS) {
        var mimeTypes = Plugin.PLUGINS[pluginName].acceptedMimeTypes;
        if (!mimeTypes) continue;
        for (var j=0; j<mimeTypes.length; j++) {
          if (mimeTypes[j].type.indexOf(mimeType) == 0 && Plugin.isInstalled(pluginName)) {
            if (!Array.contains(result, pluginName)) result.push(pluginName);
          }
        }
      }    
    }
    return result;
  }

  // Returns an Array of plugin identifier names, 
  // that can handle a file with this suffix.
  this.getPluginsForFileSuffix = function(suffix) {
    var result = [];
    if (supportsNavigatorPlugins()) {
      // navigator.mimeTypes
      for (var i=0; i<navigator.mimeTypes.length; i++) {
        if ((","+navigator.mimeTypes[i].suffixes+",").indexOf(","+suffix+",") != -1 && navigator.mimeTypes[i].enabledPlugin) {
          var pluginName = (findPluginName(navigator.mimeTypes[i].enabledPlugin.name) || navigator.mimeTypes[i].enabledPlugin.name);
          if (!Array.contains(result, pluginName)) result.push(pluginName);
        }
      }
    } else {
      // Code for IE using ActiveX
      for (var pluginName in Plugin.PLUGINS) {
        var mimeTypes = Plugin.PLUGINS[pluginName].acceptedMimeTypes;
        if (!mimeTypes) continue;
        for (var j=0; j<mimeTypes.length; j++) {
          if ((","+mimeTypes[j].suffixes+",").indexOf(","+suffix+",") != -1 && Plugin.isInstalled(pluginName)) {
            if (!Array.contains(result, pluginName)) result.push(pluginName);
          }
        }
      }    
    }
    return result;
  }

  // Returns general information about a plugin.
  // accepts: Acrobat, QuickTime, DivX, Director, 'Windows Media', 
  //          Flash, Java, RealPlayer, VLC
  this.getInfo = function(name) {

    var info = Plugin.PLUGINS[name];
    var isInstalled = false;
    var version = null;

    if (supportsNavigatorPlugins()) {
      // navigator.plugins
      var plugin = findNavigatorPluginByName((name == "RealPlayer") ? "RealPlayer Version Plugin" : name);
      if (plugin) {
        isInstalled = true;
        version = getVersionFromPlugin(plugin);
      }

    } else {
      // Code for IE using ActiveX
      isInstalled = hasActiveXObject(Plugin.PLUGINS[name] && Plugin.PLUGINS[name].progID);
      if (isInstalled) {
        if (Plugin.PLUGINS[name].getActiveXVersionInfo) {
          version = Plugin.PLUGINS[name].getActiveXVersionInfo();
        } else {
          // assume that the progID contains the version number
          // this is not always correct
          var progID = getProgIdForActiveXObject(Plugin.PLUGINS[name].progID);
          version = getVersionFromPlugin(progID);
        }
      } else {
        version = getActiveXPluginByClassId(Plugin.PLUGINS[name] && Plugin.PLUGINS[name].classID);
        if (version) version = version.replace(/,/g, ".");
        isInstalled = (version!=undefined);
      }

    }

    var result = {};
    for (var i in info) {
      result[i] = info[i];
    }
    result["isInstalled"] = isInstalled;
    result["version"] = version;
    result["name"] = name;

    return result;
  }

/**
 * writes an embed or object tag to document.write or target.
 * @param plugin   name of the plugin to be used
 * @param options  options for embed respectivly object tag.
 *   .src,.width,.height,.type,.activeXType will get a special treatment
 *   all other properties of options will be added to the 
 *   embed tag as attributes resp. to the object tag as param(eters).
 *   option names should be lower case!
 * @param target   optional (id of) container element for the embed/object tag
 */
  this.embed = function(plugin, options, target) {
    options = options || {};

    var embedOptions = Object.extend({}, options);
    var src = embedOptions.src;
    delete embedOptions.src;
    var id = embedOptions.id;
    delete embedOptions.id;
    var name = embedOptions.name || id;
    delete embedOptions.name;
    var width = embedOptions.width;
    delete embedOptions.width;
    var height = embedOptions.height;
    delete embedOptions.height;
    var type = embedOptions.type || (Plugin.PLUGINS[plugin] && Plugin.PLUGINS[plugin].mimeType) || "";
    delete embedOptions.type;
    var activeXType = embedOptions.activeXType || (Plugin.PLUGINS[plugin] && Plugin.PLUGINS[plugin].activeXType) || type;
    delete embedOptions.activeXType;
    var forceEmbedTag = (Plugin.PLUGINS[plugin] && Plugin.PLUGINS[plugin].forceEmbedTag === true) ? true : false;
    var forceObjectTag = (Plugin.PLUGINS[plugin] && Plugin.PLUGINS[plugin].forceObjectdTag === true) ? true : false;

    var embedOptions = Object.extend(((Plugin.PLUGINS[plugin] && Plugin.PLUGINS[plugin].standardEmbedAttributes) || {}), embedOptions);

    switch (plugin) {
      case "QuickTime":
        // get space for controlls
        if (embedOptions.controller == "true" && (height+"").indexOf("%") == -1) {
          height += 16;
        }
        if (!options.activeXType) {
          activeXType = null;
        }
        break;

      case "DivX":
        // get space for controlls
        if ((height+"").indexOf("%") == -1) {
          if (embedOptions.mode == "mini") height += 20;
          else if (embedOptions.mode == "large") height += 65;
          else if (embedOptions.mode == "full") height += 90;
        }
        break;

      case "Windows Media":
        // check if ActiveX for Firefox is installed
        // http://help.yahoo.com/help/us/launch/videos/videos-07.html
        if (!supportsNavigatorPlugins() || window.GeckoActiveXObject) {
           forceObjectTag = true;
        }
        // get space for controlls
        if ((window.ActiveXObject || window.GeckoActiveXObject || window.opera) &&
            (height+"").indexOf("%") == -1) {
          height += 45;
        }
        break;

      case "Flash":
        // flash wants the src to be named "movie" if passed as object param
        if (!supportsNavigatorPlugins()) {
          embedOptions.movie = src;
          src = null;
        }
        break;

      case "VLC":
        // VLC wants the src to be named "target"
        // update: that's actualy wrong, even it's documented like that!
        if (supportsNavigatorPlugins()) {
          embedOptions.target = src;
        }
        break;

      case "RealPlayer":
        break;        

      default: 
        // do nothing
        break;
    }

    // prepare html code
    var html = "";
    if ((supportsNavigatorPlugins() && ! forceObjectTag) || forceEmbedTag) {
      // Netscape Plugin embed Tag
      html += '<embed' + getAttributeHtml("src", src)  + getAttributeHtml("id", id) + getAttributeHtml("name", name) + getAttributeHtml("width", width) + getAttributeHtml("height", height) + getAttributeHtml("pluginspage", Plugin.PLUGINS[plugin] && Plugin.PLUGINS[plugin].pluginsPage) + getAttributeHtml("type", type);
      for (var i in embedOptions) {
        html += ' '+i+'="'+embedOptions[i]+'"';
      }
      html += '></embed>\n';
    } else {
      // ActiveX object tag
      html += '<object classid="clsid:'+(Plugin.PLUGINS[plugin] && Plugin.PLUGINS[plugin].classID)+'"';
      html += getAttributeHtml("id", id) + getAttributeHtml("name", name) + getAttributeHtml("width", width) + getAttributeHtml("height", height) + getAttributeHtml("codebase", (Plugin.PLUGINS[plugin] && Plugin.PLUGINS[plugin].codeBase)) + getAttributeHtml("type", activeXType) + '>\n';
      html += (src) ? '  <param name="src" value="'+src+'">\n' : '';
      for (var i in embedOptions) {
        html += '  <param name="'+i+'" value="'+embedOptions[i]+'" />';
      }
      html += '</object>\n';
    }

    if (target) {
      if (typeof target == "string") target = document.getElementById(target);
      target.innerHTML = html;
    } else {
      document.write(html);
    }
  }

  var getAttributeHtml = function(name, value) {
    return (value) ? (" " + name + "=\"" + value + "\"") : "";
  }

  // Info about known plugins
  this.PLUGINS = {
    "Acrobat": {
      description: "Adobe Acrobat Plugin",
      progID: ["PDF.PdfCtrl.7", "PDF.PdfCtrl.6", "PDF.PdfCtrl.5", "PDF.PdfCtrl.4", "PDF.PdfCtrl.3", "AcroPDF.PDF.1"],
      classID: "CA8A9780-280D-11CF-A24D-444553540000",
      pluginsPage: "http://www.adobe.com/products/acrobat/readstep2.html",
      acceptedMimeTypes: [
        { type: "application/pdf", suffixes: "pdf" },
        { type: "application/vnd.fdf", suffixes: "fdf" },
        { type: "application/vnd.adobe.xfdf", suffixes: "xfdf" },
        { type: "application/vnd.adobe.xdp+xml", suffixes: "xdp" },
        { type: "application/vnd.adobe.xfd+xml", suffixes: "xfd" }
      ]
    },
    "QuickTime": {
      description: "QuickTime Plug-in",
      progID: ["QuickTimeCheckObject.QuickTimeCheck.1", "QuickTime.QuickTime"],
      classID: "02BF25D5-8C17-4B23-BC80-D3488ABDDC6B",
      pluginsPage: "http://www.apple.com/quicktime/download/",
      codeBase: "http://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0",
      mimeType: "video/quicktime",
      standardEmbedAttributes: {
        autoplay: "false"
      },
      // embedInfo: http://www.apple.com/quicktime/tutorials/embed.html 
      //            http://developer.apple.com/quicktime/compatibility.html
      getActiveXVersionInfo: function() { 
        var progID = getProgIdForActiveXObject(Plugin.PLUGINS["QuickTime"].progID); 
        var obj = new ActiveXObject(progID);
        var version = (obj && obj.QuickTimeVersion) ? obj.QuickTimeVersion.toString(16) : "";
        return version.substring(0,1) + '.' + version.substring(1,2) + '.' + version.substring(2,3);
      },
      acceptedMimeTypes: [
        { type: "image/tiff", suffixes: "tif,tiff" },
        { type: "image/x-tiff", suffixes: "tif,tiff" },
        { type: "video/x-m4v", suffixes: "m4v" },
        { type: "image/x-macpaint", suffixes: "pntg,pnt,mac" },
        { type: "image/pict", suffixes: "pict,pic,pct" },
        { type: "image/x-pict", suffixes: "pict,pic,pct" },
        { type: "image/x-quicktime", suffixes: "qtif,qti" },
        { type: "image/x-sgi", suffixes: "sgi,rgb" },
        { type: "image/x-targa", suffixes: "targa,tga" },
        { type: "audio/3gpp", suffixes: "3gp,3gpp" },
        { type: "video/3gpp2", suffixes: "3g2,3gp2" },
        { type: "audio/3gpp2", suffixes: "3g2,3gp2" },
        { type: "video/sd-video", suffixes: "sdv" },
        { type: "application/x-mpeg", suffixes: "amc" },
        { type: "video/mp4", suffixes: "mp4" },
        { type: "audio/mp4", suffixes: "mp4" },
        { type: "audio/x-m4a", suffixes: "m4a" },
        { type: "audio/x-m4p", suffixes: "m4p" },
        { type: "audio/x-m4b", suffixes: "m4b" },
        { type: "video/mpeg", suffixes: "mpeg,mpg,m1s,m1v,m1a,m75,m15,mp2,mpm,mpv,mpa" },
        { type: "audio/mpeg", suffixes: "mpeg,mpg,m1s,m1a,mp2,mpm,mpa,m2a" },
        { type: "audio/x-mpeg", suffixes: "mpeg,mpg,m1s,m1a,mp2,mpm,mpa,m2a" },
        { type: "video/3gpp", suffixes: "3gp,3gpp" },
        { type: "audio/x-gsm", suffixes: "gsm" },
        { type: "audio/AMR", suffixes: "AMR" },
        { type: "audio/aac", suffixes: "aac,adts" },
        { type: "audio/x-aac", suffixes: "aac,adts" },
        { type: "audio/x-caf", suffixes: "caf" },
        { type: "video/x-mpeg", suffixes: "mpeg,mpg,m1s,m1v,m1a,m75,m15,mp2,mpm,mpv,mpa" },
        { type: "audio/aiff", suffixes: "aiff,aif,aifc,cdda" },
        { type: "audio/x-aiff", suffixes: "aiff,aif,aifc,cdda" },
        { type: "audio/basic", suffixes: "au,snd,ulw" },
        { type: "audio/mid", suffixes: "mid,midi,smf,kar" },
        { type: "audio/x-midi", suffixes: "mid,midi,smf,kar" },
        { type: "audio/midi", suffixes: "mid,midi,smf,kar" },
        { type: "audio/vnd.qcelp", suffixes: "qcp" },
        { type: "application/sdp", suffixes: "sdp" },
        { type: "application/x-sdp", suffixes: "sdp" },
        { type: "application/x-rtsp", suffixes: "rtsp,rts" },
        { type: "video/quicktime", suffixes: "mov,qt,mqv" },
        { type: "video/flc", suffixes: "flc,fli,cel" },
        { type: "audio/x-wav", suffixes: "wav,bwf" },
        { type: "audio/wav", suffixes: "wav,bwf" }
      ]
    },
    "DivX": {
      description: "DivX Browser Plugin",
      progID: ["npdivx.DivXBrowserPlugin.1", "npdivx.DivXBrowserPlugin"],
      classID: "67DABFBF-D0AB-41fa-9C46-CC0F21721616",
      codeBase: "http://go.divx.com/plugin/DivXBrowserPlugin.cab",
      pluginsPage: "http://go.divx.com/plugin/download/",
      mimeType: "video/divx",
      standardEmbedAttributes: {
        mode: "mini",
        minversion: "1.0.0"
      },
      // embedInfo: Beta1: http://labs.divx.com/archives/000072.html
      //            SDK&Doc: http://download.divx.com/labs/Webmaster_SDK.zip
      getActiveXVersionInfo2: function() {
        var progID = getProgIdForActiveXObject(Plugin.PLUGINS["DivX"].progID); 
        return "1.0.0"; // that's the only currently available
      },
      acceptedMimeTypes: [
        { type: "video/divx", suffixes: "dvx,divx" }
      ]
    },
    "Director": {
      description: "Macromedia Director",
      progID: ["SWCtl.SWCtl.11","SWCtl.SWCtl.10","SWCtl.SWCtl.9","SWCtl.SWCtl.8","SWCtl.SWCtl.7","SWCtl.SWCtl.6","SWCtl.SWCtl.5","SWCtl.SWCtl.4"],
      classID: "166B1BCA-3F9C-11CF-8075-444553540000",
      pluginsPage: "http://www.macromedia.com/shockwave/download/",
      codeBase: "http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=8,5,1,0",
      mimeType: "application/x-director"
    },         
    "Flash": {
      description: "Macromedia Shockwave Flash",
      progID: ["ShockwaveFlash.ShockwaveFlash.9", "ShockwaveFlash.ShockwaveFlash.8.5", "ShockwaveFlash.ShockwaveFlash.8", "ShockwaveFlash.ShockwaveFlash.7", "ShockwaveFlash.ShockwaveFlash.6", "ShockwaveFlash.ShockwaveFlash.5", "ShockwaveFlash.ShockwaveFlash.4"],
      classID: "D27CDB6E-AE6D-11CF-96B8-444553540000",
      pluginsPage: "http://www.macromedia.com/go/getflashplayer",
      codeBase: "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0",
      mimeType: "application/x-shockwave-flash",
      standardEmbedAttributes: {
        quality: "high"
      },
      // embedInfo: http://www.macromedia.com/cfusion/knowledgebase/index.cfm?id=tn_4150
      //            http://www.macromedia.com/cfusion/knowledgebase/index.cfm?id=tn_12701
      acceptedMimeTypes: [
        { type: "application/x-shockwave-flash", suffixes: "swf" },
        { type: "application/futuresplash", suffixes: "spl" }
      ]
    }, 
    "VLC": {
      description: "VLC multimedia plugin",
      progID: [],
      classID: "",
      pluginsPage: "http://www.videolan.org/doc/play-howto/en/ch02.html#id287569",
      codeBase: "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0",
      mimeType: "application/x-vlc-plugin",
      standardEmbedAttributes: {
        quality: "high",
        autoplay: "no"
      },
      // embedInfo: http://www.videolan.org/doc/vlc-user-guide/en/ch07.html
      //            http://www.videolan.org/doc/play-howto/en/ch04.html#id293251
      acceptedMimeTypes: [
        { type: "audio/mpeg", suffixes: "mp2,mp3,mpga,mpega" },
        { type: "audio/x-mpeg", suffixes: "mp2,mp3,mpga,mpega" },
        { type: "video/mpeg", suffixes: "mpg,mpeg,mpe" },
        { type: "video/x-mpeg", suffixes: "mpg,mpeg,mpe" },
        { type: "video/mpeg-system", suffixes: "mpg,mpeg,vob" },
        { type: "video/x-mpeg-system", suffixes: "mpg,mpeg,vob" },
        { type: "video/mpeg4", suffixes: "mp4,mpg4" },
        { type: "audio/mpeg4", suffixes: "mp4,mpg4" },
        { type: "application/mpeg4-iod", suffixes: "mp4,mpg4" },
        { type: "application/mpeg4-muxcodetable", suffixes: "mp4,mpg4" },
        { type: "video/x-msvideo", suffixes: "avi" },
        { type: "video/quicktime", suffixes: "mov,qt" },
        { type: "application/x-ogg", suffixes: "ogg" },
        { type: "application/x-vlc-plugin", suffixes: "*" },
        { type: "video/x-ms-asf-plugin", suffixes: "asf,asx,*" },
        { type: "video/x-ms-asf", suffixes: "asf,asx,*" },
        { type: "application/x-mplayer2", suffixes: "dvx,divx,ivx,xvid,ivf,*" },
        { type: "video/x-ms-wmv", suffixes: "wmv,*" },
        { type: "application/x-google-vlc-plugin", suffixes: "*" }      
      ]
    },
    "Windows Media": {
      description: "Windows Media Player Plug-in Dynamic Link Library",
      progID: ["WMPlayer.OCX", "MediaPlayer.MediaPlayer.1"],
      classID: "22D6f312-B0F6-11D0-94AB-0080C74C7E95", // WMP6 -> semms to work a lot better, don't know why
      // classID: "6BF52A52-394A-11D3-B153-00C04F79FAA6", // WMP7+ -> doesn't work for me
      pluginsPage: "http://www.microsoft.com/windows/windowsmedia/",
      codeBase: "http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,0,02,902",
      mimeType: "application/x-mplayer2",
      activeXType: "application/x-oleobject",
      standardEmbedAttributes: {
        autoplay: "false"
      },
      // embedInfo: http://msdn.microsoft.com/archive/default.asp?url=/archive/en-us/samples/internet/imedia/netshow/crossbrowserembed/default.asp
      getActiveXVersionInfo: function() { 
        var progID = getProgIdForActiveXObject(Plugin.PLUGINS["Windows Media"].progID); 
        var obj = new ActiveXObject(progID);
        return (obj && obj.versionInfo) ? obj.versionInfo : "";
      },
      acceptedMimeTypes: [
        { type: "application/asx", suffixes: "*" },
        { type: "video/x-msvideo", suffixes: "avi" },
        { type: "video/x-ms-asf-plugin", suffixes: "*" },
        { type: "application/x-mplayer2", suffixes: "dvx,divx,ivx,xvid,ivf,*" },
        { type: "video/x-ms-asf", suffixes: "asf,asx,*" },
        { type: "video/x-ms-wm", suffixes: "wm,*" },
        { type: "audio/x-ms-wma", suffixes: "wma,*" },
        { type: "audio/x-ms-wax", suffixes: "wax,*" },
        { type: "video/x-ms-wmv", suffixes: "wmv,*" },
        { type: "video/x-ms-wvx", suffixes: "wvx,*" }
      ]
    },
    "Java": {
      description: "Java Virtual Machine",
      progID: [],
      classID: "08B0E5C0-4FCB-11CF-AAA5-00401C608500",
      pluginsPage: "http://www.java.com/de/download/manual.jsp",
      acceptedMimeTypes: [
        { type: "application/x-java-applet", suffixes: "" },
        { type: "application/x-java-bean", suffixes: "" },
        { type: "application/x-java-vm", suffixes: " " }
      ]
    },          
    "RealPlayer": {
      description: "RealPlayer Version Plugin",
      progID: ["RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)", "RealVideo.RealVideo(tm) ActiveX Control (32-bit)", "rmocx.RealPlayer G2 Control"],
      classID: "CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA",
      mimeType: "audio/x-pn-realaudio-plugin",
      pluginsPage: "http://www.real.com/freeplayer/?rppr=rnwk",
      forceEmbedTag: true,
      standardEmbedAttributes: {
        controls: "ControlPanel",
        nojava: "true",
        autostart: "false"
      },
      // embedInfo: http://service.real.com/help/library/guides/realone/ProductionGuide/HTML/realpgd.htm?page=htmfiles/embed.htm
      // couldn't find any info about the object tag!
      getActiveXVersionInfo: function() { 
        var progID = getProgIdForActiveXObject(Plugin.PLUGINS["RealPlayer"].progID); 
        var obj = new ActiveXObject(progID);
        var version = (obj) ? obj.GetVersionInfo() : "";
        return version;
      },
      acceptedMimeTypes: [
        { type: "audio/x-pn-realaudio-plugin", suffixes: "rpm" },
        { type: "application/vnd.rn-realplayer-javascript", suffixes: "rpj" }
      ]
    }
  }

  var supportsNavigatorPlugins = function() {
    return (navigator.plugins && (navigator.plugins.length > 0));
  }

  var supportsActiveX = function() {
    return ((typeof 'ActiveXObject' != 'undefined') && (navigator.userAgent.indexOf('Win') != -1));
  }

  var findNavigatorPluginByName = function(name) {
    if (supportsNavigatorPlugins()) {
      for(var i=0;i<navigator.plugins.length;++i) {
        var plugin = navigator.plugins[i];
        if (plugin.name.indexOf(name) != -1) {
          return plugin;
        }
      }
    }
    return null;
  }

  var findPluginName = function(str) {
    for (var pluginName in Plugin.PLUGINS) {
      if (str.indexOf(pluginName) != -1) {
        return pluginName;
      }
    }
    return null;
  }

  var getIEClientCaps = function() {
    var clientcaps = document.getElementById("__Plugin_ClientCaps");
    if (!clientcaps) {
      var clientcaps = document.createElement("DIV");
      clientcaps.id = "__Plugin_ClientCaps";
      if (clientcaps.addBehavior) {
        clientcaps.addBehavior("#default#clientCaps");
        document.body.appendChild(clientcaps);
      }
      clientcaps = document.getElementById("__Plugin_ClientCaps");
    }
    return clientcaps;    
  }

  var getActiveXPluginByClassId = function(classID) {
    if (!classID) return null;
    if (!classID.match(/{[^}]+}/)) classID = "{" + classID + "}";
    var clientcaps = getIEClientCaps();
    try {
      var result = clientcaps.getComponentVersion(classID, "ComponentID")
      return result || null;
    } catch (err) { }
    return null;
  }

  var hasActiveXObject = function(progID) {
    progID = getProgIdForActiveXObject(progID);
    return (progID != null);
  }

  var getProgIdForActiveXObject = function(progID) {
    if (!progID) return null;
    for (var i=0; i<progID.length; i++) {
      try {
        var obj = new ActiveXObject(progID[i]);
        return progID[i] || null;
      }
      catch(e) { }
    }
    return null;
  }

  // accepts plugin or string
  var getVersionFromPlugin = function(plugin) {
    if (!plugin.name) plugin = { name: plugin, description: name };
    var matches = /[\d][\d\.]*/.exec(plugin.name);
    if (matches && plugin.name.indexOf("Java") == -1) return matches[0];
    matches = /[\d\.]+/.exec(plugin.description);
    return matches ? matches[0] : "";
  }
  
};


// helper functions
// for usage without prototype.js
if (!Object.extend) {
  Object.extend = function(destination, source) {
    for (property in source) {
      destination[property] = source[property];
    }
    return destination;
  }


// Array functions
Array.contains = function(arr, el) {
  return Array.indexOf(arr, el) != -1;
}

Array.indexOf = function(arr, el) {
  for (var i=0; i<arr.length; i++) {
    if (arr[i] == el) return i;
  }
  return -1;
}

String.encode =
String.prototype.encode = function() {
  var str = this;
  str = str.replace("&", "&amp;");
  str = str.replace("<", "&lt;");
  str = str.replace(">", "&gt;");
  str = str.replace("\"", "&quot;");
  str = str.replace("\n", "");
  return str;
}

if (!window.Plugin) {
  var Plugin = new Object();
}
Object.extend(Plugin, (new PluginFactory()));
};