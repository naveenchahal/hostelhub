import { useState, useEffect, useCallback } from 'react';

/** Generic async data fetcher */
export function useFetch(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFn();
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => { run(); }, [run]);
  return { data, loading, error, refetch: run };
}

/** Controlled form state */
export function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    const val = e?.target?.value ?? e;
    setValues(p => ({ ...p, [field]: val }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const reset = () => { setValues(initial); setErrors({}); };

  return { values, errors, set, setErrors, reset };
}

/** Boolean toggle */
export function useToggle(init = false) {
  const [val, setVal] = useState(init);
  const on    = () => setVal(true);
  const off   = () => setVal(false);
  const toggle= () => setVal(p => !p);
  return [val, { on, off, toggle }];
}