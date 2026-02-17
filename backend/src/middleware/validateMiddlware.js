export const validate = (schema, source = "body") => {
  return async (req, res, next) => {
    try {
      const data =
        source === "query"
          ? req.query
          : source === "params"
            ? req.params
            : req.body;

      console.log("Raw data before validation:", data);

      const validated = await schema.parseAsync(data);

      console.log("Validated data:", validated);

      if (source === "query") {
        req.validatedQuery = validated;
      } else if (source === "params") {
        req.validatedParams = validated;
      } else {
        req.body = validated; // body CAN be reassigned
      }

      next();
    } catch (error) {
      if (error.name === "ZodError" || error.errors) {
        console.error("Validation error details:", error.errors);
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors,
        });
      }

      console.error("Non-Zod error in validation:", error);
      return res.status(500).json({
        success: false,
        error: "Server error during validation",
        message: error.message,
      });
    }
  };
};
