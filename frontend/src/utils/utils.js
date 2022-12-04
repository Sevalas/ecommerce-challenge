export const getError = (error) => {
    return error.response && error.response.data.errorMessage
    ? error.response.data.errorMessage
    : error.message
}

export const ConditionalWrapper = ({ condition, wrapper, children }) => 
  condition ? wrapper(children) : children;