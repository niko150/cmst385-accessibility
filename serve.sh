#! /usr/bin/env bash

if [ ! -f './dist/server.js' ]; then
    npm clean;
    npm build
fi

node dist/server.js