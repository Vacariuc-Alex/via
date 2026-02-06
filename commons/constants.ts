import { z } from "zod";
import {InterviewFeedbackPromptParams, InterviewGenerationPromptParams} from "@/commons/types";

export const TECHSTACK_NORMALIZED_NAMES = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  mariadb: "mariadb",
  postgresql: "postgresql",
  postgres: "postgresql",
  sqlite: "sqlite",
  redis: "redis",
  firebase: "firebase",
  supabase: "supabase",
  prisma: "prisma",
  docker: "docker",
  kubernetes: "kubernetes",
  k8s: "kubernetes",
  aws: "amazonwebservices",
  amazon: "amazonwebservices",
  azure: "azure",
  gcp: "googlecloud",
  googlecloud: "googlecloud",
  digitalocean: "digitalocean",
  heroku: "heroku",
  netlify: "netlify",
  vercel: "vercel",
  terraform: "terraform",
  ansible: "ansible",
  nginx: "nginx",
  apache: "apache",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  illustrator: "illustrator",
  figma: "figma",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  materialui: "materialui",
  mui: "materialui",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  babel: "babel",
  webpack: "webpack",
  rollup: "rollup",
  parcel: "parcel",
  vite: "vite",
  vitest: "vitest",
  npm: "npm",
  yarn: "yarn",
  pnpm: "pnpm",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  linux: "linux",
  ubuntu: "ubuntu",
  windows: "windows11",
  macos: "apple",
  python: "python",
  django: "django",
  flask: "flask",
  fastapi: "fastapi",
  java: "java",
  spring: "spring",
  "spring boot": "spring",
  kotlin: "kotlin",
  scala: "scala",
  groovy: "groovy",
  php: "php",
  laravel: "laravel",
  symfony: "symfony",
  codeigniter: "codeigniter",
  wordpress: "wordpress",
  strapi: "strapi",
  contentful: "contentful",
  nodebb: "nodejs",
  c: "c",
  cpp: "cplusplus",
  cplusplus: "cplusplus",
  csharp: "csharp",
  dotnet: "dot-net",
  dotnetcore: "dotnetcore",
  go: "go",
  golang: "go",
  rust: "rust",
  zig: "zig",
  ruby: "ruby",
  rails: "rails",
  swift: "swift",
  objectivec: "objectivec",
  dart: "dart",
  flutter: "flutter",
  reactnative: "reactnative",
  ionic: "ionic",
  electron: "electron",
  tauri: "tauri",
  graphql: "graphql",
  apollo: "apollographql",
  redux: "redux",
  mobx: "mobx",
  vuex: "vuex",
  nuxt: "nuxtjs",
  nuxtjs: "nuxtjs",
  angular: "angular",
  angularjs: "angularjs",
  nestjs: "nestjs",
  ember: "ember",
  backbone: "backbonejs",
  selenium: "selenium",
  cypress: "cypressio",
  playwright: "playwright",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  postman: "postman",
  insomnia: "insomnia",
  elasticsearch: "elasticsearch",
  logstash: "logstash",
  kibana: "kibana",
  prometheus: "prometheus",
  grafana: "grafana",
  datadog: "datadog",
  jira: "jira",
  confluence: "confluence",
  trello: "trello",
  slack: "slack",
  discord: "discordjs",
  kafka: "apachekafka",
  rabbitmq: "rabbitmq",
  redisstack: "redis",
  sqlite3: "sqlite",
  awsamplify: "amplify",
  amplify: "amplify"
};

export const FEEDBACK_SCHEMA = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Communication Skills"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Technical Knowledge"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Problem Solving"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Cultural Fit"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Confidence and Clarity"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

export const INTERVIEW_COVERS = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const VOICE_AGENT_PROPS = {
  provider: 'elevenlabs',
  voice: 'Xb7hH8MSUJpSbSDYk0k2',
  model: 'eleven_multilingual_v2'
};

export const UNRECOGNIZED_SPEECH_ERROR_MESSAGES = [
  "I’m sorry, I didn’t catch your answer. Could you please repeat?",
  "I still couldn’t hear your response. Please try speaking clearly.",
  "I’m still not hearing a response from you.",
];

