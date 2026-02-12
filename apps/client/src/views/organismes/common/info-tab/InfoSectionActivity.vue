<script setup lang="ts">
import InfoRow from '@/views/organismes/components/InfoRow.vue'

export type tInfoActivity = {
  socialObject: string | null
  activityDomaiDescription?: string | null
  generalInterestDomain?: string | null
  hasInternationalActivity: boolean
}

defineProps<{
  activity: tInfoActivity
}>()
</script>

<template>
  <section>
    <h2 class="fr-h4">
      Activité
    </h2>
    <div class="fr-background-alt--grey fr-p-2w">
      <InfoRow label="Objet social">
        <TextWithReadMore :text="activity.socialObject" title="Objet social" />
      </InfoRow>
      <InfoRow v-if="activity.activityDomaiDescription" label="Domaine d'activité">
        {{ activity.activityDomaiDescription || "-" }}
      </InfoRow>
      <InfoRow v-if="activity.generalInterestDomain" label="Domaine d'intérêt général">
        {{ activity.generalInterestDomain || "-" }}
      </InfoRow>
      <InfoRow label="Activité à l'international">
        {{ activity.hasInternationalActivity ? 'Oui' : 'Non' }}
      </InfoRow>
    </div>
  </section>
</template>
