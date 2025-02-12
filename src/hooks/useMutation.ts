'use client';

import { useCallback, useState } from 'react';

export interface MutationState<TData, TError> {
  isLoading: boolean;
  isError: boolean;
  error: TError | null;
  isSuccess: boolean;
  data: TData | null;
}

export interface MutationOptions<TData, TVariables, TError> {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: TError, variables: TVariables) => void | Promise<void>;
  onSettled?: (
    data: TData | null,
    error: TError | null,
    variables: TVariables
  ) => void | Promise<void>;
}

export interface MutationResult<TData, TVariables, TError>
  extends MutationState<TData, TError> {
  mutate: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}

export function useMutation<
  TData = unknown,
  TVariables = void,
  TError = Error
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TVariables, TError> = {}
): MutationResult<TData, TVariables, TError> {
  const [state, setState] = useState<MutationState<TData, TError>>({
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: false,
    data: null,
  });

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
      data: null,
    });
  }, []);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setState(prev => ({ ...prev, isLoading: true }));

      try {
        const data = await mutationFn(variables);

        setState({
          isLoading: false,
          isError: false,
          error: null,
          isSuccess: true,
          data,
        });

        await options.onSuccess?.(data, variables);
        await options.onSettled?.(data, null, variables);

        return data;
      } catch (error) {
        const typedError = error as TError;

        setState({
          isLoading: false,
          isError: true,
          error: typedError,
          isSuccess: false,
          data: null,
        });

        await options.onError?.(typedError, variables);
        await options.onSettled?.(null, typedError, variables);

        throw error;
      }
    },
    [mutationFn, options]
  );

  return {
    ...state,
    mutate,
    reset,
  };
}

// Example usage:
// interface User {
//   id: number;
//   name: string;
// }
//
// interface UpdateUserVariables {
//   id: number;
//   name: string;
// }
//
// const MyComponent = () => {
//   const updateUser = useMutation<User, UpdateUserVariables>(
//     async (variables) => {
//       const response = await fetch(`/api/users/${variables.id}`, {
//         method: 'PUT',
//         body: JSON.stringify(variables),
//       });
//       return response.json();
//     },
//     {
//       onSuccess: (data) => {
//         console.log('User updated:', data);
//       },
//       onError: (error) => {
//         console.error('Failed to update user:', error);
//       },
//     }
//   );
//
//   return (
//     <button
//       onClick={() => updateUser.mutate({ id: 1, name: 'John' })}
//       disabled={updateUser.isLoading}
//     >
//       {updateUser.isLoading ? 'Updating...' : 'Update User'}
//     </button>
//   );
// }; 