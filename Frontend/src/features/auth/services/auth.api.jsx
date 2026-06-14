import axios from "axios";
const api=axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});
export async function register({userName,email,password}){
    try{
        const response = await api.post("/api/auth/register",{userName,email,password});
        return response.data;
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
}
export async function login({email,password}){
    try{
        const response = await api.post("/api/auth/login",{email,password});
        return response.data;
    } catch (error) {
        console.error("Error logging in user:", error);
        throw error;
    }
}
export async function logout(){
    try{
        const response = await api.get("/api/auth/logout");
        return response.data;
    } catch (error) {
        console.error("Error logging out user:", error);
        throw error;
    }}
    export async function getCurrentUser(){
        try{
            const response = await api.get("/api/auth/get-me");
            return response.data;
        } catch (error) {
            console.error("Error fetching current user:", error);
            throw error;
        }
    }