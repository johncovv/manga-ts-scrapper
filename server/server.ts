import express from 'express';
import cors from 'cors';
import path from 'path';

import env from './src/configs/enviroment';

import routes from './src/routes';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	return res.sendFile(path.join(__dirname, 'src', 'assets', 'manifest.json'));
});

app.use('/api', routes);

const { port } = env;

app.listen(port, () => console.log(`🚀 Server started on port: ${port}`));
