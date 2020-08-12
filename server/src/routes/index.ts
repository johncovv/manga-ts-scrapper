import { Router } from 'express';

import requestsController from '../controllers';

const routes = Router();

routes.get('/recents/:page?/:number?', requestsController.recents);
routes.get('/manga/:manga/:id', requestsController.manga);

export default routes;
