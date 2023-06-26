<template>
  <LayoutAccueil>
    <div class="fr-container">
      <div class="fr-my-7w fr-mb-md-10w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
        <div class="fr-py-0 fr-col-md-6">
          <h1>Accueil</h1>
          <p class="fr-text--sm fr-mb-3w">
            Bibliothèque Numérique
          </p>
          <p class="fr-text--lead fr-mb-3w">
            La page que vous cherchez est en construction.
          </p>
          <p class="fr-text--sm fr-mb-5w">
            Contactez-nous pour que l’on puisse vous rediriger vers la bonne information.
          </p>
          <ul class="fr-btns-group fr-btns-group--inline-md">
            <li>
              <a
                class="fr-btn"
                href="/sign_in"
              >
                Se connecter
              </a>
            </li>
            <li>
              <a
                class="fr-btn fr-btn--secondary"
                href="/sign_up"
              >
                S'enregistrer
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </LayoutAccueil>
</template>

<script lang="ts" setup>
import LayoutAccueil from '../components/LayoutAccueil.vue'
</script>
