import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactCardFlip from "react-card-flip";
import OtpInput from "react-otp-input";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";


export function LogIn() {
  const navigateTo = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [flip, setFlip] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [passwordShown, setPasswordShown] = useState(false);


  const otpChange = (otp) => {
    return setOtp(otp);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  const handleLoginWithPassword = (event) => {
    if (event.key === "Enter") {
      loginFlip();
    }
  };
  const handleLoginWithOTP = (event) => {
    if (event.key === "Enter") {
      submitOTP();
    }
  };
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  const flipCard = (e) => {
    setFlip(!flip);
  };

  const onClickforgotPassword = () => {
    navigateTo("/auth/forgotPassword");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }

      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
        } else {
          setSeconds(59);
          setMinutes(minutes - 1);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });

  const resendOTP = () => {
  
  };

  /** Login with user id and password code start */
  const loginFlip = () => {
   
  
    
  };
  /** Login with user id and password code end */

  /** Login with user id and OTP code start */
  function submitOTP() {
   
  }
  /** Login with user id and OTP code end */

  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };

  return (
    <>
      

      <ReactCardFlip isFlipped={flip} flipDirection="horizontal">
        <div className="flex justify-center w-screen h-screen items-center">
          <div className="grid place-items-center max-w-sm rounded overflow-hidden shadow-lg bg-white">
            <div className="flex min-h-full flex-1 flex-col justify-center  lg:px-0 w-80">
              <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              

                <h2 className="mt-1 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                  Login
                </h2>
              </div>

              <div className="px-6 py-6 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Email Address
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={username}
                        onChange={handleUsernameChange}
                        onKeyDown={handleLoginWithPassword}
                        required
                        className="block w-full rounded-md border-inherit border border-gray-300 py-1.5 text-gray-900 shadow-sm ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Password
                      </label>
                    </div>
                    <div className="mt-2 relative">
                      <input
                        id="password"
                        name="password"
                        type={passwordShown ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={handlePasswordChange}
                        onKeyDown={handleLoginWithPassword}
                        required
                        className="block w-full rounded-md border-inherit border border-gray-300 py-1.5 text-gray-900 shadow-sm ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2"
                      />
                      <button
                        className="absolute inset-y-0 right-0 px-2 text-gray-500"
                        onClick={togglePasswordVisiblity}
                      >
                        {!passwordShown ? (
                          <EyeIcon className="h-5 w-5 float-right" />
                        ) : (
                          <EyeSlashIcon className="h-5 w-5 float-right" />
                        )}
                      </button>
                    </div>
                    <div className="text-xs">
                      <a
                        href="#"
                        onClick={onClickforgotPassword}
                        className=" font-bold  leading-6 text-indigo-600 hover:text-indigo-500  float-right mt-2 mb-5"
                      >
                        Forgot Password?
                      </a>
                    </div>
                  </div>

                  <div>
                    <button
                    
                      onClick={loginFlip}
                      className="flex w-full justify-center rounded-md bg-[#022b45] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#022b45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Login
                   
                    </button>
                  </div>
                </div>

                <p className="mt-10 text-center text-sm text-gray-500 justify-end flex">
                {/*  <Link
                    to="/auth/Register"
                    className="font-bold  leading-6 text-indigo-600 hover:text-indigo-500"
                  >
                    Trouble Login?
                        </Link>  */}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center w-screen h-screen items-center">
          <div className="grid place-items-center max-w-sm rounded overflow-hidden shadow-lg bg-white">
            <div className="flex min-h-full flex-1 flex-col justify-centerlg:px-0 w-80">
              <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                               <h2 className="mt-1 text-center justify-center text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                  Login
                </h2>
              </div>

              <div className="px-6 py-6 mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Email Address
                    </label>
                    <div className="mt-2">
                      <input
                        readOnly
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={username}
                        onChange={handleUsernameChange}
                        onKeyDown={handleLoginWithOTP}
                        required
                        className="block w-full rounded-md border-inherit border border-gray-300 py-1.5 text-gray-900 shadow-sm ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        One Time Passcode
                      </label>
                    </div>
                    <div className="mt-2">
                      <OtpInput
                        className="text-grey-darkest"
                        value={otp}
                        inputType="tel"
                        onChange={otpChange}
                        numInputs={6}
                        inputStyle={{
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          width: "39px",
                          height: "35px",
                          fontSize: "12px",
                          color: " #111827",
                          fontWeight: "400",
                          caretColor: "blue",
                        }}
                        focusStyle={{
                          border: "1px solid #CFD3DB",
                          outline: "none",
                        }}
                        renderSeparator={<span>&nbsp;</span>}
                        renderInput={(props) => (
                          <input
                            {...props}
                            shouldAutoFocus
                            onKeyDown={handleLoginWithOTP}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <button
                    
                      onClick={submitOTP}
                      className="flex w-full justify-center rounded-md bg-[#022b45] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#022b45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Login
                   
                    </button>
                  </div>
                </div>

                <div
                  variant="small"
                  className="mt-6 flex justify-center text-xs"
                >
                  {seconds > 0 || minutes > 0 ? (
                    <p>
                      Time Remaining: {minutes < 10 ? `0${minutes}` : minutes}:
                      {seconds < 10 ? `0${seconds}` : seconds}
                    </p>
                  ) : (
                    <p>Didn't recieve code?</p>
                  )}

                  <div
                    as="span"
                    variant="small"
                    color="blue"
                    className="ml-1 font-bold cursor-pointer"
                    disabled={seconds > 0 || minutes > 0}
                    style={{
                      color: seconds > 0 || minutes > 0 ? "#DFE3E8" : "#4f46e5",
                      paddingLeft: "5px",
                    }}
                    onClick={resendOTP}
                  >
                    <u>Resend OTP</u>
                  </div>
                </div>
                <p className="mt-10 text-center text-sm text-gray-500 justify-end flex">
                  <Link
                    to="/auth/log-in "
                    className="font-bold  leading-6 text-indigo-600 hover:text-indigo-500"
                    onClick={flipCard}
                  >
                    Back to Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </ReactCardFlip>
    </>
  );
}
export default LogIn;
