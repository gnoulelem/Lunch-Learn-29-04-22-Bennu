import express from 'express';
import cors from 'cors';
import { DaprServer, CommunicationProtocolEnum } from 'dapr-client';

const PUBSUB_NAME = 'kafka-pub-sub';
const TOPIC_NAME = 'second_kafka_topic';
const DAPR_PORT = process.env.DAPR_HTTP_PORT || 3501;
const DAPR_HOST = '127.0.0.1';
const DAPR_SERVER_HOST = '127.0.0.1';
const DAPR_SERVER_PORT = 3001;
const EXPRESS_SERVER_PORT = 8000;

const app = express();
app.use(cors());

let notifications = [];

let clients = [];

const notificationProcessor = (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);

  notifications.forEach((notification) => {
    const data = `data: ${JSON.stringify(notification)}\n\n`;
    res.write(data);
  });

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response: res,
  };

  clients.push(newClient);

  req.on('close', () => {
    console.log('Connection closed');
  });
};

const sendNotificationToAll = (newNotif) => {
  clients.forEach((client) =>
    client.response.write(`data: ${JSON.stringify(newNotif)}\n\n`)
  );
};

const subscribeToTopic = async () => {
  const server = new DaprServer(
    DAPR_SERVER_HOST,
    DAPR_SERVER_PORT,
    DAPR_HOST,
    DAPR_PORT,
    CommunicationProtocolEnum.HTTP
  );
  //Subscribe to topic
  await server.pubsub.subscribe(PUBSUB_NAME, TOPIC_NAME, (posts) => {
    console.log(`Post received: ${JSON.stringify(posts)}`);
    posts.forEach((post) => {
      notifications.push(post);
      sendNotificationToAll(post);
    });
  });
  await server.start();
};

subscribeToTopic().catch((e) => {
  console.error(e);
  process.exit(1);
});

app.get('/notifications', notificationProcessor);

const startServer = () => {
  app.listen(EXPRESS_SERVER_PORT, () =>
    console.log(`NotificationHandler listening on port ${EXPRESS_SERVER_PORT}!`)
  );
};

startServer();
