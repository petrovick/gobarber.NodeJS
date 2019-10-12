import 'dotenv/config';

import express from 'express';
import path from 'path';

import * as Sentry from '@sentry/node';
/**
 * 'express-async-errors' tem que estar antes de
 * import routes from './routes';
 */
import 'express-async-errors';

import routes from './routes';
import './database';
import SentryConfig from './config/sentry';
import Youch from 'youch';

class App {
  constructor() {
    this.server = express();

    Sentry.init(SentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());

    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'temp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);

    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    /**
     * Colocando um middle de 4 parametros, o express entende que eh um middleware de excecao e joga neste middle aqui
     */
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json(errors);
      }
      return res.status(500).json({ error: 'Internal server error.' });
    });
  }
}

export default new App().server;
