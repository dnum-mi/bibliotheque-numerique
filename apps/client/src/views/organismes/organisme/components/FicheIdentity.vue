<script setup lang="ts">
import { baseApiUrl } from '@/api/api-client'
import { getFileRoute } from '@/api/bn-api-routes'
import DownloadFile from '@/components/DownloadFile.vue'
import type { FileToDownload } from '@/components/DownloadFile.vue'
import { dateToStringFr, getPrefecture } from '@/utils'
import { eState, eTypeFile } from '@biblio-num/shared'
import type { IAssociationOutput, IFoundationOutput } from '@biblio-num/shared'

const props = defineProps<{
  organisme: IFoundationOutput | IAssociationOutput,
  isFoundation: boolean,
}>()

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
  const file = props.organisme?.files?.filter((file) => file.typeFile === eTypeFile.Statuts)[0]
  if (!file) {
    return null
  }
  return {
    ...file,
    url: `${baseApiUrl}${getFileRoute(file?.id)}`,
    filename: file.name,
    byteSizeBigInt: file.byteSize,
    state: eState.uploaded,
  }
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
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            SIRET du siège social
          </dt>
          <dd class="md:col-span-3 bn-fiche-sub-title--text">
            {{ organisme.siret || 'Non renseigné' }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            État
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ stateInActivityOrDissolved }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Publiée au JOAFE
          </dt>
          <!-- TODO: A compléter -->
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            Non renseigné
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Service instructeur du dossier
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ serviceInstructor }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Préfecture
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ organisme.department ? getPrefecture(organisme.department) : 'Non renseigné' }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Objet social
          </dt>
          <dd
            class="bn-fiche-sub-title--text md:col-span-3 max-h-50 overflow-auto whitespace-pre-wrap block"
          >
            {{ organisme.socialObject || 'Non renseigné' }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Date du terme
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ dateToStringFr(organisme?.dueDate) || 'Non renseigné' }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Dernier status déposé
          </dt>
          <dd class="flex flex-col md:col-span-3">
            <DownloadFile
              v-if="lastStatus"
              :file="lastStatus as FileToDownload"
            />
            <span class="bn-fiche-sub-title--text md:col-span-3">
              Déposé le {{ lastStatus?.uploadedAt ? dateToStringFr(lastStatus.uploadedAt) : 'Non renseigné' }}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
