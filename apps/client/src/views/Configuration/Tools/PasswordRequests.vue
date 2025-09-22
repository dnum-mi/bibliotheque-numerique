<script setup lang="ts">
import { useUserStore } from '@/stores'
import { dateToStringFr } from '@/utils/date-to-string'
import { ePasswordRequestsDecision } from '@biblio-num/shared'
import type { IPasswordChangeRequestsOutput, PasswordRequestsDecisionKey } from '@biblio-num/shared'

type ManageRequest = {
  userId: number
  action: PasswordRequestsDecisionKey
}

const store = useUserStore()
const requests = ref<IPasswordChangeRequestsOutput[] | undefined>([])
const loading = ref<boolean>(false)
const isModalOpen = ref(false)
const textConfirm = ref<string>('')
const selectedUserId = ref<number | null>(null)
const selectedAction = ref<PasswordRequestsDecisionKey | null>(null)

const hasRequests = computed(() => requests.value!.length > 0)

const fetchUserPasswordRequests = async () => {
  loading.value = true
  try {
    requests.value = await store.listUserPasswordRequests()
  } finally {
    loading.value = false
  }
}

const handleManageRequest = async ({ userId, action }: ManageRequest) => {
  textConfirm.value = `Êtes-vous sûr de vouloir ${action === ePasswordRequestsDecision.APPROVE ? 'approuver' : 'refuser'} cette demande ?`
  selectedUserId.value = userId
  selectedAction.value = action
  isModalOpen.value = true
}

const onConfirmDecision = async (): Promise<void> => {
  if (selectedUserId.value && selectedAction.value) {
    try {
      await store.manageUserPasswordRequests(selectedUserId.value, selectedAction.value)
    } finally {
      requests.value = requests.value!.filter((request) => request.id !== selectedUserId.value)
    }
  }
  isModalOpen.value = false
  selectedUserId.value = null
  selectedAction.value = null
}

onMounted(() => {
  fetchUserPasswordRequests()
})
</script>

<template>
  <div
    class="fr-p-3v"
    :class="[{ 'blur-2': loading }]"
  >
    <DsfrTable
      class="w-full text-center"
      title="Liste des demandes de confirmation de mot de passe"
    >
      <thead>
        <tr>
          <th>Utilisateur</th>
          <th>Email</th>
          <th>Préfecture</th>
          <th>Date de la demande</th>
          <th>Approuver</th>
          <th>Refuser</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!hasRequests">
          <td
            colspan="6"
            class="empty"
          >
            Aucune demande en attente pour le moment.
          </td>
        </tr>
        <tr
          v-for="request in requests"
          v-else
          :key="request.id"
        >
          <td>{{ request.firstname }} {{ request.lastname }}</td>
          <td>{{ request.email }}</td>
          <td>{{ request.prefecture }}</td>
          <td>{{ dateToStringFr(request.passwordChangeRequestedAt) }}</td>
          <td>
            <DsfrButton
              label="Approuver"
              secondary
              @click="
                handleManageRequest({
                  userId: request.id,
                  action: ePasswordRequestsDecision.APPROVE,
                })
              "
            />
          </td>
          <td>
            <DsfrButton
              label="Refuser"
              secondary
              @click="
                handleManageRequest({
                  userId: request.id,
                  action: ePasswordRequestsDecision.REJECT,
                })
              "
            />
          </td>
        </tr>
      </tbody>
    </DsfrTable>
    <ModalConfirm
      :opened="isModalOpen"
      title="Confirmation"
      confirm-label="Valider"
      cancel-label="Annuler"
      @confirm="onConfirmDecision"
      @close="isModalOpen = false"
    >
      <p class="m-1">
        {{ textConfirm }}
      </p>
    </ModalConfirm>
  </div>
</template>

<style scoped>
.empty {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>
