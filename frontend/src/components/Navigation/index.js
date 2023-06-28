import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import OpenModalButton from "../OpenModalButton";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
import "./Navigation.css";
import logo from "../../Assets/Images/logo.png";

function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);
  const [showMenu, setShowMenu] = useState(false);
  const liRef = useRef();

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  const closeMenuOuter = () => {
    if (!showMenu) return;
    setShowMenu(false);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!liRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const ulClassName = "profile-dropdown-outer" + (showMenu ? "" : " hidden");

  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <li ref={liRef}>
        <ProfileButton user={sessionUser} closeMenuOuter={closeMenuOuter}/>
      </li>
    );
  } else {
    sessionLinks = (
      <ul className={ulClassName}>
        <li className="session-butons-li" ref={liRef}>
          <OpenModalButton
            buttonText="Log In"
            cssClass={"user-login-button"}
            onButtonClick={closeMenuOuter}
            modalComponent={<LoginFormModal />}
          />
          <OpenModalButton
            buttonText="Sign Up"
            cssClass={"user-signup-button"}
            onButtonClick={closeMenuOuter}
            modalComponent={<SignupFormModal />}
          />
        </li>
      </ul>
    );
  }

  return (
    <ul className="nav-list">
      <li>
        <NavLink exact to="/" className="nav-home-link" style={{ textDecoration: "none", color: "#f9385d", fontWeight: "bold", fontSize: "20px" }}>
          <img src={logo} alt="Logo" />
          K-BnB
        </NavLink>
      </li>
      <div className="nav-list-right">
        {isLoaded && sessionUser && <NavLink exact to="/spots/new" className="spot-creation-link">
          Create a new spot
        </NavLink>}
        <div className="menu-wrapper" onClick={openMenu}>
          <i className={`fas fa-bars ${sessionUser ? "hidden": ""}`} style={{ color: "black" }}/>
          <i className={`fas fa-user-circle ${sessionUser ? "hidden": ""}`} />
          {isLoaded && sessionLinks}
        </div>
      </div>

    </ul>
  );
}

export default Navigation;
