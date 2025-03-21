import { openai } from "@ai-sdk/openai"

// Default model to use
export const DEFAULT_MODEL = "gpt-4o-2024-11-20"

// System prompts for different conversation styles
export const COLLEGE_APP_SYSTEM_PROMPT = 
  `You are a supportive college application counselor guiding high school students through the admissions process. Model your communication style after the following pattern:

1. Use short, conversational phrases to start responses ("Yeah", "Okay", "I see", "Right")
2. Offer specific help options instead of asking questions ("I can help you with...", "Would you like me to...")
3. Verify information by repeating or paraphrasing what the student said
4. Use gentle guidance instead of direct commands ("You probably want to...")
5. Balance realism about competitive admissions with encouragement ("I do think you have a good chance")
6. Use collaborative language ("we" instead of "you") to frame the process as a team effort
7. Present one simple, focused help option at a time rather than multiple options at once
8. Express your thinking process through simple phrases like "So, basically..." or "Let me see..."
9. Keep responses brief and focused on one topic at a time
10. Use conversational fillers occasionally ("Yeah, yeah", "Okay, so...")

Remember to prioritize clarity and simplicity in your advice while maintaining a supportive, coaching tone. Always offer specific ways you can help rather than asking open-ended questions.`

export const SIMPLE_STYLE_PROMPT = `You are a helpful college application assistant providing guidance to students.

1. Keep your responses short and focused on one topic at a time
2. Only ask ONE question at the end of your response
3. Use simple, clear language
4. Don't overwhelm the student with multiple questions or options
5. Break complex information into separate exchanges
6. Keep each response under 3 sentences when possible
7. Avoid overexplaining or providing too much context at once
8. Wait for the student to answer one question before moving to the next topic

Remember: Always provide just enough information to be helpful, then ask a single follow-up question to guide the conversation.`;

// Example conversations for the counselor style
export const COUNSELOR_EXAMPLES = `
Here are examples of the conversation style to follow:

Student: I'm worried about my course load for next semester with all my AP classes.
Counselor: Yeah, I can see why that's concerning. I can help you create a study schedule that balances your AP coursework. Let's start by setting up a weekly plan that includes time for each subject.

Student: For calculus we'll finish everything before spring break and then have about 4 weeks for review.
Counselor: Okay, so you're gonna do three to four weeks of review. That sounds good. I'll provide you with a detailed review schedule and some practice resources to maximize your preparation.

Student: I'm trying to decide between summer programs at University of Chicago and Yale.
Counselor: I see. I'll help you compare these programs based on how they might strengthen your college applications. Here's a breakdown of the benefits of each program for your major interests.`;

// Parameter sets for different conversation styles
export const COUNSELOR_STYLE_PARAMS = {
  temperature: 0.7,
  maxTokens: 350,
  topP: 0.9,
  frequencyPenalty: 0.3,
  presencePenalty: 0.2,
}

export const SIMPLE_STYLE_PARAMS = {
  temperature: 0.3,
  maxTokens: 300,
  topP: 1,
  frequencyPenalty: 0.5,
  presencePenalty: 0,
}

// Default parameters for OpenAI API calls
// Used if no specific style parameters are provided
export const DEFAULT_PARAMS = {
  temperature: 0.5,
  maxTokens: 400,
  topP: 1,
  frequencyPenalty: 0.3,
  presencePenalty: 0.1,
}

// Get the OpenAI API key from environment variables
export const getApiKey = (): string | undefined => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not configured in environment variables")
  }
  return apiKey
}

// Create an OpenAI model instance with the specified model name
export const getOpenAIModel = (modelName = DEFAULT_MODEL) => {
  return openai(modelName)
}

// Validate if OpenAI API is properly configured
export const validateOpenAIConfig = (): boolean => {
  const apiKey = getApiKey()
  return !!apiKey
} 

// Get the full system prompt for counselor style (with examples)
export const getCounselorPrompt = (): string => {
  return COLLEGE_APP_SYSTEM_PROMPT + COUNSELOR_EXAMPLES;
}

// Get parameters based on conversation style
export const getModelParams = (stylePreference: string) => {
  return stylePreference === 'simple' 
    ? DEFAULT_PARAMS 
    : COUNSELOR_STYLE_PARAMS;
}

// Get system prompt based on conversation style
export const getSystemPrompt = (stylePreference: string, query?: string) => {
  if (stylePreference === 'simple') {
    if (query && query.toLowerCase().includes('uci')) {
      console.log('UCI-related query detected, referring to UCIADMISSION.md');
      return `The provided content features Anna Olen, a Senior Admissions Counselor at the University of California, Irvine (UCI). Anna introduces UC Irvine, covering key highlights and admissions processes:

Overview of UC System:

Nine campuses with independent decision-making.

Shared application and requirements, but distinct campus cultures and specializations.

UC Irvine Highlights:

Top 10 Public University nationally.

Ranked #3 for diversity.

Strong reputation with Nobel laureates and first-generation students.

Unique Features of UC Irvine:

Academic Excellence: Flexible and interdisciplinary academic programs with the possibility of double majors or multiple minors.

Experiential Learning: Strong emphasis on internships, lab work, and hands-on experiences.

Anteater Community: Unique and spirited mascot representing campus pride.

Campus Facts:

Approximately 30,000 undergraduate students.

Student-teacher ratio of 18:1, average class size below 50 students.

High four-year graduation rate (~75%) and six-year graduation rate (~86%).

Academic Structure:

Over 85 majors and 70 minors.

Distinctive "academic units" rather than traditional colleges, each with specialized advising.

Student Support:

Tutoring, counseling, freshman summer success programs.

Inclusive Excellence with designations as AANAPISI and HSI.

Opportunities:

Extensive undergraduate research programs across all disciplines.

Study abroad opportunities with over 300 programs.

Strong connections to internships and satellite programs nationwide.

Student Life:

Located in Irvine, California, ranked as a safe and vibrant city.

Campus designed in a circular layout, facilitating interdisciplinary collaboration.

Extensive clubs, organizations, athletics, and Esports activities.

Housing and Dining:

Two-year housing guarantee for freshmen and transfers.

Comprehensive dining options and a free student grocery store.

UC Application Process:

Single application for all UC campuses.

Opens August 1; submission between October 1 - November 30.

Decisions released by March 30; commitment by May 1.

Admission Requirements:

3.0 GPA minimum (California residents), 3.4 GPA (non-residents).

Completion of A-G course requirements.

Test-blind admissions (SAT/ACT scores not considered).

Comprehensive Review:

Holistic review of academics, extracurriculars, personal insight questions.

Importance placed on context and personal achievements.

Frequently Asked Questions:

Extracurricular diversity valued.

Gap years, unconventional academic paths considered thoughtfully.

Majors significantly impact admissions, especially for highly selective programs (STEM, Business, Nursing).

Dual enrollment and AP courses viewed positively.

Honors collegium provides priority enrollment and dedicated research support.

Anna concludes by providing contact information and emphasizing UCI's openness to student inquiries, strongly encouraging a detailed and thoughtful application submission.

`;
    }
    return '';
  }
  return getCounselorPrompt();
} 