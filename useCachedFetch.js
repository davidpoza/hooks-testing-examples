import { useState, useEffect } from 'react';

const CACHE = {};

export default function useStaleRefresh(url, defaultValue = [], ttl = 0.5) {
  const [data, setData] = useState(defaultValue);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // cacheID is how a cache is identified against a unique request
    const cacheID = url;
    // look in cache and set response if present
    if (CACHE[cacheID]?.data !== undefined) {
      setData(CACHE[cacheID]?.data);
      setLoading(false);
    } else {
      // else make sure loading set to true
      setLoading(true);
      setData(defaultValue);
    }
    // fetch new data if ttl has passed or if no previous data

    console.log("----->ts",CACHE[cacheID]?.ts, new Date().getTime() - CACHE[cacheID]?.ts);
    if (!CACHE[cacheID] || (new Date().getTime() - CACHE[cacheID]?.ts) > ttl * 1000) {
      (async () => {
        const res = await fetch(url);
        const resData = await res.json();
        CACHE[cacheID] = {
          data: resData,
          ts: new Date().getTime(),
        };
        setData(resData);
        setLoading(false);
      })();
    }
  }, [url, defaultValue]);

  return [data, isLoading];
}
