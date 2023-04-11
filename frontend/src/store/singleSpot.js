// frontend/src/store/singleSpot.js
import { csrfFetch } from "./csrf";

const LOAD_ONE = "singleSpot/loadOne";
const LOAD_ONE_USER_OWNED =  "singleSpot/loadOneUserOwned";

const loadOneAction = (data) => {
  return {
    type: LOAD_ONE,
    payload: data
  };
};

const loadOneUserOwnedAction = (user) => {
  return {
    type: LOAD_ONE_USER_OWNED,
    payload: user
  };
};

export const loadOneThunk = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}`);
  const data = await response.json();
  dispatch(loadOneAction(data));
  return response;
};

const initialState = {};

const singleSpotReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case LOAD_ONE:
      newState = Object.assign({}, state);
      newState = {...action.payload};
      return newState;
    case LOAD_ONE_USER_OWNED:
        //TODO
      return state;
    default:
      return state;
  }
};

export default singleSpotReducer;
