import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import "./SignupForm.css";

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [error, setError] = useState({});
  const [clientError, setClientError] = useState({});
  const [touched, setTouched] = useState({});
  const [submitState, setSubmitState] = useState(false);
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitState(true);
    if (password === confirmPassword) {
      setError({});
      return dispatch(
        sessionActions.signupThunk({
          email,
          username,
          firstName,
          lastName,
          password,
        })
      )
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data && data.errors) {
            setError(data.errors);
          }
          console.log(data);
        });
    }
    return setError({
      confirmPassword: "Confirm Password field must be the same as the Password field"
    });
  };

  useEffect(() => {
    let newErrors = {};

    if (username.length < 4 || username.length > 255) {
      newErrors.username = "Username must be between 4 and 255 characters";
      setDisabled(true);
    }
    else delete newErrors.username;

    if (password.length < 6 || password.length > 255) {
      newErrors.password = "Password must be between 4 and 255 characters";
      setDisabled(true);
    }
    else delete newErrors.password;

    setClientError(newErrors)

    return () => setClientError({});
  }, [username, password])

  useEffect(() => {
    if (!(email.length && firstName.length && lastName.length && confirmPassword.length)) {
      let newErrors = { ...clientError };
      newErrors.allFields = "All fields are required"
      setClientError(newErrors);
      setDisabled(true);
    } else delete clientError.allFields

    return () => setClientError({ ...clientError });

  }, [email, firstName, lastName, confirmPassword])

  useEffect(() => {
    if (username.length >= 4 && password.length >= 6 && !clientError.email && !clientError.password && !clientError.allFields) setDisabled(false);
  }, [clientError])

  return (
    <div className="signup-form-modal">
      <h1>Sign Up</h1>
      <form className="signup-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required

          />
        </label>
        {error.email && <p className="form-error">{error.email}</p>}
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            onBlur={() => setTouched({ ...touched, 'username': true })}
          />
        </label>
        {error.username && <p className="form-error">{error.username}</p>}
        {((touched.username || submitState) && clientError.username) && <p className="form-error">{clientError.username}</p>}
        <label>
          First Name
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        {error.firstName && <p className="form-error">{error.firstName}</p>}
        <label>
          Last Name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        {error.lastName && <p className="form-error">{error.lastName}</p>}
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            onBlur={() => setTouched({ ...touched, 'password': true })}
          />
        </label>
        {error.password && <p className="form-error">{error.password}</p>}
        {((touched.password || submitState) && clientError.password) && <p className="form-error">{clientError.password}</p>}
        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        {error.confirmPassword && (
          <p className="form-error">{error.confirmPassword}</p>
        )}
        {(submitState && clientError.allFields) && <p className="form-error">{clientError.allFields}</p>}
        <button disabled={disabled} className={disabled ? "submit-login-inactive" : "submit-login-active"} type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignupFormModal;
