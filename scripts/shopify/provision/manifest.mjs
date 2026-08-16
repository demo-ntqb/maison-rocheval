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
  speciesImage: {
    path: "public/images/about-product/product-sturgeon.png",
    alt: {
      en: "Illustration of the sturgeon species",
      fr: "Illustration de l’espèce d’esturgeon",
    },
  },
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
  serving: {
    en: "Serve ideally between 26-32°F.\n\nPlan for about 1 ounce (28 grams) per person for a generous tasting.\n\nMother of Pearl Spoon and chilled glass or crystal bowls. (Please note that metal spoons can alter the taste of caviar.)",
    fr: "Servir idéalement entre 26-32°F (-3°C et 0°C).\n\nPrévoir environ 28g (1 once) par personne pour une dégustation généreuse.\n\nCuillère en nacre et coupelles en verre ou cristal réfrigérées. (Veuillez noter que les cuillères en métal peuvent altérer le goût du caviar.)",
  },
  shipping: {
    en: "Perishable – ships Fedex Priority Overnight with Surround Premium, packed cold in Petrossian’s custom-built isothermic tote bags.",
    fr: "Périssable – expédié par Fedex Priority Overnight avec Surround Premium, emballé au frais dans des sacs isothermes sur mesure.",
  },
  duration: {
    en: "Perishable – ships Fedex Priority Overnight with Surround Premium, packed cold in Petrossian’s custom-built isothermic tote bags.",
    fr: "Périssable – expédié par Fedex Priority Overnight avec Surround Premium, emballé au frais dans des sacs isothermes sur mesure.",
  },
  box: {
    en: "Your purchases are delivered in an orange box tied with a Bolduc ribbon, with the exception of fragrances, makeup and beauty products, books, certain equestrian and bulky items.",
    fr: "Vos achats sont livrés dans une boîte orange nouée d’un ruban Bolduc, à l’exception des parfums, produits de beauté, livres et articles volumineux.",
  },
  message: {
    en: "During checkout, you can include one card with a personalized message and a priceless invoice. The gift recipient can exchange a gift.\n\nFor more details, please contact Customer Service.",
    fr: "Lors du paiement, vous pouvez joindre une carte avec un message personnalisé et une facture sans prix. Le destinataire peut échanger son cadeau.\n\nPour plus de détails, veuillez contacter le Service Client.",
  },
  addOns: {
    en: "Perishable – ships Fedex Priority Overnight with Surround Premium, packed cold in Petrossian’s custom-built isothermic tote bags.",
    fr: "Périssable – expédié par Fedex Priority Overnight avec Surround Premium, emballé au frais dans des sacs isothermes sur mesure.",
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
        en: "Amour opens with cream, then butter, followed by a soft lactic warmth that lingers rather than lifts. Salinity is almost an afterthought, allowing the caviar to read closer to cultured cheese than to the sea.\n\nIt is the gentlest caviar in the collection, and often the most persuasive.\n\nAt the table\nWarm blini, crème fraîche, soft egg, potato. Amour rewards richness and simplicity, or anything with enough fat to meet it halfway. Acid and smoke should be used with restraint to allow its quiet character a chance to speak.",
        fr: "Amour s’ouvre sur la crème, puis le beurre, suivis d’une douce chaleur lactique qui s’attarde plutôt qu’elle ne s’efface. La salinité est presque secondaire, laissant ce caviar s’exprimer plus proche d’un fromage affiné que de la mer.\n\nC’est le caviar le plus délicat de la collection, et souvent le plus convaincant.\n\nÀ table\nBlinis tièdes, crème fraîche, œuf mollet, pomme de terre. Amour sublime la richesse et la simplicité, ou tout accord suffisamment onctueux pour le sublimer. L’acidité et la fumée doivent être dosées avec retenue pour laisser s’exprimer son caractère feutré.",
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
        en: "Kaluga opens with an assertive richness, unfurling layers of toasted hazelnut, delicate butter, and a pronounced, rounded minerality. Its large, firm pearls burst cleanly on the palate, releasing a lingering oceanic depth with remarkable resonance.\n\nIt is the grandest and most imposing caviar in the collection, celebrated for its architectural presence and sustained finish.\n\nAt the table\nLightly seared scallops, beef tartare, brioche, cultured butter. Kaluga commands substantial pairings that match its scale and texture. Best served simply or alongside luxurious proteins where its bronze pearls can take center stage.",
        fr: "Kaluga s’ouvre sur une richesse affirmée, dévoilant des notes de noisette grillée, de beurre fin et une minéralité marine profonde et arrondie. Ses grains volumineux et fermes éclatent avec netteté, libérant une résonance océanique d’une rare persistance.\n\nC’est le caviar le plus majestueux et imposant de la collection, célébré pour sa présence architecturale et sa finale persistante.\n\nÀ table\nSaint-Jacques juste saisies, tartare de bœuf, brioche toastée, beurre baratté. Kaluga exige des accords d’envergure capables de soutenir son volume et sa texture. À déguster pur ou aux côtés de mets nobles où ses reflets bronze occupent le premier rôle.",
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
        en: "Russian Hybrid leads with crisp clarity, offering bright saline notes followed by subtle hints of walnut and green almond. The delicate pearls provide a silky melt that cleanses the palate with refreshing vibrancy.\n\nIt is the most lively and precise caviar in the collection, marked by rhythmic freshness and pristine balance.\n\nAt the table\nRaw langoustines, sea bass carpaccio, cucumber, fresh herbs. Russian Hybrid thrives alongside mineral whites, raw seafood, and delicate citrus touches that accentuate its clean, luminous salinity.",
        fr: "Russian Hybrid s’exprime par une grande pureté, offrant des notes marines vives suivies de nuances subtiles de noix fraîche et d’amande verte. Ses grains délicats fondent avec soyeux, apportant une fraîcheur et une vivacité remarquables.\n\nC’est le caviar le plus vif et précis de la collection, marqué par une fraîcheur rythmée et un équilibre cristallin.\n\nÀ table\nLangoustines crues, carpaccio de bar, concombre, herbes fraîches. Russian Hybrid s’épanouit auprès de blancs minéraux, de poissons crus et d’une pointe d’agrumes qui soulignent sa salinité nette et lumineuse.",
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
        en: "L’Expression unfolds with harmonious complexity, uniting the velvety warmth of Amur with the robust structure of Kaluga. Notes of browned butter and roasted macadamia give way to a graceful salinity that broadens across the palate without ever overpowering.\n\nIt is the signature creation of the Maison, crafted to represent absolute equilibrium between richness and precision.\n\nAt the table\nWarm sourdough, roasted cauliflower purée, turbot, vintage Champagne. L’Expression is versatile yet aristocratic, pairing exquisitely with elevated gastronomy or savored pur from a mother-of-pearl spoon.",
        fr: "L’Expression se déploie avec une harmonieuse complexité, unissant la rondeur veloutée de l’Amour à la structure noble du Kaluga. Des arômes de beurre noisette et de macadamia grillée s’estompent sur une salinité élégante qui s’élargit en bouche avec une infinie subtilité.\n\nC’est la signature emblématique de la Maison, façonnée pour incarner le parfait équilibre entre richesse et précision.\n\nÀ table\nPain au levain tiède, mousseline de chou-fleur rôti, turbot, Champagne millésimé. L’Expression se révèle à la fois polyvalent et aristocratique, sublimant la haute gastronomie ou se dégustant pur à la cuillère de nacre.",
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
        en: "Harmonie enters with gentle grace, revealing ripe orchard fruit, subtle sweet almond, and a soft, enveloping creaminess. The salinity is discreet and finely woven, allowing an ethereal, floral sweetness to surface on the finish.\n\nIt is the most melodic and accessible caviar in the collection, composed for smoothness and nuanced charm.\n\nAt the table\nSoft burrata, poached lobster, white asparagus, fresh pasta. Harmonie embraces silky textures and delicate aromatics, providing a supple and refined counterpoint to refined, understated dishes.",
        fr: "Harmonie s’avance avec une grâce délicate, révélant des arômes de fruits mûrs, d’amande douce et un crémeux enveloppant. La salinité est discrète et finement tissée, laissant émerger en finale une douce note florale et fruitée.\n\nC’est le caviar le plus mélodieux et accessible de la collection, composé pour offrir douceur et charme tout en nuances.\n\nÀ table\nBurrata crémeuse, homard poché, asperges blanches, pâtes fraîches. Harmonie épouse les textures soyeuses et les arômes délicats, apportant un contrepoint tendre et raffiné aux assiettes épurées.",
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
    { namespace: "rocheval", key: "short_description", name: "Short description", description: "Short summary for product cards and previews", type: "multi_line_text_field", pin: true },
    { namespace: "rocheval", key: "collection_line", name: "Collection line", description: "Collection line classification (e.g. Prestige, Signature, Assemblage)", type: "single_line_text_field", pin: true },
    { namespace: "rocheval", key: "species_scientific_name", name: "Species scientific name", description: "Latin/scientific species name (e.g. Acipenser gueldenstaedtii)", type: "single_line_text_field", pin: true },
    { namespace: "rocheval", key: "species_description", name: "Species description", description: "Detailed background story and characteristics of the sturgeon species", type: "rich_text_field", pin: true },
    { namespace: "rocheval", key: "species_image", name: "Species image", description: "Illustration image of the sturgeon species", type: "file_reference", pin: true },
    { namespace: "rocheval", key: "pearl_size", name: "Pearl size", description: "Size of caviar pearls (e.g. 2.8 - 3.0mm)", type: "single_line_text_field", pin: true },
    { namespace: "rocheval", key: "pearl_colour", name: "Pearl colour", description: "Colour nuances of the caviar pearls", type: "single_line_text_field", pin: true },
    { namespace: "rocheval", key: "salt_content", name: "Salt content", description: "Salting method and percentage (e.g. Malossol < 3.5%)", type: "single_line_text_field", pin: true },
    { namespace: "rocheval", key: "tasting_notes", name: "Tasting notes", description: "Key tasting and flavour profile notes", type: "list.single_line_text_field", pin: true },
    { namespace: "rocheval", key: "ingredients", name: "Ingredients", description: "Product ingredients list", type: "multi_line_text_field", pin: true },
    { namespace: "rocheval", key: "nutrition", name: "Nutrition", description: "Nutritional values per 100g", type: "rich_text_field", pin: true },
    { namespace: "rocheval", key: "shelf_life", name: "Shelf life", description: "Product shelf life and freshness timeframe", type: "single_line_text_field", pin: true },
    { namespace: "rocheval", key: "serving", name: "Serving", description: "Recommended tasting ritual and serving temperature", type: "rich_text_field", pin: true },
    { namespace: "rocheval", key: "shipping", name: "Shipping", description: "Cold-chain express delivery information", type: "rich_text_field", pin: true },
    { namespace: "rocheval", key: "duration", name: "Duration", description: "Storage duration and temperature guidance", type: "rich_text_field", pin: true },
    { namespace: "rocheval", key: "box", name: "Box", description: "Packaging and isothermal box details", type: "rich_text_field", pin: true },
    { namespace: "rocheval", key: "message", name: "Message", description: "Personalized card or message inclusion details", type: "rich_text_field", pin: true },
    { namespace: "rocheval", key: "add_ons", name: "Add ons", description: "Included degustation accessories (mother-of-pearl spoon, tin opener)", type: "rich_text_field", pin: true },
    { namespace: "rocheval", key: "related_products", name: "Related products", description: "Pairing and cross-sell product references", type: "list.product_reference", pin: true },
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
    { handle: "featured-caviar", products: ["amour", "kaluga", "russian-hybrid", "lexpression", "harmonie"], content: { en: { title: "Featured Caviar", descriptionHtml: "<p>A selection presented by the Maison.</p>" }, fr: { title: "Caviars à l’honneur", descriptionHtml: "<p>Une sélection présentée par la Maison.</p>" } } },
  ],
});
