import {useContext} from "react"
import {AuthContext} from "../auth.context.jsx"
import{login,register,logout,getCurrentUser} from "../services/auth.api.jsx"

export const useAuth=()=>{
    const context=useContext(AuthContext);
    const {user,setUser,loading,setLoading}=context;
    const handleLogin=async({email,password})=>{
        setLoading(true);
        try{
            const userData=await login({email,password});
            setUser(userData.user);
            return userData;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    const handleRegister=async({userName,email,password})=>{
        setLoading(true);
        try{
            const userData=await register({userName,email,password});
            setUser(userData.user);
        } catch (error) {
            console.error("Registration failed:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleLogout=async()=>{
        setLoading(true);
        try{
            await logout();
            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return {user,setUser,loading,setLoading,handleLogin,handleRegister,handleLogout};
}