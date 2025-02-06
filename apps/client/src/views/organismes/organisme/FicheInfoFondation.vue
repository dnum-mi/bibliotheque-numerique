<script lang="ts" setup>
import type { IOrganismeOutputDto, ISiafRnfOutput } from '@biblio-num/shared'
import FicheOrganismeInfo from './FicheOrganismeInfo.vue'

const props = defineProps<{ organismeRaf: IOrganismeOutputDto }>()
const typeOrganisme = computed(() => (props.organismeRaf?.rnfJson as ISiafRnfOutput)?.foundationType as 'FDD' | 'FE' | 'FRUP' | 'ARUP' | 'CULTE')
</script>

<template>
  <div class="flex flex-col gap-6 pb-4">
    <div class="flex gap-4">
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Type</label>
        <OrganismeBadge
          :type="typeOrganisme"
          class="mr-4"
          big
        />
      </div>

      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Numéro RNF</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.idRnf }}
        </span>
      </div>
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Nom de la fondation</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.title }}
        </span>
      </div>
    </div>
    <!-- TODO: Avons nous besoin ? -->
    <!-- <div class="flex gap-4">
      <div class="flex-grow">
      <label class="bn-fiche-sub-title--label uppercase">Sigle</label>
      <span class="bn-fiche-sub-title--text">
        {{ organismeRaf.sigle }}
      </span>
    </div>
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">SIRET</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.siret }}
        </span>
      </div>
    </div> -->
  </div>

  <FicheOrganismeInfo :organisme="organismeRaf" type="Rnf" />
</template>
