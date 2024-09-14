import { contactTypeList } from '../../constants/contacts.js';

const parseContactType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;
  const isContactType = (type) => contactTypeList.includes(type);

  if (isContactType(type)) return type;
};

// const parseIsFavourite = (bool) => {
//   const isString = typeof bool === 'string';
//   if (!isString) return;

//   console.log(`parsed: ${bool}`);

//   return true;
// };

export const parseContactsFilterParams = (query) => {
  const { contactType, isFavourite } = query;

  const parsedContactType = parseContactType(contactType);
  //   const parsedIsFavourite = parseIsFavourite(isFavourite);
  return {
    contactType: parsedContactType,
    // isFavourite: parsedIsFavourite,
  };
};
