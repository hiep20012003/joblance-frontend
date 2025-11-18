export enum OrderStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    IN_PROGRESS = "IN_PROGRESS",
    DELIVERED = "DELIVERED",
    CANCEL_PENDING = "CANCEL_PENDING",
    DISPUTED = "DISPUTED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED",
}

export enum MessageType {
    MEDIA = "media",
    TEXT = "text",
}

export enum NegotiationType {
    EXTEND_DELIVERY = 'EXTEND_DELIVERY',
    MODIFY_ORDER = 'MODIFY_ORDER',
    CANCEL_ORDER = 'CANCEL_ORDER',
}

export enum NegotiationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export const LANGUAGE_LEVEL = ['Basic', 'Conversational', 'Fluent', 'Native'];

export const POPULAR_SKILLS = [
    'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
    'Content Writing', 'SEO', 'Social Media', 'Video Editing',
    'Translation', 'Virtual Assistant', 'Data Entry', 'WordPress'
];

export const GIG_CATEGORIES = [
    {
        category: "Graphics & Design",
        subcategories: [
            "Logo Design",
            "Brand Style Guides",
            "Illustration",
            "Business Cards & Stationery",
            "Web & Mobile Design",
            "Presentation Design",
            "Packaging & Label Design",
            "Social Media Design",
            "Print Design",
            "Infographic Design",
            "Animation & Motion Graphics"
        ]
    },
    {
        category: "Digital Marketing",
        subcategories: [
            "Social Media Marketing",
            "Search Engine Optimization (SEO)",
            "Content Marketing",
            "Video Marketing",
            "Email Marketing",
            "Public Relations",
            "Influencer Marketing",
            "Marketing Strategy",
            "Web Analytics",
            "Affiliate Marketing",
            "Local SEO"
        ]
    },
    {
        category: "Writing & Translation",
        subcategories: [
            "Articles & Blog Posts",
            "Proofreading & Editing",
            "Translation",
            "Website Content",
            "Product Descriptions",
            "Resume Writing",
            "Cover Letters",
            "Scriptwriting",
            "Technical Writing",
            "Creative Writing",
            "Transcripts"
        ]
    },
    {
        category: "Video & Animation",
        subcategories: [
            "Whiteboard & Animated Explainers",
            "Video Editing",
            "Short Video Ads",
            "Logo Animation",
            "Intros & Outros",
            "Character Animation",
            "3D Animation",
            "Visual Effects"
        ]
    },
    {
        category: "Music & Audio",
        subcategories: [
            "Voice Over",
            "Mixing & Mastering",
            "Producers & Composers",
            "Session Musicians",
            "Jingles & Intros",
            "Sound Effects",
            "Podcast Editing"
        ]
    },
    {
        category: "Programming & Tech",
        subcategories: [
            "Web Programming",
            "WordPress",
            "Mobile Apps",
            "E-Commerce Development",
            "Game Development",
            "Chatbots",
            "Cybersecurity & Data Protection",
            "QA & Testing",
            "Data Science & Analytics"
        ]
    },
    {
        category: "Business",
        subcategories: [
            "Virtual Assistant",
            "Market Research",
            "Business Plans",
            "Financial Consulting",
            "HR Consulting",
            "Project Management",
            "Legal Consulting"
        ]
    },
    {
        category: "Consulting",
        subcategories: [
            "Business Consulting",
            "Marketing Consulting",
            "Technology Consulting",
            "Finance Consulting",
            "HR Consulting",
            "Legal Consulting",
            "Management Consulting"
        ]
    },
];


export const BASE_MIMES = {
    images: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
    ],
    videos: [
        'video/mp4',
        'video/webm',
        'video/quicktime'
    ],
    audio: [
        'audio/mpeg',    // mp3
        'audio/wav',
        'audio/ogg'
    ],
    documents: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/msword', // .doc
        'application/vnd.ms-excel', // .xls
        'application/vnd.ms-powerpoint', // .ppt
        'text/plain' // .txt
    ],
    archives: [
        'application/zip',
        'application/x-rar-compressed', // .rar
        'application/x-7z-compressed', // .7z
        'application/gzip' // .gz
    ],
    raw: [
        'application/octet-stream' // fallback for specific project files (psd, ai, fig, blend, cad…)
    ]
};

export const CHAT_FILE_ALLOWED_MIMES = {
    images: [
        ...BASE_MIMES.images,
    ],
    videos: [
        ...BASE_MIMES.videos,
    ],
    documents: [
        ...BASE_MIMES.documents.filter(mime =>
            mime === 'application/pdf' ||
            mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ),
    ],
    archives: [
        ...BASE_MIMES.archives,
    ]
};

export const GIG_DELIVERY_ALLOWED_MIMES = {
    images: [
        ...BASE_MIMES.images,
        'image/svg+xml',
        'image/bmp',
        'image/tiff'
    ],
    videos: [
        ...BASE_MIMES.videos,
    ],
    audio: [
        ...BASE_MIMES.audio,
    ],
    documents: [
        ...BASE_MIMES.documents,
    ],
    archives: [
        ...BASE_MIMES.archives,
    ],
    raw: [
        ...BASE_MIMES.raw,
    ]
};

export const RENDERABLE_IMAGE_MIMES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

// Helper function to flatten mime types
const flattenMimes = (mimesObject: Record<string, string[]>) => {
    return Object.values(mimesObject).flat();
};

export const ALL_CHAT_FILE_MIMES = flattenMimes(CHAT_FILE_ALLOWED_MIMES);
export const ALL_GIG_DELIVERY_MIMES = flattenMimes(GIG_DELIVERY_ALLOWED_MIMES);
