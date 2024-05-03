## 0.3.2
* [Update github.js fix no token handling on Github actions](https://github.com/extremeheat/gh-helpers/commit/79a7770eb8297748460c8d0d5125de19cce1662a) (thanks @extremeheat)
* [Update github.js _sendRequestWithCURL json response handling](https://github.com/extremeheat/gh-helpers/commit/c0ccfa037eab4d3d3beecb222dfe20689c16259c) (thanks @extremeheat)

## 0.3.1
* [Add mergePullRequest method (#23)](https://github.com/extremeheat/gh-helpers/commit/2d00e80ee3fcc7926df2809e41b567690a67d68a) (thanks @extremeheat)
* [Update waitForPRChecks handling (#24)](https://github.com/extremeheat/gh-helpers/commit/836333c669b43875ae2377112b78307581540662) (thanks @extremeheat)

## 0.3.0
* [Breaking updates to hook callback args (#21)](https://github.com/extremeheat/gh-helpers/commit/56b3d42a21969b93edc8d78fc03b67b4a986bd4a) (thanks @extremeheat)
* [Add getPullRequestChecks and waitForPullRequestChecks method for PR checks (#20)](https://github.com/extremeheat/gh-helpers/commit/61b5f8476003c1f9d526e3dca7a21f1f3466fbc9) (thanks @extremeheat)

## 0.2.5
* [Add a checkRepoExists method](https://github.com/extremeheat/gh-helpers/commit/9fac02b2105299fa7fe310eaeedcecc68187595c) (thanks @extremeheat)

## 0.2.4
* [Expose repository data on event hooks](https://github.com/extremeheat/gh-helpers/commit/1524be7140658c2ed00b3e3d8c1eb56565cab3b2) (thanks @extremeheat)

## 0.2.3
* [Add `using` method for returning helper instance on different repo (#16)](https://github.com/extremeheat/gh-helpers/commit/7d23b5ba95309e00e98a18d212c6cc776e655c13) (thanks @extremeheat)
* [Fix deprecation warning in rmdirSync](https://github.com/extremeheat/gh-helpers/commit/62ff4fdadbc310ab42db90f893c0f3336beca863) (thanks @extremeheat)

## 0.2.2
* [Add a getIssue(id) method, correction to findIssues()/findPullRequests() looking up by number](https://github.com/extremeheat/gh-helpers/commit/f4c7ac6c802feecf287daa145d939822cce0a9a0) (thanks @extremeheat)
* [Update mock.js for findIssue() and getIssue(), pointing to mock object](https://github.com/extremeheat/gh-helpers/commit/8d5686e8264a30c5c55b3d49eedd92bea6b575ac) (thanks @extremeheat)
* [sendWorkflowDispatch: Add default `owner` and `repo` to pointing to current repo and owner](https://github.com/extremeheat/gh-helpers/commit/78d54b816dbde1db929548641a3c79d3029e8948) (thanks @extremeheat)

## 0.2.1
* [Add artifacts API (#13)](https://github.com/extremeheat/gh-helpers/commit/3f06c1e1d48669c9fda997afdba79159a32e9796) (thanks @extremeheat)
* [Update types for findIssues/findPullRequests](https://github.com/extremeheat/gh-helpers/commit/029a32e0c4753a16f0a64b352c97095a9cc4e6b2) (thanks @extremeheat)
* [Update documentation](https://github.com/extremeheat/gh-helpers/commit/15af189fa20f073fcac48f3f8f8ca630d0200896) (thanks @extremeheat)

## 0.2.0
Breaking:
* [Update and rename API methods for consistency (#10)](https://github.com/extremeheat/gh-helpers/commit/1ec54a6a2acce3a18ecee8166cad4ea0d9793407) (thanks @extremeheat)
  * Breaking: remove .getIssueStatus() in favor of .findIssue()
  * Breaking: rename .findIssue({ title }) in favor of .findIssue({ titleIncludes }) to be consistent with findPullRequests
  * Breaking: findIssue() and findPullRequest() now return null instead of empty object on find failure

Feature:
* [Return new issue ID in createIssue call (#11)](https://github.com/extremeheat/gh-helpers/commit/a1ead2fded9bd8acfb5d449afe0084d796f9c1dc) (thanks @extremeheat)
* [Add `getDiffForCommit` method, support comments on commits (#9)](https://github.com/extremeheat/gh-helpers/commit/e08c439d2299d5c161e5404ed0ca5816a6bd625f) (thanks @extremeheat)
* [Return PR number in createPullRequest()](https://github.com/extremeheat/gh-helpers/commit/a012fac7b3966f684520642148b993ed410403ba) (thanks @extremeheat)

Fix:
* Fix typescript types

## 0.1.3
* [Add Github PR review support (#7)](https://github.com/extremeheat/gh-helpers/commit/b11866dc8950c34b9783a671705b559a0975d884) (thanks @extremeheat)
* [mock: update handling to prevent dynamic object creation](https://github.com/extremeheat/gh-helpers/commit/c8d980eb23f8d461dab85b70fda05358bcabbf81) (thanks @extremeheat)

## 0.1.2
* Fix bug in findIssues()

## 0.1.1
* [Add workflow dispatch methods (#4)](https://github.com/extremeheat/gh-helpers/commit/aa9fec726c67a6c4d10d4ebc25145c1a462dff56) (thanks @extremeheat)

## 0.1.0
BREAKING:
* Module now exports a loader function, which allows gh-helpers to now work over Github Actions and independently over API
* `findPullRequests`, `findPullRequest` - Now take object parameters, return expanded data
* `findIssues`, `getIssueStatus` -- Now take object parameters, return expanded data

Commits:
* [Add `getCurrentUser` method (#2)](https://github.com/extremeheat/gh-helpers/commit/568e2288764f4e4ab1e09a2dd06b6623e40871a6) (thanks @extremeheat)
* [Refactor to work outside Github Actions over Github API (#1)](https://github.com/extremeheat/gh-helpers/commit/102e8087772a8748c52012e8f3bd613f9f042d66) (thanks @extremeheat)
* [resturcturing](https://github.com/extremeheat/gh-helpers/commit/bd945e4d53caefb3ca09da550a82fe5693d9c2d1) (thanks @extremeheat)
* [add some types generated by gemini1.5pro](https://github.com/extremeheat/gh-helpers/commit/bf06aa0624d2f7d1da31e56bb418bd6719a22ef5) (thanks @extremeheat)
* [update doc](https://github.com/extremeheat/gh-helpers/commit/94abc4e4eb518af6d1d2cd3d74f20ab410c0940b) (thanks @extremeheat)
* [init commit gh-helpers](https://github.com/extremeheat/gh-helpers/commit/65a9d5a36fb117239c0e8eb387228e77393d6e3e) (thanks @extremeheat)
* [Initial commit](https://github.com/extremeheat/gh-helpers/commit/567b197f67639315a2324603d8cfd1a784b89b6b) (thanks @extremeheat)

## 0.0.1
Initial commit from PrismarineJS helper scripts
