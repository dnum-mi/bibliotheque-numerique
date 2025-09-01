<script lang="ts" setup>
import type { IOrganismeOutputDto } from '@biblio-num/shared'
import FicheOrganismeInfo from './FicheOrganismeInfo.vue'

defineProps<{ organismeRaf: IOrganismeOutputDto }>()
</script>

<template>
  <div class="flex flex-col gap-6 pb-4">
    <div class="flex gap-4">
      <span class="italic">Données anti-datées de juin 2023</span>
    </div>
    <div class="flex gap-4">
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Type</label>
        <OrganismeBadge
          :type="organismeRaf?.type"
          class="mr-4"
          big
        />
      </div>

      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Numéro RNA</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.idRna }}
        </span>
      </div>
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Nom de l'association</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.title }}
        </span>
      </div>
    </div>
    <div class="flex gap-4">
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Sigle</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf?.sigle || "" }}
        </span>
      </div>
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">SIRET</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf?.siret || "" }}
        </span>
      </div>
    </div>
  </div>

  <FicheOrganismeInfo :organisme="organismeRaf" type="Rna" />
</template>
