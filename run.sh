#!/bin/bash

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is not installed. Please install pip3 and try again."
    exit 1
fi

# Install dependencies if needed
if [ ! -f "requirements_installed" ]; then
    echo "Installing dependencies..."
    pip3 install -r requirements.txt
    touch requirements_installed
    echo "Dependencies installed successfully."
fi

# Run the application
echo "Starting Scholar Capsule..."
cd scholar_capsule
python3 app.py