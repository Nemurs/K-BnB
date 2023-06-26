import { useModal } from "../../context/Modal.js";
import { useDispatch, useSelector } from 'react-redux';
import { deleteBookingThunk, loadUserOwnedThunk } from "../../store/allBookings.js";
import "./DeleteBookingModal.css";
import { clearSingleBookingAction } from "../../store/singleBooking.js";
import { useHistory, useLocation } from "react-router-dom";

const DeleteBookingModal = ({bookingId}) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();
    const { closeModal } = useModal();
    const bookings = useSelector(state => Object.values(state.bookings.allBookings));

    async function onClickYes(e){
        e.preventDefault();
        let res = await dispatch(deleteBookingThunk({id: bookingId}))
        if(!res.ok){
            // console.log(res);
            // console.log(bookings);
        } else {
            await dispatch(clearSingleBookingAction());
            await dispatch(loadUserOwnedThunk())
            if (location.pathname.startsWith("reserve")) history.push("../");
            closeModal();
        }
    }

    return (
        <div className="delete-booking-modal">
            <h2>Confirm Delete</h2>
            <button className="delete-booking-modal-button-yes" onClick={onClickYes}>{"YES (Delete Booking)"}</button>
            <button className="delete-booking-modal-button-no" onClick={closeModal}>{"NO (Keep Booking)"}</button>
        </div>
    )
}

export default DeleteBookingModal;
