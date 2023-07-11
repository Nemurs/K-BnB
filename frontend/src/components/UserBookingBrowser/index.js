import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { format, isWithinInterval } from "date-fns";
import { loadUserOwnedThunk } from '../../store/allBookings';
import { loadOneBookingThunk } from "../../store/singleBooking";
import { loadOneThunk } from "../../store/singleSpot";
import SpotCard from '../SpotCard';
import OpenModalButton from '../OpenModalButton';
import DeleteBookingModal from '../DeleteBookingModal';
import "./UserBookingBrowser.css";

const TODAY = new Date();
const FORMATTEDTODAY = new Date(TODAY.getTime() - TODAY.getTimezoneOffset() * -60000 );

const UserBookingBrowser = () => {
    const dispatch = useDispatch();
    const bookings = useSelector(state => Object.values(state.bookings.allBookings));
    const sessionUser = useSelector((state) => state.session.user);
    const history = useHistory();

    useEffect(() => {
        dispatch(loadUserOwnedThunk());
    }, [dispatch]);

    useEffect(() => {
        //redirect to homepage if there is no user
        if (!sessionUser) history.push("/");
    }, [sessionUser])

    async function handleClick(e, spotId) {
        e.preventDefault();
        await dispatch(loadOneThunk(spotId));
        await dispatch(loadOneBookingThunk(spotId));
        history.push(`../../reserve/${spotId}`);
    }

    return (
        <div>
            {!bookings.length || bookings.every(book => book.expired) ? (<h1 style={{color:"#47bbff"}}>Looks like you have no bookings {":("}</h1>):(<h1>Manage Your Bookings</h1>)}
            <Link to="../">
                <button className="user-spot-create-button" onClick={(e) => e.preventDefault}>Create a New Booking</button>
            </Link>
            {bookings.length ? (
                <ul className='spot-list'>
                    {bookings.map((book) => {
                        const spot = book.Spot
                        if(!spot || book.expired) return (<></>)
                        const unAdjustedStart = new Date(book.startDate)
                        const start = new Date(unAdjustedStart.getTime() - unAdjustedStart.getTimezoneOffset() * -60000 );
                        const unAdjustedEnd = new Date(book.endDate)
                        const end = new Date(unAdjustedEnd.getTime() - unAdjustedEnd.getTimezoneOffset() * -60000 );
                        const isInProgress = isWithinInterval(FORMATTEDTODAY, {start, end})
                        return (
                            <li key={spot["id"]} className='spot-card-list-item' style={isInProgress ? {border:"2.5px solid #f9385d", borderRadius:"20px"}:{}}>
                                <Link to={`../spots/${spot["id"]}`} className='spot-card-link'>
                                    <span>{`${format(start,"yyyy/MM/dd")} - ${format(end,"yyyy/MM/dd")}`}</span>
                                    <SpotCard spot={spot} tooltip={spot["name"]} />
                                </Link>
                                <div className='user-spot-buttons'>
                                    <Link to={`../reserve/${spot["id"]}`}>
                                        <button className="user-spot-update-button" onClick={e => handleClick(e, spot["id"])}>Update</button>
                                    </Link>
                                    {isInProgress ? (<></>) :
                                        <OpenModalButton
                                            buttonText="Cancel Booking"
                                            cssClass={"user-spot-delete-button"}
                                            modalComponent={<DeleteBookingModal bookingId={book.id} />}
                                        />
                                    }
                                </div>
                            </li>
                        )
                    })}
                </ul>
            ):(<></>)}
        </div>
    );
};

export default UserBookingBrowser;
