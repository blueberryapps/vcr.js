export function cleanupVariantsConflicts(variants: string[]): string[] {
  const variantsMap = variants.reduce(
    (acc: Object, variant: string): Object => {
      const [path, name] = variant.split('.');

      if (!path || !name) return acc;

      return { ...acc, [path]: name };
    },
    {});

  return Object.keys(variantsMap).map((path: string): string => [path, variantsMap[path]].join('.'));
}
