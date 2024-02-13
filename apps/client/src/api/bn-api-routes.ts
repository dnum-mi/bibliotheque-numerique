export const authRoute = '/auth'
export const signInRoute = `${authRoute}/sign-in` // TODO: devrait s’appeler `/token` ou '/session' une route doit être un nom, pas un verbe

// export const rolesRoute = '/roles'
// export const assignRoleRoute = '/roles/assign' // TODO: ne devrait pas contenir de verbe (assign)
// export const unassignRoleRoute = '/roles/unassign' // TODO: ne devrait pas contenir de verbe (unassign)
export const getRoleByIdRoute = (roleId: number) => `/roles/${roleId}`

export const demarchesRoute = '/demarches'
export const smallDemarchesRoutes = `${demarchesRoute}/small`
export const getDemarcheByIdRoute = (id: number) => `${demarchesRoute}/${id}`
export const getDemarcheConfigurationRoute = (id: number) => `${getDemarcheByIdRoute(id)}/configurations`
export const getUpdateOneMappingColumnRoute = (demarcheId: number, fieldId: string) => `${getDemarcheConfigurationRoute(demarcheId)}/${fieldId}`
export const getListDemarcheDossierRoute = (demarcheId: number) => `${getDemarcheByIdRoute(demarcheId)}/dossiers-search`
export const getListDemarcheFieldRoute = (demarcheId: number) => `${getDemarcheByIdRoute(demarcheId)}/fields-search`
export const getXlsxDemarcheDossierRoute = (demarcheId: number) => `${getListDemarcheDossierRoute(demarcheId)}/export/xlsx`
export const getXlsxDemarcheFieldRoute = (demarcheId: number) => `${getListDemarcheFieldRoute(demarcheId)}/export/xlsx`
export const getDemarcheCustomFilterRoute = (demarcheId: number) => `${demarchesRoute}/${demarcheId}/custom-filters`

export const usersRoutes = '/users'
export const usersListRoute = `${usersRoutes}/list`
export const getUserByIdRoute = (id: number) => `${usersRoutes}/${id}`
export const profileRoute = `${usersRoutes}/me`
export const getUserRoleByIdRoute = (id: number) => `${getUserByIdRoute(id)}/role`
// export const updateRoleRoute = (id: number) => `${getUserByIdRoute(id)}/role`

export const dossierSearch = '/dossiers-search'
export const fieldsSearch = '/fields-search'

export const organismesRoute = '/organismes'
export const organismesListRoute = '/organismes/list'
export const organismesListXlsxRoute = '/organismes/list/export/xlsx'
export const getOrganismeDossiers = (organismeId: number) => `${organismesRoute}/${organismeId}/dossiers`
export const getOrganismeByIdRoute = (organismeId: number) => `${organismesRoute}/${organismeId}`
export const getOrganismeByRnaRoute = (organismeRna: string) => `${organismesRoute}/rna/${organismeRna}`
export const getOrganismeByRnfRoute = (organismeRnf: string) => `${organismesRoute}/rnf/${organismeRnf}`

export const customFiltersRoute = '/custom-filters'
export const getCustomFiltersRoute = () => customFiltersRoute
export const getOneCustomFiltersRoute = (id: number) => `/custom-filters/${id}`
export const getOneCustomFiltersStats = (id: number) => `${getOneCustomFiltersRoute(id)}/stats`

export const dossierRoute = '/dossiers'
export const getDossierByIdRoute = (id: number) => `${dossierRoute}/${id}`

export const healthRoute = '/health'

export const bnConfigurationsRoute = '/bn-configurations'
