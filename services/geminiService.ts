import { GoogleGenAI, Type } from "@google/genai";
import type { AtsAnalysis } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. The app will not function correctly without a valid key.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "API_KEY_NOT_SET" });
const model = "gemini-2.5-flash";

export const tailorResume = async (resume: string, jobDescription: string): Promise<string> => {
    const prompt = `
        **System Persona:** You are a world-class Data Engineering career coach and resume writer. You have deep expertise in data technologies (e.g., Spark, Kafka, Airflow, dbt, Snowflake, BigQuery, Redshift), architectures (ETL/ELT, data lakes, data warehousing, streaming), and cloud platforms (AWS, GCP, Azure).

        **Objective:** Rewrite the work experience in the provided resume to be laser-focused on the target Data Engineering job description.

        **Agent Workflow Simulation:**

        1.  **DE Resume Analysis Agent:** Internally analyze the resume. Identify existing skills, projects, and quantifiable achievements. Note the data stack used.
        2.  **DE Job Description Analysis Agent:** Internally analyze the job description. Extract key technologies, responsibilities (e.g., "build and maintain data pipelines," "design data models"), and desired outcomes (e.g., "improve data reliability," "reduce data latency").
        3.  **DE Work Experience Tailoring Agent:** This is your primary task. Rewrite ONLY the work experience section.
            *   Use the STAR (Situation, Task, Action, Result) method.
            *   Translate the candidate's experience into the language of the job description. If the resume says "moved data," and the job asks for "ETL," rephrase it as "Developed and maintained robust ETL pipelines..."
            *   Quantify achievements with data engineering-specific metrics: data volume processed (TBs, PBs), pipeline latency reduction (e.g., "reduced data delivery time by 30%"), cost savings on cloud infrastructure, improvements in data quality or pipeline uptime.
            *   Ensure the most relevant skills and projects for the target job are highlighted prominently. Do not invent experience.
        4.  **Resume Assembly Agent:** Construct the final, complete resume by integrating the newly tailored work experience into the original resume structure, replacing the old work experience section.

        **Final Output Requirement:**
        *   Provide ONLY the full text of the final, assembled resume.
        *   Do not include preambles, apologies, or explanations.
        *   The output must be clean text, ready to be copied and pasted.
        *   Preserve the original resume's formatting (headings, spacing) as closely as possible.

        ---

        **[BEGIN ORIGINAL RESUME]**
        ${resume}
        **[END ORIGINAL RESUME]**

        ---

        **[BEGIN TARGET JOB DESCRIPTION]**
        ${jobDescription}
        **[END TARGET JOB DESCRIPTION]**
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for resume tailoring:", error);
        throw new Error("Failed to generate tailored resume from Gemini API.");
    }
};

export const checkAtsAlignment = async (resume: string, jobDescription: string): Promise<AtsAnalysis> => {
    const prompt = `
        From the perspective of an advanced Applicant Tracking System (ATS) used by tech recruiters, analyze the provided resume against the target job description. Identify keyword alignment and provide a detailed report in JSON format. Focus on technical skills, tools, and data engineering concepts.

        **Resume to Analyze:**
        ${resume}

        **Target Job Description:**
        ${jobDescription}
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            score: {
                type: Type.INTEGER,
                description: "A score from 0 to 100 representing the resume's keyword and concept alignment with the job description."
            },
            matchedKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of critical Data Engineering keywords from the job description that were found in the resume."
            },
            missingKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of critical Data Engineering keywords from the job description that were NOT found in the resume."
            },
            suggestions: {
                type: Type.STRING,
                description: "Actionable suggestions on how to improve the resume's ATS score by naturally incorporating the missing keywords and concepts into the experience section."
            }
        },
        required: ["score", "matchedKeywords", "missingKeywords", "suggestions"]
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AtsAnalysis;
    } catch (error) {
        console.error("Error calling Gemini API for ATS check:", error);
        throw new Error("Failed to generate ATS analysis from Gemini API.");
    }
};

export const incorporateSuggestions = async (originalResume: string, jobDescription: string, analysis: AtsAnalysis): Promise<string> => {
    const prompt = `
        **System Persona:** You are an expert resume editor, specializing in refining resumes for Applicant Tracking Systems (ATS).

        **Objective:** Revise the provided "Original Resume" by seamlessly integrating the "Missing Keywords" and implementing the "Suggestions". Your goal is to increase the resume's alignment with the target job description while maintaining a natural, professional tone and preserving the STAR method for achievements.

        **Instructions:**
        1.  Carefully review the "Original Resume", the "Missing Keywords", and the "Suggestions".
        2.  Rewrite the resume's work experience to naturally include the "Missing Keywords". Do not just list them. They must be part of coherent sentences describing accomplishments.
        3.  Apply the "Suggestions" to improve the overall quality and impact of the resume.
        4.  Preserve the resume's original structure and formatting.
        5.  Do not add experiences that are not hinted at in the original resume.
        6.  The final output should be ONLY the full text of the newly revised resume. Do not include any commentary or explanations.

        ---
        **[BEGIN ORIGINAL RESUME]**
        ${originalResume}
        **[END ORIGINAL RESUME]**

        ---
        **[BEGIN TARGET JOB DESCRIPTION]**
        ${jobDescription}
        **[END TARGET JOB DESCRIPTION]**

        ---
        **[BEGIN ANALYSIS AND SUGGESTIONS TO INCORPORATE]**
        Missing Keywords: ${analysis.missingKeywords.join(', ')}
        Suggestions: ${analysis.suggestions}
        **[END ANALYSIS AND SUGGESTIONS TO INCORPORATE]**
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for incorporating suggestions:", error);
        throw new Error("Failed to incorporate suggestions using Gemini API.");
    }
};