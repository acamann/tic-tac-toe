import Register from './Register'
import Login from './Login'
import { useState } from 'react';

const Authenticate = () => {
  const [isRegistering, setIsRegistering] = useState(true);

  return isRegistering ? (
    <>
      <Register />
      <div>
        Already a User? <a onClick={() => setIsRegistering(false)}>Login</a>
      </div>
    </>
  ) : (
    <>
      <Login />
      <div>
        No Account? <a onClick={() => setIsRegistering(true)}>Register</a>
      </div>
    </>
  );
}

export default Authenticate;