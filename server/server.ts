import express from 'express';

import cors from 'cors';

import env from './src/configs/enviroment';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	return res.json({ status: true });
});

const { port } = env;

app.listen(port, () => console.log(`🚀 Server started on port: ${port}`));
