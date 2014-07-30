[].forEach.call(document.querySelectorAll(".smart-dropdown"), function (dropdown) {
  var input = dropdown.querySelector("input");
  var button = dropdown.querySelector("button");
  var choicesContainer = dropdown.querySelector("ul");
  var choices = toArray(choicesContainer.children);
  var selected;
  var filterString = "";
  var choicesFocused = false;
  var buttonFocused = false;

  function updateInputValue() {
    if (selected) {
      input.value = input.oldValue = textContent(selected);
    }
    else {
      input.oldValue = input.value;
    }
  }

  function choicesDisplayed() {
    return choicesContainer.style.display != "none";
  }

  function toggleChoices() {
    if (!choicesDisplayed()) {
      showChoices();
    }
    else {
      hideChoices();
    }
  }

  function showChoices() {
    choicesContainer.style.display = "";
    if (selected) {
      choicesContainer.scrollTop = selected.offsetTop + selected.offsetHeight > choicesContainer.offsetHeight
          ? selected.offsetTop - selected.offsetHeight
          : 0;
    }
  }

  function hideChoices() {
    choicesContainer.style.display = "none";
    filterChoices("");
  }

  function filtered(choice) {
    return choice.parentNode !== choicesContainer;
  }

  function selectedAvailable() {
    return selected && !filtered(selected);
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
        classListRemove(selected, "selected");
      }
      selected = choice;
      classListAdd(selected, "selected");
      updateInputValue();
    }
  }

  function scrollSelectedIntoView() {
    if (selectedAvailable()) {
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

  function selectNext() {
    var nextChoice;
    if (selectedAvailable()) {
      nextChoice = nextElementSibling(selected);
    }
    selectAndScollIntoView(nextChoice || firstElementChild(choicesContainer));
  }

  function selectPrevious() {
    var previousChoice;
    if (selectedAvailable()) {
      previousChoice = previousElementSibling(selected);
    }
    selectAndScollIntoView(previousChoice || lastElementChild(choicesContainer));
  }

  function selectFirstVisible() {
    var minHeight = choicesContainer.scrollTop;
    var length = choicesContainer.children.length;
    for (var i = 0; i < length; ++i) {
      var choice = choicesContainer.children[i];
      if (choice.offsetTop >= minHeight) {
        select(choicesContainer.children[i]);
        return;
      }
    }
    select(firstElementChild(choicesContainer));
  }

  function selectLastVisible() {
    var maxHeight = choicesContainer.scrollTop + choicesContainer.offsetHeight;
    var length = choicesContainer.children.length;
    for (var i = 1; i < length; ++i) {
      var choice = choicesContainer.children[i];
      if (choice.offsetTop + choice.offsetHeight > maxHeight) {
        select(choicesContainer.children[i - 1]);
        return;
      }
    }
    select(lastElementChild(choicesContainer));
  }

  function filterChoices(newFilterString) {
    if (newFilterString == filterString) {
      return;
    }
    if (newFilterString.indexOf(filterString) < 0) {
      var nextInList = firstElementChild(choicesContainer);
      choices.forEach(function (choice) {
        if (!filtered(choice)) {
          nextInList = nextElementSibling(choice);
          if (textContent(choice).indexOf(newFilterString) < 0) {
            choicesContainer.removeChild(choice);
          }
        }
        else if (textContent(choice).indexOf(newFilterString) >= 0) {
          choicesContainer.insertBefore(choice, nextInList);
        }
      });
    }
    else {
      toArray(choicesContainer.children).forEach(function (choice) {
        if (textContent(choice).indexOf(newFilterString) < 0) {
          choicesContainer.removeChild(choice);
        }
      });
    }
    filterString = newFilterString;
    scrollSelectedIntoView();
  }

  input.onclick = function () {
    if (!choicesDisplayed()) {
      showChoices();
    }
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
      if (!choicesDisplayed()) {
        showChoices();
      }
    }
    return false;
  };
  input.onkeydown = function (e) {
    e = e || window.event;
    if (!e.ctrlKey && !e.shiftKey && !e.altKey && choicesDisplayed()) {
      switch (e.keyCode) {
      case 0x21: // page up
        if (!selectedAvailable()) {
          selectAndScollIntoView(lastElementChild(choicesContainer));
        }
        else {
          choicesContainer.scrollTop = selected.offsetTop + selected.offsetHeight - choicesContainer.offsetHeight;
          selectFirstVisible();
        }
        return false;
      case 0x22: // page down
        if (!selectedAvailable()) {
          selectAndScollIntoView(firstElementChild(choicesContainer));
        }
        else {
          choicesContainer.scrollTop = selected.offsetTop;
          selectLastVisible();
        }
        return false;
      case 0x24: // home
        selectAndScollIntoView(firstElementChild(choicesContainer));
        return false;
      case 0x23: // end
        selectAndScollIntoView(lastElementChild(choicesContainer));
        return false;
      }
    }
    switch (e.keyCode) {
    case 0x0D: // enter
      if (choicesDisplayed()) {
        if (!selectedAvailable()) {
          select(firstElementChild(choicesContainer));
        }
        updateInputValue();
        hideChoices()
      }
      return false;
    case 0x1B: // escape
      if (choicesDisplayed()) {
        hideChoices();
      }
      return;
    case 0x28: // down
      if (e.ctrlKey && !choicesDisplayed()) {
        showChoices()
      }
      else {
        selectNext(selected);
      }
      return false;
    case 0x26: // up
      if (e.ctrlKey && !choicesDisplayed()) {
        showChoices()
      }
      else {
        selectPrevious(selected);
      }
      return false;
    case 0x20: // space
      if (e.ctrlKey) {
        filterChoices(input.value);
        if (!choicesDisplayed()) {
          showChoices();
        }
        return false;
      }
      break;
    }
  };

  function inputSiblingFocused() {
    return (buttonFocused || choicesFocused);
  }

  input.onblur = function (e) {
    setTimeout(function () {
      if (!inputSiblingFocused() && choicesDisplayed()) {
        hideChoices();
      }
      updateInputValue();
    }, 0);
  };

  button.onfocus = function (e) {
    buttonFocused = true;
  };
  button.onblur = function (e) {
    buttonFocused = false;
  };
  var buttonOnDblClick = null;
  button.onclick = function () {
    buttonOnDblClick = button.ondblclick;
    button.ondblclick = null;
    setTimeout(function () {
      button.ondblclick = buttonOnDblClick;
      toggleChoices();
      input.focus();
    });
    return false;
  };

  button.ondblclick = function () {
    toggleChoices();
    input.focus();
    return false;
  };

  choicesContainer.onfocus = function () {
    choicesFocused = true;
  };
  choicesContainer.onblur = function () {
    choicesFocused = false;
  };
  choicesContainer.onclick = function (e) {
    e = e || window.event;
    select(findClickedChoice(e));
    hideChoices();
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
      choice = nextElementSibling(choice);
    }
  }

  function createChoices(content) {
    var newChoices = [];
    Array.prototype.forEach.call(content, function (content) {
      var choice = document.createElement("li");
      choice.appendChild(content);
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
        if (textContent(choice).indexOf(filterString) >= 0) {
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
        if (textContent(choice).indexOf(filterString) >= 0) {
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
  Object.defineProperty(dropdown, "value", {
    get: function value() {
      return selected && textContent(selected);
    },
    set: function value(value) {
      select(choices.filter(function (choice) {
        return textContent(choice).indexOf(value) >= 0;
      })[0]);
    }
  });
});
