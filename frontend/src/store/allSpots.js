// frontend/src/store/allSpots.js
import { csrfFetch } from "./csrf";

const LOAD_ALL = "allSpots/loadAll";
const LOAD_USER_OWNED =  "allSpots/loadUserOwned";

const loadAllAction = (data) => {
  return {
    type: LOAD_ALL,
    payload:data
  };
};

const loadUserOwnedAction = (user) => {
  return {
    type: LOAD_USER_OWNED,
    payload: user
  };
};

export const loadAllThunk = () => async (dispatch) => {
  const response = await csrfFetch("/api/spots");
  const data = await response.json();
  dispatch(loadAllAction(data));
  return response;
};

const initialState = {};

const allSpotsReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case LOAD_ALL:
      newState = Object.assign({}, state);
      newState = {...action.payload.Spots};
      return newState;
    case LOAD_USER_OWNED:
      //TODO
      return state;
    default:
      return state;
  }
};

export default allSpotsReducer;
