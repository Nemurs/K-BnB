// frontend/src/App.js
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch } from "react-router-dom";
import { Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import UserSpotBrowser from "./components/UserSpotBrowser";
import SpotBrowser from "./components/SpotBrowser";
import DetailedSpotCard from './components/DetailedSpotCard';
import NewSpotForm from "./components/NewSpotForm";
import BookingForm from "./components/BookingForm";
import UserBookingBrowser from "./components/UserBookingBrowser";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUserThunk()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route exact path='/spots/new'>
            <NewSpotForm />
          </Route>
          <Route exact path='/spots/current'>
            <UserSpotBrowser />
          </Route>
          <Route exact path='/bookings/current'>
            <UserBookingBrowser />
          </Route>
          <Route exact path='/spots/:id/edit'>
            <NewSpotForm />
          </Route>
          <Route exact path='/spots/:id'>
            <DetailedSpotCard />
          </Route>
          <Route exact path='/reserve/:id'>
            <BookingForm />
          </Route>
          <Route exact path='/'>
            <SpotBrowser />
          </Route>
        </Switch>
      )}
    </>
  );
}

export default App;
