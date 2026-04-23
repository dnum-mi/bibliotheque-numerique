<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { routeNames } from '@/router/route-names'
import { usersApiClient } from '@/api/api-client'

const router = useRouter()

const hasAccepted = ref(false)
const loading = ref(false)

const handleValidation = async () => {
  if (!hasAccepted.value) {
    return
  }

  loading.value = true
  try {
    await usersApiClient.acceptTerms()

    router.push({ name: routeNames.DEFAULT })
  } catch (error) {
    console.error('Erreur lors de l\'acceptation de la charte:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center">
    <div class="bn-terms-card">
      <header class="flex items-center gap-x-8 fr-p-6v bn-border-bottom-grey">
        <DsfrLogo small logo-text="Ministère de l'intérieur" />
        <div class="">
          <h1 class="fr-h4 fr-m-0">
            Charte de bonne utilisation
          </h1>
          <p class="fr-mt-1v">
            Bibliothèque Numérique
          </p>
        </div>
      </header>

      <section class="fr-p-6v overflow-y-auto flex-grow">
        <div class="charter-content">
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
        </div>
      </section>

      <footer class="fr-p-6v fr-background-alt--blue-france rounded-t-lg">
        <div class="fr-mb-5v">
          <DsfrCheckbox
            id="accept-cgu" v-model="hasAccepted" value="true" name="checkbox-simple"
            label="Je reconnais avoir lu et accepté la Charte de bonne utilisation du Système d'Information Bibliothèque Numérique."
            :disabled="loading"
          />
        </div>

        <div class="flex justify-center">
          <DsfrButton
            :label="loading ? 'Validation en cours...' : 'Valider et accéder au service'" primary
            :disabled="!hasAccepted || loading" @click="handleValidation"
          />
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.bn-terms-card {
  max-width: 700px;
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
}

.bn-border-bottom-grey {
  border-bottom: 1px solid #eee;
}
</style>
