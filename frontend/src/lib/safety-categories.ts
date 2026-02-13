export interface SafetyObservation {
  text: string;
  riskType: 'OSHA' | 'Behavioral' | 'Equipment' | 'Process';
  oshaRef?: string;
  defaultSeverity: 'Low' | 'Medium' | 'High';
}

export interface SafetyCategory {
  name: string;
  observations: SafetyObservation[];
}

export const SAFETY_CATEGORIES: SafetyCategory[] = [
  {
    name: 'Fall Protection',
    observations: [
      { text: 'Workers wearing harnesses when above 6 feet', riskType: 'OSHA', oshaRef: '1926.501(b)(1)', defaultSeverity: 'High' },
      { text: 'Guardrails installed at open edges/platforms', riskType: 'OSHA', oshaRef: '1926.502(b)', defaultSeverity: 'High' },
      { text: 'Floor holes covered and secured', riskType: 'OSHA', oshaRef: '1926.502(i)', defaultSeverity: 'High' },
      { text: 'Ladders properly secured and positioned', riskType: 'OSHA', oshaRef: '1926.1053(b)', defaultSeverity: 'Medium' },
      { text: 'Scaffolding has proper guardrails and toeboards', riskType: 'OSHA', oshaRef: '1926.451(g)', defaultSeverity: 'High' },
      { text: 'Safety nets in place where required', riskType: 'OSHA', oshaRef: '1926.502(c)', defaultSeverity: 'High' },
      { text: 'Fall protection training current for all workers', riskType: 'Behavioral', defaultSeverity: 'Medium' },
    ],
  },
  {
    name: 'Housekeeping',
    observations: [
      { text: 'Work areas clean and organized', riskType: 'Behavioral', defaultSeverity: 'Low' },
      { text: 'Walkways clear of debris and obstructions', riskType: 'OSHA', oshaRef: '1926.25(a)', defaultSeverity: 'Medium' },
      { text: 'Materials properly stored and stacked', riskType: 'OSHA', oshaRef: '1926.250(a)', defaultSeverity: 'Medium' },
      { text: 'Trash and waste properly disposed', riskType: 'Behavioral', defaultSeverity: 'Low' },
      { text: 'Spills cleaned up promptly', riskType: 'Behavioral', defaultSeverity: 'Medium' },
      { text: 'Protruding nails removed or bent over', riskType: 'OSHA', oshaRef: '1926.25(a)', defaultSeverity: 'Medium' },
    ],
  },
  {
    name: 'PPE',
    observations: [
      { text: 'Hard hats worn in designated areas', riskType: 'OSHA', oshaRef: '1926.100(a)', defaultSeverity: 'Medium' },
      { text: 'Safety glasses/goggles worn when required', riskType: 'OSHA', oshaRef: '1926.102(a)', defaultSeverity: 'Medium' },
      { text: 'High-visibility vests worn', riskType: 'Behavioral', defaultSeverity: 'Low' },
      { text: 'Steel-toed boots worn', riskType: 'OSHA', oshaRef: '1926.96', defaultSeverity: 'Medium' },
      { text: 'Hearing protection used in high-noise areas', riskType: 'OSHA', oshaRef: '1926.52', defaultSeverity: 'Medium' },
      { text: 'Gloves worn for appropriate tasks', riskType: 'Behavioral', defaultSeverity: 'Low' },
      { text: 'Respiratory protection used when required', riskType: 'OSHA', oshaRef: '1926.103', defaultSeverity: 'High' },
    ],
  },
  {
    name: 'Electrical Safety',
    observations: [
      { text: 'GFCI protection for all temporary outlets', riskType: 'OSHA', oshaRef: '1926.405(a)(2)(ii)', defaultSeverity: 'High' },
      { text: 'Extension cords in good condition (no splices/damage)', riskType: 'Equipment', defaultSeverity: 'Medium' },
      { text: 'Electrical panels accessible and labeled', riskType: 'OSHA', oshaRef: '1926.405(b)', defaultSeverity: 'Medium' },
      { text: 'Temporary wiring properly installed', riskType: 'OSHA', oshaRef: '1926.405(a)', defaultSeverity: 'High' },
      { text: 'Lockout/tagout procedures followed', riskType: 'OSHA', oshaRef: '1926.417', defaultSeverity: 'High' },
      { text: 'Proper clearance from overhead power lines', riskType: 'OSHA', oshaRef: '1926.416(a)', defaultSeverity: 'High' },
    ],
  },
  {
    name: 'Fire Protection',
    observations: [
      { text: 'Fire extinguishers accessible and inspected', riskType: 'OSHA', oshaRef: '1926.150(a)', defaultSeverity: 'Medium' },
      { text: 'Hot work permits in place', riskType: 'Process', defaultSeverity: 'High' },
      { text: 'Flammable materials properly stored', riskType: 'OSHA', oshaRef: '1926.152(a)', defaultSeverity: 'High' },
      { text: 'Emergency exits marked and unobstructed', riskType: 'OSHA', oshaRef: '1926.34', defaultSeverity: 'Medium' },
      { text: 'Fire watch maintained during hot work', riskType: 'Process', defaultSeverity: 'High' },
    ],
  },
  {
    name: 'Scaffolding',
    observations: [
      { text: 'Scaffold erected on firm foundation', riskType: 'OSHA', oshaRef: '1926.451(c)', defaultSeverity: 'High' },
      { text: 'Guardrails on all open sides above 10 feet', riskType: 'OSHA', oshaRef: '1926.451(g)', defaultSeverity: 'High' },
      { text: 'Access ladders provided', riskType: 'OSHA', oshaRef: '1926.451(e)', defaultSeverity: 'Medium' },
      { text: 'Scaffold tagged/inspected by competent person', riskType: 'OSHA', oshaRef: '1926.451(f)(3)', defaultSeverity: 'High' },
      { text: 'Planking in good condition and secured', riskType: 'Equipment', defaultSeverity: 'High' },
      { text: 'No makeshift scaffolding in use', riskType: 'Behavioral', defaultSeverity: 'High' },
    ],
  },
  {
    name: 'Excavation & Trenching',
    observations: [
      { text: 'Excavation properly sloped or shored', riskType: 'OSHA', oshaRef: '1926.652', defaultSeverity: 'High' },
      { text: 'Spoil piles set back from edge (min 2 feet)', riskType: 'OSHA', oshaRef: '1926.651(j)', defaultSeverity: 'High' },
      { text: 'Utilities located and marked before digging', riskType: 'Process', defaultSeverity: 'High' },
      { text: 'Access/egress provided within 25 feet of workers', riskType: 'OSHA', oshaRef: '1926.651(c)', defaultSeverity: 'High' },
      { text: 'Competent person inspecting daily', riskType: 'OSHA', oshaRef: '1926.651(k)', defaultSeverity: 'High' },
    ],
  },
  {
    name: 'Crane & Rigging',
    observations: [
      { text: 'Daily crane inspection completed and documented', riskType: 'OSHA', oshaRef: '1926.1412', defaultSeverity: 'High' },
      { text: 'Outriggers fully extended and on pads', riskType: 'Equipment', defaultSeverity: 'High' },
      { text: 'Load charts available and followed', riskType: 'OSHA', oshaRef: '1926.1417', defaultSeverity: 'High' },
      { text: 'Rigging hardware in good condition', riskType: 'Equipment', defaultSeverity: 'High' },
      { text: 'Signal person designated and qualified', riskType: 'OSHA', oshaRef: '1926.1419', defaultSeverity: 'Medium' },
    ],
  },
  {
    name: 'Confined Space',
    observations: [
      { text: 'Permit issued and posted at entry', riskType: 'OSHA', oshaRef: '1926.1204', defaultSeverity: 'High' },
      { text: 'Atmospheric monitoring conducted', riskType: 'OSHA', oshaRef: '1926.1204(e)', defaultSeverity: 'High' },
      { text: 'Rescue plan in place', riskType: 'Process', defaultSeverity: 'High' },
      { text: 'Attendant stationed at entry', riskType: 'OSHA', oshaRef: '1926.1209', defaultSeverity: 'High' },
      { text: 'Ventilation provided', riskType: 'Equipment', defaultSeverity: 'High' },
    ],
  },
  {
    name: 'Environmental',
    observations: [
      { text: 'Stormwater BMPs in place and maintained', riskType: 'Process', defaultSeverity: 'Medium' },
      { text: 'Dust control measures active', riskType: 'Process', defaultSeverity: 'Medium' },
      { text: 'Waste properly containerized and labeled', riskType: 'Process', defaultSeverity: 'Medium' },
      { text: 'Spill kits available and stocked', riskType: 'Equipment', defaultSeverity: 'Low' },
      { text: 'Erosion control maintained', riskType: 'Process', defaultSeverity: 'Medium' },
    ],
  },
  {
    name: 'General Safety',
    observations: [
      { text: 'Safety signage posted and visible', riskType: 'Behavioral', defaultSeverity: 'Low' },
      { text: 'First aid kit accessible and stocked', riskType: 'OSHA', oshaRef: '1926.50(d)', defaultSeverity: 'Medium' },
      { text: 'Emergency contact information posted', riskType: 'Process', defaultSeverity: 'Low' },
      { text: 'Toolbox talks/safety meetings conducted', riskType: 'Behavioral', defaultSeverity: 'Low' },
      { text: 'Workers oriented to site-specific hazards', riskType: 'Behavioral', defaultSeverity: 'Medium' },
      { text: 'No horseplay or unsafe behavior observed', riskType: 'Behavioral', defaultSeverity: 'Medium' },
    ],
  },
];
