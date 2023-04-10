import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, Link } from 'react-router-dom';
import SpotCard from '../SpotCard';
import { loadAllThunk } from '../../store/allSpots';
import "./SpotBrowser.css";

const SpotBrowser = () => {
    const dispatch = useDispatch();
    const spots = useSelector(state => Object.values(state.spots.allSpots));


    useEffect(() => {
        dispatch(loadAllThunk());
    }, [dispatch]);

    return (
        <div>
            <ul className='spot-list'>
                {spots.map((spot) => (
                    <li key={spot["id"]} className='spot-card-list-item'>
                        <Link to={`/spots/${spot["id"]}`} className='spot-card-link'>
                            <SpotCard spot={spot} tooltip={spot["name"]}/>
                        </Link>
                    </li>
                ))}
            </ul>

            <Switch>
                {/* <Route path='/spots/:id'>
                        <DetailedSpot/>
                    </Route> */}
            </Switch>
        </div>
    );
};

export default SpotBrowser;
