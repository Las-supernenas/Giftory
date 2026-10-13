// Checks that a date is a real calendar day in "YYYY-MM-DD" format
export const isValidEventDate = (date: string): boolean => {
  //Format YYYY-MM-DD
  const dateRegExp = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegExp.test(date)) {
    return false;
  }

  // Split into numbers
  const [year, month, day] = date.split('-').map(Number);

  // Build a real date (months in JS go from 0 to 11)
  const parsed = new Date(year, month - 1, day);

  //If js "corrected" the date, it did not exist (example 30 Feb becomes 2 Mar)
  return (
    parsed.getDate() === day && parsed.getMonth() === month - 1 && parsed.getFullYear() === year
  );
};
