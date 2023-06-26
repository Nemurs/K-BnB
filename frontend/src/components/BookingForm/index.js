import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams, Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip'
import { loadOneThunk } from '../../store/singleSpot';
import { addDays, differenceInDays, format, eachDayOfInterval } from 'date-fns';
import { DateRange } from 'react-date-range';
import placeHolderImage from "../../Assets/Images/No-Image-Placeholder.png";
import 'react-date-range/dist/styles.css'; // react-date-range main css file
import 'react-date-range/dist/theme/default.css'; // react-date-range theme css file
import "./BookingForm.css";
import { loadOneBookingThunk } from '../../store/singleBooking';
import { createNewBookingThunk, editBookingThunk } from '../../store/allBookings';
import OpenModalButton from '../OpenModalButton';
import DeleteBookingModal from '../DeleteBookingModal';

const TODAY = new Date();
const TOMORROW = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 1);

const BookingForm = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const { id } = useParams();
    const user = useSelector(state => state.session.user)
    const spot = useSelector(state => state.spots.singleSpot);

    const booking = useSelector(state => state.bookings.singleBooking)
    const isBooked = Object.values(booking).length > 0;

    const [nightCount, setNightCount] = useState(2);
    const [state, setState] = useState([{
        startDate: TOMORROW,
        endDate: addDays(TOMORROW, +2),
        key: 'selection'
    }
    ]);

    useEffect(() => {
        if (!spot || spot.id !== id) {
            dispatch(loadOneThunk(id));
        }
        dispatch(loadOneBookingThunk(id))
    }, [dispatch]);

    useEffect(() => {
        setNightCount(differenceInDays(state[0].endDate, state[0].startDate))
    }, [state[0].startDate, state[0].endDate]);

    useEffect(() => {
        if (isBooked) {
            setState([{
                startDate: new Date(booking.startDate),
                endDate: new Date(booking.endDate),
                key: 'selection'
            }])
        }
    }, [booking])

    if (!spot || !spot.SpotImages || !user) return (<></>)

    let prevImg = spot.SpotImages.find(img => img.preview === true);

    let forbiddenDates = [];
    spot.Bookings.forEach(book => {
        if (book.id !== booking.id) {
            forbiddenDates.push(...eachDayOfInterval({ start: new Date(book.startDate), end: new Date(book.endDate) }))
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        let start = state[0].startDate;
        let end = state[0].endDate;

        let isForbidden = false;
        for (let date of forbiddenDates) {
            if ((date.getFullYear() === start.getFullYear() && date.getMonth() === start.getMonth() && date.getDate() === start.getDate()) || (date.getFullYear() === end.getFullYear() && date.getMonth() === end.getMonth() && date.getDate() === end.getDate())) {
                alert("Sorry, this spot is already booked for those days!");
                isForbidden = true
                break;
            }
        }

        if (isForbidden || nightCount < 1) return;

        const book = {
            startDate: format(state[0].startDate, "yyyy/MM/dd"),
            endDate: format(state[0].endDate, "yyyy/MM/dd"),
        }

        if (isBooked) {
            let bookRes = await dispatch(editBookingThunk({ bookingId: booking.id, book }));
            if (bookRes.ok) {
                let bookData = await bookRes.json();
                console.log(bookData);
                history.push(`../bookings/current`);
            }
            else {
                // console.log("error with spot data")
                // console.log(await spotRes.json());
            }
        } else {
            let bookRes = await dispatch(createNewBookingThunk({ spotId: id, book }));
            if (bookRes.ok) {
                let bookData = await bookRes.json();
                console.log(bookData);
                history.push(`../bookings/current`)
            }
            else {
                // console.log("error with spot data")
                // console.log(spotRes);
            }
        }

    };

    return (
        <div className='create-new-booking-page'>
            <h1 className='create-new-booking-page-title'>{isBooked ? "Update your Booking" : "Create a Booking"}</h1>
            <img src={prevImg ? prevImg.url : placeHolderImage} alt={spot.name}
                className='spot-card-img'
                data-tooltip-id="my-tooltip"
                data-tooltip-content={spot.name}
                onClick={(e) => history.push(`../spots/${spot.id}`)}
                style={{ cursor: "pointer" }}
            />
            <form className='create-new-booking-form' onSubmit={handleSubmit}>
                <DateRange
                    editableDateInputs={true}
                    onChange={item => setState([item.selection])}
                    moveRangeOnFirstSelection={false}
                    minDate={TOMORROW}
                    disabledDates={forbiddenDates}
                    ranges={state}
                    months={2}
                    direction='horizontal'
                />
                <h3>Total: <span>${(nightCount * spot.price).toFixed(2)}</span></h3>
                <h4>{nightCount} night{nightCount === 1 ? "" : "s"} at ${spot.price} / night</h4>
                <button className="reserve-button" type='submit'>{isBooked ? "Update Booking" : "Create Booking"}</button>
            </form>
            {isBooked ?
            <OpenModalButton
                buttonText="Cancel Booking"
                cssClass={"user-spot-delete-button"}
                modalComponent={<DeleteBookingModal bookingId={booking.id} />}
            /> : <></>}
            <Tooltip id="my-tooltip" place='right' />
        </div>
    )
}

export default BookingForm;
