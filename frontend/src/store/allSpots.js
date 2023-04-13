// frontend/src/store/allSpots.js
import { csrfFetch } from "./csrf";

const LOAD_ALL = "allSpots/loadAll";
const LOAD_USER_OWNED =  "allSpots/loadUserOwned";
const CREATE_NEW_SPOT = "allSpots/createNewSpot";
const CREATE_NEW_SPOT_IMAGE = "allSpots/createNewSpotImage";

const loadAllAction = (data) => {
  return {
    type: LOAD_ALL,
    payload: data
  };
};

//TODO:
// const loadUserOwnedAction = (user) => {
//   return {
//     type: LOAD_USER_OWNED,
//     payload: user
//   };
// };

const createNewSpotAction = (data) => {
  return {
    type: CREATE_NEW_SPOT,
    payload: data
  };
};

const createNewSpotImageAction = (data) => {
  return {
    type: CREATE_NEW_SPOT_IMAGE,
    payload: data
  };
};

export const loadAllThunk = () => async (dispatch) => {
  const response = await csrfFetch("/api/spots");
  const data = await response.json();
  dispatch(loadAllAction(data));
  return response;
};

export const createNewSpotThunk = (payload) => async (dispatch) => {
  const response = await csrfFetch('/api/spots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    const spot = await response.clone().json();
    dispatch(createNewSpotAction(spot));
  }
  return response;
};

export const createNewSpotImageThunk = (payload) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${payload.id}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload.body)
  });

  if (response.ok) {
    const img = await response.clone().json();
    dispatch(createNewSpotImageAction({img, spotId: payload.id}));
  }
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
    case CREATE_NEW_SPOT:
      newState = Object.assign({}, state);
      newState[action.payload.id] = action.payload;
      return newState;
    case CREATE_NEW_SPOT_IMAGE:
      newState = Object.assign({}, state);
      newState[action.payload.spotId].previewImage = action.payload.img.url;
    case LOAD_USER_OWNED:
      //TODO
      return state;
    default:
      return state;
  }
};

export default allSpotsReducer;
