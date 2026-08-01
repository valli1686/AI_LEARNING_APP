import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getErrorMessage = (error, defaultMsg) => {
  const data = error.response?.data;
  if (!data) return { message: defaultMsg };
  const msg = data.error || data.message || defaultMsg;
  return { ...data, message: typeof msg === "string" ? msg : JSON.stringify(msg) };
};

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
    throw getErrorMessage(error, "Invalid email or password");
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
    throw getErrorMessage(error, "Registration failed");
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
    throw getErrorMessage(error, "Failed to fetch profile");
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
    throw getErrorMessage(error, "Failed to update profile");
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
    throw getErrorMessage(error, "Failed to change password");
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