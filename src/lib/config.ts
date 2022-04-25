interface Config {
	API_URL_BASE: string;
}

const configMap = {
	production: {
		API_URL_BASE: 'https://us-central1-radicle-workstreams.cloudfunctions.net/api'
	},
	development: {
		API_URL_BASE: 'https://us-central1-radicle-workstreams.cloudfunctions.net/api'
	}
};

function getConfig(): Config {
	return process.env.NODE_ENV === 'production' ? configMap.production : configMap.development;
}

export { getConfig };
