import createHttpError from 'http-errors';

import {
  createContact,
  deleteContact,
  getContacts,
  getContactById,
  updateContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseContactsFilterParams } from '../utils/filters/parseContactsFilterParams.js';
import saveFileToUploadDir from '../utils/saveFileToUploadDir.js';
import { ROLES } from '../constants/index.js';
import env from '../utils/env.js';
import saveFileToCloudinary from '../utils/saveFileToCloudinary.js';

const enableCloudinary = env('ENABLE_CLOUDINARY');

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseContactsFilterParams(req.query);
  let { _id: userId } = req.user;
  const { role: role } = req.user;

  if (role === ROLES.ADMIN) {
    userId = null;
  }

  const contacts = await getContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter: { ...filter, userId },
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactsByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  const { _id: userId } = req.user;
  const contact = await getContactById({ _id: contactId, userId });

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  let photo;
  if (req.file) {
    if (enableCloudinary === 'true') {
      photo = await saveFileToCloudinary(req.file, 'nodejs-hw-mongodb');
    } else {
      photo = await saveFileToUploadDir(req.file);
    }
  }

  const { _id: userId } = req.user;
  const contact = await createContact({ ...req.body, userId, photo });

  res.status(201).json({
    status: 201,
    message: `Successfully created a contact!`,
    data: contact,
  });
};

export const patchContactController = async (req, res, next) => {
  let photo;
  if (req.file) {
    if (enableCloudinary === 'true') {
      photo = await saveFileToCloudinary(req.file, 'nodejs-hw-mongodb');
    } else {
      photo = await saveFileToUploadDir(req.file);
    }
  }

  const { contactId } = req.params;
  const { _id: userId } = req.user;

  const result = await updateContact(
    { _id: contactId, userId },
    { ...req.body, photo },
  );

  if (!result) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.json({
    status: 200,
    message: `Successfully patched a contact!`,
    data: result.contact,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const { _id: userId } = req.user;

  const contact = await deleteContact({ _id: contactId, userId });

  if (!contact) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.status(204).send();
};
