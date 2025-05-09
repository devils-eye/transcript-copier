// Listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "copyTranscript") {
    extractAndCopyTranscript();
  }
});

// Function to extract and copy the transcript
async function extractAndCopyTranscript() {
  try {
    // Get the video ID from the URL
    const videoId = new URLSearchParams(window.location.search).get("v");
    if (!videoId) {
      alert(
        "Could not find video ID. Make sure you're on a YouTube video page."
      );
      return;
    }

    // Extract the transcript
    const transcript = await getTranscript(videoId);

    // Copy to clipboard
    await copyToClipboard(transcript);

    // Notify the user
    showNotification("Transcript copied to clipboard!");
  } catch (error) {
    console.error("Error extracting transcript:", error);
    showNotification(
      "Error: Could not extract transcript. Make sure the video has captions available."
    );
  }
}

// Function to get the transcript
async function getTranscript(videoId) {
  // Define regex to extract player response
  const YT_INITIAL_PLAYER_RESPONSE_RE =
    /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;

  // Try to get player from window object first
  let player = window.ytInitialPlayerResponse;

  // If not available or doesn't match current video, fetch it
  if (!player || videoId !== player.videoDetails?.videoId) {
    const response = await fetch("https://www.youtube.com/watch?v=" + videoId);
    const body = await response.text();

    const playerResponse = body.match(YT_INITIAL_PLAYER_RESPONSE_RE);
    if (!playerResponse) {
      throw new Error("Unable to parse player response");
    }

    player = JSON.parse(playerResponse[1]);
  }

  // Check if captions are available
  if (
    !player.captions ||
    !player.captions.playerCaptionsTracklistRenderer ||
    !player.captions.playerCaptionsTracklistRenderer.captionTracks ||
    player.captions.playerCaptionsTracklistRenderer.captionTracks.length === 0
  ) {
    throw new Error("No captions available for this video");
  }

  // Get the tracks and sort them by priority (English and manual captions first)
  const tracks = player.captions.playerCaptionsTracklistRenderer.captionTracks;
  tracks.sort(compareTracks);

  // Fetch the transcript
  const response = await fetch(tracks[0].baseUrl + "&fmt=json3");
  const transcriptData = await response.json();

  // Parse the transcript
  const parsedTranscript = transcriptData.events
    // Remove invalid segments
    .filter((x) => x.segs)
    // Concatenate into single long string
    .map((x) => {
      return x.segs.map((y) => y.utf8).join(" ");
    })
    .join(" ")
    // Remove invalid characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Replace any whitespace with a single space
    .replace(/\s+/g, " ");

  return parsedTranscript;
}

// Function to compare tracks for sorting
function compareTracks(track1, track2) {
  const langCode1 = track1.languageCode;
  const langCode2 = track2.languageCode;

  if (langCode1 === "en" && langCode2 !== "en") {
    return -1; // English comes first
  } else if (langCode1 !== "en" && langCode2 === "en") {
    return 1; // English comes first
  } else if (track1.kind !== "asr" && track2.kind === "asr") {
    return -1; // Non-ASR (manual captions) comes first
  } else if (track1.kind === "asr" && track2.kind !== "asr") {
    return 1; // Non-ASR comes first
  }

  return 0; // Preserve order if both have same priority
}

// Function to copy text to clipboard
async function copyToClipboard(text) {
  try {
    // Try using the modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback to execCommand
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (!successful) {
      throw new Error("execCommand copy failed");
    }
  } catch (err) {
    console.error("Copy failed:", err);
    throw err;
  }
}

// Function to show a notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div");

  // Add an icon and the message
  notification.innerHTML = `
    <div style="display: flex; align-items: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#4CAF50" style="margin-right: 10px;">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
      <span>${message}</span>
    </div>
  `;

  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px 30px;
    border-radius: 8px;
    z-index: 99999;
    font-family: Arial, sans-serif;
    font-size: 18px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    border: 3px solid #4CAF50;
    min-width: 300px;
    text-align: center;
  `;

  // Add to page
  document.body.appendChild(notification);

  // Add fade-out animation
  setTimeout(() => {
    notification.style.transition = "opacity 0.5s ease-out";
    notification.style.opacity = "0";
  }, 2500);

  // Remove after animation completes
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}
