# workstreams-app

Frontend of workstreams app.

## Developing

Install dependencies with `yarn install` and start a development server:

```bash
yarn run dev

# or start the server and open the app in a new browser tab
yarn run dev --open
```

You have to run [the api](https://github.com/radicle-dev/workstreams-api-node) locally or you can add a `.env` file to the root folder of the project to use the production api.

```
VITE_USE_PROD_CONFIG=true
```
