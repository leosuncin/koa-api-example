# Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.8](https://github.com/leosuncin/koa-api-example/compare/v1.0.7...v1.0.8) (2021-12-20)

## [1.0.7](https://github.com/leosuncin/koa-api-example/compare/v1.0.6...v1.0.7) (2021-11-22)

## [1.0.6](https://github.com/leosuncin/koa-api-example/compare/v1.0.5...v1.0.6) (2021-11-15)

## [1.0.5](https://github.com/leosuncin/koa-api-example/compare/v1.0.4...v1.0.5) (2021-11-08)

## [1.0.4](https://github.com/leosuncin/koa-api-example/compare/v1.0.3...v1.0.4) (2021-11-01)

## [1.0.3](https://github.com/leosuncin/koa-api-example/compare/v1.0.2...v1.0.3) (2021-10-25)

## [1.0.2](https://github.com/leosuncin/koa-api-example/compare/v1.0.1...v1.0.2) (2021-10-15)

### Bug Fixes

- **release:** 🐛 🚀 github's assets ([c31cf99](https://github.com/leosuncin/koa-api-example/commit/c31cf99f5a42b0d9893c87fdc9c9fc52c8895fbf)), closes [semantic-release/github#295](https://github.com/semantic-release/github/issues/295)

## [1.0.1](https://github.com/leosuncin/koa-api-example/compare/v1.0.0...v1.0.1) (2021-10-15)

### Bug Fixes

- **release:** 🐛 release assets and commit message ([ce60569](https://github.com/leosuncin/koa-api-example/commit/ce60569673f54a60c7a3cdabe30b9262a3d433e0))

# 1.0.0 (2021-10-15)

### Bug Fixes

- 🐛 amend async functions ([82fccdb](https://github.com/leosuncin/koa-api-example/commit/82fccdbc8b5432a93157784d944e43a620c92a28))
- 🐛 disable @typescript-eslint/await-thenable for pactum ([cabed19](https://github.com/leosuncin/koa-api-example/commit/cabed1993cbfaeabb18dfae6dd52cdf61b58adcc))
- 🐛 use module augmentation to extends koa's types ([5ed795c](https://github.com/leosuncin/koa-api-example/commit/5ed795cffc52c37f030c0c7b055bc80168381d1b))
- 💥 🐛 send details of validation error ([4fe0339](https://github.com/leosuncin/koa-api-example/commit/4fe03398639731f8667c912517f9ed9736b14b92))
- **auth:** 🐛 avoid user duplication on register ([956b179](https://github.com/leosuncin/koa-api-example/commit/956b1791da09f5cd7d7cac8979f97bdf8d634c15))

### Features

- ✨ add a custom error handler ([afc46db](https://github.com/leosuncin/koa-api-example/commit/afc46db08deb6ea51ac44be7e6b211d78d9578df))
- ✨ add CRUD for tasks ([81913c2](https://github.com/leosuncin/koa-api-example/commit/81913c2875af1fe5f9607b0740e8415b9e4e7704))
- ✨ add schema for the error response ([eee8b2e](https://github.com/leosuncin/koa-api-example/commit/eee8b2ecad9a30385ca6c4a3bcf70a28785e0e20))
- ✨ add schemas to validate the request ([77ce302](https://github.com/leosuncin/koa-api-example/commit/77ce3028d0e96500a2e5861d989ff723ed6069c0))
- ✨ automatic release using semantic-release ([#11](https://github.com/leosuncin/koa-api-example/issues/11)) ([8dc94a1](https://github.com/leosuncin/koa-api-example/commit/8dc94a1b92994b434eb9a7bd0517ac74f244e9c9))
- ✨ setup graceful shutdown ([c2a33e5](https://github.com/leosuncin/koa-api-example/commit/c2a33e5cc201153c3255acc05f526adb007926fc))
- ✨ setup typeorm with koa ([2679ff8](https://github.com/leosuncin/koa-api-example/commit/2679ff8ba36a59ed48bfe14d0829bedcb7421fc6))
- **auth:** ✨ add routes to register, login and get user using JWT ([b668f3f](https://github.com/leosuncin/koa-api-example/commit/b668f3f53d67f27f5c41d5d3497aabeac3ba6265))
- **auth:** ✨ add schemas to validate the request and response ([a654b26](https://github.com/leosuncin/koa-api-example/commit/a654b26e8a527e981e12d96643cf132c697c8e83))
- **auth:** ✨ error middleware handles exception from koa-jwt ([2afd66d](https://github.com/leosuncin/koa-api-example/commit/2afd66d74f1ae44fd6f4aa10a42ae44b7d5a611f))
- **auth:** ✨ remove the authenticated user ([f9ea4f2](https://github.com/leosuncin/koa-api-example/commit/f9ea4f2d837f9567ea4b742cbc3e0b007c52c1df))
- **auth:** ✨ update current user information ([36d03d8](https://github.com/leosuncin/koa-api-example/commit/36d03d8b8f67364540293ace0649b839a5dc7031))

### BREAKING CHANGES

- rename property error to reason of the error response
