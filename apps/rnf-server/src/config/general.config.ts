export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  foundationTitleSimilarityThreshold: parseFloat(process.env.FOUNDATION_TITLE_SIMILARITY_TRESHOLD || '0.8'),
  httpProxy: process.env.http_proxy || '',
  runEnv: process.env.RUN_ENV || 'development',
})
