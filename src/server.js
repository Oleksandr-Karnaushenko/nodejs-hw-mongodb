import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';

import env from './utils/env.js';
import { getAllContacts, getContactById } from './services/contacts.js';

dotenv.config();

const PORT = Number(env('PORT', '3000')) || 3000;

const setupServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/', (req, res) => {
    res.json({
      message: 'Hello in my HW_2',
    });
  });

  app.get('/contacts', async (req, res) => {
    const students = await getAllContacts();

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: students,
    });
    console.log(students);
  });

  app.get('/contacts/:contactId', async (req, res, next) => {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);

    if (!contact) {
      res.status(404).json({
        message: 'Contact not found',
      });
      return;
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully found contact with id {contactId}!',
      data: contact,
    });
  });

  app.use('*', (req, res, next) => {
    res.status(404).json({
      message: 'Route not found',
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default setupServer;
