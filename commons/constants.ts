import {z} from "zod";
import {
    InterviewFeedbackPromptParams,
    InterviewGenerationPromptParams,
    InterviewPerformanceStats
} from "@/commons/types";

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
    "/amazon.png",
    "/apple.png",
    "/cisco.png",
    "/google.png",
    "/ibm.png",
    "/intel.png",
    "/microsoft.png",
    "/oracle.png",
    "/samsung.png",
    "/xiaomi.png"
];

export const VOICE_AGENT_PROPS = {
    provider: 'elevenlabs',
    voice: 'XrExE9yKIg1WjnnlVkGX',
    model: 'eleven_flash_v2_5'
};

export const TRANSCRIPT_MESSAGE_DELAY = 3000;

export const AUDIO_ERROR_RETRY_DELAY = 500;

export const MAX_ERROR_RETRIES = 3;

export const AI_MODEL = "openai/gpt-oss-20b";

export const getUnrecognizedSpeechErrorMessages = async (locale?: string) => {
    const {backendTranslationKeys, getBackendTranslationList} = await import("../features/translation/utils/clientTranslations");
    return await getBackendTranslationList(locale, backendTranslationKeys.interview.workflow.unrecognizedSpeech);
};

export const getUndetectedAudioErrorMessages = async (locale?: string) => {
    const {backendTranslationKeys, getBackendTranslationList} = await import("../features/translation/utils/clientTranslations");
    return await getBackendTranslationList(locale, backendTranslationKeys.interview.workflow.undetectedAudio);
};

export const getFinalErrorMessage = async (locale?: string) => {
    const {backendTranslationKeys, getBackendTranslation} = await import("../features/translation/utils/clientTranslations");
    return await getBackendTranslation(locale, backendTranslationKeys.interview.workflow.finalErrorMessage);
};

export const getFinalGenerateWorkflowMessage = async (locale?: string) => {
    const {backendTranslationKeys, getBackendTranslation} = await import("../features/translation/utils/clientTranslations");
    return await getBackendTranslation(locale, backendTranslationKeys.interview.workflow.finalGenerateMessage);
};

export const getFinalInterviewWorkflowMessage = async (locale?: string) => {
    const {backendTranslationKeys, getBackendTranslation} = await import("../features/translation/utils/clientTranslations");
    return await getBackendTranslation(locale, backendTranslationKeys.interview.workflow.finalInterviewMessage);
};

export const INTERVIEW_GENERATION_PROMPT = async (params: InterviewGenerationPromptParams, locale?: string) => {
    const {backendTranslationKeys, getBackendTranslation} = await import("../features/translation/utils/clientTranslations");
    const {prompts} = backendTranslationKeys.interview;
    const languageInstruction = await getBackendTranslation(locale, prompts.generationLanguageInstruction);

    return await getBackendTranslation(locale, prompts.generationTemplate, {
        languageInstruction,
        role: params.role,
        level: params.level,
        techstack: params.techstack,
        type: params.type,
        amount: params.amount,
    });
};

export const INTERVIEW_FEEDBACK_PROMPT = async (params: InterviewFeedbackPromptParams, locale?: string) => {
    const {backendTranslationKeys, getBackendTranslation} = await import("../features/translation/utils/clientTranslations");
    const {prompts} = backendTranslationKeys.interview;
    const languageInstruction = await getBackendTranslation(locale, prompts.feedbackLanguageInstruction);

    return await getBackendTranslation(locale, prompts.feedbackTemplate, {
        languageInstruction,
        role: params.role,
        level: params.level,
        type: params.type,
        technologies: params.technologies.join(", "),
        transcript: params.transcript,
    });
};

export const SESSION_COOKIE_NAME = "session";

export const SESSION_COOKIE_AGE = 60 * 60 * 24 * 7;

export const SESSION_COOKIE_EXP = 60 * 60 * 24 * 7 * 1000;

export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss"

export const DATE_FORMAT = "YYYY-MM-DD";

export const EMPTY_INTERVIEW_PERFORMANCE_STATS: InterviewPerformanceStats = {
    completedInterviews: 0,
    averageScore: 0,
    highestScore: null,
    latestScore: null,
    latestInterviewDate: null,
    recentScoreChange: null,
    dailyAverageScores: [],
};
