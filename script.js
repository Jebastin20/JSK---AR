
const scene = document.querySelector("#arScene");
const target = document.querySelector("#photoTarget");
const video = document.querySelector("#memoryVideo");
const status = document.querySelector("#arStatus");
const intro = document.querySelector("#intro");
const startCameraButton = document.querySelector("#startCameraButton");
const soundButton = document.querySelector("#soundButton");

let cameraStarted = false;
let targetVisible = false;
let soundEnabled = false;
let startingCamera = false;

function setStatus(message) {
  status.textContent = message;
}

// Prepare video. The camera does not start automatically.
video.muted = true;
video.loop = true;
video.playsInline = true;
video.volume = 1;
soundButton.disabled = true;

// Start AR only after the footer camera icon is tapped.
startCameraButton.addEventListener("click", async () => {
  if (cameraStarted || startingCamera) return;

  startingCamera = true;
  startCameraButton.disabled = true;
  startCameraButton.setAttribute("aria-label", "Starting AR camera");
  setStatus("Starting camera...");

  try {
    // Wait for A-Frame to finish initializing.
    if (!scene.hasLoaded) {
      await new Promise((resolve) => {
        scene.addEventListener("loaded", resolve, { once: true });
      });
    }

    const arSystem = scene.systems["mindar-image-system"];

    if (!arSystem) {
      throw new Error("MindAR image system is unavailable.");
    }

    await arSystem.start();

    cameraStarted = true;
    startCameraButton.setAttribute("aria-label", "AR camera is active");
    startCameraButton.title = "AR camera is active";

    setStatus("Camera ready — point it at your printed photo.");
  } catch (error) {
    console.error("Camera startup failed:", error);

    startCameraButton.disabled = false;
    startCameraButton.setAttribute("aria-label", "Retry AR camera");
    setStatus("Camera could not start. Check permission and try again.");
  } finally {
    startingCamera = false;
  }
});

// Play the video when MindAR recognizes the printed photo.
target.addEventListener("targetFound", async () => {
  targetVisible = true;
  intro.style.display = "none";
  soundButton.disabled = false;

  // Start muted first because browsers commonly block audio autoplay.
  video.muted = true;
  soundEnabled = false;
  soundButton.textContent = "🔊 Enable Sound";

  setStatus("Photo recognized — playing your memory...");

  try {
    await video.play();
    setStatus("Your memory is playing. Tap Enable Sound for audio.");
  } catch (error) {
    console.error("Video playback failed:", error);
    setStatus("Video could not play. Check video/memory.mp4.");
  }
});

// Pause playback when the photo leaves the camera view.
target.addEventListener("targetLost", () => {
  targetVisible = false;
  video.pause();
  video.muted = true;
  soundEnabled = false;

  soundButton.disabled = true;
  soundButton.textContent = "🔊 Enable Sound";
  intro.style.display = "";

  setStatus("Point your camera at your photo.");
});

// Enable audio directly from the user's tap.
soundButton.addEventListener("click", async () => {
  if (!targetVisible) {
    setStatus("Point your camera at your photo first.");
    return;
  }

  try {
    video.muted = false;
    video.volume = 1;

    // Calling play() inside the click handler helps satisfy
    // browser user-gesture requirements for audio.
    await video.play();

    soundEnabled = true;
    soundButton.textContent = "🔊 Sound On";
    setStatus("Enjoy your memory with sound ❤️");
  } catch (error) {
    video.muted = true;
    soundEnabled = false;

    console.error("Could not enable video audio:", error);
    soundButton.textContent = "🔊 Try Sound Again";
    setStatus("Sound was blocked. Tap the sound button to retry.");
  }
});

scene.addEventListener("arReady", () => {
  if (cameraStarted && !targetVisible) {
    setStatus("Camera ready — point it at your printed photo.");
  }
});

scene.addEventListener("arError", (event) => {
  console.error("AR error:", event.detail);
  setStatus("AR could not start. Check camera permission and retry.");
});

video.addEventListener("error", () => {
  console.error("Video loading error:", video.error);
  setStatus("Video file failed to load. Check video/memory.mp4.");
});
