#!/bin/bash

# Create a zip file of the extension
zip -r youtube-transcript-copier.zip manifest.json background.js content_scripts/ icons/ -x "*.git*"

echo "Extension packaged as youtube-transcript-copier.zip"
