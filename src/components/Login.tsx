import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg("");
      setLoading(true);
      if (!passwordRef.current?.value || !emailRef.current?.value) {
        setErrorMsg("Please fill in the fields");
        return;
      }
      const { error } = await login(emailRef.current.value, passwordRef.current.value);
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (error) {
      setErrorMsg("Email or Password Incorrect");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <fieldset id="email">
        <label>Email</label>
        <input type="email" ref={emailRef} required />
      </fieldset>
      <fieldset id="password">
        <label>Password</label>
        <input type="password" ref={passwordRef} required />
      </fieldset>
      <button disabled={loading} type="submit">
        Login
      </button>
      {errorMsg && (
        <div className="error">
          {errorMsg}
        </div>
      )}
    </form>
  );
};

export default Login;