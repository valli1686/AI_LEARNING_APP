import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

// Login
const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AUTH.LOGIN,
      {
        email,
        password,
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "An unknown error occurred",
    };
  }
};

// Register
const register = async (userData) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AUTH.REGISTER,
      userData
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "An unknown error occurred",
    };
  }
};

// Get Profile
const getProfile = async () => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.AUTH.GET_PROFILE
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "An unknown error occurred",
    };
  }
};

// Update Profile
const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.UPDATE_PROFILE,
      userData
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "An unknown error occurred",
    };
  }
};

// Change Password
const changePassword = async (passwords) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      passwords
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "An unknown error occurred",
    };
  }
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
};

export default authService;