// import { CreateAssistantDTO } from "@ai-ai/web/dist/api";
// import { z } from "zod";

import {InterviewGenerationPromptParams} from "@/commons/types";

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
  springboot: "spring",
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

// export const interviewer: CreateAssistantDTO = {
//   name: "Interviewer",
//   firstMessage:
//     "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
//   transcriber: {
//     provider: "deepgram",
//     model: "nova-2",
//     language: "en",
//   },
//   voice: {
//     provider: "11labs",
//     voiceId: "sarah",
//     stability: 0.4,
//     similarityBoost: 0.8,
//     speed: 0.9,
//     style: 0.5,
//     useSpeakerBoost: true,
//   },
//   model: {
//     provider: "openai",
//     model: "gpt-4",
//     messages: [
//       {
//         role: "system",
//         content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

// Interview Guidelines:
// Follow the structured question flow:
// {{questions}}

// Engage naturally & react appropriately:
// Listen actively to responses and acknowledge them before moving forward.
// Ask brief follow-up questions if a response is vague or requires more detail.
// Keep the conversation flowing smoothly while maintaining control.
// Be professional, yet warm and welcoming:

// Use official yet friendly language.
// Keep responses concise and to the point (like in a real voice interview).
// Avoid robotic phrasing—sound natural and conversational.
// Answer the candidate’s questions professionally:

// If asked about the role, company, or expectations, provide a clear and relevant answer.
// If unsure, redirect the candidate to HR for more details.

// Conclude the interview properly:
// Thank the candidate for their time.
// Inform them that the company will reach out soon with feedback.
// End the conversation on a polite and positive note.


// - Be sure to be professional and polite.
// - Keep all your responses short and simple. Use official language, but be kind and welcoming.
// - This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
//       },
//     ],
//   },
// };

// export const feedbackSchema = z.object({
//   totalScore: z.number(),
//   categoryScores: z.tuple([
//     z.object({
//       name: z.literal("Communication Skills"),
//       score: z.number(),
//       comment: z.string(),
//     }),
//     z.object({
//       name: z.literal("Technical Knowledge"),
//       score: z.number(),
//       comment: z.string(),
//     }),
//     z.object({
//       name: z.literal("Problem Solving"),
//       score: z.number(),
//       comment: z.string(),
//     }),
//     z.object({
//       name: z.literal("Cultural Fit"),
//       score: z.number(),
//       comment: z.string(),
//     }),
//     z.object({
//       name: z.literal("Confidence and Clarity"),
//       score: z.number(),
//       comment: z.string(),
//     }),
//   ]),
//   strengths: z.array(z.string()),
//   areasForImprovement: z.array(z.string()),
//   finalAssessment: z.string(),
// });

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

export const FINAL_WORKFLOW_MESSAGE = "Thank you for your answers, the interview will be generated in a couple of seconds!";

export const TRANSCRIPT_MESSAGE_DELAY = 3000;

export const AUDIO_ERROR_RETRY_DELAY = 500;

export const MAX_ERROR_RETRIES = 3;

export const AI_MODEL = "openai/gpt-oss-20b";

export const BUILD_PROMPT = (params: InterviewGenerationPromptParams) => `
  Prepare questions for a job interview.
  The job role is ${params.role}.
  The job experience level is ${params.level}.
  The tech stack used in the job is: ${params.techstack}.
  The focus between behavioural and technical questions should lean towards: ${params.type}.
  The amount of questions required is: ${params.amount}.
  Please return only the questions, without any additional text.
  The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant reading.
  Return the questions formatted like this:
  ["Question 1", "Question 2", "Question 3"]
  Thank you!
`;

export const SESSION_COOKIE_NAME = "session";

export const SESSION_COOKIE_AGE = 60 * 60 * 24 * 7;

export const SESSION_COOKIE_EXP = 60 * 60 * 24 * 7 * 1000;

export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
