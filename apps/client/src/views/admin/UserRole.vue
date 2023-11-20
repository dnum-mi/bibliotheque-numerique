<script lang="ts" setup>
import type { RolesKeys, UserWithEditableRole } from '@biblio-num/shared'
import { Roles } from '@/biblio-num/shared'
import { useUserStore } from '@/stores'
import { computed } from 'vue'
import DsfrWarningButton from '@/components/dsfr-extends/dsfr-warning-button.vue'

const userStore = useUserStore()
const selectedUser = computed<UserWithEditableRole | null>(() => userStore.selectedUser)

const role = computed<RolesKeys|''>(() => selectedUser.value?.originalUser.role.label || '')

const allRoleOptions = [
  {
    label: 'Super Administrateur',
    value: Roles.superadmin,
  },
  {
    label: 'Administrateur',
    value: Roles.admin,
  },
  {
    label: 'Instructeur',
    value: Roles.instructor,
  },
]

const roleOptions = computed<{label: string, value: RolesKeys}[]>(() => {
  return allRoleOptions.filter(roleOption => selectedUser.value?.possibleRoles.includes(roleOption.value))
})

const updateRole = async (event: string) => {
  await userStore.updateRole(event)
}

const onRemoveRole = async () => {
  await userStore.removeRole()
}
</script>

<template>
  <DsfrRadioButtonSet
    v-model="role"
    name="role"
    :options="roleOptions"
    @update:model-value="updateRole($event as string)"
  />

  <DsfrWarningButton
    :disabled="role === ''"
    icon="ri-close-line"
    label="Retirer son role"
    @click="onRemoveRole()"
  />
</template>

<style scoped>
</style>
