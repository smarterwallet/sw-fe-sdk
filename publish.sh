#!/bin/bash

rm -rf dist

npm run build
# npm publish
npm publish --tag beta

rm -rf dist