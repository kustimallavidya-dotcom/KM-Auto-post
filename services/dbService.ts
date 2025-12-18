
import { AppSettings, FBPage, PostingReport } from "../types";
import { DEFAULT_FOOTER } from "../constants";

const SETTINGS_KEY = 'kushti_post_settings';
const REPORTS_KEY = 'kushti_post_reports';

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) return JSON.parse(data);
  return {
    selectedFBPage: null,
    defaultFooter: DEFAULT_FOOTER,
    theme: 'dark',
    savedHashtags: ["#Kushti", "#MaharashtraKesari", "#IndianWrestling"]
  };
};

export const saveReport = (report: PostingReport) => {
  const reports = getReports();
  reports.unshift(report);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports.slice(0, 50))); // Keep last 50
};

export const getReports = (): PostingReport[] => {
  const data = localStorage.getItem(REPORTS_KEY);
  return data ? JSON.parse(data) : [];
};
