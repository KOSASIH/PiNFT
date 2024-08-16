// Import dependencies and initialize server
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ApolloServer } from '@apollo/server';
import { graphqlUploadExpress } from 'graphql-upload';
import { json } from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports } from 'winston';
import { GraphQLSchema } from './schema';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';
import { db } from './database';
import { auth } from './auth';
import { socket } from './socket';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Initialize logger
const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

// Initialize database
db.connect().then(() => {
  logger.info('Database connected');
}).catch((err) => {
  logger.error('Error connecting to database:', err);
});

// Initialize authentication
auth.init().then(() => {
  logger.info('Authentication initialized');
}).catch((err) => {
  logger.error('Error initializing authentication:', err);
});

// Initialize socket.io
socket.init(io).then(() => {
  logger.info('Socket.io initialized');
}).catch((err) => {
  logger.error('Error initializing socket.io:', err);
});

// Initialize GraphQL schema
const schema = new GraphQLSchema(typeDefs, resolvers);

// Initialize Apollo Server
const apolloServer = new ApolloServer({
  schema,
  context: ({ req, res }) => ({
    req,
    res,
    db,
    auth,
  }),
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            // Shutdown socket.io
            io.close();
          },
        };
      },
    },
  ],
});

// Initialize Express app
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));
app.use(json({ limit: '50mb' }));
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to PiNFT!');
});

app.post('/graphql', apolloServer.getMiddleware({ path: '/graphql' }));

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).send({ error: 'Internal Server Error' });
});

// Start server
server.listen(3000, () => {
  logger.info('Server started on port 3000');
});
