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
				<router-link to="/stories"><span>Stories</span></router-link>
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
			<div class="item logo" :style="`background-image: url('${providerPhotoUrl}');`"></div>
		</aside>

	</header>

</template>

<script>

	export default {
		data: function () {
			return {
				providerPhotoUrl: APP_CONFIG.providerPhotoUrl,
			};
		},
	};

</script>

<style lang="scss" scoped>

	header {
		display: flex;
		flex-shrink: 0;
		height: 3.00rem;
		background: $panel-background-color;
		border-bottom: 2px solid $panel-border-color;
		@include user-select-off();

		.item {
			display: flex;
			flex: 1;
			text-align: center;
			border-right: 1px solid $panel-border-color;

			a {
				display: flex;
				flex: 1;
				text-decoration: none;
				color: $panel-grey-text;
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
				border-right: 0;
				background-size: cover;
				background-position: center;
				background-repeat: no-repeat;
			}
		}
	}

</style>
