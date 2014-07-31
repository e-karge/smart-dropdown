[].forEach.call(document.querySelectorAll(".smart-dropdown"), function (dropdown) {
  while (dropdown.lastChild) {
    dropdown.removeChild(dropdown.lastChild);
  }
  var input = dropdown.appendChild(document.createElement("input"));
  var button = dropdown.appendChild(document.createElement("button"));
  var choicesContainer = dropdown.appendChild(document.createElement("ul"));
  var choices = [];
  var selected;
  var filterString = "";

  button.tabIndex = -1;
  button.setAttribute("unselectable", "on");

  choicesContainer.tabIndex = -1;
  choicesContainer.setAttribute("unselectable", "on");
  choicesContainer.style.display = "none";

  function updateInputValue() {
    if (selected) {
      input.value = input.oldValue = selected.textContent;
    }
    else {
      input.oldValue = input.value;
    }
  }

  function selectedSelectable() {
    return selected && selected.selectable;
  }

  function scrollIntoView(choice) {
    var scrollTopMax = choice.offsetTop - choice.offsetHeight;
    var scrollTopMin = choice.offsetTop - choicesContainer.offsetHeight + 2 * choice.offsetHeight;
    if (choicesContainer.scrollTop > scrollTopMax) {
      choicesContainer.scrollTop = scrollTopMax;
    }
    else if (choicesContainer.scrollTop < scrollTopMin) {
      choicesContainer.scrollTop = scrollTopMin - 1;
    }
  }

  function select(choice) {
    if (choice) {
      if (selected) {
        selected.className = selected.className.replace(/ *\bselected\b */g, " ").replace(/^ +| +$/g, "");
      }
      selected = choice;
      if (!selected.className.match(/\bselected\b/)) {
        selected.className = selected.className.replace(/\b$/, " ").concat("selected");
      }
      updateInputValue();
    }
  }

  function scrollSelectedIntoView() {
    if (selectedSelectable()) {
      scrollIntoView(selected);
    }
    else {
      choicesContainer.scrollTop = 0;
    }
  }

  function selectAndScollIntoView(choice) {
    select(choice);
    scrollSelectedIntoView();
  }

  function selectBelow(minHeight) {
    var length = choicesContainer.children.length;
    for (var i = 0; i < length; ++i) {
      var choice = choicesContainer.children[i];
      if (choice.offsetTop >= minHeight) {
        select(choicesContainer.children[i]);
        return;
      }
    }
    select(dropdown.firstSelectableChoice);
  }

  function selectAbove(maxHeight) {
    var length = choicesContainer.children.length;
    for (var i = 1; i < length; ++i) {
      var choice = choicesContainer.children[i];
      if (choice.offsetTop + choice.offsetHeight > maxHeight) {
        select(choicesContainer.children[i - 1]);
        return;
      }
    }
    select(dropdown.lastSelectableChoice);
  }

  function refilterChoices(newFilterString) {
    var nextInList = dropdown.firstSelectableChoice;
    choices.forEach(function (choice) {
      if (choice.selectable) {
        nextInList = choice.nextElementSibling;
        if (!choice.contentMatches(newFilterString)) {
          choicesContainer.removeChild(choice);
        }
      }
      else if (choice.contentMatches(newFilterString)) {
        choicesContainer.insertBefore(choice, nextInList);
      }
    });
  }

  function refineFilter(newFilterString) {
    var filteredChoices = [];
    var length = choicesContainer.children.length;
    for (var i = 0; i < length; ++i) {
      var choice = choicesContainer.children[i];
      if (!choice.contentMatches(newFilterString)) {
        filteredChoices.push(choice);
      }
    }
    filteredChoices.forEach(function (choice) {
      choicesContainer.removeChild(choice);
    });
  }

  function filterChoices(newFilterString) {
    if (newFilterString.indexOf(filterString) < 0) {
      refilterChoices(newFilterString);
    }
    else if (newFilterString != filterString) {
      refineFilter(newFilterString);
    }
    else {
      return;
    }
    filterString = newFilterString;
    scrollSelectedIntoView();
  }

  input.onclick = function () {
    dropdown.showChoices();
  };
  input.onkeyup = function (e) {
    e = e || window.event;
    if (e.keyCode == 0x1B) { // escape
      updateInputValue();
      return;
    }
    else if (input.oldValue != input.value) {
      input.oldValue = input.value;
      filterChoices(input.value);
      dropdown.showChoices();
    }
    return false;
  };
  input.onkeydown = function (e) {
    e = e || window.event;
    if (!e.ctrlKey && !e.shiftKey && !e.altKey && dropdown.choicesVisible) {
      switch (e.keyCode) {
        case 0x21: // page up
          if (!selectedSelectable()) {
            selectAndScollIntoView(dropdown.lastSelectableChoice);
          }
          else {
            var newTop = selected.offsetTop + selected.offsetHeight - choicesContainer.clientTop - choicesContainer.clientHeight;
            selectBelow(newTop);
            choicesContainer.scrollTop = newTop;
          }
          return false;
        case 0x22: // page down
          if (!selectedSelectable()) {
            selectAndScollIntoView(dropdown.firstSelectableChoice);
          }
          else {
            var newTop = selected.offsetTop - choicesContainer.clientTop;
            selectAbove(newTop + choicesContainer.offsetHeight);
            choicesContainer.scrollTop = newTop;
          }
          return false;
        case 0x24: // home
          selectAndScollIntoView(dropdown.firstSelectableChoice);
          return false;
        case 0x23: // end
          selectAndScollIntoView(dropdown.lastSelectableChoice);
          return false;
      }
    }
    switch (e.keyCode) {
      case 0x0D: // enter
        if (dropdown.choicesVisible) {
          if (!selectedSelectable()) {
            select(dropdown.firstSelectableChoice);
          }
          updateInputValue();
          dropdown.hideChoices()
        }
        return false;
      case 0x1B: // escape
        dropdown.hideChoices();
        return;
      case 0x28: // down
        if (e.ctrlKey && !dropdown.choicesVisible) {
          dropdown.showChoices()
        }
        else {
          dropdown.selectNext();
        }
        return false;
      case 0x26: // up
        if (e.ctrlKey && !dropdown.choicesVisible) {
          dropdown.showChoices()
        }
        else {
          dropdown.selectPrevious();
        }
        return false;
      case 0x20: // space
        if (e.ctrlKey) {
          filterChoices(input.value);
          dropdown.showChoices();
          return false;
        }
        break;
    }
  };

  function inputSiblingFocused() {
    return document.activeElement === button || document.activeElement === choicesContainer;
  }

  input.onblur = function (e) {
    setTimeout(function () {
      if (!inputSiblingFocused()) {
        dropdown.hideChoices();
      }
      updateInputValue();
    }, 0);
  };

  var buttonOnDblClick = null;
  button.onclick = function () {
    buttonOnDblClick = button.ondblclick;
    button.ondblclick = null;
    setTimeout(function () {
      button.ondblclick = buttonOnDblClick;
      dropdown.toggleChoices();
      input.focus();
    });
    return false;
  };
  button.ondblclick = function () {
    dropdown.toggleChoices();
    input.focus();
    return false;
  };

  choicesContainer.onclick = function (e) {
    e = e || window.event;
    select(findClickedChoice(e));
    dropdown.hideChoices();
    input.focus();
  };
  function findClickedChoice(e) {
    var choice = e.target || e.srcElement;
    while (choice && choice.parentElement !== choicesContainer) {
      choice = choice.parentElement;
    }
    return choice;
  }

  function findNextAvailable(choice) {
    while (choice) {
      if (choice.parentNode === choicesContainer) {
        return choice;
      }
      choice = choice.nextElementSibling;
    }
  }

  function createChoices(content) {
    var newChoices = [];
    Array.prototype.forEach.call(content, function (content) {
      var choice = document.createElement("li");
      choice.appendChild(content);
      Object.defineProperty(choice, "contentMatches", {
        value: function (string) {
          return this.textContent.indexOf(string) >= 0;
        }
      });
      Object.defineProperty(choice, "selectable", {
        get: function selectable() {
          return choice.parentNode === choicesContainer;
        }
      });
      if (!choice.textContent) {
        choice.textContent = choice.innerText;
      }
      newChoices.push(choice);
    });
    return newChoices;
  }

  Object.defineProperty(dropdown, "removeChoice", {
    value: function removeChoice(index, count) {
      count = count === undefined ? 1 : count;
      var removed = choices.splice(index, count);
      removed.forEach(function (choice) {
        choicesContainer.removeChild(choice);
      });
      return removed;
    }
  });
  Object.defineProperty(dropdown, "insertChoice", {
    value: function insertChoice(index) {
      var newChoices = createChoices(Array.prototype.slice.call(arguments, 1));
      var nextInList = findNextAvailable(choices[index]);
      Array.prototype.splice.bind(choices, index, 0).apply(choices, newChoices);
      newChoices.forEach(function (choice) {
        if (choice.contentMatches(filterString)) {
          choicesContainer.insertBefore(choice, nextInList);
        }
      });
      return newChoices;
    }
  });
  Object.defineProperty(dropdown, "appendChoice", {
    value: function appendChoice() {
      var newChoices = createChoices(arguments);
      choices = choices.concat(newChoices);
      newChoices.forEach(function (choice) {
        if (choice.contentMatches(filterString)) {
          choicesContainer.appendChild(choice);
        }
      });
      return newChoices;
    }
  });
  Object.defineProperty(dropdown, "selectedIndex", {
    get: function selectedIndex() {
      return choices.indexOf(selected);
    },
    set: function selectedIndex(index) {
      select(choices[index]);
    }
  });
  Object.defineProperty(dropdown, "choicesVisible", {
    get: function choicesVisible() {
      return choicesContainer.style.display != "none";
    }
  });
  Object.defineProperty(dropdown, "showChoices", {
    value: function showChoices() {
      if (!this.choicesVisible) {
        choicesContainer.style.visibility = "hidden";
        try {
          choicesContainer.style.display = "";
          var viewportSpaceAboveDropdown = dropdown.offsetTop;
          for (element = dropdown.parentNode; element instanceof Element; element = element.parentNode) {
            viewportSpaceAboveDropdown += element.offsetTop - element.scrollTop;
          }
          var viewportSpaceBelowDropdown = document.documentElement.clientHeight - viewportSpaceAboveDropdown - dropdown.offsetHeight;
          console.log(viewportSpaceBelowDropdown, " ", viewportSpaceAboveDropdown, " ", choicesContainer.offsetHeight, " ", viewportSpaceBelowDropdown < Math.min(choicesContainer.offsetHeight, viewportSpaceAboveDropdown));
          if (viewportSpaceBelowDropdown < Math.min(choicesContainer.offsetHeight, viewportSpaceAboveDropdown)) {
            choicesContainer.style.bottom = dropdown.clientHeight + "px";
          }
          else {
            choicesContainer.style.bottom = "";
          }
          scrollSelectedIntoView();
        }
        finally {
          choicesContainer.style.visibility = "";
        }
      }
    }
  });
  Object.defineProperty(dropdown, "hideChoices", {
    value: function hideChoices() {
      if (this.choicesVisible) {
        choicesContainer.style.display = "none";
        filterChoices("");
      }
    }
  });
  Object.defineProperty(dropdown, "toggleChoices", {
    value: function toggleChoices() {
      if (!this.choicesVisible) {
        this.showChoices();
      }
      else {
        this.hideChoices();
      }
    }
  });
  Object.defineProperty(dropdown, "selectNext", {
    value: function selectNext() {
      var nextChoice;
      if (selectedSelectable()) {
        nextChoice = selected.nextElementSibling;
      }
      selectAndScollIntoView(nextChoice || dropdown.firstSelectableChoice);
    }
  });
  Object.defineProperty(dropdown, "selectPrevious", {
    value: function selectPrevious() {
      var previousChoice;
      if (selectedSelectable()) {
        previousChoice = selected.previousElementSibling;
      }
      selectAndScollIntoView(previousChoice || dropdown.lastSelectableChoice);
    }
  });
  Object.defineProperty(dropdown, "firstSelectableChoice", {
    get: choicesContainer.firstElementChild ?
         function () {
           return choicesContainer.firstElementChild;
         } :
         function () {
           for (var child = choicesContainer.firstChild; child; child = child.nextSibling) {
             if (child instanceof Element) {
               break;
             }
           }
           return child;
         }
  });
  Object.defineProperty(dropdown, "lastSelectableChoice", {
    get: choicesContainer.lastElementChild ?
         function () {
           return choicesContainer.lastElementChild;
         } :
         function () {
           for (var child = choicesContainer.lastChild; child; child = child.previousSibling) {
             if (child instanceof Element) {
               break;
             }
           }
           return child;
         }
  });
  Object.defineProperty(dropdown, "value", {
    get: function value() {
      return selected && selected.textContent;
    },
    set: function value(value) {
      select(choices.filter(function (choice) {
        return choice.contentMatches(value);
      })[0]);
    }
  });
});
