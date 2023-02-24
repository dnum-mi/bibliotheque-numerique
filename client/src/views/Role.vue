<script setup lang="ts">

import { useRoleStore } from '@/stores'
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { IRole } from '@/shared/interfaces'
import { PermissionName } from '@/types/permissions'
import { useField } from 'vee-validate'
import router from '@/router'

const PermissionNameArray = Object.values(PermissionName).map((p) => ({ label: p, id: p, name: p }))
const roleStore = useRoleStore()
const route = useRoute()
const dataCy = 'role'

const roleData = computed<IRole | undefined>(() => {
  const params = route?.params
  return roleStore.roles.get(Number(params?.id))
})

const { value: permissionValue } = useField('permission', {}, {
  initialValue: roleData?.value?.permissions.map((p) => p.name) || [],
})

const updatePermission = async () => {
  await roleStore.updateRole((roleData?.value?.id as number), {
    permissions: permissionValue.value?.map(p => (
      {
        name: p,
      }),
    ) || [],
  })
}

const deleteRole = async () => {
  await roleStore.deleteRole((roleData?.value?.id as number))
  router.push({ name: 'Admin' })
}

onMounted(async () => {
  const params = route?.params
  if (params && params.id) {
    try {
      await roleStore.fetchRoleById(Number(params.id))
    } catch (error) {
      console.error(error)
    }
  }
})

watch(() => roleStore.roles.get(Number(route?.params?.id)), () => {
  permissionValue.value = roleData?.value?.permissions.map((p) => p.name) || []
})
</script>

<template>
  <div class="fr-container" />
  <div
    v-if="roleData"
    :data-cy="dataCy"
    class="role-page"
  >
    <div class="role-info">
      <h2>
        Role
      </h2>
      <div class="fr-col-12 fr-grid-row">
        <label class="fr-text--bold">Id :</label>
        <span class="fr-text"> {{ roleData.id }}</span>
      </div>
      <div class="fr-col-12 fr-grid-row">
        <label class="fr-text--bold">Name :</label>
        <span class="fr-text"> {{ roleData.name }}</span>
      </div>
      <div class="fr-col-12 fr-grid-row">
        <label class="fr-text--bold">Description :</label>
        <span class="fr-text"> {{ roleData.description }}</span>
      </div>
      <div class="fr-col-12 fr-grid-row">
        <label class="fr-text--bold">Roles :</label>
        <span class="fr-text"> {{ roleData.permissions?.map((p) => p.name).join(', ') }}</span>
      </div>
      <DsfrButton
        class="fr-mt-4w"
        type="button"
        label="Supprimer le rôle"
        secondary="true"
        @click="deleteRole"
      />
    </div>
    <div
      class="permissions-list"
      data-cy="permissions-role-list"
    >
      <h2>
        Permissions
      </h2>
      <DsfrCheckboxSet
        v-model="permissionValue"
        :options="PermissionNameArray"
      />
      <DsfrButton
        label="Mettre à jour les permissions"
        type="button"
        @click="updatePermission"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.role-info {
  padding: 3rem 3rem;
}
.fr-text--bold {
  padding-right: 10px;
}
.role-page {
  display: flex;
  flex-direction: row;
}
.role-info {
  flex: 1;
}
.permissions-list {
  padding: 3rem 3rem;
  flex: 2;
}
</style>
