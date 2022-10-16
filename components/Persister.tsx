import * as React from "react";

import { useFormContext } from "react-hook-form";

import { write } from "./../utils/persister";

const Persister: React.FC = () => {
  const { reset, watch } = useFormContext();

  React.useEffect(() => {
    const subscription = watch((value) => write(value));
    return () => subscription.unsubscribe();
  }, [reset, watch]);

  // eslint-disable-next-line unicorn/no-null
  return null;
};

export default Persister;
