const {GoogleGenAI}=require("@google/genai");
const {z}=require("zod");
const {zodToJsonSchema}=require("zod-to-json-schema");
const ai=new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});
async function invokeGeminiAi(){
    const response=await ai.models.generateContent({
        model:"gemini-2.5-flash",
        contents:"Hello gemini,explain what is interview?"
    });
    console.log(response.text);
}
const interviewReportSchema=z.object({
    matchScore:z.number().min(0).max(100).describe("The match score between the candidate and the job description which is calculated based on the analysis of the resume and job description between 0 to 100"),
    technicalQuestions:z.array(z.object({
       question:z.string().describe("The technical question can be asked in the interview"),
         intention:z.string().describe("The intention of interview behind asking this  technical question"),
        answer:z.string().describe("How to answer this question what points to be covered in the answer what approach to be taken to answer this question")
    })).describe("List of technical questions that can be asked in the interview"),
    behavioralQuestions:z.array(z.object({
        question:z.string().describe("The behavioral question that can be asked in the interview"),
        intention:z.string().describe("The intention of interview behind asking this  behavioral question"),
        answer:z.string().describe("How to answer this question what points to be covered in the answer what approach to be taken to answer this question")
    })).describe("List of behavioral questions that can be asked in the interview")
,
skillGaps:z.array(z.object({
    skill:z.string().describe("The skill that the candidate is lacking"),
    severity:z.enum(["Low","Medium","High"]).describe("The severity of the skill gap")
})).describe("List of skill gaps identified in the candidate"),
preparationPlan:z.array(z.object({
    day:z.number().describe("The day of the preparation plan"),
    focus:z.string().describe("The focus of the preparation plan for that day"),
    tasks:z.array(z.string()).describe("List of tasks to be completed on that day")
})).describe("List of preparation plans for the candidate") });
async function generateInterviewReport({jobDescription,resume,selfDescription}){
    const prompt = `
You are a senior interview coach.

Analyze the candidate and generate an interview report.

Candidate Information:

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

Instructions:
- Calculate a match score between 0 and 100.
- Generate technical interview questions.
- Generate behavioral interview questions.
- Identify skill gaps.
- Create a 7-day preparation plan.
- Return only data matching the provided schema.


`;
    const response=await ai.models.generateContent({
        model:"gemini-2.5-flash-lite",
        contents:prompt,
config:{
    responseMimeType:"application/json",
    responseJsonSchema:zodToJsonSchema(interviewReportSchema)
}
    });
    const report=JSON.parse(response.text)
    console.log(report);
    return report;
}
module.exports=generateInterviewReport;
