const display = document.getElementById("display");
const historyList = document.getElementById("historyList");

// Load history from browser
window.onload = function () {
  const saved = JSON.parse(localStorage.getItem("history")) || [];
  saved.forEach(addToHistoryUI);
};

function appendValue(value) {
  display.value += value;
}

function clearDisplay() {
  display.value = "";
}

function deleteLast() {
  display.value = display.value.slice(0, -1);
}

function calculate() {
  try {
    let expression = display.value;
    let result = eval(expression);

    display.value = result;

    const entry = expression + " = " + result;
    saveToHistory(entry);
    addToHistoryUI(entry);

  } catch {
    display.value = "Error";
  }
}

// Save to local storage
function saveToHistory(entry) {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  history.unshift(entry);
  localStorage.setItem("history", JSON.stringify(history));
}

// Add to UI
function addToHistoryUI(entry) {
  const li = document.createElement("li");
  li.textContent = entry;
  historyList.prepend(li);
}

// Clear history
function clearHistory() {
  localStorage.removeItem("history");
  historyList.innerHTML = "";
}

// Keyboard support
document.addEventListener("keydown", function(event) {
  const key = event.key;

  if (!isNaN(key) || "+-*/.".includes(key)) {
    appendValue(key);
  } else if (key === "Enter") {
    calculate();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key.toLowerCase() === "c") {
    clearDisplay();
  }
});
