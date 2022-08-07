# `ultrafetch`

Modular utilities for enhancing `fetch` behavior. Bring Your Own Fetch implementation supports both [`node-fetch`](https://github.com/node-fetch/node-fetch) and [`unidici`](https://github.com/nodejs/undici)'s `fetch` (globally available in `node@18+`).

## `withCache`

The `withCache` function enhances `fetch` with [RFC-7234](https://httpwg.org/specs/rfc7234.html) compliant cache behavior. The default cache is a simple in-memory `Map`, but custom `cache`s are also supported.

```js
import { withCache } from "ultrafetch";

const enhancedFetch = withCache(fetch);
```

Any custom `cache` that adheres to a `Map` interface is valid.

```ts
import { withCache } from "ultrafetch";

class MyCache implements Map {
  clear(): void;
  delete(key: K): boolean;
  get(key: K): V| undefined>;
  has(key: K): boolean;
  set(key: K, value: V): this;
  readonly size: number;
}

const enhancedFetch = withCache(fetch, { cache: new MyCache() });
```

Custom `cache`s can also use the `AsyncMap` interface, which is the same as a standard `Map` but each method is `async`.

```ts
import type { AsyncMap } from "ultrafetch";
import { withCache } from "ultrafetch";

class MyAsyncCache implements AsyncMap {
  clear(): Promise<void>;
  delete(key: K): Promise<boolean>;
  get(key: K): Promise<V | undefined>;
  has(key: K): Promise<boolean>;
  set(key: K, value: V): Promise<this>;
  readonly size: number;
}

const enhancedFetch = withCache(fetch, { cache: new MyAsyncCache() });
```

### `isCached`

The `isCached` export can be used to determine if a given `Response` was returned from the cache or not.

```ts
import { withCache, isCached } from "ultrafetch";

const enhancedFetch = withCache(fetch);
const responseA = await enhancedFetch('https://example.com');
isCached(responseA) // false
const responseB = await enhancedFetch('https://example.com');
isCached(responseB) // true
```
