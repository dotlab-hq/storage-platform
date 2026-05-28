export const bucketSettingsTabs = [
  'overview',
  'permissions',
  'cors',
  'versioning',
] as const

export type BucketSettingsTab = (typeof bucketSettingsTabs)[number]

export type BucketSettingsPayload = {
  bucket: {
    name: string
    region: string
    objectOwnershipMode: string
    blockPublicAccess: boolean
  }
  versioning: 'enabled' | 'suspended' | 'disabled'
  policyJson: string
  corsRules: Array<{
    allowedOrigins: string[]
    allowedMethods: string[]
    allowedHeaders: string[]
    exposeHeaders: string[]
    maxAgeSeconds: number | null
  }>
  acl: 'private' | 'public-read'
}

export type BucketSettingsUpdate =
  | {
      action: 'policy'
      bucketName: string
      policyJson: string
    }
  | {
      action: 'cors'
      bucketName: string
      rules: BucketSettingsPayload['corsRules']
    }
  | {
      action: 'versioning'
      bucketName: string
      state: BucketSettingsPayload['versioning']
    }
  | {
      action: 'acl'
      bucketName: string
      cannedAcl: BucketSettingsPayload['acl']
    }
  | {
      action: 'public-access'
      bucketName: string
      blockPublicAccess: boolean
    }
