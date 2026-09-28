export async function screenResumes(jobDescription, resumeFiles) {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const formData = new FormData();
  
  formData.append("job_description", jobDescription);
  resumeFiles.forEach(file => {
    formData.append("resumes", file);
  });
  
  // Backend default is true, but we explicitly send it just in case
  formData.append("include_experience", "true");

  try {
    const response = await fetch(`${url}/api/rank`, {
      method: "POST",
      body: formData,
      // Do NOT set Content-Type header here; the browser sets it automatically with the correct boundary for multipart/form-data
    });

    if (!response.ok) {
      let errorMsg = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        // Failed to parse JSON error, fall back to default error message
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error("Screening request failed");
    throw error;
  }
}

export async function analyzeResume(jobDescription, resumeFile) {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const formData = new FormData();
  
  formData.append("job_description", jobDescription);
  formData.append("resume", resumeFile);

  try {
    const response = await fetch(`${url}/api/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        // Fall back
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error("Analyze request failed");
    throw error;
  }
}

export async function getTemplates() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const response = await fetch(`${url}/api/resume/templates`);
    if (!response.ok) throw new Error("Failed to fetch templates");
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    throw error;
  }
}

export async function generateResume(templateId, answers) {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const response = await fetch(`${url}/api/resume/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: templateId,
        answers: answers
      }),
    });

    if (!response.ok) {
      let errorMsg = `Server error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        // Not JSON
      }
      throw new Error(errorMsg);
    }

    return await response.blob();
  } catch (error) {
    console.error("Generate request failed", error);
    throw error;
  }
}
