#!/bin/bash -v

cd extension
zip -r ../release/cicd-helper.zip ./*

cd ..

cp -f release/cicd-helper.zip release/cicd-helper.crx
