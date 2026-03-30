document.addEventListener("keydown", function(event) {
  const key = event.key;

  if (!isNaN(key) || "+-*/.".includes(key)) {
    appendValue(key);
  } else if (key === "Enter") {
    calculate();
  } else if (key === "Backspace") {
    let current = document.getElementById("display").value;
    document.getElementById("display").value = current.slice(0, -1);
  } else if (key.toLowerCase() === "c") {
    clearDisplay();
  }
});
