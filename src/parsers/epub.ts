/**
 * EPUB Parser Implementation
 * Ported from Foliate.js to TypeScript
 */

import { 
  Book, 
  Section, 
  TOCItem, 
  Destination, 
  Metadata, 
  Rendition,
  Loader,
  EPUBSection,
  EPUBBook,
  CFI,
  CFIRange,
  EPUBMetadata,
  EPUBManifest,
  EPUBSpine,
  EPUBGuide,
  EPUBNavPoint,
  EPUBNavMap,
  EPUBPageTarget,
  EPUBPageList
} from './types'

// EPUB Namespaces
const NS = {
  CONTAINER: 'urn:oasis:names:tc:opendocument:xmlns:container',
  XHTML: 'http://www.w3.org/1999/xhtml',
  OPF: 'http://www.idpf.org/2007/opf',
  EPUB: 'http://www.idpf.org/2007/ops',
  DC: 'http://purl.org/dc/elements/1.1/',
  DCTERMS: 'http://purl.org/dc/terms/',
  ENC: 'http://www.w3.org/2001/04/xmlenc#',
  NCX: 'http://www.daisy.org/z3986/2005/ncx/',
  XLINK: 'http://www.w3.org/1999/xlink',
  SMIL: 'http://www.w3.org/ns/SMIL',
} as const

// MIME Types
const MIME = {
  XML: 'application/xml',
  NCX: 'application/x-dtbncx+xml',
  XHTML: 'application/xhtml+xml',
  HTML: 'text/html',
  CSS: 'text/css',
  SVG: 'image/svg+xml',
  JS: /\/(x-)?(javascript|ecmascript)/,
} as const

// Reserved prefixes for EPUB
const PREFIX = {
  a11y: 'http://www.idpf.org/epub/vocab/package/a11y/#',
  dcterms: 'http://purl.org/dc/terms/',
  marc: 'http://id.loc.gov/vocabulary/',
  media: 'http://www.idpf.org/epub/vocab/overlays/#',
  onix: 'http://www.editeur.org/ONIX/book/codelists/current.html#',
  rendition: 'http://www.idpf.org/vocab/rendition/#',
  schema: 'http://schema.org/',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  msv: 'http://www.idpf.org/epub/vocab/structure/magazine/#',
  prism: 'http://www.prismstandard.org/specifications/3.0/PRISM_CV_Spec_3.0.htm#',
} as const

// Relators mapping
const RELATORS = {
  art: 'artist',
  aut: 'author',
  clr: 'colorist',
  edt: 'editor',
  ill: 'illustrator',
  nrt: 'narrator',
  trl: 'translator',
  pbl: 'publisher',
} as const

export class EPUBParser {
  private container: Document
  private opf: Document
  private ncx?: Document
  private nav?: Document
  private loader: Loader
  private manifest: Map<string, EPUBManifest> = new Map()
  private spine: EPUBSpine[] = []
  private guide: EPUBGuide[] = []
  private metadata: EPUBMetadata = {}
  private rendition: Rendition = {}
  private toc: TOCItem[] = []
  private pageList: TOCItem[] = []
  private sections: EPUBSection[] = []
  private dir: 'ltr' | 'rtl' = 'ltr'

  constructor(loader: Loader) {
    this.loader = loader
  }

