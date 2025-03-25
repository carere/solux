## [3.3.2](https://github.com/carere/solux/compare/v3.3.1...v3.3.2) (2024-11-14)


### Bug Fixes

* enable creating the store with only rootSlice & container ([1c1253d](https://github.com/carere/solux/commit/1c1253d91c8e3096466557e11d5836e9910b4692))

## [3.3.1](https://github.com/carere/solux/compare/v3.3.0...v3.3.1) (2024-05-23)


### Bug Fixes

* **configurestore:** rootEpic called once during initialization ([55c50a0](https://github.com/carere/solux/commit/55c50a00d62034518044bbbf3c844a63654523eb))

# [3.3.0](https://github.com/carere/solux/compare/v3.2.0...v3.3.0) (2024-02-22)


### Features

* adding more options to devtools & filtering event send to devtools ([7eefdd2](https://github.com/carere/solux/commit/7eefdd234e90fd5af79c23acfbb3ec9dcfa7e304))

# [3.2.0](https://github.com/carere/solux/compare/v3.1.0...v3.2.0) (2024-02-19)


### Features

* adding possibility to name the solux store instance ([534d8ee](https://github.com/carere/solux/commit/534d8eebe1ec1e5672517724420b8e55982eaf05))

# [3.1.0](https://github.com/carere/solux/compare/v3.0.0...v3.1.0) (2024-02-16)


### Features

* adding back entity adapter + rebase ([5e4f11e](https://github.com/carere/solux/commit/5e4f11e8f44f63acce1b1138fe8c857dac0cf825))

# [3.0.0](https://github.com/carere/solux/compare/v2.1.1...v3.0.0) (2024-02-16)


### Bug Fixes

* downgrade semantic-realease ([10ea8a5](https://github.com/carere/solux/commit/10ea8a5688cc736f10189f38a465a4c5783a7cfd))


### Features

* remove updates from entityAdapter + bump version ([8de0c38](https://github.com/carere/solux/commit/8de0c38d102d0428206a40218c1593bd8eb2eb78))


### BREAKING CHANGES

* removing update & upsert functions from the entity adapter

## [2.1.1](https://github.com/carere/solux/compare/v2.1.0...v2.1.1) (2023-05-31)


### Bug Fixes

* **createentityadapter:** return new initialState on each call to getInitialState ([2d23aa7](https://github.com/carere/solux/commit/2d23aa77b007bf98d64954b894d5d4231dea6998))

# [2.1.0](https://github.com/carere/solux/compare/v2.0.0...v2.1.0) (2023-04-04)


### Bug Fixes

* adding second template parameter in context component for the newly added container ([872a180](https://github.com/carere/solux/commit/872a1804e4bffde5f1c0a007717cdecf68c5ad13))


### Features

* adding container to the store ([bac8800](https://github.com/carere/solux/commit/bac88006b9fdd2232d0cb251c0073e7961390c46))

# [2.0.0](https://github.com/carere/solux/compare/v1.3.0...v2.0.0) (2023-01-21)


### Features

* remove getState and replace it by returning directly the state ([4cf7c91](https://github.com/carere/solux/commit/4cf7c91d43df4feb084227a0f81d948b8283e781))


### BREAKING CHANGES

* Removing the getState method from the store and replace it with the state object

# [1.3.0](https://github.com/carere/solux/compare/v1.2.2...v1.3.0) (2022-10-21)


### Features

* adding subscribe to a specific event ([7d25324](https://github.com/carere/solux/commit/7d253240a066cca1ffdadc8b4306e3fc78c8c2bd))

## [1.2.2](https://github.com/carere/solux/compare/v1.2.1...v1.2.2) (2022-10-19)


### Bug Fixes

* enabling calling rootSlice handler only when rootSlice is defined ([a3cee46](https://github.com/carere/solux/commit/a3cee46f16aec729fa75054488502a00923adc22))

## [1.2.1](https://github.com/carere/solux/compare/v1.2.0...v1.2.1) (2022-10-19)


### Bug Fixes

* initializing a store without a rootSlice nor preloaded state resulting in error ([b83134e](https://github.com/carere/solux/commit/b83134edc07bbb63302654017a1f24ee3a8f8590))

# [1.2.0](https://github.com/carere/solux/compare/v1.1.4...v1.2.0) (2022-10-18)


### Features

* adding ability to retrieve the full event object when subscribing to store ([c04ce52](https://github.com/carere/solux/commit/c04ce52c7271f546cd72b3462bbc231458c7ccab))

## [1.1.4](https://github.com/carere/solux/compare/v1.1.3...v1.1.4) (2022-09-29)


### Bug Fixes

* improving typing for epic ([8902043](https://github.com/carere/solux/commit/8902043a28d45543e11fe371ce39d6db4c157a54))

## [1.1.3](https://github.com/carere/solux/compare/v1.1.2...v1.1.3) (2022-09-29)


### Bug Fixes

* adding any cutom properties to event for facilitating typing ([1246086](https://github.com/carere/solux/commit/12460863f423d4a0ebe0db307e60d00778bb2d47))

## [1.1.2](https://github.com/carere/solux/compare/v1.1.1...v1.1.2) (2022-09-29)


### Bug Fixes

* enabling any type for event with payload ([596ef99](https://github.com/carere/solux/commit/596ef9984b81ccbe4ebedbccc229c964fb6a9d1e))

## [1.1.1](https://github.com/carere/solux/compare/v1.1.0...v1.1.1) (2022-09-28)


### Bug Fixes

* update dependencies & fixing some typings ([40f4227](https://github.com/carere/solux/commit/40f4227720d995614b593e33fc629bcf52e62fb0))

# [1.1.0](https://github.com/carere/solux/compare/v1.0.4...v1.1.0) (2022-09-28)


### Features

* greatly improving typings for event creators ([0f3e11d](https://github.com/carere/solux/commit/0f3e11dad7b9092cab56f29c06b3317fdafc64df))

## [1.0.4](https://github.com/carere/solux/compare/v1.0.3...v1.0.4) (2022-09-27)


### Bug Fixes

* use any type for event payload & meta ([12703ed](https://github.com/carere/solux/commit/12703ed94d189cdde6cc58e172d94d419295907a))

## [1.0.3](https://github.com/carere/solux/compare/v1.0.2...v1.0.3) (2022-09-27)


### Bug Fixes

* improving typings and apis for creating events and filtering event in epics ([26c9ce2](https://github.com/carere/solux/commit/26c9ce2186df8a169cf9911d0b651fef4f280e85))

## [1.0.2](https://github.com/carere/solux/compare/v1.0.1...v1.0.2) (2022-09-18)


### Bug Fixes

* updating visibility of package to public ([9b80714](https://github.com/carere/solux/commit/9b8071440b48eb3b36ca8b4b63e06a70346c3b7a))

## [1.0.1](https://github.com/carere/solux/compare/v1.0.0...v1.0.1) (2022-09-18)


### Bug Fixes

* fixing conflict ([434383b](https://github.com/carere/solux/commit/434383b81ff15c3441fd266779758f6ec7d21374))
* renaming solux to @carere/solux ([fabd9e0](https://github.com/carere/solux/commit/fabd9e02e5d97e241ca884af0ec16f92c8cc397d))

## 4.0.0 (2025-03-25)

### Breaking Changes

- adding updaters, devtools & middlewares

### Features

- adding devtools as an enhancer to the store
- adding middleware & observable middleware
- finishing enhancers & middlewares

### Fixes

- add middlewares & enhancers to the build

# 1.0.0 (2022-09-18)


### Bug Fixes

* fixing entry point for build ([b48b305](https://github.com/carere/solux/commit/b48b305ef2ce2a8d7b0091abcb439eb106d641c8))


### Features

* initial commit + some tooling ([e0fa79d](https://github.com/carere/solux/commit/e0fa79dee2176b7be41af422c65976c274f540cc))
