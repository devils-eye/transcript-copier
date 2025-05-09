# YouTube Transcript Copier

A Firefox extension that allows you to quickly copy YouTube video transcripts to your clipboard.

## Features

- Right-click on any YouTube video to copy its transcript
- Works with any YouTube video that has captions available
- Simple and lightweight with minimal interface changes
- Prioritizes English and manually created captions when available
- Compatible with other YouTube enhancement extensions

## Installation

### From Firefox Add-ons (Recommended)

1. Visit the Firefox Add-ons store (link will be available after publishing)
2. Click "Add to Firefox"
3. Follow the prompts to complete installation

### Manual Installation (Development)

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the sidebar
4. Click "Load Temporary Add-on..."
5. Navigate to the directory where you saved this extension and select the `manifest.json` file

## Usage

1. Navigate to any YouTube video
2. Right-click on the video
3. Select "Copy Transcript" from the context menu
4. The transcript will be copied to your clipboard
5. A notification will appear when the transcript has been copied

### Troubleshooting

If you're experiencing issues:

- Make sure you're on a YouTube video page (URL should contain "youtube.com/watch")
- Ensure the video has captions available (most YouTube videos do)
- Try refreshing the page if the context menu option doesn't appear
- If you see CORS or CSP errors in the console, these are usually related to other extensions and shouldn't affect our functionality
- If you're using other YouTube enhancement extensions like Unhook and experiencing issues, try disabling them temporarily to see if that resolves the problem

## Permissions

This extension requires the following permissions:

- `contextMenus`: To add the "Copy Transcript" option to the right-click menu
- `clipboardWrite`: To copy the transcript to your clipboard
- `activeTab`: To access the current tab's URL and content
- `tabs`: To communicate between background and content scripts
- Access to YouTube domains: To extract the transcript data

## Development

This extension uses standard web technologies:

- JavaScript
- Firefox WebExtension APIs

## License

MIT License

## Credits

- Transcript extraction method adapted from [blog.nidhin.dev](https://blog.nidhin.dev/extracting-youtube-transcripts-with-javascript)
