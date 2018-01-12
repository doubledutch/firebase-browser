#!/usr/bin/env node

const {fork} = require('child_process')
const path = require('path')
fork(path.join(__dirname, 'node_modules/react-scripts/bin/react-scripts'), ['start'])
