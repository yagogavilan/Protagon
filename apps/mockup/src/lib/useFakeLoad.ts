import { useEffect, useState } from 'react';

/** Estado "carregando" curto das telas novas (a demonstração não tem rede): true durante `ms` a cada mudança de `key` */
export function useFakeLoad(ms = 450, key: unknown = 0): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
  }, [ms, key]);
  return loading;
}
