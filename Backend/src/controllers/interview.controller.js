const interviewReportModel=require("../models/interviewReport");
const generateInterviewReport=require("../services/ai.service");
const { generateReportPDF } = require("../services/pdf.service");

async function parsePdfBuffer(buffer) {
  try {
    if (!buffer) {
      throw new Error('PDF buffer is empty');
    }

    const pdfParseModule = await import('pdf-parse');
    const PDFParse = pdfParseModule.PDFParse || pdfParseModule.default?.PDFParse;
    if (!PDFParse) {
      throw new Error('pdf-parse export is missing PDFParse');
    }

    const pdfParser = new PDFParse({ data: buffer });
    const result = await pdfParser.getText();
    return (result?.text || '').trim();
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

async function generateInterviewReportController(req,res){
    try{
        const resumeFile=req.file;
        if (!resumeFile || !resumeFile.buffer) {
            return res.status(400).json({message:"No resume file provided"});
        }
        const resumeText = await parsePdfBuffer(resumeFile.buffer);
        const jobDescription=req.body.jobDescription;
        const selfDescription=req.body.selfDescription;
        
        console.log("Resume extracted, generating report...");
        const interviewReportByAi=await generateInterviewReport({resume:resumeText,selfDescription,jobDescription});
        console.log("AI RESPONSE:", JSON.stringify(interviewReportByAi, null, 2));
        
        const interviewReport = await interviewReportModel.create({
            user: req.user.userId,
            resume: resumeText,
            jobDescription,
            selfDescription,
            ...interviewReportByAi
        });
        
        console.log("Report created:", JSON.stringify(interviewReport, null, 2));
        res.status(200).json({interviewReport});
    }catch(error){
        console.error("Error generating interview report:",error);
        res.status(500).json({message:"Internal server error", details: error.message});
    }
}

async function getReportController(req, res) {
    try {
        const reportId = req.params.reportId;
        
        const report = await interviewReportModel.findById(reportId);
        
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        
        if (report.user.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to access this report" });
        }

        res.status(200).json({ interviewReport: report });
    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({ message: "Internal server error", details: error.message });
    }
}

async function downloadReportController(req, res) {
    try {
        const reportId = req.params.reportId;
        
        const report = await interviewReportModel.findById(reportId);
        
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        
        if (report.user.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to download this report" });
        }

        const pdfBuffer = await generateReportPDF(report);
        
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `Interview_Report_${timestamp}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error("Error downloading report:", error);
        res.status(500).json({ message: "Internal server error", details: error.message });
    }
}
   
module.exports={generateInterviewReportController, downloadReportController, getReportController};