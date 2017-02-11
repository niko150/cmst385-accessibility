#! /usr/bin/env bash

if [ ! -f './dist/server.js' ]; then
export NODE_ENV=development;
export NPM_CONFIG_PRODUCTION=false;
    npm run clean;
export NODE_ENV=production;
export NPM_CONFIG_PRODUCTION=true;
    npm run build
fi

node dist/server.js