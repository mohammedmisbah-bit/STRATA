/**
 * Static interface strings in English, Hindi and Marathi.
 *
 * These cover every fixed label in the app and switch instantly with no
 * network call. Dynamic content (alert text, AI directives) still goes through
 * the MyMemory translation service.
 *
 * `satisfies` makes a missing translation a compile error. Placeholders use
 * `{name}` and are filled by `formatUiString`.
 */

import type { LanguageCode } from "@/services/translationService";

type Entry = Record<LanguageCode, string>;

export const UI_STRINGS = {
  // --- Navigation -----------------------------------------------------------
  "nav.overview.label": { en: "Command Center", hi: "कमांड सेंटर", mr: "कमांड सेंटर" },
  "nav.overview.short": { en: "Overview", hi: "सारांश", mr: "आढावा" },
  "nav.overview.desc": {
    en: "The essential picture across geology, output, risk and planning.",
    hi: "भूविज्ञान, उत्पादन, जोखिम और योजना की मुख्य तस्वीर।",
    mr: "भूविज्ञान, उत्पादन, जोखीम आणि नियोजनाचे मुख्य चित्र.",
  },
  "nav.overview.eyebrow": { en: "Operations overview", hi: "संचालन सारांश", mr: "कामकाजाचा आढावा" },
  "nav.prospectivity.label": { en: "Prospectivity", hi: "खनिज संभावना", mr: "खनिज संभाव्यता" },
  "nav.prospectivity.short": { en: "Geology", hi: "भूविज्ञान", mr: "भूविज्ञान" },
  "nav.prospectivity.desc": {
    en: "Explore the mineral belt, spectral signals and model confidence.",
    hi: "खनिज पट्टी, स्पेक्ट्रल संकेत और मॉडल विश्वसनीयता देखें।",
    mr: "खनिज पट्टा, स्पेक्ट्रल संकेत आणि मॉडेलची विश्वासार्हता पाहा.",
  },
  "nav.prospectivity.eyebrow": {
    en: "Geospatial intelligence",
    hi: "भू-स्थानिक विश्लेषण",
    mr: "भू-स्थानिक विश्लेषण",
  },
  "nav.production.label": { en: "Production", hi: "उत्पादन", mr: "उत्पादन" },
  "nav.production.short": { en: "Output", hi: "उत्पादन", mr: "उत्पादन" },
  "nav.production.desc": {
    en: "Understand target performance, history and production drivers.",
    hi: "लक्ष्य प्रदर्शन, इतिहास और उत्पादन के कारक समझें।",
    mr: "लक्ष्य कामगिरी, इतिहास आणि उत्पादनाचे घटक समजून घ्या.",
  },
  "nav.production.eyebrow": {
    en: "Production intelligence",
    hi: "उत्पादन विश्लेषण",
    mr: "उत्पादन विश्लेषण",
  },
  "nav.risk.label": { en: "Risk Monitor", hi: "जोखिम निगरानी", mr: "जोखीम देखरेख" },
  "nav.risk.short": { en: "Risk", hi: "जोखिम", mr: "जोखीम" },
  "nav.risk.desc": {
    en: "Prioritise active issues and compare logged versus modelled impact.",
    hi: "सक्रिय समस्याओं को प्राथमिकता दें और दर्ज बनाम मॉडल प्रभाव की तुलना करें।",
    mr: "सक्रिय समस्यांना प्राधान्य द्या आणि नोंदवलेल्या व मॉडेल परिणामांची तुलना करा.",
  },
  "nav.risk.eyebrow": { en: "Operational assurance", hi: "परिचालन आश्वासन", mr: "कामकाज हमी" },
  "nav.simulator.label": {
    en: "Scenario Lab",
    hi: "परिदृश्य प्रयोगशाला",
    mr: "परिस्थिती प्रयोगशाळा",
  },
  "nav.simulator.short": { en: "Simulate", hi: "सिमुलेट", mr: "सिम्युलेट" },
  "nav.simulator.desc": {
    en: "Test downtime and rainfall, then turn the result into an action plan.",
    hi: "डाउनटाइम और वर्षा परखें, फिर परिणाम को कार्य योजना में बदलें।",
    mr: "डाउनटाइम आणि पावसाची चाचणी घ्या, नंतर निकालाचा कृती आराखडा बनवा.",
  },
  "nav.simulator.eyebrow": {
    en: "Decision simulator",
    hi: "निर्णय सिम्युलेटर",
    mr: "निर्णय सिम्युलेटर",
  },

  // --- Shell ----------------------------------------------------------------
  "shell.tagline": {
    en: "Manganese Intelligence",
    hi: "मैंगनीज़ इंटेलिजेंस",
    mr: "मँगनीज इंटेलिजन्स",
  },
  "shell.workspaces": { en: "Workspaces", hi: "कार्यक्षेत्र", mr: "कार्यक्षेत्रे" },
  "shell.skip": { en: "Skip to content", hi: "सामग्री पर जाएँ", mr: "मजकुराकडे जा" },
  "shell.openMenu": {
    en: "Open navigation menu",
    hi: "नेविगेशन मेनू खोलें",
    mr: "नेव्हिगेशन मेनू उघडा",
  },
  "shell.menuHint": {
    en: "Choose a workspace. Your mine and scenario stay selected as you move.",
    hi: "कार्यक्षेत्र चुनें। आगे बढ़ने पर आपकी खदान और परिदृश्य चयनित रहते हैं।",
    mr: "कार्यक्षेत्र निवडा. पुढे जाताना तुमची खाण आणि परिस्थिती निवडलेलीच राहते.",
  },
  "shell.language": { en: "Language", hi: "भाषा", mr: "भाषा" },
  "shell.primaryNav": { en: "Primary navigation", hi: "मुख्य नेविगेशन", mr: "मुख्य नेव्हिगेशन" },
  "shell.mobileNav": { en: "Mobile navigation", hi: "मोबाइल नेविगेशन", mr: "मोबाइल नेव्हिगेशन" },
  "shell.dataTrust": { en: "Data trust", hi: "डेटा विश्वसनीयता", mr: "डेटा विश्वासार्हता" },
  "shell.syncing": { en: "Syncing", hi: "सिंक हो रहा", mr: "सिंक होत आहे" },
  "shell.ready": { en: "Ready", hi: "तैयार", mr: "तयार" },
  "shell.mineParams": { en: "Mine parameters", hi: "खदान मानदंड", mr: "खाणीचे मापदंड" },
  "shell.moilFilings": { en: "MOIL filings", hi: "MOIL फाइलिंग", mr: "MOIL फाइलिंग" },
  "shell.analytics": { en: "Analytics", hi: "विश्लेषण", mr: "विश्लेषण" },
  "shell.modelledSynthetic": {
    en: "modelled / synthetic",
    hi: "मॉडल / कृत्रिम",
    mr: "मॉडेल / कृत्रिम",
  },
  "shell.rosterSupabase": { en: "roster Supabase", hi: "सूची Supabase", mr: "यादी Supabase" },
  "shell.rosterLocal": { en: "roster local fallback", hi: "स्थानीय सूची", mr: "स्थानिक यादी" },
  "shell.liveRoster": { en: "Live roster", hi: "लाइव सूची", mr: "थेट यादी" },
  "shell.curatedRoster": { en: "Curated roster", hi: "संकलित सूची", mr: "संकलित यादी" },
  "shell.footer": {
    en: "Ground truth, geospatial context and scenario intelligence in one workspace.",
    hi: "एक कार्यक्षेत्र में आधिकारिक तथ्य, भू-स्थानिक संदर्भ और परिदृश्य विश्लेषण।",
    mr: "एकाच कार्यक्षेत्रात अधिकृत तथ्ये, भू-स्थानिक संदर्भ आणि परिस्थिती विश्लेषण.",
  },
  "shell.loading": {
    en: "Loading analysis…",
    hi: "विश्लेषण लोड हो रहा है…",
    mr: "विश्लेषण लोड होत आहे…",
  },
  "shell.activeMine": { en: "Active mine site", hi: "सक्रिय खदान", mr: "सक्रिय खाण" },
  "shell.live": { en: "Live", hi: "लाइव", mr: "थेट" },
  "shell.curated": { en: "Curated", hi: "संकलित", mr: "संकलित" },

  // --- Provenance -----------------------------------------------------------
  "prov.official": { en: "Official MOIL NSE", hi: "आधिकारिक MOIL NSE", mr: "अधिकृत MOIL NSE" },
  "prov.modelled": { en: "Modelled", hi: "मॉडल आधारित", mr: "मॉडेल आधारित" },
  "prov.simulated": { en: "Simulated", hi: "सिम्युलेटेड", mr: "सिम्युलेटेड" },
  "prov.synthetic": { en: "Synthetic PRNG", hi: "कृत्रिम PRNG", mr: "कृत्रिम PRNG" },
  "prov.satellite": {
    en: "Sentinel-2 derived",
    hi: "सेंटिनल-2 आधारित",
    mr: "सेंटिनेल-2 आधारित",
  },

  // --- Shared metric words ----------------------------------------------------
  "common.attainment": { en: "Attainment", hi: "प्राप्ति", mr: "साध्यता" },
  "common.target": { en: "Target", hi: "लक्ष्य", mr: "लक्ष्य" },
  "common.actual": { en: "Actual", hi: "वास्तविक", mr: "प्रत्यक्ष" },
  "common.projected": { en: "Projected", hi: "अनुमानित", mr: "अंदाजित" },
  "common.shortfall": { en: "Shortfall", hi: "कमी", mr: "तूट" },
  "common.none": { en: "None", hi: "कोई नहीं", mr: "काहीही नाही" },
  "common.months": { en: "months", hi: "माह", mr: "महिने" },
  "common.step": { en: "STEP", hi: "चरण", mr: "पायरी" },
  "common.risk": { en: "risk", hi: "जोखिम", mr: "जोखीम" },

  // --- KPI strip --------------------------------------------------------------
  "kpi.monthlyTarget": { en: "Monthly target", hi: "मासिक लक्ष्य", mr: "मासिक लक्ष्य" },
  "kpi.prospectivityCaption": {
    en: "{mine} · prospectivity {score}",
    hi: "{mine} · संभावना {score}",
    mr: "{mine} · संभाव्यता {score}",
  },
  "kpi.forecastOutput": { en: "Forecast output", hi: "अनुमानित उत्पादन", mr: "अंदाजित उत्पादन" },
  "kpi.forecastCaption": {
    en: "Updates as scenario inputs change",
    hi: "परिदृश्य इनपुट बदलने पर अपडेट होता है",
    mr: "परिस्थिती इनपुट बदलल्यावर अद्ययावत होते",
  },
  "kpi.projectedDeficit": { en: "Projected deficit", hi: "अनुमानित कमी", mr: "अंदाजित तूट" },
  "kpi.modelledLoss": {
    en: "Modelled loss −{tonnes} T",
    hi: "मॉडल आधारित हानि −{tonnes} T",
    mr: "मॉडेल आधारित तोटा −{tonnes} T",
  },
  "kpi.activeAlerts": {
    en: "Active risk alerts",
    hi: "सक्रिय जोखिम अलर्ट",
    mr: "सक्रिय जोखीम सूचना",
  },
  "kpi.noAlerts": {
    en: "No open alerts",
    hi: "कोई खुला अलर्ट नहीं",
    mr: "कोणतीही खुली सूचना नाही",
  },
  "kpi.highestSeverity": {
    en: "Highest severity: {level}",
    hi: "उच्चतम गंभीरता: {level}",
    mr: "सर्वोच्च तीव्रता: {level}",
  },

  // --- Overview ---------------------------------------------------------------
  "overview.eyebrow": {
    en: "Operations command center",
    hi: "संचालन कमांड सेंटर",
    mr: "कामकाज कमांड सेंटर",
  },
  "overview.title": {
    en: "See the whole operation. Know where to act.",
    hi: "पूरा संचालन देखें। जानें कहाँ कार्य करना है।",
    mr: "संपूर्ण कामकाज पाहा. कुठे कृती करायची ते जाणा.",
  },
  "overview.desc": {
    en: "A plain-language view of geology, production, risk and recovery options for {mine}. Start here, then open any workspace for deeper analysis.",
    hi: "{mine} के लिए भूविज्ञान, उत्पादन, जोखिम और रिकवरी विकल्पों का सरल विवरण। यहाँ से शुरू करें, फिर गहन विश्लेषण के लिए कोई भी कार्यक्षेत्र खोलें।",
    mr: "{mine} साठी भूविज्ञान, उत्पादन, जोखीम आणि सुधारणा पर्यायांचे सोपे चित्र. येथून सुरुवात करा, नंतर सखोल विश्लेषणासाठी कोणतेही कार्यक्षेत्र उघडा.",
  },
  "overview.scenarioRisk": {
    en: "Scenario risk: {level}",
    hi: "परिदृश्य जोखिम: {level}",
    mr: "परिस्थिती जोखीम: {level}",
  },
  "overview.testScenario": { en: "Test a scenario", hi: "परिदृश्य परखें", mr: "परिस्थिती तपासा" },
  "overview.exploreGeology": { en: "Explore geology", hi: "भूविज्ञान देखें", mr: "भूविज्ञान पाहा" },
  "overview.decisionBrief": { en: "Decision Brief", hi: "निर्णय सारांश", mr: "निर्णय सारांश" },
  "overview.decisionBriefDesc": {
    en: "What the current scenario means in practical operating terms.",
    hi: "वर्तमान परिदृश्य का व्यावहारिक संचालन में क्या अर्थ है।",
    mr: "सध्याच्या परिस्थितीचा प्रत्यक्ष कामकाजात काय अर्थ आहे.",
  },
  "overview.forecastOutcome": {
    en: "Forecast outcome",
    hi: "पूर्वानुमान परिणाम",
    mr: "अंदाजित निकाल",
  },
  "overview.projectedMonthly": {
    en: "Projected monthly output",
    hi: "अनुमानित मासिक उत्पादन",
    mr: "अंदाजित मासिक उत्पादन",
  },
  "overview.attainmentBadge": {
    en: "{pct} attainment",
    hi: "{pct} प्राप्ति",
    mr: "{pct} साध्यता",
  },
  "overview.nextMoves": {
    en: "Recommended next moves",
    hi: "अनुशंसित अगले कदम",
    mr: "शिफारस केलेली पुढील पावले",
  },
  "overview.openLab": {
    en: "Open the full Scenario Lab",
    hi: "पूरी परिदृश्य प्रयोगशाला खोलें",
    mr: "संपूर्ण परिस्थिती प्रयोगशाळा उघडा",
  },
  "overview.workspacesEyebrow": {
    en: "Purpose-built workspaces",
    hi: "उद्देश-आधारित कार्यक्षेत्र",
    mr: "उद्देशानुसार कार्यक्षेत्रे",
  },
  "overview.workspacesTitle": {
    en: "Go deeper only when you need to",
    hi: "ज़रूरत हो तभी गहराई में जाएँ",
    mr: "गरज असेल तेव्हाच सखोल जा",
  },
  "overview.workspacesDesc": {
    en: "Each page focuses on one job, with short explanations for every specialist metric.",
    hi: "हर पृष्ठ एक काम पर केंद्रित है और हर विशेषज्ञ मीट्रिक की संक्षिप्त व्याख्या देता है।",
    mr: "प्रत्येक पान एकाच कामावर केंद्रित आहे आणि प्रत्येक तज्ज्ञ निर्देशकाचे थोडक्यात स्पष्टीकरण देते.",
  },
  "overview.openWorkspace": {
    en: "Open workspace",
    hi: "कार्यक्षेत्र खोलें",
    mr: "कार्यक्षेत्र उघडा",
  },
  "overview.footnote": {
    en: "Official mine parameters come from MOIL SEBI / NSE filings; model outputs remain clearly labelled.",
    hi: "आधिकारिक खदान मानदंड MOIL SEBI / NSE फाइलिंग से हैं; मॉडल परिणाम स्पष्ट रूप से चिह्नित हैं।",
    mr: "अधिकृत खाण मापदंड MOIL SEBI / NSE फाइलिंगमधून आहेत; मॉडेल निकाल स्पष्टपणे चिन्हांकित आहेत.",
  },
  "overview.activeSite": {
    en: "Active site: {mine}",
    hi: "सक्रिय स्थल: {mine}",
    mr: "सक्रिय स्थळ: {mine}",
  },
  "overview.liveRoster": { en: "Live mine roster", hi: "लाइव खदान सूची", mr: "थेट खाण यादी" },
  "overview.curatedRoster": {
    en: "Curated mine roster",
    hi: "संकलित खदान सूची",
    mr: "संकलित खाण यादी",
  },

  // --- Prospectivity page -----------------------------------------------------
  "pros.title": {
    en: "Read the mineral system around {mine}.",
    hi: "{mine} के आसपास की खनिज प्रणाली समझें।",
    mr: "{mine} भोवतालची खनिज प्रणाली समजून घ्या.",
  },
  "pros.desc": {
    en: "Combine geological context, remote-sensing indicators and uncertainty—not just a single score—to understand where further investigation is most defensible.",
    hi: "केवल एक स्कोर नहीं—भूवैज्ञानिक संदर्भ, रिमोट-सेंसिंग संकेत और अनिश्चितता को मिलाकर समझें कि आगे की जाँच कहाँ सबसे उचित है।",
    mr: "केवळ एका गुणांकावर नव्हे—भूवैज्ञानिक संदर्भ, रिमोट-सेन्सिंग संकेत आणि अनिश्चितता एकत्र करून पुढील तपास कुठे सर्वात योग्य आहे ते समजून घ्या.",
  },
  "pros.score": { en: "Score {score}", hi: "स्कोर {score}", mr: "गुणांक {score}" },
  "pros.grid": { en: "Grid {grid}", hi: "ग्रिड {grid}", mr: "ग्रिड {grid}" },
  "pros.overlaySimulated": {
    en: "Overlay geometry: simulated",
    hi: "ओवरले ज्यामिति: सिम्युलेटेड",
    mr: "ओव्हरले भूमिती: सिम्युलेटेड",
  },
  "pros.m.score": { en: "Prospectivity score", hi: "संभावना स्कोर", mr: "संभाव्यता गुणांक" },
  "pros.m.scoreDesc": {
    en: "Relative model score from 0 to 1; higher values indicate stronger combined evidence.",
    hi: "0 से 1 तक सापेक्ष मॉडल स्कोर; अधिक मान अधिक मज़बूत संयुक्त प्रमाण दर्शाता है।",
    mr: "0 ते 1 सापेक्ष मॉडेल गुणांक; जास्त मूल्य अधिक भक्कम एकत्रित पुरावा दर्शवते.",
  },
  "pros.m.confidence": {
    en: "Confidence proxy",
    hi: "विश्वसनीयता सूचक",
    mr: "विश्वासार्हता निर्देशक",
  },
  "pros.m.confidenceDesc": {
    en: "Calculated from bootstrap variance ±{variance}.",
    hi: "बूटस्ट्रैप विचरण ±{variance} से गणना।",
    mr: "बूटस्ट्रॅप विचलन ±{variance} वरून मोजले.",
  },
  "pros.m.spectral": {
    en: "Spectral indicators",
    hi: "स्पेक्ट्रल संकेतक",
    mr: "स्पेक्ट्रल निर्देशक",
  },
  "pros.m.spectralDesc": {
    en: "Independent surface indicators available for cross-checking this site.",
    hi: "इस स्थल की पुष्टि के लिए उपलब्ध स्वतंत्र सतही संकेतक।",
    mr: "या स्थळाची पडताळणी करण्यासाठी उपलब्ध स्वतंत्र पृष्ठभाग निर्देशक.",
  },
  "pros.m.beacons": { en: "Mapped beacons", hi: "मानचित्रित बीकन", mr: "नकाशावरील बीकन" },
  "pros.m.beaconsDesc": {
    en: "Operational or prospectivity points shown around the active mine.",
    hi: "सक्रिय खदान के आसपास दिखाए गए परिचालन या संभावना बिंदु।",
    mr: "सक्रिय खाणीभोवती दाखवलेले कामकाज किंवा संभाव्यता बिंदू.",
  },
  "pros.guide.title": {
    en: "A Simple Reading Order",
    hi: "पढ़ने का सरल क्रम",
    mr: "वाचनाचा सोपा क्रम",
  },
  "pros.guide.desc": {
    en: "Three steps for non-specialists reviewing the evidence.",
    hi: "प्रमाण देखने वाले गैर-विशेषज्ञों के लिए तीन चरण।",
    mr: "पुरावा तपासणाऱ्या गैर-तज्ज्ञांसाठी तीन पायऱ्या.",
  },
  "pros.guide.1.title": {
    en: "Start with the map",
    hi: "मानचित्र से शुरू करें",
    mr: "नकाशापासून सुरुवात करा",
  },
  "pros.guide.1.desc": {
    en: "Use the overlay to see where mapped host lithology and lineaments meet the mine area.",
    hi: "ओवरले से देखें कि मानचित्रित मेज़बान शैल और रेखीय संरचनाएँ खदान क्षेत्र से कहाँ मिलती हैं।",
    mr: "ओव्हरले वापरून नकाशावरील यजमान खडक आणि रेखीय रचना खाण क्षेत्राला कुठे मिळतात ते पाहा.",
  },
  "pros.guide.2.title": {
    en: "Check satellite signals",
    hi: "उपग्रह संकेत जाँचें",
    mr: "उपग्रह संकेत तपासा",
  },
  "pros.guide.2.desc": {
    en: "Open Spectral Layers to compare iron oxide, alteration and topographic lineaments.",
    hi: "आयरन ऑक्साइड, परिवर्तन और स्थलाकृतिक रेखाओं की तुलना के लिए स्पेक्ट्रल लेयर्स खोलें।",
    mr: "आयर्न ऑक्साइड, बदल आणि भूरचनात्मक रेषांची तुलना करण्यासाठी स्पेक्ट्रल स्तर उघडा.",
  },
  "pros.guide.3.title": {
    en: "Read confidence last",
    hi: "विश्वसनीयता अंत में देखें",
    mr: "विश्वासार्हता शेवटी पाहा",
  },
  "pros.guide.3.desc": {
    en: "A high score with a narrow confidence interval is stronger than a score alone.",
    hi: "संकीर्ण विश्वास अंतराल के साथ उच्च स्कोर, अकेले स्कोर से अधिक मज़बूत है।",
    mr: "अरुंद विश्वास अंतरालासह उच्च गुणांक केवळ गुणांकापेक्षा अधिक भक्कम असतो.",
  },
  "pros.disclaimer": {
    en: "This workspace supports screening and interpretation. It is not a substitute for field mapping, drilling or a competent-person estimate.",
    hi: "यह कार्यक्षेत्र जाँच और व्याख्या में सहायक है। यह क्षेत्रीय मानचित्रण, ड्रिलिंग या सक्षम-व्यक्ति आकलन का विकल्प नहीं है।",
    mr: "हे कार्यक्षेत्र प्राथमिक तपासणी आणि अर्थ लावण्यास मदत करते. ते क्षेत्रीय नकाशांकन, ड्रिलिंग किंवा सक्षम-व्यक्ती अंदाजाचा पर्याय नाही.",
  },

  "pros.satelliteBadge": {
    en: "Sentinel-2 · {window}",
    hi: "सेंटिनल-2 · {window}",
    mr: "सेंटिनेल-2 · {window}",
  },
  "pros.m.intervalDesc": {
    en: "95% bootstrap interval {lo}–{hi} across {runs} model runs.",
    hi: "{runs} मॉडल रन में 95% बूटस्ट्रैप अंतराल {lo}–{hi}।",
    mr: "{runs} मॉडेल रनमध्ये 95% बूटस्ट्रॅप अंतराल {lo}–{hi}.",
  },
  "pros.m.targets": {
    en: "Greenfield targets",
    hi: "नए लक्ष्य क्षेत्र",
    mr: "नवीन लक्ष्य क्षेत्रे",
  },
  "pros.m.targetsDesc": {
    en: "Clusters in the belt's top 1% that are at least 3 km from a known mine.",
    hi: "पट्टी के शीर्ष 1% में आने वाले समूह, जो किसी ज्ञात खदान से कम से कम 3 km दूर हैं।",
    mr: "पट्ट्याच्या शीर्ष 1% मधील समूह, जे ज्ञात खाणीपासून किमान 3 km दूर आहेत.",
  },

  // --- Model validation -----------------------------------------------------------
  "val.title": {
    en: "Does the Model Actually Work?",
    hi: "क्या मॉडल वास्तव में काम करता है?",
    mr: "मॉडेल खरोखर काम करते का?",
  },
  "val.desc": {
    en: "Each known mine was hidden from training in turn. A good model should still rank the hidden mine's surroundings highly.",
    hi: "हर ज्ञात खदान को बारी-बारी से प्रशिक्षण से छिपाया गया। अच्छे मॉडल को फिर भी छिपी खदान के आसपास को ऊँचा आँकना चाहिए।",
    mr: "प्रत्येक ज्ञात खाण क्रमाने प्रशिक्षणातून लपवली गेली. चांगल्या मॉडेलने तरीही लपवलेल्या खाणीच्या परिसराला उच्च गुण द्यायला हवेत.",
  },
  "val.meanAuc": {
    en: "Held-out AUC (Random Forest)",
    hi: "छिपी खदान पर AUC (रैंडम फ़ॉरेस्ट)",
    mr: "लपवलेल्या खाणीवर AUC (रँडम फॉरेस्ट)",
  },
  "val.baseline": {
    en: "Simple band-ratio index",
    hi: "साधारण बैंड-अनुपात सूचकांक",
    mr: "साधा बँड-गुणोत्तर निर्देशांक",
  },
  "val.scale": {
    en: "0.50 is a coin flip, 1.00 is perfect.",
    hi: "0.50 सिक्का उछालने जैसा है, 1.00 पूर्ण है।",
    mr: "0.50 म्हणजे नाणेफेक, 1.00 म्हणजे परिपूर्ण.",
  },
  "val.col.mine": { en: "Hidden mine", hi: "छिपी खदान", mr: "लपवलेली खाण" },
  "val.col.auc": { en: "Model AUC", hi: "मॉडल AUC", mr: "मॉडेल AUC" },
  "val.col.baseline": { en: "Index AUC", hi: "सूचकांक AUC", mr: "निर्देशांक AUC" },
  "val.col.rank": {
    en: "Ranked in belt",
    hi: "पट्टी में स्थान",
    mr: "पट्ट्यातील स्थान",
  },
  "val.rank": { en: "top {pct}%", hi: "शीर्ष {pct}%", mr: "शीर्ष {pct}%" },
  "val.withNeighbour": {
    en: "held out with {mines}",
    hi: "{mines} के साथ छिपाई गई",
    mr: "{mines} सोबत लपवली",
  },
  "val.features": {
    en: "What the model relies on",
    hi: "मॉडल किन संकेतों पर निर्भर है",
    mr: "मॉडेल कोणत्या संकेतांवर अवलंबून आहे",
  },
  "val.caveat": {
    en: "Six labelled deposits is a small training set, and results vary by mine (Kandri is ranked poorly). Treat the heatmap as a screening layer to prioritise field mapping, not as proof of ore.",
    hi: "छह चिह्नित भंडार एक छोटा प्रशिक्षण समूह है और परिणाम खदान के अनुसार बदलते हैं (कांद्री का स्थान कमज़ोर है)। हीटमैप को क्षेत्रीय मानचित्रण की प्राथमिकता तय करने वाली परत मानें, अयस्क का प्रमाण नहीं।",
    mr: "सहा चिन्हांकित साठे हा लहान प्रशिक्षण संच आहे आणि निकाल खाणीनुसार बदलतात (कांद्रीचे स्थान कमकुवत आहे). हीटमॅपला क्षेत्रीय नकाशांकनाचा प्राधान्यक्रम ठरवणारा स्तर माना, धातुकाचा पुरावा नव्हे.",
  },
  "val.liveCells": {
    en: "{count} grid cells live in Supabase",
    hi: "Supabase में {count} ग्रिड सेल लाइव",
    mr: "Supabase मध्ये {count} ग्रिड सेल थेट",
  },
  "val.liveCellsOffline": {
    en: "Grid database unreachable · showing bundled results",
    hi: "ग्रिड डेटाबेस उपलब्ध नहीं · संग्रहीत परिणाम दिखाए जा रहे हैं",
    mr: "ग्रिड डेटाबेस उपलब्ध नाही · साठवलेले निकाल दाखवत आहे",
  },
  "val.generated": {
    en: "Pipeline run {date} · {obs} clear observations per pixel (median)",
    hi: "पाइपलाइन रन {date} · प्रति पिक्सेल {obs} साफ़ अवलोकन (माध्यिका)",
    mr: "पाइपलाइन रन {date} · प्रति पिक्सेल {obs} स्वच्छ निरीक्षणे (मध्यक)",
  },

  // --- Greenfield targets ---------------------------------------------------------
  "targets.title": {
    en: "Greenfield Targets",
    hi: "नए लक्ष्य क्षेत्र",
    mr: "नवीन लक्ष्य क्षेत्रे",
  },
  "targets.desc": {
    en: "Highest-scoring clusters away from existing mines, ranked by score and size.",
    hi: "मौजूदा खदानों से दूर सबसे अधिक स्कोर वाले समूह, स्कोर और आकार के अनुसार क्रमबद्ध।",
    mr: "सध्याच्या खाणींपासून दूर सर्वाधिक गुण असलेले समूह, गुण आणि आकारानुसार क्रमवार.",
  },
  "targets.near": {
    en: "{km} km from {mine}",
    hi: "{mine} से {km} km",
    mr: "{mine} पासून {km} km",
  },
  "targets.show": { en: "Show on map", hi: "मानचित्र पर दिखाएँ", mr: "नकाशावर दाखवा" },
  "targets.showLabel": {
    en: "Show target {id} on the map",
    hi: "लक्ष्य {id} मानचित्र पर दिखाएँ",
    mr: "लक्ष्य {id} नकाशावर दाखवा",
  },

  // --- Explorer / map ---------------------------------------------------------
  "map.heatmapToggle": {
    en: "Sentinel-2 prospectivity",
    hi: "सेंटिनल-2 संभावना",
    mr: "सेंटिनेल-2 संभाव्यता",
  },
  "map.heatmapLegend": {
    en: "Prospectivity score (relative)",
    hi: "संभावना स्कोर (सापेक्ष)",
    mr: "संभाव्यता गुणांक (सापेक्ष)",
  },
  "map.clickHint": {
    en: "Click the map to inspect a 500 m cell",
    hi: "500 m सेल देखने के लिए मानचित्र पर क्लिक करें",
    mr: "500 m सेल तपासण्यासाठी नकाशावर क्लिक करा",
  },
  "map.cell.title": {
    en: "500 m cell · live from Supabase",
    hi: "500 m सेल · Supabase से लाइव",
    mr: "500 m सेल · Supabase मधून थेट",
  },
  "map.cell.loading": {
    en: "Loading cell…",
    hi: "सेल लोड हो रहा है…",
    mr: "सेल लोड होत आहे…",
  },
  "map.cell.none": {
    en: "No grid cell here (water, persistent cloud or outside the belt).",
    hi: "यहाँ कोई ग्रिड सेल नहीं (पानी, लगातार बादल या पट्टी के बाहर)।",
    mr: "येथे ग्रिड सेल नाही (पाणी, सततचे ढग किंवा पट्ट्याबाहेर).",
  },
  "map.cell.error": {
    en: "Couldn't reach the grid database.",
    hi: "ग्रिड डेटाबेस तक नहीं पहुँच सके।",
    mr: "ग्रिड डेटाबेसपर्यंत पोहोचता आले नाही.",
  },
  "map.cell.score": { en: "Score", hi: "स्कोर", mr: "गुणांक" },
  "map.cell.interval": { en: "95% interval", hi: "95% अंतराल", mr: "95% अंतराल" },
  "map.cell.ironClay": {
    en: "Iron × clay index",
    hi: "आयरन × क्ले सूचकांक",
    mr: "आयर्न × क्ले निर्देशांक",
  },
  "map.cell.slope": { en: "Slope", hi: "ढलान", mr: "उतार" },
  "explorer.title": {
    en: "Prospectivity Spatial Explorer",
    hi: "संभावना स्थानिक एक्सप्लोरर",
    mr: "संभाव्यता स्थानिक एक्सप्लोरर",
  },
  "explorer.desc": {
    en: "Move between mapped geology, satellite indicators and model confidence without losing your place.",
    hi: "अपनी जगह खोए बिना भूविज्ञान मानचित्र, उपग्रह संकेतकों और मॉडल विश्वसनीयता के बीच जाएँ।",
    mr: "तुमची जागा न गमावता भूविज्ञान नकाशा, उपग्रह निर्देशक आणि मॉडेल विश्वासार्हता यांच्यात फिरा.",
  },
  "explorer.tabsLabel": {
    en: "Prospectivity explorer view",
    hi: "संभावना एक्सप्लोरर दृश्य",
    mr: "संभाव्यता एक्सप्लोरर दृश्य",
  },
  "view.map": { en: "Map Mode", hi: "मानचित्र मोड", mr: "नकाशा मोड" },
  "view.map.desc": {
    en: "High-density GIS risk map",
    hi: "विस्तृत GIS जोखिम मानचित्र",
    mr: "सविस्तर GIS जोखीम नकाशा",
  },
  "view.spectral": { en: "Spectral Layers", hi: "स्पेक्ट्रल लेयर्स", mr: "स्पेक्ट्रल स्तर" },
  "view.spectral.desc": {
    en: "Band ratio breakdown",
    hi: "बैंड अनुपात विश्लेषण",
    mr: "बँड गुणोत्तर विश्लेषण",
  },
  "view.confidence": { en: "Confidence Bounds", hi: "विश्वास सीमाएँ", mr: "विश्वास मर्यादा" },
  "view.confidence.desc": {
    en: "Bootstrap 95% intervals",
    hi: "बूटस्ट्रैप 95% अंतराल",
    mr: "बूटस्ट्रॅप 95% अंतराल",
  },
  "map.toggle": {
    en: "[ Toggle NGDR Geological Overlay ]",
    hi: "[ NGDR भूवैज्ञानिक ओवरले टॉगल करें ]",
    mr: "[ NGDR भूवैज्ञानिक ओव्हरले टॉगल करा ]",
  },
  "map.toggleShort": { en: "Geology overlay", hi: "भूविज्ञान ओवरले", mr: "भूविज्ञान ओव्हरले" },
  "map.on": { en: "(on)", hi: "(चालू)", mr: "(सुरू)" },
  "map.off": { en: "(off)", hi: "(बंद)", mr: "(बंद)" },
  "map.loading": { en: "Loading map…", hi: "मानचित्र लोड हो रहा है…", mr: "नकाशा लोड होत आहे…" },
  "map.webgl": {
    en: "The map needs WebGL, which isn't available in this browser. Mine coordinates are listed below.",
    hi: "मानचित्र के लिए WebGL आवश्यक है, जो इस ब्राउज़र में उपलब्ध नहीं है। खदान निर्देशांक नीचे दिए गए हैं।",
    mr: "नकाशासाठी WebGL आवश्यक आहे, जे या ब्राउझरमध्ये उपलब्ध नाही. खाणींचे निर्देशांक खाली दिले आहेत.",
  },
  "map.legend": {
    en: "NGDR / GSI Bhukosh · simulated",
    hi: "NGDR / GSI भूकोश · सिम्युलेटेड",
    mr: "NGDR / GSI भूकोश · सिम्युलेटेड",
  },
  "map.groundTruth": { en: "Ground truth", hi: "आधिकारिक तथ्य", mr: "अधिकृत तथ्य" },
  "map.basemapFailed": {
    en: "Basemap tiles didn't load (network or tile host blocked). Geology overlay and mine markers are still shown.",
    hi: "बेसमैप टाइल लोड नहीं हुईं (नेटवर्क या टाइल सर्वर अवरुद्ध)। भूविज्ञान ओवरले और खदान चिह्न फिर भी दिख रहे हैं।",
    mr: "बेसमॅप टाइल लोड झाल्या नाहीत (नेटवर्क किंवा टाइल सर्व्हर अवरोधित). भूविज्ञान ओव्हरले आणि खाण चिन्हे तरीही दिसत आहेत.",
  },
  "map.region": {
    en: "Map of {belt}, centred on {mine}",
    hi: "{belt} का मानचित्र, केंद्र {mine}",
    mr: "{belt} चा नकाशा, केंद्र {mine}",
  },
  "map.selected": { en: "(selected)", hi: "(चयनित)", mr: "(निवडलेले)" },
  "map.sources": { en: "Data Sources:", hi: "डेटा स्रोत:", mr: "डेटा स्रोत:" },
  "map.overlayNote": {
    en: "Overlay geometry is a simulated approximation of the GSI / NGDR layers, not digitised vectors.",
    hi: "ओवरले ज्यामिति GSI / NGDR परतों का सिम्युलेटेड अनुमान है, डिजिटाइज़्ड वेक्टर नहीं।",
    mr: "ओव्हरले भूमिती GSI / NGDR स्तरांचा सिम्युलेटेड अंदाज आहे, डिजिटाइझ्ड व्हेक्टर नाहीत.",
  },
  "confidence.heading": {
    en: "Prospectivity Score Confidence Intervals (95% CI) · {mine}",
    hi: "संभावना स्कोर विश्वास अंतराल (95% CI) · {mine}",
    mr: "संभाव्यता गुणांक विश्वास अंतराल (95% CI) · {mine}",
  },
  "confidence.variance": {
    en: "Bootstrap variance ± {variance}",
    hi: "बूटस्ट्रैप विचरण ± {variance}",
    mr: "बूटस्ट्रॅप विचलन ± {variance}",
  },
  "confidence.empty": {
    en: "No bootstrap predictions available for {mine}.",
    hi: "{mine} के लिए कोई बूटस्ट्रैप पूर्वानुमान उपलब्ध नहीं।",
    mr: "{mine} साठी बूटस्ट्रॅप अंदाज उपलब्ध नाहीत.",
  },
  "spectral.empty": {
    en: "No spectral layers available for {mine}.",
    hi: "{mine} के लिए कोई स्पेक्ट्रल लेयर उपलब्ध नहीं।",
    mr: "{mine} साठी स्पेक्ट्रल स्तर उपलब्ध नाहीत.",
  },

  // --- Ground truth -----------------------------------------------------------
  "gt.title": { en: "Mine Ground Truth", hi: "खदान के आधिकारिक तथ्य", mr: "खाणीची अधिकृत तथ्ये" },
  "gt.desc": {
    en: "The stable site facts used across every model and analysis page.",
    hi: "हर मॉडल और विश्लेषण पृष्ठ में प्रयुक्त स्थिर स्थल तथ्य।",
    mr: "प्रत्येक मॉडेल व विश्लेषण पानात वापरलेली स्थिर स्थळ तथ्ये.",
  },
  "gt.depth": { en: "Working depth", hi: "कार्य गहराई", mr: "कार्यरत खोली" },
  "gt.ore": { en: "Ore character", hi: "अयस्क प्रकार", mr: "धातुकाचा प्रकार" },
  "gt.setting": { en: "Mine setting", hi: "खदान स्थान", mr: "खाणीचे स्थान" },
  "gt.location": { en: "Reference location", hi: "संदर्भ स्थान", mr: "संदर्भ स्थान" },
  "gt.centroid": { en: "approximate centroid", hi: "अनुमानित केंद्र", mr: "अंदाजे केंद्र" },
  "gt.underground": { en: "Underground workings", hi: "भूमिगत कार्य", mr: "भूमिगत काम" },
  "gt.opencast": {
    en: "Opencast / transition",
    hi: "खुली खदान / संक्रमण",
    mr: "खुली खाण / संक्रमण",
  },
  "gt.operation": {
    en: "{type} manganese operation",
    hi: "{type} मैंगनीज़ संचालन",
    mr: "{type} मँगनीज कामकाज",
  },
  "gt.source": { en: "Ground-truth source:", hi: "आधिकारिक स्रोत:", mr: "अधिकृत स्रोत:" },
  "gt.depthNote": {
    en: "Depths are approximate and should be checked against the latest annual disclosure before formal reporting.",
    hi: "गहराई अनुमानित है; औपचारिक रिपोर्टिंग से पहले नवीनतम वार्षिक प्रकटीकरण से जाँच करें।",
    mr: "खोली अंदाजे आहे; औपचारिक अहवालापूर्वी नवीनतम वार्षिक प्रकटीकरणाशी तपासा.",
  },

  // --- Production -------------------------------------------------------------
  "prod.title": {
    en: "Turn {mine} output history into a clearer plan.",
    hi: "{mine} के उत्पादन इतिहास को स्पष्ट योजना में बदलें।",
    mr: "{mine} च्या उत्पादन इतिहासाचे स्पष्ट योजनेत रूपांतर करा.",
  },
  "prod.desc": {
    en: "Compare target and actual output, inspect day-level drivers, and keep the current operating scenario visible beside the historical pattern.",
    hi: "लक्ष्य और वास्तविक उत्पादन की तुलना करें, दैनिक कारकों की जाँच करें और ऐतिहासिक पैटर्न के साथ वर्तमान परिदृश्य देखें।",
    mr: "लक्ष्य आणि प्रत्यक्ष उत्पादनाची तुलना करा, दैनिक घटक तपासा आणि ऐतिहासिक नमुन्यासोबत सध्याची परिस्थिती पाहा.",
  },
  "prod.fyAttainment": {
    en: "FY attainment {pct}",
    hi: "वित्त वर्ष प्राप्ति {pct}",
    mr: "आर्थिक वर्ष साध्यता {pct}",
  },
  "prod.observations": {
    en: "{count} monthly observations",
    hi: "{count} मासिक अवलोकन",
    mr: "{count} मासिक निरीक्षणे",
  },
  "prod.dailySynthetic": {
    en: "Daily log: deterministic synthetic data",
    hi: "दैनिक लॉग: निर्धारित कृत्रिम डेटा",
    mr: "दैनिक नोंद: निश्चित कृत्रिम डेटा",
  },
  "prod.m.actual": { en: "Historical actual", hi: "ऐतिहासिक वास्तविक", mr: "ऐतिहासिक प्रत्यक्ष" },
  "prod.m.actualDesc": {
    en: "Total across {count} fiscal-month observations.",
    hi: "{count} वित्तीय-माह अवलोकनों का कुल।",
    mr: "{count} आर्थिक-महिन्यांच्या निरीक्षणांची एकूण बेरीज.",
  },
  "prod.m.target": { en: "Historical target", hi: "ऐतिहासिक लक्ष्य", mr: "ऐतिहासिक लक्ष्य" },
  "prod.m.targetDesc": {
    en: "Aggregate target represented by the local trend fixture.",
    hi: "स्थानीय ट्रेंड डेटा द्वारा दर्शाया गया कुल लक्ष्य।",
    mr: "स्थानिक कल डेटाद्वारे दर्शवलेले एकूण लक्ष्य.",
  },
  "prod.m.below": { en: "Below target", hi: "लक्ष्य से कम", mr: "लक्ष्यापेक्षा कमी" },
  "prod.m.belowDesc": {
    en: "Months where recorded actual output did not reach the target line.",
    hi: "वे महीने जिनमें दर्ज वास्तविक उत्पादन लक्ष्य तक नहीं पहुँचा।",
    mr: "ज्या महिन्यांत नोंदवलेले प्रत्यक्ष उत्पादन लक्ष्यापर्यंत पोहोचले नाही.",
  },
  "prod.m.best": { en: "Strongest month", hi: "सर्वश्रेष्ठ माह", mr: "सर्वोत्तम महिना" },
  "prod.m.bestDesc": {
    en: "Highest actual output in the available twelve-month series.",
    hi: "उपलब्ध बारह-माह श्रृंखला में सर्वाधिक वास्तविक उत्पादन।",
    mr: "उपलब्ध बारा-महिन्यांच्या मालिकेतील सर्वाधिक प्रत्यक्ष उत्पादन.",
  },
  "prod.howTo": {
    en: "How to read this page:",
    hi: "इस पृष्ठ को कैसे पढ़ें:",
    mr: "हे पान कसे वाचावे:",
  },
  "prod.howToBody": {
    en: "the monthly chart is a planning fixture, while the day-level table is a seeded dataset designed to preserve a realistic relationship between rainfall, downtime and output.",
    hi: "मासिक चार्ट एक योजना डेटा है, जबकि दैनिक तालिका एक सीडेड डेटासेट है जो वर्षा, डाउनटाइम और उत्पादन के बीच वास्तविक संबंध बनाए रखती है।",
    mr: "मासिक तक्ता नियोजन डेटा आहे, तर दैनिक सारणी हा सीडेड डेटासेट आहे जो पाऊस, डाउनटाइम आणि उत्पादन यांतील वास्तववादी संबंध जपतो.",
  },
  "prod.currentScenario": {
    en: "Current scenario: {tonnes} T · {pct}",
    hi: "वर्तमान परिदृश्य: {tonnes} T · {pct}",
    mr: "सध्याची परिस्थिती: {tonnes} T · {pct}",
  },
  "trend.title": {
    en: "Production vs Target Trend",
    hi: "उत्पादन बनाम लक्ष्य रुझान",
    mr: "उत्पादन विरुद्ध लक्ष्य कल",
  },
  "trend.desc": {
    en: "Twelve-month operating pattern with the current scenario plotted against history.",
    hi: "वर्तमान परिदृश्य के साथ बारह माह का संचालन पैटर्न।",
    mr: "सध्याच्या परिस्थितीसह बारा महिन्यांचा कामकाज नमुना.",
  },
  "trend.monthsBelow": {
    en: "Months below target",
    hi: "लक्ष्य से कम माह",
    mr: "लक्ष्यापेक्षा कमी महिने",
  },
  "trend.best": { en: "Best month", hi: "सर्वश्रेष्ठ माह", mr: "सर्वोत्तम महिना" },
  "trend.weakest": { en: "Weakest month", hi: "सबसे कमज़ोर माह", mr: "सर्वात कमकुवत महिना" },
  "trend.simulated": { en: "Simulated", hi: "सिम्युलेटेड", mr: "सिम्युलेटेड" },
  "trend.empty": {
    en: "No production history available for {mine}.",
    hi: "{mine} के लिए कोई उत्पादन इतिहास उपलब्ध नहीं।",
    mr: "{mine} साठी उत्पादन इतिहास उपलब्ध नाही.",
  },
  "log.title": { en: "Daily Production Log", hi: "दैनिक उत्पादन लॉग", mr: "दैनिक उत्पादन नोंद" },
  "log.desc": {
    en: "Day-level operating inputs and output variance for the selected mine.",
    hi: "चयनित खदान के लिए दैनिक इनपुट और उत्पादन अंतर।",
    mr: "निवडलेल्या खाणीसाठी दैनिक इनपुट आणि उत्पादनातील फरक.",
  },
  "log.validated": {
    en: "Validated against MOIL NSE Monthly Filings",
    hi: "MOIL NSE मासिक फाइलिंग से सत्यापित",
    mr: "MOIL NSE मासिक फाइलिंगशी पडताळलेले",
  },
  "log.pending": {
    en: "MOIL NSE Monthly Filings · validation pending",
    hi: "MOIL NSE मासिक फाइलिंग · सत्यापन लंबित",
    mr: "MOIL NSE मासिक फाइलिंग · पडताळणी प्रलंबित",
  },
  "log.seeded": { en: "Correlated · seeded", hi: "सहसंबद्ध · सीडेड", mr: "सहसंबंधित · सीडेड" },
  "log.rows": {
    en: "{shown} / {total} rows",
    hi: "{shown} / {total} पंक्तियाँ",
    mr: "{shown} / {total} ओळी",
  },
  "log.avgDowntime": { en: "Avg downtime", hi: "औसत डाउनटाइम", mr: "सरासरी डाउनटाइम" },
  "log.totalRainfall": { en: "Total rainfall", hi: "कुल वर्षा", mr: "एकूण पाऊस" },
  "log.daysBelow": {
    en: "Days below target",
    hi: "लक्ष्य से कम दिन",
    mr: "लक्ष्यापेक्षा कमी दिवस",
  },
  "log.col.date": { en: "Date", hi: "तारीख", mr: "तारीख" },
  "log.col.downtime": { en: "Downtime", hi: "डाउनटाइम", mr: "डाउनटाइम" },
  "log.col.rainfall": { en: "Rainfall", hi: "वर्षा", mr: "पाऊस" },
  "log.col.var": { en: "Var", hi: "अंतर", mr: "फरक" },
  "log.tableLabel": {
    en: "Scrollable synthetic production table for {mine}",
    hi: "{mine} के लिए स्क्रॉल योग्य कृत्रिम उत्पादन तालिका",
    mr: "{mine} साठी स्क्रोल करता येणारी कृत्रिम उत्पादन सारणी",
  },
  "log.empty": {
    en: "The 30-record sample assigns one mine per day, so {mine} has no rows. Switch mine to see its records.",
    hi: "30-रिकॉर्ड नमूने में हर दिन एक खदान है, इसलिए {mine} की कोई पंक्ति नहीं है। रिकॉर्ड देखने के लिए खदान बदलें।",
    mr: "30 नोंदींच्या नमुन्यात दररोज एक खाण आहे, म्हणून {mine} च्या ओळी नाहीत. नोंदी पाहण्यासाठी खाण बदला.",
  },
  "log.note": {
    en: "Reproducible synthetic daily records. Output is derived from downtime and rainfall using the simulator's own coefficients plus noise; the r value above is measured from the data, not hardcoded.",
    hi: "पुनरुत्पादनीय कृत्रिम दैनिक रिकॉर्ड। उत्पादन सिम्युलेटर के गुणांकों और थोड़े शोर के साथ डाउनटाइम व वर्षा से निकाला गया है; ऊपर का r मान डेटा से मापा गया है।",
    mr: "पुनरुत्पादित करता येणाऱ्या कृत्रिम दैनिक नोंदी. उत्पादन सिम्युलेटरच्या गुणांकांसह डाउनटाइम व पावसावरून काढले आहे; वरील r मूल्य डेटावरून मोजले आहे.",
  },

  // --- Risk -------------------------------------------------------------------
  "risk.title": {
    en: "Focus attention where {mine} can lose the most.",
    hi: "ध्यान वहाँ दें जहाँ {mine} को सबसे अधिक नुकसान हो सकता है।",
    mr: "{mine} चे सर्वाधिक नुकसान जिथे होऊ शकते तिथे लक्ष केंद्रित करा.",
  },
  "risk.desc": {
    en: "See active issues in priority order, understand their estimated production impact, and compare known alerts with the broader scenario shortfall.",
    hi: "सक्रिय समस्याएँ प्राथमिकता क्रम में देखें, उनका अनुमानित प्रभाव समझें और ज्ञात अलर्ट की तुलना व्यापक परिदृश्य कमी से करें।",
    mr: "सक्रिय समस्या प्राधान्यक्रमाने पाहा, त्यांचा अंदाजित परिणाम समजून घ्या आणि ज्ञात सूचनांची व्यापक परिस्थिती तुटीशी तुलना करा.",
  },
  "risk.highest": {
    en: "Highest alert: {level}",
    hi: "उच्चतम अलर्ट: {level}",
    mr: "सर्वोच्च सूचना: {level}",
  },
  "risk.openCount": {
    en: "{count} open alerts",
    hi: "{count} खुले अलर्ट",
    mr: "{count} खुल्या सूचना",
  },
  "risk.scenario": { en: "Scenario: {level}", hi: "परिदृश्य: {level}", mr: "परिस्थिती: {level}" },
  "risk.m.known": { en: "Known alert impact", hi: "ज्ञात अलर्ट प्रभाव", mr: "ज्ञात सूचना परिणाम" },
  "risk.m.knownDesc": {
    en: "Combined estimated impact of the currently logged mine alerts.",
    hi: "वर्तमान में दर्ज खदान अलर्ट का संयुक्त अनुमानित प्रभाव।",
    mr: "सध्या नोंदवलेल्या खाण सूचनांचा एकत्रित अंदाजित परिणाम.",
  },
  "risk.m.shortfall": { en: "Scenario shortfall", hi: "परिदृश्य कमी", mr: "परिस्थिती तूट" },
  "risk.m.shortfallDesc": {
    en: "Output at risk under the selected rainfall and downtime inputs.",
    hi: "चयनित वर्षा और डाउनटाइम इनपुट के तहत जोखिम में उत्पादन।",
    mr: "निवडलेल्या पाऊस आणि डाउनटाइम इनपुटमुळे धोक्यात असलेले उत्पादन.",
  },
  "risk.m.coverage": {
    en: "Explained coverage",
    hi: "व्याख्यायित हिस्सा",
    mr: "स्पष्ट केलेला वाटा",
  },
  "risk.m.coverageDesc": {
    en: "Share of scenario shortfall represented by explicitly logged alerts.",
    hi: "परिदृश्य कमी का वह हिस्सा जो दर्ज अलर्ट से स्पष्ट होता है।",
    mr: "परिस्थिती तुटीचा तो भाग जो नोंदवलेल्या सूचनांनी स्पष्ट होतो.",
  },
  "risk.m.gap": { en: "Unexplained gap", hi: "अस्पष्ट अंतर", mr: "अस्पष्ट तफावत" },
  "risk.m.gapDesc": {
    en: "Residual shortfall to investigate beyond the current alert register.",
    hi: "वर्तमान अलर्ट सूची से परे जाँचने योग्य शेष कमी।",
    mr: "सध्याच्या सूचना नोंदवहीपलीकडे तपासायची उरलेली तूट.",
  },
  "risk.queue": { en: "Response Queue", hi: "प्रतिक्रिया कतार", mr: "प्रतिसाद रांग" },
  "risk.queueDesc": {
    en: "A practical order of work generated from the current scenario.",
    hi: "वर्तमान परिदृश्य से बना कार्य का व्यावहारिक क्रम।",
    mr: "सध्याच्या परिस्थितीवरून तयार केलेला कामाचा व्यावहारिक क्रम.",
  },
  "risk.actFirst": { en: "Act first", hi: "पहले कार्य करें", mr: "आधी कृती करा" },
  "risk.thenProceed": { en: "Then proceed", hi: "फिर आगे बढ़ें", mr: "नंतर पुढे जा" },
  "risk.closeLoop": { en: "Close the loop", hi: "प्रक्रिया पूरी करें", mr: "प्रक्रिया पूर्ण करा" },
  "risk.disclaimer": {
    en: "Alerts in this prototype are scenario fixtures. Confirm any operational action with the mine control room and current statutory procedures.",
    hi: "इस प्रोटोटाइप के अलर्ट परिदृश्य डेटा हैं। किसी भी कार्रवाई की पुष्टि खदान नियंत्रण कक्ष और वर्तमान वैधानिक प्रक्रियाओं से करें।",
    mr: "या प्रोटोटाइपमधील सूचना परिस्थिती डेटा आहेत. कोणत्याही कृतीची खाण नियंत्रण कक्ष आणि सध्याच्या वैधानिक प्रक्रियांशी खात्री करा.",
  },
  "feed.title": {
    en: "Active Shortfall Risk Feed",
    hi: "सक्रिय कमी जोखिम फ़ीड",
    mr: "सक्रिय तूट जोखीम फीड",
  },
  "feed.desc": {
    en: "Prioritised operational issues with translated context and modelled impact.",
    hi: "अनूदित संदर्भ और मॉडल प्रभाव के साथ प्राथमिकता वाली समस्याएँ।",
    mr: "अनुवादित संदर्भ आणि मॉडेल परिणामासह प्राधान्य दिलेल्या समस्या.",
  },
  "feed.open": { en: "{count} open", hi: "{count} खुले", mr: "{count} खुल्या" },
  "feed.none": {
    en: "No open shortfall alerts logged for {mine}.",
    hi: "{mine} के लिए कोई खुला कमी अलर्ट दर्ज नहीं।",
    mr: "{mine} साठी कोणतीही खुली तूट सूचना नोंदवलेली नाही.",
  },
  "feed.summary": {
    en: "Logged alerts account for −{logged} T against a simulated shortfall of −{shortfall} T at {mine}.",
    hi: "{mine} में दर्ज अलर्ट −{logged} T दर्शाते हैं, जबकि सिम्युलेटेड कमी −{shortfall} T है।",
    mr: "{mine} मध्ये नोंदवलेल्या सूचना −{logged} T दर्शवतात, तर सिम्युलेटेड तूट −{shortfall} T आहे.",
  },
  "feed.fallback": { en: "EN fallback", hi: "अंग्रेज़ी में", mr: "इंग्रजीत" },
  "feed.off": { en: "EN (off)", hi: "अंग्रेज़ी (बंद)", mr: "इंग्रजी (बंद)" },

  // --- Simulator --------------------------------------------------------------
  "sim.title": {
    en: "Test recovery choices before they affect {mine}.",
    hi: "{mine} पर असर से पहले रिकवरी विकल्पों को परखें।",
    mr: "{mine} वर परिणाम होण्यापूर्वी सुधारणा पर्याय तपासा.",
  },
  "sim.desc": {
    en: "Change two understandable operating drivers—downtime and rainfall—and immediately see the estimated output, risk level and recommended response.",
    hi: "दो सरल कारक—डाउनटाइम और वर्षा—बदलें और तुरंत अनुमानित उत्पादन, जोखिम स्तर और अनुशंसित प्रतिक्रिया देखें।",
    mr: "दोन सोपे घटक—डाउनटाइम आणि पाऊस—बदला आणि लगेच अंदाजित उत्पादन, जोखीम पातळी आणि शिफारस केलेला प्रतिसाद पाहा.",
  },
  "sim.downtimeBadge": {
    en: "{hours} h downtime",
    hi: "{hours} घं. डाउनटाइम",
    mr: "{hours} तास डाउनटाइम",
  },
  "sim.rainfallBadge": { en: "{mm} mm rainfall", hi: "{mm} मिमी वर्षा", mr: "{mm} मिमी पाऊस" },
  "sim.riskBadge": { en: "{level} risk", hi: "{level} जोखिम", mr: "{level} जोखीम" },
  "sim.m.projected": { en: "Projected output", hi: "अनुमानित उत्पादन", mr: "अंदाजित उत्पादन" },
  "sim.m.projectedDesc": {
    en: "Against a {target} T monthly target.",
    hi: "{target} T मासिक लक्ष्य के मुकाबले।",
    mr: "{target} T मासिक लक्ष्याच्या तुलनेत.",
  },
  "sim.m.attainmentDesc": {
    en: "The share of target remaining after modelled operating losses.",
    hi: "मॉडल आधारित हानि के बाद बचा लक्ष्य का हिस्सा।",
    mr: "मॉडेल आधारित तोट्यानंतर उरलेला लक्ष्याचा भाग.",
  },
  "sim.m.downtime": { en: "Downtime impact", hi: "डाउनटाइम प्रभाव", mr: "डाउनटाइम परिणाम" },
  "sim.m.rainfall": { en: "Rainfall impact", hi: "वर्षा प्रभाव", mr: "पावसाचा परिणाम" },
  "sim.m.share": {
    en: "{pct} of total modelled loss.",
    hi: "कुल मॉडल हानि का {pct}।",
    mr: "एकूण मॉडेल तोट्याचा {pct}.",
  },
  "sim.workflow": {
    en: "A Simple Three-Step Workflow",
    hi: "तीन चरणों की सरल प्रक्रिया",
    mr: "तीन पायऱ्यांची सोपी प्रक्रिया",
  },
  "sim.workflowDesc": {
    en: "No modelling expertise required. Start with what the shift team knows.",
    hi: "मॉडलिंग विशेषज्ञता की आवश्यकता नहीं। शिफ्ट टीम जो जानती है, उससे शुरू करें।",
    mr: "मॉडेलिंग कौशल्याची गरज नाही. शिफ्ट टीमला जे माहीत आहे त्यापासून सुरुवात करा.",
  },
  "sim.step1": { en: "Set downtime", hi: "डाउनटाइम तय करें", mr: "डाउनटाइम ठरवा" },
  "sim.step1Desc": {
    en: "Estimate how many hours the shaft, incline or primary material flow will be unavailable.",
    hi: "अनुमान लगाएँ कि शाफ्ट, इनक्लाइन या मुख्य सामग्री प्रवाह कितने घंटे बंद रहेगा।",
    mr: "शाफ्ट, इनक्लाइन किंवा मुख्य साहित्य प्रवाह किती तास बंद राहील याचा अंदाज घ्या.",
  },
  "sim.step2": { en: "Set rainfall", hi: "वर्षा तय करें", mr: "पाऊस ठरवा" },
  "sim.step2Desc": {
    en: "Enter expected rainfall, or pull the latest Open-Meteo reading for the active mine.",
    hi: "अपेक्षित वर्षा दर्ज करें, या सक्रिय खदान के लिए नवीनतम Open-Meteo रीडिंग लें।",
    mr: "अपेक्षित पाऊस भरा, किंवा सक्रिय खाणीसाठी नवीनतम Open-Meteo वाचन घ्या.",
  },
  "sim.step3": {
    en: "Review and act",
    hi: "समीक्षा करें और कार्य करें",
    mr: "आढावा घ्या आणि कृती करा",
  },
  "sim.step3Desc": {
    en: "Compare output and risk, then generate a grounded mitigation directive for the shift team.",
    hi: "उत्पादन और जोखिम की तुलना करें, फिर शिफ्ट टीम के लिए समाधान निर्देश बनाएँ।",
    mr: "उत्पादन आणि जोखमीची तुलना करा, नंतर शिफ्ट टीमसाठी उपाय निर्देश तयार करा.",
  },
  "sim.transparency": { en: "Model transparency", hi: "मॉडल पारदर्शिता", mr: "मॉडेल पारदर्शकता" },
  "sim.transparencyBody": {
    en: "The deterministic baseline prices each downtime hour at 140 tonnes and each millimetre of rainfall at 55 tonnes. The AI directive explains a response; it does not change the calculation.",
    hi: "निर्धारित आधार रेखा हर डाउनटाइम घंटे को 140 टन और हर मिलीमीटर वर्षा को 55 टन मानती है। AI निर्देश प्रतिक्रिया समझाता है; यह गणना नहीं बदलता।",
    mr: "निश्चित आधाररेषा प्रत्येक डाउनटाइम तासाला 140 टन आणि प्रत्येक मिलिमीटर पावसाला 55 टन मानते. AI निर्देश प्रतिसाद समजावतो; तो गणना बदलत नाही.",
  },
  "panel.sim.title": {
    en: "Scenario Simulator & Action Console",
    hi: "परिदृश्य सिम्युलेटर और कार्य कंसोल",
    mr: "परिस्थिती सिम्युलेटर आणि कृती कन्सोल",
  },
  "panel.sim.desc": {
    en: "Adjust two operational drivers, see the output impact, then generate a practical mitigation plan.",
    hi: "दो परिचालन कारक समायोजित करें, उत्पादन प्रभाव देखें, फिर व्यावहारिक समाधान योजना बनाएँ।",
    mr: "दोन कामकाज घटक बदला, उत्पादनावरील परिणाम पाहा, नंतर व्यावहारिक उपाय योजना तयार करा.",
  },
  "panel.sim.reset": { en: "Reset", hi: "रीसेट", mr: "रीसेट" },
  "panel.sim.rules": { en: "Deterministic rules", hi: "निर्धारित नियम", mr: "निश्चित नियम" },
  "panel.sim.hoist": {
    en: "Shaft Hoist Downtime",
    hi: "शाफ्ट होइस्ट डाउनटाइम",
    mr: "शाफ्ट होईस्ट डाउनटाइम",
  },
  "panel.sim.rainfall": { en: "Monsoon Rainfall", hi: "मानसून वर्षा", mr: "मान्सून पाऊस" },
  "panel.sim.useLive": {
    en: "Use live rainfall",
    hi: "लाइव वर्षा उपयोग करें",
    mr: "थेट पाऊस वापरा",
  },
  "panel.sim.fetching": {
    en: "Fetching Open-Meteo for {mine}…",
    hi: "{mine} के लिए Open-Meteo से डेटा ला रहे हैं…",
    mr: "{mine} साठी Open-Meteo वरून डेटा आणत आहे…",
  },
  "panel.sim.unavailable": {
    en: "Open-Meteo unavailable — slider value retained",
    hi: "Open-Meteo उपलब्ध नहीं — स्लाइडर मान बरकरार",
    mr: "Open-Meteo उपलब्ध नाही — स्लायडर मूल्य कायम",
  },
  "panel.sim.idle": {
    en: "Keyless Open-Meteo feed · no API key required",
    hi: "Open-Meteo फ़ीड · API कुंजी की आवश्यकता नहीं",
    mr: "Open-Meteo फीड · API की लागत नाही",
  },
  "panel.sim.ready": {
    en: "Open-Meteo · {mm} mm on {date} ({tz})",
    hi: "Open-Meteo · {date} को {mm} मिमी ({tz})",
    mr: "Open-Meteo · {date} रोजी {mm} मिमी ({tz})",
  },
  "panel.sim.impact": { en: "Impact", hi: "प्रभाव", mr: "परिणाम" },
  "panel.sim.now": { en: "Now (15 min)", hi: "अभी (15 मिनट)", mr: "आता (15 मिनिटे)" },
  "panel.sim.eightDay": { en: "8-day total", hi: "8-दिन कुल", mr: "8 दिवसांची एकूण" },
  "panel.sim.rainyDays": {
    en: "Rainy days ≥2.5 mm",
    hi: "वर्षा दिवस ≥2.5 मिमी",
    mr: "पावसाचे दिवस ≥2.5 मिमी",
  },
  "panel.sim.riskLevel": { en: "Risk level", hi: "जोखिम स्तर", mr: "जोखीम पातळी" },
  "panel.sim.driver.hoist": {
    en: "Hoist downtime dominant",
    hi: "होइस्ट डाउनटाइम प्रमुख",
    mr: "होईस्ट डाउनटाइम प्रमुख",
  },
  "panel.sim.driver.rainfall": { en: "Rainfall dominant", hi: "वर्षा प्रमुख", mr: "पाऊस प्रमुख" },
  "panel.sim.driver.balanced": { en: "Drivers balanced", hi: "कारक संतुलित", mr: "घटक संतुलित" },
  "panel.sim.recommended": {
    en: "Recommended actions · {mine}",
    hi: "अनुशंसित कार्य · {mine}",
    mr: "शिफारस केलेल्या कृती · {mine}",
  },
  "panel.sim.ai": { en: "AI Directive", hi: "AI निर्देश", mr: "AI निर्देश" },
  "panel.sim.generate": {
    en: "Generate AI Mitigation",
    hi: "AI समाधान बनाएँ",
    mr: "AI उपाय तयार करा",
  },
  "panel.sim.generating": { en: "Generating…", hi: "बन रहा है…", mr: "तयार होत आहे…" },
  "panel.sim.ruleFallback": { en: "Rule fallback", hi: "नियम आधारित", mr: "नियम आधारित" },
  "panel.sim.aiIntro": {
    en: "Generate a two-sentence mitigation directive for {mine} from the current downtime and rainfall inputs. Falls back to a deterministic directive if Groq is unreachable.",
    hi: "वर्तमान डाउनटाइम और वर्षा इनपुट से {mine} के लिए दो-वाक्य का समाधान निर्देश बनाएँ। Groq उपलब्ध न होने पर नियम आधारित निर्देश दिखता है।",
    mr: "सध्याच्या डाउनटाइम आणि पाऊस इनपुटवरून {mine} साठी दोन वाक्यांचा उपाय निर्देश तयार करा. Groq उपलब्ध नसल्यास नियम आधारित निर्देश दिसतो.",
  },

  // --- Landing page -----------------------------------------------------------
  "landing.nav.challenge": { en: "The challenge", hi: "चुनौती", mr: "आव्हान" },
  "landing.nav.approach": { en: "Our approach", hi: "हमारा समाधान", mr: "आमचा उपाय" },
  "landing.nav.how": { en: "How it works", hi: "यह कैसे काम करता है", mr: "हे कसे काम करते" },
  "landing.nav.trust": { en: "Data trust", hi: "डेटा विश्वसनीयता", mr: "डेटा विश्वासार्हता" },
  "landing.nav.label": { en: "Page sections", hi: "पृष्ठ अनुभाग", mr: "पानाचे विभाग" },
  "landing.dashboard": { en: "Dashboard", hi: "डैशबोर्ड", mr: "डॅशबोर्ड" },
  "landing.hero.eyebrow": {
    en: "Manganese intelligence for MOIL operations",
    hi: "MOIL संचालन के लिए मैंगनीज़ इंटेलिजेंस",
    mr: "MOIL कामकाजासाठी मँगनीज इंटेलिजन्स",
  },
  "landing.hero.title": {
    en: "From ore body to monthly output — one clear picture.",
    hi: "अयस्क भंडार से मासिक उत्पादन तक — एक स्पष्ट तस्वीर।",
    mr: "धातुक साठ्यापासून मासिक उत्पादनापर्यंत — एक स्पष्ट चित्र.",
  },
  "landing.hero.desc": {
    en: "STRATA brings geology, production, operational risk and weather into one plain-language workspace, so mine teams can see problems early and act before tonnes are lost.",
    hi: "STRATA भूविज्ञान, उत्पादन, परिचालन जोखिम और मौसम को एक सरल कार्यक्षेत्र में लाता है, ताकि खदान टीमें समस्याएँ पहले देख सकें और टन का नुकसान होने से पहले कार्य कर सकें।",
    mr: "STRATA भूविज्ञान, उत्पादन, कामकाजातील जोखीम आणि हवामान एकाच सोप्या कार्यक्षेत्रात आणते, जेणेकरून खाण टीमना समस्या लवकर दिसतात आणि टनांचे नुकसान होण्यापूर्वी कृती करता येते.",
  },
  "landing.hero.cta": { en: "Open Dashboard", hi: "डैशबोर्ड खोलें", mr: "डॅशबोर्ड उघडा" },
  "landing.hero.secondary": { en: "See the challenge", hi: "चुनौती देखें", mr: "आव्हान पाहा" },
  "landing.preview.title": {
    en: "Live scenario preview",
    hi: "लाइव परिदृश्य झलक",
    mr: "थेट परिस्थिती झलक",
  },
  "landing.preview.caption": {
    en: "Calculated from the current scenario inputs",
    hi: "वर्तमान परिदृश्य इनपुट से गणना",
    mr: "सध्याच्या परिस्थिती इनपुटवरून मोजले",
  },
  "landing.preview.open": {
    en: "Adjust this scenario",
    hi: "यह परिदृश्य बदलें",
    mr: "ही परिस्थिती बदला",
  },

  "landing.stat.steel": {
    en: "of manganese is used in steelmaking (global, approx.)",
    hi: "मैंगनीज़ का उपयोग इस्पात निर्माण में होता है (वैश्विक, लगभग)",
    mr: "मँगनीजचा वापर पोलाद निर्मितीत होतो (जागतिक, अंदाजे)",
  },
  "landing.stat.depth": {
    en: "depth of Balaghat, Asia's deepest underground manganese mine",
    hi: "बालाघाट की गहराई, एशिया की सबसे गहरी भूमिगत मैंगनीज़ खदान",
    mr: "बालाघाटची खोली, आशियातील सर्वात खोल भूमिगत मँगनीज खाण",
  },
  "landing.stat.mines": {
    en: "MOIL mines modelled across Madhya Pradesh and Maharashtra",
    hi: "मध्य प्रदेश और महाराष्ट्र में मॉडल की गई MOIL खदानें",
    mr: "मध्य प्रदेश आणि महाराष्ट्रातील मॉडेल केलेल्या MOIL खाणी",
  },
  "landing.stat.languages": {
    en: "interface languages: English, Hindi and Marathi",
    hi: "इंटरफ़ेस भाषाएँ: अंग्रेज़ी, हिन्दी और मराठी",
    mr: "इंटरफेस भाषा: इंग्रजी, हिंदी आणि मराठी",
  },

  "landing.challenge.eyebrow": { en: "The challenge", hi: "चुनौती", mr: "आव्हान" },
  "landing.challenge.title": {
    en: "Manganese mining runs on decisions made with fragmented information.",
    hi: "मैंगनीज़ खनन के निर्णय बिखरी हुई जानकारी के आधार पर लिए जाते हैं।",
    mr: "मँगनीज खाणकामाचे निर्णय विखुरलेल्या माहितीच्या आधारे घेतले जातात.",
  },
  "landing.challenge.desc": {
    en: "Output depends on deep, weather-exposed operations — but the evidence needed to run them well sits in separate systems.",
    hi: "उत्पादन गहरे और मौसम पर निर्भर संचालन पर टिका है — पर उन्हें अच्छी तरह चलाने के लिए ज़रूरी प्रमाण अलग-अलग प्रणालियों में हैं।",
    mr: "उत्पादन खोल आणि हवामानावर अवलंबून असलेल्या कामकाजावर टिकते — पण ते चांगले चालवण्यासाठी लागणारे पुरावे वेगवेगळ्या प्रणालींमध्ये आहेत.",
  },
  "landing.challenge.1.title": {
    en: "Deep workings with single points of failure",
    hi: "एकल विफलता बिंदु वाली गहरी खदानें",
    mr: "एकाच बिघाड बिंदूवर अवलंबून खोल खाणी",
  },
  "landing.challenge.1.desc": {
    en: "Underground mines reach hundreds of metres. When a shaft hoist or incline belt stops, the whole mine's output stops with it.",
    hi: "भूमिगत खदानें सैकड़ों मीटर गहरी हैं। शाफ्ट होइस्ट या इनक्लाइन बेल्ट रुकते ही पूरी खदान का उत्पादन रुक जाता है।",
    mr: "भूमिगत खाणी शेकडो मीटर खोल आहेत. शाफ्ट होईस्ट किंवा इनक्लाइन बेल्ट थांबला की संपूर्ण खाणीचे उत्पादन थांबते.",
  },
  "landing.challenge.2.title": {
    en: "Monsoon disruption",
    hi: "मानसून से बाधा",
    mr: "मान्सूनमुळे अडथळा",
  },
  "landing.challenge.2.desc": {
    en: "Heavy rain floods benches, softens haul roads and forces dewatering. The tonnage at risk is rarely known before the rain arrives.",
    hi: "भारी वर्षा बेंच डुबो देती है, ढुलाई सड़कें कमज़ोर करती है और पानी निकालना पड़ता है। जोखिम में टन भार वर्षा से पहले शायद ही पता होता है।",
    mr: "मुसळधार पाऊस बेंच बुडवतो, वाहतूक रस्ते कमकुवत करतो आणि पाणी उपसावे लागते. धोक्यात असलेले टन पावसापूर्वी क्वचितच कळतात.",
  },
  "landing.challenge.3.title": {
    en: "Scattered geological evidence",
    hi: "बिखरे हुए भूवैज्ञानिक प्रमाण",
    mr: "विखुरलेले भूवैज्ञानिक पुरावे",
  },
  "landing.challenge.3.desc": {
    en: "Geological maps, GIS layers, satellite indicators and company filings live in different places, so exploration choices are slow to justify.",
    hi: "भूवैज्ञानिक मानचित्र, GIS परतें, उपग्रह संकेतक और कंपनी फाइलिंग अलग-अलग जगह हैं, इसलिए अन्वेषण के निर्णय सही ठहराने में समय लगता है।",
    mr: "भूवैज्ञानिक नकाशे, GIS स्तर, उपग्रह निर्देशक आणि कंपनी फाइलिंग वेगवेगळ्या ठिकाणी आहेत, त्यामुळे शोधकामाचे निर्णय सिद्ध करायला वेळ लागतो.",
  },
  "landing.challenge.4.title": {
    en: "Insights that arrive too late",
    hi: "देर से मिलने वाली जानकारी",
    mr: "उशिरा मिळणारी माहिती",
  },
  "landing.challenge.4.desc": {
    en: "Plans live in spreadsheets and English-only reports. Shift teams working in Hindi or Marathi often get the full picture after the loss has happened.",
    hi: "योजनाएँ स्प्रेडशीट और केवल अंग्रेज़ी रिपोर्टों में रहती हैं। हिन्दी या मराठी में काम करने वाली शिफ्ट टीमों को पूरी तस्वीर अक्सर नुकसान के बाद मिलती है।",
    mr: "योजना स्प्रेडशीट आणि केवळ इंग्रजी अहवालांत असतात. हिंदी किंवा मराठीत काम करणाऱ्या शिफ्ट टीमना संपूर्ण चित्र अनेकदा नुकसान झाल्यानंतर मिळते.",
  },

  "landing.approach.eyebrow": { en: "Our approach", hi: "हमारा समाधान", mr: "आमचा उपाय" },
  "landing.approach.title": {
    en: "One workspace that turns each challenge into an action.",
    hi: "एक कार्यक्षेत्र जो हर चुनौती को कार्रवाई में बदलता है।",
    mr: "एक कार्यक्षेत्र जे प्रत्येक आव्हानाचे कृतीत रूपांतर करते.",
  },
  "landing.approach.desc": {
    en: "Every page answers one practical question, in plain language, with its data source always visible.",
    hi: "हर पृष्ठ सरल भाषा में एक व्यावहारिक प्रश्न का उत्तर देता है, और उसका डेटा स्रोत हमेशा दिखता है।",
    mr: "प्रत्येक पान सोप्या भाषेत एका व्यावहारिक प्रश्नाचे उत्तर देते आणि त्याचा डेटा स्रोत नेहमी दिसतो.",
  },
  "landing.approach.prospectivity.q": {
    en: "Where is the ore worth chasing?",
    hi: "किस अयस्क के पीछे जाना लाभदायक है?",
    mr: "कोणत्या धातुकाचा पाठपुरावा करणे फायदेशीर आहे?",
  },
  "landing.approach.prospectivity.a": {
    en: "Geology overlay, satellite indicators and model confidence on one map.",
    hi: "एक ही मानचित्र पर भूविज्ञान ओवरले, उपग्रह संकेतक और मॉडल विश्वसनीयता।",
    mr: "एकाच नकाशावर भूविज्ञान ओव्हरले, उपग्रह निर्देशक आणि मॉडेल विश्वासार्हता.",
  },
  "landing.approach.production.q": {
    en: "Are we on target — and if not, why?",
    hi: "क्या हम लक्ष्य पर हैं — और नहीं, तो क्यों?",
    mr: "आपण लक्ष्यावर आहोत का — नसल्यास का?",
  },
  "landing.approach.production.a": {
    en: "Monthly trend, day-level drivers and the current scenario side by side.",
    hi: "मासिक रुझान, दैनिक कारक और वर्तमान परिदृश्य एक साथ।",
    mr: "मासिक कल, दैनिक घटक आणि सध्याची परिस्थिती शेजारी शेजारी.",
  },
  "landing.approach.risk.q": {
    en: "What could cost us the most right now?",
    hi: "अभी हमें सबसे अधिक नुकसान किससे हो सकता है?",
    mr: "आत्ता आपले सर्वाधिक नुकसान कशामुळे होऊ शकते?",
  },
  "landing.approach.risk.a": {
    en: "Alerts ranked by tonnage, compared with the modelled shortfall.",
    hi: "टन भार के अनुसार क्रमबद्ध अलर्ट, मॉडल आधारित कमी से तुलना सहित।",
    mr: "टनांनुसार क्रमवारी लावलेल्या सूचना, मॉडेल आधारित तुटीशी तुलनेसह.",
  },
  "landing.approach.simulator.q": {
    en: "What happens if it rains, or the hoist stops?",
    hi: "वर्षा हो या होइस्ट रुक जाए तो क्या होगा?",
    mr: "पाऊस पडला किंवा होईस्ट थांबला तर काय होईल?",
  },
  "landing.approach.simulator.a": {
    en: "Test downtime and rainfall, see the impact in tonnes, and get a mitigation plan.",
    hi: "डाउनटाइम और वर्षा परखें, टन में प्रभाव देखें और समाधान योजना पाएँ।",
    mr: "डाउनटाइम आणि पावसाची चाचणी घ्या, टनांमध्ये परिणाम पाहा आणि उपाय योजना मिळवा.",
  },

  "landing.how.eyebrow": { en: "How it works", hi: "यह कैसे काम करता है", mr: "हे कसे काम करते" },
  "landing.how.title": {
    en: "Three steps from raw data to a decision.",
    hi: "कच्चे डेटा से निर्णय तक तीन चरण।",
    mr: "कच्च्या डेटापासून निर्णयापर्यंत तीन पायऱ्या.",
  },
  "landing.how.1.title": {
    en: "Bring the sources together",
    hi: "स्रोतों को एक साथ लाएँ",
    mr: "स्रोत एकत्र आणा",
  },
  "landing.how.1.desc": {
    en: "Official MOIL filings, GSI / NGDR geology, satellite indicators and live Open-Meteo rainfall in one place.",
    hi: "आधिकारिक MOIL फाइलिंग, GSI / NGDR भूविज्ञान, उपग्रह संकेतक और लाइव Open-Meteo वर्षा एक ही जगह।",
    mr: "अधिकृत MOIL फाइलिंग, GSI / NGDR भूविज्ञान, उपग्रह निर्देशक आणि थेट Open-Meteo पाऊस एकाच ठिकाणी.",
  },
  "landing.how.2.title": {
    en: "Model the impact",
    hi: "प्रभाव का मॉडल बनाएँ",
    mr: "परिणामाचे मॉडेल करा",
  },
  "landing.how.2.desc": {
    en: "A transparent model prices disruption in tonnes: 140 T per hour of hoist downtime and 55 T per millimetre of rain.",
    hi: "एक पारदर्शी मॉडल बाधा को टन में मापता है: होइस्ट डाउनटाइम के प्रति घंटे 140 T और प्रति मिलीमीटर वर्षा 55 T।",
    mr: "एक पारदर्शक मॉडेल अडथळा टनांमध्ये मोजते: होईस्ट डाउनटाइमच्या प्रत्येक तासाला 140 T आणि प्रत्येक मिलिमीटर पावसाला 55 T.",
  },
  "landing.how.3.title": {
    en: "Act with confidence",
    hi: "आत्मविश्वास से कार्य करें",
    mr: "आत्मविश्वासाने कृती करा",
  },
  "landing.how.3.desc": {
    en: "Ranked risks and a mitigation directive the shift team can use straight away, in their own language.",
    hi: "क्रमबद्ध जोखिम और समाधान निर्देश, जिन्हें शिफ्ट टीम तुरंत अपनी भाषा में उपयोग कर सके।",
    mr: "क्रमवारी लावलेल्या जोखमी आणि उपाय निर्देश, जे शिफ्ट टीम लगेच स्वतःच्या भाषेत वापरू शकते.",
  },

  "landing.trust.eyebrow": {
    en: "Data you can trust",
    hi: "भरोसेमंद डेटा",
    mr: "विश्वासार्ह डेटा",
  },
  "landing.trust.title": {
    en: "Every number shows where it came from.",
    hi: "हर संख्या बताती है कि वह कहाँ से आई।",
    mr: "प्रत्येक आकडा तो कुठून आला हे सांगतो.",
  },
  "landing.trust.desc": {
    en: "STRATA never presents a model as a measurement. Each card carries one of five labels:",
    hi: "STRATA कभी भी मॉडल को मापन के रूप में नहीं दिखाता। हर कार्ड पर पाँच में से एक लेबल होता है:",
    mr: "STRATA कधीही मॉडेलला मोजमाप म्हणून दाखवत नाही. प्रत्येक कार्डवर पाचपैकी एक लेबल असते:",
  },
  "landing.trust.satellite": {
    en: "Scored from Copernicus Sentinel-2 imagery and elevation data, with published validation.",
    hi: "कॉपरनिकस सेंटिनल-2 चित्रों और ऊँचाई डेटा से आँका गया, सत्यापन परिणामों के साथ।",
    mr: "कॉपर्निकस सेंटिनेल-2 प्रतिमा आणि उंची डेटावरून मोजलेले, पडताळणी निकालांसह.",
  },
  "landing.trust.official": {
    en: "Taken from MOIL SEBI / NSE corporate filings.",
    hi: "MOIL SEBI / NSE कॉर्पोरेट फाइलिंग से लिया गया।",
    mr: "MOIL SEBI / NSE कॉर्पोरेट फाइलिंगमधून घेतलेले.",
  },
  "landing.trust.modelled": {
    en: "Calculated from your current inputs by the scenario model.",
    hi: "परिदृश्य मॉडल द्वारा आपके वर्तमान इनपुट से गणना।",
    mr: "परिस्थिती मॉडेलद्वारे तुमच्या सध्याच्या इनपुटवरून मोजलेले.",
  },
  "landing.trust.simulated": {
    en: "Illustrative placeholder data, not measured.",
    hi: "उदाहरण के लिए डेटा, मापा हुआ नहीं।",
    mr: "उदाहरणासाठी डेटा, मोजलेला नाही.",
  },
  "landing.trust.synthetic": {
    en: "Reproducible generated data that demonstrates the workflow.",
    hi: "कार्यप्रवाह दिखाने के लिए पुनरुत्पादनीय कृत्रिम डेटा।",
    mr: "कार्यप्रवाह दाखवण्यासाठी पुनरुत्पादित करता येणारा कृत्रिम डेटा.",
  },
  "landing.trust.note": {
    en: "STRATA is a working prototype. Monthly targets, alerts and the geology overlay are illustrative until live data sources are connected.",
    hi: "STRATA एक कार्यशील प्रोटोटाइप है। लाइव डेटा स्रोत जुड़ने तक मासिक लक्ष्य, अलर्ट और भूविज्ञान ओवरले उदाहरणात्मक हैं।",
    mr: "STRATA हा कार्यरत प्रोटोटाइप आहे. थेट डेटा स्रोत जोडले जाईपर्यंत मासिक लक्ष्य, सूचना आणि भूविज्ञान ओव्हरले उदाहरणात्मक आहेत.",
  },

  "landing.access.eyebrow": {
    en: "Built for everyone on site",
    hi: "स्थल पर सभी के लिए",
    mr: "स्थळावरील सर्वांसाठी",
  },
  "landing.access.title": {
    en: "Clear enough for the shift team, deep enough for planners.",
    hi: "शिफ्ट टीम के लिए सरल, योजनाकारों के लिए पर्याप्त गहन।",
    mr: "शिफ्ट टीमसाठी सोपे, नियोजकांसाठी पुरेसे सखोल.",
  },
  "landing.access.1": {
    en: "Switch between English, हिन्दी and मराठी instantly",
    hi: "English, हिन्दी और मराठी के बीच तुरंत बदलें",
    mr: "English, हिन्दी आणि मराठी यांमध्ये लगेच बदला",
  },
  "landing.access.2": {
    en: "Plain-language explanations beside every specialist metric",
    hi: "हर विशेषज्ञ मीट्रिक के साथ सरल भाषा में व्याख्या",
    mr: "प्रत्येक तज्ज्ञ निर्देशकासोबत सोप्या भाषेत स्पष्टीकरण",
  },
  "landing.access.3": {
    en: "Works on phones, tablets and control-room screens",
    hi: "फ़ोन, टैबलेट और नियंत्रण कक्ष स्क्रीन पर काम करता है",
    mr: "फोन, टॅबलेट आणि नियंत्रण कक्षाच्या स्क्रीनवर चालते",
  },

  "landing.cta.title": {
    en: "See your mines the way STRATA does.",
    hi: "अपनी खदानों को STRATA की नज़र से देखें।",
    mr: "तुमच्या खाणी STRATA च्या नजरेतून पाहा.",
  },
  "landing.cta.desc": {
    en: "Open the dashboard to explore Balaghat, Dongri Buzurg, Chikla, Kandri and Ukwa.",
    hi: "बालाघाट, डोंगरी बुज़ुर्ग, चिकला, कांद्री और उकवा देखने के लिए डैशबोर्ड खोलें।",
    mr: "बालाघाट, डोंगरी बुजुर्ग, चिकला, कांद्री आणि उकवा पाहण्यासाठी डॅशबोर्ड उघडा.",
  },
  "landing.footer.tag": {
    en: "Manganese intelligence prototype",
    hi: "मैंगनीज़ इंटेलिजेंस प्रोटोटाइप",
    mr: "मँगनीज इंटेलिजन्स प्रोटोटाइप",
  },
  "landing.footer.sources": { en: "Data sources", hi: "डेटा स्रोत", mr: "डेटा स्रोत" },
  "landing.backToTop": { en: "Back to top", hi: "ऊपर जाएँ", mr: "वर जा" },
} as const satisfies Record<string, Entry>;

export type UiKey = keyof typeof UI_STRINGS;

export type UiVars = Record<string, string | number>;

/** Pure lookup + `{placeholder}` substitution. Unknown placeholders stay visible. */
export function formatUiString(language: LanguageCode, key: UiKey, vars?: UiVars): string {
  const entry: Entry = UI_STRINGS[key];
  const template = entry[language] || entry.en;
  if (vars === undefined) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}
