import { HintsManager, ScriptsManager, CssManager } from '..';

export interface Asset {
  path: string;
  tagName: string;
  innerHTML?: string;
  href?: string;
  type?: string;
  src?: string;
  [key: string]: any;
}

export interface AddAsset {
  (
    asset: Asset,
    /** If true insert the asset, otherwise append (default) */
    prepend?: boolean
  ): void;
}

export function isSimpleTag(
  /** any object (part of raw manifest) */
  item: {
    tagName?: string;
  }
): boolean;

export function getHash(str: string): string;

export function makeGetHashFunc(
  shouldMemoize: boolean
): (str: string) => string;

export function getHostName(val: string): string;

export interface JavascriptChunk {
  name: string;
  src: string;
}

export interface CSPAccumulator {
  default: Set<string>;
  fonts: Set<string>;
  images: Set<string>;
  scripts: Set<string>;
  styles: Set<string>;
}

export interface Merge {
  (manifest: Record<string, any>): Record<string, any>;
}

export interface CreateMethodConfig {
  dataPath: string;
  tagName: string;
  defaultProps?: Record<string, any>;
  requiredProps?: string[];
}

export function makeAssetFactory(
  config: CreateMethodConfig
): (props: Record<string, any>) => Asset;

export function withContent(
  /** Tag inner HTML */
  innerHTML: string,
  /** Properties for the tag */
  props?: Record<string, any>,
  /** add asset options */
  options?: {
    /** Insert element at the start */
    prepend?: boolean;
  }
): void;

export function withTag(
  /** Properties for the tag */
  props: Record<string, any>,
  /** add asset options */
  options?: {
    /** Insert element at the start */
    prepend?: boolean;
    deferjs?: boolean;
  }
): void;

export function createMethod(
  config: CreateMethodConfig,
  /**
   * if set the first argument to returned method is 'innerHTML' (inner HTML
   * that will be inserted into the tag)
   */
  isContentMethod?: boolean
): typeof withContent | typeof withTag;

export function makeAsset(props: Record<string, any>): Asset;

export function createTagMethod(
  config: CreateMethodConfig
): typeof withTag;

export function createContentMethod(
  config: CreateMethodConfig
): typeof withContent;

export function merge(
  /** existing raw manifest that we want to merge onto */
  manifest: Record<string, any>
): Record<string, any>;

export function addScript(
  props: {
    [key: string]: string | boolean;
  },
  options: {
    deferjs?: boolean;
    prepend?: boolean;
  }
): void;

export function renderSimpleTag(options: {
  tagName?: string;
  attrId?: string;
  /** (optional) the inner HTML that will be rendered inside the tag */
  innerHTML?: string;
}): string;

export function getRenderFunction(
  /** any part of the manifest that is being deep traversed */
  obj: {
    tagName?: string;
    [key: string]: any;
  }
): typeof renderSimpleTag | void;

export function renderData(
  /**
   * The raw manifest (or any part of the manifest - used in recursive way by
   * itself)
   */
  obj: Record<string, any>,
  /** Wanted format like 'raw', default is 'html' */
  format?: string
): /** an intermediate manifest (still needs a pass through mergeRenderedItems()) */
Record<string, any>;

export function mergeRenderedItems(
  /** the result of renderData, also used in recursive way by this function */
  obj: Record<string, any>
): /** the rendered manifest */
Record<string, any>;

export function renderManifest(
  manifest: Record<string, any>,
  format: string
): Record<string, any>;

export interface accumulateCSPScriptDirective {
  (obj: Record<string, any>, accumulator: CSPAccumulator): void;
}

export interface accumulateCSPLinkDirective {
  (obj: Record<string, any>, accumulator: CSPAccumulator): void;
}

export interface accumulateCSPDirective {
  (obj: Record<string, any>, accumulator: CSPAccumulator): void;
}

export interface createCSPData {
  (obj: Record<string, any>, accumulator: CSPAccumulator): Record<string, any>;
}

export interface addCSPDirectives {
  (manifest: Record<string, any>): Record<string, any>;
}

export interface addDeferredScript {
  (): typeof withTag;
}

export interface renderChunks {
  (): void;
}

export interface getAssets {
  (): Asset[];
}

export interface AssetManager extends CssManager, ScriptsManager, HintsManager {
  addCSPDirectives: addCSPDirectives;
  addHydrateScript: any;
  getAssets;
  merge: Merge;
  createTagMethod: typeof createTagMethod;
  createContentMethod: typeof createContentMethod;
  renderChunks: renderChunks;
  scriptMethods: ScriptsManager;
  cssMethods: CssManager;
  hintMethods: HintsManager;
}

export interface createAssetManager {
  (options?: { memoize?: boolean }): AssetManager;
}
