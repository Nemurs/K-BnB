// frontend/src/store/allBookings.js
import { csrfFetch } from "./csrf";

const LOAD_ALL = "allBookings/loadAll";
const LOAD_USER_OWNED = "allBookings/loadUserOwned";
const CREATE_NEW_BOOKING = "allBookings/createNewBooking";
const DELETE_BOOKING = "allBookings/deleteBooking";
const EDIT_BOOKING = "allBookings/editBooking";

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

const createNewBookingAction = (data) => {
    return {
        type: CREATE_NEW_BOOKING,
        payload: data
    };
};


const deleteBookingAction = (data) => {
    return {
        type: DELETE_BOOKING,
        payload: data
    };
};

const editBookingAction = (data) => {
    return {
        type: EDIT_BOOKING,
        payload: data
    };
};

export const loadAllThunk = () => async (dispatch) => {
    const response = await csrfFetch("/api/bookings");
    const data = await response.json();
    dispatch(loadAllAction(data));
    return response;
};

export const loadUserOwnedThunk = () => async (dispatch) => {
    const response = await csrfFetch("/api/bookings/current/mostRecent");
    const data = await response.json();
    dispatch(loadUserOwnedAction(data));
    return response;
};

export const createNewBookingThunk = (payload) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${payload.spotId}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.book)
    });

    if (response.ok) {
        const booking = await response.clone().json();
        dispatch(createNewBookingAction(booking));
    }
    return response;
};

export const editBookingThunk = (payload) => async (dispatch) => {
    const response = await csrfFetch(`/api/bookings/${payload.bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.book)
    });

    if (response.ok) {
        const booking = await response.clone().json();
        dispatch(editBookingAction(booking));
    }
    return response;
};

export const deleteBookingThunk = (payload) => async (dispatch) => {
    const response = await csrfFetch(`/api/bookings/${payload.id}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        const booking = await response.clone().json();
        dispatch(deleteBookingAction(booking));
    }
    return response;
};

const initialState = {};

const allBookingsReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case LOAD_ALL:
            newState = Object.assign({}, state);
            let normalized = {};
            action.payload.Bookings.forEach(booking => {
                normalized[booking.id] = booking
            });
            newState = { ...normalized };
            return newState;
        case CREATE_NEW_BOOKING:
            newState = Object.assign({}, state);
            newState[action.payload.id] = action.payload;
            return newState;
        case LOAD_USER_OWNED:
            newState = Object.assign({}, state);
            newState = { ...action.payload.Bookings };
            return newState;
        case DELETE_BOOKING:
            newState = Object.assign({}, state);
            delete newState[action.payload.id]
            return newState;
        case EDIT_BOOKING:
            newState = Object.assign({}, state);
            newState[action.payload.id] = action.payload;
            return newState;
        default:
            return state;
    }
};

export default allBookingsReducer;
