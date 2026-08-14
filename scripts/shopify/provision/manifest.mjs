const sizes = ["30g", "50g", "125g", "250g"];

function variants(code, prices) {
  return sizes.map((option, index) => ({
    option,
    price: prices[index],
    sku: `MR-${code}-${option.replace("g", "").padStart(3, "0")}`,
    weightGrams: Number.parseInt(option, 10),
  }));
}

const sharedProductDetails = {
  saltContent: "3.0% – 3.5%",
  ingredients: {
    en: "Sturgeon roe, salt, E285",
    fr: "Œufs d’esturgeon, sel, E285",
  },
  nutrition: {
    en: "Per 100g: energy 1059 kJ / 254 kcal, fat 16g, carbohydrates 1g, protein 25g, salt 3.5g.",
    fr: "Pour 100g : énergie 1059 kJ / 254 kcal, matières grasses 16g, glucides 1g, protéines 25g, sel 3,5g.",
  },
  shelfLife: {
    en: "Four weeks refrigerated",
    fr: "Quatre semaines au réfrigérateur",
  },
  storage: {
    en: "Keep refrigerated between -2°C and +2°C. Do not freeze.",
    fr: "Conserver au réfrigérateur entre -2°C et +2°C. Ne pas congeler.",
  },
  serving: {
    en: "Serve chilled. Plan approximately 28g per person for a generous tasting.",
    fr: "Servir frais. Prévoir environ 28g par personne pour une dégustation généreuse.",
  },
};

