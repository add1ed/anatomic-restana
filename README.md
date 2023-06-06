anatomic-restana
================

An [anatomic](https://github.com/add1ed/anatomic) component for [restana](https://github.com/BackendStack21/restana).

## tl;dr

```js
const anatomic = require("anatomic");
const { app, server } = require("anatomic-restana");

const router = {
  start({ app }) {
    app.get("*", (req, res) => res.send("Hello!"))
  }
};

const system = anatomic()
  .add('app', app())
  .add('server', server()).dependsOn("app", "config", "router")
  .add("router", router).dependsOn("app")
  .configure({ server: { port: 8080 } });

system.start();
```
And then do 
```sh
curl http://localhost:8080/pizza
``` 