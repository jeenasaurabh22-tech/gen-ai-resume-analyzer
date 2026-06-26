import axios from "axios";
import API_URL from "../../../config/apiConfig.js";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function generateInterviewReport({ jobDescription, selfDescription, resume }) {
  try {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resume);

    const response = await api.post("/interview", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.interviewReport;
  } catch (error) {
    console.error("Error generating interview report:", error);
    throw error;
  }
}

export async function getReport(reportId) {
  try {
    const response = await api.get(`/interview/${reportId}`);
    return response.data.interviewReport;
  } catch (error) {
    console.error("Error fetching interview report:", error);
    throw error;
  }
}

export async function downloadReport(reportId) {
  try {
    const response = await api.get(`/interview/${reportId}/download`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Interview_Report_${timestamp}.pdf`);
    
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading report:", error);
    throw error;
  }
}
