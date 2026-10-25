export interface LungNoduleInfo {
  detected: boolean;
  estimatedSizeMm: string;
  anatomicalLocation: string;
  attenuationType: string;
  marginCharacteristics: string;
  calcificationPattern: string;
}

export interface LungAnalysisResult {
  isMedicalLungScan: boolean;
  nonMedicalExplanation?: string;
  imageModality: string;
  malignancyLikelihoodPercent: number;
  riskCategory: string;
  lungRadsCategory: string;
  primaryNoduleOrLesion: LungNoduleInfo;
  malignancyRiskFactors: string[];
  benignOrReassuringFactors: string[];
  detailedFindingsSummary: string;
  recommendedAction: string;
  clinicalDisclaimer: string;
}

export interface SampleScan {
  id: string;
  name: string;
  subtitle: string;
  modality: string;
  description: string;
  previewUrl: string;
  defaultContext?: string;
}
