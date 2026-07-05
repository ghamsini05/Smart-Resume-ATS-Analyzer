import { TailoredResume } from '../../types/tailored';
import { groqChat } from './client';

const SYSTEM_PROMPT = `You are a resume tailoring assistant. Your job is to take an existing resume and a
target job description, then produce a NEW resume that:
1. Aligns terminology with the job description (using the JD's preferred phrasing for skills the candidate already has)
2. Reorders and emphasizes content most relevant to the role
3. Rewrites every project and experience bullet in the XYZ format ("Accomplished X by doing Y, measured by Z") — start each with a strong action verb (Built, Designed, Shipped, Optimized, Engineered, etc.)
4. Includes quantified outcomes wherever the original suggests them — and uses [bracketed placeholders] when the candidate must fill in a real number
5. Weaves in keywords from the job description ONLY where the candidate plausibly has the skill — never invent expertise

You MUST respond with strict JSON only, no markdown, no prose. The JSON must match the TailoredResume interface exactly.`;

export async function tailorResumeWithLLM(resume: string, jd: string): Promise<TailoredResume | null> {
  const userMessage = `ORIGINAL RESUME:\n${resume}\n\nTARGET JOB DESCRIPTION:\n${jd.slice(0, 4000)}\n\nProduce the tailored resume now as strict JSON matching the TailoredResume interface. No preamble, no markdown fences.`;

  const content = await groqChat({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ],
    json: true,
    maxTokens: 2500,
    temperature: 0.3
  });

  if (!content) return null;

  try {
    // Strip markdown JSON fences
    let cleanJson = content.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    }

    const parsed = JSON.parse(cleanJson);

    // Coerce and validate into the strict TailoredResume interface
    const tailored: TailoredResume = {
      name: typeof parsed.name === 'string' ? parsed.name : 'Candidate Name',
      contact: {
        email: typeof parsed.contact?.email === 'string' ? parsed.contact.email : undefined,
        phone: typeof parsed.contact?.phone === 'string' ? parsed.contact.phone : undefined,
        github: typeof parsed.contact?.github === 'string' ? parsed.contact.github : undefined,
        linkedin: typeof parsed.contact?.linkedin === 'string' ? parsed.contact.linkedin : undefined,
        website: typeof parsed.contact?.website === 'string' ? parsed.contact.website : undefined,
        location: typeof parsed.contact?.location === 'string' ? parsed.contact.location : undefined,
      },
      summary: typeof parsed.summary === 'string' ? parsed.summary : undefined,
      skills: Array.isArray(parsed.skills) ? parsed.skills.filter((s: any) => typeof s === 'string') : [],
      education: Array.isArray(parsed.education)
        ? parsed.education.map((edu: any) => ({
            degree: typeof edu?.degree === 'string' ? edu.degree : '',
            school: typeof edu?.school === 'string' ? edu.school : '',
            dates: typeof edu?.dates === 'string' ? edu.dates : undefined,
            details: typeof edu?.details === 'string' ? edu.details : undefined,
          }))
        : [],
      projects: Array.isArray(parsed.projects)
        ? parsed.projects.map((proj: any) => ({
            title: typeof proj?.title === 'string' ? proj.title : 'Project Title',
            bullets: Array.isArray(proj?.bullets)
              ? proj.bullets.filter((b: any) => typeof b === 'string')
              : []
          }))
        : [],
      experience: Array.isArray(parsed.experience)
        ? parsed.experience.map((exp: any) => ({
            title: typeof exp?.title === 'string' ? exp.title : 'Role Title',
            company: typeof exp?.company === 'string' ? exp.company : 'Company Name',
            dates: typeof exp?.dates === 'string' ? exp.dates : undefined,
            bullets: Array.isArray(exp?.bullets)
              ? exp.bullets.filter((b: any) => typeof b === 'string')
              : []
          }))
        : []
    };

    return tailored;
  } catch (error) {
    console.error('Failed to parse Groq tailored resume JSON response:', error);
    return null;
  }
}
