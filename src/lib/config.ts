interface Config {
  API_URL_BASE: string;
}

const configMap = {
  production: {
    API_URL_BASE:
      'https://europe-west2-radicle-workstreams.cloudfunctions.net/api'
  },
  development: {
    API_URL_BASE: 'http://127.0.0.1:5001/radicle-workstreams/us-central1/api'
  }
};

function getConfig(): Config {
  return process.env.NODE_ENV === 'production' ||
    import.meta.env.VITE_USE_PROD_CONFIG === 'true'
    ? configMap.production
    : configMap.development;
}

export { getConfig };
