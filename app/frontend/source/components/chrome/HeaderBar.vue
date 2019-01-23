<!--
	HEADER
-->

<template>

	<header>

		<aside>
			<!-- <div class="item provider">
				<a href="/logout"><span>Logout</span></a>
			</div> -->
			<div class="item logo">
				<p>The Daily Planet</p>
			</div>
		</aside>

		<nav>
			<div class="item">
				<router-link to="/messaging"><span>Conversations</span></router-link>
			</div>
			<div class="item">
				<router-link to="/stories"><span>Stories</span></router-link>
			</div>
			<div class="item">
				<router-link to="/flows"><span>Flows</span></router-link>
			</div>
			<div class="item">
				<router-link to="/settings"><span>Settings</span></router-link>
			</div>
			<div class="item user-photo" :style="`background-image: url('${providerPhotoUrl}');`"></div>
		</nav>

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
		background: $panel-background-color-white;
		border-bottom: 1px solid $panel-border-color-grey;
		padding: 0 20px;
		@include user-select-off();

		.item {
			display: flex;
			text-align: center;
			margin: 0 14px;

			a {
				display: flex;
				text-decoration: none;
				color: $panel-grey-text;
				font-size: 14px;
				font-weight: 400;

				&.router-link-active {
					font-weight: bold;
					border-bottom: 2px solid $brand-main-color;
				}

				>span {
					margin: auto;
				}
			}
		}

		.user-photo {
			border-right: 0;
			background-size: contain;
			background-position: center;
			background-repeat: no-repeat;
			width: 38px;
		}

		>nav {
			display: flex;
			flex: 1;
			justify-content: flex-end;
		}

		>aside {
			display: flex;

			>.provider {
				flex: auto;
				width: 10.00rem;
			}

			>.logo {
				flex: auto;
				border-right: 0;
				background-size: cover;
				background-position: center;
				background-repeat: no-repeat;

				font-family: lato, arial;
				font-weight: 200;
				line-height: 46px;
				font-size: 22px;
				color: $brand-main-color;

				font-size: 18px;
				text-transform: uppercase;

				p {
					margin: 0;
				}
			}
		}
	}

</style>
