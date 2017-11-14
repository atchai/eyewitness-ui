<!--
	HEADER
-->

<template>

	<header>

		<nav>
			<div class="item">
				<router-link to="/messaging"><span>Conversations</span></router-link>
			</div>
			<div class="item">
				<router-link to="/articles"><span>Stories</span></router-link>
			</div>
			<div class="item">
				<router-link to="/breaking-news"><span>Breaking News</span></router-link>
			</div>
			<div class="item">
				<router-link to="/settings"><span>Settings</span></router-link>
			</div>
		</nav>

		<aside>
			<div class="item provider">
				<a href="/logout"><span>Logout</span></a>
			</div>
			<div class="item logo"></div>
		</aside>

	</header>

</template>

<script>
	/* eslint-disable node/no-unsupported-features */

	export default {
		data: function () {
			return {

			};
		},
	};

</script>

<style lang="scss">

	header {
		display: flex;
		height: 3.00rem;
		background: $panel-background-color;
		border-bottom: 2px solid $panel-border-color;

		.item {
			display: flex;
			flex: 1;
			text-align: center;
			border-right: 1px solid $panel-border-color;

			a {
				display: flex;
				flex: 1;
				text-decoration: none;
				color: #6F6F6F;
				text-transform: uppercase;
				letter-spacing: 1px;

				&.router-link-active {
					font-weight: bold;
				}

				>span {
					margin: auto;
				}
			}
		}

		>nav {
			display: flex;
			flex: 1;
		}

		>aside {
			display: flex;

			>.provider {
				flex: auto;
				width: 10.00rem;
			}

			>.logo {
				flex: auto;
				width: 3.00rem;
				background: purple;
				border-right: 0;
			}
		}
	}

</style>
