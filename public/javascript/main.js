require(["containerManager"], function(ContainerManager) {
  
  function init() {
    document.addEventListener("touchmove", function(e) {
      e.preventDefault();
    }, {passive: false});

    var touchContainer = document.getElementById("touchContainer");
    var containerManager = new ContainerManager(touchContainer);
  }

  if (document.readyState === "interactive" || document.readyState === "complete") {
    init();
  }
  else {
    document.addEventListener("DOMContentLoaded", init, false);
  }
});
