document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnAdd");

  btn.addEventListener("click", () => {
    console.log("✅ Add button clicked");
    alert("Button works");
  });
});
