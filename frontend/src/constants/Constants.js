export const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, object: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};
