import { Request, Response } from 'express';

import recentsScrapper from './Recents';
import mangaScrapper from './Manga';
import chapterScrapper from './Chapter';
import searchScrapper from './Search';

const Controller = {
	async recents(req: Request, res: Response): Promise<Response> {
		const { number } = req.params;
		const response = await recentsScrapper(parseInt(number, 10));

		return res.json(response);
	},
	async manga(req: Request, res: Response): Promise<Response> {
		const { manga } = req.params;
		const response = await mangaScrapper(manga);

		return res.json(response);
	},
	async chapter(req: Request, res: Response): Promise<Response> {
		const { manga, chapter } = req.params;
		const response = await chapterScrapper(manga, chapter);

		return res.json(response);
	},
	async search(req: Request, res: Response): Promise<Response> {
		const { search } = req.params;
		const response = await searchScrapper(search);

		return res.json(response);
	},
};

export default Controller;
