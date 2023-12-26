<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

import type { DsfrFooterProps } from '@gouvminint/vue-dsfr'

const props = withDefaults(defineProps<DsfrFooterProps>(), {
  a11yCompliance: 'non conforme',
  a11yComplianceLink: '/a11y',
  legalLink: '/mentions-legales',
  homeLink: '/',
  // @ts-ignore this is really undefined
  partners: () => undefined,
  personalDataLink: '/donnees-personnelles',
  cookiesLink: '/cookies',
  logoText: () => ['République', 'Française'],
  descText: undefined,
  beforeMandatoryLinks: () => [],
  afterMandatoryLinks: () => [],
  mandatoryLinks: (props) => [
    {
      label: `Accessibilité : ${props.a11yCompliance}`,
      to: props.a11yComplianceLink,
    },
    {
      label: 'Mentions légales',
      to: props.legalLink,
    },
    {
      label: 'Données personnelles',
      to: props.personalDataLink,
    },
    {
      label: 'Gestion des cookies',
      to: props.cookiesLink,
    },
  ],
  ecosystemLinks: () => [
    {
      label: 'legifrance.gouv.fr',
      href: 'https://legifrance.gouv.fr',
    },
    {
      label: 'gouvernement.fr',
      href: 'https://gouvernement.fr',
    },
    {
      label: 'service-public.fr',
      href: 'https://service-public.fr',
    },
    {
      label: 'data.gouv.fr',
      href: 'https://data.gouv.fr',
    },
  ],
  operatorLinkText: 'Revenir à l’accueil',
  operatorTo: '/',
  operatorImgStyle: undefined,
  operatorImgSrc: undefined,
  operatorImgAlt: '',
  licenceText: 'Sauf mention contraire, tous les textes de ce site sont sous',
  licenceTo: 'https://github.com/etalab/licence-ouverte/blob/master/LO.md',
  // @ts-ignore this is really undefined
  licenceLinkProps: () => undefined,
  licenceName: 'licence etalab-2.0',
})

const allLinks = computed(() => {
  return [
    ...props.beforeMandatoryLinks,
    ...props.mandatoryLinks,
    ...props.afterMandatoryLinks,
  ]
})

const isExternalLink = computed(() => {
  const to = props.licenceTo || (props.licenceLinkProps as { to: RouteLocationRaw }).to
  return to && typeof to === 'string' && to.startsWith('http')
})
const routerLinkLicenceTo = computed(() => {
  return isExternalLink.value ? '' : props.licenceTo
})
const aLicenceHref = computed(() => {
  return isExternalLink.value ? props.licenceTo : ''
})

const showMin = ref(true)
const timeoutId = ref(0)
const makeFooterMin = () => {
  timeoutId.value = window.setTimeout(() => {
    showMin.value = true
  }, 1000)
}
const resetFooterMin = () => {
  clearTimeout(timeoutId.value)
}
</script>

<template>
  <footer
    id="footer"
    class="fr-footer"
    role="contentinfo"
    :class="{ 'fr-footer--min': showMin }"
    @mouseleave="makeFooterMin()"
    @mouseenter="resetFooterMin()"
  >
    <div
      v-if="showMin"
      class="fr-container  cursor-pointer"
      @click="showMin = !showMin"
    >
      <slot name="description">
        {{ descText }}
      </slot>
    </div>

    <div
      v-else
      class="fr-container"
    >
      <div class="fr-footer__body">
        <div class="fr-footer__bottom">
          <div class="fr-footer__brand fr-enlarge-link">
            <RouterLink
              :to="homeLink"
              title="Retour à l’accueil"
            >
              <p
                class="fr-logo"
                title="Ministère de l’Intérieur et des Outre-mer"
              />
            </RouterLink>
            <RouterLink
              v-if="operatorImgSrc"
              class="fr-footer__brand-link"
              :to="operatorTo"
              :title="operatorLinkText"
            >
              <img
                class="fr-footer__logo  fr-responsive-img"
                :style="[
                  typeof operatorImgStyle === 'string' ? operatorImgStyle : '',
                  {
                    'margin-left': '0.5px',
                    'padding': '1rem',
                    ...(typeof operatorImgStyle === 'object' ? operatorImgStyle : {}),
                    'max-width': '12.5rem'
                  }
                ]"
                :src="operatorImgSrc"
                :alt="operatorImgAlt"
              >
            </RouterLink>
          </div>
          <ul class="fr-footer__bottom-list  flex-end">
            <li
              v-for="(link, index) in allLinks"
              :key="index"
              class="fr-footer__bottom-item"
            >
              <a
                v-if="typeof link.to === 'string' && link.to.startsWith('http')"
                class="fr-footer__bottom-link"
                :href="link.to"
                :data-testid="link.to"
              >{{ link.label }}</a>
              <RouterLink
                v-else
                class="fr-footer__bottom-link"
                :to="link.to ?? '#'"
                :data-testid="link.to"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
          <div
            v-if="licenceText"
            class="fr-footer__bottom-copy"
          >
            <p>
              {{ licenceText }}
              <component
                :is="isExternalLink ? 'a' : 'RouterLink'"
                class="fr-link-licence  no-content-after"
                :to="isExternalLink ? null : routerLinkLicenceTo"
                :href="aLicenceHref"
                :target="isExternalLink ? '_blank' : undefined"
                rel="noopener noreferrer"
                v-bind="licenceLinkProps"
              >
                {{ licenceName }}
              </component>
            </p>
          </div>
        </div>
        <div class="fr-footer__content">
          <p
            class="fr-footer__content-desc"
          >
            <!-- @slot Slot #description pour le contenu de la description du footer. Sera dans `<p class="fr-footer__content-desc">` -->
            <slot name="description">
              {{ descText }}
            </slot>
          </p>
          <ul class="fr-footer__content-list">
            <li
              v-for="(link, index) in ecosystemLinks"
              :key="index"
              class="fr-footer__content-item"
            >
              <a
                class="fr-footer__content-link"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.fr-footer {
  color: var(--text-default-grey);
  padding-top: 0.75rem;
}

.fr-footer--min {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: auto;
  transform: translateX(-50%);
  background-color: var(--background-raised-grey);
  font-size: 0.75rem;
  padding-top: 0;
  box-shadow: inset 0 2px 0 0 var(--border-plain-blue-france), inset 0 -1px 0 0 var(--border-default-grey), inset 0 0 2px 0 var(--border-plain-blue-france);
}

.fr-footer__bottom {
  box-shadow: none;
  margin: 0;
}

.fr-footer__bottom-list {
  margin: 0;
  padding: 0;
}

.fr-footer__bottom-item:first-child,
.fr-footer__bottom-item {
  margin-top: 0;
}

.fr-footer__content {
  justify-content: flex-end;
}

.fr-footer__body {
  margin-bottom: 0.25rem;
}

.fr-footer__body + .fr-footer__bottom {
  margin-top: 0;
}

.fr-footer__brand .fr-logo {
  padding: 0;
  margin: 0;
}
.fr-footer__brand .fr-logo:after {
  background-size: 0;
  padding-top: 0;
}

.fr-footer__brand.fr-enlarge-link {
  padding: 0;
  margin: 0;
}

.fr-footer__content-list > li {
  margin: 0.25rem;
}

.fr-footer__content-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.fr-footer__content-desc {
  line-height: 1rem;
}

.no-content-after {
  --link-blank-content: '';
}
.ov-icon {
  margin-bottom: 0;
}
</style>
