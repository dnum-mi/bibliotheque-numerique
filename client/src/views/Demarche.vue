<script>
  import axios from 'axios'

  export default {
  data () {
    return {
      demarche: {},
      columns: [],
      idDemarche: 1,
    }
  },
  watch: {
    async idDemarche (newValue) {
      await this.getDemarche(newValue);
    }
  },
  methods: {
    async getDemarche(id) {
      const config = {
        method: 'get',
        url: `http://localhost:3000/demarche/${id}`,
        headers: { 
          'Content-Type': 'application/json'
          },
        };
        const response = await axios(config);
        this.demarche = response.data.demarche;
        this.columns = Object.keys(this.demarche);
    }
  },
  async mounted() {
    await this.getDemarche(this.idDemarche);
  }
}
</script>

<template>
  <div class="greetings">
    <h1 class="green"> Demarche</h1>

    <input v-model="idDemarche"/>
  </div>
  <br>
  <div>
    <table>
        <thead>
          <tr>
            <th v-for="key in columns">
              {{ key }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- <tr v-for="entry in demarche"> -->
            <tr>
            <td v-for="key in columns">
              {{demarche[key]}}
            </td>
          </tr>
        </tbody>
      </table>    
    
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}
h3 {
  font-size: 1.2rem;
}
.greetings h1,
.greetings h3 {
  text-align: center;
}
@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
table {
  border: 2px solid #42b983;
  border-radius: 3px;
  background-color: #fff;
  width: 100%;
}
th {
  background-color: #42b983;
  color: rgba(255, 255, 255, 0.66);
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
td {
  background-color: #f9f9f9;
}
th,
td {
  min-width: 120px;
  padding: 10px 20px;
}
th.active {
  color: #fff;
}
th.active .arrow {
  opacity: 1;
}
.arrow {
  display: inline-block;
  vertical-align: middle;
  width: 0;
  height: 0;
  margin-left: 5px;
  opacity: 0.66;
}
.arrow.asc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #fff;
}
.arrow.dsc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #fff;
}
</style>