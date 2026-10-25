import { SampleScan } from '../types';

// High-fidelity SVG generator for medical thoracic CT & radiograph presets
function createCtSvg({
  noduleType = 'spiculated',
  noduleX = 330,
  noduleY = 200,
  noduleSize = 14,
  label = 'AXIAL THORACIC CT SLICE',
}: {
  noduleType?: 'spiculated' | 'calcified' | 'ggo' | 'none';
  noduleX?: number;
  noduleY?: number;
  noduleSize?: number;
  label?: string;
}): string {
  // Medical greyscale palette: dark lung window background, bony cortex white, lung parenchymal vessels grey
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
    <rect width="500" height="500" fill="%2305080c"/>
    <!-- Thoracic Body Contour -->
    <ellipse cx="250" cy="250" rx="210" ry="175" fill="%231a202c" stroke="%23334155" stroke-width="4"/>
    <!-- Subcutaneous fat and muscle layer -->
    <ellipse cx="250" cy="250" rx="195" ry="160" fill="%230f172a" stroke="%231e293b" stroke-width="2"/>
    
    <!-- Thoracic Spine (Vertebra) Posterior -->
    <path d="M 230,360 Q 250,335 270,360 Q 250,385 230,360 Z" fill="%23f8fafc" stroke="%2394a3b8" stroke-width="1.5"/>
    <circle cx="250" cy="358" r="9" fill="%230f172a"/>
    <path d="M 220,365 L 195,385 M 280,365 L 305,385 M 250,375 L 250,405" stroke="%23e2e8f0" stroke-width="3" stroke-linecap="round"/>

    <!-- Anterior Sternum -->
    <path d="M 225,100 Q 250,96 275,100 L 270,115 Q 250,112 230,115 Z" fill="%23f1f5f9"/>

    <!-- Ribs cage cross-sections -->
    <ellipse cx="75" cy="220" rx="8" ry="4" fill="%23e2e8f0" transform="rotate(-30 75 220)"/>
    <ellipse cx="85" cy="280" rx="8" ry="4" fill="%23e2e8f0" transform="rotate(-15 85 280)"/>
    <ellipse cx="110" cy="340" rx="8" ry="4" fill="%23e2e8f0" transform="rotate(10 110 340)"/>
    <ellipse cx="425" cy="220" rx="8" ry="4" fill="%23e2e8f0" transform="rotate(30 425 220)"/>
    <ellipse cx="415" cy="280" rx="8" ry="4" fill="%23e2e8f0" transform="rotate(15 415 280)"/>
    <ellipse cx="390" cy="340" rx="8" ry="4" fill="%23e2e8f0" transform="rotate(-10 390 340)"/>

    <!-- Right Lung Field (Patient Right = Left on screen) -->
    <path d="M 225,150 Q 150,140 110,210 Q 95,290 145,340 Q 200,345 220,290 Q 225,220 225,150 Z" fill="%23030712" stroke="%2338bdf8" stroke-width="1" stroke-opacity="0.3"/>
    
    <!-- Left Lung Field (Patient Left = Right on screen) -->
    <path d="M 275,150 Q 350,140 390,210 Q 405,290 355,340 Q 300,345 280,290 Q 275,220 275,150 Z" fill="%23030712" stroke="%2338bdf8" stroke-width="1" stroke-opacity="0.3"/>

    <!-- Mediastinum & Cardiac / Great Vessels Area -->
    <path d="M 225,150 Q 250,145 275,150 Q 295,220 280,290 Q 250,335 220,290 Q 205,220 225,150 Z" fill="%231e293b"/>
    <!-- Ascending & Descending Aorta / Pulmonary Artery Trunk -->
    <circle cx="240" cy="195" r="14" fill="%23334155" stroke="%2364748b" stroke-width="1"/>
    <circle cx="265" cy="235" r="16" fill="%23334155" stroke="%2364748b" stroke-width="1"/>
    <!-- Main Bronchi (bifurcation / carina) -->
    <path d="M 242,260 Q 230,275 210,285" stroke="%23020617" stroke-width="5" stroke-linecap="round"/>
    <path d="M 258,260 Q 270,275 290,285" stroke="%23020617" stroke-width="5" stroke-linecap="round"/>

    <!-- Vascular Bronchovascular Markings in Lungs -->
    <g stroke="%23475569" stroke-width="1.5" stroke-linecap="round" opacity="0.6">
      <path d="M 210,280 Q 170,270 140,260 M 170,270 Q 150,295 135,310 M 190,250 Q 160,220 140,195 M 165,225 Q 145,210 130,220"/>
      <path d="M 290,280 Q 330,270 360,260 M 330,270 Q 350,295 365,310 M 310,250 Q 340,220 360,195 M 335,225 Q 355,210 370,220"/>
    </g>

    <!-- Specific Nodule Injection -->
    ${
      noduleType === 'spiculated'
        ? `<!-- Spiculated Malignant Nodule (Corona Radiata) -->
          <g transform="translate(${noduleX}, ${noduleY})">
            <!-- Spiculations / radiating arms -->
            <path d="M 0,0 L -18,-10 M 0,0 L 16,-14 M 0,0 L 20,8 M 0,0 L 12,20 M 0,0 L -14,18 M 0,0 L -22,4 M 0,0 L 4,-20 M 0,0 L 26,0 M 0,0 L -10,-18" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round"/>
            <!-- Solid core with irregular lobulation -->
            <path d="M -10,-8 Q -4,-14 6,-10 Q 15,-4 12,8 Q 4,14 -8,11 Q -14,4 -10,-8 Z" fill="%23f8fafc" stroke="%23e2e8f0" stroke-width="1.5"/>
            <!-- Pleural retraction line tag -->
            <path d="M 12,4 L 38,-2" stroke="%2394a3b8" stroke-dasharray="2,2" stroke-width="1.5"/>
          </g>`
        : noduleType === 'calcified'
        ? `<!-- Benign Granuloma / Hamartoma: dense central calcification -->
          <g transform="translate(${noduleX}, ${noduleY})">
            <circle cx="0" cy="0" r="7" fill="%23f8fafc" stroke="%23e2e8f0" stroke-width="1.5"/>
            <circle cx="0" cy="0" r="4" fill="%23ffffff"/>
          </g>`
        : noduleType === 'ggo'
        ? `<!-- Part-solid / Ground Glass Opacity (Subsolid Nodule) -->
          <g transform="translate(${noduleX}, ${noduleY})">
            <!-- Hazy ground-glass halo -->
            <ellipse cx="0" cy="0" rx="18" ry="15" fill="%2394a3b8" fill-opacity="0.45" stroke="%23cbd5e1" stroke-width="1" stroke-dasharray="3,2"/>
            <!-- Central solid nodular component -->
            <circle cx="2" cy="-1" r="5" fill="%23f1f5f9"/>
          </g>`
        : ''
    }

    <!-- Medical DICOM HUD Overlay -->
    <text x="15" y="25" fill="%2338bdf8" font-family="monospace" font-size="11" font-weight="bold">THORACIC CT AXIAL [LUNG WINDOW]</text>
    <text x="15" y="42" fill="%2394a3b8" font-family="monospace" font-size="10">WL: -600  WW: 1500  THK: 1.25mm</text>
    <text x="15" y="58" fill="%2364748b" font-family="monospace" font-size="9">${label}</text>
    
    <text x="480" y="25" fill="%2394a3b8" font-family="monospace" font-size="11" text-anchor="end">R</text>
    <text x="20" y="255" fill="%2338bdf8" font-family="monospace" font-size="12" font-weight="bold">A</text>
    <text x="480" y="255" fill="%2338bdf8" font-family="monospace" font-size="12" font-weight="bold">P</text>
    <text x="250" y="485" fill="%2364748b" font-family="monospace" font-size="9" text-anchor="middle">512 x 512 MATRIX - PULMOSCAN ASSIST</text>
  </svg>`;
}

// Chest X-Ray SVG representation
function createCxrSvg(): string {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
    <rect width="500" height="500" fill="%2304070c"/>
    <!-- Thorax Outer Boundary -->
    <path d="M 120,40 Q 250,20 380,40 Q 440,150 430,390 Q 380,440 250,445 Q 120,440 70,390 Q 60,150 120,40 Z" fill="%230f172a" opacity="0.8"/>
    
    <!-- Spine column and clavicles -->
    <rect x="242" y="30" width="16" height="380" fill="%23f1f5f9" opacity="0.3"/>
    <!-- Clavicles -->
    <path d="M 245,75 Q 160,70 95,95" stroke="%23f8fafc" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.75"/>
    <path d="M 255,75 Q 340,70 405,95" stroke="%23f8fafc" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.75"/>
    
    <!-- Rib arcs -->
    <g stroke="%23cbd5e1" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.25">
      <path d="M 245,110 Q 150,130 90,190"/>
      <path d="M 245,150 Q 140,180 85,250"/>
      <path d="M 245,200 Q 140,240 85,310"/>
      <path d="M 245,250 Q 150,300 95,370"/>

      <path d="M 255,110 Q 350,130 410,190"/>
      <path d="M 255,150 Q 360,180 415,250"/>
      <path d="M 255,200 Q 360,240 415,310"/>
      <path d="M 255,250 Q 350,300 405,370"/>
    </g>

    <!-- Lung fields (air is radiolucent / black) -->
    <path d="M 140,95 Q 180,85 225,95 Q 225,230 190,320 Q 140,350 95,350 Q 80,240 140,95 Z" fill="%23020617"/>
    <path d="M 360,95 Q 320,85 275,95 Q 275,210 325,320 Q 360,350 405,350 Q 420,240 360,95 Z" fill="%23020617"/>

    <!-- Cardiac Silhouette -->
    <path d="M 220,170 Q 235,210 215,270 Q 200,340 270,360 Q 325,350 310,260 Q 280,180 270,170 Z" fill="%23e2e8f0" opacity="0.6"/>

    <!-- Diaphragm Domes -->
    <path d="M 80,380 Q 150,330 220,350" stroke="%23f8fafc" stroke-width="4" fill="%230f172a"/>
    <path d="M 270,360 Q 340,345 420,385" stroke="%23f8fafc" stroke-width="4" fill="%230f172a"/>
    <!-- Costophrenic sulci sharp -->
    <path d="M 80,380 L 70,410" stroke="%2394a3b8" stroke-width="2"/>
    <path d="M 420,385 L 430,410" stroke="%2394a3b8" stroke-width="2"/>

    <!-- Subtle bronchovascular arborization -->
    <g stroke="%2394a3b8" stroke-width="1.2" opacity="0.4">
      <path d="M 210,210 Q 170,190 140,170 M 205,230 Q 160,250 120,280"/>
      <path d="M 290,210 Q 330,190 360,170 M 295,230 Q 340,250 380,280"/>
    </g>

    <!-- Overlay Info -->
    <text x="20" y="30" fill="%2338bdf8" font-family="monospace" font-size="12" font-weight="bold">CHEST RADIOGRAPH [PA UPRIGHT]</text>
    <text x="20" y="48" fill="%2394a3b8" font-family="monospace" font-size="10">Technique: 120 kVp, 3 mAs | Normal Lung Fields</text>
    <text x="475" y="35" fill="%23f8fafc" font-family="monospace" font-size="16" font-weight="bold" text-anchor="end">L</text>
  </svg>`;
}

