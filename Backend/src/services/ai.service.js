const {GoogleGenAI}=require("@google/genai");
const {z}=require("zod");
const {zodToJsonSchema}=require("zod-to-json-schema");
const ai=new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

async function callWithTimeout(promise, timeoutMs = 20000) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Gemini API request timed out after ${timeoutMs/1000}s`)), timeoutMs);
    });
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
}

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances"),
        details: z.string().describe("Detailed explanation of why this skill is important, how to improve it, resources to learn, and specific actions to take")
    })).describe("List of skill gaps in the candidate's profile along with their severity and detailed information"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        activities: z.string().describe("Complete detailed description of all activities and tasks to be done on this day, including what to study, problems to solve, resources to use, and how much time to spend"),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    try {
        const shortResume = resume.substring(0, 1000);
        const shortSelfDesc = selfDescription.substring(0, 500);
        const shortJobDesc = jobDescription.substring(0, 800);

        const prompt = `You are an expert interviewer. Analyze this candidate and job, then respond ONLY with valid JSON (no markdown, no explanation):

Resume: ${shortResume}
Self Description: ${shortSelfDesc}
Job: ${shortJobDesc}

Respond with exactly this JSON structure:
{
  "matchScore": 75,
  "title": "Interview Report",
  "technicalQuestions": [
    {"question": "What is REST?", "intention": "Test API knowledge", "answer": "REST uses HTTP methods..."},
    {"question": "Explain MongoDB", "intention": "Test database knowledge", "answer": "MongoDB is NoSQL..."},
    {"question": "What is React?", "intention": "Test frontend knowledge", "answer": "React is a library..."},
    {"question": "What is Node.js?", "intention": "Test backend knowledge", "answer": "Node.js is runtime..."},
    {"question": "Explain JWT", "intention": "Test security knowledge", "answer": "JWT is token based..."}
  ],
  "behavioralQuestions": [
    {"question": "Tell me about yourself", "intention": "Assess communication", "answer": "Highlight skills and projects..."},
    {"question": "Why this role?", "intention": "Assess motivation", "answer": "Explain career goals..."},
    {"question": "Biggest challenge?", "intention": "Assess problem-solving", "answer": "Describe challenge and solution..."},
    {"question": "Team experience?", "intention": "Assess collaboration", "answer": "Share team project..."},
    {"question": "Learning style?", "intention": "Assess growth mindset", "answer": "Explain how you learn..."}
  ],
  "skillGaps": [
    {"skill": "TypeScript", "severity": "low", "details": "Learn TypeScript basics..."},
    {"skill": "System Design", "severity": "medium", "details": "Study design patterns..."}
  ],
  "preparationPlan": [
    {"day": 1, "focus": "Data Structures", "activities": "Review arrays, linked lists, trees", "tasks": ["Study arrays", "Solve 5 problems"]},
    {"day": 2, "focus": "Algorithms", "activities": "Practice sorting and searching", "tasks": ["Study algorithms", "Code solutions"]},
    {"day": 3, "focus": "System Design", "activities": "Learn design patterns", "tasks": ["Read article", "Practice design"]},
    {"day": 4, "focus": "JavaScript Deep Dive", "activities": "Review closures, async/await", "tasks": ["Study concepts", "Write code"]},
    {"day": 5, "focus": "Mock Interview", "activities": "Practice with mock questions", "tasks": ["Do mock interview", "Review answers"]}
  ]
}`;

        console.log("Calling Gemini API...");
        const response = await callWithTimeout(
            ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt
            }),
            20000
        );

        const responseText = response?.text || response?.candidates?.[0]?.content?.text || "";
        if (!responseText) {
            console.error("No response from API");
            throw new Error("Empty response from API");
        }

        console.log("Got response, length:", responseText.length);
        
        let jsonText = responseText.trim();
        
        if (jsonText.includes("```json")) {
            jsonText = jsonText.split("```json")[1].split("```")[0].trim();
        } else if (jsonText.includes("```")) {
            jsonText = jsonText.split("```")[1].split("```")[0].trim();
        }

        console.log("Parsing JSON...");
        const data = JSON.parse(jsonText);

        return {
            matchScore: Math.min(100, Math.max(0, data.matchScore || 0)),
            title: data.title || "Interview Report",
            technicalQuestions: Array.isArray(data.technicalQuestions) ? data.technicalQuestions : [],
            behavioralQuestions: Array.isArray(data.behavioralQuestions) ? data.behavioralQuestions : [],
            skillGaps: Array.isArray(data.skillGaps) ? data.skillGaps : [],
            preparationPlan: Array.isArray(data.preparationPlan) ? data.preparationPlan : []
        };
    } catch (error) {
        console.error("ERROR generating report:", error.message);
        throw new Error(`Gemini report generation failed: ${error.message}`);
    }
}

function sanitizeQuestions(questions) {
    if (!Array.isArray(questions)) return [];
    
    return questions.map(q => ({
        question: q.question || q.q || '',
        intention: q.intention || q.purpose || q.assessment_purpose || q.intent || '',
        answer: q.answer || q.how_to_answer || q.how_to_respond || q.response || ''
    })).filter(q => q.question && q.question.trim().length > 0);
}

module.exports = generateInterviewReport;