export const UNDETECTED_AUDIO_ERROR_MESSAGES = [
  "It seems I’m having trouble accessing your microphone. Could you please check it?",
  "I still cannot hear you. Please make sure your microphone is enabled.",
  "Your microphone may be muted or unavailable.",
];

export const FINAL_ERROR_MESSAGE = "It looks like there are connection issues. Unfortunately, we need to end this call.";

export const FINAL_GENERATE_WORKFLOW_MESSAGE = "Thank you for your answers, the interview will be generated in a couple of seconds!";

export const FINAL_INTERVIEW_WORKFLOW_MESSAGE = "Thank you for your time and discussion, we'll carefully analyze your responses and come with a feedback as soon as possible. Thank You!";

export const TRANSCRIPT_MESSAGE_DELAY = 3000;

export const AUDIO_ERROR_RETRY_DELAY = 500;

export const MAX_ERROR_RETRIES = 3;

export const AI_MODEL = "openai/gpt-oss-20b";

export const INTERVIEW_GENERATION_PROMPT = (params: InterviewGenerationPromptParams) => `
  Prepare questions for a job interview.
  The job role is ${params.role}.
  The job experience level is ${params.level}.
  The user described the tech stack in natural language as: ${params.techstack}.
  The focus between behavioural and technical questions should lean towards: ${params.type}.
  The amount of questions required is: ${params.amount}.

  Your task:
  1) Extract only the technology names that the user mentioned (ignore all filler/noise words).
  2) Generate interview questions aligned to the extracted technologies.

  Output requirements:
  - Return ONLY valid JSON.
  - No markdown, no code fences, no extra text.
  - JSON shape must be exactly:
    {"questions": ["Question 1", "Question 2"], "technologies": ["java", "spring boot", "sql"]}

  Additional constraints:
  - The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant reading.
`;

export const INTERVIEW_FEEDBACK_PROMPT = (params: InterviewFeedbackPromptParams) => `
  You are an expert technical interviewer and career coach. You are also an AI interviewer analyzing a mock interview.
  Your task is to evaluate the candidate based on structured categories.
  Be thorough and detailed in your analysis. Don't be lenient with the candidate.

  Context about this interview:
    - Role: ${params.role}
    - Level: ${params.level}
    - Tech stack: ${params.technologies}

  Below is the interview transcript as question/answer pairs:
    --- TRANSCRIPT START ---
    ${params.transcript}
    --- TRANSCRIPT END ---

  Task: Provide concise, actionable feedback tailored to the role/level/type/tech stack above.

  IMPORTANT OUTPUT RULES:
    - Return ONLY valid JSON. No markdown, no code fences, no extra text.
    - The JSON MUST strictly match this shape:
      {
        "totalScore": 0,
        "categoryScores": [
          {"name": "Communication Skills", "score": 0, "comment": "..."},
          {"name": "Technical Knowledge", "score": 0, "comment": "..."},
          {"name": "Problem Solving", "score": 0, "comment": "..."},
          {"name": "Cultural Fit", "score": 0, "comment": "..."},
          {"name": "Confidence and Clarity", "score": 0, "comment": "..."}
        ],
        "strengths": ["..."],
        "areasForImprovement": ["..."],
        "finalAssessment": "..."
      }
    - Do NOT rename category names. Use EXACTLY these strings:
      "Communication Skills", "Technical Knowledge", "Problem Solving", "Cultural Fit", "Confidence and Clarity".
    - Do NOT add, remove, reorder, or nest categories.

  Scoring guidance (0-100 total, category scores can be 0-100):
    - Communication Skills: clarity, articulation, structured responses.
    - Technical Knowledge: understanding of key concepts for the role.
    - Problem Solving: ability to analyze problems and propose solutions.
    - Cultural Fit: alignment with role expectations and collaboration.
    - Confidence and Clarity: confidence in responses, engagement, and clarity.

  Additional rules:
    - Base feedback only on the transcript.
    - If information is missing, say what's missing and how it impacted the evaluation.
    - Be professional, direct, and constructive.
`;

export const SESSION_COOKIE_NAME = "session";

export const SESSION_COOKIE_AGE = 60 * 60 * 24 * 7;

export const SESSION_COOKIE_EXP = 60 * 60 * 24 * 7 * 1000;

export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
