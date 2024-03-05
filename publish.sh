#!/bin/bash

rm -rf dist

npm run build
npm publish

rm -rf dist