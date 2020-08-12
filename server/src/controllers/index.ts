import { Request, Response } from 'express';

import recentsScrapper from './Recents';

const Controller = {
	async recents(req: Request, res: Response): Promise<Response> {
		const { number } = req.params;
		const response = await recentsScrapper(parseInt(number, 10));

		return res.json(response);
	},
	async manga(req: Request, res: Response): Promise<Response> {
		return res.json({ status: true });
	},
};

export default Controller;
