# AllWeather Finance Frontend
A modern Web3 DeFi application for portfolio management and rebalancing built with React, TypeScript, and Vite.

## 🚀 Features

- **Portfolio Dashboard** - View and manage your investment portfolio
- **Asset Allocation** - Interactive sliders for portfolio allocation
- **Rebalancing Logic** - Smart portfolio rebalancing functionality
- **Trading Interface** - Execute trades and transactions
- **Price Display** - Real-time price data integration
- **Wallet Integration** - Connect and manage crypto wallets
- **Responsive Design** - Modern UI with Tailwind CSS and shadcn/ui components

## 🛠 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Web3 Integration**: Ethers.js
- **Price Data**: Pyth Network (Hermes Client)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd allweatherfi-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

## 🏃‍♂️ Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🏗 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── TradingInterface.tsx
│   └── ...
├── contexts/           # React contexts
│   └── WalletContext.tsx
├── hooks/             # Custom hooks
├── lib/               # Utility libraries
│   ├── api.ts         # API utilities
│   ├── contract.ts    # Smart contract interactions
│   └── hedera.ts      # Hedera blockchain integration
├── pages/             # Page components
│   ├── Index.tsx      # Home page
│   ├── Rebalance.tsx  # Rebalancing page
│   └── NotFound.tsx   # 404 page
└── types/             # TypeScript type definitions
```

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `components.json` - shadcn/ui components configuration

## 🌐 Web3 Integration

The application integrates with:
- **Ethereum** - Smart contract interactions via Ethers.js
- **Hedera** - Hedera Hashgraph blockchain support
- **Pyth Network** - Real-time price feeds

## 🎨 UI Components

Built with a comprehensive set of UI components from shadcn/ui including:
- Forms, inputs, and selectors
- Data visualization (charts, progress bars)
- Navigation components
- Modals and dialogs
- Toast notifications
- And many more...

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop browsers
- Tablets
- Mobile devices

## 🚀 Deployment

Build the application for production:
```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.