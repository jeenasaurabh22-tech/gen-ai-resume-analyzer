import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
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
