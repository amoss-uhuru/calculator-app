function deleteLast() {
  let current = document.getElementById("display").value;
  document.getElementById("display").value = current.slice(0, -1);
}
