export const checkExpiration = (date) => {
  const validTokenTime = 10 * 60 * 1000;
  const dbDate = new Date(date).getTime();
  const currentDate = Date.now();

  const diff = currentDate - dbDate;
  if (diff <= validTokenTime) {
    return true;
  } else {
    return false;
  }
};
