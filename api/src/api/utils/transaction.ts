export async function transaction({
  actions = [],
  onFailure,
  onSuccess,
}: {
  actions: (() => unknown | Promise<unknown>)[];
  onSuccess: (stepData: TransactionStepData) => void | Promise<void>;
  onFailure: (failedStep: number, error: unknown) => void | Promise<void>;
}) {
  const data: TransactionStepData = {};
  for (let index = 1; index <= actions.length; index++) {
    const actionFunction = actions[index - 1];
    try {
      data[`step${index}`] = await actionFunction();
    } catch (error) {
      console.error(`Transaction failed at step ${index}.`);
      await onFailure(index, error);
      return;
    }
  }
  await onSuccess(data);
}

interface TransactionStepData {
  [key: `step${number}`]: unknown;
}
