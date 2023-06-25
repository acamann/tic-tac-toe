import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (
      !passwordRef.current?.value ||
      !emailRef.current?.value ||
      !confirmPasswordRef.current?.value
    ) {
      setErrorMsg("Please fill all the fields");
      return;
    }
    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      setErrorMsg("Passwords doesn't match");
      return;
    }
    try {
      setErrorMsg("");
      setLoading(true);
      const { data, error } = await register(
        emailRef.current.value,
        passwordRef.current.value
      );
      if (!error && data) {
        setMsg(
          "Registration Successful. Check your email to confirm your account"
        );
      }
    } catch (error) {
      setErrorMsg("Error in Creating Account");
    }
    setLoading(false);
  };

  return (
    <>
      <h2 className="text-center mb-4">Register</h2>
      <form onSubmit={handleSubmit}>
        <fieldset id="email">
          <label>Email</label>
          <input type="email" ref={emailRef} required />
        </fieldset>
        <fieldset id="password">
          <label>Password</label>
          <input type="password" ref={passwordRef} required />
        </fieldset>
        <fieldset id="confirm-password">
          <label>Confirm Password</label>
          <input type="password" ref={confirmPasswordRef} required />
        </fieldset>
        {errorMsg && (
          <div
            style={{ color: "red" }}
            onClick={() => setErrorMsg("")}
          >
            {errorMsg}
          </div>
        )}
        {msg && (
          <div onClick={() => setMsg("")}>
            {msg}
          </div>
        )}
        <div className="text-center mt-2">
          <button disabled={loading} type="submit" className="w-50">
            Register
          </button>
        </div>
      </form>
    </>
  );
};

export default Register;