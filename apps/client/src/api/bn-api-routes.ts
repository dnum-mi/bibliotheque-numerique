export const authRoute = '/auth'
export const profileRoute = `${authRoute}/profile` // TODO: devrait s’appeler `/me` car ce n’est pas une sous-ressource de /auth
export const signInRoute = `${authRoute}/sign-in` // TODO: devrait s’appeler `/token` ou '/session' une route doit être un nom, pas un verbe

export const rolesRoute = '/roles'
export const assignRoleRoute = '/roles/assign' // TODO: ne devrait pas contenir de verbe (assign)
export const unassignRoleRoute = '/roles/unassign' // TODO: ne devrait pas contenir de verbe (unassign)
export const getRoleByIdRoute = (roleId: number) => `/roles/${roleId}`

export const demarchesRoute = '/demarches'
export const getDemarcheByIdRoute = (id: number) => `${demarchesRoute}/${id}`
export const getDemarcheConfigurationRoute = (id: number) => `${getDemarcheByIdRoute(id)}/configurations`
export const getUpdateOneMappingColumnRoute = (demarcheId: number, fieldId: string) => `${getDemarcheConfigurationRoute(demarcheId)}/${fieldId}`
export const getListDemarcheDossierRoute = (demarcheId: number) => `${getDemarcheByIdRoute}/search-dossiers`
export const getListDemarcheFieldRoute = (demarcheId: number) => `${getDemarcheByIdRoute}/search-fields`
export const getDossiersFromDemarcheByIdRoute = (id: number) => `${demarchesRoute}/${id}/deprecated/dossiers`

export const usersRoutes = '/users'
export const getUserByIdRoute = (id: number) => `${usersRoutes}/${id}`
export const createUserRoute = '/users/user' // TODO: devrait être simplement '/users'

export const dossierSearch = '/dossiers-search'
export const fieldsSearch = '/fields-search'

export const organismesRoute = '/organismes'
export const getOrganismeByIdRoute = (organismeId: number) => `/organismes/${organismeId}/detail`
export const getOrganismeByIdRnaRoute = (idRna: string) => `/organismes/rna/${idRna}`

export const customFiltersRoute = '/custom-filters'
export const getCustomFiltersRoute = () => customFiltersRoute
export const getOneCustomFiltersRoute = (id: number) => `/custom-filters/${id}`
