<script lang="ts" setup>
import { dateToStringFr } from '@/utils'
import { organismeTypes, Prefecture, type ISiafAssociationOutput } from '@biblio-num/shared'

const props = defineProps<{ organismeRaf: ISiafAssociationOutput }>()

const createdAt = computed(() => dateToStringFr(props.organismeRaf.identite.date_crea as string))
const disovledAt = computed(() => dateToStringFr(props.organismeRaf.identite.date_dissolution as string))
const updatedAt = computed(() => dateToStringFr(props.organismeRaf.identite.date_modif_rna as string))
const addressFn = (address: ISiafAssociationOutput['coordonnees']['adresse_siege']) => {
  if (!address) {
    return null
  }
  type addressbuild = keyof ISiafAssociationOutput['coordonnees']['adresse_siege']
  const arrayAddressBuild1: addressbuild[] = ['num_voie', 'type_voie', 'voie']
  const addressStreetAddress = address
    ? arrayAddressBuild1
      .map((k) => address[k])
      .filter((address) => !!address)
      .join(' ')
    : null
  const arrayAddressBuild2: addressbuild[] = ['cp', 'commune']
  return address
    ? `${addressStreetAddress} ${arrayAddressBuild2
        .map((k) => address[k])
        .filter((address) => !!address)
        .join(' ')}`
    : null
}

const addressSiegeLabel = computed(() => props.organismeRaf.coordonnees.adresse_siege?.label || addressFn(props.organismeRaf.coordonnees.adresse_siege))
const addressGestionLabel = computed(() => props.organismeRaf.coordonnees.adresse_gestion?.label || addressFn(props.organismeRaf.coordonnees.adresse_gestion))
const prefectureFn = (address: ISiafAssociationOutput['coordonnees']['adresse_siege']) => {
  const prefkey = `D${address?.cp?.substring(0, 2) || ''}`
  return Prefecture[prefkey as keyof typeof Prefecture] || ''
}
const prefectureSiege = computed(() => prefectureFn(props.organismeRaf.coordonnees.adresse_siege))
const prefectureGestion = computed(() => prefectureFn(props.organismeRaf.coordonnees.adresse_gestion))
const typeOrganisme = computed(() => organismeTypes[5])
</script>

<template>
  <div class="flex flex-col gap-6">
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
        <label class="bn-fiche-sub-title--label uppercase">Numéro RNA</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.identite.id_rna }}
        </span>
      </div>
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Nom de l'association</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.identite.nom }}
        </span>
      </div>
    </div>
    <div class="flex gap-4">
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Sigle</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.identite.sigle }}
        </span>
      </div>
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">SIRET</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.identite.siret }}
        </span>
      </div>
    </div>
    <div class="flex gap-4">
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Objet</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.activites?.objet }}
        </span>
      </div>
    </div>
    <div class="flex gap-4">
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Domaine</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.activites?.domaine }}
        </span>
      </div>
    </div>
    <div class="flex gap-4">
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Crée le</label>
        <span class="bn-fiche-sub-title--text">
          {{ createdAt }}
        </span>
      </div>
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Modifié le</label>
        <span class="bn-fiche-sub-title--text">
          {{ updatedAt }}
        </span>
      </div>
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Dissoute le</label>
        <span class="bn-fiche-sub-title--text">
          {{ disovledAt }}
        </span>
      </div>
    </div>
    <div class="flex gap-4">
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Téléphone</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.coordonnees.telephone }}
        </span>
      </div>
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Courriel</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.coordonnees.courriel }}
        </span>
      </div>
      <div class="flex-grow">
        <label class="bn-fiche-sub-title--label uppercase">Site web</label>
        <span class="bn-fiche-sub-title--text">
          {{ organismeRaf.coordonnees.site_web }}
        </span>
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex-grow w-1/4">
        <label class="bn-fiche-sub-title--label uppercase">Préfecture du Siége</label>
        <span class="bn-fiche-sub-title--text">
          {{ prefectureSiege }}
        </span>
      </div>
      <div class="flex-grow w-3/4">
        <label class="bn-fiche-sub-title--label uppercase">Adresse du Siége</label>
        <span class="bn-fiche-sub-title--text">
          {{ addressSiegeLabel }}
        </span>
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex-grow w-1/4">
        <label class="bn-fiche-sub-title--label uppercase">Préfecture du gestion</label>
        <span class="bn-fiche-sub-title--text">
          {{ prefectureGestion }}
        </span>
      </div>
      <div class="flex-grow w-3/4">
        <label class="bn-fiche-sub-title--label uppercase">Adresse de gestion</label>
        <span class="bn-fiche-sub-title--text">
          {{ addressGestionLabel }}
        </span>
      </div>
    </div>

    <div class="p-t-6">
      <FicheInfoPersonnes
        v-if="organismeRaf?.personnes"
        :personnes="organismeRaf?.personnes"
      />
    </div>
  </div>
</template>
