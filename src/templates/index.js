import classicBlueData from './classic-blue.json';
import modernRedData from './modern-red.json';
import elegantGoldData from './elegant-gold.json';
import simpleBlackData from './simple-black.json';
import professionalGreenData from './professional-green.json';
import vintagePurpleData from './vintage-purple.json';
import techInnovationSummitData from './tech-innovation-summit.json';
import leadershipWorkshopCompletionData from './leadership-workshop-completion.json';
import globalConferenceRecognitionData from './global-conference-recognition.json';
import skillsTrainingAchievementData from './skills-training-achievement.json';
import volunteerServiceRecognitionData from './volunteer-service-recognition.json';
import webinarParticipationData from './webinar-participation.json';

// NOTE:
// CertificateEditor expects `initialData` to be a valid Fabric.js JSON
// (matching `canvas.toJSON()`), not a custom config object.
// The previous event-driven configs caused blank canvases.
// This file now defines all templates as Fabric-ready JSON so
// selecting any template will immediately render in CertificateEditor.

export const templates = [
  // Simple, clean variants - only background and border styles differ
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    thumbnail:
      "data:image/svg+xml,%3Csvg width='400' height='260' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='260' fill='%23FFFFFF'/%3E%3Crect x='14' y='14' width='372' height='232' fill='none' stroke='%230256BF' stroke-width='3'/%3E%3C/svg%3E",
    data: classicBlueData,
  },
  {
    id: 'modern-red',
    name: 'Modern Red',
    // Soft red background, bold solid red border
    thumbnail:
      "data:image/svg+xml,%3Csvg width='400' height='260' xmlns='http://www.w3.org/2000/svg'%3E"
      + "%3Crect width='400' height='260' fill='%23FEF2F2'/%3E"
      + "%3Crect x='14' y='14' width='372' height='232' fill='none' stroke='%23DC2626' stroke-width='3'/%3E"
      + "%3C/svg%3E",
    data: modernRedData,
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    // Warm cream background, double-line gold border
    thumbnail:
      "data:image/svg+xml,%3Csvg width='400' height='260' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='260' fill='%23FFFBEB'/%3E%3Crect x='12' y='12' width='376' height='236' fill='none' stroke='%23D97706' stroke-width='2'/%3E%3Crect x='20' y='20' width='360' height='220' fill='none' stroke='%23FBBF24' stroke-width='1'/%3E%3C/svg%3E",
    data: elegantGoldData,
  },
  {
    id: 'simple-black',
    name: 'Simple Black',
    // Light gray background, thin solid black border
    thumbnail:
      "data:image/svg+xml,%3Csvg width='400' height='260' xmlns='http://www.w3.org/2000/svg'%3E"
      + "%3Crect width='400' height='260' fill='%23F9FAFB'/%3E"
      + "%3Crect x='18' y='18' width='364' height='224' fill='none' stroke='%23000000' stroke-width='1.5'/%3E"
      + "%3C/svg%3E",
    data: simpleBlackData,
  },
  {
    id: 'professional-green',
    name: 'Professional Green',
    // Mint green background, rounded green border
    thumbnail:
      "data:image/svg+xml,%3Csvg width='400' height='260' xmlns='http://www.w3.org/2000/svg'%3E"
      + "%3Crect width='400' height='260' fill='%23ECFDF5'/%3E"
      + "%3Crect x='16' y='16' width='368' height='228' rx='10' ry='10' fill='none' stroke='%23059669' stroke-width='2'/%3E"
      + "%3C/svg%3E",
    data: professionalGreenData,
  },
  {
    id: 'vintage-purple',
    name: 'Vintage Purple',
    // Soft lavender background, dashed purple border
    thumbnail:
      "data:image/svg+xml,%3Csvg width='400' height='260' xmlns='http://www.w3.org/2000/svg'%3E"
      + "%3Crect width='400' height='260' fill='%23F5F3FF'/%3E"
      + "%3Crect x='16' y='16' width='368' height='228' fill='none' stroke='%237C3AED' stroke-width='2' stroke-dasharray='5 3'/%3E"
      + "%3C/svg%3E",
    data: vintagePurpleData,
  },
  {
    id: 'tech-innovation-summit',
    name: 'Tech Innovation Summit Certificate',
    thumbnail:
      "data:image/svg+xml,%3Csvg width='400' height='260' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='260' fill='%23F9FAFB'/%3E%3Crect x='10' y='10' width='380' height='240' fill='none' stroke='%230F172A' stroke-width='4'/%3E%3Crect x='18' y='18' width='364' height='224' fill='none' stroke='%2338BDF8' stroke-width='2'/%3E%3Ctext x='200' y='70' text-anchor='middle' font-family='Playfair Display' font-size='14' fill='%230F172A'%3ETECH INNOVATION SUMMIT%3C/text%3E%3C/svg%3E",
    data: techInnovationSummitData,
  },
  {
    id: 'leadership-workshop-completion',
    name: 'Leadership Workshop Completion Certificate',
    thumbnail:
      "data:image/svg+xml,%3Csvg width='400' height='260' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='260' fill='%23FFF8F1'/%3E%3Crect x='8' y='8' width='384' height='244' fill='none' stroke='%231D3557' stroke-width='2'/%3E%3Crect x='18' y='18' width='364' height='224' fill='none' stroke='%23F4A261' stroke-width='1' stroke-dasharray='4 3'/%3E%3Ctext x='200' y='70' text-anchor='middle' font-family='Merriweather' font-size='14' fill='%231D3557'%3ELeadership Workshop%3C/text%3E%3C/svg%3E",
    data: leadershipWorkshopCompletionData,
  },
  {
    id: 'global-conference-recognition',
    name: 'Global Conference Recognition Certificate',
    thumbnail:
      "data:image/svg+xml,%3Csvg width='400' height='260' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='260' fill='%23F3F4F6'/%3E%3Crect y='0' width='400' height='40' fill='%23111827'/%3E%3Crect y='220' width='400' height='24' fill='%23111827'/%3E%3Ctext x='200' y='26' font-family='Lora' font-size='12' fill='white' text-anchor='middle'%3EGLOBAL CONFERENCE%3C/text%3E%3C/svg%3E",
    data: globalConferenceRecognitionData,
  },
  {
    id: 'skills-training-achievement',
    name: 'Skills Training Participation Certificate',
    thumbnail:
      "data:image/svg+xml,%3Csvg width='400' height='260' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='260' fill='%230F172A'/%3E%3Crect x='12' y='12' width='376' height='236' fill='none' stroke='%230EA5E9' stroke-width='2'/%3E%3C/svg%3E",
    data: skillsTrainingAchievementData,
  },
  {
    id: 'volunteer-service-recognition',
    name: 'Volunteer Service Recognition Certificate',
    thumbnail:
      "data:image/svg+xml,%3Csvg width='400' height='260' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='260' rx='16' ry='16' fill='%23F0FDF4'/%3E%3Crect x='10' y='10' width='380' height='240' rx='14' ry='14' fill='none' stroke='%23166534' stroke-width='2'/%3E%3C/svg%3E",
    data: volunteerServiceRecognitionData,
  },
  {
    id: 'webinar-participation',
    name: 'Professional Webinar Participation Certificate',
    thumbnail:
      "data:image/svg+xml,%3Csvg width='400' height='260' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='260' fill='%23FFFFFF'/%3E%3Crect width='400' height='70' fill='%230F172A'/%3E%3Ctext x='200' y='42' text-anchor='middle' font-family='Montserrat' font-size='12' fill='white'%3EWebinar%3C/text%3E%3C/svg%3E",
    data: webinarParticipationData,
  },
];
