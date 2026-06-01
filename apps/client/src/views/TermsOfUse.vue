<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { routeNames } from '@/router/route-names'
import { usersApiClient } from '@/api/api-client'
import { useUserStore } from '@/stores'
import useToaster from '@/composables/use-toaster'

const router = useRouter()
const toaster = useToaster()
const userStore = useUserStore()

const hasAccepted = ref(false)
const loading = ref(false)

const isAuthenticated = computed(() => userStore.isAuthenticated)
const isAlreadyAccepted = computed(() => userStore.currentUser?.termsAcceptedAt)

const handleValidation = async () => {
  if (!hasAccepted.value) {
    return
  }

  loading.value = true
  try {
    await usersApiClient.acceptTerms()

    router.push({ name: routeNames.DEFAULT })
  } catch {
    toaster.addErrorMessage({ description: 'Erreur lors de l\'acceptation de la charte' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fr-container">
    <div class="fr-my-7w fr-mb-md-10w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
      <div class="fr-py-0 fr-col-12 fr-col-md-6">
        <h1 class="fr-h1 fr-mb-2v">
          Charte de bonne utilisation
        </h1>

        <section class="fr-py-6v flex flex-col flex-grow relative">
          <h2 class="fr-h3">
            Préambule
          </h2>
          <p>
            La Bibliothèque Numérique met à disposition des utilisateurs les données du référentiel des organismes
            philanthropiques et des associations régies par la loi de 1901. Ces ressources sont destinés à la
            consultation, la recherche et le pilotage de la données.
          </p>
          <p>L'accès à ce système implique le respect des règles suivantes.</p>

          <h2 class="fr-h3">
            1. Utilisation responsable
          </h2>
          <p>
            L'utilisateur s'engage à utiliser la Bibliothèque Numérique uniquement dans le cadre de ses activités
            professionnelles, pédagogiques ou de recherche, dans le respect des lois et règlements en vigueur.
          </p>

          <h2 class="fr-h3">
            2. Respect des droits et des données
          </h2>
          <p>L'utilisateur s'interdit toute action portant atteinte :</p>
          <ul>
            <li>à la confidentialité ou à l'intégrité des données ;</li>
            <li>à la sécurité du système ou des autres utilisateurs.</li>
          </ul>

          <h2 class="fr-h3">
            3. Identifiants personnels
          </h2>
          <p>
            Les identifiants de connexion sont strictement personnels et ne doivent pas être partagés.
            Toute utilisation faite sous ces identifiants engage la responsabilité de leur titulaire.
          </p>

          <h2 class="fr-h3">
            4. Bon usage des ressources
          </h2>
          <p>L'utilisateur s'engage à ne pas détourner les outils ou données de leur finalité.</p>

          <h2 class="fr-h3">
            5. Sanctions
          </h2>
          <p>
            Tout manquement à la présente charte peut entraîner la suspension de l'accès au service et, le cas échéant,
            des sanctions disciplinaires ou légales.
          </p>

          <DsfrCallout
            content="En se connectant à la Bibliothèque Numérique, l'utilisateur reconnaît avoir pris connaissance de la présente
            charte et s'engage à la respecter."
          />
        </section>

        <div v-if="isAuthenticated && !isAlreadyAccepted" class="bn-sticky-bottom fr-p-6v fr-background-alt--blue-france rounded-t-lg">
          <div class="fr-mb-5v">
            <DsfrCheckbox
              id="accept-terms" v-model="hasAccepted" :value="hasAccepted" name="accept-terms"
              label="Je reconnais avoir lu et accepté la Charte de bonne utilisation du Système d'Information Bibliothèque Numérique."
              :disabled="loading"
            />
          </div>

          <div class="flex justify-center items-center">
            <DsfrButton
              :label="loading ? 'Confirmation en cours...' : 'Confirmer'"
              primary
              :disabled="!hasAccepted || loading"
              @click="handleValidation"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bn-sticky-bottom {
  z-index: 10;
  position: sticky;
  bottom: 0;
}
</style>
