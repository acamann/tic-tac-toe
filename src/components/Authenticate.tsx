import './Authenticate.css';
import { useAuth } from "../context/AuthContext";

const Authenticate = () => {
  const { loginWithRedirect } = useAuth();
  return (
    <div className="authenticate">
      <button onClick={() => loginWithRedirect()}>
        Login
      </button>
    </div>
  );
}

export default Authenticate;