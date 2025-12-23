const { z } = require('zod');

const nonEmptyString = z.string().min(1, 'Required');
const toolId = nonEmptyString;
const password = nonEmptyString;
const toolsArray = z.array(toolId).min(1, 'Select at least one tool');

const toolIdOnlySchema = z.object({ toolId });

const installSchema = z.object({
  tools: toolsArray,
  password,
});

const verifySudoSchema = z.object({ password });

const profileSchema = z.object({
  name: nonEmptyString,
  description: z.string().optional(),
  tools: toolsArray,
});

const profileIdSchema = nonEmptyString;

const uninstallSchema = z.object({
  toolId,
  password,
});

const manageExtrasSchema = z.object({
  toolId,
  password,
  install: z.array(nonEmptyString).optional(),
  remove: z.array(nonEmptyString).optional(),
});

const configName = nonEmptyString;

const getConfigContentSchema = z.object({
  toolId,
  name: configName,
});

const saveConfigSchema = z.object({
  toolId,
  name: configName,
  content: z.string().optional(),
  password,
});

const toggleConfigSchema = z.object({
  toolId,
  name: configName,
  enable: z.boolean().optional(),
  password,
});

const deleteConfigSchema = z.object({
  toolId,
  name: configName,
  password,
});

const schemas = {
  toolId: toolIdOnlySchema,
  install: installSchema,
  verifySudo: verifySudoSchema,
  profile: profileSchema,
  profileId: profileIdSchema,
  uninstall: uninstallSchema,
  manageExtras: manageExtrasSchema,
  getConfigContent: getConfigContentSchema,
  saveConfig: saveConfigSchema,
  toggleConfig: toggleConfigSchema,
  deleteConfig: deleteConfigSchema,
};

const validate = (schema, payload) => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    return { ok: false, error: result.error.errors[0]?.message || 'Invalid payload' };
  }
  return { ok: true, data: result.data };
};

module.exports = { schemas, validate };
