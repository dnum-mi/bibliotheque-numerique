<script setup lang="ts">
import { dateToStringFr, getPrefecture } from '@/utils'
import { formatBytes, getFileDetail, getFileFormat } from '@/utils/file.utils'
import { eTypeFile } from '@biblio-num/shared'
import type { IAssociationOutput, IFoundationOutput } from '@biblio-num/shared'

const props = defineProps<{
  organisme: IFoundationOutput | IAssociationOutput,
  isFoundation: boolean,
}>()

const asFoundations = computed<IAssociationOutput | null>(() => {
  return props.isFoundation ? (props.organisme as IFoundationOutput) : null
})

// const state = computed(() => {
//   if (props.organisme.state) {
//     return `${props.organisme.state} depuis le ${dateToStringFr(props.organisme?.stateEffectiveAt)}`
//   }
//   return 'Non renseigné'
// })

// TODO: à confirmer de l'idée.
const stateInActivityOrDissolved = computed(() => {
  if (!props.organisme.state) { return 'Non renseigné' }
  if (props.organisme.state && props.organisme.state === 'Dissoute') {
    return 'Dissous'
  }

  return 'En activité'
})

// TODO: ajouter un endpoint au niveau de l'api pour recupérer le dernier status
const lastStatus = computed(() => {
  return props.organisme?.files?.filter((file) => file.typeFile === eTypeFile.Statuts)[0]
})

// TODO: à récuperérer depuis l'API le dernier evenement
const serviceInstructor = computed(() => {
  return props.organisme?.department ? getPrefecture(props.organisme?.department) : 'Non renseigné'
})
</script>

<template>
  <div>
    <div class="px-4 sm:px-0">
      <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
        Identité
      </h3>
    </div>
    <div class="mt-6 border-t border-gray-100">
      <dl class="divide-y p-0">
        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            SIRET du siège social
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ organisme.siret || 'Non renseigné' }}
          </dd>
        </div>

        <!--
      <div class="py-2 sm:grid sm:grid-cols-5">
        <dt class="text-sm/6 font-medium text-gray-900 ">
          État
        </dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
          {{ state }}
        </dd>
      </div>
      -->
        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900 ">
            État
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ stateInActivityOrDissolved }}
          </dd>
        </div>

        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900 ">
            Publiée au JOAFE
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            Non renseigné
          </dd>
        </div>

        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900 ">
            Service instructeur du dossier
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ serviceInstructor }}
          </dd>
        </div>

        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900 ">
            Préfecture
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ organisme.department ? getPrefecture(organisme.department) : 'Non renseigné' }}
          </dd>
        </div>

        <!-- <div v-if="!isFoundation" class="py-2 sm:grid sm:grid-cols-5">
        <dt class="text-sm/6 font-medium text-gray-900">
          Domaine d'activité
        </dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
          {{ asAssociation?.activityDomainDescription || 'Non renseigné' }}
        </dd>
      </div> -->

        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Objet social
          </dt>

          <textarea
            class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0"
            readonly
            :value="organisme.socialObject || 'Non renseigné'"
            rows="5"
          />
        </div>

        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Date du terme
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ dateToStringFr(organisme?.dueDate) || 'Non renseigné' }}
          </dd>
        </div>

        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Date de clôture de l'exercice comptable (jour/mois)
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ dateToStringFr(asFoundations?.fiscalEndAt) || 'Non renseigné' }}
          </dd>
        </div>

        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Dernier status:
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            <DsfrFileDownload
              v-if="lastStatus"
              :title="lastStatus.name"
              :format="getFileFormat(lastStatus.mimeType)"
              :size="formatBytes(lastStatus.byteSize)"
              :detail="getFileDetail(lastStatus)"
              href="#"
              :download="lastStatus.originalName"
              class="fr-mt-2v"
            />
          </dd>
        </div>

        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Dernier status déposé le
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ dateToStringFr(lastStatus?.uploadedAt) || 'Non renseigné' }}
          </dd>
        </div>

      <!--
      <div v-if="isFoundation" class="py-2 sm:grid sm:grid-cols-5">
        <dt class="text-sm/6 font-medium text-gray-900">
          A une activité internationale
        </dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
          {{ asFoundations?.hasInternationalActivity ? 'Oui' : 'Non' }}
        </dd>
      </div>
      <div class="py-2 sm:grid sm:grid-cols-5">
        <dt class="text-sm/6 font-medium text-gray-900">
          Date de clôture de l'exercice comptable (jour/mois)
        </dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
          {{ dateToStringFr(asAssociation?.fiscalEndAt) || 'Non renseigné' }}
        </dd>
      </div>
       -->
      </dl>
    </div>
  </div>
</template>
