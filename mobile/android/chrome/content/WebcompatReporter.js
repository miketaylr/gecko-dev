/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Services.jsm");

var WebcompatReporter = {
  menuItem: null,
  strings: Services.strings.createBundle("chrome://browser/locale/webcompatReporter.properties"),
  init: function() {
    Services.obs.addObserver(this, "DesktopMode:Change", false);
    Services.obs.addObserver(this, "content-page-shown", false);
    this.addMenuItem();
  },
  uninit: function() {
    Services.obs.removeObserver(this, "DesktopMode:Change");
    NativeWindow.menu.remove(this.menuItem);
    this.menuItem = null;
  },
  observe: function(subject, topic, data) {
    if (topic === "content-page-shown") {
      let currentURI = subject.documentURI;
      if (this.isReportableUrl(currentURI)) {
        NativeWindow.menu.update(this.menuItem, {enabled: true});
      } else {
        NativeWindow.menu.update(this.menuItem, {enabled: false});
      }
    }

    if (topic === "DesktopMode:Change") {
      let args = JSON.parse(data);
      let tab = BrowserApp.getTabForId(args.tabId);
      if (args.desktopMode === true && tab !== null) {
        this.reportDesktopModePrompt();
      }
    }
  },
  addMenuItem: function() {
    this.menuItem = NativeWindow.menu.add({
      name: this.strings.GetStringFromName("webcompat.menu.name"),
      icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADUUlEQVR42sVXXU/TYBjlJ/injAoCguD8QmNUYrwxaiRRE/VC77xSb4x6YdRoYkQDEYOK4hc6cAxlIEScAgobH7KWbmu7tsfndDU0JCau3fQkT/I2a/ec9/k4z/tWKQNb1oj1iuEfWy99V4Vy3t8ktjkUiarSP4qI00Zk3m5AZqCJz7KugRKt57pkEqURoLPoJqjvt0GfaYedn4Gtp2HO90AdakXmXS3fqRwB7lx5vx1WbhKrYZsLUOP7oAjByhHg7mMtyH+7jPzkNRiznShkhgDHAaHPdiDTt5ZRqAABFltsJ4x0NwrKEGyJgp3/AUv7IiTiMBdeQJ++yXf4biUINEId3OM6Nxdfw0h1wZx7KutXRULZr7CNeWTHzkgt1FQmAmpslzj7ILuflt1/h5VNwlISRULpRxKF59ASR1ioFSIwuFscddGk8p+J4zew1FG3E5yCAsdcgjZ6kt1QmRQwAsy9Y2niNIWCmnALMZe8BG3kmOR/hzivr1ARRuuw/PEgPEj+n0jVt6OwFJOuuApL+yw2gez4OQpTuQlE2F5S5Td8BLrhGHPFdfqhRCUHwlLiQmC9fNNcPgIZyqyE3zEzIBwrK7u/T/kBUfgZlVaM4Teyn055JCLlINBM3XcL7jcsdVieX66ooLEIPdWx8qzPQh3Yikx/Q1gCDP06t8j8YMtRhPzQZx+4neCBXcIohCPgDp74Xi+/HmRNAqtBfbBEkPzIjp+VrqgOToA7MFKd8IOql5s4L3nvg0mb6ynK8Mw95Keuwwd2hSdKzaUToPBw8tnmIvyg8BSWBoTAO2RFdPQfd0V8jnMmCJnHkDzADy3RRmEqmYB8VAdt+Aj+BKqePn3LnYb699v+X+ADJyeLOAiBjdJOpxEWJOe1ZAACY+UgcCcogVosJ44iLHLfrpBAkCJsFPVrkVwrCANt9ESgIvROu9XujA8KHlqVfrZgUwACXicsDx8CHDtY+JMXvA6IBJdi5o+tVCIYORYyRSj8NOQucsmLriT/DYxUB88PrKPw09BPQo23uspn56Y4kr1x7EiGdPeEZMghRRtp47tU0tDjeHU6eC9gSvjnQmY/60PsMNQPB0S2I3Rc0nmQFuByGilWdbSBBxUaiQW9pPb+9+v5L/5IMZ9vMn5CAAAAAElFTkSuQmCC",
      callback: () => {
        let currentURI = BrowserApp.selectedTab.browser.currentURI.spec;
        this.reportIssue(currentURI);
      },
      enabled: false,
    });
  },
  isReportableUrl: function(url) {
    return url !== null && !(url.startsWith("about") ||
                             url.startsWith("chrome") ||
                             url.startsWith("file") ||
                             url.startsWith("resource"));
  },
  reportDesktopModePrompt: function() {
    var currentURI = BrowserApp.selectedTab.browser.currentURI.spec;
    let getString = (name) => this.strings.GetStringFromName(name);

    let message = getString("webcompat.reportDesktopMode.message");
    let buttons = [{
        label: getString("webcompat.reportDesktopModeYes.label"),
        callback: () => this.reportIssue(currentURI)
      }, {
        label: getString("webcompat.reportDesktopModeNo.label"),
        callback: () => {},
    }];
    let options = {
      timeout: 3000,
      persistence: 1,
    };
    NativeWindow.doorhanger.show(message, "webcompat-prompt", buttons, BrowserApp.selectedTab.id, options);
  },
  reportIssue: function(url) {
    let webcompatURL = new URL("http://webcompat.com/");
    webcompatURL.searchParams.append("open", "1");
    webcompatURL.searchParams.append("url", url);
    BrowserApp.addTab(webcompatURL.href);
  }
};
