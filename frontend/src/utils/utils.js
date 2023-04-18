import { EMAIL_REGEX, PASSWORD_REGEX } from "../constants/Constants";

export const getError = (error) => {
  return error.response && error.response.data.errorMessage
    ? error.response.data.errorMessage
    : error.message;
};

export const ConditionalWrapper = ({ condition, wrap, children }) =>
  condition ? wrap(children) : children;

export const validMailPassRegex = (
  errorsObject,
  email,
  emailErrorKey,
  pass,
  passErrorKey
) => {
  if (email && !EMAIL_REGEX.test(email)) {
    errorsObject[emailErrorKey] = "Invalid email, please enter a valid email";
  }
  if (pass && !PASSWORD_REGEX.test(pass)) {
    errorsObject[passErrorKey] =
      "Invalid password, the password must contain a length of 8 and at least one numerical, special, upper and lower case characters";
  }
};
