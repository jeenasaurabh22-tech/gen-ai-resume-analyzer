const mongoose = require("mongoose");

const interviewReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  matchScore: {
    type: Number,
    required: true
  },

  technicalQuestions: [{
    question: String,
    intention: String,
    answer: String
  }],

  behavioralQuestions: [{
    question: String,
    intention: String,
    answer: String
  }],

  skillGaps: [{
    skill: String,
    severity: String,
    details: String
  }],

  preparationPlan: [{
    day: Number,
    focus: String,
    activities: String,
    tasks: [String]
  }],

  resume: {
    type: String
  },

  selfDescription: {
    type: String
  },

  jobDescription: {
    type: String,
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  "InterviewReport",
  interviewReportSchema
);
