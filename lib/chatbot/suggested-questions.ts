/**
 * Suggested questions for the chatbot
 * These help users understand what they can ask
 */

export const suggestedQuestions = [
  // About Liron
  "Who are you?",
  "Tell me about yourself",
  "What do you do?",
  "Where are you located?",

  // Skills & Experience
  "What are your main skills?",
  "What programming languages do you know?",
  "Do you have experience with AI/ML?",
  "What technologies do you work with?",
  "What's your experience with cloud platforms?",

  // Projects
  "What projects have you built?",
  "Tell me about your featured projects",
  "What's your most interesting project?",
  "Do you have any AI projects?",
  "Show me your web development projects",

  // Work Experience
  "Where have you worked?",
  "What's your professional background?",
  "Tell me about your work experience",

  // Education & Certifications
  "What certifications do you have?",
  "Tell me about your education",
  "Are you certified in any technologies?",

  // Contact & Availability
  "How can I contact you?",
  "Are you available for work?",
  "What's your email?",
  "Can I see your LinkedIn?",

  // Technical Questions
  "What's your preferred tech stack?",
  "Do you do frontend or backend?",
  "Can you build full-stack applications?",
  "What frameworks do you use?",

  // Languages
  "What languages do you speak?",
  "Can you work in French?",
  "Do you speak Hebrew?",
];

export const quickReplies = [
  "Tell me about yourself",
  "What are your skills?",
  "Show me your projects",
  "How can I contact you?",
];

export function getRandomQuestions(count: number = 3): string[] {
  const shuffled = [...suggestedQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
