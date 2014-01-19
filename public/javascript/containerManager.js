define(["userManager"], function(UserManager) {
  function ContainerManager(wrapper) {
    this._init(wrapper);
  }

  ContainerManager.prototype = {
    // The element that the container manager is managing
    _wrapper: null,

    // Containers that aren't currently visible
    _inactiveContainers: null,

    // Containers that are currently visible
    _activeContainers: null,

    // The template for each container
    _template: null,

    // Instance of User Manager we use to fetch users
    _userManager: null,

    // We set each container to have a zIndex one further back
    _zIndexCounter: 1000,

    _init: function(wrapper) {
      this._wrapper = wrapper;

      this._userManager = new UserManager();

      this._inactiveContainers = [];
      this._activeContainers = [];

      this._template = document.getElementById("template").children[0];

      // 3 stacked and one to fade in
      for (var i = 0; i < 6; i++) {
        this._createContainer();
      }

      this._registerDrag();
    },

    // Create a new container element we can activate
    _createContainer: function() {
      var container = this._template.cloneNode(true);
      this._wrapper.insertBefore(container, this._wrapper.children[0]);
      this._deactivateContainer(container);

      this._setUpNextContainer();
    },

    // When we need a new container to use
    _activateContainer: function() {
      var container = this._inactiveContainers.pop();
      container.style.visibility = "";
      this._activeContainers.push(container);
      return container;
    },

    // When we are done using a container on the screen
    _deactivateContainer: function(container) {
      container.style.visibility = "hidden";
      this._inactiveContainers.push(container);
    },

    // Grab the next user and put them on the page
    _setUpNextContainer: function() {
      // In a real app, we would need to handle not having a next user
      // Likely using a callback or some sort of queue processing
      if (this._userManager.hasNextUser()) {
        var container = this._activateContainer();
        var user = this._userManager.getNextUser();

        container.style.webkitTransform = "";
        container.style.zIndex = this._zIndexCounter--;
        container.children[0].style.opacity = 0;
        container.children[1].style.opacity = 0;
        container.children[2].src = user.src;

        container.children[3].children[0].innerText = user.name;
      }
    },

    _getCurrentContainer: function() {
      return this._activeContainers[0];
    },

    // The container has been swiped far enough to be removed
    _containerFinished: function() {
      this._activeContainers.shift();
    },


    _registerDrag: function() {
      var self = this;

      // Where did we click when we started our drag
      var startX = 0;
      var startY = 0;

      // What was the end of our last translate?
      // aka. When we stop touching, what were the translates
      var translateX = 0;
      var translateY = 0;

      // How far are we to the edge. 0 is middle, 1 is right, -1 is left
      var xdist = 0;

      // Are we moving back to origin?
      var resetting = false;

      // What was our most recent translate values
      var shiftX = 0;
      var shiftY = 0;
      var rotate = 0;

      // How far horizontally do we need to drag for it to be a success
      var horizontalSuccess = .4;

      // Called when a drag is released that wasn't dragged far enough
      function reset() {
        resetting = true;
        var currentContainer = self._getCurrentContainer();

        var transitionEnd = function() {
          currentContainer.classList.remove("ani5");
          resetting = false;
          currentContainer.removeEventListener("webkitTransitionEnd", transitionEnd);
        }

        currentContainer.addEventListener("webkitTransitionEnd", transitionEnd);
        currentContainer.classList.add("ani5");
        currentContainer.children[0].style.opacity = 0;
        currentContainer.children[1].style.opacity = 0;
        currentContainer.style.webkitTransform = "translate3d(0px, 0px, 0px)";
      }

      function touchStart(e) {
        if (resetting) 
          return;

        var touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;

        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        var touchMove = function(e) {
          e.preventDefault();

          if (resetting)
            return;

          var touch = e.touches[0];

          shiftX = (touch.clientX - startX);
          shiftY = (touch.clientY - startY);

          xdist = shiftX / (windowWidth / 2);
          ydist = shiftY / (windowHeight / 2);

          rotate = (ydist * xdist) * 20 + (xdist * 15);

          var image = self._getCurrentContainer();

          var opacityRange = Math.min(1, xdist / horizontalSuccess);

          if (xdist > 0) {
            image.children[0].style.opacity = 0;
            image.children[1].style.opacity = opacityRange;
          } else if (xdist < 0) {
            image.children[0].style.opacity = -1 * opacityRange;
            image.children[1].style.opacity = 0;
          }

          image.style.webkitTransform = "translate3d(" + shiftX + "px, " + shiftY + "px, 0px) rotate(" + rotate + "deg)";
        };

        var touchEnd = function(e) {
          if (resetting)
            return;

          window.removeEventListener("touchmove", touchMove);
          window.removeEventListener("touchend", touchEnd);

          if (xdist > horizontalSuccess || xdist < -1 * horizontalSuccess) {

            var currentContainer = self._getCurrentContainer();
            self._containerFinished();

            currentContainer.classList.add("ani5");

            shiftX = windowWidth + 300;
            if (xdist < 0) {
              shiftX *= -1;
            }

            currentContainer.style.webkitTransform = "translate3d(" + shiftX + "px, " + shiftY + "px, 0px) rotate(" + rotate + "deg)";

            var transitionEnd = function() {
              currentContainer.classList.remove("ani5");
              self._deactivateContainer(currentContainer);

              // add a new one!
              self._setUpNextContainer();
              currentContainer.removeEventListener("webkitTransitionEnd", transitionEnd);
            }

            currentContainer.addEventListener("webkitTransitionEnd", transitionEnd);

            return;
          }

          reset();
        };

        if (resetting)
          return;

        window.addEventListener("touchmove", touchMove);
        window.addEventListener("touchend", touchEnd);
      };

      touchContainer.addEventListener("touchstart", touchStart);
    }
  };

  return ContainerManager;
});