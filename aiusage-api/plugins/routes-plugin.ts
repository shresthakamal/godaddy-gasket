export const defaultHandler = async (req, res) => {
  console.log(process.env.GD_ENV);
  res.status(200).json({
    message: 'Welcome to your default route...'
  });
};

export const usageHandler = async (req, res) => {
  res.status(200).json({
    totalTokens: 128_450,
    period: '2026-08'
  });
};

export default {
  name: 'routes-plugin',
  hooks: {
    express(gasket, app) {
      /**
      * @swagger
      *
      * /default:
      *   get:
      *     summary: "Get default route"
      *     produces:
      *       - "application/json"
      *     responses:
      *       "200":
      *         description: "Returns welcome message."
      *         content:
      *           application/json
      */
      app.get('/default', defaultHandler);

      /**
      * @swagger
      *
      * /usage:
      *   get:
      *     summary: "Get AI usage summary"
      *     produces:
      *       - "application/json"
      *     responses:
      *       "200":
      *         description: "Returns usage summary."
      *         content:
      *           application/json
      */
      app.get('/usage', usageHandler);
    }
  }
};
