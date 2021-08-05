import { renderHook } from '@testing-library/react-hooks';
import useCachedFetch from './useCachedFetch';

function fetchMock(url) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        json: () =>
          Promise.resolve({
            data: `data_from_${url}`,
          }),
      });
    }, 200 + Math.random() * 300)
  );
}


beforeAll(() => {
  jest.spyOn(global, 'fetch').mockImplementation(fetchMock);
});

afterAll(() => {
  global.fetch.mockClear();
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


it('useCachedFetch works', async () => {
  const defaultValue = { data: '' };

  const { result, waitForNextUpdate, rerender } = renderHook(
    ({ url }) => useCachedFetch(url, defaultValue),
    {
      initialProps: {
        url: 'url1',
      },
    }
  );

  // comprobamos que mientras dura la carga, la propiedad isLoading is true, pero cuando acaba es false

  expect(result.current[0]).toEqual(defaultValue);
  expect(result.current[1]).toBe(true); // is loading

  await waitForNextUpdate(() => {
    expect(result.current[0].data).toEqual('data_from_url1');
  }, { timeout: 1200 });
  expect(result.current[1]).toBe(false); // is not loading

  rerender({ url: 'url2' });

  expect(result.current[0]).toEqual(defaultValue);
  expect(result.current[1]).toBe(true); // is loading

  await waitForNextUpdate(() => {
    expect(result.current[0].data).toEqual('data_from_url2');
  }, { timeout: 800 });
  expect(result.current[1]).toBe(false); // is not loading

  // comprobamos que cuando los datos de la petición cambian y la cache caduca, esta se actualiza
  global.fetch.mockImplementation((url) => fetchMock(`${url}_modified`));

  // set url to url1 again
  rerender({ url: 'url1' });
  expect(result.current[0].data).toEqual('data_from_url1');
  expect(result.current[1]).toBe(false); // is not loading
  await waitForNextUpdate(() => {
    expect(result.current[0].data).toEqual('data_from_url1_modified');
  }, { timeout: 800 });
  expect(result.current[1]).toBe(false); // is not loading

  // set url to url2 again
  rerender({ url: 'url2' });
  expect(result.current[0].data).toEqual('data_from_url2');
  expect(result.current[1]).toBe(false); // is not loading
  await waitForNextUpdate(() => {
    expect(result.current[0].data).toEqual('data_from_url2_modified');
  }, { timeout: 800 });
  expect(result.current[1]).toBe(false); // is not loading
});