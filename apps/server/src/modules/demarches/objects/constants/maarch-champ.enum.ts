export const maarchChampsLabel = {
  courrier: 'courrier',
  prefecture: 'prefecture',
  intituleCourrier: 'intitule_courrier',
  nomAssociation: 'nom_association',
  adresse: 'adresse',
  codePostal: 'code_postal',
  ville: 'ville',
  telephone: 'tél',
  etatDossier: 'etat_dossier',
  emailAssociation: 'email_association',
  associationUnionFederation: 'n°5_association_union_fédération',
  numRna: 'n°2rna',
  numEt: '_n°3et',
  informationDeclarant: 'n°4informationdeclarant',
  numPublication: '_n°7publik',
  dateDeclaration: 'n°5datedeclaration',
  piecesJointes: 'pieces_jointes',
  annotation: 'annotations',
}

export const maarchPJLabel = {
  intitulePj: 'intitule_pj',
  nomPj: 'nom_pj',
  dateCreationPj: 'date_creation_pj',
}

export const maarchAnnotationLabel = {
  annotationText: 'annotation_text',
}

export const maarchEtatsArray = ['REJ', 'VAL', 'SSUITE'] as const
export type MaarchEtatType = typeof maarchEtatsArray[number]

export const MaarchEtatsValides: ReadonlySet<MaarchEtatType> = new Set(maarchEtatsArray)
