import { EOrganismeCategory } from '@biblio-num/shared'
import type { organismeCategoryKey } from '@biblio-num/shared'

export const authRoute = '/auth'
export const logoutRoute = `${authRoute}/logout`
export const verifyAuthRoute = `${authRoute}/verify-auth`
export const signInRoute = `${authRoute}/sign-in` // TODO: devrait s’appeler `/token` ou '/session' une route doit être un nom, pas un verbe
export const proConnectSignInRoute = `${authRoute}/proconnect`
export const proConnectCallbackRoute = `${authRoute}/proconnect/callback`
export const refreshTokensRoute = `${authRoute}/refresh`

// export const rolesRoute = '/roles'
// export const assignRoleRoute = '/roles/assign' // TODO: ne devrait pas contenir de verbe (assign)
// export const unassignRoleRoute = '/roles/unassign' // TODO: ne devrait pas contenir de verbe (unassign)
export const getRoleByIdRoute = (roleId: number) => `/roles/${roleId}`

export const demarchesRoute = '/demarches'
export const smallDemarchesRoutes = `${demarchesRoute}/small`
export const listSmallDemarchesRoutes = `${demarchesRoute}/small/list`
export const getDemarcheByIdRoute = (id: number) => `${demarchesRoute}/${id}`
export const getDemarcheConfigurationRoute = (id: number) => `${getDemarcheByIdRoute(id)}/configurations`
export const getDemarcheOptionRoute = (id: number) => `${getDemarcheByIdRoute(id)}/options`
export const getUpdateOneMappingColumnRoute = (demarcheId: number, fieldId: string) => `${getDemarcheConfigurationRoute(demarcheId)}/${fieldId}`
export const getListDemarcheDossierRoute = (demarcheId: number) => `${getDemarcheByIdRoute(demarcheId)}/dossiers-search`
export const getListDemarcheFieldRoute = (demarcheId: number) => `${getDemarcheByIdRoute(demarcheId)}/fields-search`

export const getXlsxDemarcheDossierRoute = (demarcheId: number) => `${getListDemarcheDossierRoute(demarcheId)}/export/xlsx`
export const getXlsxDemarcheFieldRoute = (demarcheId: number) => `${getListDemarcheFieldRoute(demarcheId)}/export/xlsx`
export const getDemarcheViewRoute = (demarcheId: number) => `${demarchesRoute}/${demarcheId}/views`
export const softDeleteDemarcheByIdRoute = (demarcheId: number) => `${getDemarcheByIdRoute(demarcheId)}/soft-delete`
export const getDemarcheAnonymizeRoute = (id: number) => `${getDemarcheOptionRoute(id)}/field/anonymized`

//#region 📍------ USER ------ 📍
export const usersRoutes = '/users'

//#region 📍------ ME ------ 📍
export const meRoutes = `${usersRoutes}/me`
export const usersPasswordRoute = `${meRoutes}/update-password`
export const resetPasswordRoute = `${meRoutes}/reset-password`
export const lastConsultedOrganismeRoute = `${meRoutes}/recent-organismes`
//#endregion

export const usersListRoute = `${usersRoutes}/list`
export const getUserByIdRoute = (id: number) => `${usersRoutes}/${id}`
export const getUserRoleByIdRoute = (id: number) => `${getUserByIdRoute(id)}/role`
export const updateRolesRoute = (id: number) => `${getUserRoleByIdRoute(id)}/many`
export const generateUpdatePasswordLinkRoute = (id: number) => `${usersRoutes}/${id}/update-password-link`
//#endregion

export const dossierSearch = '/dossiers-search'
export const fieldsSearch = '/fields-search'

export const dossierRoute = '/dossiers'
export const attachedFilesRoute = '/files/list'
export const getDossierFilesRoute = (dossierId: number) => `${dossierRoute}/${dossierId}${attachedFilesRoute}`
export const getDossierFilesSummaryRoute = (dossierId: number) => `${dossierRoute}/${dossierId}/files/summary`

export const getDossierFromOrganisme = (organismeId: string) => `${dossierRoute}/organismes/${organismeId}`
export const viewsRoute = '/views'
export const getViewsRoute = () => viewsRoute
export const getOneViewRoute = (id: number) => `/views/${id}`
export const getOneViewStats = (id: number) => `${getOneViewRoute(id)}/stats`

export const getDossierByIdRoute = (id: number) => `${dossierRoute}/${id}`
export const getDossierWithFieldsByIdRoute = (id: number) => `${dossierRoute}/${id}/fields`

export const healthRoute = '/health/info'

export const bnConfigurationsRoute = '/bn-configurations'

export const getFileRoute = (uuid: string) => `/files/${uuid}`
export const enableHubSearchRoute = `${bnConfigurationsRoute}/enable-hub-search`

//#region 📍------ HUB ------ 📍
export const hubRoute = `/hub`
export const hubSearchOrganisme = (sentence: string) => `${hubRoute}/search/${sentence}`
export const hubGetRna = (id: string) => `${hubRoute}/rna/${id}`
export const hubGetRnf = (id: string) => `${hubRoute}/rnf/${id}`
export const hubPathRouteByTypeOrganisme = (organismeType: organismeCategoryKey, id: string) =>
  `${hubRoute}/${organismeType === EOrganismeCategory.association ? 'association' : 'foundation'}/${id}`
//#endregion
