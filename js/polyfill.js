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
  return (element.textContent || element.innerText);
}

var classListAdd;
var classListRemove;
var classListContains;
if (document.documentElement.classList) {
  classListContains = function (element, value) {
    return element.classList.contains(value);
  };

  classListRemove = function (choice, s) {
    return element.classList.remove(value);
  };

  classListAdd = function (choice, s) {
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

