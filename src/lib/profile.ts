export const PROFILE = {
  name: "Pravin Patil",
  fullName: "Pravin Balasaheb Patil",
  headline: "AI / ML Engineer",
  roles: [
    "AI Engineer",
    "Machine Learning Engineer",
    "Deep Learning Engineer",
    "LLM Engineer",
    "Computer Vision Engineer",
    "Full Stack Developer",
  ],
  summary:
    "I build production-grade AI systems end to end — from training deep learning models for vision and NLP, to serving them behind APIs, to shipping the full stack interfaces people actually use. My work spans medical imaging, molecular property prediction, misinformation detection and LLM-powered applications, all deployed publicly on GitHub and Hugging Face.",
  objective:
    "To work as an AI/ML Engineer on frontier model applications — building retrieval-augmented systems, computer vision pipelines and LLM products that move from research notebook to reliable deployment.",
  email: "pp1065420@gmail.com",
  githubUser: "PravinPatil07",
  hfUser: "PravinPatil007",
  links: {
    github: "https://github.com/PravinPatil07",
    linkedin: "https://www.linkedin.com/in/pravinpatil07",
    huggingface: "https://huggingface.co/PravinPatil007",
    website: "https://pravinpatil.netlify.app/",
  },
  certificationIssuers: [
    { issuer: "ISRO", focus: "Remote sensing & geospatial technology" },
    { issuer: "IBM", focus: "AI / Data Science track" },
    { issuer: "IIT Bombay", focus: "Programming & computing workshop" },
    { issuer: "Reliance", focus: "Industry skilling program" },
    { issuer: "AICTE", focus: "Technical internship program" },
    { issuer: "TensorFlow Workshop", focus: "Deep learning with TensorFlow & Keras" },
  ],
} as const;

export type ServiceItem = {
  title: string;
  body: string;
  points: string[];
};

/** Web development capability story. */
export const WEB_DEV: ServiceItem[] = [
  {
    title: "Frontend engineering",
    body: "Production React interfaces with type-safe data flow, accessible components and motion that supports the content instead of fighting it.",
    points: ["React 19 + TypeScript", "Tailwind CSS + shadcn/ui", "Framer Motion / GSAP", "Responsive + a11y"],
  },
  {
    title: "Backend & APIs",
    body: "REST endpoints, server functions, auth and database schemas — the layer that turns a model or a form into a real product feature.",
    points: ["Node.js / server functions", "REST + webhooks", "Supabase / MySQL / MongoDB", "Auth & RLS"],
  },
  {
    title: "AI-powered products",
    body: "Where my ML work meets the web: inference APIs, RAG chatbots, document Q&A and dashboards wired directly to trained models.",
    points: ["RAG + embeddings", "LLM chat interfaces", "Hugging Face inference", "Streaming responses"],
  },
  {
    title: "Ship & maintain",
    body: "From first commit to a live URL — CI-friendly builds, SEO, analytics and the small fixes that keep a site healthy after launch.",
    points: ["Vercel / Netlify / Docker", "SEO + JSON-LD", "Performance budgets", "Post-launch support"],
  },
];

/** Freelance engagement details. */
export const FREELANCE = {
  status: "Available for freelance & contract work",
  availability: "Part-time · ~20 hrs / week · remote (IST, overlaps EU & US mornings)",
  intro:
    "I take on focused freelance builds where AI and web development overlap — a model that needs a product around it, or a product that needs a model inside it.",
  services: [
    {
      title: "AI / ML solution build",
      scope: "Model training, fine-tuning, evaluation and an inference API you can call from anywhere.",
      timeline: "2–5 weeks",
    },
    {
      title: "Full stack web app",
      scope: "Dashboards, portals and SaaS front ends with auth, database and admin flows included.",
      timeline: "3–6 weeks",
    },
    {
      title: "LLM chatbot / RAG assistant",
      scope: "Document ingestion, embeddings, vector search and a polished chat UI on your data.",
      timeline: "1–3 weeks",
    },
    {
      title: "Landing page / portfolio",
      scope: "High-craft marketing sites with animation, SEO, forms and analytics wired up.",
      timeline: "3–10 days",
    },
  ],
  process: [
    { step: "01", title: "Scope call", body: "A short call to pin down the problem, data and success metric." },
    { step: "02", title: "Proposal", body: "Fixed milestones, deliverables and timeline before any code." },
    { step: "03", title: "Build in sprints", body: "Weekly demos on a live preview URL so you always see progress." },
    { step: "04", title: "Handover", body: "Source code, docs, deployment and a support window after launch." },
  ],
} as const;

export type SkillGroup = { title: string; items: string[] };


export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: "Languages",
    items: ["Python", "C++", "JavaScript", "TypeScript", "SQL", "HTML", "CSS"],
  },
  {
    title: "AI / Machine Learning",
    items: [
      "Machine Learning",
      "Deep Learning",
      "TensorFlow",
      "Keras",
      "Scikit-learn",
      "NumPy",
      "Pandas",
      "Matplotlib",
      "OpenCV",
    ],
  },
  {
    title: "LLM & NLP",
    items: [
      "NLP",
      "LLMs",
      "Transformers",
      "Prompt Engineering",
      "LangChain",
      "RAG",
      "Vector Databases",
      "Embeddings",
      "Hugging Face",
    ],
  },
  {
    title: "Web & Full Stack",
    items: ["React", "Next.js", "Tailwind CSS", "Node.js", "REST APIs"],
  },
  {
    title: "Data & Tooling",
    items: ["Git", "GitHub", "Docker", "VS Code", "MySQL", "MongoDB", "Supabase"],
  },
];

/** Keyword-based classification used for project badges + filters. */
export const PROJECT_TAGS = [
  { id: "ai", label: "AI", match: ["ai", "gpt", "llm", "agent", "chatbot", "genai"] },
  {
    id: "ml",
    label: "Machine Learning",
    match: ["ml", "predict", "classification", "regression", "sklearn", "scikit", "model"],
  },
  {
    id: "dl",
    label: "Deep Learning",
    match: ["deep", "neural", "cnn", "tensorflow", "keras", "torch"],
  },
  { id: "llm", label: "LLM", match: ["llm", "gpt", "rag", "langchain", "transformer"] },
  {
    id: "cv",
    label: "Computer Vision",
    match: ["vision", "image", "detection", "opencv", "eye", "disease", "classification"],
  },
  {
    id: "web",
    label: "Web Development",
    match: [
      "react",
      "next",
      "tailwind",
      "web",
      "clone",
      "app",
      "css",
      "html",
      "javascript",
      "typescript",
    ],
  },
  { id: "iot", label: "IoT", match: ["iot", "arduino", "esp", "sensor", "raspberry"] },
  { id: "python", label: "Python", match: ["python", "jupyter notebook"] },
  { id: "data", label: "Data / SQL", match: ["sql", "pandas", "matplotlib", "data", "mysql"] },
];
