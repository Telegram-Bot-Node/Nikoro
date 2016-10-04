#!/bin/bash

# Check for node and npm
if ! command -v node > /dev/null; then
	echo "\"node\" not found."
	echo "Please install Node.js: http://nodejs.org/"
	exit 1
fi
echo "Node.js found."

if ! command -v npm > /dev/null ; then
	echo "Please install npm."
	exit 1
fi
echo "npm found."

if ! command -v redis-server > /dev/null ; then
	echo "\"redis-server\" not found."
	echo "Please install the Redis server."
	exit 1
fi
echo "Redis found."

npm install
if [ $? -ne 0 ] ; then
	exit 1
fi
echo "Dependencies installed."

npm run build
if [ $? -ne 0 ] ; then
	exit 1
fi
echo "Codebase built."

npm run configure