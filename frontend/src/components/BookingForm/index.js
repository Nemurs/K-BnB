import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip'
import { createNewSpotImageThunk, createNewSpotThunk, editSpotThunk } from '../../store/allSpots';
import { loadOneThunk } from '../../store/singleSpot';
import { addDays, differenceInDays } from 'date-fns';
import { DateRange } from 'react-date-range';
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
    const spot = useSelector(state => state.spots.singleSpot);
    const user = useSelector(state => state.session.user)

    const [error, setError] = useState({});
    const [state, setState] = useState([
        {
          startDate: TOMORROW,
          endDate: addDays(TOMORROW, +2),
          key: 'selection'
        }
      ]);

    useEffect(() => {
        if(!spot || spot.id !== id){
            dispatch(loadOneThunk(id));
        }
    }, [dispatch]);

    if (!spot || !spot.SpotImages || !user) return (<></>)

    let prevImg = spot.SpotImages.find(img => img.preview === true);
    const isBooked = false;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errorMsgs = Object.values(error);

        if (errorMsgs.length >= 1) {
            let alertMsg = errorMsgs.reduce((acc, val) => acc + `    ${val}\n`, "")
            alert(`Please fix the following errors before submitting: \n${alertMsg}`);
            return;
        };
        if (isBooked) {
            //TODO: UPDATE IMAGES
            let bookRes = await dispatch();
            if (bookRes.ok) {
                let bookData = await bookRes.json();
                // console.log(bookData);
                history.push(`/bookings/current`);
            }
            else {
                // console.log("error with spot data")
                // console.log(await spotRes.json());
            }
        } else {
            let bookRes = await dispatch();
            if (bookRes.ok) {
                let bookData = await bookRes.json();
                // console.log(bookData);
                history.push(`/bookings/current`);
            }
            else {
                // console.log("error with spot data")
                // console.log(spotRes);
            }
        }

    };

    return (
        <div className='create-new-spot-page'>
            <h1 className='create-new-spot-page-title'>{isBooked ? "Update your Booking" : "Create a new Booking"}</h1>
            <img src={prevImg? prevImg.url : placeHolderImage} alt={spot.name} className='spot-card-img' />
            <div className='create-new-spot-form-div'>
                <form className='create-new-spot-form' onSubmit={handleSubmit}>
                    <DateRange
                        editableDateInputs={true}
                        onChange={item => setState([item.selection])}
                        moveRangeOnFirstSelection={false}
                        minDate={TOMORROW}
                        ranges={state}
                        months={2}
                        direction='horizontal'
                    />
                    <h3>Total: ${(differenceInDays(state[0].endDate,state[0].startDate)*spot.price).toFixed(2)}</h3>
                    <button className="reserve-button" type='submit'>{isBooked ? "Update Booking" : "Create Booking"}</button>
                </form>
            </div>
        </div>
    )
}

export default BookingForm;
