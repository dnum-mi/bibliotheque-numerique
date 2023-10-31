<script lang="ts" setup>
import { useRouter } from 'vue-router'

import type { IDossier, IOrganisme } from '@biblio-num/shared'

import OrganismeBadge from '@/components/Badges/OrganismeBadge.vue'

type DossierHeaderProps = {
  dossier: IDossier & { organisme?: IOrganisme }
}

defineProps<DossierHeaderProps>()

const router = useRouter()
const goToOrganisme = (id: number) => {
  router.push({
    name: 'FicheOrganisme',
    params: {
      id: String(id),
    },
  })
}
</script>

<template>
  <header
    v-if="dossier"
    class="flex  justify-between  gap-2"
  >
    <div>
      <h2
        v-if="dossier.organisme"
        class="m-0  p-0  text-lg  bn-fiche-title"
      >
        {{ dossier.organisme?.id }} -
        <span class="font-normal">{{ dossier.organisme?.title }}</span>
      </h2>
      <div
        v-if="dossier.organisme"
        class="flex  gap-2  text-sm"
      >
        <OrganismeBadge
          :type="dossier.organisme?.type"
        />
        <strong class="font-bold">N°DS - {{ dossier.dsDataJson.number }} </strong>
        <span>{{ dossier.demarche?.title }}</span>
      </div>
    </div>
    <div v-if="dossier.organisme">
      <DsfrButton
        type="button"
        label="Fiche organisme"
        secondary
        @click="goToOrganisme(dossier.organisme.id)"
      />
    </div>
  </header>
</template>