  /**
   * Parse EPUB from loader
   */
  async parse(): Promise<EPUBBook> {
    // Load container.xml
    const containerText = await this.loader.loadText('META-INF/container.xml')
    this.container = this.parseXML(containerText)

    // Get OPF path from container
    const rootfile = this.container.querySelector('rootfile')
    if (!rootfile) {
      throw new Error('No rootfile found in container.xml')
    }

    const opfPath = rootfile.getAttribute('full-path')
    if (!opfPath) {
      throw new Error('No full-path attribute in rootfile')
    }

    // Load OPF
    const opfText = await this.loader.loadText(opfPath)
    this.opf = this.parseXML(opfText)

    // Parse OPF content
    await this.parseOPF(opfPath)

    // Load NCX if present
    await this.loadNCX()

    // Load navigation document if present
    await this.loadNav()

    // Build sections
    this.buildSections()

    return {
      sections: this.sections,
      dir: this.dir,
      toc: this.toc,
      pageList: this.pageList,
      metadata: this.metadata,
      rendition: this.rendition,
      container: this.container,
      opf: this.opf,
      ncx: this.ncx,
      nav: this.nav,
      loader: this.loader,
      resolveHref: this.resolveHref.bind(this),
      resolveCFI: this.resolveCFI.bind(this),
      isExternal: this.isExternal.bind(this),
      splitTOCHref: this.splitTOCHref.bind(this),
      getTOCFragment: this.getTOCFragment.bind(this),
    }
  }

  /**
   * Parse OPF document
   */
  private async parseOPF(opfPath: string): Promise<void> {
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1)

    // Parse metadata
    this.parseMetadata()

    // Parse manifest
    this.parseManifest(opfDir)

    // Parse spine
    this.parseSpine()

    // Parse guide
    this.parseGuide()

