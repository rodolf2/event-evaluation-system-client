/**
 * Sanitization utility to prevent XSS attacks
 * Escapes HTML special characters and removes dangerous scripts
 */

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} Escaped text safe for HTML rendering
 */
export const escapeHtml = (text) => {
  if (typeof text !== "string") return text;

  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitizes user input by removing potentially dangerous content
 * @param {string} input - The user input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  // Remove script tags and their content
  let sanitized = input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove data: protocol (can execute scripts)
  sanitized = sanitized.replace(/data:text\/html/gi, "");

  return sanitized.trim();
};

/**
 * Creates a safe text node that prevents XSS
 * Use this when setting text content dynamically
 * @param {string} text - The text to display
 * @returns {HTMLElement} Safe text container
 */
export const createSafeTextNode = (text) => {
  const div = document.createElement("div");
  div.textContent = text; // textContent prevents HTML injection
  return div;
};

/**
 * Validates and sanitizes URLs to prevent malicious redirects
 * @param {string} url - The URL to validate
 * @returns {string} Safe URL or empty string if invalid
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== "string") return "";

  // Remove dangerous protocols
  const dangerousProtocols = ["javascript:", "data:", "vbscript:"];
  const lowerUrl = url.toLowerCase().trim();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return "";
    }
  }

  return url;
};

/**
 * Sanitizes object properties recursively
 * @param {object} obj - The object to sanitize
 * @returns {object} Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

export default {
  escapeHtml,
  sanitizeInput,
  createSafeTextNode,
  sanitizeUrl,
  sanitizeObject,
};
