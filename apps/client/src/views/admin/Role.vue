<script setup lang="ts">
import { computed, type ComputedRef, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'

import type { SmallDemarcheOutputDto } from '@biblio-num/shared/types/dto/demarche/small-demarche-output.dto'

import { useRoleStore } from '@/stores'
import type { IRole } from '@/shared/interfaces'
import router from '@/router'
import { Permissions } from '@/shared/types'

const roleStore = useRoleStore()

const props = defineProps<{
  id: number
}>()

const demarches: ComputedRef<SmallDemarcheOutputDto[]> = computed(() => roleStore.demarches)
const roleData = computed<IRole | undefined>(() => {
  return roleStore?.roles?.get?.(props.id)
})
const createRoleChecked: ComputedRef<boolean> = computed(() => !!roleData.value?.permissions.find(rd => rd.name === 'CREATE_ROLE'))
const accessDemarcheChecked: ComputedRef<boolean> = computed(() => !!roleData.value?.permissions.find(rd => rd.name === 'ACCESS_DEMARCHE'))
const whichDemarcheChecked: ComputedRef<Record<number, boolean>> = computed(() => {
  const result: Record<number, boolean> = {}
  if (demarches.value.length) {
    demarches.value.forEach(d => {
      result[d.id] = !!roleData.value?.permissions.find(p => p.name === 'ACCESS_DEMARCHE')?.options?.demarcheIds.find(e => e === d.id)
    })
  }
  return result
})

const deleteRole = async () => {
  await roleStore.deleteRole((roleData?.value?.id as number))
  router.push({ name: 'Admin' })
}

onMounted(async () => {
  try {
    await roleStore.fetchRoleById(Number(props.id))
    await roleStore.fetchDemarches()
  } catch (error) {
    import.meta.env.DEV && console.error(error)
  }
})

const commonChangeCheck = async (variable: ComputedRef<boolean>, key: string, options = {}) => {
  if (roleData.value) {
    if (variable.value) {
      await roleStore.updateRole(roleData.value.id, { permissions: roleData.value.permissions.filter(p => p.name !== key) })
    } else {
      await roleStore.updateRole(roleData.value.id, { permissions: roleData.value.permissions.concat([{ name: key, options }]) })
    }
  }
}
const changeCreateRole = useDebounceFn(async () => {
  return commonChangeCheck(createRoleChecked, 'CREATE_ROLE')
}, 1)
const changeAccessDemarche = useDebounceFn(async () => {
  return commonChangeCheck(accessDemarcheChecked, 'ACCESS_DEMARCHE', { demarcheIds: [] })
}, 1)
const changeOneDemarche = useDebounceFn(async (id: number) => {
  if (roleData.value) {
    if (accessDemarcheChecked.value) {
      await roleStore.updateRole(roleData.value.id, {
        permissions: roleData.value.permissions.map(p => {
          if (p.name === 'ACCESS_DEMARCHE') {
            // add one demarche
            if (whichDemarcheChecked.value?.[id]) {
              p.options.demarcheIds.push(id)
            } else { // take one demarche off
              p.options.demarcheIds = p.options.demarcheIds.filter(i => i !== id)
            }
          }
          return p
        }),
      })
    }
  }
}, 1)
</script>

<template>
  <div
    v-if="roleData"
    data-cy="role"
    class="flex flex-row justify-center mt-20 gap-40 "
  >
    <div class="w-1/3">
      <h2>
        Role
      </h2>
      <div class="fr-col-12 fr-grid-row">
        <label class="fr-text--bold flex-1">Nom du rôle: </label>
        <span class="fr-text flex-2"> {{ roleData.name }}</span>
      </div>
      <br>
      <div class="fr-col-12 fr-grid-row">
        <label class="fr-text--bold flex-1">Description: </label>
        <span class="fr-text flex-2"> {{ roleData.description }}</span>
      </div>
      <DsfrButton
        class="fr-mt-4w"
        type="button"
        label="Supprimer le rôle"
        secondary
        @click="deleteRole"
      />
    </div>
    <div
      data-cy="permissions-role-list"
      class="flex flex-col align-center gap-5 w-1/3"
    >
      <h2>
        Permissions
      </h2>
      <DsfrCheckbox
        v-model="createRoleChecked"
        :label="Permissions.CREATE_ROLE"
        @change="changeCreateRole()"
      />
      <DsfrCheckbox
        v-model="accessDemarcheChecked"
        :label="Permissions.ACCESS_DEMARCHE"
        @click="changeAccessDemarche()"
      />
      <div
        v-if="demarches.length && accessDemarcheChecked"
        class="flex flex-col ml-5"
      >
        <DsfrCheckbox
          v-for="demarche in demarches"
          :key="demarche.id"
          v-model="whichDemarcheChecked[demarche.id]"
          small
          :label="`(${demarche.dsId}) - ${demarche.title}`"
          @change="changeOneDemarche(demarche.id)"
        />
      </div>
    </div>
  </div>
</template>
