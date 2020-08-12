import { Request, Response } from 'express';

import recentsScrapper from './Recents';

import mangaScrapper from './Manga';

const Controller = {
	async recents(req: Request, res: Response): Promise<Response> {
		const { number } = req.params;
		const response = await recentsScrapper(parseInt(number, 10));

		return res.json(response);
	},
	async manga(req: Request, res: Response): Promise<Response> {
		const { id, manga } = req.params;
		const response = await mangaScrapper(manga, id);

		return res.json(response);
	},
};

export default Controller;
