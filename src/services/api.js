import axios from "axios";
import { API_BASE_URL } from "./BaseUrl";



export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData), // Send the whole object
    });

    const data = await response.json();

    if (!response.ok) {
      // Use data.message or data.msg depending on your backend response
      throw data.message || data.msg || "Registration failed";
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

