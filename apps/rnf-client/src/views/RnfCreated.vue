<script lang="ts" setup>
import { useRnfStore } from '@/stores/rnf-store'

const rnfStore = useRnfStore()

const created = rnfStore.created

const title = computed(() => created
  ? `L’identifiant ${rnfStore.rnfId} a été créé, et ajouté en annotation privée.`
  : 'Retournez dans Démarches Simplifiées pour refuser le dossier')

const subtitle = computed( () => created
  ? 'Retournez dans Démarches Simplifiées pour accepter le dossier.'
  : `L’identifiant ${rnfStore.rnfId} a été ajouté en annotation privée.`)

  const dsUrl = ref('')

  onMounted(async () => {
    dsUrl.value = await rnfStore.getUrlDs()
  })
  const onClick = () => {
    location.href = `${dsUrl.value}/dossiers/${rnfStore.dossierId}`
  }
</script>

<template>
  <div class="h-[250px]">
    <div class="h-full">
      <div class="flex flex-col rnf-content items-center">
        <h4><span class="fr-icon-chat-check-line fr-text-default--success rnf-icon--8w"></span></h4>
        <div class="flex flex-col items-center" >
          <h2 class="fr-text--lg">
            {{ title }}
          </h2>
          <p>
            {{ subtitle }}
          </p>
          <DsfrButton
            label="Accéder au dossier"
            @click="onClick"
          />

        </div>
      </div>
    </div>
  </div>
</template>

<style scope>

.h-\[250px\] {
  height: 250px;
}

.rnf-icon--8w::before,
.rnf-icon--8w::after
{
  --icon-size: 4rem;
}
</style>
