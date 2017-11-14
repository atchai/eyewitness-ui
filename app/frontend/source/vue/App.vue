<!--
  FRONTEND ENTRY POINT
-->

<template>

  <div id="app" class="example"><span>Some info: </span>{{ msg }}</div>

</template>

<script>

	export default {
	  data: function () {
      return {
        msg: 'Hello, World!',
      };
    },
	}

</script>

<style lang="scss">

	.example {
	  color: green;
    border: 1;

    span {
      text-decoration: line-through;
    }
	}

</style>
