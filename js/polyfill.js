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

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+/, '').replace(/\s+$/, '')
  };
}

function textContent(element) {
  return element.textContent || (element.textContent = element.innerText);
}

var classListAdd;
var classListRemove;
var classListContains;
if (document.documentElement.classList) {
  classListContains = function (element, value) {
    return element.classList.contains(value);
  };

  classListRemove = function (element, value) {
    return element.classList.remove(value);
  };

  classListAdd = function (element, value) {
    return element.classList.add(value);
  };
}
else {
  classListContains = function (element, value) {
    return (" " + element.getAttribute("class") + " ").indexOf(" " + value + " ") >= 0;
  };

  classListRemove = function (element, value) {
    element.setAttribute("class", (" " + element.getAttribute("class") + " ").split(" " + value + " ").join(" ").trim());
  };

  classListAdd = function (element, value) {
    classListRemove(element, value);
    element.setAttribute("class", (element.getAttribute("class") + " " + value).trim());
  };
}

function toArray(arrayLike) {
  var result = [];
  var length = arrayLike.length;
  for (var i = 0; i < length; ++i) {
    result.push(arrayLike[i]);
  }
  return result;
}

var nextElementSibling;
if (typeof document.documentElement.nextElementSibling != "undefined") {
  nextElementSibling = function (element) {
    return element.nextElementSibling;
  };
} else {
  nextElementSibling = function (element) {
    for (var sibling = element.nextSibling; sibling; sibling = sibling.nextSibling) {
      if (sibling instanceof Element) {
        break;
      }
    }
    return sibling;
  };
}

var previousElementSibling;
if (typeof document.documentElement.previousElementSibling != "undefined") {
  previousElementSibling = function (element) {
    return element.previousElementSibling;
  };
} else {
  previousElementSibling = function (element) {
    for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
      if (sibling instanceof Element) {
        break;
      }
    }
    return sibling;
  };
}

var firstElementChild;
if (typeof document.documentElement.firstElementChild != "undefined") {
  firstElementChild = function (element) {
    return element.firstElementChild;
  };
} else {
  firstElementChild = function (element) {
    for (var child = element.firstChild; child; child = child.nextSibling) {
      if (child instanceof Element) {
        break;
      }
    }
    return child;
  };
}

var lastElementChild;
if (typeof document.documentElement.lastElementChild != "undefined") {
  lastElementChild = function (element) {
    return element.lastElementChild;
  };
} else {
  lastElementChild = function (element) {
    for (var child = element.lastChild; child; child = child.previousSibling) {
      if (child instanceof Element) {
        break;
      }
    }
    return child;
  };
}
