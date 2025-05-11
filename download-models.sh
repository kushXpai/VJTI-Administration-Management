#!/bin/bash
# Script to download face-api.js models

# Create directories
mkdir -p public/models

# Define model files to download
MODEL_BASE_URL="https://github.com/justadudewhohacks/face-api.js/raw/master/weights"

# Function to download file
download_file() {
    local url="$1"
    local output="$2"
    
    echo "Downloading $output..."
    if command -v curl &> /dev/null; then
        curl -L -o "$output" "$url"
    elif command -v wget &> /dev/null; then
        wget -O "$output" "$url"
    else
        echo "Error: Neither curl nor wget are installed. Please install one of them."
        exit 1
    fi
    
    echo "Downloaded $output"
}

# Download tiny face detector model
download_file "$MODEL_BASE_URL/tiny_face_detector_model-shard1" "public/models/tiny_face_detector_model-shard1"
download_file "$MODEL_BASE_URL/tiny_face_detector_model-weights_manifest.json" "public/models/tiny_face_detector_model-weights_manifest.json"

# Download face landmark model
download_file "$MODEL_BASE_URL/face_landmark_68_model-shard1" "public/models/face_landmark_68_model-shard1"
download_file "$MODEL_BASE_URL/face_landmark_68_model-weights_manifest.json" "public/models/face_landmark_68_model-weights_manifest.json"

# Download face recognition model
download_file "$MODEL_BASE_URL/face_recognition_model-shard1" "public/models/face_recognition_model-shard1"
download_file "$MODEL_BASE_URL/face_recognition_model-weights_manifest.json" "public/models/face_recognition_model-weights_manifest.json"

echo "All models downloaded successfully!"