import { Request, Response } from 'express';

const Controller = {
	async recents(req: Request, res: Response): Promise<Response> {
		return res.json({ status: true });
	},
	async manga(req: Request, res: Response): Promise<Response> {
		return res.json({ status: true });
	},
};

export default Controller;