export const SAMPLE_SCANS: SampleScan[] = [
  {
    id: 'case-1-spiculated-high-risk',
    name: 'Suspicious Spiculated Mass',
    subtitle: 'High Malignancy Risk (Lung-RADS 4B/4X)',
    modality: 'Chest CT (Axial Lung Window)',
    description: '18mm solid pulmonary nodule with radiating spiculation (corona radiata) and pleural tagging in the peripheral upper lobe.',
    previewUrl: createCtSvg({
      noduleType: 'spiculated',
      noduleX: 350,
      noduleY: 195,
      noduleSize: 18,
      label: 'CASE A: 18mm SPICULATED NODULE (PERIPHERAL)',
    }),
    defaultContext: '64-year-old former smoker, incidental finding on thoracic screening CT',
  },
  {
    id: 'case-2-calcified-benign',
    name: 'Calcified Granuloma',
    subtitle: 'Benign Hallmark (Lung-RADS 2)',
    modality: 'Chest CT (Axial Lung Window)',
    description: 'Dense 6mm well-circumscribed nodule with classic central/laminated calcification, consistent with healed histoplasmosis/granulomatous disease.',
    previewUrl: createCtSvg({
      noduleType: 'calcified',
      noduleX: 160,
      noduleY: 230,
      noduleSize: 6,
      label: 'CASE B: 6mm DENSELY CALCIFIED GRANULOMA',
    }),
    defaultContext: '48-year-old non-smoker, pre-operative routine evaluation',
  },
  {
    id: 'case-3-subsolid-ggo',
    name: 'Part-Solid GGO Nodule',
    subtitle: 'Intermediate Suspicion (Lung-RADS 4A)',
    modality: 'Chest CT (Axial Lung Window)',
    description: '14mm part-solid ground-glass opacity with 5mm solid central component in left lung field requiring 3-month follow-up LDCT.',
    previewUrl: createCtSvg({
      noduleType: 'ggo',
      noduleX: 345,
      noduleY: 220,
      noduleSize: 14,
      label: 'CASE C: 14mm PART-SOLID GGO NODULE',
    }),
    defaultContext: '59-year-old female, baseline low-dose CT lung screening',
  },
  {
    id: 'case-4-normal-cxr',
    name: 'Normal Chest X-Ray',
    subtitle: 'Clear Parenchyma (Negative)',
    modality: 'Chest Radiograph (PA View)',
    description: 'Clear bilateral lung fields without focal consolidation, pneumothorax, effusion, or identifiable suspicious mass.',
    previewUrl: createCxrSvg(),
    defaultContext: '35-year-old annual corporate wellness physical',
  },
];
