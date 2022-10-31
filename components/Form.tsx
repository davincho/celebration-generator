import { useEffect, useSyncExternalStore } from "react";

import { useForm, FormProvider } from "react-hook-form";

import { decode } from "../utils/persister";

import Button from "./../components/Button";
import Persister from "./../components/Persister";

const Form = ({
  onSubmit,
  onDataChanged,
}: {
  onSubmit: (data: object) => Promise<void>;
  onDataChanged: (data: object) => void;
}) => {
  const locationHash = useSyncExternalStore(
    // eslint-disable-next-line unicorn/consistent-function-scoping
    () => () => {},
    () => {
      return location.hash.slice(1);
    }
  );

  const defaultValues = decode(locationHash) ?? {
    message: "🌟 30k stargazers 🌟",
    font: "sans-serif",
    rounds: "2",
  };

  const methods = useForm({ defaultValues });
  const { register, handleSubmit, reset, watch, formState } = methods;

  useEffect(() => {
    const subscription = watch(onDataChanged);

    onDataChanged(formState.defaultValues);

    return () => subscription.unsubscribe();
  }, [onDataChanged, watch, formState]);

  return (
    <FormProvider {...methods}>
      <Persister />
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-2xl">Control panel</h2>
        <label className="block">
          Your message
          <input
            className="block rounded-lg w-full"
            type="text"
            {...register("message")}
          />
        </label>
        <label className="block">
          Font
          <select className="block w-full" {...register("font")}>
            <option value="sans-serif">SanSerif</option>
            <option value="monospace">Monospace</option>
          </select>
        </label>

        <label className="flex" htmlFor="rounds">
          Confetti Rounds
        </label>
        <input
          className="w-full"
          id="rounds"
          type="range"
          step="1"
          min="0"
          max="4"
          list="roundmarks"
          {...register("rounds")}
        />

        <datalist id="roundmarks" className="flex justify-between">
          <option value="0" label="🤨"></option>
          <option value="1" label="🥱"></option>
          <option value="2" label="🥳"></option>
          <option value="3" label="🤩"></option>
          <option value="4" label="🦄"></option>
        </datalist>

        <div className="my-4 flex justify-between">
          <Button variant="primary" type="submit">
            Start Recording
          </Button>
          <Button
            type="button"
            onClick={() => {
              reset();
            }}
          >
            Reset form
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default Form;
