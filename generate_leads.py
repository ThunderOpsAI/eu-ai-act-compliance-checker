import csv
import urllib.parse

leads = [
    # --- Category 1: GPAI, LLMs & Generative AI (Chapter V / Art. 50 Transparency) ---
    {
        "id": 1,
        "name": "Arthur Mensch",
        "role": "Co-Founder & CEO",
        "company": "Mistral AI",
        "location": "Paris, France",
        "sector": "GPAI / Foundation Models",
        "act_trigger": "Chapter V GPAI Obligations & Systemic Risk",
        "linkedin_url": "https://www.linkedin.com/in/arthur-mensch/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Arthur+Mensch+Mistral+AI",
        "message": "Hi Arthur, huge fan of Mistral’s sovereign LLMs. As the EU AI Act’s Chapter V GPAI transparency rules roll out, enterprise buyers are asking for documented compliance before procurement. We built a zero-retention EU AI Act compliance checker that maps obligations without retaining model architecture or IP. Would love to share a 2-minute overview if useful!"
    },
    {
        "id": 2,
        "name": "Mati Staniszewski",
        "role": "Co-Founder & CEO",
        "company": "ElevenLabs",
        "location": "London, UK / Warsaw",
        "sector": "Voice Synthesis / Generative Audio",
        "act_trigger": "Art. 50 Synthetic Audio & Watermarking Rules",
        "linkedin_url": "https://www.linkedin.com/in/matistaniszewski/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Mati+Staniszewski+ElevenLabs",
        "message": "Hi Mati, phenomenal work scaling ElevenLabs. With the EU AI Act Art. 50 transparency requirements on synthetic audio and deepfakes taking effect, enterprise clients in the EU are auditing voice providers. We built an automated EU AI Act compliance tool with a zero-retention architecture—evaluating obligations without touching audio data. Open to a quick look?"
    },
    {
        "id": 3,
        "name": "Victor Riparbelli",
        "role": "Co-Founder & CEO",
        "company": "Synthesia",
        "location": "London, UK",
        "sector": "Generative Video & Avatars",
        "act_trigger": "Art. 50 Deepfake & Synthetic Content Transparency",
        "linkedin_url": "https://www.linkedin.com/in/victorriparbelli/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Victor+Riparbelli+Synthesia",
        "message": "Hi Victor, Synthesia’s enterprise video avatars are world-class. With EU AI Act synthetic media transparency mandates kicking in, enterprise procurement teams are demanding verified compliance audits. We automated EU AI Act tier classification and obligation roadmaps with a zero-retention privacy architecture. Happy to send across a quick sample report!"
    },
    {
        "id": 4,
        "name": "Jonas Andrulis",
        "role": "Founder & CEO",
        "company": "Aleph Alpha",
        "location": "Heidelberg, Germany",
        "sector": "Sovereign Enterprise LLMs",
        "act_trigger": "Chapter V GPAI & Enterprise Governance",
        "linkedin_url": "https://www.linkedin.com/in/jonas-andrulis-b27b952a/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Jonas+Andrulis+Aleph+Alpha",
        "message": "Hi Jonas, Aleph Alpha’s commitment to European AI sovereignty and explainability is vital. As enterprise customers require formal EU AI Act conformity proofs before rolling out models, we built a zero-retention compliance verification tool to instantly map deployments against EU AI Act requirements. Would be great to exchange notes!"
    },
    {
        "id": 5,
        "name": "Jarek Kutylowski",
        "role": "Founder & CEO",
        "company": "DeepL",
        "location": "Cologne, Germany",
        "sector": "Enterprise Translation & Language AI",
        "act_trigger": "Enterprise Data Transparency & Governance",
        "linkedin_url": "https://www.linkedin.com/in/jaroslaw-kutylowski/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Jaroslaw+Kutylowski+DeepL",
        "message": "Hi Jarek, DeepL set the benchmark for enterprise privacy and translation precision. As enterprise customers audit vendor compliance under the EU AI Act, we built a streamlined compliance checker with a zero-retention privacy guarantee that mirrors DeepL’s strict standards. Open to seeing a 2-min breakdown?"
    },
    {
        "id": 6,
        "name": "Anton Osika",
        "role": "Founder & CEO",
        "company": "Lovable",
        "location": "Stockholm, Sweden",
        "sector": "AI App Generation & Developer Tools",
        "act_trigger": "Transparency in AI Code & Autonomous Generation",
        "linkedin_url": "https://www.linkedin.com/in/anton-osika-49b80b27/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Anton+Osika+Lovable",
        "message": "Hi Anton, love what you and the Lovable team are doing to democratize software building! As Lovable-generated apps proliferate across the EU, user inquiries around EU AI Act compliance are bound to spike. We built a zero-retention compliance checker that diagnoses AI risk tiers and obligations in 60 seconds. Happy to share a quick preview!"
    },
    {
        "id": 7,
        "name": "Matthieu Rouif",
        "role": "Co-Founder & CEO",
        "company": "Photoroom",
        "location": "Paris, France",
        "sector": "Generative Image & Computer Vision",
        "act_trigger": "Art. 50 AI-Generated Media Labeling",
        "linkedin_url": "https://www.linkedin.com/in/matthieurouif/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Matthieu+Rouif+Photoroom",
        "message": "Hi Matthieu, Photoroom’s AI visual commerce platform is incredible. Under the EU AI Act, commercial image generation tools face new labeling and transparency guidelines. We built an automated compliance platform that operates with a strict zero-retention guarantee—verifying compliance without storing your proprietary image data. Let’s connect!"
    },
    {
        "id": 8,
        "name": "Gabriel Hubert",
        "role": "Co-Founder & CEO",
        "company": "Dust",
        "location": "Paris, France",
        "sector": "Enterprise AI Assistants & Workspaces",
        "act_trigger": "Enterprise Data RAG & Workplace AI Transparency",
        "linkedin_url": "https://www.linkedin.com/in/gabrielhubert/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Gabriel+Hubert+Dust+AI",
        "message": "Hi Gabriel, Dust’s team AI assistants are leading modern enterprise workflows. Because Dust connects directly to enterprise knowledge bases, clients in regulated EU sectors constantly question AI Act risk tiers. Our tool automates EU AI Act compliance reporting with a zero-retention guarantee so internal company data remains private. Would love to connect!"
    },
    {
        "id": 9,
        "name": "Malte Kosub",
        "role": "Co-Founder & CEO",
        "company": "Parloa",
        "location": "Berlin, Germany",
        "sector": "Conversational Enterprise AI Agents",
        "act_trigger": "Customer Service AI Interaction Transparency",
        "linkedin_url": "https://www.linkedin.com/in/malte-kosub/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Malte+Kosub+Parloa",
        "message": "Hi Malte, Parloa’s enterprise contact center AI is remarkable. Enterprise clients are increasingly requiring documented EU AI Act compliance before signing multi-year contracts. We built a compliance diagnostic that identifies risk tiers and generates actionable audit reports in minutes without storing conversation logs. Open to a brief chat?"
    },
    {
        "id": 10,
        "name": "Robin Rombach",
        "role": "Co-Founder & CEO",
        "company": "Black Forest Labs",
        "location": "Freiburg, Germany",
        "sector": "Generative Media & Diffusion Models (FLUX)",
        "act_trigger": "GPAI Model Obligations & Copyright Transparency",
        "linkedin_url": "https://www.linkedin.com/in/robin-rombach/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Robin+Rombach+Black+Forest+Labs",
        "message": "Hi Robin, the FLUX models are phenomenal. With the EU AI Act imposing technical documentation and copyright transparency requirements on foundation model providers, staying compliant without slowing iteration is key. We built a zero-retention compliance tool that maps your obligations in minutes. Let me know if you’d like a 2-min breakdown!"
    },

    # --- Category 2: HR Tech, Recruitment & Talent AI (Annex III, Sec 4 - High Risk) ---
    {
        "id": 11,
        "name": "Hanno Renner",
        "role": "Co-Founder & CEO",
        "company": "Personio",
        "location": "Munich, Germany",
        "sector": "HR Tech & People Workflow Automation",
        "act_trigger": "Annex III Sec 4(a) Recruitment & CV Screening (High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/hannorenner/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Hanno+Renner+Personio",
        "message": "Hi Hanno, Personio has built the premier HR operating system in Europe. As Personio rolls out AI candidate screening and talent workflows, these systems fall squarely under Annex III High-Risk classification under the EU AI Act. We built a zero-retention compliance checker that automates audit readiness without exposing employee data. Would love to share details!"
    },
    {
        "id": 12,
        "name": "Wouter Durville",
        "role": "Co-Founder & CEO",
        "company": "TestGorilla",
        "location": "Amsterdam, Netherlands",
        "sector": "Skills Assessment & Candidate Evaluation",
        "act_trigger": "Annex III Sec 4(a) Candidate Assessment & Filtering (High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/wouterdurville/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Wouter+Durville+TestGorilla",
        "message": "Hi Wouter, TestGorilla’s skills assessments have transformed hiring. Under EU AI Act Annex III (Employment), automated assessment and candidate ranking algorithms are explicitly classified as High-Risk AI, requiring continuous bias testing and technical files. We built an automated scanner to fast-track your compliance documentation. Open to a quick chat?"
    },
    {
        "id": 13,
        "name": "Sultan Saidov",
        "role": "Co-Founder & President",
        "company": "Beamery",
        "location": "London, UK",
        "sector": "Talent Lifecycle Management & Workforce AI",
        "act_trigger": "Annex III Sec 4(a/b) Promotion & Candidate Ranking (High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/sultansaidov/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Sultan+Saidov+Beamery",
        "message": "Hi Sultan, Beamery’s talent intelligence platform is setting standards globally. Under the EU AI Act, AI used for hiring, task allocation, and worker evaluation is classified as High-Risk, demanding audit logs and risk management files. We created a zero-retention diagnostic tool to instantly assess your obligations without storing proprietary talent data. Let’s connect!"
    },
    {
        "id": 14,
        "name": "Christoph Hohenberger",
        "role": "Co-Founder & Managing Director",
        "company": "Retorio",
        "location": "Munich, Germany",
        "sector": "Video AI Interviewing & Behavioral Coaching",
        "act_trigger": "Annex III Sec 4 & Emotion Recognition in Workplace (Prohibited/High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/christoph-hohenberger/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Christoph+Hohenberger+Retorio",
        "message": "Hi Christoph, Retorio’s AI coaching is a huge leap forward for sales and talent training. Because the EU AI Act places strict bans on emotion recognition in workplace contexts and classifies hiring AI as High-Risk, having formal compliance audits is critical for enterprise buyers. We built a zero-retention compliance verification tool to clear these hurdles fast. Let's chat!"
    },
    {
        "id": 15,
        "name": "Benjamin Blasco",
        "role": "Co-Founder & CEO",
        "company": "Maki People",
        "location": "Paris, France",
        "sector": "Automated Candidate Skills Assessment",
        "act_trigger": "Annex III Sec 4(a) Recruitment Candidate Scoring (High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/benjaminblasco/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Benjamin+Blasco+Maki+People",
        "message": "Hi Benjamin, Maki’s candidate assessment tests make hiring effortless. Under the EU AI Act, pre-employment scoring and candidate filtering tools are designated High Risk under Annex III. Enterprise HR buyers in Europe are already asking for compliance roadmaps. We built a 2-minute zero-retention checker that generates audit-ready action plans. Would love to connect!"
    },
    {
        "id": 16,
        "name": "Cesar Driessen",
        "role": "Co-Founder & Head of Tech",
        "company": "Harver",
        "location": "Amsterdam, Netherlands",
        "sector": "Volume Hiring & Candidate Screening",
        "act_trigger": "Annex III Sec 4(a) Automated Job Application Decisioning (High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/cesardriessen/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Cesar+Driessen+Harver",
        "message": "Hi Cesar, Harver’s volume hiring platform is a staple for global employers. With Annex III of the EU AI Act classifying candidate assessment AI as High Risk, automated logging and human oversight protocols are now legally binding. Our zero-retention compliance platform verifies your setup in minutes. Open to seeing a quick demo?"
    },
    {
        "id": 17,
        "name": "Ruben Wieman",
        "role": "Co-Founder & CEO",
        "company": "Oneteam",
        "location": "Rotterdam, Netherlands",
        "sector": "Frontline Employee Experience & AI Onboarding",
        "act_trigger": "Annex III Sec 4(b) Workplace Performance Monitoring",
        "linkedin_url": "https://www.linkedin.com/in/ruben-wieman-26510360/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Ruben+Wieman+Oneteam",
        "message": "Hi Ruben, Oneteam’s platform for frontline workers is doing fantastic work. As you introduce AI-driven training and workflow assistance, navigating the EU AI Act’s workplace rules is key to avoiding Annex III worker-monitoring pitfalls. We built an automated zero-retention compliance tool that maps your obligations in 60 seconds. Happy to share a report!"
    },
    {
        "id": 18,
        "name": "Kristjan Kristjansson",
        "role": "Co-Founder & CEO",
        "company": "50skills",
        "location": "Reykjavik, Iceland",
        "sector": "Hiring & Employee Journey Automation",
        "act_trigger": "Annex III Sec 4(a) HR Automation & Candidate Workflows",
        "linkedin_url": "https://www.linkedin.com/in/kristjankristjansson/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Kristjan+Kristjansson+50skills",
        "message": "Hi Kristjan, 50skills’ onboarding and recruitment automation is top notch. European enterprises using AI in recruitment now demand explicit EU AI Act High-Risk compliance confirmation before procurement. We built a compliance scanner with zero data retention that produces clear, actionable compliance breakdowns in minutes. Let’s connect!"
    },
    {
        "id": 19,
        "name": "Mo Moubarak",
        "role": "Co-Founder & CEO",
        "company": "MoBerries",
        "location": "Berlin, Germany",
        "sector": "AI Talent Sourcing & Candidate Matching",
        "act_trigger": "Annex III Sec 4(a) Algorithmic Candidate Matching",
        "linkedin_url": "https://www.linkedin.com/in/momoubarak/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Mo+Moubarak+MoBerries",
        "message": "Hi Mo, MoBerries’ AI candidate matching engine is one of the best in Berlin. Under the EU AI Act, algorithmic talent matching and candidate filtering fall under Annex III High-Risk regulations, requiring documented bias mitigation and technical files. We built an automated compliance verification tool that requires zero data storage. Open to a brief chat?"
    },
    {
        "id": 20,
        "name": "Göran Backlund",
        "role": "Chief Technology Officer",
        "company": "Academic Work",
        "location": "Stockholm, Sweden",
        "sector": "Staffing & AI Candidate Placement",
        "act_trigger": "Annex III Sec 4(a) Job Application Filtering & Ranking",
        "linkedin_url": "https://www.linkedin.com/in/goranbacklund/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Goran+Backlund+Academic+Work",
        "message": "Hi Göran, Academic Work’s leadership in staffing young professionals is impressive. Because recruitment AI algorithms fall under the EU AI Act’s High-Risk category, ensuring that algorithms meet conformity assessment standards is critical. We built a zero-retention compliance tool that maps your obligations in 2 minutes. Would love to connect!"
    },

    # --- Category 3: Fintech, Credit Scoring & Insurance AI (Annex III, Sec 5 - High Risk) ---
    {
        "id": 21,
        "name": "Alex Dalyac",
        "role": "Co-Founder & CEO",
        "company": "Tractable",
        "location": "London, UK",
        "sector": "Computer Vision for Insurance & Claims",
        "act_trigger": "Annex III Sec 5(b) Insurance Risk Assessment & Pricing (High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/alex-dalyac-7a268832/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Alex+Dalyac+Tractable",
        "message": "Hi Alex, Tractable’s computer vision for accident and disaster recovery has redefined claims. Under Annex III Sec. 5(b), AI used for risk assessment and pricing in insurance can trigger High-Risk requirements. We built an automated EU AI Act scanner with zero-retention architecture to map out obligations and technical documentation needs in minutes. Would love to connect!"
    },
    {
        "id": 22,
        "name": "Jeremy Jawish",
        "role": "Co-Founder & CEO",
        "company": "Shift Technology",
        "location": "Paris, France",
        "sector": "Insurance Fraud Detection & Underwriting",
        "act_trigger": "Annex III Sec 5(b) Insurance Decisioning & Fraud AI (High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/jeremyjawish/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Jeremy+Jawish+Shift+Technology",
        "message": "Hi Jeremy, Shift’s AI fraud detection is indispensable for insurers across the EU. Because insurance risk assessment models fall under Annex III High-Risk scrutiny, insurer procurement teams are requesting explicit AI Act roadmaps. We built a zero-retention EU AI Act compliance diagnostic to automate classification and obligation tracking. Can I send a quick preview?"
    },
    {
        "id": 23,
        "name": "Tanguy Touffut",
        "role": "Co-Founder & CEO",
        "company": "Descartes Underwriting",
        "location": "Paris, France",
        "sector": "Climate Insurtech & Parametric Modeling",
        "act_trigger": "Annex III Sec 5(b) Parametric Risk Modeling & Pricing",
        "linkedin_url": "https://www.linkedin.com/in/tanguy-touffut-71a2517/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Tanguy+Touffut+Descartes+Underwriting",
        "message": "Hi Tanguy, Descartes’ parametric underwriting using satellite and AI models is pioneering. As insurers adapt to the EU AI Act, risk assessment algorithms used in insurance pricing face Annex III High-Risk compliance requirements. We built an automated compliance verification tool with zero data retention that pinpoints obligations in minutes. Let’s connect!"
    },
    {
        "id": 24,
        "name": "Rasto Brencic",
        "role": "Founder & CEO",
        "company": "Kreditz",
        "location": "Stockholm, Sweden",
        "sector": "Open Banking & Automated Credit Scoring",
        "act_trigger": "Annex III Sec 5(a) Creditworthiness & Credit Scoring (High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/rastobrencic/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Rasto+Brencic+Kreditz",
        "message": "Hi Rasto, Kreditz’s automated credit scoring from open banking data is fantastic. Under EU AI Act Annex III Sec. 5(a), AI systems evaluating creditworthiness are strictly classified as High-Risk, requiring mandatory risk management and logging. We built a zero-retention compliance tool that verifies your regulatory readiness in 2 minutes. Open to a quick chat?"
    },
    {
        "id": 25,
        "name": "Jordane Giuly",
        "role": "Co-Founder & CEO",
        "company": "Defacto",
        "location": "Paris, France",
        "sector": "B2B Credit Infrastructure & Real-Time Lending",
        "act_trigger": "Annex III Sec 5(a) Automated Credit Decisioning (High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/jordanegiuly/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Jordane+Giuly+Defacto",
        "message": "Hi Jordane, Defacto’s instant B2B lending API is changing corporate credit. Under the EU AI Act Annex III, automated credit evaluation AI is classified as High Risk, meaning banking partners will require certified technical documentation. We created a zero-retention compliance tool that provides instant classification and compliance roadmaps. Let’s chat!"
    },
    {
        "id": 26,
        "name": "Christian Grobe",
        "role": "Co-Founder & Managing Director",
        "company": "Billie",
        "location": "Berlin, Germany",
        "sector": "B2B Buy Now Pay Later & Credit Scoring",
        "act_trigger": "Annex III Sec 5(a) Credit Scoring & Risk Underwriting (High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/christiangrobe/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Christian+Grobe+Billie",
        "message": "Hi Christian, Billie’s B2B BNPL platform is expanding across Europe at an amazing pace. Under Annex III Sec. 5(a) of the EU AI Act, automated credit scoring and risk assessment algorithms require rigorous conformity assessments and bias controls. We built a zero-retention compliance checker that outlines your obligations in 2 minutes. Would love to connect!"
    },
    {
        "id": 27,
        "name": "Louis Chatriot",
        "role": "Co-Founder & CEO",
        "company": "Alma",
        "location": "Paris, France",
        "sector": "Consumer BNPL & Merchant Credit AI",
        "act_trigger": "Annex III Sec 5(a) Credit Scoring for Financial Services",
        "linkedin_url": "https://www.linkedin.com/in/louis-chatriot-b0a33413/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Louis+Chatriot+Alma",
        "message": "Hi Louis, Alma’s seamless installment payments are a gold standard for European retail. Automated consumer credit assessment falls directly under Annex III High-Risk classification in the EU AI Act, requiring formal risk management files. We built an automated, zero-retention compliance platform to fast-track your team's compliance roadmap. Open to a brief look?"
    },
    {
        "id": 28,
        "name": "Martin Kassing",
        "role": "Founder & CEO",
        "company": "Upvest",
        "location": "Berlin, Germany",
        "sector": "Investment API & WealthTech Infrastructure",
        "act_trigger": "Essential Financial Services & Algorithmic Risk",
        "linkedin_url": "https://www.linkedin.com/in/martinkassing/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Martin+Kassing+Upvest",
        "message": "Hi Martin, Upvest’s investment infrastructure API is powering the next generation of fintechs. As fintech partners look to integrate algorithmic portfolio and risk tools, EU AI Act compliance is quickly becoming a sales blocker. Our zero-retention tool provides instant compliance tiering without storing proprietary financial algorithms. Would love to connect!"
    },
    {
        "id": 29,
        "name": "Alexandre Prot",
        "role": "Co-Founder & CEO",
        "company": "Qonto",
        "location": "Paris, France",
        "sector": "Business Banking & Financial Automation",
        "act_trigger": "Annex III Financial Risk & Automated Fraud Scoring",
        "linkedin_url": "https://www.linkedin.com/in/alexandre-prot-6b45a013/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Alexandre+Prot+Qonto",
        "message": "Hi Alexandre, Qonto has built the premier business banking solution across Europe. As Qonto expands automated financial management and transaction risk screening, EU AI Act compliance for automated financial services becomes crucial. We developed a zero-retention compliance tool that maps your obligations in minutes. Happy to share a quick preview!"
    },
    {
        "id": 30,
        "name": "Julian Teicke",
        "role": "Founder",
        "company": "wefox",
        "location": "Berlin, Germany",
        "sector": "Digital Insurance & Underwriting AI",
        "act_trigger": "Annex III Sec 5(b) Health & Life Insurance Risk Assessment",
        "linkedin_url": "https://www.linkedin.com/in/julianteicke/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Julian+Teicke+wefox",
        "message": "Hi Julian, wefox’s disruption of the insurance distribution model has been remarkable. Under Annex III Sec. 5(b) of the EU AI Act, AI systems used for insurance risk assessment and pricing are categorized as High Risk. We built a zero-retention compliance platform that streamlines compliance audits and action plans in minutes. Would love to share how it works!"
    },

    # --- Category 4: HealthTech, Medical Diagnostics & Clinical AI (MDR / Annex III High Risk) ---
    {
        "id": 31,
        "name": "Thomas Clozel",
        "role": "Co-Founder & CEO",
        "company": "Owkin",
        "location": "Paris, France",
        "sector": "Biomedical AI & Federated Clinical Trials",
        "act_trigger": "Annex III / Medical Device Regulation (MDR) High-Risk AI",
        "linkedin_url": "https://www.linkedin.com/in/thomas-clozel-md-b36b4852/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Thomas+Clozel+Owkin",
        "message": "Hi Thomas, Owkin’s federated learning models are setting the gold standard for clinical AI research. Medical and predictive healthcare AI systems face tight dual-scrutiny under MDR and EU AI Act Annex III. We built an automated compliance engine specifically with a zero-retention architecture so sensitive clinical architectures are never stored. Would love to connect!"
    },
    {
        "id": 32,
        "name": "Stanislas Niox-Chateau",
        "role": "Co-Founder & CEO",
        "company": "Doctolib",
        "location": "Paris, France",
        "sector": "Digital Health & Clinical Assistant AI",
        "act_trigger": "Annex III Patient Triage & Medical Consultation AI",
        "linkedin_url": "https://www.linkedin.com/in/stanislas-niox-chateau-995b0b23/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Stanislas+Niox-Chateau+Doctolib",
        "message": "Hi Stanislas, Doctolib has transformed healthcare across Europe. As Doctolib integrates AI medical transcription and practitioner assistants, navigating the EU AI Act’s high-risk health system requirements is vital. We built a zero-retention compliance checker that maps obligations without seeing patient consultations. Let’s connect if this is a priority!"
    },
    {
        "id": 33,
        "name": "Andreas Cleve",
        "role": "Co-Founder & CEO",
        "company": "Corti",
        "location": "Copenhagen, Denmark",
        "sector": "Emergency Call Triage & Clinical Decision AI",
        "act_trigger": "Annex III Sec 5(c) Emergency Services Dispatch & Patient Triage (High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/andreascleve/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Andreas+Cleve+Corti",
        "message": "Hi Andreas, Corti’s AI for real-time emergency triage is literally saving lives. Under Annex III Sec. 5(c), AI systems evaluating emergency calls and prioritizing dispatch are designated High Risk, requiring mandatory logging and risk management. We built a zero-retention compliance tool that outlines your exact requirements in 2 minutes. Open to a quick call?"
    },
    {
        "id": 34,
        "name": "Michalis Papadakis",
        "role": "Co-Founder & CEO",
        "company": "Brainomix",
        "location": "Oxford, UK",
        "sector": "AI Brain & Lung Medical Imaging (e-Stroke)",
        "act_trigger": "Medical Device Software (MDR Class IIa/b) & Annex III High Risk",
        "linkedin_url": "https://www.linkedin.com/in/michalis-papadakis-a9010411/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Michalis+Papadakis+Brainomix",
        "message": "Hi Michalis, Brainomix’s e-Stroke software is making a tremendous clinical impact. Combining MDR compliance with the new EU AI Act High-Risk requirements creates duplicate regulatory burdens. We built an automated zero-retention tool that clarifies your EU AI Act obligations and documentation gaps in minutes. Would love to connect!"
    },
    {
        "id": 35,
        "name": "Peter Kecskemethy",
        "role": "Co-Founder & CEO",
        "company": "Kheiron Medical Technologies",
        "location": "London, UK",
        "sector": "Breast Cancer Screening & Radiology AI (Mia)",
        "act_trigger": "MDR Harmonized Standards & Annex III High Risk Diagnostic AI",
        "linkedin_url": "https://www.linkedin.com/in/peterkecskemethy/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Peter+Kecskemethy+Kheiron+Medical",
        "message": "Hi Peter, Kheiron’s Mia is setting the global standard for deep learning in mammography. With the EU AI Act classifying diagnostic radiology AI as High Risk alongside MDR, proving compliance without slowing product cycles is vital. Our platform evaluates compliance with a zero-retention privacy guarantee—patient scans are never stored. Let’s connect!"
    },
    {
        "id": 36,
        "name": "Mark-Jan Harte",
        "role": "Co-Founder & CEO",
        "company": "Aidence",
        "location": "Amsterdam, Netherlands",
        "sector": "Pulmonary Radiology & Oncology AI (Visiolung)",
        "act_trigger": "MDR Diagnostic AI & Annex III High-Risk Classification",
        "linkedin_url": "https://www.linkedin.com/in/markjanharte/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Mark-Jan+Harte+Aidence",
        "message": "Hi Mark-Jan, Aidence’s lung cancer screening AI is a tremendous asset to radiology departments. Under the EU AI Act, diagnostic medical imaging models face rigorous post-market monitoring and conformity assessment rules. We created an automated compliance verification tool with a zero-retention architecture. Would love to send across a quick sample report!"
    },
    {
        "id": 37,
        "name": "Sebastian Rieschel",
        "role": "Co-Founder & Managing Director",
        "company": "Vara",
        "location": "Berlin, Germany",
        "sector": "AI Breast Cancer Screening Platform",
        "act_trigger": "Annex III Diagnostic AI & Clinical Evidence Compliance",
        "linkedin_url": "https://www.linkedin.com/in/sebastianrieschel/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Sebastian+Rieschel+Vara+Health",
        "message": "Hi Sebastian, Vara’s work in expanding access to early cancer detection is truly inspiring. As health systems across Europe adopt Vara, meeting both CE-MDR and EU AI Act High-Risk criteria is essential. Our platform provides automated compliance diagnostics with a strict zero-retention guarantee so medical IP remains private. Open to a 10-min introduction?"
    },
    {
        "id": 38,
        "name": "Wim Van Hecke",
        "role": "Co-Founder & CEO",
        "company": "Icometrix",
        "location": "Leuven, Belgium",
        "sector": "Brain MRI Quantitative Imaging AI (icobrain)",
        "act_trigger": "MDR Software as Medical Device & Annex III High Risk",
        "linkedin_url": "https://www.linkedin.com/in/wim-van-hecke-88b0213/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Wim+Van+Hecke+Icometrix",
        "message": "Hi Wim, icobrain’s brain MRI quantification has brought incredible rigor to neurology. Navigating the intersection of MDR and the EU AI Act High-Risk mandates requires structured documentation without administrative drag. We built a zero-retention compliance scanner to map your requirements in minutes. Would love to connect!"
    },
    {
        "id": 39,
        "name": "Erik de Heus",
        "role": "CEO",
        "company": "SkinVision",
        "location": "Amsterdam, Netherlands",
        "sector": "Dermatology AI & Mobile Skin Cancer Detection",
        "act_trigger": "Annex III Direct-to-Consumer Diagnostic Medical AI",
        "linkedin_url": "https://www.linkedin.com/in/erik-de-heus-87361a/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Erik+de+Heus+SkinVision",
        "message": "Hi Erik, SkinVision’s mobile skin cancer risk assessment empowers millions. Because direct-to-consumer health assessment algorithms face intense scrutiny under the EU AI Act’s High-Risk tier, proving transparency and clinical safety is key. We built a compliance diagnostic tool that operates with zero data retention. Open to a brief chat?"
    },
    {
        "id": 40,
        "name": "Priit Salumaa",
        "role": "Co-Founder & CEO",
        "company": "Better Medicine",
        "location": "Tartu, Estonia",
        "sector": "AI Oncology Imaging & Kidney Cancer Detection",
        "act_trigger": "Annex III High-Risk Diagnostic & Clinical Logging",
        "linkedin_url": "https://www.linkedin.com/in/priitsalumaa/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Priit+Salumaa+Better+Medicine",
        "message": "Hi Priit, Better Medicine’s AI for CT scan tumor detection is doing groundbreaking work in Estonia. As you prepare for clinical rollouts across the EU, aligning with the EU AI Act High-Risk obligations alongside MDR is critical. We built a zero-retention compliance platform that produces audit-ready action plans in 2 minutes. Let’s connect!"
    },

    # --- Category 5: Biometrics, Computer Vision & Security AI (Annex III, Sec 1 - High Risk / Biometric Rules) ---
    {
        "id": 41,
        "name": "Kaarel Kotkas",
        "role": "Founder & CEO",
        "company": "Veriff",
        "location": "Tallinn, Estonia",
        "sector": "Identity Verification & Biometric Fraud Detection",
        "act_trigger": "Annex III Sec 1 Remote Biometric Identification (High Risk)",
        "linkedin_url": "https://www.linkedin.com/in/kaarelkotkas/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Kaarel+Kotkas+Veriff",
        "message": "Hi Kaarel, Veriff’s identity verification is unmatched across global fintech. Under the EU AI Act, biometric identification systems face some of the strictest conformity checks and risk management mandates. We built a zero-retention compliance checker that helps teams pinpoint their exact classification and required action items in 2 minutes. Open to a quick look?"
    },
    {
        "id": 42,
        "name": "Lukas Kinigadner",
        "role": "Co-Founder & CEO",
        "company": "Anyline",
        "location": "Vienna, Austria",
        "sector": "Mobile Optical Character Recognition & Edge Vision",
        "act_trigger": "Edge Computer Vision & Data Governance Obligations",
        "linkedin_url": "https://www.linkedin.com/in/lukas-kinigadner-3b776822/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Lukas+Kinigadner+Anyline",
        "message": "Hi Lukas, Anyline’s edge OCR and computer vision solutions are incredible for mobility and logistics. As European clients audit mobile data capture systems under the EU AI Act, having clear compliance proofs gives you a strong commercial edge. We built a zero-retention compliance tool that maps your obligations in minutes. Let’s connect!"
    },
    {
        "id": 43,
        "name": "Andreas Bodczek",
        "role": "CEO",
        "company": "IDnow",
        "location": "Munich, Germany",
        "sector": "Identity Proofing & Video Identification AI",
        "act_trigger": "Annex III Sec 1 Biometric Verification & Facial Recognition",
        "linkedin_url": "https://www.linkedin.com/in/andreasbodczek/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Andreas+Bodczek+IDnow",
        "message": "Hi Andreas, IDnow’s identity proofing platform is a vital pillar of digital onboarding in the DACH region. Biometric verification algorithms fall under the EU AI Act’s strict High-Risk mandates, requiring continuous logging and human oversight files. We built a zero-retention compliance engine to fast-track these assessments. Would love to share details!"
    },
    {
        "id": 44,
        "name": "Kian Frossen",
        "role": "Co-Founder & CEO",
        "company": "Fourthline",
        "location": "Amsterdam, Netherlands",
        "sector": "RegTech & Biometric Identity Verification",
        "act_trigger": "Annex III Sec 1 Biometric Authentication & KYC Compliance",
        "linkedin_url": "https://www.linkedin.com/in/kianfrossen/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Kian+Frossen+Fourthline",
        "message": "Hi Kian, Fourthline’s AI KYC and fraud detection for European banks is premier grade. Given that biometric ID systems face the highest compliance burden under the EU AI Act, enterprise banks are seeking explicit conformity confirmations. We built a zero-retention compliance scanner to map Act requirements without storing user data. Open to a brief chat?"
    },
    {
        "id": 45,
        "name": "Samuel Mueller",
        "role": "Co-Founder & CEO",
        "company": "Scandit",
        "location": "Zurich, Switzerland",
        "sector": "Smart Data Capture & Computer Vision at Edge",
        "act_trigger": "Industrial Computer Vision & Enterprise Transparency",
        "linkedin_url": "https://www.linkedin.com/in/samuelmueller/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Samuel+Mueller+Scandit",
        "message": "Hi Samuel, Scandit’s edge vision algorithms capture real-world data at massive scale. As enterprise clients navigate EU AI Act compliance, demonstrating that your data capture technology adheres to EU transparency and safety rules is a major differentiator. We built a zero-retention compliance platform that diagnoses requirements in 2 minutes. Let's chat!"
    },
    {
        "id": 46,
        "name": "Robin Tombs",
        "role": "Co-Founder & CEO",
        "company": "Yoti",
        "location": "London, UK",
        "sector": "Digital Identity & Age Estimation AI",
        "act_trigger": "Annex III Sec 1 & Age Estimation Facial Biometrics",
        "linkedin_url": "https://www.linkedin.com/in/robintombs/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Robin+Tombs+Yoti",
        "message": "Hi Robin, Yoti’s privacy-first approach to digital ID and age estimation has been exemplary. Biometric analysis under the EU AI Act faces intensive regulatory scrutiny and strict audit requirements. We built an automated compliance verification tool with a zero-retention guarantee that respects your privacy architecture. Would love to exchange thoughts!"
    },
    {
        "id": 47,
        "name": "Maya Pindeus",
        "role": "Co-Founder & CEO",
        "company": "Humanising Autonomy",
        "location": "London, UK",
        "sector": "Pedestrian Behavioral AI & Computer Vision",
        "act_trigger": "Annex III Biometric Categorization & Behavior Prediction",
        "linkedin_url": "https://www.linkedin.com/in/mayapindeus/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Maya+Pindeus+Humanising+Autonomy",
        "message": "Hi Maya, Humanising Autonomy’s ethical vision for predicting human behavior in transit is fascinating. Under the EU AI Act, systems analyzing human movement in public spaces face strict biometric categorization and safety rules. We built a zero-retention compliance tool that helps teams pinpoint their risk tier in minutes without storing video feeds. Let's connect!"
    },
    {
        "id": 48,
        "name": "Jürgen Pampus",
        "role": "Co-Founder & VP Sales",
        "company": "Cognitec Systems",
        "location": "Dresden, Germany",
        "sector": "Face Recognition Technology (FaceVACS)",
        "act_trigger": "Annex III Sec 1 Biometric Identification & Border Control",
        "linkedin_url": "https://www.linkedin.com/in/juergenpampus/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Juergen+Pampus+Cognitec+Systems",
        "message": "Hi Jürgen, Cognitec’s FaceVACS algorithms have been pioneers in facial biometrics. The EU AI Act places remote biometric identification systems at the very center of High-Risk conformity and risk assessment obligations. We built an automated zero-retention compliance diagnostic that clarifies Act requirements in minutes. Open to a quick conversation?"
    },
    {
        "id": 49,
        "name": "Gaëtan Rougevin-Baville",
        "role": "Chief Executive Officer",
        "company": "Meero",
        "location": "Paris, France",
        "sector": "E-Commerce Photo Editing & Vision AI",
        "act_trigger": "Automated Content Enhancement & Art. 50 Labeling",
        "linkedin_url": "https://www.linkedin.com/in/gaetanrb/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Gaetan+Rougevin-Baville+Meero",
        "message": "Hi Gaëtan, Meero’s visual AI editing tools for marketplace photography are super impressive. Under the EU AI Act, platforms automating commercial image manipulation face new transparency and client disclosure obligations. We built a zero-retention compliance tool that verifies your systems in 60 seconds without storing image assets. Would love to share a preview!"
    },
    {
        "id": 50,
        "name": "Harry Keen",
        "role": "Co-Founder & CEO",
        "company": "Hazy",
        "location": "London, UK",
        "sector": "Synthetic Data Generation & Privacy AI",
        "act_trigger": "Training Data Governance & Synthetic AI Models",
        "linkedin_url": "https://www.linkedin.com/in/harryjkeen/",
        "search_url": "https://www.linkedin.com/search/results/people/?keywords=Harry+Keen+Hazy",
        "message": "Hi Harry, Hazy’s enterprise synthetic data platform is solving huge privacy challenges. As enterprises adopt synthetic data to train compliant AI models, proving EU AI Act alignment creates a massive competitive advantage. We built an automated zero-retention compliance tool that maps your obligations in 2 minutes. Open to connecting?"
    }
]

with open('docs/linkedin_hot_leads_50.csv', mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        "ID", "Name", "Role", "Company", "Location", "Sector", 
        "EU AI Act Trigger", "LinkedIn Profile URL", "LinkedIn Search URL", "Personalised Message"
    ])
    for item in leads:
        writer.writerow([
            item["id"], item["name"], item["role"], item["company"], item["location"],
            item["sector"], item["act_trigger"], item["linkedin_url"], item["search_url"], item["message"]
        ])

print(f"Successfully generated {len(leads)} leads into docs/linkedin_hot_leads_50.csv")
