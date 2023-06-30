import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import {format} from "date-fns";
import SpotCard from '../SpotCard';
import { loadUserOwnedThunk } from '../../store/allBookings';
import { loadOneBookingThunk } from "../../store/singleBooking";
import { loadOneThunk } from "../../store/singleSpot";
import "./UserBookingBrowser.css";
import OpenModalButton from '../OpenModalButton';
import DeleteBookingModal from '../DeleteBookingModal';

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
        // console.log(id);
        await dispatch(loadOneThunk(spotId));
        await dispatch(loadOneBookingThunk(spotId));
        history.push(`../../reserve/${spotId}`);
    }

    return (
        <div>
            {!bookings.length ? (<h1 style={{color:"#47bbff"}}>Looks like you have no bookings yet {":("}</h1>):(<h1>Manage Your Bookings</h1>)}
            <Link to="../">
                <button className="user-spot-create-button" onClick={(e) => e.preventDefault}>Create a New Booking</button>
            </Link>
            {bookings.length ? (
                <ul className='spot-list'>
                    {bookings.map((book) => {
                    const spot = book.Spot
                    if(!spot || book.expired) return (<></>)
                    let startsToday = (new Date(book.startDate)).getDate() === (new Date()).getDate()
                    return (
                        <li key={spot["id"]} className='spot-card-list-item' style={startsToday ? {border:"2.5px solid #f9385d", borderRadius:"20px"}:{}}>
                            <Link to={`../spots/${spot["id"]}`} className='spot-card-link'>
                                <span>{`${format(new Date(book.startDate),"yyyy/MM/dd")} - ${format(new Date(book.endDate),"yyyy/MM/dd")}`}</span>
                                <SpotCard spot={spot} tooltip={spot["name"]} />
                            </Link>
                            <div className='user-spot-buttons'>
                                <Link to={`../reserve/${spot["id"]}`}>
                                    <button className="user-spot-update-button" onClick={e => handleClick(e, spot["id"])}>Update</button>
                                </Link>
                                <OpenModalButton
                                    buttonText="Cancel Booking"
                                    cssClass={"user-spot-delete-button"}
                                    modalComponent={<DeleteBookingModal bookingId={book.id} />}
                                />
                            </div>
                        </li>
                    )})}
                </ul>
            ):(<></>)}
        </div>
    );
};

export default UserBookingBrowser;
