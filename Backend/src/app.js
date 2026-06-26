const express=require('express');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const path=require('path');

const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://docker-awsalb-1094310998.ap-northeast-1.elb.amazonaws.com"
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials:true,
}));

app.use(express.static(path.join(__dirname, '../public')));

const authRouter=require("./routes/auth.routes");
const interviewRouter=require("./routes/interviewRoutes");
app.use("/api/auth",authRouter);
app.use('/api/interview',interviewRouter);

app.use(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports=app;