import React from "react";
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

  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <li>
        <ProfileButton user={sessionUser} />
      </li>
    );
  } else {
    sessionLinks = (
      <li>
        <OpenModalButton
          buttonText="Log In"
          modalComponent={<LoginFormModal />}
        />
        <OpenModalButton
          buttonText="Sign Up"
          modalComponent={<SignupFormModal />}
        />
      </li>
    );
  }

  return (
    <ul className="nav-list">
      <li>
        <NavLink exact to="/" className="nav-home-link" style={{ textDecoration: "none", color: "#f9385d", fontWeight: "bold", fontSize:"20px"}}>
          <img src={logo} alt="Logo" />
          K-BnB
        </NavLink>
      </li>
      <div className="menu-wrapper">
        <i className="fas fa-bars" style={{ color: "black" }}></i>
        {isLoaded && sessionLinks}
      </div>
    </ul>
  );
}

export default Navigation;
