// frontend/src/components/LoginFormModal/index.js
import React, { useState, useEffect } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal.js";
import "./LoginFormModal.css";
import { Link, useHistory } from "react-router-dom";

function LoginFormModal() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [clientError, setClientError] = useState({});
  const [disabled, setDisabled] = useState(true);
  const [touched, setTouched] = useState({});
  const [submitState, setSubmitState] = useState(false);
  const { closeModal } = useModal();

  const handleSubmit = (e, demoUser = false) => {
    e.preventDefault();
    setErrors({});
    if (!demoUser) setSubmitState(true);

    return dispatch(sessionActions.loginThunk(demoUser ?{ credential:"Demo-lition", password:"password" } : { credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };

  useEffect(() => {
    let newErrors = {};

    if (credential.length < 4 || credential.length > 255) {
      newErrors.credential = "Credential must be between 4 and 255 characters";
      setDisabled(true);
    }
    else delete newErrors.credential;

    if (password.length < 6 || password.length > 255) {
      newErrors.password = "Password must be between 4 and 255 characters";
      setDisabled(true);
    }
    else delete newErrors.password;

    setClientError(newErrors)

    return () => setClientError({});
  }, [credential, password])

  useEffect(() => {
    if (credential.length >= 4 && password.length >= 6 && !clientError.credential && !clientError.password) setDisabled(false);
}, [clientError])

  return (
    <div className="login-form-modal">
      <h1>Log In</h1>
      {errors.credential && (
          <p className="form-error">{errors.credential}</p>
        )}
      <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={credential}
            placeholder="Username or Email"
            onChange={(e) => setCredential(e.target.value)}
            onBlur={() => setTouched({ ...touched, 'credential': true })}
            required
          />
          {((touched.credential || submitState) && clientError.credential) && <p className="form-error">{clientError.credential}</p>}
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched({ ...touched, 'password': true })}
            required
          />
          {((touched.password || submitState) && clientError.password) && <p className="form-error">{clientError.password}</p>}
        <button disabled={disabled} type="submit" className={disabled ? "submit-login-inactive": "submit-login-active" }>Log In</button>
        <button className="demo-user-login" onClick={e=>handleSubmit(e, true)}>
          <Link to={`${history.location.pathname}`} style={{color: "#f34669"}}>
            Demo User
          </Link>
        </button>
      </form>
    </div>
  );
}

export default LoginFormModal;
