define([], function() {
  function UserManager() {
  }

  UserManager.prototype = {

    _names: ["Fred W.", "George W.", "Ron B.", "Glen C.", "Tommy F."],
    _nameIndex: 0,
    
    _images: ["image1.png", "image2.png", "image3.png"],
    _imageIndex: 0,

    hasNextUser: function() {
      return true;
    },

    getNextUser: function() {
      var imageIndex = this._imageIndex++ % this._images.length;
      var nameIndex = this._nameIndex++ % this._names.length;
      return {
        name: this._names[nameIndex],
        src: this._images[imageIndex]
      }
    }
  };

  return UserManager;
});