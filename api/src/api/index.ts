import express from 'express';
import imagesRouter from './features/images/images.router';

const router = express.Router();

router.use('/images', imagesRouter);

export default router;
