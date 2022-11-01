import { useEffect, useSyncExternalStore } from "react";

import { useForm, FormProvider } from "react-hook-form";

import { decode } from "../utils/persister";

import Button from "./../components/Button";
import Label from "./../components/Label";
import Persister from "./../components/Persister";

const EMOJIS = ["🦄", "🐸", "🌟", "🤩", "⚡️", "💥", "✨"];

const Form = ({
  onSubmit,
  onDataChanged,
}: {
  onSubmit: (data: object) => Promise<void>;
  onDataChanged: (
    data: unknown,
    change: { name?: string; type?: string }
  ) => void;
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
    confetti_type: "confetti",
  };

  const methods = useForm({ defaultValues });
  const { register, handleSubmit, reset, watch, formState } = methods;

  const rounds = Number.parseInt(watch("rounds"), 10);
  const type = watch("confetti_type");

  useEffect(() => {
    const subscription = watch(onDataChanged);

    onDataChanged(formState.defaultValues, { name: "message" });

    return () => subscription.unsubscribe();
  }, [onDataChanged, watch, formState]);

  return (
    <FormProvider {...methods}>
      <Persister />
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-2xl pb-4">Control panel</h2>
        <Label text="Your message">
          <input
            className="block rounded-lg w-full"
            type="text"
            {...register("message")}
          />
        </Label>
        <Label text="Font">
          <select className="block w-full" {...register("font")}>
            <option value="sans-serif">SanSerif</option>
            <option value="monospace">Monospace</option>
          </select>
        </Label>

        <Label text="Confetti Rounds">
          <input
            className="w-full"
            type="range"
            step="1"
            min="0"
            max="4"
            list="roundmarks"
            {...register("rounds")}
          />
          <datalist id="roundmarks" className="flex justify-between">
            <option value="0" label="🤨 (0)"></option>
            <option value="1" label="🥱 (1)"></option>
            <option value="2" label="🥳 (2)"></option>
            <option value="3" label="🤩 (3)"></option>
            <option value="4" label="🦄 (4)"></option>
          </datalist>
        </Label>

        {rounds > 0 ? (
          <>
            <Label containerElement="div" text="Choose your type">
              <label className="flex items-center">
                <input
                  type="radio"
                  className="mr-2"
                  value="confetti"
                  {...register("confetti_type")}
                />
                Confettis
              </label>
              <label>
                <input
                  type="radio"
                  className="mr-2"
                  value="emoji"
                  {...register("confetti_type")}
                />
                Emojis
              </label>
            </Label>
            {type === "emoji" ? (
              <Label containerElement="div" text="Pick your emojis">
                <div className="flex flex-wrap">
                  {EMOJIS.map((emoji, index) => (
                    <label key={index} className="flex items-center pr-7">
                      <input
                        className="mr-2"
                        type="checkbox"
                        {...register(`emojis.${emoji}`)}
                      />
                      {emoji}
                    </label>
                  ))}
                </div>
              </Label>
            ) : undefined}
          </>
        ) : undefined}

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
