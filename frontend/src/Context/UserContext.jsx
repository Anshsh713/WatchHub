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

  /* === PROFILE & DASHBOARD === */
  const getUserProfile = async (identifier = "me") => {
    try {
      const res = await API.get(`/user/profile/${identifier}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to load profile");
    }
  };

  const updateUserProfile = async (data) => {
    try {
      const res = await API.put("/user/profile", data);
      if (res.data.user) {
        dispatch(setUser(res.data.user));
      }
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update profile");
    }
  };

  /* === SETTINGS & SECURITY === */
  const getUserSettings = async () => {
    try {
      const res = await API.get("/user/settings");
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch settings");
    }
  };

  const updateUserSettings = async (data) => {
    try {
      const res = await API.put("/user/settings", data);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update settings");
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await API.put("/user/security/password", {
        currentPassword,
        newPassword,
      });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to change password");
    }
  };

  /* === FOLLOW & SOCIAL === */
  const followUser = async (targetUserId) => {
    try {
      const res = await API.post(`/user/follow/${targetUserId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to follow user");
    }
  };

  const unfollowUser = async (targetUserId) => {
    try {
      const res = await API.post(`/user/unfollow/${targetUserId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to unfollow user");
    }
  };

  const getUserFollowers = async (identifier) => {
    try {
      const res = await API.get(`/user/${identifier}/followers`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch followers");
    }
  };

  const getUserFollowing = async (identifier) => {
    try {
      const res = await API.get(`/user/${identifier}/following`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch following");
    }
  };

  /* === PROFILE TABS CONTENT === */
  const getUserWatchlist = async (identifier, params = {}) => {
    try {
      const res = await API.get(`/user/${identifier}/watchlist`, { params });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch user watchlist");
    }
  };

  const getUserReviews = async (identifier) => {
    try {
      const res = await API.get(`/user/${identifier}/reviews`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch user reviews");
    }
  };

  const getUserRatings = async (identifier) => {
    try {
      const res = await API.get(`/user/${identifier}/ratings`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch user ratings");
    }
  };

  const getUserActivity = async (identifier) => {
    try {
      const res = await API.get(`/user/${identifier}/activity`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch user activity");
    }
  };

  const getUserLikes = async (identifier) => {
    try {
      const res = await API.get(`/user/${identifier}/likes`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch user likes");
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
        getUserProfile,
        updateUserProfile,
        getUserSettings,
        updateUserSettings,
        changePassword,
        followUser,
        unfollowUser,
        getUserFollowers,
        getUserFollowing,
        getUserWatchlist,
        getUserReviews,
        getUserRatings,
        getUserActivity,
        getUserLikes,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);
