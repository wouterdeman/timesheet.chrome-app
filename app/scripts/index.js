'use strict'

document.addEventListener("DOMContentLoaded", function() {
 var closeButton = document.querySelector('#close-button');
  closeButton.addEventListener('click', function(e) {
    window.close();
  });
}, false);