const mongoose=require('mongoose');
const technicalQuestionSchema=new mongoose.Schema({
    question:{
        type: String,
        required:[true,'Question is required']
    },
    intention:{
        type: String,
        required:[true,'Intention is required']
    },
    answer: {
        type: String,
        required: [true, 'Answer is required']
    }
},{_id:false});
const behavioralQuestionSchema=new mongoose.Schema({
    question:{
        type: String,
        required:[true,'Question is required']
    },
    intention:{
        type: String,
        required:[true,'Intention is required']
    },
    answer: {
        type: String,
        required: [true, 'Answer is required']
    }
},{_id:false});
const skillGapSchema=new mongoose.Schema({
    skill:{
        type: String,
        required:[true,'Skill is required'],
    },
    severity:{

        type: String,
        enum: ['Low', 'Medium', 'High'],
        required:[true,'Severity is required']
    }
},{_id:false});
const preparationPlanSchema=new mongoose.Schema({
    day:{
        type: Number,
        required:[true,'Day is required']
    },
    focus:{
        type: String,
        required:[true,'Focus is required']
    },
    tasks:[{
        type: String,
        required:[true,'Task is required']
    }]
        });
const interviewReportSchema = new mongoose.Schema({
    jobDescription: String,
    resume: String,
    selfDescription: String,

    report: {
        type: mongoose.Schema.Types.Mixed
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});
module.exports = mongoose.models.InterviewReport || mongoose.model('InterviewReport', interviewReportSchema);
