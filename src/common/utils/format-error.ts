import { GraphQLFormattedError } from 'graphql';
import { OriginalError } from '../interface/original-error.interface';

export const formatError = (
  error: GraphQLFormattedError,
): GraphQLFormattedError => {
  const originalError = error.extensions?.originalError as OriginalError;

  if (!originalError) {
    return {
      message: error.message,
      extensions: {
        code: error.extensions?.code,
      },
    };
  }
  return {
    message: originalError?.message as string,
    extensions: {
      code: error.extensions?.code,
    },
  };
};