const products = [
  {
    kind: "caviar",
    handle: "amour",
    code: "AMOUR",
    productType: "Caviar",
    optionName: "Size",
    image: { path: "public/images/home/product-amour.png", alt: { en: "Open tin of Maison Rocheval Amour caviar", fr: "Boîte ouverte de caviar Amour Maison Rocheval" } },
    content: {
      en: { title: "Amour Caviar", descriptionHtml: "<p>Exceptional pearls from the Amur basin, selected for a creamy texture and a clean, lingering finish.</p>" },
      fr: { title: "Caviar Amour", descriptionHtml: "<p>Des grains exceptionnels du bassin de l’Amour, sélectionnés pour leur texture crémeuse et leur finale nette et persistante.</p>" },
    },
    variants: variants("AMOUR", ["119.00", "189.00", "449.00", "859.00"]),
    details: {
      ...sharedProductDetails,
      speciesScientificName: "Acipenser schrenckii",
      speciesDescription: {
        en: "A refined sturgeon native to the Amur basin.",
        fr: "Un esturgeon raffiné originaire du bassin de l’Amour.",
      },
      pearlSize: "2.8mm – 3.2mm",
      pearlColour: { en: "Dark grey to golden olive", fr: "Gris foncé à olive doré" },
      tastingNotes: { en: ["Rich", "Creamy", "Cheese"], fr: ["Riche", "Crémeux", "Fromager"] },
      collectionLine: { en: "Patrimoine", fr: "Patrimoine" },
      shortDescription: {
        en: "Exceptional dark pearls with a generous texture and a clean, lingering finish.",
        fr: "Des grains sombres et généreux, à la texture ample et à la finale nette et persistante.",
      },
    },
    relatedProducts: ["lexpression", "harmonie", "kaluga"],
  },
  {
    kind: "caviar",
    handle: "kaluga",
    code: "KALUGA",
    productType: "Caviar",
    optionName: "Size",
    image: { path: "public/images/about-product/species-kaluga-hybrid.png", alt: { en: "Open tin of Maison Rocheval Kaluga caviar", fr: "Boîte ouverte de caviar Kaluga Maison Rocheval" } },
    content: {
      en: { title: "Kaluga Caviar", descriptionHtml: "<p>Large, supple pearls with warm bronze reflections, depth and a rounded marine finish.</p>" },
      fr: { title: "Caviar Kaluga", descriptionHtml: "<p>De grands grains souples aux reflets bronze, profonds et portés par une finale marine arrondie.</p>" },
    },
    variants: variants("KALUGA", ["159.00", "259.00", "619.00", "1199.00"]),
    details: {
      ...sharedProductDetails,
      speciesScientificName: "Huso dauricus",
      speciesDescription: {
        en: "Known for large supple pearls and remarkable depth.",
        fr: "Reconnu pour ses grands grains souples et sa remarquable profondeur.",
      },
      pearlSize: "3.2mm – 3.8mm",
      pearlColour: { en: "Warm bronze to golden olive", fr: "Bronze chaud à olive doré" },
      tastingNotes: { en: ["Rich", "Creamy", "Long finish"], fr: ["Riche", "Crémeux", "Finale longue"] },
      collectionLine: { en: "Patrimoine", fr: "Patrimoine" },
      shortDescription: {
        en: "Large, supple pearls with depth and a rounded marine finish.",
        fr: "De grands grains souples, profonds et portés par une finale marine arrondie.",
      },
    },
    relatedProducts: ["amour", "lexpression", "russian-hybrid"],
  },
  {
    kind: "caviar",
    handle: "russian-hybrid",
    code: "RUSSIAN-HYBRID",
    productType: "Caviar",
    optionName: "Size",
    image: { path: "public/images/about-product/species-russian-sturgeon.png", alt: { en: "Open tin of Maison Rocheval Russian Hybrid caviar", fr: "Boîte ouverte de caviar Russian Hybrid Maison Rocheval" } },
    content: {
      en: { title: "Russian Hybrid Caviar", descriptionHtml: "<p>A refined expression with olive pearls, precise salinity and a bright, persistent finish.</p>" },
      fr: { title: "Caviar Russian Hybrid", descriptionHtml: "<p>Une expression raffinée aux grains olive, à la salinité précise et à la finale vive et persistante.</p>" },
    },
    variants: variants("RUSSIAN-HYBRID", ["139.00", "229.00", "549.00", "1059.00"]),
    details: {
      ...sharedProductDetails,
      speciesScientificName: "Acipenser gueldenstaedtii x Acipenser baerii",
      speciesDescription: {
        en: "A silky hybrid with olive pearls and bright salinity.",
        fr: "Un hybride soyeux aux grains olive et à la salinité vive.",
      },
      pearlSize: "2.7mm – 3.1mm",
      pearlColour: { en: "Olive grey", fr: "Gris olive" },
      tastingNotes: { en: ["Silky", "Clean", "Fresh"], fr: ["Soyeux", "Net", "Frais"] },
      collectionLine: { en: "Patrimoine", fr: "Patrimoine" },
      shortDescription: {
        en: "Olive pearls with precise salinity and a bright, persistent finish.",
        fr: "Des grains olive à la salinité précise et à la finale vive et persistante.",
      },
    },
    relatedProducts: ["kaluga", "harmonie", "amour"],
  },
  {
    kind: "caviar",
    handle: "lexpression",
    code: "LEXPRESSION",
    productType: "Caviar",
    optionName: "Size",
    image: { path: "public/images/home/product-expression.png", alt: { en: "Open tin of Maison Rocheval L’Expression caviar", fr: "Boîte ouverte de caviar L’Expression Maison Rocheval" } },
    content: {
      en: { title: "L’Expression", descriptionHtml: "<p>The signature expression of the Maison, selected for balance and an exceptionally clean finish.</p>" },
      fr: { title: "L’Expression", descriptionHtml: "<p>La signature de la Maison, sélectionnée pour son équilibre et sa finale d’une grande netteté.</p>" },
    },
    variants: variants("LEXPRESSION", ["189.00", "309.00", "749.00", "1449.00"]),
    details: {
      ...sharedProductDetails,
      speciesScientificName: "Huso dauricus x Acipenser schrenckii",
      speciesDescription: {
        en: "A balanced hybrid selected for precision and persistence.",
        fr: "Un hybride équilibré, sélectionné pour sa précision et sa persistance.",
      },
      pearlSize: "3.0mm – 3.6mm",
      pearlColour: { en: "Bronze grey", fr: "Gris bronze" },
      tastingNotes: { en: ["Rounded", "Precise", "Nutty"], fr: ["Rond", "Précis", "Noisetté"] },
      collectionLine: { en: "Réserve", fr: "Réserve" },
      shortDescription: {
        en: "The signature of the Maison, selected for balance and precision.",
        fr: "La signature de la Maison, sélectionnée pour son équilibre et sa précision.",
      },
    },
    relatedProducts: ["amour", "harmonie", "kaluga"],
  },
  {
    kind: "caviar",
    handle: "harmonie",
    code: "HARMONIE",
    productType: "Caviar",
    optionName: "Size",
    image: { path: "public/images/home/product-harmonie.png", alt: { en: "Open tin of Maison Rocheval Harmonie caviar", fr: "Boîte ouverte de caviar Harmonie Maison Rocheval" } },
    content: {
      en: { title: "Harmonie", descriptionHtml: "<p>Named for balance and defined by fruit, with a supple grain and delicate persistence.</p>" },
      fr: { title: "Harmonie", descriptionHtml: "<p>Nommé pour son équilibre et défini par le fruit, avec un grain souple et une persistance délicate.</p>" },
    },
    variants: variants("HARMONIE", ["169.00", "279.00", "679.00", "1299.00"]),
    details: {
      ...sharedProductDetails,
      speciesScientificName: "Acipenser gueldenstaedtii x Acipenser baerii",
      speciesDescription: {
        en: "A silky hybrid with olive pearls and bright salinity.",
        fr: "Un hybride soyeux aux grains olive et à la salinité vive.",
      },
      pearlSize: "2.8mm – 3.3mm",
      pearlColour: { en: "Deep olive", fr: "Olive profond" },
      tastingNotes: { en: ["Silky", "Soft", "Fruity"], fr: ["Soyeux", "Doux", "Fruité"] },
      collectionLine: { en: "Assemblage", fr: "Assemblage" },
      shortDescription: {
        en: "A supple grain, delicate fruit and a graceful persistent finish.",
        fr: "Un grain souple, un fruit délicat et une finale gracieusement persistante.",
      },
    },
    relatedProducts: ["lexpression", "amour", "russian-hybrid"],
  },
  {
    kind: "packaging-addon",
    handle: "presentation-box",
    code: "PRESENTATION",
    productType: "Presentation",
    optionName: "Packaging",
    image: { path: "public/images/product-detail/packaging-premium.png", alt: { en: "Maison Rocheval presentation box", fr: "Coffret de présentation Maison Rocheval" } },
    content: {
      en: { title: "Presentation Box", descriptionHtml: "<p>Optional Maison Rocheval presentation for caviar orders.</p>" },
      fr: { title: "Coffret de présentation", descriptionHtml: "<p>Présentation Maison Rocheval optionnelle pour les commandes de caviar.</p>" },
    },
    variants: [
      { option: "Premium", price: "32.00", sku: "MR-BOX-PREMIUM", weightGrams: 350 },
      { option: "Luxury", price: "74.00", sku: "MR-BOX-LUXURY", weightGrams: 800 },
    ],
    relatedProducts: [],
  },
];

