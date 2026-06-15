const interviewReportModel=require("../models/interviewReport");
const generateInterviewReport=require("../services/ai.service");
const pdfParse=require("pdf-parse");
async function generateInterviewReportController(req,res){
    try{
        const resumeFile=req.file;
        const resumeContent=await (new pdfParse.PDFParse(new Uint8Array(resumeFile.buffer))).getText();
        const jobDescription=req.body.jobDescription;
        const selfDescription=req.body.selfDescription;
        const interviewReportByAi=await generateInterviewReport({jobDescription,resume:resumeContent.text,selfDescription});
        console.log("AI RESPONSE:", interviewReportByAi);
         const interviewReport = await interviewReportModel.create({
    user: req.user.userId,
    resume: resumeContent.text,
    jobDescription,
    selfDescription,
    report: interviewReportByAi
});
        res.status(200).json({interviewReport});
    }catch(error){
        console.error("Error generating interview report:",error);
        res.status(500).json({message:"Internal server error"});
    }
}
   
module.exports={generateInterviewReportController};