import { Router } from 'express';

import requestsController from '../controllers';

const routes = Router();

routes.get('/recents/:page?/:number?', requestsController.recents);
routes.get('/manga/:manga', requestsController.manga);
routes.get('/manga/:manga/chapter/:chapter', requestsController.chapter);
routes.get('/search/:search', requestsController.search);

export default routes;
