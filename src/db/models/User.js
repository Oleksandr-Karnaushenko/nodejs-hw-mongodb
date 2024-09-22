import { model, Schema } from 'mongoose';

import { emailRegexp } from '../../constants/user.js';
import { ROLES } from '../../constants/index.js';

const userShema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      match: emailRegexp,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.OWNER],
      default: ROLES.OWNER,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
export const UserCollection = model('user', usersShema);
