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

  const defaultValues = decode(locationHash);

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
            className="block rounded-lg"
            type="text"
            placeholder="🌟 30k stargazers 🌟"
            {...register("message")}
          />
        </label>
        <label className="block">
          Font
          <select className="block" {...register("font")}>
            <option value="sans-serif">SanSerif</option>
            <option value="monospace">Monospace</option>
          </select>
        </label>
        <label className="cursor-pointer">
          <input type="checkbox" className="mr-2" {...register("confetti")} />
          with Confetti
        </label>
        {/* <label className="block">
          Length (sec)
          <input type="number" className="block" min={1} max={4} />
        </label> */}

        <Button
          type="button"
          onClick={() => {
            reset({});
          }}
        >
          Reset form
        </Button>

        <div className="my-4">
          {formState.isSubmitting ? (
            <span className="relative inline-flex">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <div>Recording</div>
            </span>
          ) : (
            <Button type="submit">Start Recording</Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default Form;
