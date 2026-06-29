export interface ApplicationEmailResults {
  student: boolean;
  club: boolean;
  guardians: boolean;
}

export interface ApplicationSubmitResponse {
  success: boolean;
  dbSaved: boolean;
  emailsSent: ApplicationEmailResults;
  warnings: string[];
  data?: unknown;
  error?: string;
  details?: string | null;
}
