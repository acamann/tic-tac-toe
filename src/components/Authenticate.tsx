import { useState } from 'react';
import Register from './Register'
import Login from './Login'
import './Authenticate.css';

const Authenticate = () => {
  const [mode, setMode] = useState<"register" | "login">("login");

  return (
    <div className="authenticate">
      {mode === "register" ? (
        <>
          <Register />
          <div className="mode">
            Already a User?
            <a onClick={() => setMode("login")}>
              Login
            </a>
          </div>
        </>
      ) : (
        <>
          <Login />
          <div className="mode">
            Need an Account?
            <a onClick={() => setMode("register")}>
              Register
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default Authenticate;