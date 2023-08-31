export const authRoute = '/auth'
export const profileRoute = `${authRoute}/profile` // TODO: devrait s’appeler `/me` car ce n’est pas une sous-ressource de /auth
export const signInRoute = `${authRoute}/sign-in` // TODO: devrait s’appeler `/token` ou '/session' une route doit être un nom, pas un verbe

export const demarchesRoute = '/demarches'
export const getDemarcheByIdRoute = (id: number) => `${demarchesRoute}/${id}`
export const getDossiersFromDemarcheByIdRoute = (id: number) => `${demarchesRoute}/${id}/deprecated/dossiers`

export const usersRoutes = '/users'
export const getUserByIdRoute = (id: number) => `${usersRoutes}/${id}`
export const createUserRoute = '/users/user' // TODO: devrait être simplement '/users'
