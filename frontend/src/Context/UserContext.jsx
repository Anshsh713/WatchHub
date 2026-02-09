import React, { Children, createContext, useContext } from "react";
import { useDispatch } from "react-redux";
import { login, logout, setUser } from "../Data_Management/AuthSlice";
import API from "../Services/Axios_api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const dispatch = useDispatch();

  /*=== Login ===*/
  const LoginUser = async (email, password) => {
    try {
      const res = await API.post("/user/login", {
        User_Email: email,
        User_Password: password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      dispatch(login({ token, user }));
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  /*=== Sign up Request ===*/
  const SignupRequest = async (username, email, password) => {
    try {
      const res = await API.post("/user/signup/request", {
        User_Name: username,
        User_Email: email,
        User_Password: password,
      });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Signup failed");
    }
  };

  /* === Sign up Verify ===*/
  const SignupVerify = async (username, email, password, otp) => {
    try {
      const res = await API.post("/user/signup/verify", {
        User_Name: username,
        User_Email: email,
        User_Password: password,
        otp,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      dispatch(login({ token, user }));

      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Verification failed");
    }
  };

  /*=== Password Reseting Requesting ===*/
  const PassowrdRestingRequest = async (email) => {
    try {
      const res = await API.post("/user/password/request", {
        User_Email: email,
      });
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Password request failed",
      );
    }
  };

  /* === Password Reset Verify OTP === */

  const Password_Reset_Verify = async (email, otp) => {
    try {
      const res = await API.post("/user/password/verify", {
        User_Email: email,
        OTP: otp,
      });
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "OTP verification failed",
      );
    }
  };

  /* === Final Password Reset === */
  const Password_Reseting = async (email, newPassword) => {
    try {
      const res = await API.post("/user/password/resting", {
        User_Email: email,
        New_Password: newPassword,
      });

      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Password reset failed");
    }
  };

  /* === GET ME === */
  const getMe = async () => {
    try {
      const res = await API.get("/user/me");
      dispatch(setUser(res.data.user));
      return res.data.user;
    } catch (error) {
      dispatch(logout());
      localStorage.removeItem("token");
    }
  };

  /* === LOGOUT === */
  const logoutUser = () => {
    localStorage.removeItem("token");
    dispatch(logout());
  };

  const DeletingOTP = async (email) => {
    try {
      const res = await API.get("/user/otp", {
        User_Email: email,
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || "OTP Deleting Failed");
    }
  };

  return (
    <UserContext.Provider
      value={{
        LoginUser,
        SignupRequest,
        SignupVerify,
        logoutUser,
        getMe,
        PassowrdRestingRequest,
        Password_Reset_Verify,
        Password_Reseting,
        DeletingOTP,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);
