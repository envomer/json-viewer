window.notify = (function() {
  var main = {
    notify: notify
  };

  var list = document.createElement("UL");
  list.id = "notifications";

  /**
   * Append to body when it exists.
   */

  function ready(fn) {
    if (document.readyState != "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    document.body.appendChild(list);
  });

  return main;

  /**
   * Return a new `Notification` with the given
   * (optional) `title` and `msg`.
   *
   * @param {String} title or msg
   * @param {String} msg
   * @return {Dialog}
   * @api public
   */

  function notify(title, msg, type, timer) {
    var not = null;
    timer = timer || 4000;
    if (msg) {
      not = new NotifyX({ title: title, message: msg });
    } else {
      not = new NotifyX({ message: title });
    }
    not.show().hide(timer);
    if (type) not.type(type);
  }
})();

/**
 * Initialize a new `NotifyX`.
 *
 * Options:
 *
 *    - `title` dialog title
 *    - `message` a message to display
 *
 * @param {Object} options
 * @api public
 */
var NotificationTemplate =
  '<div class="content">\n    <span class="title">Title</span>\n    <a href="#" class="close">&#215;</a>\n    <p>Message</p>\n  </div>\n';
function NotifyX(options) {
  options = options || {};
  this.el = document.createElement("LI");
  this.el.className = "notification closable hide";
  this.el.innerHTML = NotificationTemplate;
  this.effect("scale");
  this.render(options);
  if (options.classname) this.el.addClass(options.classname);
  if (NotifyX.effect) this.effect(NotifyX.effect);
}

/**
 * Render with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

NotifyX.prototype.render = function(options) {
  var el = this.el,
    title = options.title,
    msg = options.message,
    self = this;

  el.querySelector(".close").addEventListener("click", function() {
    // self.emit('close');
    self.hide();
    return false;
  });

  el.addEventListener("click", function(e) {
    e.preventDefault();
    self.hide();
    // self.emit('click', e);
  });

  el.querySelector(".title").innerText = title;
  if (!title) el.querySelector(".title").remove();

  // message
  if ("string" == typeof msg) {
    el.querySelector("p").innerText = msg;
  } else if (msg) {
    el.querySelector("p").innerText = el
      .querySelector("p")
      .innerText.replace(msg.el || msg);
  }

  setTimeout(function() {
    el.className = el.className.replace(" hide", "");
  }, 50);

  return el;
};

/**
 * Enable the dialog close link.
 *
 * @return {NotifyX} for chaining
 * @api public
 */

NotifyX.prototype.closable = function() {
  this.el.addClass("closable");
  return this;
};

/**
 * Set the effect to `type`.
 *
 * @param {String} type
 * @return {NotifyX} for chaining
 * @api public
 */

NotifyX.prototype.effect = function(type) {
  this._effect = type;
  this.el.className = this.el.className + " " + type;
  return this;
};

/**
 * Show the NotifyX.
 *
 * @return {NotifyX} for chaining
 * @api public
 */

NotifyX.prototype.show = function() {
  var list = document.getElementById("notifications");
  list.insertBefore(this.el, list.firstChild);
  return this;
};

/**
 * Set the notification `type`.
 *
 * @param {String} type
 * @return {NotifyX} for chaining
 * @api public
 */

NotifyX.prototype.type = function(type) {
  this._type = type;
  this.el.className = this.el.className + " " + type;
  return this;
};

/**
 * Make it stick (clear hide timer), and make it closable.
 *
 * @return {NotifyX} for chaining
 * @api public
 */

NotifyX.prototype.sticky = function() {
  return this.hide(0).closable();
};

/**
 * Hide the dialog with optional delay of `ms`,
 * otherwise the notification is removed immediately.
 *
 * @return {Number} ms
 * @return {NotifyX} for chaining
 * @api public
 */

NotifyX.prototype.hide = function(ms) {
  var self = this;

  // duration
  if ("number" == typeof ms) {
    clearTimeout(this.timer);
    if (!ms) return this;
    this.timer = setTimeout(function() {
      self.hide();
    }, ms);
    return this;
  }

  // hide / remove
  this.el.className = this.el.className + " hide";
  if (this._effect) {
    setTimeout(
      function(self) {
        self.remove();
      },
      500,
      this
    );
  } else {
    self.remove();
  }

  return this;
};

/**
 * Hide the notification without potential animation.
 *
 * @return {Dialog} for chaining
 * @api public
 */

NotifyX.prototype.remove = function() {
  this.el.remove();
  return this;
};
