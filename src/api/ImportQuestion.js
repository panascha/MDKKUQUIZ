// api/ImportQuestion.js

const allQuestions = [
    // Histology - Epithelial Tissue
    {
        _id: "1",
        topicId: "1", // Epithelial Tissue
        type: "mcq",
        problem: "Which type of epithelium is best suited for diffusion and filtration?",
        img: "",
        choices: ["Stratified squamous epithelium", "Simple cuboidal epithelium", "Simple squamous epithelium", "Transitional epithelium"],
        answer: "Simple squamous epithelium",
        explain: "Simple squamous epithelium is thin and allows for easy passage of molecules.",
        keyword: [],
        approvedBy: [],
    },
    {
        _id: "2",
        topicId: "1", // Epithelial Tissue
        type: "short_answer",
        problem: "What is the primary function of goblet cells in the respiratory tract?",
        answer: "secrete mucus",
        img: "",
        explain: "Goblet cells secrete mucus to trap pathogens and debris.",
        keyword: [],
        approvedBy: [],
    },

    // Histology - Connective Tissue
    {
        _id: "3",
        topicId: "2", // Connective Tissue
        type: "mcq",
        problem: "Which fiber type provides the greatest strength to connective tissue?",
        img: "",
        choices: ["Collagen fibers", "Elastic fibers", "Reticular fibers", "Ground substance"],
        answer: "Collagen fibers",
        explain: "Collagen fibers are strong and resist stretching.",
        keyword: [],
        approvedBy: [],
    },

    // Microbiology - Bacteriology
    {
        _id: "4",
        topicId: "4", // Bacteriology
        type: "mcq",
        problem: "Which structure protects bacteria from phagocytosis?",
        img: "",
        choices: ["Cell wall", "Capsule", "Flagella", "Ribosome"],
        answer: "Capsule",
        explain: "The capsule prevents phagocytes from adhering to the bacteria.",
        keyword: [],
        approvedBy: [],
    },

    // Microbiology - Helminth
    {
        _id: "5",
        topicId: "8", // Helminth
        type: "mcq",
        problem: "A patient from central Thailand presents with fatty diarrhea and eosinophilia. Stool examination reveals large operculated eggs. A detailed dietary history reveals regular consumption of water chestnuts. Which of the following parasites is the MOST likely causative agent, and what is the infective stage?",
        img: "",
        choices: "Opisthorchis viverrini with infective stage of metacercariae in raw fish///Fasciolopsis buski with infective stage of metacercariae on aquatic plants///Echinostoma malayanum with infective stage of cercariae in snails///Schistosoma japonicum with infective stage of cercariae penetrating the skin///Paragonimus heterotremus with infective stage of metacercariae in crabs",
        answer: "Fasciolopsis buski with infective stage of metacercariae on aquatic plants",
        select: "",
        explain: "Fasciolopsis buski is the giant intestinal fluke associated with eating aquatic plants such as water chestnuts. The eggs found in stool is characteristic. This is distinct from Opisthorchis viverrini where the infective stage is metacercariae but from eating raw fish",
        keyword: [],
        approvedBy: [],
    },
    {
        _id: "6",
        topicId: "8", // Helminth
        type: "short_answer",
        problem: "Identify the helminth",
        answer: "fasciolopsis buski",
        select: "",
        img: 'https://drive.google.com/open?id=1q7P59mjACbTKaORYwghuamhk_gT-ho69&usp=drive_copy',
        explain: "Gen 3 -> Trematode -> Intestinal fluke -> Fasciolopsis buski -> adult",
        keyword: [],
        approvedBy: [],
    },
];

export default allQuestions;