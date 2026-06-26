import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { downloadReport, getReport } from "../services/interview.api";
import "../style/interview.scss";

const normalizeReport = (report) => {
  if (!report || typeof report !== 'object') return {};
  return {
    title: report.title || report.jobTitle || "Interview Report",
    matchScore: report.matchScore || report.match_score || 0,
    technicalQuestions: report.technicalQuestions || report.technical_questions || [],
    behavioralQuestions: report.behavioralQuestions || report.behavioral_questions || [],
    skillGaps: report.skillGaps || report.skill_gaps || [],
    preparationPlan: report.preparationPlan || report.preparation_plan || [],
    ...report
  };
};

const parseQuestions = (questionsData) => {
  try {
    if (!questionsData) return [];
    if (typeof questionsData === 'string') {
      try {
        questionsData = JSON.parse(questionsData);
      } catch {
        return [];
      }
    }
    if (!Array.isArray(questionsData)) {
      questionsData = [questionsData];
    }

    return questionsData
      .filter(item => item)
      .map((item) => {
        try {
          let obj = item;
          if (typeof item === 'string') {
            try {
              obj = JSON.parse(item);
            } catch {
              return { question: item, purpose: '', answer: '' };
            }
          }

          if (typeof obj !== 'object' || !obj) {
            return { question: String(obj), purpose: '', answer: '' };
          }

          const question = obj.question || obj.q || String(obj) || '';
          const purpose = obj.intention || obj.purpose || obj.assessment_purpose || obj.intent || obj.Assessment_purpose || obj.Assessment_Intent || obj.why_this_question || '';
          const answer = obj.answer || obj.how_to_answer || obj.how_to_respond || obj.response || obj.Answer || obj.solution || '';

          return {
            question: question.trim(),
            purpose: purpose.trim() || 'Purpose not available',
            answer: answer.trim() || 'Answer guidance not available',
          };
        } catch {
          return { question: String(item), purpose: '', answer: '' };
        }
      })
      .filter(q => q.question && String(q.question).trim().length > 0);
  } catch {
    return [];
  }
};

const parseSkillGaps = (skillsData) => {
  try {
    if (!skillsData) return [];

    let skillsArray = [];
    if (typeof skillsData === 'string') {
      try {
        skillsArray = JSON.parse(skillsData);
      } catch {
        skillsArray = [skillsData];
      }
    } else if (Array.isArray(skillsData)) {
      skillsArray = skillsData;
    } else if (typeof skillsData === 'object') {
      skillsArray = [skillsData];
    } else {
      skillsArray = [skillsData];
    }

    if (!Array.isArray(skillsArray)) {
      skillsArray = [skillsArray];
    }

    return skillsArray
      .filter(item => item)
      .map((item) => {
        try {
          let skillObj = item;
          if (typeof item === 'string') {
            const trimmed = item.trim();
            if (trimmed.startsWith('{')) {
              try {
                skillObj = JSON.parse(trimmed);
              } catch {
                return { name: trimmed, level: 'Medium', description: '' };
              }
            } else {
              return { name: trimmed, level: 'Medium', description: '' };
            }
          }

          if (typeof skillObj !== 'object' || !skillObj) {
            return { name: String(skillObj), level: 'Medium', description: '' };
          }

          const name = skillObj.skill || skillObj.name || skillObj.title || String(skillObj);
          if (!name || String(name).trim() === '') {
            return null;
          }

          return {
            name: String(name).trim(),
            level: skillObj.severity || skillObj.level || 'Medium',
            description: skillObj.details || skillObj.description || skillObj.content || '',
          };
        } catch {
          return { name: String(item), level: 'Medium', description: '' };
        }
      })
      .filter(s => s && s.name && String(s.name).trim().length > 0);
  } catch {
    return [];
  }
};

