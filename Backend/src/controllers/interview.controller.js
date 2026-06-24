const interviewReportModel=require("../models/interviewReport");
const generateInterviewReport=require("../services/ai.service");
const { generateReportPDF } = require("../services/pdf.service");
const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

async function parsePdfBuffer(buffer) {
  return new Promise((resolve, reject) => {
    try {
      let pdfParser = new PDFParser(null, 1);
      
      pdfParser.on("pdfParser_dataError", (errData) => {
        reject(new Error(`Failed to parse PDF: ${errData.parserError}`));
      });
      
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        let text = '';
        if (pdfData.Pages) {
          pdfData.Pages.forEach(page => {
            if (page.Texts) {
              page.Texts.forEach(textObj => {
                try {
                  if (textObj.R && textObj.R[0] && textObj.R[0].T) {
                    let decodedText = textObj.R[0].T;
                    try {
                      decodedText = decodeURIComponent(decodedText);
                    } catch (e) {
                      // Text not URI-encoded, use as-is
                    }
                    text += decodedText + ' ';
                  }
                } catch (e) {
                  // Skip malformed text objects
                }
              });
            }
            text += '\n';
          });
        }
        resolve(text.trim() || "");
      });
      
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      reject(new Error(`Failed to parse PDF: ${error.message}`));
    }
  });
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
   
module.exports={generateInterviewReportController, downloadReportController};