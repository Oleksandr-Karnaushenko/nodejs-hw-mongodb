import createHttpError from 'http-errors';

import { ROLES } from '../constants/index.js';

export const checkRoles =
  (...roles) =>
  async (req, res, next) => {
    const { user } = req;

    if (!user) {
      createHttpError(401, 'User not found');
      return;
    }

    const { role } = user;

    if (roles.includes(ROLES.ADMIN) && role === ROLES.ADMIN) {
      next();
      return;
    }

    if (roles.includes(ROLES.OWNER) && role === ROLES.OWNER) {
      next();
      return;
    }

    // next(createHttpError(403, 'Forbiden'));
    next();
  };

//у нас у конспекті є приклад, коли роль "PARENT" використовується лише за умов передачі "studentId", тобто не на усих роутах.
//я ж хочу зробити 2 типа акаутів. Admin - доступ до всього та Owner - тільки до своїх даних.
//як це правильно зробити? через middlewares чи в controllers через функцію?
//пробував зробити це у controllers, зробив функцію яка перевіряла роль юзера і потім за потреби додавала додатковий фільтр
//але тоді виходить що це потрібно додавати до кожного контролера, а це по факту робота middleware
//через middleware я не розумію як мені прокинути умову у контролер
