import React, { useRef, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { generateInterviewReport } from '../services/interview.api'
import "../style/home.scss"

const Home = () => {
  const jobDescRef = useRef(null)
  const resumeRef = useRef(null)
  const selfDescRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    const resetForm = () => {
      if (jobDescRef.current) jobDescRef.current.value = ''
      if (selfDescRef.current) selfDescRef.current.value = ''
      if (resumeRef.current) resumeRef.current.value = ''
      setSelectedFile(null)
      setError(null)
      setLoading(false)
    }
    
    resetForm()
  }, [location.pathname])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file')
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const jobDescription = jobDescRef.current?.value?.trim()
    const selfDescription = selfDescRef.current?.value?.trim()
    const resume = selectedFile

    if (!jobDescription) {
      setError('Please paste a job description')
      return
    }
    if (!selfDescription) {
      setError('Please describe yourself')
      return
    }
    if (!resume) {
      setError('Please upload your resume (PDF)')
      return
    }

    try {
      setLoading(true)
      const report = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resume,
      })
      navigate('/interview/loading', { state: { report } })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report. Please try again.')
      setLoading(false)
      console.error(err)
    }
  }

  return (
    <main className='home'>
      <header className="home-header">
        <div className="header-left">
          <h3 className="logo">Resume Analyzer</h3>
        </div>
        <div className="header-right">
          <button className="auth-btn login-btn" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="auth-btn signup-btn" onClick={() => navigate('/register')}>
            Sign Up
          </button>
        </div>
      </header>
      <div className="hero">
        <span className="badge">🚀 AI Powered</span>

        <h1>
          Resume Analyzer
          <span> & Interview Coach</span>
        </h1>

        <p>
          Upload your resume, analyze ATS compatibility, and generate
          personalized interview insights in seconds.
        </p>
      </div>
      <div className="interview-input-group">
        <div className="left">
          <textarea
            ref={jobDescRef}
            placeholder='Paste the job description here'
          ></textarea>
        </div>
        <div className="right">
          <div className="input-group">
            <label className="file-label" htmlFor="resume">
              Upload your resume:
              <span style={{ color: selectedFile ? '#10b981' : '#6b7280' }}>
                {selectedFile ? ` ✓ ${selectedFile.name}` : ''}
              </span>
            </label>
            <input
              type="file"
              ref={resumeRef}
              id="resume"
              hidden
              name="resume"
              accept=".pdf"
              onChange={handleFileSelect}
            />
          </div>
          <div className="input-group">
            <label htmlFor="selfDescription">Describe yourself:</label>
            <textarea
              ref={selfDescRef}
              id="selfDescription"
              placeholder='Describe yourself in a few sentences'
            ></textarea>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '12px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            className='generate-btn'
            onClick={handleSubmit}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Generating Report...' : 'Generate Interview Report'}
          </button>
        </div>
      </div>
    </main>
  )
}

export default Home;