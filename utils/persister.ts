import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

export const decode = (hash: string) => {
  const currentVal = decompressFromEncodedURIComponent(hash);

  try {
    return currentVal ? JSON.parse(currentVal) : {};
  } catch {
    // eslint-disable-next-line no-console
    console.error("Could not read config from hash");
    return {};
  }
};

export const encode = (values: object) => {
  try {
    const newHash = compressToEncodedURIComponent(
      JSON.stringify({
        ...values,
      })
    );

    return newHash;
  } catch {
    // eslint-disable-next-line no-console
    console.error("Could not write config to hash");
  }

  return "";
};

export const read = () => decode(location.hash.slice(1));

export const write = (values: object) => {
  const newHash = encode(values);
  location.hash = `#${newHash}`;
};
