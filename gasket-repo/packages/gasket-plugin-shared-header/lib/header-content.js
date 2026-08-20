/// <reference types="@godaddy/gasket-plugin-uxp" />

/** @type {import('@gasket/core').HookHandler<'headerContent'>} */
export default async function headerContent(gasket, content, { req }) {
  try {
    const data = await gasket.actions.getSharedHeader(req);

    return {
      ...content,
      data
    };
  } catch (error) {
    gasket.logger.warn(`Error fetching shared header data ${error.message}`);
    return {
      ...content,
      error
    };
  }
}
