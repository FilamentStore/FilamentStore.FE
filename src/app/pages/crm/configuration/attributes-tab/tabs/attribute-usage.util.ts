export interface UsageTrackedValue {
  usageCount?: number;
}

export function isValueUsed(item: UsageTrackedValue): boolean {
  return (item.usageCount ?? 0) > 0;
}

export function getUsageLabel(usageCount = 0): string {
  if (usageCount === 0) {
    return 'Не використовується';
  }

  if (usageCount === 1) {
    return '1 варіація';
  }

  if (usageCount >= 2 && usageCount <= 4) {
    return `${usageCount} варіації`;
  }

  return `${usageCount} варіацій`;
}
