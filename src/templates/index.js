import classicBlueData from './classic-blue.json';
import modernRedData from './modern-red.json';
import elegantGoldData from './elegant-gold.json';
import simpleBlackData from './simple-black.json';
import professionalGreenData from './professional-green.json';
import vintagePurpleData from './vintage-purple.json';

// Template thumbnails using local images and SVG data URLs
export const templates = [
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    thumbnail: "/thumbnails/thumbnail_1.png",
    data: classicBlueData,
  },
  {
    id: 'modern-red',
    name: 'Modern Red',
    thumbnail: "data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='300' fill='%23DC2626'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3EModern Red%3C/text%3E%3C/svg%3E",
    data: modernRedData,
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    thumbnail: "data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='300' fill='%23D97706'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3EElegant Gold%3C/text%3E%3C/svg%3E",
    data: elegantGoldData,
  },
  {
    id: 'simple-black',
    name: 'Simple Black',
    thumbnail: "data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='300' fill='%23000000'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3ESimple Black%3C/text%3E%3C/svg%3E",
    data: simpleBlackData,
  },
  {
    id: 'professional-green',
    name: 'Professional Green',
    thumbnail: "data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='300' fill='%23059669'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle'%3EProfessional Green%3C/text%3E%3C/svg%3E",
    data: professionalGreenData,
  },
  {
    id: 'vintage-purple',
    name: 'Vintage Purple',
    thumbnail: "data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='300' fill='%237C3AED'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3EVintage Purple%3C/text%3E%3C/svg%3E",
    data: vintagePurpleData,
  },
];
