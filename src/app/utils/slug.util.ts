const CYRILLIC_TO_LATIN: Record<string, string> = {
  '\u0430': 'a',
  '\u0431': 'b',
  '\u0432': 'v',
  '\u0433': 'h',
  '\u0491': 'g',
  '\u0434': 'd',
  '\u0435': 'e',
  '\u0454': 'ye',
  '\u0436': 'zh',
  '\u0437': 'z',
  '\u0438': 'y',
  '\u0456': 'i',
  '\u0457': 'yi',
  '\u0439': 'y',
  '\u043a': 'k',
  '\u043b': 'l',
  '\u043c': 'm',
  '\u043d': 'n',
  '\u043e': 'o',
  '\u043f': 'p',
  '\u0440': 'r',
  '\u0441': 's',
  '\u0442': 't',
  '\u0443': 'u',
  '\u0444': 'f',
  '\u0445': 'kh',
  '\u0446': 'ts',
  '\u0447': 'ch',
  '\u0448': 'sh',
  '\u0449': 'shch',
  '\u044c': '',
  '\u044e': 'yu',
  '\u044f': 'ya',
};

export type AttributeSlugKind = 'default' | 'weight' | 'diameter' | 'spool';

function transliterate(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map(char => CYRILLIC_TO_LATIN[char] ?? char)
    .join('');
}

function normalizeSlugValue(value: string): string {
  return transliterate(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function withSuffix(base: string, suffix?: string): string {
  if (!suffix || !base) {
    return base;
  }

  return base.endsWith(suffix) ? base : `${base}${suffix}`;
}

export function createSlug(
  value: string,
  options?: {
    suffix?: string;
    existing?: string[];
    exclude?: string | null;
  },
): string {
  const existing = (options?.existing ?? [])
    .filter(Boolean)
    .map(slug => slug.toLowerCase())
    .filter(slug => slug !== (options?.exclude ?? '').toLowerCase());

  let slug = withSuffix(normalizeSlugValue(value), options?.suffix);

  if (!slug) {
    slug = options?.suffix ?? 'item';
  }

  let candidate = slug;
  let counter = 2;

  while (existing.includes(candidate.toLowerCase())) {
    candidate = `${slug}${counter}`;
    counter += 1;
  }

  return candidate;
}

export function createAttributeSlug(
  value: string,
  kind: AttributeSlugKind,
  existing: string[] = [],
  exclude?: string | null,
): string {
  return createSlug(value, {
    existing,
    exclude,
  });
}
