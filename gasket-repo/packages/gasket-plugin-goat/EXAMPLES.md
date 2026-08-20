# @godaddy/gasket-plugin-goat Examples

## getGoat Action

### Service-to-service translation

```js
// A sync translation under the app's own IAM identity.
export default {
  name: 'example-plugin',
  hooks: {
    express(gasket, app) {
      app.post('/api/translate', async (req, res) => {
        const goat = gasket.actions.getGoat();

        const result = await goat.translate({
          units: [{ key: 'greeting', text: 'Hello' }],
          targetLocales: ['es-MX', 'ja-JP'],
          sourceLocale: 'en-US',
          chunkSize: 30
        });

        res.json(result);
      });
    }
  }
};
```

### Forwarding the caller's employee token

```js
// Pass the request and the caller's own Jomax token is forwarded, so GOAT
// authorizes against their Hub access rather than the app's service identity.
export default {
  name: 'example-plugin',
  hooks: {
    express(gasket, app) {
      app.get('/api/jobs', async (req, res) => {
        const goat = gasket.actions.getGoat(req);
        const { jobs, nextCursor } = await goat.jobs.list({ limit: 20 });
        res.json({ jobs, nextCursor });
      });
    }
  }
};
```

In Next App Router, wrap the headers so the request is recognized:

```js
import { headers } from 'next/headers';

export async function GET() {
  const goat = gasket.actions.getGoat({ headers: await headers() });
  const { models } = await goat.models.list();
  return Response.json(models);
}
```

Passing an argument that is not request-shaped throws on the first authenticated
call rather than silently falling back to the service identity.

### Handling errors

```js
import { GoatApiError, GoatValidationError } from '@godaddy/goat';

try {
  await goat.jobs.get(jobId);
} catch (err) {
  if (err instanceof GoatValidationError) {
    // Pre-flight: bad input, no request was made. `err.field` names the offender.
    gasket.logger.warn(`invalid goat input: ${err.field}`);
  } else if (err instanceof GoatApiError && err.status === 404) {
    // Not found — distinguish from a real failure by status.
    return null;
  } else {
    throw err;
  }
}
```

### Polling delivery bundles with ETags

```js
// A 304 means the cached copy is still current — keep it and skip the parse.
let cached = { etag: null, data: null };

async function refreshBundles(gasket) {
  const goat = gasket.actions.getGoat();
  const { data, etag, notModified } = await goat.applications.delivery.getAll({
    ifNoneMatch: cached.etag
  });

  if (!notModified) {
    cached = { etag, data };
  }

  return cached.data;
}
```

### Paginating with autoPaginate

```js
import { autoPaginate } from '@godaddy/goat';

const goat = gasket.actions.getGoat();

for await (const job of autoPaginate(
  (cursor) => goat.jobs.list({ limit: 50, cursor }),
  (page) => page.jobs
)) {
  gasket.logger.info(`${job.id} ${job.state}`);
}
```

### Reviewing translations that need attention

```js
const goat = gasket.actions.getGoat(req);

const { jobs } = await goat.jobs.list({ state: 'needs_review', limit: 20 });

for (const job of jobs) {
  const { translations } = await goat.jobs.translations(job.id, {
    state: 'needs_review'
  });

  // Each entry carries its MQM errors: type, severity, and rationale.
  for (const t of translations) {
    gasket.logger.info(`${t.targetLocale} scored ${t.qualityScore}`);
  }
}

// Approving flips the job and its pending translations to completed.
const { approved } = await goat.jobs.approve(jobs[0].id);
```

## Client method reference

The returned client exposes the full `@godaddy/goat` SDK surface. Every GOAT API
endpoint maps to one client method.

### Top level

| Method | Endpoint |
|--------|----------|
| `translate(opts)` | `POST /api/v1/applications/:appId/translate` (supports `chunkSize` for auto-chunking) |
| `health()` | `GET /health` (no auth) |
| `me()` | `GET /api/v1/me` — the caller's own principal, admin flag, and access roles |

### `jobs`

| Method | Endpoint |
|--------|----------|
| `jobs.submit(opts)` | `POST /api/v1/applications/:appId/jobs` |
| `jobs.get(jobId)` | `GET /api/v1/jobs/:jobId` |
| `jobs.list(opts?)` | `GET /api/v1/applications/:appId/jobs` |
| `jobs.translations(jobId, opts?)` | `GET /api/v1/jobs/:jobId/translations` |
| `jobs.translation(jobId, translationId)` | `GET /api/v1/jobs/:jobId/translations/:translationId` |
| `jobs.events(jobId, opts?)` | `GET /api/v1/jobs/:jobId/events` |
| `jobs.retry(jobId)` | `POST /api/v1/jobs/:jobId/retry` |
| `jobs.approve(jobId)` | `POST /api/v1/jobs/:jobId/approve` |
| `jobs.cancel(jobId)` | `POST /api/v1/jobs/:jobId/cancel` |

### `projects`

| Method | Endpoint |
|--------|----------|
| `projects.create(opts)` | `POST /api/v1/projects` |
| `projects.get(opts?)` | `GET /api/v1/projects/:projectId` |
| `projects.list(opts?)` | `GET /api/v1/projects` |
| `projects.costs(opts?)` | `GET /api/v1/projects/:projectId/costs` |

