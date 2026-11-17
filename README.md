# MillGuard - Industrial Equipment Monitoring Dashboard

MillGuard is a comprehensive monitoring dashboard for industrial equipment and sensor networks. It provides real-time visibility into facility operations, machine status, and system alerts with role-based access control and simulation capabilities.

## Overview

MillGuard is designed to help operators and administrators monitor industrial equipment performance, track sensor readings, manage alerts, and simulate system scenarios. The application provides a unified view of the entire production facility with detailed drill-down capabilities for individual machines, parts, and alerts.

## Key Features

### Real-Time Monitoring
- **Facility Status Dashboard**: Overview of entire facility with sensor box status, system sync times, and active alerts
- **Machine Status Cards**: Individual machine monitoring with health indicators and key metrics
- **Production Flow Visualization**: Section-based organization with expandable/collapsible views
- **Alert Management**: Real-time alert tracking with acknowledgment and severity filtering

### Navigation & Layout
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Multi-Level Navigation**: Sidebar navigation for main sections, bottom navigation for mobile
- **Route Protection**: Role-based access control (operator vs admin)
- **Breadcrumb Navigation**: Clear path tracking through the application

### Simulation & Testing
- **Live Simulation Controls**: Simulate sensor readings, machine failures, and system events
- **Demo Mode**: Pre-populated sample data for testing and demonstration
- **Alert Simulation**: Generate critical and warning alerts for testing response workflows

### User Management
- **Role-Based Access**: Separate operator and admin permissions
- **User Settings**: Notification preferences and threshold configurations
- **Session Management**: Secure authentication with protected routes

## Technology Stack

- **Framework**: React with TypeScript
- **Routing**: React Router v6
- **UI Components**: shadcn/ui with Tailwind CSS
- **Icons**: lucide-react
- **State Management**: React Context API
- **HTTP Client**: TanStack Query for data fetching
- **Theming**: Dark/light mode support
- **Accessibility**: ARIA labels and keyboard navigation

## Application Structure

### Main Components
- **Layout**: Global layout with sidebar, top bar, and bottom navigation
- **Pages**: Individual route components (Home, Machines, Equipment, Parts, Alerts, History, Settings)
- **Components**: Reusable UI elements (cards, badges, charts, forms)
- **Context**: App and theme providers

### Data Flow
1. **AppContext**: Centralized state management for facility data
2. **Sample Data**: Pre-populated machine, sensor, and alert data
3. **Simulation**: Dynamic data generation for testing
4. **Persistence**: Local storage for user preferences

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Installation

```bash
# Clone the repository
# Navigate to the project directory

# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
# Start the development server
npm run dev
# or
pnpm dev

# The application will be available at http://localhost:5173
```

### Build for Production

```bash
# Build for production
npm run build
# or
pnpm build
```

### Preview

```bash
# Preview the built application
npm run preview
# or
pnpm preview
```

## Features Walkthrough

### Dashboard View
The main dashboard provides a comprehensive overview of the facility:
- **Top Section**: Facility name, status badge, and key metrics (sensor boxes online, last sync, active alerts)
- **Alert Banner**: Quick view of unacknowledged alerts with link to full alert list
- **Production Flow**: Interactive flow strip for section filtering
- **Machine Grid**: Responsive grid of machine status cards organized by section
- **Simulation Controls**: Quick access to simulation tools

### Machine Management
Navigate to the Machines page to view all equipment:
- **List View**: Grid layout with machine status and key metrics
- **Detail View**: Individual machine page with comprehensive diagnostics
- **Section Organization**: Machines grouped by production sections
- **Status Indicators**: Color-coded health status with detailed tooltips

### Alert Management
Access alerts through the Alerts page:
- **Alert List**: Filterable list of all alerts with severity indicators
- **Alert Details**: Individual alert pages with full diagnostic information
- **Acknowledgment**: Mark alerts as acknowledged
- **Severity Filtering**: Separate views for critical and warning alerts

### Settings & Configuration
Configure the application in the Settings page:
- **Threshold Settings**: Configure alert thresholds for different parameters
- **User Management**: Admin-only user management and permissions
- **Notification Preferences**: Control alert banner display settings
- **System Information**: View system status and configuration

## Authentication

MillGuard uses role-based access control:

### User Roles
- **Operator**: Standard access to monitoring and basic management
- **Admin**: Full access including user management and system configuration

### Login Process
1. Navigate to the login page
2. Enter valid credentials (demo accounts available)
3. Redirect to appropriate dashboard based on role
4. Session persists across page refreshes

### Protected Routes
- All main application routes require authentication
- Admin-only routes require elevated permissions
- Automatic redirect to login if not authenticated

## Simulation Features

MillGuard includes powerful simulation tools for testing and demonstration:

### Available Simulations
- **Sensor Readings**: Generate realistic sensor data variations
- **Machine Failures**: Simulate equipment failures and recovery
- **System Events**: Generate system-wide events and alerts
- **Alert Scenarios**: Create critical and warning alerts for testing

### Usage
1. Access simulation controls from the dashboard
2. Select the type of simulation to run
3. Configure parameters as needed
4. Execute and observe system response
5. Reset to return to normal operation

## Customization

### Theme Settings
- **Light/Dark Mode**: Toggle between light and dark themes
- **Color Schemes**: Customizable color palettes
- **Layout Options**: Adjust sidebar and navigation preferences

### Data Management
- **Sample Data**: All data is sample/demo data
- **Reset Demo**: Clear and regenerate sample data
- **Export/Import**: Data export capabilities for reporting

## Development

### Code Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   └── ...             # Other component categories
├── context/            # React context providers
├── hooks/              # Custom hooks
├── lib/                # Utility libraries
├── pages/              # Route components
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

### Testing
- **Component Tests**: Individual component testing
- **Integration Tests**: End-to-end scenario testing
- **Simulation Testing**: Verify simulation behavior

### Building Custom Components
Follow the established patterns in the codebase:
- Use TypeScript for type safety
- Leverage shadcn/ui components for consistency
- Implement responsive design with Tailwind CSS
- Ensure accessibility with proper ARIA labels

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors
```bash
# Check for TypeScript errors
npm run lint
```

#### Authentication Issues
- Clear browser cache and cookies
- Check that cookies are enabled
- Verify network connectivity

#### Simulation Not Working
- Check browser console for errors
- Ensure JavaScript is enabled
- Try refreshing the page

## Support

For issues, questions, or feature requests:
1. Check the documentation above
2. Review the code for configuration options
3. Use the simulation tools for testing
4. Contact the development team for enterprise support

## License

This is a demonstration application created with Dyad. All code is provided for educational and demonstration purposes.

## Acknowledgements

- Built with React and TypeScript
- Powered by shadcn/ui and Tailwind CSS
- Icons provided by lucide-react
- Routing handled by React Router
- Data management with TanStack Query
- Theme switching with next-themes
- Accessibility focused with Radix UI principles

## Version

Current version: 0.0.0

## Contact

For more information about MillGuard or to request features, please refer to the project documentation or contact the development team.