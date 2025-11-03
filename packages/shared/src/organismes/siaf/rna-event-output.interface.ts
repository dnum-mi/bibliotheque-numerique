export interface IRnaEvent {
  assoc: string
  date_decla: string
  date_effet: string
  details: null | Array<{
    date_effet: string
    evenement: number
    id: number
    observation: string
    old_txt: string
    type: string
    type_decoded: string
  }>
  dgme: null | Array<{
    date_decla: string
    date_valide: string
    declarant: string
    dt_editrec: string
    dt_msgdgme: string
    flag_pos: string
    gestion: string
    id_dgme: number
    id_filedgme: string
    insee: string
    maj_time: string
    maj_user: string
    messageid: string
    messagexml: null
    metierxml: null
    mode_signature: string
    nbpjfile: number
    numeven: number
    numrna: string
    pjupload: number
    recipient: Array<string> | null
    sender: Array<string> | null
    teledemarche: string
    type_decla: string
  }>
  gestion: string
  id: number
  jo_avis: null | string
  jo_bordereau: null | string
  jo_date: string
  jo_datepubli: string | null
  jo_page: null | string
  jo_parution: null | string
  jo_statut: string
  libelle: string
  maj_time: string
  maj_user: string
  observation: string
  retour_publication: null
  type: string
  type_data: string
  type_data_decoded: string
  type_decoded: string
}
