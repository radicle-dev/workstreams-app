interface Config {
  API_URL_BASE: string;
}

const configMap = {
  production: {
    API_URL_BASE: "https://us-central1-radicle-workstreams.cloudfunctions.net/api",
  },
  development: {
    API_URL_BASE: "http://127.0.0.1:5001/radicle-workstreams/us-central1/api",
  }
}

function getConfig(): Config {
  console.log(process.env.NODE_ENV);
  return process.env.NODE_ENV === "production"
    ? configMap.production
    : configMap.development
}

export { getConfig };
