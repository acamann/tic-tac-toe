import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (
      !passwordRef.current?.value ||
      !emailRef.current?.value ||
      !confirmPasswordRef.current?.value
    ) {
      setErrorMessage("Please fill all the fields");
      return;
    }
    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      setErrorMessage("Passwords doesn't match");
      return;
    }
    try {
      setErrorMessage("");
      setLoading(true);
      const { data, error } = await register(
        emailRef.current.value,
        passwordRef.current.value
      );
      if (error) {
        setErrorMessage(error.message);
      } else if (data) {
        setMessage("Registration Successful. Check your email to confirm your account");
      }
    } catch (error) {
      setErrorMessage("Error in Creating Account");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <fieldset>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" ref={emailRef} required />
      </fieldset>
      <fieldset>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" ref={passwordRef} required />
      </fieldset>
      <fieldset>
        <label htmlFor="confirm">Confirm Password</label>
        <input id="confirm" type="password" ref={confirmPasswordRef} required />
      </fieldset>
      <button disabled={loading} type="submit">
        Register
      </button>
      {errorMessage && (
        <div
          className="error"
          onClick={() => setErrorMessage("")}
        >
          {errorMessage}
        </div>
      )}
      {message && (
        <div onClick={() => setMessage("")}>
          {message}
        </div>
      )}
    </form>
  );
};

export default Register;