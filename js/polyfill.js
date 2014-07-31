if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (callback) {
    var length = this.length;
    for (var i = 0; i < length; ++i) {
      callback(this[i]);
    }
  };
}

if (!Array.prototype.filter) {
  Array.prototype.filter = function (callback) {
    var result = [];
    var length = this.length;
    for (var i = 0; i < length; ++i) {
      var element = this[i];
      if (callback(element)) {
        result.push(element);
      }
    }
    return result;
  };
}

if (typeof document.documentElement.nextElementSibling === "undefined") {
  Object.defineProperty(Element.prototype, "nextElementSibling", {
    get: function () {
      for (var sibling = this.nextSibling; sibling; sibling = sibling.nextSibling) {
        if (sibling instanceof Element) {
          break;
        }
      }
      return sibling;
    }
  });
}

if (typeof document.documentElement.previousElementSibling === "undefined") {
  Object.defineProperty(Element.prototype, "previousElementSibling", {
    get: function () {
      for (var sibling = this.previousSibling; sibling; sibling = sibling.previousSibling) {
        if (sibling instanceof Element) {
          break;
        }
      }
      return sibling;
    }
  });
}
