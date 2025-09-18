import { IS_OPEN_SOURCE } from '@/config'
import { routeNames } from '@/router/route-names'
import { useUserStore } from '@/stores'
import { isSuperiorOrSimilar, Roles } from '@biblio-num/shared'
import type { RouteLocationNamedRaw } from 'vue-router'

type QuickLink = {
  label: string
  to: RouteLocationNamedRaw | string
  icon: string
  iconAttrs?: { title: string; [key: string]: string }
}

const demarcheQuickLink: QuickLink = {
  label: 'Démarches',
  to: { name: routeNames.DEMARCHES },
  icon: 'fr-icon-article-fill',
  iconAttrs: { title: 'Démarches' },
}

const unauthenticatedQuickLinks: QuickLink[] = [
  {
    label: 'Se connecter',
    to: { name: routeNames.SIGNIN },
    icon: 'fr-icon-lock-line',
    iconAttrs: { title: 'Se connecter' },
  },
  {
    label: 'S’enregistrer',
    to: { name: routeNames.SIGNUP },
    icon: 'fr-icon-user-line',
    iconAttrs: { title: 'S’enregistrer' },
  },
]

const organismesQuickLink: QuickLink = {
  label: 'Organismes',
  to: { name: routeNames.LISTE_ORGANISMES },
  icon: 'fr-icon-building-line',
  iconAttrs: { title: 'Organismes' },
}

const authenticatedQuickLinksDefault: QuickLink[] = [
  {
    label: 'Mon profil',
    to: { name: routeNames.PROFILE },
    icon: 'fr-icon-profil-line',
    iconAttrs: { title: 'Mon profil' },
  },
  {
    label: 'Déconnexion',
    to: { name: routeNames.LOGOUT },
    icon: 'fr-icon-logout-box-r-line',
    iconAttrs: { title: 'Déconnexion' },
  },
]

const statisticsQuickLink: QuickLink = {
  label: 'Statistiques',
  to: { name: routeNames.STATISTIQUES },
  icon: 'fr-icon-bar-chart-box-fill',
  iconAttrs: { title: 'Statistiques' },
}

const manageRolesQuickLink = {
  label: 'Administration',
  to: { name: routeNames.LIST_USERS },
  icon: 'fr-icon-user-setting-line',
  iconAttrs: { title: 'Administration' },
}

const configurationQuickLink = {
  label: 'Configuration',
  to: { name: routeNames.CONFIGURATION_DEMARCHES },
  icon: 'fr-icon-settings-5-line',
  iconAttrs: { title: 'Configuration' },
}

export function useNavigation () {
  const userStore = useUserStore()
  const route = useRoute()

  const homepageQuickLink = computed<QuickLink>(() => {
    const linkConfig = !IS_OPEN_SOURCE
      ? { label: 'Organismes', icon: 'fr-icon-building-line' }
      : { label: 'Démarches', icon: 'fr-icon-article-fill' }

    return {
      ...linkConfig,
      to: { name: routeNames.DEFAULT },
      iconAttrs: { title: linkConfig.label },
    }
  })

  const quickLinks = computed<QuickLink[]>(() => {
    if (!userStore.isAuthenticated) {
      const unauthenticatedLinks = unauthenticatedQuickLinks
      return unauthenticatedLinks.filter((link) => typeof link?.to === 'object' && link.to.name !== route.name)
    }

    const role = userStore.currentUser?.role?.label
    if (!role) {
      return authenticatedQuickLinksDefault
    }

    const secondaryLink = homepageQuickLink.value.label === organismesQuickLink.label ? demarcheQuickLink : organismesQuickLink

    const authenticatedLinks: QuickLink[] = [
      homepageQuickLink.value,
      ...(isSuperiorOrSimilar(Roles.instructor, role) ? [secondaryLink, statisticsQuickLink] : []),
      ...(isSuperiorOrSimilar(Roles.admin, role) ? [manageRolesQuickLink] : []),
      ...(isSuperiorOrSimilar(Roles.sudo, role) ? [configurationQuickLink] : []),
      ...authenticatedQuickLinksDefault,
    ]

    return authenticatedLinks
  })

  return { quickLinks }
}
