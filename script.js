console.log("JSK Frames script loaded");
const scene = document.querySelector("#arScene");
const target = document.querySelector("#photoTarget");
const video = document.querySelector("#memoryVideo");
const status = document.querySelector("#arStatus");
const intro = document.querySelector("#intro");
const startCameraButton = document.querySelector("#startCameraButton");
const soundButton = document.querySelector("#soundButton");
const trackingPhoto = document.querySelector("#trackingPhoto");
const memoryOverlay = document.querySelector("#memoryOverlay");



function fitVideoInsidePhoto() {
  if (
    !trackingPhoto ||
    !video ||
    !memoryOverlay ||
    !trackingPhoto.naturalWidth ||
    !trackingPhoto.naturalHeight ||
    !video.videoWidth ||
    !video.videoHeight
  ) {
    return;
  }

  // MindAR target width is 1 unit.
  const photoWidth = 1;

  // Calculate the target photo's actual aspect ratio.
  const photoHeight =
    photoWidth * (trackingPhoto.naturalHeight / trackingPhoto.naturalWidth);

  // Calculate the video's original aspect ratio.
  const videoAspect = video.videoWidth / video.videoHeight;

  // Fit the complete video inside the photo without cropping.
  let width = photoWidth;
  let height = width / videoAspect;

  if (height > photoHeight) {
    height = photoHeight;
    width = height * videoAspect;
  }

  memoryOverlay.setAttribute("width", width);
  memoryOverlay.setAttribute("height", height);
  memoryOverlay.setAttribute("position", "0 0 0.02");
}

function updateVideoFit() {
  fitVideoInsidePhoto();
}

if (trackingPhoto) {
  trackingPhoto.addEventListener("load", updateVideoFit);
}

if (video) {
  video.addEventListener("loadedmetadata", updateVideoFit);
}

if (trackingPhoto?.complete && video?.readyState >= 1) {
  updateVideoFit();
}

