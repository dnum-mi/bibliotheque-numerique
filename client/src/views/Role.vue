<script setup lang="ts">

import { useRoleStore } from '@/stores'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { IRole } from '@/shared/interfaces'
import { PermissionName, Permissions } from '@/types/permission'
import PermissionCheckbox from '@/components/PermissionCheckbox.vue'
import router from '@/router'

const PermissionArray = ref(Object.keys(PermissionName).map((key: string) => ({
  id: key,
  name: PermissionName[key as keyof typeof PermissionName],
  active: false,
  options: {} as any,
  optionsTypes: Permissions[key].optionsTypes,
})))
const roleStore = useRoleStore()
const route = useRoute()
const dataCy = 'role'

const roleData = computed<IRole | undefined>(() => {
  const params = route?.params
  return roleStore.roles.get(Number(params?.id))
})

const changePermissionOption = (permissionName: string, optionName: string, value: any) => {
  const PermissionArrayElement = PermissionArray.value.find(p => p.name === permissionName)
  if (PermissionArrayElement) {
    PermissionArrayElement.options[optionName] = value
  }
}

const updatePermission = async () => {
  const activePermissions = PermissionArray.value?.filter(p => p.active)
  await roleStore.updateRole((roleData?.value?.id as number), {
    permissions: activePermissions.map(p => (
      {
        name: p.name,
        options: Object.keys(p.options || {}).length > 0 ? p.options : undefined,
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
  for (const permission of roleData?.value?.permissions || []) {
    const PermissionArrayElement = PermissionArray.value.find(p => p.name === permission.name)
    if (PermissionArrayElement) {
      PermissionArrayElement.active = true
      PermissionArrayElement.options = permission.options
    }
  }
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
      <ul>
        <li
          v-for="permission in PermissionArray"
          :key="permission.id"
        >
          <PermissionCheckbox
            :permission="permission"
            @change-permission-option="changePermissionOption"
          />
        </li>
      </ul>
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
  ul {
    list-style-type: none;
    li {
      margin-bottom: 1rem;
    }
  }
}
</style>
