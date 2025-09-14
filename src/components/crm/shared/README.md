# Shared CRM Components

This directory contains CRM components that are shared across all business types (pharmacy, restaurant, rental, retail).

## Architecture

```
src/components/crm/
├── shared/                    # Shared components (all business types)
│   ├── CustomerProfile.jsx    # Basic customer profile form
│   ├── LoyaltyPrograms.jsx    # Loyalty management
│   ├── CommunicationHistory.jsx # Customer communications
│   ├── TransactionHistory.jsx  # Sales history
│   ├── Analytics.jsx          # Shared CRM analytics
│   └── ...
├── pharmacy/                  # Pharmacy-specific components
│   ├── RefillScheduler.jsx
│   ├── ClinicalProfile.jsx
│   └── PrescriptionHistory.jsx
├── restaurant/                # Restaurant-specific components
│   ├── GuestPreferences.jsx
│   ├── ReservationHistory.jsx
│   └── MenuRecommendations.jsx
├── rental/                    # Rental-specific components
│   ├── ContractManagement.jsx
│   ├── EquipmentHistory.jsx
│   └── InspectionReports.jsx
└── retail/                    # Retail-specific components
    ├── WarrantyTracking.jsx
    ├── ReturnManagement.jsx
    └── ProductSuggestions.jsx
```

## Component Loading Pattern

Components are loaded dynamically based on the business type:

```jsx
const useBusinessTypeCRM = () => {
  const { businessType } = useCRMConfig();

  // Load business-type-specific component
  const loadComponent = async (componentName) => {
    try {
      const module = await import(`./${businessType}/${componentName}.jsx`);
      return module.default;
    } catch (error) {
      // Fallback to shared component
      const sharedModule = await import(`./shared/${componentName}.jsx`);
      return sharedModule.default;
    }
  };

  return { loadComponent };
};
```

## Shared Features

### Customer 360 Components
- `ProfileTab` - Basic contact/profile info (all types)
- `TransactionsTab` - Sales history (all types)
- `LoyaltyTab` - Loyalty program management (all types)
- `ActivityTab` - Timeline of customer interactions (all types)

### Analytics Components
- `CustomerLifetimeValue` - CLV calculations
- `RetentionMetrics` - Churn/retention analysis
- `BehaviorAnalytics` - Purchase pattern analysis

### Communication Components
- `EmailEditor` - Unified email composition
- `SmsComposer` - SMS/text messaging
- `CampaignManager` - Marketing campaign creation
- `AutomationRules` - Workflow automation setup

## Business Type Extensions

Each business type extends the shared CRM with specific needs:

- **Pharmacy**: Clinical profiles, prescription tracking, medication adherence
- **Restaurant**: Dietary preferences, reservation history, table management
- **Rental**: Contract management, equipment history, inspection records
- **Retail**: Warranty tracking, return management, personalized recommendations

## Future Extensions

This architecture allows easy addition of new business types by:
1. Adding new folder under `src/components/crm/`
2. Extending `BUSINESS_TYPES` configuration
3. Creating business-specific components
4. Leveraging shared foundation
