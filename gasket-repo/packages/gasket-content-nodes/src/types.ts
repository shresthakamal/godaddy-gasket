export type ComponentName = string
export type ComponentProps = { [prop: string]: any } | null
export type ContentNodeChildren = Array<ContentNode | string>
export type ContentNode = [ComponentName, ComponentProps, ContentNodeChildren?]
export type ContentNodes = ContentNode[]
