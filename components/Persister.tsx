import * as React from "react";

import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { useFormContext } from "react-hook-form";

const read = () => {
  const currentVal = decompressFromEncodedURIComponent(location.hash.slice(1));

  try {
    return currentVal ? JSON.parse(currentVal) : {};
  } catch {
    // eslint-disable-next-line no-console
    console.error("Could not read config from hash");
    return {};
  }
};

const write = (values: object) => {
  try {
    const newHash = compressToEncodedURIComponent(
      JSON.stringify({
        ...values,
      })
    );

    location.hash = `#${newHash}`;
  } catch {
    // eslint-disable-next-line no-console
    console.error("Could not write config to hash");
  }
};

const Persister: React.FC = () => {
  const { reset, watch } = useFormContext();

  React.useEffect(() => {
    // Sync once from hash to form

    // We need to wait to the next tick as useForm useEffect should be ready first
    // See https://react-hook-form.com/api/useform/reset
    setTimeout(() => {
      reset(read());
    });

    const subscription = watch((value) => write(value));
    return () => subscription.unsubscribe();
  }, [reset, watch]);

  // eslint-disable-next-line unicorn/no-null
  return null;
};

export default Persister;
