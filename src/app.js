import 'dotenv/config';

import express from 'express';
import path from 'path';
import cors from 'cors';

import * as Sentry from '@sentry/node';
/**
 * 'express-async-errors' tem que estar antes de
 * import routes from './routes';
 */
import 'express-async-errors';

import './database';
import Youch from 'youch';
import io from 'socket.io';
import http from 'http';
import SentryConfig from './config/sentry';
import routes from './routes';

class App {
  constructor() {
    this.app = express();
    this.server = http.Server(this.app);

    Sentry.init(SentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  socket() {
    this.io = io(this.server);
  }

  middlewares() {
    this.app.use(Sentry.Handlers.requestHandler());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'temp', 'uploads'))
    );
  }

  routes() {
    this.app.use(routes);

    this.app.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    /**
     * Colocando um middle de 4 parametros, o express entende que eh um middleware de excecao e joga neste middle aqui
     */
    this.app.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json(errors);
      }
      return res.status(500).json({ error: 'Internal server error.' });
    });
  }
}

export default new App().server;
