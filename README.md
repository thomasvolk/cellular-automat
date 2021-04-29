# cellular-js

cellular-automat is a javascript library of a cellular automat like conways game of life.

prepare:

    npm install

test:

    npm test

build:

    npm run build

## example

### typescript

This is the typescript example. See the [example project](example/typescript/README.md).

```ts
import {
    Configuration,
    EEFFRule, 
    Universe,
    CellularAutomat
} from "cellular-automat";


const config = new Configuration(new Universe(300, 300), new EEFFRule(2, 3, 3, 3), 1)
var ca = new CellularAutomat(document.getElementById('canvas') as HTMLCanvasElement, config)
ca.random()
ca.start()
```

### javascript

This is the javascript example. See the [example project](example/javascript/README.md).

```js
var config = new cellularJs.Configuration(
    new cellularJs.Universe(300, 300), 
    new cellularJs.EEFFRule(2, 3, 3, 3), 1
    )
var ca = new cellularJs.CellularAutomat(document.getElementById('canvas'), config)
ca.random()
ca.start()
```