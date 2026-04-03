import {
  EOrganismeCategory,
  IAssociationOutput,
  IFoundationOutput,
  IPerson,
  organismeCategoryKey,
} from '@biblio-num/shared'
import * as PDFDocument from 'pdfkit'
import { IPdfGenerator } from '../interfaces/pdf-generator.interface'

const COLORS = {
  blueFrance: '#000091',
  redMarianne: '#E1000F',
  grey850: '#666666',
  grey925: '#E5E5E5',
  black: '#161616',
}

type IOrganisme = IFoundationOutput | IAssociationOutput
type ISectionGrid = {
  label: string,
  value: unknown
}

const getTypeOrganisme = (id: string): organismeCategoryKey | null => {
  if (!id) {
    return null
  }
  if (id[0] === 'W') {
    return EOrganismeCategory.association
  } else if (/\d{3}-\w{2,4}-\d{5}-\d{2}/.test(id)) {
    return EOrganismeCategory.fondation
  }
  return null
}

function normalizePdfText(text: unknown): string {
  if (!text) {
    return '-'
  }

  return String(text)
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export const OrganismeFicheGenerator: IPdfGenerator<IOrganisme> = async (doc, data: IOrganisme) => {
  const organismeType = getTypeOrganisme(data.id)
  drawHeader(doc, data, organismeType)

  drawSectionTitle(doc, 'IDENTITÉ')
  drawSectionGrid(doc, [
    {
      label: 'Type :',
      value: organismeType === EOrganismeCategory.fondation
        ? (data as IFoundationOutput).foundationType
        : 'ASSO',
    },
    { label: 'État :', value: data.state },
    {
      label: 'Date de la création',
      value: data.creationAt ? new Date(data.creationAt).toLocaleDateString('fr-FR') : '-',
    },
    { label: 'SIRET :', value: data.siret },
    { label: 'Préfecture :', value: data.events?.[0]?.dossierInstructeurGroup },
    { label: 'Adresse :', value: data.address.oneLine },
    { label: 'Courriel :', value: data.email },
    { label: 'Numéro de téléphone :', value: data.phone },
  ])

  ensureSpace(doc, 100)
  drawSectionTitle(doc, 'ACTIVITÉ')
  drawSectionGrid(doc, [
    { label: 'Objet social :', value: data.socialObject },
    { label: 'Domaine d\'intérêt général :', value: (data as IFoundationOutput).generalInterestDomain },
    { label: 'Activité à l\'international :', value: data.hasInternationalActivity ? 'Oui' : 'Non' },
  ])

  ensureSpace(doc, 80)
  drawSectionTitle(doc, 'VIE ÉCONOMIQUE')
  drawSectionGrid(doc, [
    { label: 'Dépôt des comptes :', value: data.accountDepositYears?.join(', ') },
    { label: 'Date de clôture de l\'exercice comptable :', value: formatDate(data.fiscalEndAt) },
    { label: 'Appel à la générosité publique :', value: data.publicGenerosityYears?.join(', ') },
    { label: 'Financements étrangers :', value: data.foreignFinancingYears?.join(', ') },
    { label: 'Subventions publiques :', value: data.publicSubsidyYears?.join(', ') },
  ])

  ensureSpace(doc, 100)
  drawSectionTitle(doc, 'DIRIGEANTS')
  drawGovernanceTable(doc, data.persons || [])
}

// --- Fonctions Helpers ---

function ensureSpace(doc: typeof PDFDocument, neededHeight: number): void {
  if (doc.y + neededHeight > doc.page.height - 50) {
    doc.addPage()
  }
}

function formatDate(dateStr: Date | string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function drawHeader(doc: typeof PDFDocument, data: IOrganisme, organismeType: organismeCategoryKey): void {
  doc.fillColor(COLORS.blueFrance)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(data.title.toUpperCase(), { align: 'left' })

  doc.fontSize(10)
    .fillColor(COLORS.grey850)
    .font('Helvetica')
    .text(`${organismeType === EOrganismeCategory.association ? 'Numéro RNA' : 'Numéro RNF'} : ${data.id}`)
    .text(`Date d'export : ${new Date().toLocaleDateString('fr-FR')}`)

  doc.moveDown()
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor(COLORS.blueFrance)
    .lineWidth(2)
    .stroke()

  doc.moveDown(1.5)
}

function drawSectionTitle(doc: typeof PDFDocument, title: string): void {
  const currentY = doc.y
  doc.rect(50, currentY, 495, 20)
    .fill(COLORS.grey925)

  doc.fillColor(COLORS.black)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(title, 60, currentY + 5)

  doc.moveDown(1.5)
}

function drawSectionGrid(doc: typeof PDFDocument, fieldsToDisplay: ISectionGrid[]): void {
  const startX = 60
  const labelWidth = 140
  const valueWidth = 350
  const lineHeight = 18

  doc.fontSize(10)

  fieldsToDisplay.forEach(field => {
    const textValue = normalizePdfText(field.value)
    const textHeight = doc.heightOfString(textValue, { width: valueWidth })
    const rowHeight = Math.max(lineHeight, textHeight)

    ensureSpace(doc, rowHeight)

    const topY = doc.y

    doc.fillColor(COLORS.grey850)
      .font('Helvetica-Bold')
      .text(field.label, startX, topY, {
        width: labelWidth,
      })

    doc.fillColor(COLORS.black)
      .font('Helvetica')
      .text(textValue, startX + labelWidth, topY, {
        width: valueWidth,
        align: 'justify',
      })
    doc.y = topY + rowHeight
    doc.moveDown(0.5)
  })
}

function drawGovernanceTable(doc: typeof PDFDocument, persons: IPerson[]): void {
  const tableWidth = 495
  const marginX = (595 - tableWidth) / 2
  const startY = doc.y

  if (!persons || persons.length === 0) {
    doc.font('Helvetica-Oblique')
      .fontSize(9)
      .fillColor(COLORS.grey850)
      .text('Aucun dirigeant pour cet organisme.', marginX, startY)

    doc.moveDown(2)
    return
  }

  const col = {
    statut: { x: marginX, w: 40 },
    nom: { x: marginX + 45, w: 115 },
    fonction: { x: marginX + 165, w: 90 },
    entree: { x: marginX + 260, w: 60 },
    sortie: { x: marginX + 325, w: 60 },
    representant: { x: marginX + 390, w: 105 },
  }

  doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.grey850)

  doc.text('STATUT', col.statut.x, startY, { width: col.statut.w })
  doc.text('NOM PRÉNOM', col.nom.x, startY, { width: col.nom.w })
  doc.text('FONCTION', col.fonction.x, startY, { width: col.fonction.w })
  doc.text('ENTRÉE', col.entree.x, startY, { width: col.entree.w })
  doc.text('SORTIE', col.sortie.x, startY, { width: col.sortie.w })
  doc.text('REPR.', col.representant.x, startY, { width: col.representant.w })

  doc.moveTo(marginX, startY + 12)
    .lineTo(marginX + tableWidth, startY + 12)
    .strokeColor(COLORS.grey925)
    .lineWidth(0.5)
    .stroke()

  let currentY = startY + 20
  doc.font('Helvetica').fillColor(COLORS.black).fontSize(8)

  persons.forEach(p => {
    const nameHeight = doc.heightOfString(`${p.lastName} ${p.firstName}`, { width: col.nom.w })
    const rowHeight = Math.max(nameHeight, 15)

    if (currentY + rowHeight > 750) {
      doc.addPage()
      currentY = 50
    }

    if (p.isFounder) {
      doc.fillColor(COLORS.blueFrance).font('Helvetica-Bold').text('Fondat.', col.statut.x, currentY)
    } else {
      doc.fillColor(COLORS.grey850).font('Helvetica').text('-', col.statut.x, currentY)
    }

    doc.fillColor(COLORS.black).font('Helvetica')

    doc.text(`${p.lastName.toUpperCase()} ${p.firstName}`, col.nom.x, currentY, { width: col.nom.w, ellipsis: true })
    doc.text(p.jobPosition || '-', col.fonction.x, currentY, { width: col.fonction.w, ellipsis: true })
    doc.text(formatDate(p.entryAt), col.entree.x, currentY, { width: col.entree.w })
    doc.text(formatDate(p.exitAt), col.sortie.x, currentY, { width: col.sortie.w })

    const repText = (!p.legalEntity || Object.keys(p.legalEntity).length === 0) ? 'Physique' : 'Morale'
    doc.text(repText, col.representant.x, currentY, { width: col.representant.w })

    currentY += rowHeight + 5
  })

  doc.y = currentY
}
