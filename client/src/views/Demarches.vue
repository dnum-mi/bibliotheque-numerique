<template>
  <div
    :data-fr-theme="dark ? 'dark' : ''"
    style="background-color: var(--grey-1000-50); color: var(--g800); padding: 1rem;"
  >
    <h1>Démarches</h1>
  </div>
  <DsfrTable
    :title="title"
    :headers="headers"
  >
    <DsfrTableRow
      v-for="(rowData) in rows"
      :row-data="rowData"
      :row-attrs="rowAttrs"
    >
      <DsfrButton
        :label="label"
        :disabled="disabled"
        :icon="icon"
        :icon-right="iconRight"
        @click="onClick"
      />
    </DsfrTableRow>
  </DsfrTable>
</template>

<script>
export default {
  data () {
    return {
      label: 'Voir',
      rows:
        [
          ['1', '11 octobre 2022 09:43', 'Déclaration des FE', 'DLPAJ', '1', '28 septembre 2022 16:23'],
          ['1', '11 octobre 2022 09:43', 'Déclaration des FE', 'DLPAJ', '1', '28 septembre 2022 16:23'],
          ['1', '11 octobre 2022 09:43', 'Déclaration des FE', 'DLPAJ', '1', '28 septembre 2022 16:23'],
        ],
      headers: ['Action', 'Id', 'Created At', 'Libelle', 'Service', 'Dossiers', 'Published At'],
    }
  },
  async mounted () {
    await this.getDemarches()
    console.log(this.rows)
  },
  methods: {
    async getDemarches () {
    },
    onClick() {
      this.$router.push({ name: 'DemarcheDossiers', params: { id: 1 } })
    }
  },
}
</script>

<style scoped>

</style>
