import express from 'express';
import cors from 'cors';

import env from './src/configs/enviroment';

import routes from './src/routes';

import manifest from './src/assets/manifest.json';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	return res.json(manifest);
});

app.use('/api', routes);

app.all('*', (req, res) => {
	return res.json({ status: 404, err: 'Page not found...' });
});

const { port } = env;

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`🚀 listening on port ${port}`));
