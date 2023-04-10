import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, Link } from 'react-router-dom';
import SpotCard from '../SpotCard';
import { loadAllThunk } from '../../store/allSpots';

const SpotBrowser = () => {
  const dispatch = useDispatch();
  const spots = useSelector(state=>Object.values(state.spots.allSpots));


  useEffect(() => {
    dispatch(loadAllThunk());
  }, [dispatch]);

  return (
    <div>
      <h1>Spots</h1>
      <ol>
        {spots.map(({ id, name }) => (
          <li key={id}><Link to={`/spot/${id}`}>{name}</Link></li>
        ))}
      </ol>

      <Switch>
        {/* <Route path='/spots/:id'>
          <DetailedSpot/>
        </Route> */}
      </Switch>
    </div>
  );
};

export default SpotBrowser;