### `applications`

| Method | Endpoint |
|--------|----------|
| `applications.register(opts)` | `POST /api/v1/applications` |
| `applications.list(opts?)` | `GET /api/v1/projects/:projectId/applications` |
| `applications.get(opts?)` | `GET /api/v1/projects/:projectId/applications/:appId` |
| `applications.prepare()` | `POST /api/v1/applications/prepare` |
| `applications.getConfig(appId?)` | `GET /api/v1/applications/:appId/config` |
| `applications.updateConfig(opts?, appId?)` | `PUT /api/v1/applications/:appId/config` |

### `applications.delivery`

Reads are ETag-aware — pass the previous `etag` as `ifNoneMatch` to get
`{ notModified: true, data: null }` on a 304.

| Method | Endpoint |
|--------|----------|
| `delivery.getAll(opts?)` | `GET /api/v1/delivery/:appId` |
| `delivery.getLocale(opts)` | `GET /api/v1/delivery/:appId/:locale` |
| `delivery.getKey(opts)` | `GET /api/v1/delivery/:appId/:locale/:key` |
| `delivery.getBatch(opts)` | `POST /api/v1/delivery/:appId/:locale/batch` |
| `delivery.getStatus(opts?)` | `GET /api/v1/applications/:appId/delivery` |
| `delivery.setEnabled(opts)` | `PUT /api/v1/applications/:appId/delivery` |
| `delivery.republish(opts?)` | `POST /api/v1/applications/:appId/delivery/republish` |
| `delivery.purge(opts?)` | `DELETE /api/v1/applications/:appId/delivery` |
| `delivery.purgeLocale(opts)` | `DELETE /api/v1/applications/:appId/delivery/:locale` |
| `delivery.deleteKeys(opts)` | `DELETE /api/v1/applications/:appId/delivery/:locale/keys` |

The `delivery.get*` reads return 404 `No bundles found for application` until
delivery is enabled for the application (`delivery.setEnabled({ enabled: true })`)
and a job has published a bundle.

### `applications.phrase`

| Method | Endpoint |
|--------|----------|
| `phrase.getStatus(opts?)` | `GET /api/v1/applications/:appId/phrase` |
| `phrase.provision(opts?)` | `PUT /api/v1/applications/:appId/phrase` |
| `phrase.setEnabled(opts)` | `PATCH /api/v1/applications/:appId/phrase` |

`provision` accepts at most one of `clone`, `memsourceProjectToClone`, or
`memsourceUid`; passing more than one throws `GoatValidationError` before any
request. Omitting all three defaults to `{ clone: true }`.

### `providers`

Admin management of translation providers.

| Method | Endpoint |
|--------|----------|
| `providers.list()` | `GET /api/v1/translation-providers` |
| `providers.get(id)` | `GET /api/v1/translation-providers/:id` |
| `providers.create(opts)` | `POST /api/v1/translation-providers` |
| `providers.update(id, opts)` | `PATCH /api/v1/translation-providers/:id` |
| `providers.delete(id)` | `DELETE /api/v1/translation-providers/:id` |

### `glossary`

| Method | Endpoint |
|--------|----------|
| `glossary.listProject(opts?)` | `GET /api/v1/projects/:projectId/glossary/terms` |
| `glossary.createProjectTerm(opts)` | `POST /api/v1/projects/:projectId/glossary/terms` |
| `glossary.updateProjectTerm(opts)` | `PUT /api/v1/projects/:projectId/glossary/terms/:termId` |
| `glossary.deleteProjectTerm(opts)` | `DELETE /api/v1/projects/:projectId/glossary/terms/:termId` |
| `glossary.importProject(opts)` | `POST /api/v1/projects/:projectId/glossary/import` |
| `glossary.listGlobal()` | `GET /api/v1/glossary/terms` |
| `glossary.createGlobalTerm(body)` | `POST /api/v1/glossary/terms` |
| `glossary.updateGlobalTerm(opts)` | `PUT /api/v1/glossary/terms/:termId` |
| `glossary.deleteGlobalTerm(opts)` | `DELETE /api/v1/glossary/terms/:termId` |
| `glossary.importGlobal(csv)` | `POST /api/v1/glossary/import` |

### `identities`, `models`, `settings`, `tm`

| Method | Endpoint |
|--------|----------|
| `identities.list(opts?)` | `GET /api/v1/applications/:appId/service-identities` (employee-only) |
| `identities.register(body, appId?)` | `POST /api/v1/applications/:appId/service-identities` (employee-only) |
| `identities.revoke(id, appId?)` | `DELETE /api/v1/applications/:appId/service-identities/:id` (employee-only) |
| `models.list()` | `GET /api/v1/models` |
| `settings.get()` | `GET /api/v1/settings` |
| `tm.search(opts?)` | `GET /api/v1/tm` |

The `identities.*` methods require an employee (`jomax`) caller — a service
identity gets a 403, so use `getGoat(req)` for those.

Not exposed: `GET /api/v1/projects/:projectId/glossary/resolve` (not yet wrapped by
the SDK) and `POST /api/v1/phrase/webhook` (server-to-server webhook receiver).

See the [`@godaddy/goat` SDK README](https://github.com/gdcorp-uxp/goat/blob/main/packages/goat/README.md)
for full type definitions and options.
