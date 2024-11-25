# routes
![tests](https://github.com/substrate-system/routes/actions/workflows/nodejs.yml/badge.svg)
[![dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg?style=flat-square)](package.json)
[![types](https://img.shields.io/npm/types/msgpackr?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-brightgreen?logo=semver&style=flat-square)](https://semver.org/)
[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)

Route matcher devised for shared rendering JavaScript applications

## install
```sh
npm install -S @substrate-system/routes
```

## ESM vs CJS
Featuring ESM or CJS versions via `package.json` `exports` field.

```js
// esm
import Router from '@substrate-system/routes'
```

```js
// cjs
const Router = require('@substrate-system/routes').default
```

## example
Get a router instance

```js
import Router from '@substrate-system/routes'
var router = new Router()
```

### Add some routes
```js
router.addRoute('/articles', getArticles);
router.addRoute('/articles/:slug', getArticleBySlug);
router.addRoute('/articles/search/*', searchForArticles);

// can also chain the method calls
router
    .addRoute('/foo', () => {/* ... */})
    .addRoute('/bar', () => {/* ... */})
```

### Find a match

```js
const match = router.match('/articles');
// => RouteMatch
```

#### The match object
```ts
interface RouteMatch {
    params:Record<string, string>;  // <-- e.g. { slug: 'article-title' }
    splats:string[];
    route:string;
    next?:((...any)=>any)|null;
    action?:(...any)=>any;
    index?:number;
}
```

You'll get `null` back if no route matches the provided URL. Otherwise, the
route match will provide all the useful information you need inside an object.

Key               | Description
------------------|---------------------------------------------------------------------------------------
`action`          | The action passed to `addRoute` as a second argument. Using a function is recommended
`next`            | Fall through to the next route, or `null` if no other routes match
`route`           | The route passed to `addRoute` as the first argument
`params`          | An object containing the values for named parameters in the route
`splats`          | An object filled with the values for wildcard parameters

## License

MIT

## fork
This is a fork of [ruta3](https://www.npmjs.com/package/ruta3), just adding types.