export const SHOPIFY_PROVISIONING_MANIFEST = Object.freeze({
  version: 1,
  locales: ["en", "fr"],
  metafieldDefinitions: [
    { namespace: "rocheval", key: "short_description", name: "Short description", type: "multi_line_text_field", pin: true },
    { namespace: "rocheval", key: "collection_line", name: "Collection line", type: "single_line_text_field", pin: true },
    { namespace: "rocheval", key: "species_scientific_name", name: "Species scientific name", type: "single_line_text_field", pin: true },
    { namespace: "rocheval", key: "species_description", name: "Species description", type: "multi_line_text_field", pin: true },
    { namespace: "rocheval", key: "pearl_size", name: "Pearl size", type: "single_line_text_field", pin: true },
    { namespace: "rocheval", key: "pearl_colour", name: "Pearl colour", type: "single_line_text_field", pin: true },
    { namespace: "rocheval", key: "salt_content", name: "Salt content", type: "single_line_text_field", pin: true },
    { namespace: "rocheval", key: "tasting_notes", name: "Tasting notes", type: "list.single_line_text_field", pin: true },
    { namespace: "rocheval", key: "ingredients", name: "Ingredients", type: "multi_line_text_field", pin: true },
    { namespace: "rocheval", key: "nutrition", name: "Nutrition", type: "rich_text_field", pin: true },
    { namespace: "rocheval", key: "shelf_life", name: "Shelf life", type: "single_line_text_field", pin: true },
    { namespace: "rocheval", key: "storage", name: "Storage", type: "rich_text_field", pin: true },
    { namespace: "rocheval", key: "serving", name: "Serving", type: "rich_text_field", pin: true },
    { namespace: "rocheval", key: "related_products", name: "Related products", type: "list.product_reference", pin: true },
  ],
  metaobjectDefinitions: [
    {
      type: "presentation_option",
      name: "Presentation option",
      displayNameKey: "name",
      fields: [
        { key: "name", name: "Name", type: "single_line_text_field", required: true, translatable: true },
        { key: "description", name: "Description", type: "multi_line_text_field", translatable: true },
        { key: "price", name: "Price", type: "number_decimal", required: true, translatable: false },
        { key: "personalized_message", name: "Personalized message", type: "boolean", translatable: false },
      ],
    },
  ],
  metaobjects: {
    presentationOption: [
      { handle: "standard", type: "presentation_option", price: "0.00", content: { en: { name: "Standard", description: "Paper bag with ice", personalized_message: false }, fr: { name: "Standard", description: "Sac en papier avec glace", personalized_message: false } } },
      { handle: "premium", type: "presentation_option", price: "32.00", content: { en: { name: "Premium", description: "Quality cardboard box with Bolduc ribbon.", personalized_message: true }, fr: { name: "Premium", description: "Boîte en carton avec ruban Bolduc.", personalized_message: true } } },
      { handle: "luxury", type: "presentation_option", price: "74.00", content: { en: { name: "Luxury", description: "Premium wooden box with Bolduc ribbon.", personalized_message: true }, fr: { name: "Luxe", description: "Boîte en bois avec ruban Bolduc.", personalized_message: true } } },
    ],
  },
  products,
  collections: [
    { handle: "our-caviar", products: ["amour", "kaluga", "russian-hybrid", "lexpression", "harmonie"], content: { en: { title: "Our Caviar", descriptionHtml: "<p>The Maison Rocheval caviar collection.</p>" }, fr: { title: "Nos caviars", descriptionHtml: "<p>La collection de caviars Maison Rocheval.</p>" } } },
    { handle: "featured-caviar", products: ["amour", "lexpression", "harmonie"], content: { en: { title: "Featured Caviar", descriptionHtml: "<p>A selection presented by the Maison.</p>" }, fr: { title: "Caviars à l’honneur", descriptionHtml: "<p>Une sélection présentée par la Maison.</p>" } } },
  ],
});
