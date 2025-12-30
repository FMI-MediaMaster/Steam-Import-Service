import steamController from '@controllers/steam';
import { Router } from 'express';

const routes: Router = Router();

routes.use('/:method', steamController.handler);

export default routes;
