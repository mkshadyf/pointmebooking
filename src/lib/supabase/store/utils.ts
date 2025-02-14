import { StateCreator } from 'zustand';

type SetState<T> = Parameters<StateCreator<T>>[0];

interface AsyncActionOptions<TData, TError = Error> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
}

interface AsyncState {
  loading: boolean;
  error: string | null;
}

export async function handleAsyncAction<
  TState extends AsyncState,
  TData,
  TError = Error
>(
  set: SetState<TState>,
  action: () => Promise<{ data?: TData; error?: TError }>,
  options: AsyncActionOptions<TData, TError> = {}
) {
  set((state: TState) => ({ ...state, loading: true, error: null }));
  try {
    const { data, error } = await action();
    if (error) throw error;
    if (data) {
      options.onSuccess?.(data);
    }
    set((state: TState) => ({ ...state, loading: false }));
  } catch (error) {
    const err = error as TError;
    options.onError?.(err);
    set((state: TState) => ({
      ...state,
      error: err instanceof Error ? err.message : 'An error occurred',
      loading: false,
    }));
  }
} 