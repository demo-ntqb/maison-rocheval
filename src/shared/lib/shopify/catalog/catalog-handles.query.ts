export const CATALOG_HANDLES_QUERY = `#graphql
  query CatalogHandles(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: "caviar") {
      products(first: 50, sortKey: CREATED, reverse: false) {
        nodes { handle }
      }
    }
  }
` as const;
