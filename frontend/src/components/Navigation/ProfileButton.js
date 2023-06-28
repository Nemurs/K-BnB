// frontend/src/components/Navigation/ProfileButton.js
import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import { Link } from "react-router-dom";
import "./Navigation.css";
import { useHistory } from "react-router-dom";
import { clearSingleBookingAction } from "../../store/singleBooking";

function ProfileButton({ user, closeMenuOuter }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  const closeMenuInner = () => {
    if (!showMenu) return;
    setShowMenu(false);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const logout = (e) => {
    e.preventDefault();
    closeMenuOuter();
    dispatch(sessionActions.logoutThunk());
    dispatch(clearSingleBookingAction());
    history.push("/");
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <>
      <button className="inner-menu-button" onClick={openMenu}>
      <i className="fas fa-bars" style={{ color: "black" }}/>
      </button>
      <ul className={ulClassName} ref={ulRef}>
        <li>{`Hello, ${user.firstName}`}</li>
        <li>{user.email}</li>
        <li>
          <Link to={'/spots/current'} className='spot-management-link' onClick={closeMenuInner}>
            Manage Spots
          </Link>
        </li>
        <li>
          <Link to={'/bookings/current'} className='spot-management-link' onClick={closeMenuInner}>
            My Bookings
          </Link>
        </li>
        <li>
          <button className="user-logout-button" onClick={logout}>Log Out</button>
        </li>
      </ul>
    </>
  );
}

export default ProfileButton;
