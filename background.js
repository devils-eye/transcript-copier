// Create context menu items when the extension is installed
function createContextMenu() {
  browser.contextMenus.create({
    id: "copy-transcript",
    title: "Copy Transcript",
    contexts: ["video", "page"], // Added "page" context for broader compatibility
    documentUrlPatterns: ["*://*.youtube.com/*"],
  });
}

// Create the context menu when the extension is installed
browser.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

// Recreate context menu when Firefox starts
browser.runtime.onStartup.addListener(() => {
  createContextMenu();
});

// Listen for clicks on the context menu item
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copy-transcript") {
    // Send a message to the content script to extract and copy the transcript
    browser.tabs
      .sendMessage(tab.id, { action: "copyTranscript" })
      .catch((error) => {
        console.error("Error sending message to content script:", error);
      });
  }
});
