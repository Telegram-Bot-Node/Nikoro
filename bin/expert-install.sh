#!/bin/bash

echo "Checking for Node.js..."
if ! command -v node > /dev/null; then
	echo "\"node\" not found."
	echo "Please install Node.js: http://nodejs.org/"
	exit 1
fi
echo "Node.js found."

echo "Checking for npm..."
if ! command -v npm > /dev/null ; then
	echo "Please install npm."
	exit 1
fi
echo "npm found."

echo "Installing dependencies..."
npm install
if [ $? -ne 0 ] ; then
	exit 1
fi
echo "Dependencies installed."

npm run configure:expert
