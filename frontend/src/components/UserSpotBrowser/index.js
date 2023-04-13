import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import SpotCard from '../SpotCard';
import { loadUserOwnedThunk } from '../../store/allSpots';
import "./UserSpotBrowser.css";

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
        if(!sessionUser) history.push("/");
    }, [sessionUser])

    return (
        <div>
            <h1>Manage Your Spots</h1>
            <ul className='spot-list'>
                {spots.map((spot) => (
                    <li key={spot["id"]} className='spot-card-list-item'>
                        <Link to={`/spots/${spot["id"]}`} className='spot-card-link'>
                            <SpotCard spot={spot} tooltip={spot["name"]}/>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserSpotBrowser;
