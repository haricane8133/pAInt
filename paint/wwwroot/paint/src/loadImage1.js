// This, along with loadImage2.js, act as a mechanism of loading the RGB starting image of an image from the gallery directly upon redirect
// This kind of split up of code is required as the URL is re written by sessions.js which is supposed to be called before we replace the image, and so this is the only way possible for us to pass the information required
// This code only figures out whether there is a need to load any image at the start
const urlParams = new URLSearchParams(window.location.search);
const startBlobImg = urlParams.get('startBlobImg');