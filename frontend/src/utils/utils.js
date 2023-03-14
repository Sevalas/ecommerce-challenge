export const getError = (error) => {
  return error.response && error.response.data.errorMessage
    ? error.response.data.errorMessage
    : error.message;
};

export const ConditionalWrapper = ({ condition, wrap, children }) =>
  condition ? wrap(children) : children;
