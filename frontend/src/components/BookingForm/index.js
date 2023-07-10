import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip'
import { loadOneThunk } from '../../store/singleSpot';
import { addDays, addMonths, differenceInDays, eachDayOfInterval, isPast, isAfter, isSameDay, isWithinInterval, min, max, subDays, formatISO, eachWeekendOfMonth } from 'date-fns';
import { DateRange } from 'react-date-range';
import { loadOneBookingThunk } from '../../store/singleBooking';
import { createNewBookingThunk, editBookingThunk } from '../../store/allBookings';
import OpenModalButton from '../OpenModalButton';
import DeleteBookingModal from '../DeleteBookingModal';
import placeHolderImage from "../../Assets/Images/No-Image-Placeholder.png";
import 'react-date-range/dist/styles.css'; // react-date-range main css file
import 'react-date-range/dist/theme/default.css'; // react-date-range theme css file
import "./BookingForm.css";

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
    const [forbiddenDates, setForbiddenDates] = useState([]);
    const [state, setState] = useState([{
        startDate: TODAY,
        endDate: addDays(TODAY, 1),
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

    useEffect(()=> {
        if(spot.Bookings){
            setForbiddenDates(prev => {
                let out = [];
                spot.Bookings.forEach(book => {
                    const start = new Date(book.startDate);
                    const end =  new Date(book.endDate)
                    if (!isPast(end) && book.id !== booking.id) {
                        out.push(...eachDayOfInterval({ start, end}))
                    }
                });
                return out;
            })
        }
    }, [spot])

    useEffect(()=> {
        if (forbiddenDates.length){
            let start = TODAY;
            let minDate;
            minDate = !isWithinInterval(TOMORROW, {start: min(forbiddenDates), end: max(forbiddenDates)}) ? TODAY : minDate;
            while (!minDate){
                const weekendDates = eachWeekendOfMonth(start)
                console.log(weekendDates)
                console.log(forbiddenDates)
                for (let date of weekendDates){
                    if(!isPast(date) && !forbiddenDates.some(fbd => fbd.toUTCString() === date.toUTCString())){
                        minDate = date;
                        break;
                    }
                }
                start = addMonths(start, 1)
            }
            console.log(minDate)
            setState([{
                startDate: minDate,
                endDate: addDays(minDate, 1),
                key: 'selection'
            }])
        }
    }, [forbiddenDates])

    if (!spot || !spot.SpotImages || !user) return (<></>)

    let prevImg = spot.SpotImages.find(img => img.preview === true);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let start = state[0].startDate;
        // let start = formatISO(state[0].startDate, { representation: 'date' })

        let end = state[0].endDate;
        // let end = formatISO(state[0].endDate, { representation: 'date' })
        // end = new Date(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())

        for (let forbiddenDate of forbiddenDates) {
            if (isSameDay(forbiddenDate, start) || isSameDay(forbiddenDate, end)) {
                alert("Sorry, this spot is already booked for those days.");
                return;
            }
        }

        if (nightCount < 1){
            alert("You must select at least 1 night.");
            return;
        }

        const book = {
            startDate: formatISO(state[0].startDate, { representation: 'date' }),
            endDate: formatISO(state[0].endDate, { representation: 'date' }),
        }

        console.log(book);
        // console.log(book.startDate);

        let bookRes = isBooked ? await dispatch(editBookingThunk({ bookingId: booking.id, book })) : await dispatch(createNewBookingThunk({ spotId: id, book }));
        if (bookRes.ok) {
            history.push(`../bookings/current`);
        } else {
            alert("Sorry, there was an error trying to book this spot.");
                return;
        }
    };

    const isInProgress = isBooked && isWithinInterval(new Date(), {start:new Date(booking.startDate), end:new Date(booking.endDate)})

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
                    onChange={item => {
                        if(isInProgress){
                            if(!forbiddenDates.every(date=>isAfter(item.selection.endDate, date))){
                                setState([{
                                    startDate: new Date(booking.startDate),
                                    endDate: item.selection.endDate,
                                    key: 'selection'
                                }])
                            } else {
                                setState([{
                                    startDate: new Date(booking.startDate),
                                    endDate: subDays(min(forbiddenDates),1),
                                    key: 'selection'
                                }])
                            }
                        } else setState([item.selection])
                    }}
                    moveRangeOnFirstSelection={false}
                    minDate={TODAY}
                    disabledDates={forbiddenDates}
                    ranges={state}
                    months={2}
                    direction='horizontal'
                    showDateDisplay={false}
                />
                <h3>Total: <span>${(nightCount * spot.price).toFixed(2)}</span></h3>
                <h4>{nightCount} night{nightCount === 1 ? "" : "s"} at ${spot.price} / night</h4>
                <button className="reserve-button" type='submit'>{isBooked ? "Update Booking" : "Create Booking"}</button>
            </form>
            {!isInProgress?
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
