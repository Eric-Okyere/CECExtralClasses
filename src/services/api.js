import axios from "axios";
import { API_BASE_URL } from "./BaseUrl";



export const registerUser = async (name, surname, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, surname, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Throw the error message from the backend (e.g., "User already exists")
      throw data.msg || "Registration failed";
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}auth/login`, {
      email,
      password,
    });

    // Typically returns { token, user: { name, email, ... } }
    return response.data; 
  } catch (error) {
    // Extract the error message from the backend response
    throw error.response?.data?.msg || "Login failed. Please check your credentials.";
  }
};

