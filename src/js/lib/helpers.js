var helpers = {};

helpers.notify = function(title, message, type, timer) {
    if (title && typeof title === "object" && typeof title.success !== "undefined") {
      message = title.success ? message || "Saved" : title.msg;
      type = title.success;
      title = null;
    }
    if (typeof type === "number" || typeof type === "boolean") {
      type = type ? "success" : "danger";
    }
    if (typeof title === "number" || typeof title === "boolean") {
      type = title ? "success" : "danger";
      title = null;
    }
    notify.notify(title, message, type, timer);
};

window.helpers = helpers;