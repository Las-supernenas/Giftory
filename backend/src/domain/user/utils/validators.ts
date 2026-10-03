export const passwordValidator = (password: string): boolean => {
  const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,20}$/;

  return passwordRegExp.test(password);
};

export const emailValidator = (email: string): boolean => {
  const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegExp.test(email);
};
