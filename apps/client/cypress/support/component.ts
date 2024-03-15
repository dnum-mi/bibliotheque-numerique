// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

import type { Pinia } from 'pinia'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from 'cypress/vue'

import VueDsfr from '@gouvminint/vue-dsfr'
import '@/main.css'
import 'virtual:uno.css'

import '@gouvfr/dsfr/dist/core/core.main.min.css'
import '@gouvfr/dsfr/dist/component/component.main.min.css'
import '@gouvfr/dsfr/dist/utility/utility.main.min.css'
import '@gouvminint/vue-dsfr/styles'

import '@gouvfr/dsfr/dist/scheme/scheme.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons.min.css'

import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-material.css'
import '@/ag-grid-dsfr.css'

import * as icons from '@/icons'

import router from '@/router'
import type { DefineComponent } from 'vue'

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare module 'cypress' {

  interface Chainable {
    mount: typeof mount
    mountWithPinia: typeof mountWithPinia
  }
}

Cypress.Commands.add('mount', (component, options = {}) => {
  options.global = options.global || {}

  options.global.stubs = options.global.stubs || {}
  options.global.stubs.transition = false

  if (!options.extensions) {
    options.global.plugins = options.global.plugins || []
    options.global.plugins.push({
      install: (app) => {
        app.use(VueDsfr, { icons: Object.values(icons) })
      },
    })
    options.global.plugins.push(router)
  }

  if (options.stores) {
    options.global.plugins.push(options.stores)
  }

  return mount(component, options)
})

let pinia: Pinia

// Run this code before each *test*.
beforeEach(() => {
  // New Pinia
  pinia = createPinia()

  // Set current Pinia instance
  setActivePinia(pinia)
})
// Example use:
// cy.mount(MyComponent)

function mountWithPinia (
  Comp: DefineComponent,
  options?: Parameters<typeof mount>[1],
): Cypress.Chainable {
  options ??= {}
  options.global = options.global || {}

  options.global.stubs = options.global.stubs || {}

  options.global.plugins = options.global.plugins || []
  options.global.plugins.push({
    install: (app) => {
      app.use(VueDsfr, { icons: Object.values(icons) })
    },
  }, pinia)
  options.global.plugins.push(router)

  return mount(Comp, options)
}

Cypress.Commands.add('mountWithPinia', mountWithPinia)
