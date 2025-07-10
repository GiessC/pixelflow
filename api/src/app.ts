import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import api from './api';
import 'reflect-metadata';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1', api);

export default app;
