import express from 'express';
import { nanoid } from 'nanoid';
import { DaprClient, CommunicationProtocolEnum } from 'dapr-client';

const DAPR_PORT = process.env.DAPR_HTTP_PORT || 3500;
const DAPR_HOST = '127.0.0.1';
const STATE_STORE_NAME = 'statestore';
const STATE_URL = `http://localhost:${DAPR_PORT}/v1.0/state/${STATE_STORE_NAME}`;
const PUBSUB_NAME = 'kafka-pub-sub';
const TOPIC_NAME = 'second_kafka_topic';
const SERVER_PORT = 3000;

const app = express();
app.use(express.json());

app.post('/newpost', async (req, res) => {
  const data = req.body;
  const newPost = [
    {
      key: nanoid(),
      value: data,
    },
  ];

  try {
    //Using Dapr API
    const response = await fetch(STATE_URL, {
      method: 'POST',
      body: JSON.stringify(newPost),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to persist post.');
    }
    console.log(`Successfully persisted post: ${JSON.stringify(data)}`);
    await publishPostToKafka(newPost);
    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

const publishPostToKafka = async (data) => {
  //Using Dapr SDK
  const client = new DaprClient(
    DAPR_HOST,
    DAPR_PORT,
    CommunicationProtocolEnum.HTTP
  );
  console.log(`Successfully published post: ${JSON.stringify(data)}`);
  await client.pubsub.publish(PUBSUB_NAME, TOPIC_NAME, data);
};

const startServer = () => {
  app.listen(SERVER_PORT, () => console.log(`PostHandler listening on port ${SERVER_PORT}!`));
};

startServer();
