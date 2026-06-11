import { ROUTES } from './routes';

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  children?: SidebarItem[];
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    items: [
      { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
    ],
  },
  {
    title: 'Data Pipeline',
    items: [
      {
        label: 'Data Ingestion', href: ROUTES.INGESTION.ROOT, icon: 'Upload',
        children: [
          { label: 'Upload CSV', href: ROUTES.INGESTION.UPLOAD, icon: 'FileUp' },
          { label: 'Preview', href: ROUTES.INGESTION.PREVIEW, icon: 'Eye' },
          { label: 'Validation', href: ROUTES.INGESTION.VALIDATION, icon: 'CheckCircle' },
        ],
      },
      // Preprocessing aur Image Generation hidden — pages exist karte hain, sirf sidebar se hata diya
    ],
  },
  {
    title: 'AI Analysis',
    items: [
      {
        label: 'CNN Analysis', href: ROUTES.CNN_ANALYSIS.ROOT, icon: 'Brain',
        children: [
          // Embeddings aur Feature Maps hidden
          { label: 'Grad-CAM', href: ROUTES.CNN_ANALYSIS.GRADCAM, icon: 'Crosshair' },
        ],
      },
      {
        label: 'Forecasting', href: ROUTES.FORECASTING.ROOT, icon: 'TrendingUp',
        children: [
          { label: 'Predictions', href: ROUTES.FORECASTING.PREDICTIONS, icon: 'Target' },
          { label: 'Confidence', href: ROUTES.FORECASTING.CONFIDENCE, icon: 'Shield' },
          { label: 'Recommendations', href: ROUTES.FORECASTING.RECOMMENDATIONS, icon: 'Lightbulb' },
          { label: 'Explainability', href: ROUTES.FORECASTING.EXPLAINABILITY, icon: 'Info' },
        ],
      },
      {
        label: 'RL Agent', href: ROUTES.RL_AGENT.ROOT, icon: 'Bot',
        children: [
          // PPO, DQN, Reward Monitor hidden
          { label: 'Policy Eval', href: ROUTES.RL_AGENT.POLICY_EVALUATION, icon: 'ClipboardCheck' },
        ],
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      {
        label: 'Analytics', href: ROUTES.ANALYTICS.ROOT, icon: 'LineChart',
        children: [
          { label: 'Backtesting', href: ROUTES.ANALYTICS.BACKTESTING, icon: 'History' },
          { label: 'Benchmark', href: ROUTES.ANALYTICS.BENCHMARK, icon: 'BarChart' },
          { label: 'Risk Analysis', href: ROUTES.ANALYTICS.RISK_ANALYSIS, icon: 'AlertTriangle' },
          { label: 'Portfolio Sim', href: ROUTES.ANALYTICS.PORTFOLIO, icon: 'PieChart' },
        ],
      },
      // Model Training hidden
    ],
  },
  {
    title: 'Research',
    items: [
      { label: 'Reports', href: ROUTES.REPORTS.ROOT, icon: 'FileText' },
      { label: 'Case History', href: ROUTES.HISTORY.ROOT, icon: 'Clock' },
      { label: 'Settings', href: ROUTES.SETTINGS.ROOT, icon: 'Settings' },
    ],
  },
];