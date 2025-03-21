export type Metadata = {
  uuid: string;
  name: string;
  description: string;
  author?: string;
  /** -1 for unlimited */
  maxInstances?: number;
  version?: number | string;
  multiversion?: boolean | string;
  cinnamonVersion?: string[];
  hideConfiguration?: boolean;
  website?: string;
  role?: string;
  comments?: string;
  contributors?: string;
  url?: string;
  originalAuthors?: string[] | string;
  originalAuthor?: string;
  extensionID?: string;
  externalConfigurationApp?: string;
  preventDecorations?: boolean;
};

export type MetadataRuntime = {
  state?: number;
  path?: string;
  error?: string;
  force_loaded?: boolean;
};
