const pad = (value: number): string => String(value).padStart(2, '0');

/** Giờ hiện tại của server theo dạng HH:mm:ss. */
export const clockTime = (date: Date = new Date()): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
