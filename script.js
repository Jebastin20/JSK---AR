const scene = document.querySelector("#arScene");
const target = document.querySelector("#photoTarget");
const video = document.querySelector("#memoryVideo");
const status = document.querySelector("#arStatus");
const intro = document.querySelector("#intro");
const soundButton = document.querySelector("#soundButton");

const startCameraButton = document.querySelector("#startCameraButton");

startCameraButton.addEventListener("click", async () => {
  startCameraButton.disabled = true;
  startCameraButton.textContent = "Starting camera...";

  try {
    const arSystem = scene.systems["mindar-image-system"];
    await arSystem.start();

    startCameraButton.style.display = "none";
    setStatus("Camera ready — point it at your photo.");
  } catch (error) {
    console.error("Camera startup failed:", error);
    startCameraButton.disabled = false;
    startCameraButton.textContent = "📷 Try Again";
    setStatus("Camera couldn't start. Check camera permissions.");
  }
});


let targetVisible = false;

function setStatus(message) {
  status.textContent = message;
}

video.muted = true;
video.loop = true;
video.playsInline = true;

target.addEventListener("targetFound", async () => {
  targetVisible = true;
  intro.style.display = "none";
  setStatus("Your memory is coming alive ✨");

  try {
    await video.play();
  } catch (error) {
    console.warn("Video playback needs user interaction:", error);
    setStatus("Photo found! Tap Play Memory to start.");
  }
});

target.addEventListener("targetLost", () => {
  targetVisible = false;
  video.pause();
  video.muted = true;

  soundButton.textContent = "🔊 Enable Sound";
  intro.style.display = "";
  setStatus("Point your camera at your photo to begin.");
});

scene.addEventListener("arReady", () => {
  setStatus("Camera ready — point it at your printed photo.");
});

scene.addEventListener("arError", (event) => {
  console.error("AR startup error:", event.detail);
  setStatus("Camera could not start. Check permissions and try again.");
});

soundButton.addEventListener("click", async () => {
  if (!targetVisible) {
    setStatus("Point your camera at your photo first.");
    return;
  }

  try {
    video.muted = false;
    video.volume = 1;
    await video.play();

    soundButton.textContent = "🔊 Sound On";
    setStatus("Enjoy your memory with sound ❤️");
  } catch (error) {
    console.error("Audio playback failed:", error);
    setStatus("Couldn't enable sound. Tap the button to try again.");
  }
});

// Resume playback if the browser blocks autoplay.
document.addEventListener("pointerdown", async (event) => {
  if (
    targetVisible &&
    video.paused &&
    !event.target.closest("#soundButton")
  ) {
    try {
      await video.play();
    } catch (error) {
      console.warn("Playback could not start:", error);
    }
  }
});