export const errorHandler = (err, request, response, next) => {
  console.error('Error:', err.message);

  const isProd = process.env.NODE_ENV === 'production';

  response.status(500).json({
    message: isProd
      ? 'Something went wrong. Please try again later.'
      : err.message,
  });
};
