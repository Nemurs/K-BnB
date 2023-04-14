// frontend/src/store/singleSpotReviews.js
import { csrfFetch } from "./csrf";

const LOAD_ALL_REVIEWS = "singleSpotReviews/loadAllReviews";
const LOAD_USER_OWNED_REVIEWS =  "singleSpotReviews/loadUserOwnedReviews";
const CREATE_NEW_REVIEW = "singleSpotReviews/createNewReview";
const DELETE_REVIEW = "singleSpotReviews/deleteReview";


const loadAllReviewsAction = (data) => {
  return {
    type: LOAD_ALL_REVIEWS,
    payload: data
  };
};

// const loadUserOwnedReviewsAction = (data) => {
//   return {
//     type: LOAD_USER_OWNED_REVIEWS,
//     payload: data
//   };
// };

// const createNewReviewAction = (data) => {
//   return {
//     type: CREATE_NEW_REVIEW,
//     payload: data
//   };
// };

const deleteReviewAction = (data) => {
  return {
    type: DELETE_REVIEW,
    payload: data
  };
};


export const loadAllReviewsThunk = (id) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${id}/reviews`);
  const data = await response.json();
  dispatch(loadAllReviewsAction(data));
  return response;
};

// export const loadUserOwnedReviewsThunk = () => async (dispatch) => {
//   const response = await csrfFetch("/api/spots/current");
//   const data = await response.json();
//   dispatch(loadUserOwnedReviewsAction(data));
//   return response;
// };

// export const createNewReviewThunk = (payload) => async (dispatch) => {
//   const response = await csrfFetch('/api/spots', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload)
//   });

//   if (response.ok) {
//     const spot = await response.clone().json();
//     dispatch(createNewReviewAction(spot));
//   }
//   return response;
// };

export const deleteReviewThunk = (id) => async (dispatch) => {
  const response = await csrfFetch(`/api/reviews/${id}`, {
    method: 'DELETE',
  });

  if (response.ok) {
    const rev = await response.clone().json();
    dispatch(deleteReviewAction(id));
  }
  return response;
};


const initialState = {};

const singleSpotReviews = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case LOAD_ALL_REVIEWS:
      newState = Object.assign({}, state);
      let normalized = {};
      action.payload.Reviews.forEach(rev => {
        normalized[rev.id] = rev
      });
      newState = {...normalized};
      return newState;
    // case CREATE_NEW_REVIEW:
    //   newState = Object.assign({}, state);
    //   newState[action.payload.id] = action.payload;
    //   return newState;
    // case LOAD_USER_OWNED_REVIEWS:
    //   newState = Object.assign({}, state);
    //   newState = {...action.payload.Spots};
    //   return newState;
    case DELETE_REVIEW:
      newState = Object.assign({}, state);
      delete newState[action.payload]
      return newState;
    default:
      return state;
  }
};

export default singleSpotReviews;
