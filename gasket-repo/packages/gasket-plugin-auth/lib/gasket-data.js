/// <reference types="@gasket/plugin-data" />

/** @type {import('@gasket/core').HookHandler<'gasketData'>} */
export default async function gasketData(gasket, data) {
  const { basePath, appName } = gasket.config?.auth ?? {};
  if (!basePath && !appName) return data;

  return {
    ...data,
    public: {
      ...data.public,
      auth: {
        ...data.public?.auth,
        ...(basePath && { basePath }),
        ...(appName && { appName })
      }
    }
  };
}
