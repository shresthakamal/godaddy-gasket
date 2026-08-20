import type { GoatClient } from '@godaddy/goat';

export type {
  AuthProvider, GoatClient, GoatClientConfig,
  GoatJobsApi, GoatProjectsApi, GoatApplicationsApi, GoatDeliveryApi,
  GoatPhraseApi, GoatTmApi, GoatIdentitiesApi, GoatModelsApi,
  GoatSettingsApi, GoatProvidersApi,
  PageOptions, CursorPage, ResourceStatus,
  TranslationUnit, TranslateOptions, TranslateAsyncOptions,
  TranslateResult, TranslateResultItem, TranslateErroredItem,
  AsyncJobResult, JobStatus, JobListItem, ListJobsOptions, JobsResult,
  JobTranslation, JobTranslationState, JobTranslationsOptions, JobTranslationsResult,
  JobTranslationDetail, QualityHistoryItem, JobEvent, JobEventsResult,
  JobStateChange, JobApproveResult,
  CostOptions, CostProviderSummary, CostBreakdownItem, CostResult,
  TranslationConfigOptions, TranslationConfigResult,
  Project, CreateProjectOptions, ListProjectsOptions, ProjectsResult,
  Application, RegisterApplicationOptions, ListApplicationsOptions,
  ApplicationsResult, GetApplicationOptions,
  TmEntry, TmSearchOptions, TmSearchResult,
  HealthStatus, PrincipalRealm, Principal, MeResult,
  Model, ModelCost, Settings, PrepareResult,
  RegisterIdentityBody, ServiceIdentity, ServiceIdentitiesResult, ListIdentitiesOptions,
  DeliveryBundleMeta, DeliveryBundle, DeliveryAllLocalesMeta, DeliveryAllLocales,
  DeliveryReadResult, DeliveryLocaleStatus, DeliveryStatus,
  DeliveryGetAllOptions, DeliveryGetLocaleOptions, DeliveryGetKeyOptions,
  DeliveryGetBatchOptions, DeliveryStatusOptions, DeliverySetEnabledOptions,
  DeliveryRepublishOptions, DeliveryPurgeOptions, DeliveryPurgeLocaleOptions,
  DeliveryDeleteKeysOptions,
  PhraseStatus, PhraseStatusOptions, PhraseProvisionOptions, PhraseSetEnabledOptions,
  ProviderNature, ProviderEngine, ProviderLocale, TranslationProvider,
  ProvidersResult, CreateProviderOptions, UpdateProviderOptions,
  JobCaps, JobSpec, CapsLogger
} from '@godaddy/goat';

export interface GOATConfig {
  baseUrl: string;
  /** Hub application id. Accepts its natural numeric form or a string. */
  appId: string | number;
  /** Hub project id. Accepts its natural numeric form or a string. */
  projectId: string | number;
}

type RequestLike = { headers: unknown };

declare module '@gasket/core' {
  export interface GasketConfig {
    goat: GOATConfig;
  }

  export interface GasketActions {
    getGoat(req?: RequestLike): GoatClient;
  }
}
