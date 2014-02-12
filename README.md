## Introduction

This is our chrome app that will authenticate a user and start posting location information to the timesheet service

## Development guidelines

Required:
- Node.js
- Yeoman 1.0+ (Bower, Grunt, Yeoman)

1. Install node package => npm install
2. Add the key entry in devkey.txt to the manifest
3. Add the extension to you chrome://extensions
4. Debug using the task: grunt debug
5. Happy building and debugging

## Deployment guidelines

Required:
- Chrome app account with access to our dev dashboard

1. run grunt build to create a new package
2. upload the package to the dev dashboard
3. publish this new version to the chrome app store
