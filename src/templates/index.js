import classicBlueData from './classic-blue.json';

// In a real app, you would have thumbnail images for each template.
// For now, we'll use a placeholder.
const placeholderThumbnail = "https://via.placeholder.com/400x300.png?text=Template+Preview";

export const templates = [
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    thumbnail: placeholderThumbnail,
    data: classicBlueData,
  },
  // ...add other templates here
];
