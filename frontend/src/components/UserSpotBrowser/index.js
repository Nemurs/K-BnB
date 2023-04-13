import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import SpotCard from '../SpotCard';
import { loadUserOwnedThunk } from '../../store/allSpots';
import { loadOneThunk } from "../../store/singleSpot";
import "./UserSpotBrowser.css";
import OpenModalButton from '../OpenModalButton';
import DeleteSpotModal from '../DeleteSpotModal';

const UserSpotBrowser = () => {
    const dispatch = useDispatch();
    const spots = useSelector(state => Object.values(state.spots.allSpots));
    const sessionUser = useSelector((state) => state.session.user);
    const history = useHistory();

    useEffect(() => {
        dispatch(loadUserOwnedThunk());
    }, [dispatch]);

    useEffect(() => {
        //redirect to homepage if there is no user
        if (!sessionUser) history.push("/");
    }, [sessionUser])

    async function handleClick(e, id){
        e.preventDefault();
        // console.log(id);
        await dispatch(loadOneThunk(id));
        history.push(`/spots/${id}/edit`);
    }

    return (
        <div>
            <h1>Manage Your Spots</h1>
            <Link to="/spots/new">
                <button onClick={(e) => e.preventDefault}>Create a New Spot</button>
            </Link>
            <ul className='spot-list'>
                {spots.map((spot) => (
                    <li key={spot["id"]} className='spot-card-list-item'>
                        <Link to={`/spots/${spot["id"]}`} className='spot-card-link'>
                            <SpotCard spot={spot} tooltip={spot["name"]} />
                        </Link>
                        <div>
                            <Link to={`/spots/${spot["id"]}/edit`}>
                                <button onClick={e => handleClick(e, spot["id"])}>Update</button>
                            </Link>
                            <OpenModalButton
                                buttonText="Delete"
                                modalComponent={<DeleteSpotModal spotId={spot["id"]} />}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserSpotBrowser;
