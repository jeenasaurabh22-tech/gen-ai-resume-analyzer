const express=require('express');
const interviewRouter=express.Router();
const authMiddleware=require("../middlewares/auth.middleware");
const upload=require("../middlewares/file.middleware");
const interviewController=require("../controllers/interview.controller");

interviewRouter.post('/', authMiddleware.authUser, upload.single('resume'), interviewController.generateInterviewReportController);
interviewRouter.get('/:reportId/download', authMiddleware.authUser, interviewController.downloadReportController);

module.exports=interviewRouter;