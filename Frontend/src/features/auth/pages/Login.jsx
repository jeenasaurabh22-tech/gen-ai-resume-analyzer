import React from 'react'
import "../auth.form.scss"
import {useState} from "react"
import {useNavigate,Link} from "react-router-dom"
import {useAuth} from "../hooks/useAuth.jsx"
const Login = () => {
  const {loading,handleLogin}=useAuth();
  const[email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState(null);
  const navigate=useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await handleLogin({email,password});
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }
  if(loading){
    return (<main><h1>Loading...</h1>
    </main>
    )
  }
  return (
    <main>
      <div className="form-container">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
            onChange={(e)=>setEmail(e.target.value)}
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
          
          <div className="form-footer">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <span style={{ fontSize: '0.9rem' }}>Remember me</span>
            </label>
            <a href="#forgot">Forgot password?</a>
          </div>

          {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary" type="submit">
            Sign In
          </button>
        </form>

        <div className="signup-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </main>
  )
}

export default Login