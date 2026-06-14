import React from 'react'
import "../auth.form.scss"
import {useNavigate,Link} from "react-router-dom"
import {useAuth} from "../hooks/useAuth.jsx"

const Register = () => {
  const {loading,handleRegister}=useAuth();
  const navigate = useNavigate()
  const [userName,setUsername]=React.useState("");
  const [email,setEmail]=React.useState("");
  const [password,setPassword]=React.useState("");
  const [confirmPassword,setConfirmPassword]=React.useState("");
  const handleSubmit=async (e) => {
    e.preventDefault();
    if(password!==confirmPassword){
      alert("Passwords do not match");
      return;
    }
    await handleRegister({userName,email,password});
    navigate("/");
  }
   if(loading){
    return (<main><h1>Loading...</h1>
    </main>
    )
  }
    
  
  return (
    <main>
      <div className="form-container">
        <h1>Create Account</h1>
        <p className="subtitle">Join us to get started</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullname">Full Name</label>
            <input 
            onChange={(e)=>setUsername(e.target.value)}
              type="text" 
              id="fullname" 
              name="fullname" 
              placeholder="John Doe"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="userName">Username</label>
            <input 
              onChange={(e)=>setUsername(e.target.value)}
              type="text" 
              id="userName" 
              name="userName" 
              placeholder="johndoe"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              onChange={(e)=>setEmail(e.target.value)}
              type="email" 
              id="email" 
              name="email" 
              placeholder="you@example.com"
              required 
              type="email" 
              id="email" 
              name="email" 
              placeholder="you@example.com"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
            onChange={(e)=>setPassword(e.target.value)}

              type="password" 
              id="password" 
              name="password" 
              placeholder="••••••••"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmpassword">Confirm Password</label>
            <input 
            onChange={(e)=>setConfirmPassword(e.target.value)}
              type="password" 
              id="confirmpassword" 
              name="confirmpassword" 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <div className="form-footer">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} required />
              <span style={{ fontSize: '0.9rem' }}>I agree to Terms</span>
            </label>
          </div>

          <button className="btn btn-primary" type="submit">
            Create Account
          </button>
        </form>

        <div className="signup-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </main>
  )
}


export default Register;