const parsePreparationPlan = (planData) => {
  try {
    if (!planData) return [];

    let planArray = [];
    if (typeof planData === 'string') {
      try {
        planArray = JSON.parse(planData);
      } catch {
        planArray = [planData];
      }
    } else if (Array.isArray(planData)) {
      planArray = planData;
    } else if (typeof planData === 'object') {
      planArray = [planData];
    } else {
      planArray = [planData];
    }

    if (!Array.isArray(planArray)) {
      planArray = [planArray];
    }

    return planArray
      .filter(item => item)
      .map((item) => {
        try {
          let planObj = item;
          if (typeof item === 'string') {
            const trimmed = item.trim();
            if (trimmed.startsWith('{')) {
              try {
                planObj = JSON.parse(trimmed);
              } catch {
                if (trimmed.includes(':')) {
                  const [title, desc] = trimmed.split(':');
                  return { day: 0, focus: title.trim(), activities: desc.trim() };
                }
                return { day: 0, focus: trimmed, activities: '' };
              }
            } else if (trimmed.includes(':')) {
              const [title, desc] = trimmed.split(':');
              return { day: 0, focus: title.trim(), activities: desc.trim() };
            } else {
              return { day: 0, focus: trimmed, activities: '' };
            }
          }

          if (typeof planObj !== 'object' || !planObj) {
            return { day: 0, focus: String(planObj), activities: '' };
          }

          const focus = planObj.focus || planObj.title || planObj.topic || '';
          if (!focus || String(focus).trim() === '') {
            return null;
          }

          return {
            day: planObj.day || planObj.dayNumber || 0,
            focus: String(focus).trim(),
            activities: planObj.activities || planObj.description || planObj.content || (planObj.tasks ? (Array.isArray(planObj.tasks) ? planObj.tasks.join('\n') : String(planObj.tasks)) : ''),
          };
        } catch {
          return { day: 0, focus: String(item), activities: '' };
        }
      })
      .filter(item => item && (item.focus || item.activities));
  } catch {
    return [];
  }
};

