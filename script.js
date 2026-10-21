
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

function setStatus(message) {
  status.textContent = message;
}

// Prepare the video without opening the camera.
video.loop = true;
video.playsInline = true;
video.muted = true;
video.volume = 1;
soundButton.disabled = true;

// Start the camera only after the user clicks the button.
startCameraButton.addEventListener("click", async () => {
  if (cameraStarted) return;

  startCameraButton.disabled = true;
  startCameraButton.textContent = "Starting camera...";

  try {
    const arSystem = scene.systems["mindar-image-system"];

    if (!arSystem) {
      throw new Error("AR system is not ready.");
    }

    await arSystem.start();

    cameraStarted = true;
    startCameraButton.style.display = "none";

    setStatus("Camera ready — point it at your printed photo.");
  } catch (error) {
    console.error("Camera startup failed:", error);

    startCameraButton.disabled = false;
    startCameraButton.textContent = "📷 Try Again";

    setStatus("Camera couldn't start. Check permissions and try again.");
  }
});

// When MindAR recognizes the printed photo.
target.addEventListener("targetFound", async () => {
  targetVisible = true;
  intro.style.display = "none";
  soundButton.disabled = false;

  setStatus("Photo recognized! Playing your memory...");

  // Try to play with sound first.
  try {
    video.muted = false;
    video.volume = 1;

    await video.play();

    soundEnabled = true;
    soundButton.textContent = "🔊 Sound On";
    setStatus("Enjoy your memory with sound ❤️");
  } catch (error) {
    console.warn("Sound autoplay was blocked:", error);

    // Keep the actual video visible by trying muted playback.
    try {
      video.muted = true;
      await video.play();

      soundEnabled = false;
      soundButton.textContent = "🔊 Enable Sound";
      setStatus("Memory playing. Tap Enable Sound for audio.");
    } catch (playError) {
      console.error("Video playback failed:", playError);
      setStatus("Video couldn't play. Check the video file.");
    }
  }
});

// When the printed photo leaves the camera view.
target.addEventListener("targetLost", () => {
  targetVisible = false;
  video.pause();
  video.muted = true;
  soundEnabled = false;

  soundButton.textContent = "🔊 Enable Sound";
  soundButton.disabled = true;

  // Show the introduction again only after the camera has started.
  if (cameraStarted) {
    intro.style.display = "";
    startCameraButton.style.display = "none";
  }

  setStatus("Point your camera at your photo.");
});

// Let the user enable audio with a direct button click.
soundButton.addEventListener("click", async () => {
  if (!targetVisible) {
    setStatus("Point your camera at your photo first.");
    return;
  }

  try {
    video.muted = false;
    video.volume = 1;

    await video.play();

    soundEnabled = true;
    soundButton.textContent = "🔊 Sound On";
    setStatus("Enjoy your memory with sound ❤️");
  } catch (error) {
    console.error("Could not enable audio:", error);

    soundButton.textContent = "🔊 Try Sound Again";
    setStatus("Sound was blocked. Tap the button to retry.");
  }
});

// MindAR status events.
scene.addEventListener("arReady", () => {
  if (cameraStarted) {
    setStatus("Camera ready — point it at your printed photo.");
  }
});

scene.addEventListener("arError", (event) => {
  console.error("AR startup error:", event.detail);
  setStatus("Camera could not start. Check permissions and try again.");
});

// Report video loading errors in the browser console.
video.addEventListener("error", () => {
  console.error("Video file could not load:", video.error);
  setStatus("Video file couldn't load. Check video/memory.mp4.");
});
