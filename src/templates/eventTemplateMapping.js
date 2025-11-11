/**
 * Event-Based Certificate Templates
 * Maps events to their specific certificate templates
 * Allows different events to have different certificate designs
 */

import classicBlueData from "./classic-blue.json";
import modernRedData from "./modern-red.json";
import elegantGoldData from "./elegant-gold.json";
import simpleBlackData from "./simple-black.json";
import professionalGreenData from "./professional-green.json";
import vintagePurpleData from "./vintage-purple.json";

// Template registry
export const TEMPLATE_LIBRARY = {
  CLASSIC_BLUE: {
    id: "classic-blue",
    name: "Classic Blue",
    description: "Professional blue design with elegant borders",
    data: classicBlueData,
    category: "professional",
  },
  MODERN_RED: {
    id: "modern-red",
    name: "Modern Red",
    description: "Contemporary design with vibrant red accents",
    data: modernRedData,
    category: "modern",
  },
  ELEGANT_GOLD: {
    id: "elegant-gold",
    name: "Elegant Gold",
    description: "Luxurious gold theme with ornate elements",
    data: elegantGoldData,
    category: "elegant",
  },
  SIMPLE_BLACK: {
    id: "simple-black",
    name: "Simple Black",
    description: "Minimalist design with clean typography",
    data: simpleBlackData,
    category: "minimal",
  },
  PROFESSIONAL_GREEN: {
    id: "professional-green",
    name: "Professional Green",
    description: "Corporate green design for business events",
    data: professionalGreenData,
    category: "corporate",
  },
  VINTAGE_PURPLE: {
    id: "vintage-purple",
    name: "Vintage Purple",
    description: "Classic vintage aesthetic with purple tones",
    data: vintagePurpleData,
    category: "vintage",
  },
};

/**
 * Event-to-Template Mapping
 * Define specific templates for specific event types
 * Each event can have a different default template
 */
export const EVENT_TEMPLATE_MAPPING = {
  "academic-achievement": [
    TEMPLATE_LIBRARY.PROFESSIONAL_GREEN,
    TEMPLATE_LIBRARY.CLASSIC_BLUE,
  ],
  "tech-summit": [TEMPLATE_LIBRARY.MODERN_RED, TEMPLATE_LIBRARY.ELEGANT_GOLD],
  workshop: [
    TEMPLATE_LIBRARY.SIMPLE_BLACK,
    TEMPLATE_LIBRARY.PROFESSIONAL_GREEN,
  ],
  conference: [TEMPLATE_LIBRARY.ELEGANT_GOLD, TEMPLATE_LIBRARY.CLASSIC_BLUE],
  competition: [TEMPLATE_LIBRARY.MODERN_RED, TEMPLATE_LIBRARY.VINTAGE_PURPLE],
  training: [
    TEMPLATE_LIBRARY.PROFESSIONAL_GREEN,
    TEMPLATE_LIBRARY.SIMPLE_BLACK,
  ],
  certification: [
    TEMPLATE_LIBRARY.CLASSIC_BLUE,
    TEMPLATE_LIBRARY.PROFESSIONAL_GREEN,
  ],
  general: Object.values(TEMPLATE_LIBRARY), // All templates available for general events
};

/**
 * Get templates for a specific event
 * @param {string} eventType - Type of event
 * @param {string} eventName - Name of event (fallback to general if type not found)
 * @returns {Array} Array of template objects
 */
export const getTemplatesForEvent = (eventType, eventName) => {
  // Try event type first
  if (eventType && EVENT_TEMPLATE_MAPPING[eventType]) {
    return EVENT_TEMPLATE_MAPPING[eventType];
  }

  // Fallback to keyword matching on event name
  if (eventName) {
    const nameLower = eventName.toLowerCase();

    if (nameLower.includes("tech") || nameLower.includes("summit")) {
      return EVENT_TEMPLATE_MAPPING["tech-summit"];
    }
    if (nameLower.includes("workshop")) {
      return EVENT_TEMPLATE_MAPPING["workshop"];
    }
    if (nameLower.includes("conference")) {
      return EVENT_TEMPLATE_MAPPING["conference"];
    }
    if (nameLower.includes("competition") || nameLower.includes("contest")) {
      return EVENT_TEMPLATE_MAPPING["competition"];
    }
    if (nameLower.includes("training") || nameLower.includes("course")) {
      return EVENT_TEMPLATE_MAPPING["training"];
    }
    if (
      nameLower.includes("certification") ||
      nameLower.includes("certificate")
    ) {
      return EVENT_TEMPLATE_MAPPING["certification"];
    }
    if (nameLower.includes("academic") || nameLower.includes("achievement")) {
      return EVENT_TEMPLATE_MAPPING["academic-achievement"];
    }
  }

  // Default to all templates
  return EVENT_TEMPLATE_MAPPING.general;
};

/**
 * Get all available templates
 * @returns {Array} All templates
 */
export const getAllTemplates = () => {
  return Object.values(TEMPLATE_LIBRARY);
};

/**
 * Get template by ID
 * @param {string} templateId - Template ID
 * @returns {Object} Template object
 */
export const getTemplateById = (templateId) => {
  return Object.values(TEMPLATE_LIBRARY).find((t) => t.id === templateId);
};

/**
 * Get templates by category
 * @param {string} category - Category name
 * @returns {Array} Templates in category
 */
export const getTemplatesByCategory = (category) => {
  return Object.values(TEMPLATE_LIBRARY).filter((t) => t.category === category);
};

/**
 * Get unique categories
 * @returns {Array} All categories
 */
export const getAllCategories = () => {
  const categories = new Set();
  Object.values(TEMPLATE_LIBRARY).forEach((t) => {
    categories.add(t.category);
  });
  return Array.from(categories);
};

export default TEMPLATE_LIBRARY;