const Interview = ({ report: initialReport = {} }) => {
  const { reportId } = useParams();
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("technical");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [expandedSkillId, setExpandedSkillId] = useState(null);
  const [expandedPrepId, setExpandedPrepId] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    
    const initializeReport = async () => {
      try {
        const reportData = location.state?.report;
        
        if (reportData && Object.keys(reportData).length > 0) {
          const normalized = normalizeReport(reportData);
          setReport(normalized);
          setLoading(false);
        } else if (reportId) {
          const fetchedReport = await getReport(reportId);
          const normalized = normalizeReport(fetchedReport);
          setReport(normalized);
          setLoading(false);
        } else {
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error loading report:', error);
        navigate('/');
      }
    };

    initializeReport();
    hasInitialized.current = true;
  }, [reportId, navigate]);

  if (loading) {
    return (
      <main className="interview-page">
        <div className="loading-wrapper">
          <div className="loading-container">
            <div className="loading-header">
              <div className="loading-icon">
                <div className="icon-spinner"></div>
              </div>
              <h2 className="loading-title">Generating Your Interview Report</h2>
              <p className="loading-subtitle">Analyzing your profile and generating personalized insights...</p>
            </div>

            <div className="loading-progress">
              <div className="progress-item">
                <div className="progress-step active">
                  <div className="step-number">1</div>
                </div>
                <div className="progress-line"></div>
                <span className="step-label">Parsing Resume</span>
              </div>
              <div className="progress-item">
                <div className="progress-step">
                  <div className="step-number">2</div>
                </div>
                <div className="progress-line"></div>
                <span className="step-label">Analyzing Skills</span>
              </div>
              <div className="progress-item">
                <div className="progress-step">
                  <div className="step-number">3</div>
                </div>
                <div className="progress-line"></div>
                <span className="step-label">Generating Questions</span>
              </div>
              <div className="progress-item">
                <div className="progress-step">
                  <div className="step-number">4</div>
                </div>
                <span className="step-label">Creating Plan</span>
              </div>
            </div>

            <div className="loading-skeleton">
              <div className="skeleton-section">
                <div className="skeleton-title"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line" style={{width: '80%'}}></div>
                </div>
              </div>
              <div className="skeleton-section">
                <div className="skeleton-title"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>

            <div className="loading-tips">
              <p>💡 Tip: Use this time to think about your project highlights and achievements</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!report || Object.keys(report).length === 0) {
    return (
      <main className="interview-page">
        <div className="interview-container">
          <div className="loading-message">
            <h2>No interview report available</h2>
            <p>Generate a report from the home page first.</p>
            <div style={{marginTop:12}}>
              <button onClick={() => navigate('/')} className="generate-btn">Go to Home</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const technicalQuestions = parseQuestions(report.technicalQuestions);
  const behavioralQuestions = parseQuestions(report.behavioralQuestions);
  const skillGaps = parseSkillGaps(report.skillGaps);
  const preparationPlan = parsePreparationPlan(report.preparationPlan);

  const currentQuestions =
    activeTab === "technical" ? technicalQuestions : behavioralQuestions;
  const currentQuestion = currentQuestions[currentQuestionIndex] || {};

  const handleDownloadReport = async () => {
    try {
      setDownloadLoading(true);
      if (!report._id) {
        alert('Report ID not found');
        return;
      }
      await downloadReport(report._id);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const getLevelColor = (level) => {
    const normalizedLevel = level?.toLowerCase() || '';
    if (normalizedLevel.includes('high') || normalizedLevel.includes('critical')) return "#ef4444";
    if (normalizedLevel.includes('medium') || normalizedLevel.includes('moderate')) return "#f59e0b";
    if (normalizedLevel.includes('low') || normalizedLevel.includes('minor')) return "#10b981";
    return "#6b7280";
  };

  const getLevelLabel = (level) => {
    const normalizedLevel = level?.toLowerCase() || '';
    if (normalizedLevel.includes('high') || normalizedLevel.includes('critical')) return "High";
    if (normalizedLevel.includes('medium') || normalizedLevel.includes('moderate')) return "Medium";
    if (normalizedLevel.includes('low') || normalizedLevel.includes('minor')) return "Low";
    return level || "Medium";
  };


  return (
    <main className="interview-page">
      <header className="interview-header">
        <div className="header-left">
          <button className="back-btn-header" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
        <div className="header-right">
          <button 
            className="download-btn"
            onClick={handleDownloadReport}
            disabled={downloadLoading}
            title="Download report as PDF"
          >
            {downloadLoading ? '⏳ Downloading...' : '📥 Download Report'}
          </button>
          <button className="auth-btn login-btn" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="auth-btn signup-btn" onClick={() => navigate('/register')}>
            Sign Up
          </button>
        </div>
      </header>
      <div className="interview-wrapper">
        <div className="interview-sidebar">
          <div className="sidebar-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <h2 className="report-title">{report?.title || "Interview Report"}</h2>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === "technical" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("technical");
                setCurrentQuestionIndex(0);
              }}
            >
              <span className="nav-icon">❓</span>
              <span className="nav-label">Technical</span>
              <span className="nav-count">{technicalQuestions.length}</span>
            </button>

            <button
              className={`nav-item ${activeTab === "behavioral" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("behavioral");
                setCurrentQuestionIndex(0);
              }}
            >
              <span className="nav-icon">💬</span>
              <span className="nav-label">Behavioral</span>
              <span className="nav-count">{behavioralQuestions.length}</span>
            </button>

            <button
              className={`nav-item ${activeTab === "roadmap" ? "active" : ""}`}
              onClick={() => setActiveTab("roadmap")}
            >
              <span className="nav-icon">🗺️</span>
              <span className="nav-label">Prep Plan</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button 
              className="upload-new-btn"
              onClick={() => navigate('/')}
              title="Upload another resume to generate a new report"
            >
              <span className="btn-icon">📄</span>
              <span className="btn-text">Upload Another Resume</span>
            </button>
          </div>
        </div>

        <div className="interview-main">
          {activeTab === "technical" || activeTab === "behavioral" ? (
            <div className="questions-container">
              <div className="question-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="progress-text">
                  Question {currentQuestionIndex + 1} of {currentQuestions.length}
                </p>
              </div>

              <div className="question-card">
                <div className="card-section question-section">
                  <h3 className="section-title">
                    <span className="title-icon">❓</span> Question
                  </h3>
                  <p className="section-content">{currentQuestion.question}</p>
                </div>

                <div className="card-divider" />

                <div className="card-section purpose-section">
                  <h3 className="section-title">
                    <span className="title-icon">🎯</span> Assessment Purpose
                  </h3>
                  <p className="section-content">{currentQuestion.purpose || currentQuestion.intention || 'Purpose not available'}</p>
                </div>

                <div className="card-divider" />

                <div className="card-section answer-section">
                  <h3 className="section-title">
                    <span className="title-icon">💡</span> How to Answer
                  </h3>
                  <p className="section-content">{currentQuestion.answer || 'Answer guidance not available'}</p>
                </div>
              </div>

              <div className="navigation-controls">
                <button
                  className="nav-control prev"
                  onClick={() =>
                    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  title="Previous question"
                >
                  ← Previous
                </button>

                <div className="question-dots">
                  {currentQuestions.map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentQuestionIndex ? "active" : ""}`}
                      onClick={() => setCurrentQuestionIndex(index)}
                      title={`Go to question ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  className="nav-control next"
                  onClick={() =>
                    setCurrentQuestionIndex(
                      Math.min(currentQuestions.length - 1, currentQuestionIndex + 1)
                    )
                  }
                  disabled={currentQuestionIndex === currentQuestions.length - 1}
                  title="Next question"
                >
                  Next →
                </button>
              </div>
            </div>
          ) : (
            <div className="roadmap-container">
              <h2 className="roadmap-title">📅 Preparation Plan</h2>
              <div className="roadmap-grid">
                {preparationPlan?.length > 0 ? (
                  preparationPlan.map((item, index) => {
                    const isExpanded = expandedPrepId === index;
                    const hasDescription = item.activities && item.activities.length > 0;
                    return (
                      <div 
                        key={index} 
                        className={`roadmap-card ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => hasDescription && setExpandedPrepId(isExpanded ? null : index)}
                        style={{ cursor: hasDescription ? 'pointer' : 'default' }}
                      >
                        {item.day > 0 && <div className="roadmap-day">Day {item.day}</div>}
                        <div className="roadmap-body">
                          {item.focus && <h4 className="roadmap-subtitle">{item.focus}</h4>}
                          {!isExpanded && hasDescription && (
                            <p className="roadmap-text roadmap-preview">
                              {item.activities.substring(0, 120)}
                              {item.activities.length > 120 ? '...' : ''}
                            </p>
                          )}
                          {isExpanded && hasDescription && (
                            <p className="roadmap-text roadmap-full">
                              {item.activities}
                            </p>
                          )}
                        </div>
                        <div className="roadmap-expand">
                          {hasDescription && (
                            <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="no-prep-plan">No preparation plan available</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="interview-sidebar right">
          <div className="score-panel">
            <h3 className="panel-title">Match Score</h3>
            <div className="score-display">
              <div className="score-ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" className="score-bg" />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    className="score-progress"
                    style={{
                      strokeDashoffset: 339.29 - ((report?.matchScore || report?.match_score || 0) / 100) * 339.29,
                    }}
                  />
                </svg>
                <div className="score-content">
                  <div className="score-number">{report?.matchScore || 0}%</div>
                  <div className="score-badge">
                    {(report?.matchScore || 0) >= 80
                      ? "Excellent"
                      : (report?.matchScore || 0) >= 60
                      ? "Good"
                      : "Fair"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="skills-panel">
            <h3 className="panel-title">
              <span>Skill Gaps</span>
              {skillGaps.length > 0 && <span className="skill-count">{skillGaps.length} gaps</span>}
            </h3>
            <div className="skills-list">
              {skillGaps.length > 0 ? (
                skillGaps.map((skill, index) => {
                  const isExpanded = expandedSkillId === index;
                  const hasDescription = skill.description && skill.description.length > 0;
                  return (
                    <div 
                      key={index} 
                      className={`skill-item ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => hasDescription && setExpandedSkillId(isExpanded ? null : index)}
                      style={{ cursor: hasDescription ? 'pointer' : 'default' }}
                    >
                      <div className="skill-body">
                        <span className="skill-name">{skill.name}</span>
                        <span
                          className="skill-badge"
                          style={{
                            backgroundColor: getLevelColor(skill.level),
                          }}
                        >
                          {getLevelLabel(skill.level)}
                        </span>
                        {hasDescription && (
                          <span className="skill-expand-icon">
                            {isExpanded ? '−' : '+'}
                          </span>
                        )}
                      </div>
                      {isExpanded && hasDescription && (
                        <div className="skill-details">
                          {skill.description}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="no-skills">No skill gaps identified</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Interview;