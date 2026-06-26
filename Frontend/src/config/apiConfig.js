// API Configuration - Toggle between localhost and AWS

// Use LOCALHOST for local development testing
const LOCALHOST_API = 'http://localhost:3000/api';

// Use AWS for production deployment
const AWS_API = 'http://docker-awsalb-1094310998.ap-northeast-1.elb.amazonaws.com/api';

// Choose which one to use (change this line to switch)
const API_URL = AWS_API; // Change to LOCALHOST_API for local development

export default API_URL;
