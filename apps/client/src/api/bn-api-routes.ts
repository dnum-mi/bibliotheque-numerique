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
export const getDemarcheByIdRoute = (id: number) => `${demarchesRoute}/${id}`
export const getDemarcheConfigurationRoute = (id: number) => `${getDemarcheByIdRoute(id)}/configurations`
export const getDemarcheOptionRoute = (id: number) => `${getDemarcheByIdRoute(id)}/options`
export const getUpdateOneMappingColumnRoute = (demarcheId: number, fieldId: string) => `${getDemarcheConfigurationRoute(demarcheId)}/${fieldId}`
export const getListDemarcheDossierRoute = (demarcheId: number) => `${getDemarcheByIdRoute(demarcheId)}/dossiers-search`
export const getListDemarcheFieldRoute = (demarcheId: number) => `${getDemarcheByIdRoute(demarcheId)}/fields-search`
export const getXlsxDemarcheDossierRoute = (demarcheId: number) => `${getListDemarcheDossierRoute(demarcheId)}/export/xlsx`
export const getXlsxDemarcheFieldRoute = (demarcheId: number) => `${getListDemarcheFieldRoute(demarcheId)}/export/xlsx`
export const getDemarcheCustomFilterRoute = (demarcheId: number) => `${demarchesRoute}/${demarcheId}/custom-filters`
export const softDeleteDemarcheByIdRoute = (demarcheId: number) => `${getDemarcheByIdRoute(demarcheId)}/soft-delete`
export const getDemarcheAnonymizeRoute = (id: number) => `${getDemarcheOptionRoute(id)}/field/anonymized`

export const usersRoutes = '/users'
export const usersPasswordRoute = `${usersRoutes}/me/update-password`
export const usersListRoute = `${usersRoutes}/list`
export const getUserByIdRoute = (id: number) => `${usersRoutes}/${id}`
export const profileRoute = `${usersRoutes}/me`
export const getUserRoleByIdRoute = (id: number) => `${getUserByIdRoute(id)}/role`
export const updateRolesRoute = (id: number) => `${getUserRoleByIdRoute(id)}/many`
// export const updateRoleRoute = (id: number) => `${getUserByIdRoute(id)}/role`

export const dossierSearch = '/dossiers-search'
export const fieldsSearch = '/fields-search'
export const dossierRoute = '/dossiers'
export const organismesRoute = '/organismes'
export const organismesListRoute = `${organismesRoute}/list`
export const organismesListXlsxRoute = `${organismesRoute}/list/export/xlsx`
export const getOrganismeDossiers = (organismeId: number) => `${organismesRoute}/${organismeId}/dossiers`
export const getOrganismeFilesSummaryRoute = (organismeId: number) => `${organismesRoute}/${organismeId}/files/summary`
export const attachedFilesRoute = '/files/list'
export const getOrganismeFilesRoute = (organismeId: number) => `${organismesRoute}/${organismeId}${attachedFilesRoute}`
export const getDossierFilesRoute = (dossierId: number) => `${dossierRoute}/${dossierId}${attachedFilesRoute}`
export const getDossierFilesSummaryRoute = (dossierId: number) => `${dossierRoute}/${dossierId}/files/summary`

export const getOrganismeByIdRoute = (organismeId: number) => `${organismesRoute}/${organismeId}`
export const getOrganismeByRnaRoute = (organismeRna: string) => `${organismesRoute}/rna/${organismeRna}`
export const getOrganismeByRnfRoute = (organismeRnf: string) => `${organismesRoute}/rnf/${organismeRnf}`
export const getOrganismeHistoryByRnfRoute = (organismeRnf: string) => `${organismesRoute}/rnf/${organismeRnf}/history`
export const getAssociationRoute = (organismeRna: string) => `${organismesRoute}/association/${organismeRna}`
export const getFoundationRoute = (organismeRnf: string) => `${organismesRoute}/fondation/${organismeRnf}`
export const searchOrganisme = (sentence: string) => `${organismesRoute}/search/${sentence}`
export const getAddOneRnfRoute = (id: string) => `${organismesRoute}/rnf/${id}`

export const customFiltersRoute = '/custom-filters'
export const getCustomFiltersRoute = () => customFiltersRoute
export const getOneCustomFiltersRoute = (id: number) => `/custom-filters/${id}`
export const getOneCustomFiltersStats = (id: number) => `${getOneCustomFiltersRoute(id)}/stats`

export const getDossierByIdRoute = (id: number) => `${dossierRoute}/${id}`

export const healthRoute = '/health/info'

export const bnConfigurationsRoute = '/bn-configurations'

export const getFileRoute = (uuid: string) => `/files/${uuid}`
export const enableHubSearchRoute = `${bnConfigurationsRoute}/enable-hub-search`
