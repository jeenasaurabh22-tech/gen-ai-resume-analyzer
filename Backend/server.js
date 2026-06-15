require("dotenv").config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const PORT = process.env.PORT || 3000;
// Replace any import statement for ai.service with this:
// const  invokeGeminiAi  = require('./src/services/ai.service.js'); 




connectDB().catch(err => console.error('Failed to connect to DB:', err));




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});