    // Parse rendition
    this.parseRendition()
  }

  /**
   * Parse metadata from OPF
   */
  private parseMetadata(): void {
    const metadata = this.opf.querySelector('metadata')
    if (!metadata) return

    // Parse DC elements
    this.metadata.title = this.getDCElement(metadata, 'title')
    this.metadata.creator = this.getDCElement(metadata, 'creator')
    this.metadata.subject = this.getDCElement(metadata, 'subject')
    this.metadata.description = this.getDCElement(metadata, 'description')
    this.metadata.publisher = this.getDCElement(metadata, 'publisher')
    this.metadata.contributor = this.getDCElement(metadata, 'contributor')
    this.metadata.date = this.getDCElement(metadata, 'date')
    this.metadata.type = this.getDCElement(metadata, 'type')
    this.metadata.format = this.getDCElement(metadata, 'format')
    this.metadata.identifier = this.getDCElement(metadata, 'identifier')
    this.metadata.source = this.getDCElement(metadata, 'source')
    this.metadata.language = this.getDCElement(metadata, 'language')
    this.metadata.relation = this.getDCElement(metadata, 'relation')
    this.metadata.coverage = this.getDCElement(metadata, 'coverage')
    this.metadata.rights = this.getDCElement(metadata, 'rights')

    // Parse EPUB-specific metadata
    this.metadata.uniqueIdentifier = metadata.getAttribute('unique-identifier')
    this.metadata.releaseIdentifier = this.getMetaContent(metadata, 'release-identifier')
    this.metadata.modificationDate = this.getMetaContent(metadata, 'modification-date')

    // Parse meta elements
    this.metadata.meta = Array.from(metadata.querySelectorAll('meta')).map(meta => ({
      name: meta.getAttribute('name'),
      property: meta.getAttribute('property'),
      content: meta.getAttribute('content') || '',
      scheme: meta.getAttribute('scheme'),
    }))
  }

  /**
   * Parse manifest from OPF
   */
  private parseManifest(opfDir: string): void {
    const manifest = this.opf.querySelector('manifest')
    if (!manifest) return

    Array.from(manifest.querySelectorAll('item')).forEach(item => {
      const id = item.getAttribute('id')
      const href = item.getAttribute('href')
      const mediaType = item.getAttribute('media-type')
      const properties = item.getAttribute('properties')

      if (id && href && mediaType) {
        this.manifest.set(id, {
          id,
          href: this.resolvePath(opfDir, href),
          mediaType,
          properties: properties ? properties.split(' ') : undefined,
          fallback: item.getAttribute('fallback') || undefined,
          mediaOverlay: item.getAttribute('media-overlay') || undefined,
        })
      }
    })
  }

  /**
   * Parse spine from OPF
   */
  private parseSpine(): void {
    const spine = this.opf.querySelector('spine')
    if (!spine) return

    this.dir = (spine.getAttribute('page-progression-direction') as 'ltr' | 'rtl') || 'ltr'

    Array.from(spine.querySelectorAll('itemref')).forEach(itemref => {
      const idref = itemref.getAttribute('idref')
      const linear = itemref.getAttribute('linear')
      const properties = itemref.getAttribute('properties')

      if (idref) {
        this.spine.push({
          idref,
          linear: linear || 'yes',
          properties: properties ? properties.split(' ') : undefined,
        })
      }
    })
  }

  /**
   * Parse guide from OPF
   */
  private parseGuide(): void {
    const guide = this.opf.querySelector('guide')
    if (!guide) return

    Array.from(guide.querySelectorAll('reference')).forEach(ref => {
      const type = ref.getAttribute('type')
      const title = ref.getAttribute('title')
      const href = ref.getAttribute('href')

      if (type && href) {
        this.guide.push({
          type,
          title: title || undefined,
          href,
        })
      }
    })
  }

  /**
   * Parse rendition from OPF
   */
  private parseRendition(): void {
    const rendition = this.opf.querySelector('rendition')
    if (!rendition) return

    this.rendition.layout = rendition.getAttribute('layout') as 'reflowable' | 'pre-paginated' || 'reflowable'
    this.rendition.orientation = rendition.getAttribute('orientation') as 'auto' | 'landscape' | 'portrait' || 'auto'
    this.rendition.spread = rendition.getAttribute('spread') as 'auto' | 'none' | 'landscape' | 'portrait' || 'auto'
    this.rendition.viewport = rendition.getAttribute('viewport') || undefined
    this.rendition.media = rendition.getAttribute('media') || undefined
    this.rendition.flow = rendition.getAttribute('flow') || undefined
  }

  /**
   * Load NCX document if present
   */
  private async loadNCX(): Promise<void> {
    const ncxHref = this.manifest.get('ncx')?.href
    if (ncxHref) {
      try {
        const ncxText = await this.loader.loadText(ncxHref)
        this.ncx = this.parseXML(ncxText)
        this.parseNCXTOC()
      } catch (error) {
        console.warn('Failed to load NCX:', error)
      }
    }
  }

  /**
   * Load navigation document if present
   */
  private async loadNav(): Promise<void> {
    const navHref = this.manifest.get('nav')?.href
    if (navHref) {
      try {
        const navText = await this.loader.loadText(navHref)
        this.nav = this.parseXML(navText)
        this.parseNavTOC()
      } catch (error) {
        console.warn('Failed to load navigation document:', error)
      }
    }
  }

  /**
   * Parse NCX TOC
   */
  private parseNCXTOC(): void {
    if (!this.ncx) return

    const navMap = this.ncx.querySelector('navMap')
    if (!navMap) return

    this.toc = this.parseNavPoints(navMap)
  }

  /**
   * Parse navigation document TOC
   */
  private parseNavTOC(): void {
    if (!this.nav) return

    const nav = this.nav.querySelector('nav[epub\\:type="toc"]')
    if (!nav) return

    this.toc = this.parseNavList(nav)
  }

  /**
   * Build sections from spine
   */
  private buildSections(): void {
    this.sections = this.spine
      .filter(item => item.linear !== 'no')
      .map((item, index) => {
        const manifestItem = this.manifest.get(item.idref)
        if (!manifestItem) {
          throw new Error(`Manifest item not found: ${item.idref}`)
        }

        return {
          id: manifestItem.id,
          href: manifestItem.href,
          mediaType: manifestItem.mediaType,
          properties: manifestItem.properties,
          linear: item.linear || 'yes',
          cfi: `/6/${index}`,
          size: 0, // Will be set when loaded
          load: () => this.loadSection(manifestItem.href),
          unload: () => {},
          createDocument: () => this.createSectionDocument(manifestItem.href),
        }
      })
  }

  /**
   * Load section content
   */
  private async loadSection(href: string): Promise<string> {
    return await this.loader.loadText(href)
  }

  /**
   * Create section document
   */
  private async createSectionDocument(href: string): Promise<Document> {
    const content = await this.loader.loadText(href)
    return this.parseXML(content)
  }

  /**
   * Resolve href to destination
   */
  private async resolveHref(href: string): Promise<Destination> {
    // Implementation for href resolution
    // This is a simplified version - full implementation would handle relative paths, fragments, etc.
    const sectionIndex = this.sections.findIndex(section => section.href === href)
    if (sectionIndex === -1) {
      throw new Error(`Section not found: ${href}`)
    }

    return {
      index: sectionIndex,
      anchor: (doc: Document) => {
        // Find anchor in document
        const anchor = href.includes('#') ? href.split('#')[1] : null
        if (anchor) {
          return doc.getElementById(anchor) || doc.querySelector(`[id="${anchor}"]`)
        }
        return doc.body || doc.documentElement
      }
    }
  }

  /**
   * Resolve CFI to destination
   */
  private async resolveCFI(cfi: string): Promise<Destination> {
    // CFI resolution implementation
    // This is a simplified version - full implementation would parse CFI properly
    const cfiParts = cfi.replace(/^epubcfi\(/, '').replace(/\)$/, '').split('/')
    const sectionIndex = parseInt(cfiParts[1]) - 1

    if (sectionIndex < 0 || sectionIndex >= this.sections.length) {
      throw new Error(`Invalid CFI: ${cfi}`)
    }

    return {
      index: sectionIndex,
      anchor: (doc: Document) => {
        // CFI-based anchor resolution
        // This would need proper CFI parsing implementation
        return doc.body || doc.documentElement
      }
    }
  }

  /**
   * Check if href is external
   */
  private isExternal(href: string): boolean {
    return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')
  }

  /**
   * Split TOC href
   */
  private async splitTOCHref(href: string): Promise<[string, any]> {
    const [sectionHref, fragment] = href.split('#')
    const sectionIndex = this.sections.findIndex(section => section.href === sectionHref)
    return [this.sections[sectionIndex]?.id || '', fragment || null]
  }

  /**
   * Get TOC fragment
   */
  private getTOCFragment(doc: Document, id: string): Node | null {
    return doc.getElementById(id) || doc.querySelector(`[id="${id}"]`)
  }

  // Helper methods
  private parseXML(text: string): Document {
    const parser = new DOMParser()
    return parser.parseFromString(text, 'application/xml')
  }

  private getDCElement(metadata: Element, name: string): any {
    const elements = metadata.querySelectorAll(`[name()='${name}']`)
    if (elements.length === 0) return undefined
    if (elements.length === 1) return elements[0].textContent || ''
    return Array.from(elements).map(el => el.textContent || '')
  }

  private getMetaContent(metadata: Element, name: string): string | undefined {
    const meta = metadata.querySelector(`meta[name="${name}"]`)
    return meta?.getAttribute('content') || undefined
  }

  private resolvePath(base: string, href: string): string {
    if (href.startsWith('/')) return href.substring(1)
    return base + href
  }

  private parseNavPoints(navMap: Element): TOCItem[] {
    return Array.from(navMap.querySelectorAll('navPoint')).map(navPoint => ({
      label: navPoint.querySelector('navLabel text')?.textContent || '',
      href: navPoint.querySelector('content')?.getAttribute('src') || '',
      subitems: this.parseNavPoints(navPoint)
    }))
  }

  private parseNavList(nav: Element): TOCItem[] {
    return Array.from(nav.querySelectorAll('ol > li')).map(li => ({
      label: li.querySelector('a')?.textContent || '',
      href: li.querySelector('a')?.getAttribute('href') || '',
      subitems: this.parseNavList(li)
    }))
  }
}

/**
 * Create EPUB parser instance
 */
export async function createEPUBParser(loader: Loader): Promise<EPUBBook> {
  const parser = new EPUBParser(loader)
  return await parser.parse()
}
