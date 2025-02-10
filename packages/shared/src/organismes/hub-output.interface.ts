// TODO: fichier à supprimer aprés la mise à jours du hub

interface IAdresse {
  label: string,
  num_voie: string,
  type_voie: string,
  voie: string,
  cp: string,
  commune: string
}

interface IIdentiteCommun {
  nom: string,
  sigle: string,
  date_crea: string,
  date_modif_rna: string,
  date_dissolution: string,
  active: boolean,
  nature: string,
  siret: string
}
interface IIdentiteAssociation extends IIdentiteCommun{
  id_rna: string,
}
interface IIdentiteFondation extends IIdentiteCommun {
  id_rnf: string,
  type_fondation: "FDD" | "FE" | "FRUP"
}

interface ICoordonneesCommon {
  courriel: string,
  telephone: string,
  site_web: string
}

interface ICoordonneesAssociation extends ICoordonneesCommon {
  adresse_siege: IAdresse,
  adresse_gestion: IAdresse,
}

interface ICoordonneesFondation extends ICoordonneesCommon {
  adresse: IAdresse
}

export interface IPersonne {
  civilite: string,
  nom: string,
  prenom: string,
  profession: string,
  nationalite: string,
  date_naissance: string,
  lieu_naissance: string,
  role: string,
  fondateur: boolean,
  adresse: IAdresse
}
interface ISiafCommunOutput {
  activites: {
    objet: string,
    domaine: string
  },
  personnes: IPersonne[]
}
// RNA return more information, but we keep only what we need
export interface ISiafAssociationOutput extends ISiafCommunOutput {
  identite: IIdentiteAssociation,
  coordonnees: ICoordonneesAssociation,
}

export interface ISiafFondationOutput extends ISiafCommunOutput {
  identite: IIdentiteFondation
  coordonnees: ICoordonneesFondation,
}
