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

echo "Checking for Redis..."
if ! command -v redis-server > /dev/null ; then
	echo "\"redis-server\" not found."
	echo "Please install the Redis server."
	exit 1
fi
if [ "`redis-cli PING`" != "PONG" ]
then
	echo "Couldn't connect to Redis."
	echo "Please start it."
	exit 1
fi
echo "Redis found."

echo "Installing dependencies..."
npm install
if [ $? -ne 0 ] ; then
	exit 1
fi
echo "Dependencies installed."

echo "Building codebase..."
npm run build
if [ $? -ne 0 ] ; then
	exit 1
fi
echo "Codebase built."

npm run configure