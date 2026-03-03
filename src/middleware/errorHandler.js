import createHttpError from 'http-errors';

export const errorHandler = (err, request, response, next) => {
  console.error('Error Middleware:', err);

  const isProd = process.env.NODE_ENV === 'production';

  if (err instanceof createHttpError.HttpError) {
    return response.status(err.status).json({
      message: err.message || err.name,
    });
  }

  response.status(500).json({
    message: isProd
      ? 'Something went wrong. Please try again later.'
      : err.message,
  });
};
