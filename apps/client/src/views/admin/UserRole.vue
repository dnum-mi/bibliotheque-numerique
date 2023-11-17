<script lang="ts" setup>
import type { RolesKeys, UserWithEditableRole } from '@biblio-num/shared'
import { Roles } from '@/biblio-num/shared'
import { useUserStore } from '@/stores'
import { computed } from 'vue'

const userStore = useUserStore()
const selectedUser = computed<UserWithEditableRole | null>(() => userStore.selectedUser)

const role = computed<RolesKeys|''>(() => selectedUser.value?.originalUser.role.label || '')

const allRoleOptions = [
  {
    label: 'Administrateur',
    value: Roles.admin,
  },
  {
    label: 'Instructeur',
    value: Roles.instructor,
  },
  {
    label: 'super administrateur',
    value: Roles.superadmin,
  },
]

const roleOptions = computed<{label: string, value: RolesKeys}[]>(() => {
  if (userStore.currentUser?.role.label === Roles.sudo) return allRoleOptions
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

  <DsfrButton
    :disabled="role === ''"
    label="Retirer son role"
    secondary
    @click="onRemoveRole()"
  />
</template>
