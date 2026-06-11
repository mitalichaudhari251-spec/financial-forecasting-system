# FinVision-RL Frontend

> Institutional-grade AI-powered Financial Time-Series Forecasting and Market Intelligence Platform

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts + Plotly.js
- **State**: Zustand
- **3D**: React Three Fiber (Three.js)
- **Forms**: React Hook Form + Zod

## Quick Start
```bash
npm install
npm run dev
# Visit http://localhost:3000/dashboard (Demo Mode — no auth required)
```

## Project Structure
```
finvision-rl-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Login, Register, Forgot Password
│   │   ├── dashboard/         # Main operations dashboard
│   │   ├── ingestion/         # Data upload & ticker fetch
│   │   ├── preprocessing/     # Normalization, differencing, windowing
│   │   ├── image-generation/  # Candlestick + GAF image generation
│   │   ├── cnn-analysis/      # ResNet feature maps & Grad-CAM
│   │   ├── forecasting/       # AI prediction results (MAIN PAGE)
│   │   ├── rl-agent/          # PPO/DQN decision panel
│   │   ├── training/          # MLOps training dashboard
│   │   ├── analytics/         # Backtesting & benchmark comparison
│   │   ├── reports/           # Institutional report generation
│   │   ├── history/           # Searchable forecast case history
│   │   └── settings/          # User preferences
│   ├── components/            # 108 React components
│   ├── store/                 # Zustand state management
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API client services
│   ├── types/                 # TypeScript type definitions
│   ├── lib/                   # Utilities (formatting, charts, dates)
│   └── config/                # Theme, routes, sidebar, charts
├── tests/                     # Unit, integration, e2e tests
└── public/                    # Static assets (SVG icons, animations)
```

## Key Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | AI ops overview with live metrics |
| Data Ingestion | `/ingestion` | CSV upload + Yahoo Finance ticker |
| Preprocessing | `/preprocessing` | Normalization + fractional differencing |
| Image Generation | `/image-generation` | Candlestick + GAF image batches |
| CNN Analysis | `/cnn-analysis` | ResNet-18 features + Grad-CAM |
| **Forecasting** | `/forecasting` | **Main AI prediction interface** |
| RL Agent | `/rl-agent` | PPO/DQN decision panel |
| Training | `/training` | MLOps training with live logs |
| Analytics | `/analytics` | Backtesting + benchmark comparison |
| Reports | `/reports` | Institutional PDF report generation |
| Case History | `/history` | Searchable forecast history table |

## Color System
| Token | Hex | Usage |
|-------|-----|-------|
| Primary (Indigo) | `#4F46E5` | Primary actions, active states |
| Teal | `#0D9488` | Secondary accent, CNN metrics |
| Green | `#16A34A` | Bullish signals, positive values |
| Red | `#DC2626` | Bearish signals, negative values |
| Amber | `#D97706` | Warnings, medium confidence |
| Background | `#F5F7FB` | Page background |
| Card | `#FFFFFF` | Card surfaces |

## Disclaimer
> Outputs are for research and informational purposes only and do not constitute financial advice.
