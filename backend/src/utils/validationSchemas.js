const Joi = require("joi");

const trustSchema = Joi.object({
  trustName: Joi.string().min(3).required(),
  type: Joi.string().valid("REVOCABLE", "IRREVOCABLE", "SPECIAL_NEEDS", "DYNASTY", "MINOR").required(),
  grantor: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address: Joi.string().allow(""),
    DOB: Joi.string().isoDate().allow("")
  }).required(),
  trustees: Joi.array().items(
    Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      address: Joi.string().allow("")
    })
  ).min(1).required(),
  beneficiaries: Joi.array().items(
    Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      allocation: Joi.number().min(0).max(100).required(),
      DOB: Joi.string().isoDate().allow("")
    })
  ).min(1).required()
    .custom((list, helper) => {
      const sum = list.reduce((acc, b) => acc + b.allocation, 0);
      if (sum !== 100) return helper.message("Allocations must sum to 100%");
      return list;
    }),
  state: Joi.string().length(2).required(),
  additionalClauses: Joi.array().items(Joi.string()).optional(),
  assetsIncluded: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      description: Joi.string().required()
    })
  ).optional()
});

module.exports = {
  trustSchema
};
