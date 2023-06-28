// frontend/src/store/allSpots.js
import { csrfFetch } from "./csrf";

const LOAD_ALL = "allSpots/loadAll";
const LOAD_USER_OWNED =  "allSpots/loadUserOwned";
const CREATE_NEW_SPOT = "allSpots/createNewSpot";
const CREATE_NEW_SPOT_IMAGE = "allSpots/createNewSpotImage";
const DELETE_SPOT = "allSpots/deleteSpot";
const DELETE_SPOT_IMAGE = "allSpots/deleteSpot";
const EDIT_SPOT = "allSpots/editSpot";

const loadAllAction = (data) => {
  return {
    type: LOAD_ALL,
    payload: data
  };
};

const loadUserOwnedAction = (data) => {
  return {
    type: LOAD_USER_OWNED,
    payload: data
  };
};

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

const deleteSpotAction = (data) => {
  return {
    type: DELETE_SPOT,
    payload: data
  };
};

const deleteSpotImageAction = (data) => {
  return {
    type: DELETE_SPOT_IMAGE,
    payload: data
  };
};

const editSpotAction = (data) => {
  return {
    type: EDIT_SPOT,
    payload: data
  };
};

export const loadAllThunk = () => async (dispatch) => {
  const response = await csrfFetch("/api/spots");
  const data = await response.json();
  dispatch(loadAllAction(data));
  return response;
};

export const loadUserOwnedThunk = () => async (dispatch) => {
  const response = await csrfFetch("/api/spots/current");
  const data = await response.json();
  dispatch(loadUserOwnedAction(data));
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
  const response = await csrfFetch(`/api/spots/${payload.get("spot_id")}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    body: payload
  });

  if (response.ok) {
    const img = await response.clone().json();
    dispatch(createNewSpotImageAction({img, spotId: payload.get("spot_id")}));
  }
  return response;
};

export const deleteSpotImageThunk = (payload) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${payload.spotId}/images/${payload.imgId}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    const img = await response.clone().json();
    dispatch(deleteSpotImageAction({img, spotId: payload.spotId}));
  }
  return response;
};

export const deleteSpotThunk = (payload) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${payload.id}`, {
    method: 'DELETE',
  });

  if (response.ok) {
    const spot = await response.clone().json();
    dispatch(deleteSpotAction(spot));
  }
  return response;
};

export const editSpotThunk = (payload) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${payload.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    const spot = await response.clone().json();
    dispatch(editSpotAction(spot));
  }
  return response;
};

const initialState = {};

const allSpotsReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case LOAD_ALL:
      newState = Object.assign({}, state);
      let normalized = {};
      action.payload.Spots.forEach(spot => {
        normalized[spot.id] = spot
      });
      newState = {...normalized};
      return newState;
    case CREATE_NEW_SPOT:
      newState = Object.assign({}, state);
      newState[action.payload.id] = action.payload;
      return newState;
    case CREATE_NEW_SPOT_IMAGE:
      newState = Object.assign({}, state);
      newState[action.payload.spotId].previewImage = action.payload.img.preview ? action.payload.img.url : newState[action.payload.spotId].previewImage
      return newState;
    case LOAD_USER_OWNED:
      newState = Object.assign({}, state);
      newState = {...action.payload.Spots};
      return newState;
    case DELETE_SPOT:
      newState = Object.assign({}, state);
      delete newState[action.payload.id]
      return newState;
    case DELETE_SPOT_IMAGE:
      newState = Object.assign({}, state);
      if (action.payload.img.preview){
        delete newState[action.payload.spotId].previewImage
      }
      return newState;
    case EDIT_SPOT:
      newState = Object.assign({}, state);
      newState[action.payload.id] = action.payload;
      return newState;
    default:
      return state;
  }
};

export default allSpotsReducer;
