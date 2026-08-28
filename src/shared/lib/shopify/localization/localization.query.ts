export const LOCALIZATION_DISCOVERY_QUERY = `#graphql
  query LocalizationDiscovery {
    localization {
      availableCountries {
        isoCode
        name
        availableLanguages {
          isoCode
          name
        }
        currency {
          isoCode
          symbol
        }
      }
    }
  }
` as const;
