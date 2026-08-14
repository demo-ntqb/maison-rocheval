export function metaobjectTranslationContent(entry, definition, locale) {
  if (!definition) {
    throw new Error(`Metaobject definition ${entry.type} is unavailable for localization.`);
  }

  const content = entry.content[locale];
  const translatableKeys = definition.fields
    .filter(({ translatable }) => translatable === true)
    .map(({ key }) => key);

  return Object.fromEntries(translatableKeys.map((key) => {
    if (!(key in content)) {
      throw new Error(`Missing ${locale} translation value for ${entry.type}:${entry.handle}.${key}.`);
    }
    return [key, content[key]];
  }));
}
