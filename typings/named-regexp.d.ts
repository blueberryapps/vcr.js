interface NamedRegExp {
  test: (s: string) => boolean;
  exec: (s: string) => {
    captures: {[key: string]: string[]};
    capture: (s: string) => string | null;
  }
}

export function named(reg: RegExp): NamedRegExp;