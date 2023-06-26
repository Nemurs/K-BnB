import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import sessionReducer from "./session";
import allSpotsReducer from "./allSpots";
import singleSpotReducer from "./singleSpot";
import allBookingsReducer from "./allBookings";
import singleBookingReducer from "./singleBooking";
import singleSpotReviewsReducer from "./singleSpotReviews";

const rootReducer = combineReducers({
  session: sessionReducer,
  spots: combineReducers({
    allSpots: allSpotsReducer,
    singleSpot: singleSpotReducer
  }),
  bookings: combineReducers({
    allBookings: allBookingsReducer,
    singleBooking: singleBookingReducer
  }),
  reviews: combineReducers({
    spot: singleSpotReviewsReducer
  })
});

let enhancer;

if (process.env.NODE_ENV === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = require("redux-logger").default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
