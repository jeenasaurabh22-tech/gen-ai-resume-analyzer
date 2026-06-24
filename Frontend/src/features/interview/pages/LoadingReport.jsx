import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../style/loading.scss';

const LoadingReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const report = location.state?.report;

  const steps = [
    { title: 'Parsing Resume', description: 'Extracting information from your document' },
    { title: 'Analyzing Skills', description: 'Matching against job requirements' },
    { title: 'Generating Questions', description: 'Creating personalized interview questions' },
    { title: 'Creating Preparation Plan', description: 'Building your roadmap to success' }
  ];

  useEffect(() => {
    if (!report) {
      navigate('/');
      return;
    }

    const stepDuration = 2000;
    let currentStepIndex = 0;
    let elapsedTime = 0;

    const timer = setInterval(() => {
      elapsedTime += 200;

      if (elapsedTime >= stepDuration) {
        currentStepIndex += 1;
        elapsedTime = 0;

        if (currentStepIndex >= steps.length) {
          navigate('/interview/report', { state: { report, isLoading: false } });
          clearInterval(timer);
          return;
        }

        setCurrentStep(currentStepIndex);
      }
    }, 200);

    return () => clearInterval(timer);
  }, [report, navigate]);

  useEffect(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      let currentChar = 0;
      const text = step.description;

      const typingTimer = setInterval(() => {
        if (currentChar < text.length) {
          setDisplayText(text.substring(0, currentChar + 1));
          currentChar++;
        } else {
          clearInterval(typingTimer);
        }
      }, 30);

      return () => clearInterval(typingTimer);
    }
  }, [currentStep]);

  return (
    <div className="loading-report-container">
      <div className="loading-report-content">
        <div className="loading-header">
          <div className="logo-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1>Generating Your Report</h1>
          <p className="subtitle">We're analyzing your resume and preparing personalized insights</p>
        </div>

        <div className="progress-container">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`progress-step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}
            >
              <div className="step-indicator">
                {index < currentStep ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                {index === currentStep && (
                  <p className="step-description">{displayText}</p>
                )}
              </div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>

        <div className="loading-animation">
          <div className="dot dot-1"></div>
          <div className="dot dot-2"></div>
          <div className="dot dot-3"></div>
        </div>

        <div className="loading-stats">
          <div className="stat-item">
            <span className="stat-value">{currentStep + 1}</span>
            <span className="stat-label">of {steps.length} steps</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            <span className="stat-label">complete</span>
          </div>
        </div>
      </div>

      <div className="background-animation">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>
    </div>
  );
};

export default LoadingReport;
