# gh-helpers
[![NPM version](https://img.shields.io/npm/v/gh-helpers.svg)](http://npmjs.com/package/gh-helpers)
[![Build Status](https://github.com/extremeheat/gh-helpers/actions/workflows/ci.yml/badge.svg)](https://github.com/extremeheat/gh-helpers/actions/workflows/)
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/extremeheat/gh-helpers)

Various helper methods for Github Actions/API automation

### Install
```
npm install gh-actions
```

### Usage
Within Github Actions, just
```js
const github = require('gh-helpers')()
```
Outside example over API for repo at PrismarineJS/vec3, make sure to specify your PAT with perms to the repo
```js
const github = require('gh-helpers')({
  repo: { owner: 'PrismarineJS', name: 'vec3' }
}, GITHUB_PAT)
```

### API

See src/index.d.ts for info on the API
