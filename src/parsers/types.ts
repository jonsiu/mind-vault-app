/**
 * Core interfaces for ebook parsers
 * Based on Foliate.js book interface specification
 */

export interface Book {
  sections: Section[]
  dir: 'ltr' | 'rtl'
  toc: TOCItem[]
  pageList: TOCItem[]
  metadata: Metadata
  rendition: Rendition
  resolveHref(href: string): Promise<Destination>
  resolveCFI(cfi: string): Promise<Destination>
  isExternal(href: string): boolean
  splitTOCHref(href: string): Promise<[string, any]>
  getTOCFragment(doc: Document, id: string): Node | null
}

export interface Section {
  load(): Promise<string>
  unload(): void
  createDocument(): Promise<Document>
  size: number
  linear: string
  cfi: string
  id: string
}

export interface TOCItem {
  label: string
  href: string
  subitems?: TOCItem[]
}

export interface Destination {
  index: number
  anchor(doc: Document): Element | Range | null
}

export interface Metadata {
  title?: string | LocalizedString
  creator?: string | LocalizedString | (string | LocalizedString)[]
  subject?: string | string[]
  description?: string | LocalizedString
  publisher?: string | LocalizedString
  contributor?: string | LocalizedString | (string | LocalizedString)[]
  date?: string | DateInfo
  type?: string
  format?: string
  identifier?: string | IdentifierInfo
  source?: string
  language?: string | string[]
  relation?: string
  coverage?: string
  rights?: string
  [key: string]: any
}

export interface LocalizedString {
  [language: string]: string
}

export interface DateInfo {
  value: string
  event?: string
}

export interface IdentifierInfo {
  value: string
  scheme?: string
}

export interface Rendition {
  layout?: 'reflowable' | 'pre-paginated'
  orientation?: 'auto' | 'landscape' | 'portrait'
  spread?: 'auto' | 'none' | 'landscape' | 'portrait'
  viewport?: string
  media?: string
  flow?: string
  [key: string]: any
}

export interface Loader {
  entries?: Array<{ filename: string }>
  loadText(filename: string): Promise<string>
  loadBlob(filename: string): Promise<Blob>
  getSize(filename: string): Promise<number>
}

export interface EPUBSection extends Section {
  href: string
  mediaType: string
  properties?: string[]
}

export interface EPUBBook extends Book {
  container: Document
  opf: Document
  ncx?: Document
  nav?: Document
  loader: Loader
}

export interface CFIPart {
  index: number
  id?: string
  offset?: number
  temporal?: number
  spatial?: number
  text?: string
  side?: 'before' | 'after'
}

export type CFI = CFIPart[][]

export interface CFIRange {
  parent: CFI
  start: CFI
  end: CFI
}

export interface EPUBMetadata {
  title?: string | LocalizedString
  creator?: string | LocalizedString | (string | LocalizedString)[]
  subject?: string | string[]
  description?: string | LocalizedString
  publisher?: string | LocalizedString
  contributor?: string | LocalizedString | (string | LocalizedString)[]
  date?: string | DateInfo
  type?: string
  format?: string
  identifier?: string | IdentifierInfo
  source?: string
  language?: string | string[]
  relation?: string
  coverage?: string
  rights?: string
  // EPUB-specific metadata
  uniqueIdentifier?: string
  releaseIdentifier?: string
  modificationDate?: string
  meta?: Array<{ name?: string; property?: string; content: string; scheme?: string }>
  [key: string]: any
}

export interface EPUBManifest {
  id: string
  href: string
  mediaType: string
  properties?: string[]
  fallback?: string
  mediaOverlay?: string
}

export interface EPUBSpine {
  idref: string
  linear?: string
  properties?: string[]
}

export interface EPUBGuide {
  type: string
  title?: string
  href: string
}

export interface EPUBNavPoint {
  id: string
  playOrder: number
  label: string
  content: string
  children?: EPUBNavPoint[]
}

export interface EPUBNavMap {
  id?: string
  label?: string
  children: EPUBNavPoint[]
}

export interface EPUBPageTarget {
  id: string
  value: string
  type: string
  playOrder: number
  label: string
  content: string
}

export interface EPUBPageList {
  id?: string
  label?: string
  children: EPUBPageTarget[]
}
