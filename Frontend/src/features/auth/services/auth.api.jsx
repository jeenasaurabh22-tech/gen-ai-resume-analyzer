import axios from "axios";
import API_URL from "../../../config/apiConfig.js";

const api=axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function register({userName,email,password}){
    try{
        const response = await api.post("/auth/register",{userName,email,password});
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
}
export async function login({email,password}){
    try{
        const response = await api.post("/auth/login",{email,password});
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Login failed';
        console.error("Error logging in user:", message, error);
        throw new Error(message);
    }
}
export async function logout(){
    try{
        const response = await api.get("/auth/logout");
        localStorage.removeItem('token');
        return response.data;
    } catch (error) {
        console.error("Error logging out user:", error);
        throw error;
    }}
    export async function getCurrentUser(){
        try{
            const response = await api.get("/auth/get-me");
            return response.data;
        } catch (error) {
            console.error("Error fetching current user:", error);
            throw error;
        }
    }