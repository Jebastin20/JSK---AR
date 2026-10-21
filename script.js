
const scene = document.querySelector("#arScene");
const target = document.querySelector("#photoTarget");
const video = document.querySelector("#memoryVideo");
const status = document.querySelector("#arStatus");
const intro = document.querySelector("#intro");

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
    setStatus("Photo found! Tap the screen to play your memory.");
  }
});

target.addEventListener("targetLost", () => {
  targetVisible = false;
  video.pause();
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

// Allow a tap to resume playback if the browser blocks autoplay.
document.addEventListener("pointerdown", async () => {
  if (targetVisible && video.paused) {
    try {
      await video.play();
      setStatus("Enjoy your memory ❤️");
    } catch (error) {
      console.warn("Playback could not start:", error);
    }
  }
});
