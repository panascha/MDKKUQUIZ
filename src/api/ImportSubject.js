const allsubjects = [
    {
        id: 1,
        name: 'Histology',
        description: 'Study of the microscopic structure of tissues.',
        image: 'https://drive.google.com/open?id=1OFNV9-F9i-0VNOFwaimWA9e0mLXYNTIv&usp=drive_copy',
        path: '/subject/histology',
        topics: [
            { id: 1, name: 'Epithelial Tissue', description: 'Study of epithelial cells and their functions.' },
            { id: 2, name: 'Connective Tissue', description: 'Study of connective tissues and their roles.' },
            { id: 3, name: 'Muscle Tissue', description: 'Study of muscle cells and their types.' },
        ],
    },
    {
        id: 2,
        name: 'Microbiology',
        description: 'Study of microorganisms, including bacteria, viruses, fungi, and parasites.',
        image: 'https://drive.google.com/open?id=1JuhAwMP-x-O221WMiLMuGDaa0ZXhQZol&usp=drive_copy',
        path: '/subject/microbiology',
        topics: [
            { id: 1, name: 'Bacteriology', description: 'Study of bacteria and their characteristics.' },
            { id: 2, name: 'Virology', description: 'Study of viruses and their effects on organisms.' },
            { id: 3, name: 'Mycology', description: 'Study of fungi and their roles in ecosystems.' },
        ],
    },
    { id: 3, name: 'Anatomy', description: 'Study of the structure of the human body.', image: 'https://example.com/anatomy.jpg', path: '/subject/anatomy' },
    { id: 4, name: 'Pharmacology', description: 'Study of drugs and their effects on the body.', image: 'https://example.com/pharmacology.jpg', path: '/subject/pharmacology' },
    { id: 5, name: 'Biochemistry', description: 'Study of the chemical processes within and related to living organisms.', image: 'https://example.com/biochemistry.jpg', path: '/subject/biochemistry' },
    { id: 6, name: 'Pathology', description: 'Study of the causes and effects of diseases.', image: 'https://example.com/pathology.jpg', path: '/subject/pathology' },
    { id: 7, name: 'Physiology', description: 'Study of the normal functions of living organisms and their parts.', image: 'https://example.com/physiology.jpg', path: '/subject/physiology' },
    { id: 8, name: 'Immunology', description: 'Study of the immune system and its response to pathogens.', image: 'https://example.com/immunology.jpg', path: '/subject/immunology' },
];

const transformURL = (img) => {
    const match = img.match(/\/d\/(.*?)\//) || img.match(/id=([^&]+)/);
    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}?authuser=1=w1000-h1000`;
    }
    return img;
};

// Transform the image URLs in the array
const updatedSubjects = allsubjects.map(subject => ({
    ...subject,
    image: transformURL(subject.image),
}));

export default updatedSubjects;