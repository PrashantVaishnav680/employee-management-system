export const startOfDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

export const isBeforeToday = (value) => {
  const date = startOfDay(value);
  const today = startOfDay(new Date());
  return !date || date < today;
};
