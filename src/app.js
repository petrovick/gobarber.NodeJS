import 'dotenv/config';

import Helmet from 'helmet';
import express from 'express';
import path from 'path';
import cors from 'cors';
import redis from 'redis';
import RateLimit from 'express-rate-limit';
import RateLimitRedis from 'rate-limit-redis';

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

    this.socket();

    this.middlewares();
    this.routes();
    this.exceptionHandler();

    this.connectedUsers = {};
  }

  socket() {
    this.io = io(this.server);

    this.io.on('connection', socket => {
      const { user_id } = socket.handshake.query;

      const connected = this.connectedUsers[user_id];

      // Se o cliente abrir em outro navegador, pode fechar a conexao do outro navegador aberto
      /*
      if(connected) {
        this.io.to(connected).emit('logout')
      }
      */

      this.connectedUsers[user_id] = socket.id;

      socket.on('disconnect', () => {
        delete this.connectedUsers[user_id];
      });
    });
  }

  middlewares() {
    this.app.use(Sentry.Handlers.requestHandler());
    this.app.use(Helmet());
    this.app.use(cors()); // this.app.use(cors({origin: process.env.FRONT_URL,}));
    this.app.use(express.json());
    this.app.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'temp', 'uploads'))
    );
    this.app.use((req, res, next) => {
      req.io = this.io;
      req.connectedUsers = this.connectedUsers;
      next();
    });

    if (process.env.NODE_ENV !== 'development') {
      this.app.use(
        new RateLimit({
          store: new RateLimitRedis({
            client: redis.createClient({
              host: process.env.REDIS_HOST,
              port: process.env.REDIS_PORT,
            }),
          }),
          windowMs: 1000 * 60 * 15 /* 1000 * 60 = 1 min * 15 = 15 mins */,
          max: 10,
        })
      );
    }
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
