// frontend/src/store/singleBooking.js
import { csrfFetch } from "./csrf";

const LOAD_ONE = "singleBooking/loadOne";
const CLEAR = "singleBooking/clear";

const loadOneAction = (data) => {
  return {
    type: LOAD_ONE,
    payload: data
  };
};

export const clearSingleBookingAction = () => {
  return {
    type: CLEAR,
  };
};

export const loadOneBookingThunk = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/bookings/current/${spotId}`);
  if(response.ok){
      const data = await response.json();
      if (!data.expired){
        dispatch(loadOneAction(data));
      } else{
        dispatch(clearSingleBookingAction())
      }
  } else{
    dispatch(clearSingleBookingAction())
  }
  return response;
};

const initialState = {};

const singleBookingReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case LOAD_ONE:
      newState = Object.assign({}, state);
      newState = {...action.payload};
      return newState;
    case CLEAR:
      newState = {};
      return newState;
    default:
      return state;
  }
};

export default singleBookingReducer;
