<script lang="ts" setup>
import type { IDossier, IOrganisme } from '@biblio-num/shared'

import OrganismeBadge from '@/components/Badges/organisme/OrganismeBadge.vue'
import { routeNames } from '@/router/route-names'
import { EOrganismeIdType } from '@/stores'

type DossierHeaderProps = {
  dossier: IDossier & { organisme?: IOrganisme }
}

defineProps<DossierHeaderProps>()

const router = useRouter()
const goToOrganisme = (idRna: string | null, idRnf: string | null) => {
  const id = idRna || idRnf
  const idType = idRna ? EOrganismeIdType.Rna : EOrganismeIdType.Rnf
  router.push({
    name: routeNames.FICHE_ORGANISME,
    params: { id },
    query: { idType },
  })
}
</script>

<template>
  <header
    class="flex justify-between gap-2"
  >
    <div class="flex flex-col justify-center">
      <h2
        v-if="dossier.organisme"
        class="m-0 p-0 text-lg text-[var(--text-inverted-grey)]"
      >
        {{ dossier.organisme?.id }} -
        <span class="font-normal">{{ dossier.organisme?.title }}</span>
      </h2>
      <div
        class="flex gap-2 text-sm"
      >
        <OrganismeBadge
          :type="dossier.organisme?.type"
        />
        <strong class="font-bold">N°DS - {{ dossier.dsDataJson?.number }} </strong>
        <span>{{ dossier.demarche?.title }}</span>
      </div>
    </div>
    <div v-if="dossier.organisme">
      <DsfrButton
        type="button"
        label="Fiche organisme"
        secondary
        class="white-bg"
        @click="goToOrganisme(dossier.organisme.idRna, dossier.organisme.idRnf)"
      />
    </div>
  </header>
</template>

<style scoped>
.white-bg {
  background-color: white;
}
</style>
